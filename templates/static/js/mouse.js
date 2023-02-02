let xvals = [];
    let yvals = [];
    let bvals = [];
    // var canvas = document.getElementById('test')
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
      xvals[width-1] = mouseX; 
      yvals[width-1] = mouseY;
      
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
        point(i, map(xvals[i], 0, width, 0, height/3-1));
        
        // Draw the y-values
        stroke(0);
        point(i, height/3+yvals[i]/3);
        
        // Draw the mouse presses
        stroke(255);
        line(i, (2*height/3) + bvals[i], i, (2*height/3) + bvals[i-1]);
      }
    }

    canvas.width = 720;
canvas.height = 400;

// call the draw function
draw();