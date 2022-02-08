
function toggle_dialog(){
    $('#advanced_editing_dialog').toggle();
}

function start_editing(image) {
    try {
       
        var canvas = document.getElementById("editor_canvas");
        var ctx = canvas.getContext("2d");

        var filter = new WebGLImageFilter();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#101012';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillText("Loading...", canvas.width/2, canvas.height/2);
        const img=new Image();
        var filteredImage;

        // img.src=img_compressor($(image).closest(".figure").find(".scanned_img").attr("src"),'image/webp')
        img.src=$(image).closest(".figure").find(".scanned_img").attr("src")
        // console.log(img.src.length+'Kb')

        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            canvas.removeAttribute("data-caman-id");
        };
        
        $("#brightness_rng").on("change",function() {
            filter.resetSpecific('brightness')
            value=$("#brightness_rng").val()
            filter.addFilter('brightness',value)
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);
        })

        $("#contrast_rng").on("change",function() {
            filter.resetSpecific('contrast')
            value=$("#contrast_rng").val()
            filter.addFilter('contrast',value)
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })

        $("#saturation_rng").on("change",function() {
            filter.resetSpecific('saturation')
            value=$("#saturation_rng").val()
            filter.addFilter('saturation',value)
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })

        $("#hue_rng").on("change",function() {
            filter.resetSpecific('hue')
            value=$("#hue_rng").val()
            filter.addFilter('hue',value)
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })

        $("#brownie-add").click(function() {
            
            filter.addFilter('brownie')
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })
        $("#sepia-add").click(function() {
           
            filter.addFilter('sepia')
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })
        $("#sharpen-add").click(function() {
            
            filter.addFilter('sharpen')
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })
        $("#emboss-add").click(function() {
            
            filter.addFilter('emboss')
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })
        $("#detect-edges").click(function() {
            
            filter.addFilter('detectEdges')
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })
        $("#polaroid-add").click(function() {
            
            filter.addFilter('polaroid')
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })
        $("#technicolor-add").click(function() {
            
            filter.addFilter('technicolor')
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })
        $("#pinhole-add").click(function() {
            
            filter.addFilter('vintagePinhole')
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })
        $("#desaturate-add").click(function() {
            
            filter.addFilter('desaturate')
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })
        $("#kodachrome-add").click(function() {
            
            filter.addFilter('kodachrome')
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })
        $("#negative-add").click(function() {
            
            filter.addFilter('negative')
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })
        $("#pixelate-add").click(function() {
            
            filter.addFilter('shiftToBGR')
            filteredImage = filter.apply(img);
            $.LoadingOverlay("hide");
            ctx.drawImage(filteredImage,0,0);

        })
        $("#revert-btn").click(function() {
            $.LoadingOverlay("show",{
                background  : "#3c436cc7"
            });

            setTimeout(function(){
                filter.reset()
                filteredImage = filter.apply(img);
                $.LoadingOverlay("hide");
                ctx.drawImage(filteredImage,0,0);
                $("#brightness_rng").val("1")
                $("#contrast_rng").val("1")
                $("#saturation_rng").val("0")
                $("#hue_rng").val("1")

            },300)

        })
        $("#editdone-btn").click(function() {
            $.LoadingOverlay("show",{
                background  : "#3c436cc7"
            });
            canvas.toBlob(async function (blob) {
                const options = { 
                    maxSizeMB: 0.3,      
                    maxWidthOrHeight: 1280,
                }
                const compressedFile = await imageCompression(blob, options);
                let fileURL=URL.createObjectURL(compressedFile)
                $(image).closest(".figure").find(".scanned_img").attr("src",fileURL)
                $.LoadingOverlay("hide");
                $('#advanced_editing_dialog').css("display","none")
                $("#brightness_rng").val("1")
                $("#contrast_rng").val("1")
                $("#saturation_rng").val("0")
                $("#hue_rng").val("1")
                image="";
            })
        })
        $(".closedialog-btn").click(function(){
            $('#advanced_editing_dialog').css("display","none");
            $("#brightness_rng").val("1")
            $("#contrast_rng").val("1")
            $("#saturation_rng").val("0")
            $("#hue_rng").val("1")
            image="";
        })
        $(".closedialog_btn").click(function(){
            $('#advanced_editing_dialog').css("display","none");
            $("#brightness_rng").val("1")
            $("#contrast_rng").val("1")
            $("#saturation_rng").val("0")
            $("#hue_rng").val("1")
            image="";
        })
    }
    catch( err ) {
        ctx.fillStyle = '#101012';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        console.log(err)
        ctx.fillText("This browser doesn't support WebGL", canvas.width/2, canvas.height/2);
        return;
    }
}


function img_compressor(imgSrc,mimetype,quality){
    newImg=new Image();
    newImg.src=imgSrc;
    let cvs = document.createElement('canvas');
    let ctx2=cvs.getContext('2d')
    cvs.width = newImg.width;
    cvs.height = newImg.height;
    ctx2.drawImage(newImg, 0, 0, newImg.width, newImg.height);
    return cvs.toDataURL(mimetype,quality)
}