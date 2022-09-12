$.ajax({
    url:'/private/api_detail',
    method: 'GET',
    success: function(response) {
        if(response.api_status=="enabled"){
            $('.apiToggler .switch #toggle-2').prop("checked", true);
            $('#api-section .apikey span').css('display','inline-block')
        }else{
            $('.apiToggler .switch #toggle-2').prop("checked", false);
            $('#api-section .apikey span').text("enable the api to get its access")
        }
    }
});

function toggle_api(){   
    $.ajax({
        url: '/api/toggle',
        method: 'PATCH',
        success: function(response) {
            console.log(response)
            if(response!="unauthorized"){
                if(response=="disabled"){
                    $("#snackbar").text("API disabled");
                    $('.apiToggler .switch #toggle-2').prop("checked", false);
                    $('.api_key_status').html(`enable the api to get its access<span><i class="fas fa-link"></i></span>`)
                    myFunction();
                }else{
                    $("#snackbar").text("API enabled");
                    $('.apiToggler .switch #toggle-2').prop("checked", true);
                    $('.api_key_status').html(`${response}<span><i class="fas fa-link" onclick="copy_apikey('${response}')"></i></span>`)
                    $('#api-section .apikey span').css('display','inline-block')
                    myFunction();

                }

            }else{
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
$(".copy_code").on('click',function copy_code(){
    navigator.clipboard.writeText($(this).closest(".code_block").find(".code_txt").text());
    $('#snackbar').text('code copied to clipboard')
    myFunction();
})