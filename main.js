/*
Written by Nicolas Gonzalez.

This code was written in an attempt to model the random growth patterns of trees!

For further reference on the concepts being implemented here, be sure to check out:
http://algorithmicbotany.org/papers/#abop
The Algorithmic Beauty of Plants is an incredible book and was my inspiration for this project.
*/

// Instantiate / initialize global variables
var bgcanv, plantcanv, floracanv, properties, lsystem, rules, audio;
var preLeaf, preFlower;

var progress = 0;
var w = window.innerWidth;
var h = window.innerHeight;

var initCanvas = function() {
	// Initialize canvases
	bgcanv = document.getElementById("bgcanv"), bgctx = bgcanv.getContext("2d");
	plantcanv = document.getElementById("plantcanv"), plantctx = plantcanv.getContext("2d");
	floracanv = document.getElementById("floracanv"), floractx = floracanv.getContext("2d");

	// Set dimensions to fullscreen
	bgcanv.width = w;
	bgcanv.height = h;

	plantcanv.width = w;
	plantcanv.height = h;

	floracanv.width = w;
	floracanv.height = h;

	floractx.globalAlpha = 0.7;

	// Load in the audio. If the audio can't be played, 
	// the user can start it by clicking the screen.
	audio = new Audio('assets/eden.mp3');
	audio.addEventListener('ended', function() {
	    this.currentTime = 0;
	    this.play();
	}, false);
	var playPromise = audio.play();

	if (playPromise !== undefined) {
		playPromise.then(_ => {
			console.log("audio autoplayed successfully.");
			// Automatic playback started!
		})
		.catch(error => {
			console.log("audio error!");
			// Auto-play was prevented
		});
	}

	// Create a new plant
	newPlant();

	// Pre-render leaves and flowers. We only need to do this once
	preLeaf = drawLeaf();
	preFlower = drawFlower();

	// Start the animation loop!
	requestAnimationFrame(animationLoop);
};

var newPlant = function() {
	floractx.clearRect(0, 0, floracanv.width, floracanv.height);
	plantctx.clearRect(0, 0, plantcanv.width, plantcanv.height);

	// Creates the set of rules for our lsystem
	rules = {
		'F': new WeightedList({
			'F[-F+F][+Fl]': .33, 
			'F[-Fl][+F[-F]F]': .33 * .8, 
			'F[-F][+F[-Fl]Ff]': .33 * .2, 
			'F[-Fl]F': .33
		})
	};

	lsystem = new LSystem('F', rules), maxIterations = 5;

	properties = { 
		// Properties of the plant.
		angles: [25.7 * Math.PI/180, 15 * Math.PI/180],
		bWidth: 10,
		distance: 50,
		petalLength: 50,
		leafLength: 200,
		depth: 0,
		factors: [0.66, 0.9, 1.25, 1.2]
	};

	for(var i = 0; i < maxIterations; i++) {
		lsystem.iterate();
	}
};

// Mathematical functions
var avg = function(x, y, p) {
	return Math.round(x * (1 - p) + y * p);
};

var sigmoid = function(x) {
	return 1 / (1 + Math.pow(1.1, -(x-60)));
};

var approxeq = function(v1, v2) {
  return Math.abs(v1 - v2) < 0.001;
};

var clicker = function() {
	console.log("clicked");
	
	if (audio.paused) {
		audio.play();
	}
};

var animationLoop;
(function(){
var bgcolors = [
	[94, 53, 177],  // Purple
	[0, 0, 0], 		// Black
	[255, 235, 59], // Yellow
	[100, 181, 246] // Blue
];

var inc = true;
var startingTime;
var totalElapsedTime;

animationLoop = function(currentTime) {
	if(!startingTime){startingTime=currentTime;}
	totalElapsedTime=(currentTime-startingTime);

	// Wiggle the angle
	properties.angles[0] = (Math.cos(progress * Math.PI * 2) + 4) / 10;
	properties.angles[1] = (Math.sin(progress * Math.PI * 2) + 4) / 10;
	// Clear the canvases
	floractx.clearRect(0, 0, floracanv.width, floracanv.height);
	plantctx.clearRect(0, 0, plantcanv.width, plantcanv.height);

	// This variable denotes our overall tree growth on a scale of 0 to 1.
	progress = Math.abs((inc ? 0 : 1) + (inc ? 1 : -1) * sigmoid(totalElapsedTime / 50));
	
	// In order to grow and then shrink, we have to oscliate our values.
	if(approxeq(progress, 1.0)){
		inc ^= true;
		startingTime = currentTime;
	}
	else if(approxeq(progress, 0.0)) {
		newPlant();
		inc ^= true;
		startingTime = currentTime;
	}

	// Create the background gradient
	var grd = bgctx.createLinearGradient(0, 0, 0, bgcanv.height);
	for(var i = 0; i < 2; i++) {
		grd.addColorStop(i, "rgb(" + 
			avg(bgcolors[i][0], bgcolors[2+i][0], progress) + "," + 
			avg(bgcolors[i][1], bgcolors[2+i][1], progress) + "," + 
			avg(bgcolors[i][2], bgcolors[2+i][2], progress) + ")");
	}

	bgctx.fillStyle = grd;
	bgctx.fillRect(0, 0, bgcanv.width, bgcanv.height);

	// Render the plant
	plantRenderer(lsystem);

	// Render the moon
	luna();

	requestAnimationFrame(animationLoop);
}
})();