var add_filter_btn = document.getElementById("add_filter_btn");
var value_input_real = document.querySelector(".value_added_real input");
var value_input_imag = document.querySelector(".value_added_imag input");
var filters_container = document.getElementById("added_filters");
let apf_list = []
function checkList (a) {
  for (let i = 0; i < apf_list.length; i++){
      if (a == apf_list[i]){
          return true;
      }
  }
  return false;
};

add_filter_btn.onclick = function () {
  var input_real = value_input_real.value.replace(/\s/g, "");
  var input_imag = value_input_imag.value.replace(/\s/g, "");
 
  var value_input = input_real + "+" +input_imag + "j" 
  console.log(input_real,input_imag,value_input);
  

  // // Push filter to the list
  // apf_list.push(value_input);
  // // Add filter to the menu
  // addFilterInMenu(input_a);

  // input_text.value = "";
  // input_text.focus();
};

function addFilterInMenu(a) {

  // Filter div
  let filter_div = document.createElement("div");
  filter_div.className = "filter_container";

  // The input data
  let filter_text = document.createElement("p");
  let text = document.createTextNode("a = " + a);
  filter_text.appendChild(text);

  // Delete Button
  let del_btn = document.createElement("span");
  let del_text = document.createTextNode("delete");
  del_btn.appendChild(del_text);
  del_btn.className = "material-symbols-outlined";
  del_btn.classList.add("del-filter");
  // Important to be able to delete filter from the list
  del_btn.id = a;

  // Finish the div then append it
  filter_div.appendChild(filter_text);
  filter_div.appendChild(del_btn);
  filters_container.appendChild(filter_div);    
};
