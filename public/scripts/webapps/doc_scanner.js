function choose_photos(){
    $("#scan_input_imgs").click();
}


let fileInput = document.getElementById("scan_input_imgs");
let imageContainer = document.getElementById("scan_images");
let numOfFiles = document.getElementById("num-of-files");


j=0;

async function preview(){
    // $.LoadingOverlay("show",{
    //     background  : "#3c436cc7",
    // })
    $(".create_pdf_btn").prop('disabled',true)

    numOfFiles.innerHTML = `<span class="img_loading_txt">loading Files ...</span><div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`;
    if(fileInput.files.length>0){
        $(".scanr_viewer").css("display","block")
        $(".nothing_selected").css("display","none")

        for(i of fileInput.files){
            j++;
            let figure = document.createElement("figure");
            figure.className="figure"
            let figCap = document.createElement("figcaption");
            if(i.name.length<=55){
                figCap.innerText = ""//i.name
            } else {
                figCap.innerText = ""//i.name.substr(0,55)+" ..."
            }
            figCap.className = "dont-break-out"
            figCap.style.display="none"
            figure.appendChild(figCap);

            var newNode1 = document.createElement('div');
            newNode1.className = 'image_no';
            newNode1.innerHTML = j;
            var newNode2 = document.createElement('div');
            newNode2.className = 'image_ctrls';
            
            figure.appendChild(newNode1);
            figure.appendChild(newNode2);

            var newNode21 = document.createElement('div');
            newNode21.className = 'view_img';
            newNode21.innerHTML = '<i class="far fa-eye">';
            newNode21.onclick= function(){
                show_img(this)
            }
            newNode2.appendChild(newNode21)


            var newNode22 = document.createElement('div');
            newNode22.className = 'crop_img';
            newNode22.innerHTML = '<i class="material-icons" style="vertical-align:middle;position:relative;bottom:1.5px;">crop</i>';
            newNode22.onclick= function(){
                crop_img(this)
            }
            newNode2.appendChild(newNode22)


            var newNode23 = document.createElement('div');
            newNode23.className = 'dlt_img';
            newNode23.innerHTML = '<i class="fas fa-trash-alt"></i>';
            newNode23.onclick=function (){
                delete_selected(this)
            }
            newNode2.appendChild(newNode23)

            var newNode3 = document.createElement('div');
            newNode3.className = 'image_editor';
            newNode3.innerHTML = '<i class="far fa-edit"></i>';
            newNode3.onclick=function (){
                toggle_dialog()
                start_editing(this)
            }

            figure.appendChild(newNode3);
            const options = { 
                maxSizeMB: 0.3,      
                maxWidthOrHeight: 1280,
            }
            const compressedFile = await imageCompression(i, options);

            let fileURL=URL.createObjectURL(compressedFile)

            let img = document.createElement("img");
            img.className="scanned_img"
            img.setAttribute("src",fileURL);
            let org_img = document.createElement("img");
            org_img.className="org_img";
            org_img.style.display="none";
            org_img.setAttribute("src",fileURL);
            figure.insertBefore(img,figCap);
            figure.insertBefore(org_img,figCap);
            
            imageContainer.appendChild(figure);
            $(".img_loading_txt").html(`<span class="img_loading_txt">${j} Files Selected, loading Files ...</span>`)
        }
        // $.LoadingOverlay("hide");
        numOfFiles.innerHTML = `<span class="img_loading_txt">${j} Files Selected</span>`
    
        $(".create_pdf_btn").prop('disabled',false)

    }else{
        numOfFiles.innerHTML = `<span class="img_loading_txt">${j} Files Selected</span>`
    }
    // $.LoadingOverlay("hide");
    
}


const imagesToBeSorted = document.querySelector(".scan_images");

new Sortable(imagesToBeSorted, {
    multiDrag: true, // Enable multi-drag
    selectedClass: 'selectedImages', // The class applied to the selected items
    fallbackTolerance: 3, // So that we can select items on mobile
    animation: 150,
    onUpdate: function(){ file_reorder(); }
})
const webcamElement = document.getElementById('camera');
const canvasElement = document.getElementById('canvas');
const snapSoundElement = document.getElementById('snapSound');
const webcam = new Webcam(webcamElement, 'enviroment',canvasElement,snapSoundElement);
async function take_img_frm_camera(){
    num_of_snaps=0;
    webcam.start()
    .then(result =>{
        console.log("webcam started");
        $(".take_a_shot").css("display","block") 
        $("#scanner_section").css("display","none") 
        $(".create_pdf_btn").css("display","none") 
        $("footer").css("display","none") 
        
    })
    .catch(err => {
        console.log(err);
    });
}
num_of_snaps=0;
function close_camera(){
    webcam.stop()
    $("#multiSnapNo").css("display","none")
    $('#multipleSnapCkeck').prop('checked',false)
    if(num_of_snaps>0){
        $(".take_a_shot").css("display","none") 
        $("#scanner_section").css("display","block") 
        $(".scanr_viewer").css("display","block")
        $(".nothing_selected").css("display","none")
        $("footer").css("display","block")
        $(".create_pdf_btn").css("display","block")
    }else{
        $("#scanner_section").css("display","block") 
        $(".take_a_shot").css("display","none")
        $(".nothing_selected").css("display","flex")
        $(".create_pdf_btn").css("display","block")
        $("footer").css("display","block")
    }
}
async function take_snapshot() {
    j++;
    $.LoadingOverlay("show",{
        background  : "#3c436cc7"
    });
    num_of_snaps++;

    $(".create_pdf_btn").prop('disabled',false)
    numOfFiles.textContent = `${j} Files Selected`;

    let picture=webcam.snap()
   
    let figure = document.createElement("figure");
    figure.className="figure"
    let figCap = document.createElement("figcaption");
    figCap.innerText = ""//"Image_file_"+Date.now()+".png"
    figCap.className = "dont-break-out"
    figure.appendChild(figCap);
    figCap.style.display="none"


    var newNode1 = document.createElement('div');
    newNode1.className = 'image_no';
    newNode1.innerHTML = j;
    var newNode2 = document.createElement('div');
    newNode2.className = 'image_ctrls';
    
    figure.appendChild(newNode1);
    figure.appendChild(newNode2);

    var newNode21 = document.createElement('div');
    newNode21.className = 'view_img';
    newNode21.innerHTML = '<i class="far fa-eye">';
    newNode21.onclick= function(){
        show_img(this)
    }
    newNode2.appendChild(newNode21)

    var newNode22 = document.createElement('div');
    newNode22.className = 'crop_img';
    newNode22.innerHTML = '<i class="material-icons" style="vertical-align:middle;position:relative;bottom:1.5px;">crop</i>';
    newNode22.onclick= function(){
        crop_img(this)
    }
    newNode2.appendChild(newNode22)


    var newNode23 = document.createElement('div');
    newNode23.className = 'dlt_img';
    newNode23.innerHTML = '<i class="fas fa-trash-alt"></i>';
    newNode23.onclick=function (){
        delete_selected(this)
    }
    newNode2.appendChild(newNode23)
    var newNode3 = document.createElement('div');
    newNode3.className = 'image_editor';
    newNode3.innerHTML = '<i class="far fa-edit"></i>';
    newNode3.onclick=function (){
        toggle_dialog()
        start_editing(this)
    }
    figure.appendChild(newNode3);


    // const imageCompressed = await imageCompression(file, options);
    // fileURL=URL.createObjectURL(imageCompressed)
    // console.log(fileURL)

    let img = document.createElement("img");
    img.setAttribute("src",picture);
    img.className="scanned_img"
    figure.insertBefore(img,figCap);
    
    let org_img = document.createElement("img");
    org_img.className="org_img";
    org_img.style.display="none";
    org_img.setAttribute("src",picture);
    figure.insertBefore(org_img,figCap);

    imageContainer.appendChild(figure);
    $.LoadingOverlay("hide");

    let isMulti=$('#multipleSnapCkeck').prop('checked')
    if(isMulti){
        $("#multiSnapNo").css("display","block")
        $("#multiSnapNo").text(num_of_snaps);
    }else{
        $("#multiSnapNo").css("display","none")
        $(".take_a_shot").css("display","none") 
        $("#scanner_section").css("display","block") 
        $("footer").css("display","block")
        $(".scanr_viewer").css("display","block")
        $(".create_pdf_btn").css("display","block")
        $(".nothing_selected").css("display","none")
        $.LoadingOverlay("hide");
        webcam.stop()
    }
}

async function show_img(img){
    src=$(img).closest(".figure").find(".scanned_img").attr("src")
    var modal = document.getElementById("view-modal");
    var modalImg = document.getElementById("view-modalImg");
    modal.style.display = "block";
    modalImg.src = src;

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() { 
        modal.style.display = "none";
    }
}
let i= 0; 
let final_image_path="";

async function crop_img(img){
    
    var modal = $('#modal');
    var image = document.getElementById('sample_image');
    image.src=$(img).closest(".figure").find(".scanned_img").attr("src");
    final_image_path=$(img).closest(".figure").find(".scanned_img");
    var cropper;
    modal.modal('show');
    modal.on('shown.bs.modal', function() {
        cropper=new Cropper(image, {
            aspectRatio: 4 / 5.69,
            viewMode: 3,
            preview:'.preview',
            ready() {
                $('#crop').click(function(){
                    $.LoadingOverlay("show",{
                        background  : "#3c436cc7",
                    })
                    url=cropper.getCroppedCanvas({
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: 'high',
                    }).toBlob(async function(blob) {
                        const options = { 
                            maxSizeMB: 0.3,      
                            maxWidthOrHeight: 1280,
                        }
                        const compressedFile = await imageCompression(blob, options);
            
                        let fileURL=URL.createObjectURL(compressedFile)
                        $(final_image_path).attr('src', fileURL);
                        final_image_path=""
                        modal.modal('hide');
                    })
                });
            },
          });
    }).on('hidden.bs.modal', function(){
        $.LoadingOverlay("hide");
        cropper.destroy();
        cropper = null;
    });

}
dragArea_pdfImgs=$(".scanr_input")
dragStatus=$(".scanr_input .dragStatus")
$(dragArea_pdfImgs).on("dragover",function(event){
    event.preventDefault();  
    event.stopPropagation();
    $(".scanr_input").css("border-color","#6083e4")
    $(dragStatus).text("Release to Upload images");

})

$(dragArea_pdfImgs).on("dragleave",function(event){
    event.preventDefault();  
    event.stopPropagation();
    $(".scanr_input").css("border-color","#d4d4e0")
    $(dragStatus).text("Drag and Drop images here");

})
$(dragArea_pdfImgs).on('drop',function(event){
    event.preventDefault();  
    event.stopPropagation();
    $(".scanr_input").css("border-color","#d4d4e0")
    $(dragStatus).text("Drag and Drop images here");
    $("#scan_input_imgs").prop("files", event.originalEvent.dataTransfer.files);
    preview();
})


async function delete_selected(img){
    $(img).closest(".figure").remove()
    j--;
    numOfFiles.textContent = `${j} Files Selected`;
    file_reorder()
    if(j==0){
        $(".scanr_viewer").css("display", "none")
        $(".nothing_selected").css("display","flex")
        $(".create_pdf_btn").prop('disabled',true)
    }
}

async function file_reorder(){
    $(".figure").each(function (index, value) {   
        $(this).find(".image_no").text(index+1);   
    });
}

 
async function create_pdf(){
    $(".scanr_viewer").css("pointer-events","none");
    $("#pdf_progress").css('display',"flex")
    $("#progress-percent").css("display","block");
    $(".progress").css("display","block");
    $(".progress").css("width","65%");
    $(".create_pdf_btn").prop('disabled',true)
    $(".create_pdf_btn").css('display',"none")
    $(".status").css("display","inline-block");
    images=new Array();
    indexes=new Array();
    $(".figure").each(async function (index, value) {
        let blobURL=$(this).find(".scanned_img").attr("src").toString('base64');              
        let blobImg =await fetch(blobURL).then(r => r.blob());
        images.push(blobImg);
        indexes.push(index)
        console.log(index)
        if(images.length==parseInt(numOfFiles.textContent)){
            upload();
        }
    }); 

    function upload(){
        var xhr   = new XMLHttpRequest();
        var formData = new FormData();
        let k=0;
        formData.append('total_images',parseInt(numOfFiles.textContent));
        images.forEach(image =>{
            var file = new File([image], "image_"+indexes[k]+".jpeg", {
                type: "image/jpeg",
            });
            formData.append('images',file);
            k++;
        })
        xhr.upload.onprogress = function(e){
            if (e.lengthComputable) {
                var percentComplete = (e.loaded / e.total) * 100;  
                var percentVal = Math.floor(percentComplete) +"%";
                $("#progress-percent").text(percentVal)
                $(".bar").css("width",percentVal);
                console.log("percent :"+percentVal)

                if(percentVal=="100%"){
                    $(".status").html(`files uploaded successfully !! creating pdf...
                    <div class="lds-spinner-sm-green" style="transform: scale(0.4);"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`);
                }
            }
        };

        xhr.responseType = 'blob';
        xhr.onreadystatechange = function(e) {
            if ( 4 == this.readyState ) {
                $(".status").html(`Almost done...
                <div class="lds-spinner-sm-green" style="transform: scale(0.4);"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`);
            }
        };
        xhr.open("POST", "/doc_scanner/upload_PDF_IMG/"+$("#pdfFileLayout").val());
        // xhr.open("POST", "/img-api/upload");


        xhr.send(formData);
        
        xhr.onload=function(){
            if(this.status!=200){
                $(".status").addClass("alert-danger");
                $(".status").text("An Error has occurred !! please try again !!");
            }else{
                // $(".progress").css("display","none");
                // $("#progress-percent").css("display","none")
                
                var blob = new Blob([this.response], { type: "application/pdf" });
                if($("#pdfFileName").val()==""){
                    fileName="NewDocument.pdf"
                }else{
                    fileName=$("#pdfFileName").val()+".pdf"
                }
                
                //Check the Browser type and download the File.
                var isIE = false || !!document.documentMode;
                if (isIE) {
                    window.navigator.msSaveBlob(blob, fileName);
                } else {
                    var url = window.URL || window.webkitURL;
                    link = url.createObjectURL(blob);
                    var a = $("<a />");
                    a.attr("download", fileName);
                    a.attr("href", link);
                    $("body").append(a);
                    a[0].click();
                    $.LoadingOverlay("hide");
                    setTimeout(function(){
                        $("#pdfCreator").css("display","none")
                        $("#finalReadyPdf").css("display","block")
                        $("#newpdfName").text(fileName)
                        $(".pdf_download").click(()=>{
                            a[0].click();  
                        })
                        $(".pdf_sharing").click(async ()=>{
                            const file=new File([blob],fileName,{type: blob.type});
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({
                                  files: [file],
                                  title: fileName,
                                  text: 'PDF file created with Online DocScanner',
                                })
                              .then(() => console.log('Share was successful.'))
                              .catch((error) => console.log('Sharing failed', error));

                            } else {
                              alert(`Your system doesn't support sharing files.`);
                            } 
                        })

                    },300)
                }
            }
        }
    }
    
}


