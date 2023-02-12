
let apfReal = []
let apfImg = []

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
 
  var realFloat = 0;
  var imgFloat = 0;

  if(input_real == '' && input_imag == ''){
      return;
  }
  
  var value_input = input_real + "+" +input_imag + "j" 
  
  if(input_real == '' && input_imag != ''){
    value_input = input_imag+"j"
    imgFloat = parseFloat(input_imag);
  }
  else if (input_real != '' && input_imag == ''){
    value_input = input_real
    realFloat = parseFloat(input_real);
  }

  apfReal.push(realFloat);
  apfImg.push(imgFloat);

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

setUpPlot('apfPhase',[],[],'All pass','Freq','Amp')
setUpPlot('updatedPhase',[],[],'Updated phase','Freq','Amp')



function sendApfListToBackend() {
  fetch('/send_apf_list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({apf_list: apf_list})
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log(data);
    
    //setUpPlot('apfPhase',[],[],'All pass','Freq','Amp')
    //setUpPlot('updatedPhase',[],[],'Updated phase','Freq','Amp')

    apfFreq = data["apfFreq"];
    apfPhase = data["apfPhase"];
    updatedPhaseFreq = data["updatedPhaseFreq"];
    updatedPhasePhase = data["updatedPhasePhase"];

    var apfUpdate = { 'x': [apfFreq], 'y': [apfPhase] };
    var phaseUpdate = { 'x': [updatedPhaseFreq], 'y': [updatedPhasePhase] };
    Plotly.update("apfPhase", apfUpdate);
    Plotly.update("updatedPhase", phaseUpdate);
    Plotly.update("phasePlot", phaseUpdate);
  });
}

//function sendApfListToBackend() {
//    // convert the apf_list to a JSON string
//    const apf_list_json = JSON.stringify(apf_list);
//  
//    
//
  //  $.ajax({
  //  
  //  url: 'http://127.0.0.1:5000/allPass',
  //  type: 'POST',
  //  data:{apfList:apf_list},
  //  dataType: 'json',
  //  async: true,
  //  success: function (data) {
  //      console.log(data)
  //      //freq = data["freq"];
  //      //mag = data["mag"];
  //      //phase = data["phase"];
  //      //var magUpdate = { 'x': [freq], 'y': [mag] };
  //      //var phaseUpdate = { 'x': [freq], 'y': [phase] };
  //      //console.log(freq)
  //      //Plotly.update("magPlot", magUpdate);
  //      //Plotly.update("phasePlot", phaseUpdate);
  //  }
  //})
 // }
  