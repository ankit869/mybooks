
module.exports=getDate;
function getDate(){
    const options = { month: 'long',day: 'numeric', year:'numeric' };
    const today  = new Date();
    const day=today.toLocaleDateString("en-US", options); // Saturday, September 17, 2016
    return day;
}


