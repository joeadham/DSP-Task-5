const contextMenu = document.querySelector(".menu");
var delete_btn = document.getElementById("delete");
let canvas = document.getElementById("unitCircle");
let context = canvas.getContext("2d");
canvas.height = 360;
canvas.width = 360;
const rect = canvas.getBoundingClientRect();

var unitcircle_radius = 160;
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;
var shape_size = 6;

var startX = 0;
var startY = 0;
var endX = 360;
var endY = 360;

let shapes = []
let zeros = []
let poles = []

let selected_shape = null;
var draw_phase = false;
var move_phase = false;
var options = document.getElementsByName("options");

var draw_shape = "zero";
options[0].onchange = function () {
    draw_shape = "zero"
};
options[1].onchange = function () {
    draw_shape = "pole";
};

function draw_unitcircle() {
  var startAngle = 0;
  var endAngle = 2 * (Math.PI);
  context.beginPath();
  context.arc(centerX, centerY, unitcircle_radius, startAngle, endAngle,false);
  context.lineWidth = 2;
  context.strokeStyle = "black";
  context.stroke();

  context.beginPath();
  context.moveTo(centerX, centerY - centerY);
  context.lineTo(centerX, centerY + centerY);
  context.lineWidth =2;
  context.strokeStyle = "black";
  context.stroke();

  context.beginPath();
  context.moveTo(centerX - centerX, centerY);
  context.lineTo(centerX + centerX, centerY);
  context.lineWidth = 2;
  context.strokeStyle = "black";
  context.stroke();
};

draw_unitcircle();

function draw_zero(x, y) {
  var startAngle = 0;
  var endAngle = 2 * (Math.PI);
  context.beginPath();
  context.arc(x, y, shape_size, startAngle, endAngle, false);
  context.lineWidth = 1;
  context.fillStyle = "#296d98";
  context.fill();
};

function draw_pole(x, y) {
  context.beginPath();
  context.lineWidth = 2.5;
  context.strokeStyle = "red";
  context.moveTo(x - shape_size, y - shape_size);
  context.lineTo(x + shape_size, y + shape_size);
  context.moveTo(x + shape_size, y - shape_size);
  context.lineTo(x - shape_size, y + shape_size);
  context.stroke();

};

function is_mouse_in_shape(shape) {
  let left = shape.x - shape_size;
  let right = shape.x + shape_size;
  let top = shape.y - shape_size;
  let bottom = shape.y + shape_size;

  if (left < startX && right > startX && top < startY && bottom > startY) {
      return true;
  }
  return false;
};

function draw_shapes(shapes) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  draw_unitcircle();

  for (let shape of shapes) {
      if (shape.type == "zero") {
          draw_zero(shape.x, shape.y);
      }
      else {
          draw_pole(shape.x, shape.y);
      }
  }
};
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;
canvas.onmousemove = myMove;
canvas.onclick = (event) => {
  contextMenu.style.visibility = "hidden";
  draw_phase = true;
  startX = parseInt(event.clientX - rect.left);
  startY = parseInt(event.clientY - rect.top);

  for (let shape of shapes) {
      if (is_mouse_in_shape(shape)) {
          draw_phase = false;
      }
  }

  let conj = document.getElementById('conj').checked
    
  if (draw_phase) {
      draw_phase = false;
      if (draw_shape == "zero") {
        draw_zero(startX, startY);
        shapes.push({ x: startX, y: startY, type: "zero" });
        if (conj) {
          startY = 2 * centerY - startY;
          draw_zero(startX, startY);
          shapes.push({ x: startX, y: startY, type: "zero" });
        }
      }
      else {
          draw_pole(startX, startY);
          shapes.push({ x: startX, y: startY, type: "pole" });
          if (conj) {
            startY = 2 * centerY - startY;
            draw_pole(startX, startY);
            shapes.push({ x: startX, y: startY, type: "pole" });
          }
      }
      get_complex(shapes);
  }
}

function myDown(event){
  startX = parseInt(event.clientX - rect.left);
  startY = parseInt(event.clientY - rect.top);
  let index = 0;
  for (let shape of shapes) {
      if (is_mouse_in_shape(shape)) {
          selected_shape = index;
          move_phase = true;
      }
      index++;
  }
}

function myUp(event){
  if (move_phase) {
    move_phase = false;
  }
  get_complex(shapes);
}

function myMove(event){
  if (move_phase) {
    endX = parseInt(event.clientX - rect.left);
    endY = parseInt(event.clientY - rect.top);
    let dx = endX - startX;
    let dy = endY - startY;
    let current_shape = shapes[selected_shape];
    current_shape.x += dx;
    current_shape.y += dy;
    draw_shapes(shapes);
    get_complex(shapes);
    startX = endX;
    startY = endY;
  }
}

function clearCanvas(toClear) {
  if (toClear == "zeros") {;
    var length = shapes.length;
    for (let i = 0; i < length; i++) {
      if (shapes[i].type == "zero") {
        shapes.splice(i, 1)
      }
    }
  } else if (toClear == 'poles') {
    var length = shapes.length;
    for (let i = 0; i < length; i++) {
      if (shapes[i].type == "pole") {
        shapes.splice(i, 1)
      }
    }
  } else {
    shapes=[]
  }
  draw_shapes(shapes);
  get_complex(shapes);
 
}

canvas.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  startX = e.offsetX, startY = e.offsetY;
  let menu = false
  let index = 0;
  for (let shape of shapes) {
      if (is_mouse_in_shape(shape)) {
          selected_shape = index;
          menu = true;
      }
      index++;
  }
  if (menu) {
      //contextMenu.style.left = `${startX}px`;
      //contextMenu.style.top = `${startY + 130}px`;
      //contextMenu.style.visibility = "visible";
      contextMenu.style.visibility = "hidden";
      shapes.splice(selected_shape, 1);
      draw_shapes(shapes);
      get_complex(shapes);
  }
});

function get_complex(shapes) {
  let x = 0;
  let y = 0;
  zeros = [];
  poles = [];
  for (let shape of shapes) {
      x = (shape.x - centerX) / unitcircle_radius
      y = - (shape.y - centerY) / unitcircle_radius;

      if (shape.type == "zero") {
          zeros.push({ real: x, img: y })
      }
      else {
          poles.push({ real: x, img: y })
      }
  }
  get_graphs();
};


function convertToPixels(zeros, poles) {
  shapes = []
  let x = 0;
  let y = 0;
  for (let zero of zeros) {
      x = (zero["real"] * unitcircle_radius) + centerX
      y = (zero["img"] * -1*unitcircle_radius) + centerY
      shapes.push({ x: x, y: y, type: "zero" });
  }
  for (let pole of poles) {
      x = (pole["real"] * unitcircle_radius) + centerX
      y = (pole["img"] * -1*unitcircle_radius) + centerY
      shapes.push({ x: x, y: y, type: "pole" });
  }
  console.log(zeros)
  console.log(poles)
  console.log(shapes)

  draw_shapes(shapes);
  get_complex();

};

setUpPlot("magPlot",[],[],'Magnitude',"Frequency","Amplitude");
setUpPlot("phasePlot",[],[],'Phase',"Frequency","Amplitude");




function get_graphs(){
  console.log(zeros);
  $.ajax({
    
    url: 'http://192.168.1.14:5000/plotMagAndPhase',
    type: 'POST',
    data:{
      zeros:zeros,
      poles:poles
    },
    dataType: 'json',
    async: true,
    success: function (data) {
        freq = data["freq"];
        mag = data["mag"];
        phase = data["phase"];
        var magUpdate = { 'x': [freq], 'y': [mag] };
        var phaseUpdate = { 'x': [freq], 'y': [phase] };
        console.log(freq)
        Plotly.update("magPlot", magUpdate);
        Plotly.update("phasePlot", phaseUpdate);

    }
  })
}



var inputSignalChart;
var glopalFileName;
function getFileName(){
    var fileInput = document.getElementById('upload');   
    var filename = fileInput.files[0].name;
    glopalFileName = filename;
    generate_phase = false;
    cnt = 0;
    Plotly.purge('input-signal');
    Plotly.purge('output-signal');
    setUpPlot('input-signal',[],[],'Input signal','Time (s)','Amp',[0,50])
    setUpPlot('output-signal',[],[],'Output signal','Time (s)','Amp',[0,50])
    
    requestData(filename);
  }
var cnt =0;

function requestData(filename)
{
  console.log(glopalFileName,filename);
  // Ajax call to get the Data from Flask
  $.ajax(
    {
        method: 'POST',
        url: 'http://192.168.1.14:5000/data', //change according to your url
        dataType: 'json',
        async: true,
        data:
        {
          filename:filename,
        },
        success: function (result, status, xhr) 
        {
          if (glopalFileName != filename || generate_phase){
            return;
          }
          if(result['inputY'] == -1){
            getFileName();
          }
          Plotly.extendTraces('input-signal',{y:[[result['inputY']]],x:[[result['inputX']]]},[0]);
          cnt++;
          var stripSize = 50;
          if(cnt > stripSize){
            Plotly.relayout('input-signal',{
              xaxis:{
                range:[cnt-stripSize,cnt],
                title:'Time [s]'
              }
            })
          }
          Plotly.extendTraces('output-signal',{y:[[result['outputY']]],x:[[result['inputX']]]},[0]);
          if(cnt > stripSize){
            Plotly.relayout('output-signal',{
              xaxis:{
                range:[cnt-stripSize,cnt],
                title:'Time [s]'
              }
            })
          }
          setTimeout(requestData(filename), 2000);
        }
    });
}

function setUpPlot(div, time, amp, graph_title,xAxisTitle,yAxisTitle,xRange) {
  // Prepare The data
  var plot = {
      x: time,
      y: amp,
      type: "scatter",
      mode: "lines"
  };

  // Prepare the graph and plotting
  var layout = {
      width: 400,
      height: 170,
      margin: { t: 25, b: 35, l: 40, r: 5 },

      xaxis: { title: xAxisTitle, range:xRange },
      yaxis: { title: yAxisTitle },
      title: graph_title
  };

  var data = [plot];

  Plotly.newPlot(div, data, layout);
};

WebFontConfig = {
  google: {
    families: ['Open+Sans+Condensed:300:latin']
  }
};
(function () {
  var wf = document.createElement('script');
  wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
    '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
  wf.type = 'text/javascript';
  wf.async = 'true';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(wf, s);
})();
/////////////////////////////////////////////////////

// var value_input = document.getElementsByName("add_value");
// var value_input_real ;
// var value_input_imag ;
// value_input[0].onclick=function(){
//   value_input_real =value_input.value;
//   console.log(value_input_real);
// };
// value_input[0].onclick=function(){
//   value_input_imag =value_input.value;
//   console.log(value_input_imag);
// };
// // Get A value from input data
// let input_text_real = document.querySelector(".value_added_real input");
// let input_text_imag = document.querySelector(".value_added_imag input");
// var add_filter_btn_real = document.getElementById("add_filter_btn_real");
// var add_filter_btn_imag = document.getElementById("add_filter_btn_imag");
// var filters_container = document.getElementById("added_filters");

// // List that contains all filters to be sent to the back-end
// let apf_list = []

// // To check if filter was already used
// function checkList (a) {
//     for (let i = 0; i < apf_list.length; i++){
//         if (a == apf_list[i]){
//             return true;
//         }
//     }
//     return false;
// };

// var input_text = document.getElementById("input_imag").value;

// add_filter_btn_imag.onclick = function () {
//   console.log(input_text);
// };



// Buttons and setting up plot
var generate_btn = document.getElementById("generate_btn");
var import_signal_btn = document.getElementById("upload");

// Initialize Signal plot
setUpPlot("input-signal", [], [], "Input");
setUpPlot("output-signal", [], [], "Output");


// Generation Pad Initalization
let pad = document.getElementById("pad");
let ctx = pad.getContext("2d");
pad.height = 190;
pad.width = 415;
const pad_rect = pad.getBoundingClientRect();

// Setup the pad axis
ctx.beginPath();
ctx.moveTo(200, 0);
ctx.strokeStyle = "white";
ctx.lineTo(200, 200);
ctx.lineWidth = 0.5;
ctx.stroke();

// Generate Signal
var generate_phase = true;
var input_y = 0;
var t = 0;

// Generating input on mousemove
pad.onmousemove = (event) => {
    if (generate_phase) {
        input_y = parseFloat(event.clientX - pad_rect.left - 200);
        let filtered_point = updateOutput(input_y);

        Plotly.extendTraces("input-signal", { y: [[input_y]], x: [[t]] }, [0]);
        Plotly.extendTraces("output-signal", { y: [[filtered_point]], x: [[t]] }, [0]);
        t += 0.02

        if (t >= 3) {
            var update_range = { 'xaxis.range': [t - 2.5, t + 0.5] };
            Plotly.relayout("input-signal", update_range);
            Plotly.relayout("output-signal", update_range);
        }
    }
};

function updateOutput(y_point) {
    $.ajax({
        url: 'http://192.168.1.14:5000/generated',
        type: 'POST',
        data: JSON.stringify({ y_point }),
        cache: false,
        dataType: 'json',
        async: false,
        contentType: 'application/json',
        processData: false,

        success: function (response) {
            signal_output = response["y_point"];
            console.log(signal_output)
        },
    });
    return signal_output;
};

// Generate Button 
generate_btn.onclick = () => {
    generate_phase = true;
    setUpPlot("input-signal", [], [], "Input");
    setUpPlot("output-signal", [], [], "Output");
    t = 0;
};

var import_filter_btn = document.getElementById("import_filter_btn");
var export_btn = document.getElementById("export_btn");
var headers = ['zeros', 'poles'];
var columns = [zeros, poles];
function exportFilter(){

    let filter = {
        zeros: zeros,
        poles: poles
    };

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filter));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "Digital Filter.json");
    dlAnchorElem.click();
    console.log('saved')
}

let importBtn = document.getElementById('import')
let importFilter = (event) => {
    let filter
    var reader = new FileReader();
    reader.onload = (event) => {
        filter = JSON.parse(event.target.result);
        zeros = filter.zeros
        poles = filter.poles
        convertToPixels(zeros, poles)
    };
    reader.readAsText(event.target.files[0]);
}

import_filter_btn.onchange = (event) => {
    importFilter(event)
}
importBtn.onclick = () => {
    import_filter_btn.click()

}
