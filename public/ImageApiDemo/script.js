let fileInput = document.getElementById("file-input");
let imageContainer = document.getElementById("images");
let numOfFiles = document.getElementById("num-of-files");

function preview(){
    // imageContainer.innerHTML = "";
    numOfFiles.textContent = `${fileInput.files.length} Files Selected`;

    for(i of fileInput.files){
        let reader = new FileReader();
        let figure = document.createElement("figure");
        let figCap = document.createElement("figcaption");
        figCap.innerText = i.name;
        figure.appendChild(figCap);
        reader.onload=()=>{
            let img = document.createElement("img");
            img.setAttribute("src",reader.result);
            figure.insertBefore(img,figCap);
        }
        imageContainer.appendChild(figure);
        reader.readAsDataURL(i);
    }
    upload(fileInput.files)

} 

function upload(files){   
    var formData=new FormData();
    for(i=0;i<files.length;i++){
        formData.append('images',files[i])
    }
    $.ajax({
        type:"POST",
        url:"https://mybooks-free.com/img-api/upload",
        "headers": {
            "api-key":"demo" ,// use your own api-key here.
        },
        data:formData,
        cache:false,
        processData: false,
        contentType:false,
        success:function(response){
            console.log(response)
            $(".apimsg").remove()
            $("code pre").append(JSON.stringify(response,null,2))
        },
        onerror:function(err){
            console.log('ERROR!!: '+err)
        }
    })
}