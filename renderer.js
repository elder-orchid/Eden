// Draws a petal at the current location
var drawPetal = function(turtle, percent) {
	floractx.beginPath();
	floractx.ellipse(turtle.state[0], turtle.state[1], properties.petalLength * percent, properties.petalLength * percent/4, turtle.state[2], 0, 2 * Math.PI, true);
	floractx.fill();
	floractx.stroke();
	floractx.closePath();
}

// Draws a leaf at the current location
var drawLeaf = function(turtle, percent) {
	floractx.beginPath();
	floractx.moveTo(turtle.state[0], turtle.state[1]);
	floractx.bezierCurveTo(
		turtle.state[0] - properties.leafRadius * percent + Math.cos(turtle.state[2]), 
		turtle.state[1] + Math.sin(turtle.state[2]) * properties.leafRadius * percent, 
		turtle.state[0] + properties.leafRadius * percent + Math.cos(turtle.state[2]), 
		turtle.state[1] + Math.sin(turtle.state[2]) * properties.leafRadius * percent,
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

	var stepsize = 1.0 / (maxIterations);
	var percent = Math.abs((progress - (properties.depth * stepsize)) / stepsize);
	var cd = 0;
	var branches = branchCounter(lsystem.sentence, properties.depth);
	var leafsize;
	//console.log("depth: " + properties.depth + ", percent: " + percent + ", branches: " + branches + ", branch: " + Math.floor(percent * branches));

	for(var i = 0; i < lsystem.sentence.length; i++) {
		leafsize = 0;
		leafsize = (cd == properties.depth) ? percent : leafsize;
		leafsize = (cd <  properties.depth) ? 1 : leafsize;

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
				drawPetal(turtle, leafsize);
				turtle.state[2] += properties.angles[2];
			}

			// Draw the center of the flower
			floractx.beginPath();
			floractx.fillStyle = '#e4097d';
			floractx.arc(turtle.state[0], turtle.state[1], properties.petalLength * leafsize / 3, 0, 2 * Math.PI, false);
			floractx.fill();
			floractx.closePath();
			break;
		case 'l': 
			floractx.fillStyle = 'green';
			floractx.strokeStyle = 'darkgreen';
			floractx.lineWidth = 2;
			drawLeaf(turtle, leafsize);
			break;
		}
	}
	if (progress > stepsize * (properties.depth + 1)) {
		properties.depth++;
	}
	else if(progress < stepsize * properties.depth) {
		properties.depth--;
	}
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