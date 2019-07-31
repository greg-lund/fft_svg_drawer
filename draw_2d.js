var N = 8; //N must be a power of 2
var threshold = 1e-10;

var time = 0;
var speed = 0.0020;
var wave = [];
var R = 0.75;
var scale_factor = 2;

var real = new Float32Array(N);
var imag = new Float32Array(N);
var data = [];


function setup() {
  var fft = new FFTNayuki(N);

  var out = getParameters(parse_string(string));
  var lens = total_len(out);
  var sample = resample(lens[1],lens[0],N);
  console.log(sample);
  for(var i = 0; i < N; i++) {
    var curr = sample[i];
    real[i] = curr[0];
    imag[i] = curr[1];
  }

  //Transform
  fft.forward(real,imag);

  for(var i = 0; i < N; i++) {
    if(abs(real[i]) < threshold) {
      real[i] = 0;
    } if(abs(imag[i]) < threshold) {
      imag[i] = 0;
    }
    real[i] = real[i]/N;
    imag[i] = imag[i]/N;

    if(real[i] !=0 || imag[i] != 0) {
      let a = real[i];
      let b = imag[i];
      let r = Math.sqrt(a*a+b*b);
      let phase = Math.atan2(b,a);

      var entry = [i, r, phase];
      data.push(entry);
    }

  }

  //Lets sort the array in descending order of radius
  data.sort(function(a,b) {
    return b[1] - a[1];
  });

  console.log(data);
  //Create Viewing Area
  createCanvas(800,800);

}

function draw() {
  background(0);
  translate(200,200);

  let x = 0;
  let y = 0;

  for(var i = 0; i < data.length; i++) {
    //prevx/y is center for this circle
    let prevx = x;
    let prevy = y;

    //Get relative radius and phase offset
    let w = data[i][0];
    if(w > N/2) {
      w = w-N;
    }
    let rad = data[i][1];
    let phase = data[i][2];

    x += R * rad * cos(w*2*PI*time + phase);
    y += R * rad * sin(w*2*PI*time + phase);

    //Draw current circle starting at prevx/y
    stroke(255,100);
    noFill();
    ellipse(prevx,prevy,R*rad*2);

    //Draw a line from old circle to new circle
    stroke(255);
    line(prevx,prevy,x,y);
  }

  //Push new location at the beginning of the array
  let loc = [x,y];
  wave.unshift(loc);

  //Draw our function:
  noFill();
  stroke(255,100,0);
  beginShape();
  for(let i = 0; i < wave.length; i++) {
    vertex(wave[i][0],wave[i][1]);
  }
  endShape();
  time += speed;

  if(wave.length > 500) {
    wave.pop();
  }
}
