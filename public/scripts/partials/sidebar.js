$('.sub-btn').click(function(){
    $(this).next('.sub-menu').slideToggle()
    $(this).find('.dropdown-bar').toggleClass('rotate')
})
$(".menu-btn").click(function(){
    $(".side-bar").addClass("show-sidebar");
    // $(".menu-btn").css("visibility","hidden")
})
$(".close-btn").click(function(){
    $(".side-bar").removeClass("show-sidebar");
    // $(".menu-btn").css("visibility","visible")

})
$(".nav-search-icon").click(function(){
    $(".nav-search-input").toggle(300)

})

