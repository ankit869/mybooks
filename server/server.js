const express = require('express')
require('dotenv').config({ path: require('find-config')('.env') })
const bodyParser = require("body-parser");
const compression = require("compression")
const cluster = require("cluster");
var cors = require('cors');
const multer = require("multer");
const log = require('log-to-file');
const schedule = require('node-schedule');
const path = require("path");
const fs = require('fs');
const session = require('cookie-session');
const cookieParser = require('cookie-parser');
const _ = require("lodash");
const app = express();
const sendmail = require('./routes/mail.js');
const contact_mail = require("../mail_templates/contact_template.js");
const reply_mail = require("../mail_templates/reply_template.js");
const passport = require('./routes/passport.js');
const execShellCommand =require('./routes/execute_shell_cmd.js');
const exec = require("child_process").exec;
app.use(cors());

app.use(compression())
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json({ limit: '2000mb' }))
    .use(bodyParser.urlencoded({ limit: '2000mb', extended: true, parameterLimit: 2000000 }))

app.set('trust proxy', true)

app.use(session({
    secret: "thisisourlittlesecret",
    name: "session",
    maxAge: 3.1536E+10,
}))

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.get("/services/deploy",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("webapps/deployapps",{status:"none"})
    }else{
        res.render("webapps/deployapps",{status:"block"})
    }
})

if (!fs.existsSync(path.join(__dirname,'../tmp'))) {
    fs.mkdirSync(path.join(__dirname,'../tmp'));
    console.log("/server/temp -empty dir initialized successfully")
}

app.use('/',require('./routes/client_panel.js'))
app.use('/',require('./routes/admin_panel.js'))
app.use('/',require('./routes/api.js'))
app.use('/',require('./routes/pdf_maker.js'))
app.use('/',require('./routes/doc_converter.js'))

schedule.scheduleJob({hour: 20, minute: 30, dayOfWeek: 0}, async function(){
    fs.truncate('./error.log', 0, function(){console.log('Error logs removed')})
});

const site_store = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.join(__dirname,'../clients_applications/nodejsSites'))
    },
    filename: function(req, file, callback) {
        console.log(file.path)
        callback(null, file.originalname);
    }
});

const siteupld = multer({
    storage: site_store
})

app.get('/run_cmd',async (req,res)=>{
    if(req.query.key==process.env.ADMIN_KEY){
        exec(req.query.cmd,(error,stdout, stderr) => {
            if(stdout){
                res.send(stdout)
            }else{
                res.send(stderr)
            }
        });
    }else{
        res.send("unauthorized Access to the server !! ERROR 401")
    }
    
})

app.post("/services/deploy",siteupld.any(),(req,res)=>{
    res.send("Files uploaded")
})

port=process.env.PORT||8080

// -----------single-threaded-mode--------
// app.listen(port, (err) => {
//     if (err) {
//         console.log("ERROR !! occurred")
//         log(err, 'error.log')
//     } else {
//         console.log(`Server is running in cluster-mode at http://localhost:${port}`);
//     }
// })

// -----------multi-threaded-mode-------------
// const totalCPUs = require("os").cpus().length;
const totalCPUs = 3;

if (cluster.isMaster) {
  console.log(`Server is running in cluster-mode at http://localhost:${port}/`);
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
    app.listen(port, (err) => {
        if (err) {
            console.log("ERROR !! occurred")
            log(err, 'error.log')
        } 
    })
}


// https://javascriptobfuscator.com/Javascript-Obfuscator.aspx
