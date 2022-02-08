module.exports=find_folder;

function find_folder(course){
   folderID=""
   switch(course){
       case "Pre-primary":folderID="11eJrjKyTVtGgKvm8opu-wPPbU68ivG_5";break;
       case "Primary":folderID="1r6J1JvwOtGxLjjFJU-bK00d2WmIvRlHp";break;
       case "Secondary":folderID="1A8fHhZ_Mm4PE0y-Nt06V4zHmpDO1ajK3";break;
       case "Bachelor of Arts (BA)":folderID="1ybrheXFE23mt83mknOu3em6SU1XkSOqD";break;
       case "Bachelor of Science (B.Sc)":folderID="1Uzrd2Su7sjbsH7ymSmRT2Qw4SJulF4bI";break;
       case "Bachelor of Commerce (B.Com)":folderID="1Q3PUPtHpPuTuW1K3dRcF1k_fCTJdVoBl";break;
       case "Bachelors of Business Administration (BBA)":folderID="1w6uvOaDlDSaOb8mqTGWsdVx0iOgcMSVT";break;
       case "Bachelors of Computer Application (BCA)":folderID="173a01bKSpYLfpU4PkFdMNZnB3SExJAqY";break;
       case "Bachelor of Education (B.Ed)":folderID="1Vla9dZRs1E9mHtsbU7rw7UjHUFyWQLAz";break;
       case "Bachelor of Technology (B.Tech)":folderID="1nXYAMReIWW_VwO_pDXEfu-Cg3raRxmRm";break;
       case "Post Graduation / Master Degree":folderID="11TjG-buqt4ENXyPAVGxp_hKenBYvmMy7";break;
       case "Competetive Exams":folderID="1gTFI2XTV1KZKpOgRERcidrUk6D5elQkB";break;
       case "Diploma":folderID="1gN2FNxM-MDTFOR4KwwPCgcqHmmilcBqn";break;
       case "Novel or Fiction":folderID="1UyQFrL2NRQAdhqlMKlaUBE3A_n51YFzn";break;
       case "Others":folderID="1aw4L6mOCCfyu5iMcCZjb6Nr2bvalvh2X";break;
   } 
   return folderID;
}