

function startVideo() {


}

function stopVideo() {


}

function takeSnapshot() {

	
}


document.querySelector('#openCamera').addEventListener('click', startVideo);
document.querySelector('#closeCamera').addEventListener('click', stopVideo);
document.querySelector('#takeSnapshot').addEventListener('click', takeSnapshot);


var sg = new SensorGrid({'div':'field'});
sg.start();

console.log(sg);