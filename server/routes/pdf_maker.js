const multer = require("multer");
const PDFDocument = require('pdfkit');
const express = require('express');
const fs = require('fs');
const log = require('log-to-file');
const router = express.Router();
const path = require("path")
// const HummusRecipe = require('hummus-recipe');

router.get("/doc_scanner", (req, res) => {
    res.redirect('/doc-scanner')
})

router.get("/doc-scanner", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("webapps/doc_scanner", { status: "none" })
    } else {
        res.render("webapps/doc_scanner", { status: "block" })
    }
})

const pdf_store = multer.diskStorage({
    destination: function(req, file, callback) {
        if (!fs.existsSync(path.join(__dirname,'../tmp/PDFfolder_'+(req.ip).replace(/[.: ]/g, '')))) {
            fs.mkdirSync(path.join(__dirname,'../tmp/PDFfolder_'+(req.ip).replace(/[.: ]/g, '')));
        }
        callback(null, path.join(__dirname,'../tmp/PDFfolder_'+(req.ip).replace(/[.: ]/g, '')));
    },
    filename: function(req, file, callback) {
        IMGname = file.originalname;
        callback(null, IMGname);
    }
});
const upld = multer({
    storage: pdf_store
})
router.post('/upload_PDF_IMG', upld.array('images', 1000), (req, res) => {
    try {
        if (!req.files) {
            console.log("No file received");
            res.send("No-files-received")

        } else {

            const directory = path.join(__dirname,'../tmp/PDFfolder_') + (req.ip).replace(/[.: ]/g, '');
            // const pdfDoc = new HummusRecipe('new', directory+'/NewDocument.pdf',{
            //     version: 1.6,
            //     author: 'DocScanner_Designed_and_developed_by_ankit',
            //     title: 'New Document',
            //     subject: 'A brand new PDF'
            // });
            // for(i=0;i<parseInt(req.body.total_images);i++){
            //     const file='image_'+i+'.jpeg'
            //     if (fs.existsSync(path.join(directory,file))) {
            //         pdfDoc.createPage('A4')
            //             .image(path.join(directory, file),297,421, {width: 575,height:822, keepAspectRatio: true,align:"center center"})
            //             .endPage();
            //         fs.unlink(path.join(directory, file), err => {
            //             if (err) throw err;
            //         });
            //     }else{
            //         console.log("DOES NOT EXISTS :"+file)
            //     }
            // }
            // pdfDoc.endPDF();  
            // res.sendFile(__dirname+'/tmp/PDFfolder'+(req.ip).replace(/[.: ]/g, '')+'/NewDocument.pdf')
            // fs.readdir(directory, (err, files) => {
            //     files.forEach((file)=>{
            //         fs.unlink(path.join(directory, file), err => {
            //             if (err) throw err;
            //         });
            //     })
            // })


            const doc = new PDFDocument({
                size: [595, 842],
                margins: { // by default, all are 72
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            })
            writeStream = fs.createWriteStream(directory + '/NewDocument.pdf')
            doc.pipe(writeStream);

            for (i = 0; i < parseInt(req.body.total_images); i++) {
                const file = 'image_' + i + '.jpeg'
                if (fs.existsSync(path.join(directory, file))) {
                    if (i == 0) {
                        doc.image(path.join(directory, file), 10, 10, { fit: [574.5, 822], align: 'center', valign: 'center' })

                    } else {
                        doc.addPage()
                            .image(path.join(directory, file), 10, 10, { fit: [574.5, 822], align: 'center', valign: 'center' })
                    }

                    fs.unlink(path.join(directory, file), err => {
                        if (err) throw err;
                    });
                } else {
                    console.log("DOES NOT EXISTS :" + file)
                }
            }
            doc.end();
            writeStream.on('finish', function() {
                sendFile();
            })

            function sendFile() {
                res.sendFile(path.join(directory,'/NewDocument.pdf'))
                fs.readdir(directory, (err, files) => {
                    if (err) log(err.stack, path.join(__dirname,'../error.log'));
                    files.forEach((file) => {
                        fs.unlink(path.join(directory, file), err => {
                            if (err) log(err.stack, path.join(__dirname,'../error.log'));
                        });
                    })

                    cleanTmpFolder()

                    function cleanTmpFolder() {
                        setTimeout(() => {
                            if (isEmpty(directory)) {
                                fs.rmdir(directory, (err) => { 
                                    if (err) log(err.stack, path.join(__dirname,'../error.log'));
                                });
                            } else {
                                console.log("directory not empty !!")
                                cleanTmpFolder()
                            }
                        }, 100)
                    }

                    function isEmpty(path) {
                        if (fs.readdirSync(path).length === 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                })
            }
        }
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

});

module.exports= router;