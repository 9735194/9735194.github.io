// Camera API

const video = document.querySelector('#video_camera');
const canvas = document.querySelector('#canvas_snapshot');
var audio_punch1 = new Audio("media/sound/punch3.mp3");
var audio_punch2 = new Audio("media/sound/punch2.mp3");
var audio_tiger = new Audio("media/sound/Tiger_Uppercut.mp3");
var audio_shoryuken = new Audio("media/sound/shoryuken.mp3");




function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    let v = constraints.video;
    errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg(`getUserMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
  const errorElement = document.querySelector('#errorMsg');
  errorElement.innerHTML += `<p>${msg}</p>`;
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}


async function startVideo(e) {
  try {
  	// Put variables in global scope to make them available to the browser console.
	const constraints = window.constraints = {
	  audio: false,
	  //video: true
	  // "Ask for a 320x240 stream"
	  video: { width: 320, height: 240 }
	};
   	const stream = await navigator.mediaDevices.getUserMedia(constraints);
	window.stream = stream; // make stream available to browser console
	//videoTracks = stream.getVideoTracks();
	//console.log(`Using video device: ${videoTracks[0].label}`);
	var video = document.querySelector('video');
	video.srcObject = stream;
	//video.height = 320;
	//video.width = 240;
    e.target.disabled = true;
  } catch (e) {
    handleError(e);
  }
}


async function stopVideo(e) {
  try {
      var track = window.stream.getTracks()[0]; // Video track
      track.stop();
  } catch (e) {
    handleError(e);
  }
}

async function takeSnapshot(e) {
  try {
    console.log("Taking snapshot ...");

    //console.log(canvas);
    canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	//console.log(canvas.width);
	var context = canvas.getContext('2d');
	context.drawImage(video, 0, 0, canvas.width, canvas.height);
	drawLine(context);
	drawTimestamp(context);	
  } catch (e) {
    handleError(e);
  }
}

function drawLine(context) {
	// Reset the current path
	context.beginPath(); 
	// Staring point (10,45)
	context.moveTo(0,canvas.height/2);
	// End point (180,47)
	context.lineTo(canvas.width, canvas.height/2);
	context.strokeStyle = 'yellow';
	// Make the line visible
	context.stroke();  
}


function drawTimestamp(context) {
//drawLine(context);
	context.fillStyle = "yellow";
	context.font = "12px Arial";
	var date = new Date();
	context.fillText(date.toISOString(), 0, 20);
}



var canvas_motion = document.getElementById('canvas_motion');
window.score = document.getElementById('motion_score');

function initSuccess() {
	DiffCamEngine.start();
}

function initError() {
	alert('Something went wrong.');
}

function check_zones(payload) {
	score.textContent = payload.score;
	//console.log(payload);
	//if(payload.checkMotionPixel(1,1)) {
	//	console.log(payload.hasMotion);
	if(payload.hasMotion) {	
		//console.log(payload);
		if(payload.checkMotionPixel(0,0) && cleared){
			audio_punch2.play();
			tiger++;

			if(Math.round(Math.random()) == 1) {
				cleared = false;
				sensor_colour(0,0,'red')
				sensor_colour(gw-1,0,'green')
			}
		
			
			//console.log("Yay!");
		}
		if(payload.checkMotionPixel(gw-1,0) && !payload.checkMotionPixel(0,0) && cleared == false){
						audio_punch1.play();
			tiger++;
			
			if(Math.round(Math.random()) == 1) {
				cleared = true;
				sensor_colour(gw-1,0,'red')
				sensor_colour(0,0,'green')
			}
		}		
		if(tiger == 10){
			sensor_colour(0,extras_y,'yellow');
			sensor_colour(gw-1,extras_y,'yellow');
			tiger = 11;
			console.log("Tiger Ready!");
		}	
		if(tiger > 10 && payload.checkMotionPixel(0,extras_y)) {
				audio_tiger.play();
				sensor_colour(0,extras_y,'blue');
				sensor_colour(gw-1,extras_y,'blue');
				tiger=0;
		}

		if(tiger > 10 && payload.checkMotionPixel( gw-1,extras_y) ) {
				audio_shoryuken.play();
				sensor_colour(0,extras_y,'blue');
				sensor_colour(gw-1,extras_y,'blue');
				tiger=0;
		}
	}

}


var gw = 16;
var gh = 12;
var ratio = 20;
var extras_y = (gh/2)-1;

var cleared = true;
// https://github.com/lonekorean/diff-cam-engine
DiffCamEngine.init({
	video: video,
	motionCanvas: canvas_motion,
	initSuccessCallback: initSuccess,
	initErrorCallback: initError,
	captureCallback: check_zones,
	captureIntervalTime: 100,
	captureWidth: 320,
	captureHeight: 240,
	diffWidth: gw,
	diffHeight: gh,
	pixelDiffThreshold: 12,
	scoreThreshold: 1,
	includeMotionPixels: true
});


var tiger = 0;



	// Get video element pos and size
	// Create overlay canvas with same dimension

	var c_canvas = document.getElementById("canvas_video_overlay");
	var overlay_context = c_canvas.getContext("2d");

	for (var x = 0.5; x < 320; x += ratio) {
	  overlay_context.moveTo(x, 0);
	  overlay_context.lineTo(x, 240);
	}

	for (var y = 0.5; y < 240; y += ratio) {
	  overlay_context.moveTo(0, y);
	  overlay_context.lineTo(320, y);
	}

	overlay_context.strokeStyle = "#000";
	overlay_context.stroke();

	overlay_context.fillStyle = 'green';
	overlay_context.fillRect(0, 0, ratio, ratio);
	overlay_context.fillStyle = 'red';	
	overlay_context.fillRect((gw-1)*ratio, 0, ratio, ratio);

	sensor_colour(0,extras_y,'blue');
	sensor_colour(gw-1,extras_y,'blue');

function sensor_colour(x,y,colour) {
	// Draw on the overlay canvas a pixel of a certain colour based on the sensor position
	// Grid is 32x24, step by 10 to make 320x240
	overlay_context.fillStyle = colour;
	overlay_context.fillRect(x*ratio, y*ratio, ratio, ratio);

}








