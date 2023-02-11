var value_input = document.getElementsByName("add_value");
var value_input_real ;
var value_input_imag ;
value_input[0].onclick=function(){
  value_input_real = document.querySelector(".value_added_real input").value;
  console.log(value_input_real);
};
value_input[1].onclick=function(){
  value_input_imag = document.querySelector(".value_added_imag input").value;
  console.log(value_input_imag);
};

// Get A value from input data
let input_text_real = document.querySelector(".value_added_real input");
let input_text_imag = document.querySelector(".value_added_imag input");
var add_filter_btn_real = document.getElementById("add_filter_btn_real");
var add_filter_btn_imag = document.getElementById("add_filter_btn_imag");
var filters_container = document.getElementById("added_filters");

// List that contains all filters to be sent to the back-end
let apf_list = []

// To check if filter was already used
function checkList (a) {
    for (let i = 0; i < apf_list.length; i++){
        if (a == apf_list[i]){
            return true;
        }
    }
    return false;
};

var input_text = document.getElementById("input_imag").value;

add_filter_btn_imag.onclick = function () {
  console.log(input_text_imag.value);
};
