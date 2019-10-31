// Initialize global variables
var bgcanv, plantcanv, floracanv, properties, lsystem, rules;
var progress = 0;
var initCanvas = function() {
	// Initialize canvases
	bgcanv = document.getElementById("bgcanv"), bgctx = bgcanv.getContext("2d");
	plantcanv = document.getElementById("plantcanv"), plantctx = plantcanv.getContext("2d");
	floracanv = document.getElementById("floracanv"), floractx = floracanv.getContext("2d");

	// Set dimensions to fullscreen
	bgcanv.width = window.innerWidth;
	bgcanv.height = window.innerHeight;

	plantcanv.width = window.innerWidth;
	plantcanv.height = window.innerHeight;

	floracanv.width = window.innerWidth;
	floracanv.height = window.innerHeight;

	var audio = new Audio('assets/eden.mp3');
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
	console.log(lsystem.sentence);
}

// Draws a petal at the current location
var drawPetal = function(turtle) {
	floractx.beginPath();
	floractx.ellipse(turtle.state[0], turtle.state[1], properties.petalLength * progress, properties.petalLength * progress/4, turtle.state[2], 0, 2 * Math.PI, true);
	floractx.fill();
	floractx.stroke();
	floractx.closePath();
}

// Draws a leaf at the current location
var drawLeaf = function(turtle) {
	floractx.beginPath();
	floractx.moveTo(turtle.state[0], turtle.state[1]);
	floractx.bezierCurveTo(
		turtle.state[0] - properties.leafRadius * progress + Math.cos(turtle.state[2]), 
		turtle.state[1] + Math.sin(turtle.state[2]) * properties.leafRadius * progress, 
		turtle.state[0] + properties.leafRadius * progress + Math.cos(turtle.state[2]), 
		turtle.state[1] + Math.sin(turtle.state[2]) * properties.leafRadius * progress,
		turtle.state[0], 
		turtle.state[1]);
	floractx.fill();
	floractx.closePath();
}

// Plant renderer obj
var plantRenderer = function(lsystem) {
	var turtle = new Turtle(
		// Initial state
		[plantcanv.width/2, plantcanv.height, -Math.PI / 2]
	);

	// percent growth of this layer
	var stepsize = 1.0 / (maxIterations + 1);

	//var percent = ((progress - (depth * stepsize)) / ((depth + 1) * stepsize)) % 1;
	var percent = (progress - (properties.depth * stepsize)) / stepsize;
	var cd = 0;


	var branches = branchCounter(lsystem.sentence, properties.depth);
	console.log("depth: " + properties.depth + ", percent: " + percent + ", branches: " + branches + ", branch: " + Math.floor(percent * branches));

	for(var i = 0; i < lsystem.sentence.length; i++) {
		switch(lsystem.sentence.charAt(i)) {
		case 'F':
			plantctx.beginPath();
			plantctx.lineWidth = properties.bWidth;
			plantctx.strokeStyle = '#614126';
			
			plantctx.moveTo(turtle.state[0], turtle.state[1]);

			if (cd == properties.depth) {
				turtle.state[0] += Math.cos(turtle.state[2]) * properties.distance * percent;
				turtle.state[1] += Math.sin(turtle.state[2]) * properties.distance * percent;
			}
			else if (cd < properties.depth) {
				turtle.state[0] += Math.cos(turtle.state[2]) * properties.distance;
				turtle.state[1] += Math.sin(turtle.state[2]) * properties.distance;
			}
			plantctx.lineTo(turtle.state[0], turtle.state[1]);
			plantctx.stroke();
			plantctx.closePath();
			break;
		case '-':
			turtle.state[2] += properties.angles[0];
			break; 
		case '+':
			turtle.state[2] -= properties.angles[1];
			break;
		case '[':
			turtle.stack.push(JSON.parse(JSON.stringify(turtle.state)));
			properties.bWidth *= 4/6;
			properties.distance *= 1/1.1;
			cd++;
			break;
		case ']':
			turtle.state = turtle.stack.pop();
			properties.bWidth *= 6/4;
			properties.distance *= 1.1;
			cd--;
			break;
		case 'f':
			// Draw a flower
			floractx.fillStyle = '#edd8e9';
			floractx.strokeStyle = '#edd8e9';
			for(var j = 0; j < 5; j++) {
				// Draw 5 distinct petals
				drawPetal(turtle);
				turtle.state[2] += properties.angles[2];
			}

			// Draw the center of the flower
			floractx.beginPath();
			floractx.fillStyle = '#e4097d';
			floractx.arc(turtle.state[0], turtle.state[1], properties.petalLength * progress / 3, 0, 2 * Math.PI, false);
			floractx.fill();
			floractx.closePath();
			break;
		case 'l': 
			floractx.fillStyle = 'green';
			floractx.strokeStyle = 'darkgreen';
			floractx.lineWidth = 2;
			drawLeaf(turtle);
			break;
		}
	}

	if (progress > stepsize * (properties.depth + 1)) {
		properties.depth++;
	}
	else if(progress < stepsize * properties.depth) {
		properties.depth--;
	}

	// (1/branches)

	// Determine how many branches are on the current level



};

var branchCounter = function(sentence, depth) {
	var cd = 0, branches = 0;

	for (var i = 0; i < sentence.length; i++) {
		switch(sentence.charAt(i)) {
			case '[':
				cd++;
				break;
			case ']':
				cd--;
				break;
			case 'F':
				if (cd == depth) {
					branches++;
				}
				break;
			default:
				break;
		}
	}

	return branches;
}


// Mathematical functions
var avg = function(x, y, p) {
	return Math.round(x * (1 - p) + y * p);
}

var sigmoid = function(x) {
	return 1 / (1 + Math.pow(1.1, -x));
}

var sigprime = function(x) {
	return sigmoid(x) * (1 - sigmoid(x));
}

var animationLoop;
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

	// Wiggle the angle
	theta += dtheta;
	theta %= Math.PI * 2;
	properties.angles[0] = (Math.sin(theta) + 4) / 10;

	// Clear the canvases
	floractx.clearRect(0, 0, plantcanv.width, plantcanv.height);
	plantctx.clearRect(0, 0, plantcanv.width, plantcanv.height);
	
	properties.bWidth = 10;
	properties.distance = 50;

	progress += (inc ? 1 : -1) * sigmoid(totalElapsedTime) / 500;

	if(progress >= 0.99) {
		inc ^= true;
		progress = 0.99;
		startingTime = currentTime;
	}
	else if(progress < 0.01) {
		newPlant();
		inc ^= true;
		progress = 0.01;
		startingTime = currentTime;
	}

	//console.log(Math.round(totalElapsedTime) + " : \t" + progress);

	// Create gradient
	var grd = bgctx.createLinearGradient(0, 0, 0, bgcanv.height);
	for(var i = 0; i < 2; i++) {
		grd.addColorStop(i, "rgb(" + avg(colors[i][0], colors[2+i][0], progress) + "," + avg(colors[i][1], colors[2+i][1], progress) + "," + avg(colors[i][2], colors[2+i][2], progress) + ")");
	}

	bgctx.fillStyle = grd;
	bgctx.fillRect(0, 0, bgcanv.width, bgcanv.height);

	plantRenderer(lsystem);
	requestAnimationFrame(animationLoop);
}	
})();
