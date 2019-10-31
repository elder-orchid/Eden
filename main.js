// Initialize global variables
var bgcanv, plantcanv, floracanv, properties, lsystem, rules, audio;
var progress = 0;

var w = window.innerWidth,
	h = window.innerHeight;

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

	audio = new Audio('assets/eden.mp3');
	audio.addEventListener('ended', function() {
	    this.currentTime = 0;
	    this.play();
	}, false);
	audio.play();
	newPlant();
	requestAnimationFrame(animationLoop);
}

var newPlant = function() {
	floractx.clearRect(0, 0, floracanv.width, floracanv.height);
	plantctx.clearRect(0, 0, plantcanv.width, plantcanv.height);

	floractx.globalAlpha = 0.7;

	// Setup rules
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
		angles: [25.7 * Math.PI/180, 15 * Math.PI/180, Math.PI * 2/5],
		// Passage of time
		distance: 50,
		petalLength: 15,
		leafRadius: 40,
		depth: 0
	};

	for(var i = 0; i < maxIterations; i++) {
		lsystem.iterate();
	}
}

// Mathematical functions
var avg = function(x, y, p) {
	return Math.round(x * (1 - p) + y * p);
}

var sigmoid = function(x) {
	return 1 / (1 + Math.pow(1.1, -(x-60)));
}

var animationLoop, clicker;
(function(){
var theta = 0;
var dtheta = Math.PI/1000;
var colors = [
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

	clicker = function() {
		console.log("clicked");
		
		if (audio.paused) {
			audio.play();
		}

		newPlant();
		inc = true;
		progress = 0.01;
		startingTime = currentTime;
	}

	// Wiggle the angle
	theta += dtheta;
	theta %= Math.PI * 2;
	properties.angles[0] = (Math.sin(theta) + 4) / 10;

	// Clear the canvases
	floractx.clearRect(0, 0, plantcanv.width, plantcanv.height);
	plantctx.clearRect(0, 0, plantcanv.width, plantcanv.height);
	
	properties.bWidth = 10;
	properties.distance = 50;

	var timeFactor = 100;

	progress = Math.abs((inc ? 0 : 1) + (inc ? 1 : -1) * sigmoid(totalElapsedTime / timeFactor));
	//console.log((totalElapsedTime / timeFactor).toFixed(3) + " : \t" + progress);

	console.log("ct: " + currentTime);
	if(progress >= 0.999) {
		inc ^= true;
		progress = 0.9988;
		startingTime = currentTime;
	}
	else if(progress < 0.001) {
		newPlant();
		inc ^= true;
		progress = 0.01;
		startingTime = currentTime;
	}
	// Create gradient
	var grd = bgctx.createLinearGradient(0, 0, 0, bgcanv.height);
	for(var i = 0; i < 2; i++) {
		grd.addColorStop(i, "rgb(" + 
			avg(colors[i][0], colors[2+i][0], progress) + "," + 
			avg(colors[i][1], colors[2+i][1], progress) + "," + 
			avg(colors[i][2], colors[2+i][2], progress) + ")");
	}

	bgctx.fillStyle = grd;
	bgctx.fillRect(0, 0, bgcanv.width, bgcanv.height);

	plantRenderer(lsystem);
	requestAnimationFrame(animationLoop);
}



})();