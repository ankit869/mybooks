var category="";
var subcategory="";
var objId="";
var isSelected=false;
var categories=[]


function initialize_selection(){
  const selectedAll = document.querySelectorAll(".selected-upt");
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
      if(book_type_id=="#bachelorofcommercebcom" || book_type_id=="#others" || book_type_id=="#novelorfiction" || book_type_id=="#bachelorsofbusinessadministrationbba" || book_type_id=="#bachelorsofcomputerapplicationbca" || book_type_id=="#bachelorofeducationbed"){
          category=selected.innerHTML;
          subcategory=selected.innerHTML;
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
          category=selected.innerHTML;
          subcategory=""
          if(document.cookie.indexOf('temp_category=')){
            temp_category=document.cookie["temp_category"]
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
        }else{
          subcategory=selected.innerHTML;
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

}

function addcategory(){
  isFound=false;
  if(category!=="" && subcategory!==""){ 
    for(i=0;i<categories.length;i++){
      if(categories[i].category==category && categories[i].subcategory==subcategory){
        isFound=true;
      }
    }
    if(!isFound){
      objId=Date.now();
      let category_html;
      if(category===subcategory){
        category_html=`<div class="catgry_view" onclick="showSubcat(this)">
          <i onclick="this.parentElement.remove();removecategory('${objId}')" class="fa fa-times removecat" aria-hidden="true"></i>
          <p class="catgry" >&nbsp;&nbsp;${category}</p>
        </div>`
      }else{
        category_html=`<div class="catgry_view" onclick="showSubcat(this)">
          <i onclick="this.parentElement.remove();removecategory('${objId}')" class="fa fa-times removecat" aria-hidden="true"></i>
          <p class="catgry"><i class="fas fa-caret-right" aria-hidden="true" ></i>&nbsp;&nbsp;${category}</p>
          <p class="sub_catgry">•&nbsp;${subcategory}</p>
        </div>`
      }
      var ctgryObj={
        id:objId,
        category:category,
        subcategory:subcategory
      };
      if(categories.length<=7){
        ct_refresher();
        initialize_selection();
        categories.push(ctgryObj);
        $("input[name='categories']").val(JSON.stringify(categories));
        $(".catgry_div").append(category_html)
        category="";
        subcategory="";
        category_html="";
      }else{
        $("#snackbar").text(`Only 8 or less categories can be selected at a time!!`)
        myFunction();
      }
      
    }else{
      $("#snackbar").text(`This category has already been added !!`)
      myFunction();
    }
    
  }else if(category!=="" && subcategory==""){
    $("#snackbar").text(`Please choose the subcategory for ${category} !!`)
    myFunction();
  }else{
    $("#snackbar").text(`Please choose the category !!`)
    myFunction();
  }
}
function removecategory(id) {
  for(i=0;i<categories.length;i++){
    if(categories[i].id==id){
      categories.splice(i,1)
      $("input[name='categories']").val(JSON.stringify(categories));
    }
  }
}

function showSubcat(item){
  $(item).closest(".catgry_view").find("i").toggleClass("rotateTo90")
  $(item).closest(".catgry_view").find(".sub_catgry").slideToggle()
}

initialize_selection();

