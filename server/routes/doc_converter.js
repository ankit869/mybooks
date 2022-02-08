const multer = require("multer");
const archiver = require('archiver');
const express = require('express');
const fs = require('fs');
var converter = require('office-converter')();
const log = require('log-to-file');
const router = express.Router();
const path = require("path");
const PDFMerger = require('pdf-merger-js');

router.get("/doc-converter",async (req, res) => {
    if (req.isAuthenticated()) {
        res.render('webapps/doc_converter.ejs', { status: "none" })
    } else {
        res.render('webapps/doc_converter.ejs', { status: "block" })
    }
})


const pdf_store = multer.diskStorage({
    destination: function(req, file, callback) {
        if (!fs.existsSync(path.join(__dirname,'../tmp/PDFfolder_') + (req.ip).replace(/[.: ]/g, ''))) {
            fs.mkdirSync(path.join(__dirname,'../tmp/PDFfolder_') + (req.ip).replace(/[.: ]/g, ''));
        }
        callback(null, path.join(__dirname,'../tmp/PDFfolder_') + (req.ip).replace(/[.: ]/g, ''));
    },
    filename: function(req, file, callback) {
        fname = file.originalname;
        callback(null, fname);
    }
});

const upld = multer({
    storage: pdf_store
})

router.post('/doc-converter/upload_doc_files', upld.any('doc_file'), (req, res) => {
    try {
        if (!req.files) {
            res.send("No-files-received")

        } else {
            res.send("file-uploaded-successfully")

        }
    }catch(error){
        log(error.stack, path.join(__dirname,'../error.log'))
    }
})


async function convert_to_pdf(inputpath) {
    try {
        converter.generatePdf(inputpath, function(err, result) { 
            if(err){
                log(err.stack, path.join(__dirname,'../error.log'))
                return false;
            }else{
                return result;
            }
        });
    }catch(error){
        log(error.stack, path.join(__dirname,'../error.log'))
    }
}
router.get("/doc-converter/convert_to_pdf",async (req, res) => {
    try {
        var files=req.query.filesToBeConverted

        files = files.replace(/'/g, '"');
        files = JSON.parse(files);
        directory=path.join(__dirname,`../tmp/PDFfolder_${(req.ip).replace(/[.: ]/g, '')}`)

        if (!fs.existsSync(directory+"/output")) {
            fs.mkdirSync(directory+"/output");
        }

        const output = fs.createWriteStream(path.join(directory,'/output/outputpdf.zip'));
        
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        if(req.query.ismerge=="true"){ 
            mergepdf_name="merged.pdf"

            if(req.query.mergepdfName){
                mergepdf_name=req.query.mergepdfName;
            }

            var merger = new PDFMerger();
            files.forEach(async(fileName)=>{
            
                filepath=path.join(directory,`/${fileName}`)
                result=await convert_to_pdf(filepath)
                if(!result){
                    closeFunction()
                }else{
                    merger.add(result);
                }
            })
            await merger.save(path.join(directory,`/output/${mergepdf_name}`))
            archive.append(fs.createReadStream(path.join(directory,`/output/${mergepdf_name}`)),{ name: mergepdf_name });
            
        }else{ 
            files.forEach(async(fileName)=>{
                filepath=path.join(directory,`/${fileName}`)
                result=await convert_to_pdf(filepath)
                if(!result){
                closeFunction()
                }else{
                    file={
                        name:fileName,
                        path:result
                    }
                    archive.append(fs.createReadStream(file.path), { name: file.name });
                }
            })
        }

        function closeFunction(){
        return res.sendStatus(503);
        }

        archive.pipe(output);
        archive.finalize().then(()=>{
            setTimeout(()=>{
                res.sendFile(path.join(directory,'/output/outputpdf.zip'))
            },300)
        })
    }catch(error){
        log(error.stack, path.join(__dirname,'../error.log'))
    }
    
})

module.exports= router;