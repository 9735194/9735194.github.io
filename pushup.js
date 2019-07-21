// Dimensions
var video_width = 320;
var video_height = 240;
var grid_width = 32;
var grid_height = 24;
var cell_size = 10; // Initialised after webcam is turned on

// Intervals
var snapshot_interval = 50;

// Video
var video_camera = document.getElementById('video_camera');

// Canvas
var canvas_overlay 	= document.getElementById('canvas_video_overlay');
var canvas_snapshot = document.getElementById('canvas_current');
var canvas_blend 	= document.getElementById('canvas_blend');		
var canvas_censors	= document.getElementById('canvas_sensors');		

// Contexts
var context_overlay 	= canvas_overlay.getContext('2d');
var context_snapshot 	= canvas_snapshot.getContext('2d');
var context_blend 		= canvas_blend.getContext('2d');
var context_censors		= canvas_censors.getContext('2d');

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


function blend() {
	context_blend.globalCompositeOperation = 'copy';
	context_blend.drawImage(canvas_snapshot, 0, 0, grid_width, grid_height); // Prev snapshot before update
	context_snapshot.drawImage(video_camera, 0, 0, grid_width, grid_height); // Take new snapshot (update)
	context_blend.globalCompositeOperation = 'difference';
	context_blend.drawImage(canvas_snapshot, 0, 0, grid_width, grid_height); // Diff prev and new
	var d = context_blend.getImageData(0, 0, grid_width, grid_height);	// Get raw data
	checkSensor(d, sensor);	// Analyse raw data for sensor bits
}


function moveSensor(s) {
	clearSensor(context_censors, s);

	// Choose randomly between those positions
	var selection = Math.round(Math.random() *3);

	switch(selection) {
		case 0: s.x=0; s.y=0; break;
		case 1: s.x=27; s.y=0; s.sound ='punch1'; break;
		case 2: s.x=0; s.y=12; break;
		case 3: s.x=27; s.y=12; s.sound ='punch2'; break;		
	}

	drawSensor(context_censors, s);
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
			index = (x + (y * grid_width)) * 4;
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
	for (var x = 0.5; x < width; x += cell_size) {
	  ctx.moveTo(x, 0);
	  ctx.lineTo(x, height);
	}
	for (var y = 0.5; y < height; y += cell_size) {
	  ctx.moveTo(0, y);
	  ctx.lineTo(width, y);
	}
	ctx.strokeStyle = gridColor;
	ctx.stroke();
}

function drawSensor(ctx, sensor) {
	// Draw on the overlay canvas a pixel of a certain colour based on the sensor position
	// Grid is 32x24, step by 10 to make 320x240

	ctx.globalAlpha = 0.5
	ctx.fillStyle = sensor.color;
	ctx.fillRect(sensor.x * cell_size, sensor.y * cell_size, sensor.w * cell_size, sensor.h * cell_size);
}



function startRecording () {
	if(currentlyRecording) return;
	context_snapshot.drawImage(video_camera, 0, 0, grid_width, grid_height);

	tDiffInterval = setInterval(blend, snapshot_interval);
	currentlyRecording = true;
}

function stopRecording() {
	if(!currentlyRecording) return;	
	clearInterval(tDiffInterval);
	currentlyRecording = false;
}


function startVideo() {
	requestWebcam(); // ASYNC!!!!

	// Adjust canvas overlay
	// FIXME: This doesn't work. The canvas_overlay needs to be sized once we have a webcam feed. The webcam feed is async
}

function setupCanvas() {
	canvas_overlay.style.width = video_camera.offsetWidth;
	canvas_overlay.style.height = video_camera.offsetHeight;
	console.log(video_camera.offsetWidth, video_camera.offsetHeight);
	console.log(canvas_overlay.style);

	drawGrid(context_overlay);
	drawSensor(context_censors, sensor);



}


function stopVideo() {
  try {
      var track = video_camera.srcObject.getTracks()[0]; // Video track
      track.stop();
  } catch (e) {
    handleError(e);
  }
}



async function requestWebcam() {
	var constraints = {
		audio: false,
		video: { width: video_width, height: video_height }
	};	
	try {
		video_camera.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
		setupCanvas();
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

//drawSensor(context_overlay, sensor2);





