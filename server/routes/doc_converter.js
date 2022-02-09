const multer = require("multer");
const archiver = require('archiver');
const express = require('express');
const fs = require('fs');
var toPdf = require("office-to-pdf")
var replaceExt = require('replace-ext');
const log = require('log-to-file');
const path = require("path");
const merge = require('easy-pdf-merge');
var rimraf = require("rimraf");

const router = express.Router();

router.get("/doc-converter",async (req, res) => {
    if (req.isAuthenticated()) {
        res.render('webapps/doc_converter.ejs', { status: "none" })
    } else {
        res.render('webapps/doc_converter.ejs', { status: "block" })
    }
})
router.get("/pdf-merger",async (req, res) => {
    if (req.isAuthenticated()) {
        res.render('webapps/pdf_merger.ejs', { status: "none" })
    } else {
        res.render('webapps/pdf_merger.ejs', { status: "block" })
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
    }catch(err){
        log(err.stack, path.join(__dirname,'../error.log'))
    }
})



async function convert_to_pdf(inputpath) {
    try {        
        return new Promise(resolve => {
            toPdf(fs.readFileSync(inputpath)).then(
                (pdfBuffer) => {
                  fs.writeFileSync(replaceExt(inputpath,'.pdf'), pdfBuffer)
                  resolve(replaceExt(inputpath,'.pdf'));
                }, (err) => {
                    log(err.stack, path.join(__dirname,'../err.log'))
                    return false;
                }
            )
        });
    }catch(err){
        log(err.stack, path.join(__dirname,'../error.log'))
    }
}
router.get("/doc-converter/convert_to_pdf",async (req, res, next) => {
    try {
        var convertedFiles=[];

        var files=req.query.filesToBeConverted
        files = files.replace(/'/g, '"');
        files = JSON.parse(files);
        directory=path.join(__dirname,`../tmp/PDFfolder_${(req.ip).replace(/[.: ]/g, '')}`)

        if (!fs.existsSync(path.join(directory,"/output"))) {
            fs.mkdirSync(path.join(directory,"/output"), { recursive: true });
        }
        mergepdf_name="merged.pdf"

        if(req.query.mergepdfName){
            mergepdf_name=req.query.mergepdfName;
        }

        var output = fs.createWriteStream(path.join(directory,'/output/outputpdf.zip'));
        
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        if(req.query.ismerge=="true"){ 

            for(i=0;i<files.length;i++){
                fileName=files[i]
                filepath=path.join(directory,`/${fileName}`)
                result=await convert_to_pdf(filepath)
                if(!result){
                    console.log("error1")
                    rimraf(directory, function () { });
                    return res.sendStatus(503);
                }else{
                    convertedFiles.push(result);
                    if(fileName==files[files.length-1]){
                        sendMerged()
                    }
                }
            }
            
        }else{ 

            for(i=0;i<files.length;i++){
                fileName=files[i]
                filepath=path.join(directory,`/${fileName}`)
                result=await convert_to_pdf(filepath)
                if(!result){
                    rimraf(directory, function () { });
                    return res.sendStatus(503);
                }else{
                    file={
                        name:path.relative(directory,result).substring(14),
                        path:result
                    }
                    convertedFiles.push(result)
                    archive.append(fs.createReadStream(file.path), { name: file.name });
                    if(fileName==files[files.length-1]){
                        sendConverted()
                    }
                }
            }
        }

        async function sendMerged(){
            merge(convertedFiles, path.join(directory,`/output/${mergepdf_name}`), function (err) {
                if (err) {
                    console.log("error2")
                    console.log(err)
                    res.sendStatus(503)
                    log(err.stack, path.join(__dirname,'../err.log'))
                    rimraf(directory, function () { });
                }else{
                    archive.append(fs.createReadStream(path.join(directory,`/output/${mergepdf_name}`)),{ name: mergepdf_name });
                    archive.pipe(output);
                    archive.finalize().then(()=>{
                        setTimeout(()=>{
                            res.sendFile(path.join(directory,'/output/outputpdf.zip'))
                            rimraf(directory, function () { });
                        },300)
                    })
                }
                convertedFiles=[]
            });
        }

        async function sendConverted(){
            archive.pipe(output);
            archive.finalize().then(()=>{
                setTimeout(()=>{
                    res.sendFile(path.join(directory,'/output/outputpdf.zip'))
                    rimraf(directory, function () { });
                },300)
            })
        }
        
    }catch(err){
        console.log("error3")
        log(err.stack, path.join(__dirname,'../error.log'))
        rimraf(directory, function () { });
        return res.sendStatus(503);
    }
    
})


router.get("/doc-converter/mergepdf",async (req, res, next) => {
    try{
        var filesToBeMerge=[]

        var files=req.query.filesToBeMerged
        files = files.replace(/'/g, '"');
        files = JSON.parse(files);
        directory=path.join(__dirname,`../tmp/PDFfolder_${(req.ip).replace(/[.: ]/g, '')}`)
        
        if (!fs.existsSync(path.join(directory,"/output"))) {
            fs.mkdirSync(path.join(directory,"/output"), { recursive: true });
        }

        var output = fs.createWriteStream(path.join(directory,'/output/outputpdf.zip'));

        mergepdf_name="merged.pdf"

        if(req.query.mergepdfName){
            mergepdf_name=req.query.mergepdfName;
        }

        for(i=0;i<files.length;i++){
            fileName=files[i]
            filepath=path.join(directory,`/${fileName}`)
            filesToBeMerge.push(filepath)
        }
        
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        merge(filesToBeMerge, path.join(directory,`/output/${mergepdf_name}`), function (err) {
            if (err) {
                res.sendStatus(503)
                log(err, path.join(__dirname,'../err.log'))
                rimraf(directory, function () { });
            }else{
                archive.append(fs.createReadStream(path.join(directory,`/output/${mergepdf_name}`)),{ name: mergepdf_name });
                archive.pipe(output);
                archive.finalize().then(()=>{
                    setTimeout(()=>{
                        res.sendFile(path.join(directory,'/output/outputpdf.zip'))
                        rimraf(directory, function () { });
                    },300)
                })
            }
            convertedFiles=[]
        });


    }catch(err){
        log(err.stack, path.join(__dirname,'../error.log'))
    }
})


module.exports= router;