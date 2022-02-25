
fileInput = document.querySelector(".doc-file-input");
doc_files = document.querySelector(".doc_files");

function choose_doc_files(){
  fileInput.click();
};

var filesUploaded=0;
var filesConverted=[];
var j=0;
fileInput.onchange = ({target})=>{
  for(i=0;i<target.files.length;i++){
    let file = target.files[i];
    if(file){
      if(file.name.length>13){
        fileName=file.name.split('.')[0].substring(0, 13) + "... ." + file.name.split('.').pop()
      }else{
        fileName=file.name.split('.')[0]+'.'+file.name.split('.').pop()
      }
      if(file.name.split('.').pop()=="docx" 
         || file.name.split('.').pop()=="pptx"
         || file.name.split('.').pop()=="xlsx"
         || file.name.split('.').pop()=="doc"
         || file.name.split('.').pop()=="ppt"
         || file.name.split('.').pop()=="xls"){
        j++;
        uploadFile(file,fileName,file.name.split('.').pop());
      }else{
        alert("Please Upload Word,Excel or PPT files.")
      }
    }
  }
  file_reorder()
  fileInput.value=null;

}  

function file_reorder(){
  $(".doc_files .file").each(function (index, value) {   
      $(this).find(".fileNumber").text(index+1);   
  });
}

function delete_doc_file(fileBlock){
  if(j==1){
    $(".doc_files").css("display","none");
    $(".nothing_selected").css("display","flex");
  }
  fileBlock.closest(".file").remove();
  j--;

  file_reorder()

}
function uploadFile(file,name,type){

    $(".doc_files").css("display","flex");
    $(".nothing_selected").css("display","none");
    let xhr = new XMLHttpRequest();
    let fileHTML=document.createElement("div");
    var fileCode=Date.now()+"•"+file.name;
    fileHTML.className='file';
    fileHTML.innerHTML=`<div class="file_view">
                          <div class="file_sequence_no">
                              <span class="fileNumber"></span>
                          </div>
                          <div class="file_progress">
                            <div class="file_data">
                                <img class="file_icon" src="/images/${type}doc.png" alt="">
                                <span class="name">${name}</span>
                                <span class="percent">• Uploading file ..</span>
                                <span class="m-percent"> Uploading file ..</span>
                            </div>
                          </div>
                      </div>`

    file_reorder()

    doc_files.appendChild(fileHTML)
    xhr.open("POST", "/doc-converter/upload_doc_files");
    xhr.onreadystatechange = function(e) {
      if ( 4 == this.readyState ) {
        filesUploaded++;
      }
    };

    xhr.upload.addEventListener("progress", ({loaded, total}) =>{

      let fileLoaded = Math.floor((loaded / total) * 100);
      let fileTotal = Math.floor(total / 1000);
      let fileSize;
      (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024*1024)).toFixed(2) + " MB";
      let progressHTML = `<div class="file_data">
                              <img class="file_icon" src="/images/${type}doc.png" alt="">
                              <span class="name">${name}</span>
                              <span class="percent">• Uploading ${fileLoaded}%</span>
                              <span class="m-percent"> Uploading ${fileLoaded}%</span>
                          </div>
                          <div class="file_upload_progress" style="margin-top:8px;">
                            <div class="progress" style="display:block;">
                                <div class="progress-bar progress-bar-striped progress-bar-animated bar progress-width" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width:${fileLoaded}%"></div>
                            </div>
                          </div>`;
      
      fileHTML.querySelector('.file_progress').innerHTML=progressHTML;

      if(loaded == total){
        let uploadedHTML = `<div class="file_view" >
                              <div class="upload_done_icon">
                                  <img src="/images/upload_done.png" alt="">
                              </div>
                              <p class="fileCode" style="display:none;" >${fileCode}</p>
                              <div class="file_sequence_no">
                                  <span class="fileNumber"></span>
                              </div>
                              <div class="file_delete" onclick="delete_doc_file(this)">
                                  <img src="/images/delete.png" alt="">
                              </div>
                              <div class="file_progress">
                                <div class="file_data">
                                    <img class="file_icon" src="/images/${type}doc.png" alt="">
                                    <span class="name">${name}</span>
                                    <span class="percent">• Uploaded ${fileSize}</span>
                                    <span class="m-percent"> Uploaded ${fileSize}</span>
                                </div>
                              </div>
                              
                            </div>`;
        
        fileHTML.innerHTML = uploadedHTML;
        file_reorder()

      }
    });
    var form = new FormData();
    form.append('doc_file', file, fileCode);
    fileNumber=j;
    xhr.send(form);
}

dragArea_docfile=$(".scanr_input")
dragStatus=$(".scanr_input .dragStatus")
$(dragArea_docfile).on("dragover",function(event){
    event.preventDefault();  
    event.stopPropagation();
    $(".scanr_input").css("border-color","#6083e4")
    $(dragStatus).text("Release to Upload files");
})

$(dragArea_docfile).on("dragleave",function(event){
    event.preventDefault();  
    event.stopPropagation();
    $(".scanr_input").css("border-color","#d4d4e0")
    $(dragStatus).text("Drag and Drop files here");
})

$(dragArea_docfile).on('drop',function(event){
    event.preventDefault();  
    event.stopPropagation();
    $(".scanr_input").css("border-color","#d4d4e0")
    $(dragStatus).text("Drag and Drop files here");
    $(".doc-file-input").prop("files", event.originalEvent.dataTransfer.files);
    // preview();
    var target=event.originalEvent.dataTransfer
  
    for(i=0;i<target.files.length;i++){
      let file = target.files[i];
      if(file){
        if(file.name.length>13){
          fileName=file.name.split('.')[0].substring(0, 13) + "... ." + file.name.split('.').pop()
        }else{
          fileName=file.name.split('.')[0]+'.'+file.name.split('.').pop()
        }
        
        if(file.name.split('.').pop()=="docx" 
          || file.name.split('.').pop()=="pptx"
          || file.name.split('.').pop()=="xlsx"
          || file.name.split('.').pop()=="doc"
          || file.name.split('.').pop()=="ppt"
          || file.name.split('.').pop()=="xls"){
          j++;
          uploadFile(file,fileName,file.name.split('.').pop());
        }else{
          alert("Please Upload Word,Excel or PPT files.")
        }
      } 
    }
    file_reorder()
})

const filesToBeSorted = document.querySelector(".doc_files");

new Sortable(filesToBeSorted, {
    multiDrag: true, // Enable multi-drag
    selectedClass: 'selectedFile', // The class applied to the selected items
    fallbackTolerance: 3, // So that we can select items on mobile
    animation: 150,
    onUpdate: function(){ file_reorder(); }
})

function convertIntoPdf(ismerge){
  if(j>=1){
    if(ismerge=="true"){
      if(j<2){
        alert("please select atleast 2 or more files to merge them.")
        return;
      }
    }
    $.LoadingOverlay("show",{
        background  : "#3c436cc7"
    });
    var files=new Array();
    $(".doc_files .file").each(function (index, value) {       
      files.push($(this).find(".fileCode").text())     
    });
    var xhr   = new XMLHttpRequest();
  
    xhr.responseType = 'blob';
    xhr.open("GET", "/doc-converter/convert_to_pdf?filesToBeConverted="+JSON.stringify(files)+"&ismerge="+ismerge);
  
    xhr.send();
    
    xhr.onload= async function(){
  
        if(this.status==503){
          $.LoadingOverlay("hide");
          setTimeout(function(){
            alert("Some Error Occured while Coverting your files try another")
          },600)
        }else{
          var blob = new Blob([this.response], { type: "application/zip" });
          const zipReader = new zip.ZipReader(new zip.BlobReader(blob));
          const entries = await zipReader.getEntries();
          var filesHTML="<br>"
          
          entries.forEach(async function(entry,entryIndex){
            blob=await entry.getData(new zip.BlobWriter())
            var file = new File([blob],entry.filename,{type:"application/pdf"});
            let fileTotal = Math.floor(file.size / 1000);
            let fileSize;
            (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (fileTotal /1024).toFixed(2) + " MB";
  
            filesConverted.push(file)
            let fileName = file.name;
            if(fileName.length >= 12){
              fileName=file.name.split('.')[0].substring(0, 13) + "... ." + file.name.split('.').pop()
            }
    
            filesHTML+=`<div class="fileData">
                            <img onclick="shareFile('${file.name}')" class="circle_share_icon" src="/images/circle-share.png" alt="">
                            <img onclick="downloadFile('${file.name}')" class="circle_download_icon" src="/images/circle-download.png" alt="">
                            <div class="fileInfo">
                                <img class="file_icon" src="/images/pdf_icon.png" alt="">
                                <span class="file_name" >${fileName}</span>
                                <span class="file_size" >${fileSize}</span>
                            </div>      
                        </div>`
            
            if(filesConverted.length==entries.length){
              $.LoadingOverlay("hide");
              filesHTML+="<br>"
              $(".convertedFiles .files").html(filesHTML)
              $(".convertedFiles").css("display", "block")
              $("#pdfCreator").css("display", "none")
            }
          })

          await zipReader.close()
        }
    }
  }
}


async function downloadFile(fname){
  var fileURL = URL.createObjectURL(filesConverted.find(file => file.name === fname));
  var a=document.createElement('a')
  a.href = fileURL;
	a.download = fname;
	const clickEvent = new MouseEvent("click");
	a.dispatchEvent(clickEvent);

}

async function shareFile(fname){
  if (navigator.canShare && navigator.canShare({ files: [filesConverted.find(file => file.name === fname)] })) {
      await navigator.share({
        files: [filesConverted.find(file => file.name === fname)],
        title: fname,
        text: 'PDF file created with Online DocScanner',
      })
    .then(() => console.log('Share was successful.'))
    .catch((error) => console.log('Sharing failed', error));

  } else {
    alert(`Your system doesn't support sharing files.`);
  } 
}
