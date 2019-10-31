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
	floractx.save();
	

	var leafWidth = properties.leafLength / 2 * percent;

	floractx.beginPath();
	floractx.translate(turtle.state[0], turtle.state[1]);
	floractx.rotate(turtle.state[2]);
	floractx.moveTo(0,0);
	floractx.bezierCurveTo(properties.leafLength / 4 * percent, leafWidth / 2 * percent, 
						   properties.leafLength / 2 * percent, leafWidth / 2 * percent,
						   properties.leafLength * percent, 0);
	floractx.moveTo(0,0);
	floractx.bezierCurveTo(properties.leafLength / 4 * percent, -leafWidth / 2 * percent,
						   properties.leafLength / 2 * percent, -leafWidth / 2 * percent, 
						   properties.leafLength * percent, 0);
	floractx.fill();
	floractx.closePath();

	floractx.moveTo(0,0);
	floractx.lineWidth = properties.leafLength / 40;
	floractx.lineTo(properties.leafLength * percent, 0);
	floractx.stroke();

	floractx.restore();
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
	var leafsize;
	var factors = [0.66, 0.9, 1.25, 1.4];

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
			var x = Math.cos(turtle.state[2]) * properties.distance;
			var y = Math.sin(turtle.state[2]) * properties.distance;

			if (cd == properties.depth) { 
				x *= percent;
				y *= percent;
			}

			if (cd <= properties.depth) {
				turtle.state[0] += x;
				turtle.state[1] += y;
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
			properties.bWidth *= factors[0];
			properties.distance *= factors[1];
			properties.leafLength *= factors[2];
			properties.petalLength *= factors[3];
			cd++;
			break;
		case ']':
			turtle.state = turtle.stack.pop();
			properties.bWidth /= factors[0];
			properties.distance /= factors[1];
			properties.leafLength /= factors[2];
			properties.petalLength /= factors[3];
			cd--;
			break;
		case 'f':
			// Draw a flower
			var petals = 5;
			floractx.fillStyle = '#edd8e9';
			floractx.strokeStyle = '#edd8e9';
			for(var j = 0; j < petals; j++) {
				// Draw 5 distinct petals
				drawPetal(turtle, leafsize);
				turtle.state[2] += Math.PI * 2 / petals;
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