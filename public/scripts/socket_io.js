var socket=null
setInterval(()=>{
    // console.clear()
},1000)
function getSocket(cb){
    if(socket!=null){
        return cb(socket,null)
    }else{
        return cb(socket,new Error("Socket Not Connected!!"))
    }
}
async function getUser(cb){
    if(socket!=null){
        socket.on("user",(res)=>{
            if(res){
              return cb(res)
            }else{
              return cb(null)
            }
       })
    }else{
        return cb(socket,new Error("Socket Not Connected!!"))
    }
}

window.onload=function(){
    socket = io.connect('http://localhost:8080'); 
    socket.on("connect", () => {
      console.log("socket connected to the server successfully!!");
    });
}





    