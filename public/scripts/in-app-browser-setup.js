var ua = navigator.userAgent || navigator.vendor || window.opera;
//var isInapp = (ua.indexOf('Instagram') > -1 || (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1)) ? true : false;
var isInapp =true;
var isInapp = (ua.indexOf('Build') > -1 && ua.indexOf('MiuiBrowser')<0) ? true : false;
console.log(ua)
if (isInapp) {
    var head = document.querySelector('head');
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = "/css/in-app.css";
    head.appendChild(link);        
}
if((location.href).indexOf('/doc_scanner')>0 || (location.href).indexOf('/doc-scanner')>0){
    var FB_INSTA = (ua.indexOf('Instagram') > -1 || (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1)) ? true : false;
    if(FB_INSTA){
        alert("Warning !! this feature is not support in this browser, try chrome or google for the better results.")
    }
}
