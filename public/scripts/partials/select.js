const selectedAll = document.querySelectorAll(".selected");

selectedAll.forEach((selected) => {
  const optionsContainer = selected.previousElementSibling;
  const searchBox = selected.nextElementSibling;

  const optionsList = optionsContainer.querySelectorAll(".option");

  selected.addEventListener("click", () => {
    // console.log("im clicked")
    if (optionsContainer.classList.contains("active")) {
      optionsContainer.classList.remove("active");
    } else {
      let currentActive = document.querySelector(".options-container.active");

      if (currentActive) {
        currentActive.classList.remove("active");
      }

      optionsContainer.classList.add("active");
    }

    searchBox.value = "";
    filterList("");

    if (optionsContainer.classList.contains("active")) {
      searchBox.focus();
    }
  });
  
  optionsList.forEach(function(o){
    o.addEventListener("click", function(){
      selected.innerHTML = o.querySelector("label").innerHTML;
      
      this.firstElementChild.checked="on"
      optionsContainer.classList.remove("active");
      var term=selected.innerHTML
      var selectedTerm = selected.innerHTML.toLowerCase();
      selectedTerm = selectedTerm.replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g, '');
      var book_type_id=String("#"+selectedTerm);

      if(book_type_id=="#bachelorofcommercebcom" || book_type_id=="#others" || book_type_id=="#novelorfiction" || book_type_id=="#bachelorsofbusinessadministrationbba" ||    book_type_id=="#bachelorsofcomputerapplicationbca" || book_type_id=="#bachelorofeducationbed"){

          $("#other-course").prop("checked", true)
          $("#other-course").prop("value", selected.innerHTML)
          document.cookie = "temp_category="+book_type_id;
          $(".sub-select").each(function(i,obj){
            var obj_id=String("#"+obj.id);
            if(obj.id==selectedTerm){
              $(obj_id).css("display","block")
            }
            else{
              $(obj_id).css("display","none")
            }
            
          })
      }else{
        if(o.firstElementChild.name=="category"){
          
          if(document.cookie.indexOf('temp_category')){
            temp_category=getCookie("temp_category")
            if($("input[name='category']:checked").val()!=temp_category){
               $("input[name='sub_category']:checked").prop('checked', false)
               document.cookie = "temp_category=none ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
            }
          }
          document.cookie = "temp_category="+book_type_id;
          $(".sub-select").each(function(i,obj){
            var obj_id=String("#"+obj.id);
            if(obj.id==selectedTerm){
              $(obj_id).css("display","block")
            }
            else{
              $(obj_id).css("display","none")
            }
            
          })
        }
      }
     
    });
    
  });
    
  searchBox.addEventListener("keyup", function (e) {
    filterList(e.target.value);
  });

  const filterList = (searchTerm) => {
    searchTerm = searchTerm.toLowerCase();
    searchTerm = searchTerm.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    optionsList.forEach((option) => {
      let label = option.firstElementChild.nextElementSibling.innerText.toLowerCase();
      label = label.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
      if (label.indexOf(searchTerm) != -1) {
        option.style.display = "block";
      } else {
        option.style.display = "none";
      }
    });
  };
});


