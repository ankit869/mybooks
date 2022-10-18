var category="";
var subcategory="";
var objId="";
var isSelected=false;
var categories=[]
var authors=[]
var tags=[]

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
          if(getCookie("temp_category")){
            temp_category=getCookie("temp_category")
            if($("input[name='category']:checked").val()!=temp_category){
               $("input[name='sub_category']:checked").prop('checked', false)
               setCookie("temp_category","none","Thu, 01 Jan 1970 00:00:00 GMT");
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
      objId=category+Date.now();
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
        $(".cat_div").css("display","block")
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
  if(categories.length==1){
    $(".cat_div").css("display","none")
  }
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

function addauthor(){
  authname={
    id:$(".authorInput .authorname").val()+Date.now(),
    name:$(".authorInput .authorname").val()
  }
  isFound=false;
  if(authname.name!==""){ 
    for(i=0;i<authors.length;i++){
      if(authors[i].name==authname.name){
        isFound=true;
      }
    }
    if(!isFound){
      if(authors.length>8){
        $("#snackbar").text(`Maximum 8 authors can be seleted at a time !!`)
        myFunction();
      }else{
        
        authors.push(authname)
       
        $(".auth_div").css("display","block")
        author_html=`<div class="author_view">
            <i onclick="this.parentElement.remove();rem_author('${authname.id}')" class="fa fa-times rem_author" aria-hidden="true"></i>
            <p class="auth_name">&nbsp;${authname.name}</p>
          </div>`
        
        $(".author_div").append(author_html)
        $("input[name='authors']").val(JSON.stringify(authors));
        $(".authorInput .authorname").val('')
      }
    }else{
      $("#snackbar").text(`This author has already been added !!`)
      myFunction();
    }
  }else{
    $("#snackbar").text(`Please enter the author name !!`)
    myFunction();
  }
}

var authinput = $(".authorInput");

// Execute a function when the user releases a key on the keyboard
authinput.on("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    addauthor()
  }
});

function rem_author(id){
  if(authors.length==1){
    $(".auth_div").css("display","none")
  }
  
  for(i=0;i<authors.length;i++){
    if(authors[i].id==id){
      authors.splice(i,1)
      $("input[name='authors']").val(JSON.stringify(authors));
    }
  }
}


function addtag(){
  tag={
    id:$("#tgtype").children("option:selected").val()+Date.now(),
    tagType:$("#tgtype").children("option:selected").val(),
    customTag:$(".tagsinput .customTag").val(),
    tagDesc:$(".tagsinput .tagdesc").val(),
    priority:$("#tgpriority").children("option:selected").val(),
  }
  isFound=false;
  for(i=0;i<tags.length;i++){
    if(tags[i].tagType==tag.tagType && tags[i].customTag==tag.customTag){
      isFound=true;
    }
  }

  if(!isFound){
    if(tags.length>8){
      $("#snackbar").text(`Maximum 8 tags can be seleted at a time !!`)
      myFunction();
    }else{
    
      if(tag.tagType=="custom"){ 
        if(tag.customTag==""){
          $("#snackbar").text(`Please enter the custom tag !!`)
          myFunction();
          return;
        }
      }

      tags.push(tag)

      $(".tg_div").css("display","block")
      tag_html=`<div class="tag_view">
          <i onclick="this.parentElement.remove();rem_tag('${tag.id}')" class="fa fa-times rem_tag" aria-hidden="true"></i>`

          if(tag.tagType=="custom"){
            tag_html+=`<p class="tag">&nbsp;${tag.customTag} <span>( Priority : ${tag.priority} )</span></p>`
          }else{
            tag_html+=`<p class="tag">&nbsp;${tag.tagType} <span>( Priority : ${tag.priority} )</span></p>`
          }
        tag_html+=`</div>`
      
      $(".tag_div").append(tag_html)
      $("input[name='tags']").val(JSON.stringify(tags));
      $(".tagsinput .customTag").val('')
      $(".tagsinput .tagDesc").val('')
    }
  }else{
    $("#snackbar").text(`This tag has already been added !!`)
    myFunction();
  }
}

var taginput = $(".taginput");

// Execute a function when the user releases a key on the keyboard
taginput.on("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    addtag()
  }
});

function rem_tag(id){
  if(tags.length==1){
    $(".tg_div").css("display","none")
  }
  console.log(tags)
  
  for(i=0;i<tags.length;i++){
    if(tags[i].id==id){
      tags.splice(i,1)
      console.log(tags)
      $("input[name='tags']").val(JSON.stringify(tags));
    }
  }
}