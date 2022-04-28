$(".dropdown").on('click',()=>{
  if($(".dropdown i").hasClass("fas fa-caret-down")){
      $(".dropdown i").removeClass("fas fa-caret-down")
      $(".dropdown i").addClass("fas fa-caret-right")
  }
  else if($(".dropdown i").hasClass("fas fa-caret-right")){
      $(".dropdown i").removeClass("fas fa-caret-right")
      $(".dropdown i").addClass("fas fa-caret-down")
  }
  $('.dropdown-content').slideToggle().css({"display": "block"});
  return false;
})

// VERY IMP NOTE- this property will not work if arrow function is used 
$(".course .bookNavigate-r").on("click",function(){
  
  $(this).closest(".course").find(".books").animate({
      scrollLeft:"+=400px"
  },"fast",()=>{
      scrollLength=$(this).closest(".course").find(".books").scrollLeft()
      if(scrollLength==0){
          $(this).closest(".course").find(".bookNavigate-l").css("display","none")
      }
      else{
          $(this).closest(".course").find(".bookNavigate-l").css("display","block")
      }
  });
})

$(".course .bookNavigate-l").on("click",function(){
  $(this).closest(".course").find(".books").animate({
      scrollLeft:"-=400"
  },"fast",()=>{
      scrollLength=$(this).closest(".course").find(".books").scrollLeft()
      if(scrollLength==0){
          $(this).css("display","none")
      }
      else{
          $(this).css("display","block")
      }
  }); 
})

// $('.books').each(function(i, obj) {
//     $(this).find(".book").each(function(j, obj2) {
//       console.log(obj2)
//       console.log(j)
//     })
// });

dragArea=$(".drag-area")
dragText=$(".drag-area header")
let file;
function chooseIMG(){
    $("#hide_IMG input").click();
}

$("#hide_IMG input").on("change",function(){
    file=this.files[0];
    showFile();
})

function cancleImg(){
    $("#show_IMG").css("display","none");
    $("#hide_IMG").css("display","block");
    file="";
    $("#hide_IMG input").val("");
    $(dragArea).removeClass("active-img");
    $("input[name='isUpldImg'").val("0");
}

$(dragArea).on("dragover",function(event){
    event.preventDefault();  
    event.stopPropagation();
    $(dragArea).addClass("active-img");
    $(dragText).text("Release to Upload book cover");

})

$(dragArea).on("dragleave",function(event){
    event.preventDefault();  
    event.stopPropagation();
    $(dragArea).removeClass("active-img");
    $(dragText).text("Drag & Drop to Upload book cover");

})

$(dragArea).on('drop',function(event){
    event.preventDefault();  
    event.stopPropagation();
    $(dragArea).removeClass("active-img");
    $(dragText).text("Drag & Drop to Upload book cover");
    $("#hide_IMG input").prop("files", event.originalEvent.dataTransfer.files);
    file=event.originalEvent.dataTransfer.files[0];
    showFile();
})
  
function showFile(){
    let fileType = file.type; 
    let validExtensions = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if(validExtensions.includes(fileType)){
        let fileReader = new FileReader();
        fileReader.onload = ()=>{
            let fileURL = fileReader.result; 
            $("#book-file-img").attr("src",fileURL);
            $("#show_IMG").css("display","block")
            $("#hide_IMG").css("display","none")
            $(dragArea).addClass("active-img");
        }
        fileReader.readAsDataURL(file);
        $("input[name='isUpldImg'").val("0");
    }
    else{
        alert("This is not an Image File!");
        $(dragArea).removeClass("active-img");
        $(dragText).text("Drag & Drop to Upload book cover");
    }
    
}

function showfeed(){
    $("#feedback").slideToggle().css('display','flex');   
    
}

function showcredit(id){
    $("."+id+" .editCredits form").toggle('fast').css('display','flex');   
    $("."+id+" .sendMsg").toggle();      
}

function shownotify(id){
    $("."+id+" .sendMsg form").toggle('fast').css('display','flex');  
    $("."+id+" .editCredits").toggle();    
}

function sendotp(){

    var emailInput=$("#reset_emailInput").val();

    $("#reset_opt").val()
    if(emailInput!=""){

        $.ajax({
            url: '/reset/'+emailInput,
            method: 'POST',
            contentType: 'application/json',
            success: function(response) {
                if(response){
                    $("#reset_opt").prop('disabled',false)
                    $("#reset_password").prop('disabled',false)
                    $("#reset-send").prop('disabled',false)
                    $("#login-msg").text("Check your mail ! OTP sent to your mail successfully")
                    $("#otp-btn").text("Resend OTP")
                    if(response=="notfound"){
                        $("#login-msg").text("You are not a member try to SignUp first")
                        $("#reset_emailInput").val("")
                        $("#otp-btn").text("Send OTP")
                        $("#reset_opt").prop('disabled',true)
                        $("#reset_password").prop('disabled',true)
                        $("#reset-send").prop('disabled',true)
                    }
                    if(response=="already_g"){
                        $("#login-msg").text("You are already registered with google try to SignIn with google.")
                        $("#reset_emailInput").val("")
                        $("#otp-btn").text("Send OTP")
                        $("#reset_opt").prop('disabled',true)
                        $("#reset_password").prop('disabled',true)
                        $("#reset-send").prop('disabled',true)
                    }
                }
            }
        });
    }
    else{
        $("#login-msg").text("Please Enter your email for OTP !")
    }
}

$(".admin-login-form").on("submit",(event)=>{
    event.preventDefault();
    $.ajax({
        url: '/admin-login',
        method: 'POST',
        data: $(".admin-login-form").serialize(),
        success: function(response) {
            
            if(response.status=="401"){
                $("#login-msg").text((response.message))
            }else{
                $("#login-msg").text((response.message))
                window.location.href=response.authUrl
            }
        }
        
    });
})
$(".admin-signup-form").on("submit",(event)=>{
    event.preventDefault();
    $.ajax({
        url: '/admin-signup',
        method: 'POST',
        data: $(".admin-signup-form").serialize(),
        success: function(response) {
            
            $("#login-msg").text((response.message)) 
        }
        
    });
})

$(".login-form").on("submit",(event)=>{
    event.preventDefault();
    $.ajax({
        url: '/login',
        method: 'POST',
        data: $(".login-form").serialize(),
        success: function(response) {
            if(response.status=="401"){
                $("#login-msg").text((response.message))
            }else{
                $("#login-msg").text((response.message))
                window.location.href=response.authUrl
            }
        },
        error: function(response){
          if(response.status=="401"){
              $("#login-msg").text("Please enter correct password !!")
          }
        }
    });
})

$(".reset-form").on("submit",(event)=>{
    event.preventDefault();
    $.ajax({
        url: '/reset',
        method: 'POST',
        data: $(".reset-form").serialize(),
        success: function(response) {
            if(response.status=="401"){
                $("#login-msg").text((response.message))
            }else{
                $("#login-msg").text((response.message))
                window.location.href="/login"
            }
        }
    });
})


function sendotp_admin(){

    var emailInput=$("#admin_emailInput").val();

    $("#admin_emailInput").val()
    if(emailInput!=""){

        $.ajax({
            url: '/admin_access/'+emailInput,
            method: 'POST',
            contentType: 'application/json',
            success: function(response) {
                $("#reset_opt").prop('disabled',false)
                $("#admin_unicode").prop('disabled',false)
                $("#admin_key").prop('disabled',false)
                $("#login-send").prop('disabled',false)
                if(response){
                    $("#login-msg").text("Check your mail ! OTP sent to your mail successfully")
                    $("#otp-btn").text("Resend OTP")
                    if(response=="notfound"){
                        $("#login-msg").text("Sorry this email is not associated with this account !!")
                        $("#otp-btn").text("Send OTP")

                        $("#reset_opt").prop('disabled',true)
                        $("#admin_unicode").prop('disabled',true)
                        $("#admin_key").prop('disabled',true)
                        $("#login-send").prop('disabled',true)
                    }
                }else{
                    $("#login-msg").text("Sorry we are having some mailing issues try again in sometime !!")
                }
            }
        });
    }
    else{
        $("#login-msg").text("Please Enter your email for OTP !")
    }
}

function sendotp_tome(){

    $.ajax({
        url: '/admin_register',
        method: 'POST',
        contentType: 'application/json',
        success: function(response) {
            console.log(response)
            if(response){
                $("#login-msg").text("OTP is successfully sent to Owner's mail")
                $("#otp-btn").text("Resend OTP")
                $("#reset_opt").prop('disabled',false)
                $("#admin_unicode").prop('disabled',false)
                $("#admin_key").prop('disabled',false)
                $("#signup-send").prop('disabled',false)
            }else{
                $("#login-msg").text("Sorry we are having some mailing issues try again in sometime !!")
            }
            
        }
    });
    
}


function add_to_fav(book_id){
    if($("."+book_id).css("color")=="rgb(252, 127, 169)" || $("."+book_id+"-fav").css("color")=="rgb(252, 127, 169)"){
        $("."+book_id).css("color","rgb(204,0, 85)")
        $("."+book_id+"-fav").css("border-color","rgb(204,0, 85)")
        $("."+book_id+"-fav").css("color","rgb(204,0, 85)") 
        $("."+book_id+"-fav i").removeClass('fa-heart').addClass('fa-check-circle');
    }
    else{

        $("."+book_id).css("color","rgb(252, 127, 169)")
        $("."+book_id+"-fav").css("border-color","rgb(252, 127, 169)")
        $("."+book_id+"-fav").css("color","rgb(252, 127, 169)")
        $("."+book_id+"-fav i").addClass('fa-heart').removeClass('fa-check-circle');

    }
    $.ajax({
        url: '/addTofav/'+book_id,
        method: 'POST',
        contentType: 'application/json',
        success: function(response) {
            
                if(response=="unauthorized") {
                    window.location.href="/login-error"
                }
                else if(response=="deleted"){
                    $("#snackbar").text("Book Removed from favourite")
                    myFunction()
                    if((location.href).indexOf('.com/mybooks')>1){
                      $("#"+book_id).css("display","none")
                    }
                    $("."+book_id).css("color","rgb(252, 127, 169)")
                    $("."+book_id+"-fav").css("border-color","rgb(252, 127, 169)")
                    $("."+book_id+"-fav").css("color","rgb(252, 127, 169)")
                    $("."+book_id+"-fav i").addClass('fa-heart').removeClass('fa-check-circle');


                }
                else if(response=="deleted_empty"){
                    if((location.href).indexOf('.com/mybooks')>1){
                      $("#list_fav_books").html(`<div id="no_favbooks">
                        <i class="fas fa-frown fa-4x"></i>
                        <h2>No favourite books added to your list</h2>
                      </div>
                      <!--<style>
                            footer{
                              text-align: center;
                              background: none;
                              position: fixed;
                              bottom:0px;
                              width: 100%;
                            }
                            @media(max-height:840px){
                                 footer{
                                  text-align: center;
                                  background: none;
                                  position: relative;
                                  bottom:-15px;
                                  width: 100%;
                                }
                            }
                        </style>-->`)

                        $("#snackbar").text("Book Removed from favourite")
                        myFunction();

                    }
                    $("."+book_id).css("color","rgb(252, 127, 169)")
                    $("."+book_id+"-fav").css("border-color","rgb(252, 127, 169)")
                    $("."+book_id+"-fav").css("color","rgb(252, 127, 169)")
            
                }
                else if(response=="added"){
                    $("#snackbar").text("Book added to favourite")
                    myFunction();
                    $("."+book_id).css("color","rgb(204,0, 85)")
                    $("."+book_id+"-fav").css("border-color","rgb(204,0, 85)")
                    $("."+book_id+"-fav").css("color","rgb(204,0, 85)")
                }
        }
    });
}
window.addEventListener('offline', function(e) { console.log('offline'); });
window.addEventListener('online', function(e) { console.log('online'); });

window.addEventListener('load', () => {

    if(window.navigator.onLine){
        console.log("Connection Established with server successfully")
    }else{
        console.log("No internet !!")
    }

    $.ajax({
        url:'/private/user_detail',
        method: 'GET',
        success: function(response) {
            if(response!="unauthorized"){
                $("#icon").html(`<img src="${response.userimage}" width="42px" title="account details" style="border-radius:50%;position:relative;bottom:9px;" onclick="location.href='/user/${response._id}'" alt="user-image">`)
                $(".nav-icon").html(`<img src="${response.userimage}" title="account details" width="38px" style="border-radius:50%;position:relative;top:10px;left:12px;" onclick="location.href='/user/${response._id}'" alt="user-image">`)
                response.fav_books.forEach(function(favBook){
                    $("."+favBook.book_id).css("color","rgb(204,0, 85)")   
                    $("."+favBook.book_id+"-fav").css("color","rgb(204,0, 85)")
                    $("."+favBook.book_id+"-fav").css("border-color","rgb(204,0, 85)")
                    $("."+favBook.book_id+"-fav i").addClass('fa-check-circle').removeClass('fa-heart');
                })
                function notifyMe(){
                    Notification.requestPermission().then(function(result) {
                        if(result=="granted"){
                            console.log("Notifications granted")
                        }else{
                            showToast()
                            console.log("Notifications not granted")
                        }
                    });
                }
                notifyMe();
            }
        }
    });
    $.ajax({
        url:'/private/api_detail',
        method: 'GET',
        success: function(response) {
            if(response.api_status=="enabled"){
                $('.apikey .switch #toggle-2').prop("checked", true);
                $('#api-section .apikey span').css('display','inline-block')
            }else{
                $('.apikey .switch #toggle-2').prop("checked", false);
                $('#api-section .apikey span').text("enable the api to get its access")
            }
        }
    });
})
function favbooks(){
    $.ajax({
        url:'/private/user_detail',
        method: 'GET',
        success: function(response) {
            if(response!="unauthorized"){
                $("#icon").html(`<img src="${response.userimage}" width="42px" title="account details" style="border-radius:50%;position:relative;bottom:9px;" onclick="location.href='/user/${response._id}'" alt="user-image">`)
                $(".nav-icon").html(`<img src="${response.userimage}" title="account details" width="38px" style="border-radius:50%;position:relative;top:10px;left:12px;" onclick="location.href='/user/${response._id}'" alt="user-image">`)
                response.fav_books.forEach(function(favBook){
                    $("."+favBook.book_id).css("color","rgb(204,0, 85)")   
                    $("."+favBook.book_id+"-fav").css("color","rgb(204,0, 85)")
                    $("."+favBook.book_id+"-fav").css("border-color","rgb(204,0, 85)")
                    $("."+favBook.book_id+"-fav i").addClass('fa-check-circle').removeClass('fa-heart');
                })
            }
        }
    });
}

function books_under_review(){
    $.ajax({
        url:'/admin/books_under_review',
        method: 'GET',
        success: function(response) {
            if(response!="unauthorized"){
                response.forEach((book)=>{                   
                    $("#"+book.book_id+" .isreviewed").html(`<button onclick="location.href='/admin/under-review?book_id=${book.book_id}'" class="floating-add2"><i class="fas fa-clipboard-list fa-2x"></i></button>`)
                })  
            }else{
                alert("Unauthorized access !!")
            }
        }
    });
}


$("#post-review").on('submit',(event)=>{
  
    event.preventDefault();
    message=$("#review-msg-input").val();
    book_id=$("#book_id_reviewed").val();
    
    $.ajax({
        url:'/review/'+book_id+'/'+message,
        method: 'POST',
        success: function(response) {
        
            if(response=="unauthorized") {
                window.location="/login-error"
            }
            else{
                playpop();
                str=""

                response.reviews.forEach(function(review){
                    str+=`<div class="comment-post">
                     <p>${review.message}<span> -by ${review.user_commented} ~ ${review.time}</span></p>
                    </div>`
  
                })
                $("#comments").html(str)
               
                message=$("#review-msg-input").val("");
            }
        }
    });
})

$(".submitfd").on("submit",(event)=>{
    event.preventDefault();
    const feedtxt=$("#feedtxt").val()
    $.ajax({
        url: '/feedback/'+feedtxt,
        method: 'POST',
        contentType: 'application/json',
        success: function(response) {
            console.log(response)
            $("#feedtxt").val("")
            var audio=new Audio("../sounds/success.mp3");
            audio.play();
            alert("Thanks for your feedback!, we will try to improve our site")
            $("#f-btn").click()

        }
    });
})

function addmember(id){

    isconfirm=confirm("Are you sure you want to make this person our member")
    if(isconfirm){
        $.ajax({
        url: '/admin/addmember/'+id,
        method: 'PATCH',
        success: function(response) {
            if(response!="unauthorized"){
                $("#snackbar").text("Successfully added as member")
                myFunction();
                $("."+id+" .member_btn").html(`<i class="fas fa-user-minus"></i>`);
                location.reload();
                
            }else{
                alert("Unauthorized access !!")
            }
        }
        });

    }
}
function removecontact(id){

    isconfirm=confirm("Are you sure you want to remove this message without any reply !")
    if(isconfirm){
        $.ajax({
        url: '/admin/removemsg/'+id,
        method: 'DELETE',
        success: function(response) {
            if(response!="unauthorized"){
                $("#snackbar").text("Message removed Successfully.")
                myFunction();
                $("#"+id).css('display','none')
                if(response.length==1){
                    $("#messages-section").html(`<div id="no_favbooks">
                    <i class="fas fa-frown fa-4x"></i>
                    <h2>No new message !</h2>
                    </div>
                    <!--<style>
                        footer{
                          text-align: center;
                          background: none;
                          position: fixed;
                          bottom:0px;
                          width: 100%;
                        }
                        @media(max-height:840px){
                             footer{
                              text-align: center;
                              background: none;
                              position: relative;
                              bottom:-15px;
                              width: 100%;
                            }
                        }
                    </style>-->`)
                
                }
            }
        }
        });

    }
}
function removemember(id,unicode){
    if(unicode!=""){
        key=prompt("Enter admin's key :")
        if(key){isconfirm=confirm("Are you sure you want to remove this admin")}else{isconfirm=false}
        if(isconfirm){
            $.ajax({  
            url: '/admin/removeadmin/'+id+'/'+key,
            method: 'DELETE',
            success: function(response) {
                if(response!="unauthorized"){
                    $("#snackbar").text("Successfully removed admin")
                    myFunction();
                    $("."+id+" .member_btn").html(`<i class="fas fa-user-plus"></i>`);
                    location.reload();
                    
                }else{
                    alert("Unauthorized access !!")
                }
            }
            });
    
        }
        
    }else{
        isconfirm=confirm("Are you sure you want to remove this member")
        if(isconfirm){
            $.ajax({
            url: '/admin/removemember/'+id,
            method: 'DELETE',
            success: function(response) {
                if(response!="unauthorized"){
                    $("#snackbar").text("Successfully removed member")
                    myFunction();
                    $("."+id+" .member_btn").html(`<i class="fas fa-user-plus"></i>`);
                    location.reload();
                    
                }else{
                    alert("Unauthorized access !!")
                }
            }
            });
    
        }
        
    }
    

}
function submitwr(){
    $.ajax({
        url: '/request_withdraw',
        method: 'POST',
        data: $(".submitwr form").serialize(),
        success: function(response) {
            console.log(response)
            if(response=="sent"){
                var audio=new Audio("../sounds/success.mp3");
                audio.play();
                myFunction();
                $("#f-btn").click();
            }else{
                alert("Cannot proceed request due to low credits. Minimum 100 credits are required to request withdraw.")
                $("#f-btn").click();
            }

        }
    });
    return true;
}
function submitusr(userID){
    isconfirm=confirm("Are you sure you want to edit !")
    if(isconfirm){
        $.ajax({
            url: '/admin/edit_user/'+userID,
            method: 'POST',
            data: $("."+userID+" .editCredits form").serialize(),
            success: function(response) {
                console.log(response)
                if(response!="unauthorized"){
                    myFunction();
                    showcredit(userID)
                    $("."+userID+" .stats .credits").html(`<img src="/images/coin.png" alt="">${response.account_record.credits} credits`)
                }else{
                    alert("Unauthorized access !!")
                }
            }
        });
        return true;
    }
    else{
        return false;
    }
}
function submitmsg(userID){
    isconfirm=confirm("Are you sure you want to send a message !")
    if(isconfirm){
        $.ajax({
            url: '/admin/notify_user/'+userID,
            method: 'POST',
            data: $("."+userID+" .sendMsg form").serialize(),
            success: function(response) {
                console.log(response)
                if(response!="unauthorized"){
                    $("#snackbar").text("Message sent to user successfully")
                    myFunction();
                    shownotify(userID)
                }else{
                    alert("Unauthorized access !!")
                }
            }
        });
        return true;
    }
    else{
        return false;
    }
}
function removemsg(msgID){
    
    $.ajax({
        url: '/user/remove_msg/'+msgID,
        method: 'DELETE',
        success: function(response) {
            console.log(response)
            if(response!="unauthorized"){
                $("#snackbar").text("Notification removed")
                $("."+msgID).css("display", "none")
                if(response=="deleted_empty"){
                    $(".notificationCenter").html(`<h4 align="center"><i class="fas fa-info-circle"></i> Notifications</h4>
                    <div class="notification" style="text-align:center;background:none;">
                    <p>No new notifications yet!!</p>
                </div>`)
                }
                myFunction();
                shownotify(userID)
            }else{
                alert("Unauthorized access !!")
            }
        }
    });
    return true;
}

function toggle_api(){   
    $.ajax({
        url: '/api/toggle',
        method: 'PATCH',
        success: function(response) {
            console.log(response)
            if(response!="unauthorized"){
                if(response=="disabled"){
                    $("#snackbar").text("API disabled");
                    myFunction();
                    $('.apikey .switch #toggle-2').prop("checked", false);
                    $('.api_key_status').html(`enable the api to get its access<span><i class="fas fa-link"></i></span>`)

                }else{
                    $("#snackbar").text("API enabled");
                    myFunction();
                    $('.apikey .switch #toggle-2').prop("checked", true);
                    $('.api_key_status').html(`${response}<span><i class="fas fa-link"></i></span>`)
                    $('#api-section .apikey span').css('display','inline-block')
                }

            }else{
                $('.apikey .switch #toggle-2').prop("checked", false);
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
$(".copy_code").on('click',function copy_code(){
    navigator.clipboard.writeText($(this).closest(".code_block").find(".code_txt").text());
    $('#snackbar').text('code copied to clipboard')
    myFunction();
})


function playerror(){
    var audio=new Audio("../sounds/error.mp3");
    audio.play();
}
function playsuccess(){
    var audio=new Audio("../sounds/success.mp3");
    audio.play();
}
function playpop(){
    var audio=new Audio("../sounds/pop.mp3");
    audio.play();
}

auth=""
function checkAuth(status){
   auth=status 
}


$("#upld-form").ajaxForm({
    beforeSend:function(){
        if(auth=="block"){
          window.location.href="/login-error"
        }
        else{
          $("#upload-btn").prop("disabled",true)
        }
    },
    uploadProgress:function(event,position,total,percentComplete){
        var percentVal = percentComplete +"%";
        $("#progress-percent").css("display","");
        $(".progress").css("display","");
        $("#progress-percent").text(percentVal)
        $(".bar").css("width",percentVal);
    },
    complete:function(xhr){          
        $(".progress").css("display","none");
        $("#progress-percent").css("display","none")

        $(".status").css("display","");
        console.log("upload-complete")
        setTimeout(function(){ 
            if((window.location.href).indexOf('upload_edit')>0){
                window.location.href="/admin-success"
              
            }else{
                window.location.href="/success"
            }
        },2000);
    }
});
// var perfEntries = performance.getEntriesByType("navigation");
// var location=location.href

// if ((perfEntries[0].type === "back_forward") ){
//     location.reload(true);
// }

function remove_book(book_id){
    var isConfirm=confirm("Are you sure you want to remove this book")
    if(isConfirm){
        $.ajax({
            url: '/delete/'+book_id,
            method: 'DELETE',
            contentType: 'application/json',
            success: function(response) {
                console.log(response);
                if(response=="unauthorized"){
                    window.location.href="/admin-login-err";
                }
                else{
                    $("#"+book_id).css('display', 'none');
                    $('#snackbar').text('Book deleted successfully')
                    myFunction()
                }
            }
        });

    }
}


function review_book(book_id){
    var isConfirm=confirm("Are you confirm to remove this from review section ? ")
    if(isConfirm){
        $.ajax({
            url: '/delete_under_review/'+book_id,
            method: 'DELETE',
            contentType: 'application/json',
            success: function(response) {
                if(response=="unauthorized"){
                    window.location.href="/admin-login-err";
                }
                else{
                    console.log(response)
                    $("#"+book_id).css('display', 'none');
                    myFunction()
                    if(response.length<=1){
                        $("#book_review_section").html(`<div id="no_favbooks">
                        <i class="fas fa-frown fa-4x"></i>
                        <h2>No new books to review</h2>
                        </div>
                        <!--<style>
                            footer{
                              text-align: center;
                              background: none;
                              position: fixed;
                              bottom:0px;
                              width: 100%;
                            }
                            @media(max-height:840px){
                                 footer{
                                  text-align: center;
                                  background: none;
                                  position: relative;
                                  bottom:-15px;
                                  width: 100%;
                                }
                            }
                        </style>-->`)
                    }
                    
                }
            }
        });

    }
}
function add_to_review(book_id,book_category,book_name){
    var isConfirm=confirm("Are you sure, want to review again ? ")
    if(isConfirm){
        $.ajax({
            url: '/admin/add_to_review/'+book_id+'/'+book_category+'/'+book_name,
            method: 'GET',
            contentType: 'application/json',
            success: function(response) { 
                // $("#"+book_id).css('display', 'none');
                $('#snackbar').text('Successfully added to review section')
                $("#"+book_id+" .isreviewed").html(`<button onclick="location.href='/admin/under-review?book_id=${book_id}'" class="floating-add2"><i class="fas fa-clipboard-list fa-2x"></i></button>`)

                myFunction()
            }
        });

    }
}

// recapache 
// function onSubmit(token) {
//     document.getElementById("demo-form").submit();
// }

$("#filterbtn").on('click',()=>{
    $("#filter_results").toggle(200)
})

function myFunction() {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); },3000);
}
function request(){
    $.ajax({
        url: '/request_access',
        method: 'GET',
        contentType: 'application/json',
        success: function(response) {
            console.log("response :"+response);
            if(response=="Email sent"){
                $('#snackbar').text('Request sent successfully to our team')
                myFunction()
            }
            else{
                console.log("error")
            }
        }
    });
}

// $("#reply_frm").on('submit',(e)=>{
//     e.preventDefault()
//     
// })

function send_reply(id){
    $.ajax({
        type: "POST",
        url: '/admin/reply',
        data: $("#"+id+" form").serialize(), // serializes the form's elements.
        success: function(response){
           
           if(response.status=="reply_sent"){
               $('#snackbar').text('Reply Sent Successfully');
               myFunction()
               
               $("#"+id).css('display','none')
               if(response.length==1){
                    $("#messages-section").html(`<div id="no_favbooks">
                    <i class="fas fa-frown fa-4x"></i>
                    <h2>No new message !</h2>
                    </div>
                    <!--<style>
                        footer{
                          text-align: center;
                          background: none;
                          position: fixed;
                          bottom:0px;
                          width: 100%;
                        }
                        @media(max-height:840px){
                             footer{
                              text-align: center;
                              background: none;
                              position: relative;
                              bottom:-15px;
                              width: 100%;
                            }
                        }
                    </style>-->`)
                    return true
               }
           }
           else{
               console.log(response);
               return false
           }

        }
    });
}

if((location.href).indexOf('/admin')>0){
    $(".home_link_for_admins").text("Home")
    $(".home_link_for_admins").attr("href","/home")
}

$("#upld-form").on("keypress",function(e){
    if(e.key==="Enter"){
        e.preventDefault();
    }
});

function tagSelections(){
    if($("#tgtype option").filter(':selected').text()=="custom"){
        $(".customTag").css("display","block");
    }else{
        $(".customTag").css("display","none");
    }
}