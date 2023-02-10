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
      contextMenu.style.left = `${startX}px`;
      contextMenu.style.top = `${startY + 130}px`;
      contextMenu.style.visibility = "visible";
  }
});

delete_btn.onclick = () => {
  contextMenu.style.visibility = "hidden";
  shapes.splice(selected_shape, 1);
  draw_shapes(shapes);
  get_complex(shapes);
};

function get_complex(shapes) {
  let x = 0;
  let y = 0;
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


function get_graphs(){
  $.ajax({
    url: 'http://127.0.0.1:5000/plotMagAndPhase',
    type: 'POST',
    data: JSON.stringify([poles, zeros]),
    dataType: 'json',
    async: true,
    success: function (data) {
        freq = data["freq"];
        mag_gain = data["mag"];
        phase_gain = data["phase"];

        
    }
  })
}




var inputSignalChart;
var glopalFileName;
function getFileName(){
    var fileInput = document.getElementById('upload');   
    var filename = fileInput.files[0].name;
    glopalFileName = filename;


    // --------------Chart 1 ----------------------------
    inputSignalChart = new Highcharts.Chart({
        chart:
            {
            renderTo: 'input-signal',
            height:800,
            width:1600,
            style: {
              fontSize: '50px'
          }
            },
            legend: {
              itemStyle: {
                 font: '35pt Trebuchet MS, Verdana, sans-serif',
                 color: '#000',
              },
              itemHoverStyle: {
                 color: '#000'
              },
              itemHiddenStyle: {
                 color: '#444'
              }

        }
            ,
        title:
            {
              style: {
                color: '#000',
                fontWeight: 'bold',
                fontSize:"50px"
              },
            text: 'Input signal'
            },
        xAxis: {
            tickPixelInterval: 150,
            labels:{
              style: {
                color: '#000',
                fontSize:"25px",
                minPadding:'50px'
              }
          }
                },
        yAxis: {
            minPadding: 0.2,
            maxPadding: 0.2,
            labels:{
              style: {
                color: '#000',
                fontSize:"25px"
              }
            },
            title: {
              style: {
                color: '#000',
                fontWeight: 'bold',
                fontSize:"40px"
              },
                text: 'Value',
                margin: 30
                    }
                    [{
                      height: '100%',
                      resize: {
                        enabled: true
                      }
                    }, {
                      height: '50%',
                      top: '50%'
                    }]
                  },
                  plotOptions: {
                  series: {
                      marker: {
                          enabled: false,
                          states: {
                              hover: {
                                  enabled: false
                              }
                          }
                      }
                  }
              }
              ,series: [{
            color : '#c23d23',
            lineColor: '#303030',
            name: 'Time',
            data: []
        }],
        responsive: {  
          rules: [{  
            condition: {  
              maxWidth: 500  
            },  
            chartOptions: {  
              legend: {  
                enabled: false  
              }  
            }  
          }]  
        }
    });
    // --------------Chart 1 Ends - -----------------
    requestData(filename);
  }


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
          if (glopalFileName != filename){
            return;
          }
            var inputChartSeries = inputSignalChart.series[0],
                inputShift = inputChartSeries.data.length > 20;

            // Add the Point
            // Time input\
            var data1 = [];
            data1.push(result[0]);
            data1.push(result[1]);

            inputSignalChart.series[0].addPoint(data1, true, inputShift);
            console.log(result);
            // call it again after one second
            
            setTimeout(requestData(filename), 2000);  
        
        }
    });
}
