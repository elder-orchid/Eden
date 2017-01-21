// Custom functions and configs
configureEvents();

// Initialize global variables
var bgcanv = document.getElementById("bgcanv"), bgctx = bgcanv.getContext("2d");
var plantcanv = document.getElementById("plantcanv"), plantctx = plantcanv.getContext("2d");
var floracanv = document.getElementById("floracanv"), floractx = floracanv.getContext("2d");

// Setup rules
var rules = {
	// 'F' : new WeightedList({'F[+F]F[-F]F' : .33, 'F[+F]F': .33, 'F[-F]F': .34})
	'F' : new WeightedList({'F[+F]F[-F]F' : .3, 'F[+F]Fl[-F]F' : .7, 'F[+F]F': .7, 'F[-F]F': .7, 'F[+Ff]F': .3, 'F[-Ff]F': .3}),
	'f' : new WeightedList({'' : 1}),
	'l]' : new WeightedList({']' : 1}),
};

var lsystem = new LSystem('F', rules);

// Plant renderer obj
var plantRenderer = function(lsystem) {
	console.log(lsystem.sentence);
	var turtle = new Turtle(
		// Initial state
		[plantcanv.width/2, plantcanv.height, -Math.PI / 2],
		// Angles
		[25.7 * (Math.PI/180), 15  * (Math.PI/180)]
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
			turtle.state[2] += turtle.angles[Math.floor(Math.random() * turtle.angles.length)];
			break; 
		case '+':
			turtle.state[2] -= turtle.angles[Math.floor(Math.random() * turtle.angles.length)];
			break;
		case '[':
			turtle.stack.push(JSON.parse(JSON.stringify(turtle.state)));
			properties.bWidth *= 1.05;
			break;
		case ']':
			turtle.state = turtle.stack.pop();
			properties.bWidth *= .95;
			break;
		case 'f':
			floractx.beginPath();
			floractx.arc(turtle.state[0], turtle.state[1], 10, 0, 2 * Math.PI, false);
			floractx.fillStyle = 'pink';
			floractx.fill();
			floractx.closePath();
			break;
		case 'l': 
			floractx.beginPath();
			floractx.ellipse(turtle.state[0], turtle.state[1], 20, 5, turtle.state[2], 0, 2 * Math.PI, true);
			floractx.fillStyle = 'green';
			floractx.fill();
			floractx.strokeStyle = 'darkgreen';
			floractx.lineWidth = 2;
			floractx.stroke();
			floractx.closePath();
			break;
		}
	}
};


var grd = bgctx.createLinearGradient(0, 0, 0, bgcanv.height);
grd.addColorStop(0, "lightblue");
grd.addColorStop(1, "white");

bgctx.fillStyle = grd;
bgctx.fillRect(0, 0, bgcanv.width, bgcanv.height);

var properties = { distance: 400, bWidth: 4};

var maxIterations = 5;

for(var i = 0; i < maxIterations; i++) {
	lsystem.iterate();
	properties.distance /= 2;
}

plantRenderer(lsystem);