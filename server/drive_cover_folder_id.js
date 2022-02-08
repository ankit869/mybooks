module.exports=find_folder;

function find_folder(course){
   folderID=""
   switch(course){
       case "Pre-primary":folderID="1LJXwUBR5PBoVxT8YoEpcv9BrYpsnZiUb";break;
       case "Primary":folderID="1Q0UgzrXFuIcakbkVvCT474p0VKfHU4nh";break;
       case "Secondary":folderID="1YdsZwDSZOcGqfPdoQ5_t9dh8QoCO61D_";break;
       case "Bachelor of Arts (BA)":folderID="1h2NtVHAsUZ3pKFo5mdBGxfNz_IWL_Hfa";break;
       case "Bachelor of Science (B.Sc)":folderID="1foRwXxAavmdzrzCB8eSi_vB1jjvIgN3V";break;
       case "Bachelor of Commerce (B.Com)":folderID="19OZrRzsbAwd18CIDFRfwbtQmFDmHDPxj";break;
       case "Bachelors of Business Administration (BBA)":folderID="1i0woG_mAWeliVSqPtw8CIWmZ42-UMITB";break;
       case "Bachelors of Computer Application (BCA)":folderID="1BhGZPH3jgV-I6S1tWQ0SFwNJ00O-6A4d";break;
       case "Bachelor of Education (B.Ed)":folderID="1ixL9xPVwcFclx7aZtIKF15El986SKWQV";break;
       case "Bachelor of Technology (B.Tech)":folderID="1VdhUZGs-FNyo3O7WUX2HaPB4Q6kB8HLL";break;
       case "Post Graduation / Master Degree":folderID="1rY1kFnkQYduWKkyeIHZQwxIaNMVW1ho7";break;
       case "Competetive Exams":folderID="1BK7M1STk54o5sxbFcDtIzmfzJbfF20R6";break;
       case "Diploma":folderID="1L66Gg0qUhoi0ZcXJ0_guCcmuLUTTTuN0";break;
       case "Novel or Fiction":folderID="1fkUUUzSn59wG43AhJnfFURyNeMrQKLpC";break;
       case "Others":folderID="1XPIwiRU5-9FtwjTtgrzmNfAxtgUOL6eA";break;
   } 
   return folderID;
}