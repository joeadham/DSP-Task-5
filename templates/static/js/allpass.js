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
  

  // Push filter to the list

  if (!checkList(value_input)) {
    apf_list.push(value_input);
  }
  console.log(apf_list);
displayFilters();

// clears the text field after clicking add
value_input_real.value = "";
value_input_imag.value = "";

};


  function displayFilters() {
    const addedFilters = document.getElementById("added_filters");
    addedFilters.innerHTML = ""; // clear the contents of the div
  
    for (let i = 0; i < apf_list.length; i++) {
      const filter = apf_list[i];
  
      // create a new element for each filter
      const filterElement = document.createElement("div");
      filterElement.className = "filter_container";
      let filter_text = document.createElement("p");
      let text = document.createTextNode(filter);
      filter_text.appendChild(text);
      
  
      // create a delete button for the filter
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = "Delete";
      deleteButton.className="button";
      deleteButton.addEventListener("click", function() {
        apf_list.splice(i, 1);
        
        // Uncheck the corresponding checkbox
        const checkboxes = document.querySelectorAll(".slideshow input[type='checkbox']");

        if (checkboxes.length !== 0) {
        // no checkboxes were found, do something here
        const checkbox = document.querySelector(`input[type='checkbox'][value='${filter}']`);
        if (checkbox) {
            checkbox.checked = false;
          }
          
        
        }
        displayFilters();
      });
  
      // append the delete button to the filter element
      filterElement.appendChild(filter_text);
      filterElement.appendChild(deleteButton);
  
      // append the filter element to the added_filters div
      addedFilters.appendChild(filterElement);

    }
    sendApfListToBackend();
  }




// Get all checkboxes in the slideshow
const checkboxes = document.querySelectorAll(".slideshow input[type='checkbox']");

// Add event listener to each checkbox
checkboxes.forEach(checkbox => {
  checkbox.addEventListener("change", function() {
    if (this.checked) {
      apf_list.push(this.value);
    } else {
      // Remove the value from the apf_list when the checkbox is unchecked
      const index = apf_list.indexOf(this.value);
      if (index > -1) {
        apf_list.splice(index, 1);
      }
    }
    displayFilters();
  });
});


function sendApfListToBackend() {
    // convert the apf_list to a JSON string
    const apf_list_json = JSON.stringify(apf_list);
  
    // make a POST request to the backend endpoint with the apf_list data
    fetch("/process_apf_list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: apf_list_json
    })
      .then(response => response.json())
      .then(data => {
        console.log("Success:", data);
      })
      .catch(error => {
        console.error("Error:", error);
      });
  }
  