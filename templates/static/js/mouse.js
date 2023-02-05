let xvals = [];
let yvals = [];
let bvals = [];

function setup() {
  createCanvas(640, 360);
  noSmooth();
  xvals = new Array(width).fill(0);
  yvals = new Array(width).fill(0);
  bvals = new Array(width).fill(0);
}

function draw() {
  background(102);
  
  for (let i = 1; i < width; i++) { 
    xvals[i-1] = xvals[i]; 
    yvals[i-1] = yvals[i];
    bvals[i-1] = bvals[i];
  } 
  // Add the new values to the end of the array 

  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    xvals[width-1] = mouseX; 
    yvals[width-1] = mouseY;
  }
  if (mouseIsPressed) {
    bvals[width-1] = 0;
  } else {
    bvals[width-1] = height/3;
  }
  
  fill(255);
  noStroke();
  rect(0, height/3, width, height/3+1);

  for(let i = 1; i < width; i++) {
    // Draw the x-values
    stroke(255);
    line(i, map(xvals[i], 0, width, 0, height/3-1), i-1, map(xvals[i-1], 0, width, 0, height/3-1));
    
    // Draw the y-values
    stroke(0);
    line(i, height/3+yvals[i]/3, i-1, height/3+yvals[i-1]/3);
    
    // Draw the mouse presses
    stroke(255);
    line(i, (2*height/3) + bvals[i], i-1, (2*height/3) + bvals[i-1]);
  }
}

canvas.width = 720;
canvas.height = 400;



