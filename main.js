// Initialize global variables
var bgcanv, plantcanv, floracanv, properties, lsystem, rules;

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
		angles: [25.7 * Math.PI/180, 15 * Math.PI/180, Math.PI * 2/5]
	};

	for(var i = 0; i < maxIterations; i++) {
		lsystem.iterate();
		properties.distance /= 1.4;
	}
}

var drawPetal = function(turtle) {
	floractx.beginPath();
	floractx.ellipse(turtle.state[0], turtle.state[1], properties.petalLength, properties.petalLength/4, turtle.state[2], 0, 2 * Math.PI, true);
	floractx.fill();
	floractx.stroke();
	floractx.closePath();
}

var drawLeaf = function(turtle) {
	floractx.globalAlpha = 0.7;
	floractx.beginPath();
	floractx.moveTo(turtle.state[0], turtle.state[1]);
	floractx.bezierCurveTo(
		turtle.state[0] - properties.leafRadius + Math.cos(turtle.state[2]), 
		turtle.state[1] + Math.sin(turtle.state[2]) * properties.leafRadius, 
		turtle.state[0] + properties.leafRadius + Math.cos(turtle.state[2]), 
		turtle.state[1] + Math.sin(turtle.state[2]) * properties.leafRadius,
		turtle.state[0], 
		turtle.state[1]);
	floractx.fill();
	floractx.closePath();
	floractx.globalAlpha = 1;
}

// Plant renderer obj
var plantRenderer = function(lsystem) {
	var turtle = new Turtle(
		// Initial state
		[plantcanv.width/2, plantcanv.height, -Math.PI / 2]
	);
	for(var i = 0; i < lsystem.sentence.length; i++){
		
		switch(lsystem.sentence.charAt(i)) {
		case 'F':
			plantctx.beginPath();
			plantctx.lineWidth = properties.bWidth;
			plantctx.strokeStyle = '#614126';
			plantctx.moveTo(turtle.state[0], turtle.state[1]);
			turtle.state[0] += Math.cos(turtle.state[2]) * properties.distance;
			turtle.state[1] += Math.sin(turtle.state[2]) * properties.distance;
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
			break;
		case ']':
			turtle.state = turtle.stack.pop();
			properties.bWidth *= 6/4;
			break;
		case 'f':
			floractx.fillStyle = '#edd8e9';
			floractx.strokeStyle = '#edd8e9';
			for(var j = 0; j < 5; j++) {
				drawPetal(turtle);
				turtle.state[2] += properties.angles[2];
			}

			floractx.beginPath();
			floractx.fillStyle = '#e4097d';
			floractx.arc(turtle.state[0], turtle.state[1], properties.petalLength / 3, 0, 2 * Math.PI, false);
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
};

// Mathematical functions
var avg = function(x, y, p) {
	return Math.round(x * (1 - p) + y * p);
}

var k = 10;
var sigmoid = function(x) {
	return 1 / (1 + Math.pow(Math.E, -k * x));
}

var sigprime = function(x) {
	return sigmoid(x) * (1 - sigmoid(x));
}

var animationLoop;

(function(){
var theta = 0;
var dtheta = Math.PI/1000;
var colors = [
	[94, 53, 177], // Purple
	[0, 0, 0], // Black

	[255, 235, 59], // Yellow
	[100, 181, 246] // Blue
];

var progress = 0.01;
var inc = true;

animationLoop = function() {
	// Modify angles
	theta += dtheta;
	theta %= Math.PI * 2;
	properties.angles[0] = (Math.sin(theta) + 4) / 10;
	floractx.clearRect(0, 0, plantcanv.width, plantcanv.height);
	plantctx.clearRect(0, 0, plantcanv.width, plantcanv.height);
	properties.bWidth = 10;

	// Passage of time
	properties.distance = progress * 50;
	properties.petalLength = progress * 15;
	properties.leafRadius = progress * 40;
	
	progress += (inc ? 1 : -1) * sigprime(progress - .5) / 20;

	if(progress >= 1) {
		inc ^= true;
	}
	else if(progress < 0.01) {
		newPlant();
		inc ^= true;
	}

	console.log(progress);

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
