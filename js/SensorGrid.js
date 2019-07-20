/*

Options:

div_element


*/
'use strict';

class SensorGrid {
	constructor(options) {
		// sanity check
		if (!options) {
			throw 'No options object provided';
		}

		// incoming options with defaults
		this.video = document.createElement('video');
		this.videoOverlayCanvas = document.createElement('canvas');

		this.diffIntervalTime = 100;
		this.videoWidth = 320;
		this.videoHeight = 240;
		this.gridWidth = 32;
		this.gridHeight = 24;
		this.pixelDiffThreshold = 16;
		this.scoreThreshold = 1; // FIXME: To remove as its not a cam detector
		this.includeMotionBox = false;
		this.includeMotionPixels = true;

		// callbacks
		this.initSuccessCallback = options.initSuccessCallback || function() {};
		this.initErrorCallback = options.initErrorCallback || function() {};
		this.startCompleteCallback = options.startCompleteCallback || function() {};
		this.captureCallback = options.captureCallback || function() {};

		// non-configurable
		this.baseCanvas = document.createElement('canvas');
		this.diffCanvas = document.createElement('canvas');
		this.motionCanvas = document.createElement('canvas');		
		this.isReadyToDiff = false;

		// prep video
		this.video.autoplay = true;

		// prep base canvas
		this.baseCanvas.width = this.gridWidth;
		this.baseCanvas.height = this.gridHeight;
		this.baseContext = this.baseCanvas.getContext('2d');

		// prep diff canvas
		this.diffCanvas.width = this.gridWidth;
		this.diffCanvas.height = this.gridHeight;
		this.diffContext = this.diffCanvas.getContext('2d');

		// prep motion canvas
		this.motionCanvas.width = this.gridWidth;
		this.motionCanvas.height = this.gridHeight;
		this.motionContext = this.motionCanvas.getContext('2d');

		// Add video and motion canvas to div
		var currentDiv = document.getElementById(options.div); 
		currentDiv.appendChild(this.video); 
	    currentDiv.appendChild(this.videoOverlayCanvas); 
	    currentDiv.appendChild(this.baseCanvas); 
		currentDiv.appendChild(this.diffCanvas); 
		this.baseContext.fillStyle = "blue";
		this.baseContext.fillRect(0, 0, this.gridWidth, this.gridHeight);
		this.diffContext.fillStyle = "yellow";
		this.diffContext.fillRect(0, 0, this.gridWidth, this.gridHeight);

		this.requestWebcam();    	

    }

	async requestWebcam() {
		var constraints = {
			audio: false,
			video: { width: this.captureWidth, height: this.captureHeight }
		};	
		try {
			this.video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
			this.initSuccessCallback();
		} catch (e) {
   	 		console.log(e);
   	 		this.initErrorCallback();
  		}
	}

	drawGrid() {

	}

	start () {
		this.video.addEventListener('canplay',this.startComplete.bind(this));
	}

	startComplete() {
		this.video.removeEventListener('canplay', this.startComplete);
		this.setBase();
		this.diffInterval = setInterval(this.diff.bind(this), this.diffIntervalTime);
	}

	stop() {
		clearInterval(this.diffInterval);
		this.video.srcObject = null;
		motionContext.clearRect(0, 0, this.gridWidth, this.gridHeight);
		isReadyToDiff = false;
	}

	setBase() {
		this.baseContext.drawImage(this.video, 0, 0, this.gridWidth, this.gridHeight);
		this.baseImageData = this.baseContext.getImageData(0, 0, this.gridWidth, this.gridHeight);
	}

	diff() {
	//	console.log("diff");
		// diff current capture over previous capture, leftover from last time
	//	this.diffContext.globalCompositeOperation = 'source-over';
	//	this.diffContext.drawImage(this.baseCanvas, 0, 0, this.gridWidth, this.gridHeight);
//		this.diffContext.globalCompositeOperation = 'difference';
	
		this.diffContext.drawImage(this.video, 0, 0, this.gridWidth, this.gridHeight);
		var diffImageData = this.diffContext.getImageData(0, 0, this.gridWidth, this.gridHeight);
			
		// Check sensors
		// Basically we compare diffImageData and baseImageData around certain areas to see
		// if the pixels have changed passed a certain threshold


        this.isReadyToDiff = true;
	}
	






}