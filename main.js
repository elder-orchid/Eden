// Custom functions and configs
configureEvents();

String.prototype.startsWith = function(needle)
{
    return(this.indexOf(needle) == 0);
};

// Initialize global variables
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

// Setup rules
var rules = {
	'F' : new WeightedList({'F[+F]F[-F]F' : .8, 'F[+F]Fl[-F]F' : .2, 'F[+F]F': .7, 'F[-F]F': .7, 'F[+Ff]F': .3, 'F[-Ff]F': .3}), 
	'f' : new WeightedList({'' : 1})
};

var lsystem = new LSystem('F', rules);

// Plant renderer obj
var plantRenderer = function(lsystem) {
	console.log(lsystem.sentence);
	var turtle = new Turtle(
		// Initial state
		[c.width/2, c.height, -Math.PI / 2], 
		// Line length
		properties.dist,
		// Angles
		[25.7 * (Math.PI/180), 15  * (Math.PI/180)]
	);
	for(var i = 0; i < lsystem.sentence.length; i++){
		switch(lsystem.sentence.charAt(i)) {
		case 'F':
			ctx.beginPath();
			ctx.lineWidth = properties.bWidth;
			ctx.strokeStyle = '#614126';
			ctx.moveTo(turtle.state[0], turtle.state[1]);
			turtle.state[0] += Math.cos(turtle.state[2]) * properties.distance;
			turtle.state[1] += Math.sin(turtle.state[2]) * properties.distance;
			ctx.lineTo(turtle.state[0], turtle.state[1]);
			ctx.stroke();
			ctx.closePath();
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
			ctx.beginPath();
			ctx.arc(turtle.state[0], turtle.state[1], 10, 0, 2 * Math.PI, false);
			ctx.fillStyle = 'pink';
			ctx.fill();
			ctx.closePath();
			break;
		case 'l': 
			ctx.beginPath();
			ctx.ellipse(turtle.state[0], turtle.state[1], 10, 5, Math.PI/6 * (Math.random() < 0.5 ? -1 : 1) + turtle.state[2], 0, 2 * Math.PI, true);
			ctx.fillStyle = 'green';
			ctx.fill();
			ctx.closePath();
			break;
		}
	}
};

ctx.fillStyle = "#d3d3d3"
ctx.fillRect(0, 0, c.width, c.height);

var properties = { distance: 10, bWidth: 4};

var maxIterations = 5;

for(var i = 0; i < maxIterations; i++) {
	lsystem.iterate();
	properties.dist /= 2;
}
plantRenderer(lsystem);