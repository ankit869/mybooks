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
module.exports=execShellCommand

