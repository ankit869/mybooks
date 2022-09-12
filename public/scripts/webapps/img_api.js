var user_key=""

$.ajax({
    url:'/private/img_api_detail',
    method: 'GET',
    success: function(response) {
        if(response.api_status=="enabled"){
            user_key=response.api_key
            $('.apiToggler .switch #toggle-2').prop("checked", true);
            $('#api-section .apikey span').css('display','inline-block')
            $(".img_upload_viewer").css("display","block");

        }else{
            $('.apiToggler .switch #toggle-2').prop("checked", false);
            $('#api-section .apikey span').text("enable the api to get its access")
            $(".img_upload_viewer").css("display","none");

        }
    }
});


function toggle_img_api(){   
    $.ajax({
        url: '/img-api/toggle',
        method: 'PATCH',
        success: function(response) {
            console.log(response)
            if(response!="unauthorized"){
                if(response=="disabled"){
                    $(".img_upload_viewer").css("display","none");
                    $("#snackbar").text("API disabled");
                    $('.apiToggler .switch #toggle-2').prop("checked", false);
                    $('.api_key_status').html(`enable the api to get its access<span><i class="fas fa-link"></i></span>`)
                    myFunction();


                }else{
                    $(".img_upload_viewer").css("display","block");
                    $("#snackbar").text("API enabled");
                    $('.apiToggler .switch #toggle-2').prop("checked", true);
                    $('.api_key_status').html(`${response}<span><i class="fas fa-link" onclick="copy_apikey('${response}')"></i></span>`)
                    $('#api-section .apikey span').css('display','inline-block')
                    myFunction();

                }

            }else{
                $(".img_upload_viewer").css("display","none");
                $('.apiToggler .switch #toggle-2').prop("checked", false);

                location.href="/login-error"
            }
        }
    });
}

function copy_referral(id){
    navigator.clipboard.writeText("http://mybooks-free.com/signup?referral="+id);
    $('#snackbar').text('Link copied to clipboard')
    var audio=new Audio("../sounds/success.mp3");
    audio.play();
    myFunction();
}

function copy_apikey(key){
    navigator.clipboard.writeText(key);
    $('#snackbar').text('api key copied to clipboard')
    myFunction();
}
function copy_imgurl(imgurl){
    navigator.clipboard.writeText(imgurl);
    $('#snackbar').text('URL is copied to clipboard')
    myFunction();
}
$(".copy_code").on('click',function copy_code(){
    navigator.clipboard.writeText($(this).closest(".code_block").find(".code_txt").text());
    $('#snackbar').text('code copied to clipboard')
    myFunction();
})


$(".upldImgLink").text(($(".upldImgLink").text()).substring(0,60)+" ...")

dragArea_pdfImgs=$(".img_upld_container")
dragStatus=$(".img_upld_container .DragStatus")
$(dragArea_pdfImgs).on("dragover",function(event){
    event.preventDefault();  
    event.stopPropagation();
    $(".img_upld_container").css("border-color","#6083e4")
    $(dragStatus).text("Release to Upload images");

})

$(dragArea_pdfImgs).on("dragleave",function(event){
    event.preventDefault();  
    event.stopPropagation();
    $(".img_upld_container").css("border-color","#d4d4e0")
    $(dragStatus).text("Drag and Drop images here");

})
$(dragArea_pdfImgs).on('drop',function(event){
    event.preventDefault();  
    event.stopPropagation();
    $(".img_upld_container").css("border-color","#d4d4e0")
    $(dragStatus).text("Drag and Drop images here");
    $("#api_imgs_input").prop("files", event.originalEvent.dataTransfer.files);
    upload(event.originalEvent.dataTransfer.files);
})


function choose_photos(){
    $("#api_imgs_input").click();
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
            "api-key":user_key ,// use your own api-key here.
        },
        data:formData,
        cache:false,
        processData: false,
        contentType:false,
        success:function(response){
            response.forEach((res)=>{
                createCard(res)
            })

            function createCard(imgData){
                response_html=`
                
                <div class="img_data">
                    <img src="${imgData.ImgUrl}" target="_blank" alt="">
                    <a href="${imgData.ImgUrl}" class="upldImgLink dont-break-out">${imgData.ImgUrl}</a>
                    <i class="fa-regular fa-copy" onclick="copy_imgurl('${imgData.ImgUrl}')"></i>
                </div>`
                $('.UpldImgView').append(response_html)
                
            }
        },
        error:function(err){
            console.log('ERROR!!: '+err)
        }
    })
}

function open_upload_dialog(){
    $(".uv_container").css("display","block")
    $(".uv_container .upld_img").css("display","block")
    $("body").addClass("stop_body_scroll")
}
function close_upload_dialog(){
    $(".uv_container").css("display","none")
    $(".uv_container .upld_img").css("display","none")
    $("body").removeClass("stop_body_scroll")
}