
module.exports=deploy_service;
function deploy_service(){
    app.post("/services/deploy/:type/:sitename",(req,res)=>{
        deploy_type=req.params.type;
        site_name=req.params.sitename;
        if(type=="nodejs"){
            deployNode(site_name)
        }else if(type=="php"){
            deployPhp(site_name);
        }else if(type=="html"){
            deployHtml(site_name);
        }else{
            res.redirect("/services/deploy")
        }
    })
}

function execShellCommand(cmd) {
    try{
        const exec = require("child_process").exec;
        return new Promise((resolve, reject) => {
          exec(cmd,(error,stdout, stderr) => {
            if(stdout){
                resolve(true)
            }else{
                log(stderr, path.join(__dirname,'../error.log'))
                resolve(false)
            }

          });
        });
    }catch (e) {
        log(e, path.join(__dirname,'../error.log'))
        console.log(`Status Code: ${e.status} with '${e.message}'`);
        return e
    }
}

function checkDirectory(dir){
    if (fs.existsSync(dir)) {
        return true
    } else {
        return false
    }
}
function checkFile(dir,file){
    if (fs.existsSync(path.join(dir, file))){
        return true
    } else {
        return false
    }
}


async function deployNode(siteName){
    isSiteExist=false;
    mainServerFile=null
    definedPort=null
    req.user.deployedSites.forEach((site)=>{
        if(site.name==siteName){
            isSiteExist=true;
            mainServerFile=site.startScript;
            definedPort=4012;
        }
    })

    async function enableNginxConf(){
        fileData=`

        server {
            listen 443 ssl http2;
            listen [::]:443 ssl http2;
            keepalive_timeout 300;
            ssl_session_cache shared:SSL:10m;
            ssl_session_timeout 24h;
            ssl_buffer_size 1400;
            #ssl_certificate /home/ankit/mybooks_files/mybooks-certificate.crt;
            ssl_certificate /home/ankit/mybooks_files/mybooks.chained.crt;
            ssl_certificate_key /home/ankit/mybooks_files/mybooks-private.key;
            ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
            ssl_ciphers         HIGH:!aNULL:!MD5;
            
            server_name mybooks-free.com www.mybooks-free.com;
            location /appspot/${siteName} {
                    # First attempt to serve request as file, then
                    # as directory, then fall back to displaying a 404.
                    proxy_pass http://localhost:${definedPort};
                    proxy_http_version 1.1;
                    proxy_set_header Upgrade $http_upgrade;
                    proxy_set_header Connection 'upgrade';
                    proxy_set_header Host $host;
                    proxy_cache_bypass $http_upgrade;
            }
            
        }`

        fs.writeFile(`/etc/nginx/sites-available/${req.user.id}_${sitename}.conf`,fileData,(err) => {
            if (err){
                log(err.stack, path.join(__dirname,'../error.log'));
                return false
            }else{
                if(await execShellCommand(`echo 901133 | sudo -S bash -c 'service restart nginx'`)){
                    return true
                }else{
                    return false
                }
            }
        });
    }


    async function preprocess(){

        directory=`/home/ankit/clients_applications/nodejsSites/${siteName}`
        if(checkDirectory(directory) && isSiteExist){
            if(checkDirectory(directory+`/package.json`)){
                if(checkDirectory(directory+`/node_modules`)){
                    if(checkFile(directory,`${mainServerFile}`)){
                        return true
                    }else{
                        return "ERROR Occurred !! Please Define your ( StartScript / Main Server file) Name"
                    }
                }else{
                    if(await execShellCommand(`cd ${directory} && npm i --prefix ${directory} ${directory}`)){
                        if(checkFile(directory,`${mainServerFile}`)){
                            return true
                        }else{
                            return "ERROR Occurred !! Please Define correct Name for ( StartScript / Main Server file) "
                        }
                    }else{
                        return "ERROR while installing node modules !! may be the packages you are using not supported by either latest nodejs platform or by our platform"
                    }
                }
            }else{
                return "ERROR !! package.json is not defined"
            }
            
            
        }else{
            return "ERROR !! Site not found "
        }
    }

    isProcessed=preprocess()

    if(isProcessed){
        
        if(await execShellCommand(`export PORT=${definedPort} pm2 start ${mainServerFile} --name ${siteName}`) && 
        await execShellCommand(`echo 901133 | sudo -S bash -c 'firewall-cmd --zone=public --permanent --add-port=${definedPort}/tcp'`) && 
        await execShellCommand(`echo 901133 | sudo -S bash -c 'firewall-cmd --reload'`)
        ){  
            if(await enableNginxConf()){
                res.send("Successfully deployed")
            }else{
                res.send("ERROR Occurred while configuration of server !! please try again later or contact our team for resolving issues")
            }
            
        }else{
            res.send("ERROR Occurred while starting -StartScript")
        }
        
    }else{
        res.send(isProcessed)
    }
}

