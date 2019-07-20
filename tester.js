// Dimensions
var iVideoWidth = 320;
var iVideoHeight = 240;
var iGridWidth = 32;
var iGridHeight = 24;

// Intervals
var iDiffIntervalMs = 50;

// Video
var vWebcam = document.getElementById('video_camera');

// Canvas
var cOverlay 	= document.getElementById('canvas_video_overlay');
var cCurrent 	= document.getElementById('canvas_current');
var cPrevious 	= document.getElementById('canvas_previous');
var cDiff 		= document.getElementById('canvas_difference');		
var cCensors	= document.getElementById('canvas_sensors');		

// Contexts
var xOverlay 	= cOverlay.getContext('2d');
var xCurrent 	= cCurrent.getContext('2d');
var xPrevious	= cPrevious.getContext('2d');
var xDiff 		= cDiff.getContext('2d');
var xCensors	= cCensors.getContext('2d');

// Timer
var tDiffInterval = null; 

// Toggles
var currentlyRecording = false;


// Sensor
var sensor = {
	x: 0,
	y: 0,
	w: 5,
	h: 5,
	color: 'lightgreen',
	alpha: 0.5,
	ct: 16, // Cell Threshold
	st: 1, 	// Sensor Threshold (number of cells that must be on)
	sound: 'punch1'
}
/*
var sensor2 = {
	x: 27,
	y: 0,
	w: 5,
	h: 5,
	color: 'lightgreen',
	alpha: 0.5,
	ct: 16, // Cell Threshold
	st: 1, 	// Sensor Threshold (number of cells that must be on)
	sound: 'punch2'
}
*/


function diff() {
	// Take a snapshot
	xCurrent.drawImage(vWebcam, 0, 0, iGridWidth, iGridHeight);

	// Copy previous frame onto diff canvas
	xDiff.globalCompositeOperation = 'copy';
	xDiff.drawImage(cPrevious, 0, 0, iGridWidth, iGridHeight);

	// Perform the diff 
	xDiff.globalCompositeOperation = 'difference';
	xDiff.drawImage(cCurrent, 0, 0, iGridWidth, iGridHeight);
	var d = xDiff.getImageData(0, 0, iGridWidth, iGridHeight);
	
	checkSensor(d, sensor);
//	checkSensor(d, sensor2);

	// Attempt at blending
	//var diffImageData = xDiff.getImageData(0, 0, iGridWidth, iGridHeight);
	//binaryThreshold(diffImageData, 32);
	//xBlend.putImageData(diffImageData, 0, 0);
	// https://github.com/jasonmayes/JS-Motion-Detection/blob/master/js/MotionDetector.js
	//alphaBlend(xCurrent, xPrevious, xBlend, s);

	// Save for next iteration
	xPrevious.drawImage(cCurrent, 0, 0, iGridWidth, iGridHeight);
}


function moveSensor(s) {
	clearSensor(xCensors, s);

	// Choose randomly between those positions
	var selection = Math.round(Math.random() *3);

	switch(selection) {
		case 0: s.x=0; s.y=0; break;
		case 1: s.x=27; s.y=0; s.sound ='punch1'; break;
		case 2: s.x=0; s.y=12; break;
		case 3: s.x=27; s.y=12; s.sound ='punch2'; break;		
	}

	drawSensor(xCensors, s);
}

function clearSensor(ctx, s) {
	var cs = 10;
	ctx.clearRect(s.x * cs, s.y * cs, s.w * cs, s.h * cs);
}

function checkSensor(d, s) {
	// Remember, each cells has R,G,B,A hence the * 4
	var xmax = s.x + s.w -1;
	var ymax = s.y + s.h -1;
	var index = 0;
	var count = 0;

	for(var y = s.y; y <= ymax; y++) {
		for(var x = s.x; x <= xmax; x++) {
			index = (x + (y * iGridWidth)) * 4;
			//console.log(x, y, index);
			if(	d.data[index] > s.ct ||  
				d.data[index + 1] > s.ct || 
				d.data[index + 2] > s.ct) {
				count++;
			//	console.log(d.data[index], d.data[index + 1], d.data[index + 2], ">", s.ct, index);
			}	
		}
	}

	if(count > s.st) {
		switch(s.sound) {
			case 'punch1': audio_punch1.play(); break;
			case 'punch2': audio_punch2.play(); break;
		}
		console.log("YAY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", count);
		moveSensor(s);
	}
}







function drawGrid(ctx, color) {
	var gridColor = color || "#000";
	var width = ctx.canvas.width;
	var height = ctx.canvas.height;
	for (var x = 0.5; x < width; x += 10) {
	  ctx.moveTo(x, 0);
	  ctx.lineTo(x, height);
	}
	for (var y = 0.5; y < height; y += 10) {
	  ctx.moveTo(0, y);
	  ctx.lineTo(width, y);
	}
	ctx.strokeStyle = gridColor;
	ctx.stroke();
}

function drawSensor(ctx, sensor) {
	// Draw on the overlay canvas a pixel of a certain colour based on the sensor position
	// Grid is 32x24, step by 10 to make 320x240
	var cs = 10; // cell size
	ctx.globalAlpha = 0.5
	ctx.fillStyle = sensor.color;
	ctx.fillRect(sensor.x * cs, sensor.y * cs, sensor.w * cs, sensor.h * cs);
}



function startRecording () {
	if(currentlyRecording) return;
	xPrevious.drawImage(vWebcam, 0, 0, iGridWidth, iGridHeight);

	tDiffInterval = setInterval(diff, iDiffIntervalMs);
	currentlyRecording = true;
}

function stopRecording() {
	if(!currentlyRecording) return;	
	clearInterval(tDiffInterval);
	currentlyRecording = false;
}


function startVideo() {
	requestWebcam(); 
}

function stopVideo() {
  try {
      var track = vWebcam.srcObject.getTracks()[0]; // Video track
      track.stop();
  } catch (e) {
    handleError(e);
  }
}

function takeSnapshot() {

	
}

async function requestWebcam() {
	var constraints = {
		audio: false,
		video: { width: iVideoWidth, height: iVideoHeight }
	};	
	try {
		vWebcam.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
	} catch (e) {
 		console.log(e);

	}
}


function changeSensitivity() {
	iMotionSensitivity = document.querySelector('#sensitivity').value;
}


document.querySelector('#openCamera').addEventListener('click', startVideo);
document.querySelector('#closeCamera').addEventListener('click', stopVideo);
document.querySelector('#takeSnapshot').addEventListener('click', takeSnapshot);
document.querySelector('#startRecording').addEventListener('click', startRecording);
document.querySelector('#stopRecording').addEventListener('click', stopRecording);
document.querySelector('#changeSensitivity').addEventListener('click', changeSensitivity);

// Prep
var audio_tiger = new Audio("media/sound/Tiger_Uppercut.mp3");
var audio_punch1 = new Audio("media/sound/punch3.mp3");
var audio_punch2 = new Audio("media/sound/punch2.mp3");
drawGrid(xOverlay);
drawSensor(xCensors, sensor);
//drawSensor(xOverlay, sensor2);





