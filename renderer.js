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
	// Save the state so our transformations are not permanent
	floractx.save();
	
	// Get into position and rotate
	floractx.translate(turtle.state[0], turtle.state[1]);
	floractx.rotate(turtle.state[2]);

	// Find the width, dependent on the length
	var leafWidth = properties.leafLength / 2 * percent;

	// Each bezier curve is half of the leaf
	floractx.beginPath();
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

	// Draw a line through the leaf and outline the whole shape
	floractx.moveTo(0,0);
	floractx.lineWidth = properties.leafLength / 40;
	floractx.lineTo(properties.leafLength * percent, 0);
	floractx.stroke();

	// Restore the ctx to its original state
	floractx.restore();
}

// Plant renderer obj
var plantRenderer = function(lsystem) {
	var turtle = new Turtle(
		// Initial state
		[plantcanv.width/2, plantcanv.height, -Math.PI / 2]
	);

	var leafsize;
	var stepsize = 1.0 / (maxIterations);
	var percent = Math.abs((progress - (properties.depth * stepsize)) / stepsize);
	var cd = 0;
	var factors = [0.66, 0.9, 1.25, 1.4];

	// Iterate through every character in the L-System
	for(var i = 0; i < lsystem.sentence.length; i++) {

		// Leafsize is used to grow leaves and flowers at a steady rate
		// once their branch has been grown.
		leafsize = 0;
		leafsize = (cd == properties.depth) ? percent : leafsize;
		leafsize = (cd <  properties.depth) ? 1 : leafsize;

		switch(lsystem.sentence.charAt(i)) {
		case 'F':
			// Draw a branch
			plantctx.beginPath();
			plantctx.lineWidth = properties.bWidth;
			plantctx.strokeStyle = '#614126';
			plantctx.moveTo(turtle.state[0], turtle.state[1]);
			var x = Math.cos(turtle.state[2]) * properties.distance;
			var y = Math.sin(turtle.state[2]) * properties.distance;

			// If we are currently growing this branch, use percent.
			if (cd == properties.depth) { 
				x *= percent;
				y *= percent;
			}

			// If the branch is supposed to be drawn right now, do so.
			if (cd <= properties.depth) {
				turtle.state[0] += x;
				turtle.state[1] += y;
			}

			plantctx.lineTo(turtle.state[0], turtle.state[1]);
			plantctx.stroke();
			plantctx.closePath();
			break;
		case '-':
			// Rotate left
			turtle.state[2] += properties.angles[0];
			break; 
		case '+':
			// Rotate right
			turtle.state[2] -= properties.angles[1];
			break;
		case '[':
			// Move down a layer
			turtle.stack.push(JSON.parse(JSON.stringify(turtle.state)));
			properties.bWidth *= factors[0];
			properties.distance *= factors[1];
			properties.leafLength *= factors[2];
			properties.petalLength *= factors[3];
			cd++;
			break;
		case ']':
			// Move up a layer
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
			// Draw a leaf
			floractx.fillStyle = 'green';
			floractx.strokeStyle = 'darkgreen';
			drawLeaf(turtle, leafsize);
			break;
		}
	}

	// If it has been long enough, start drawing the next layer
	if (progress > stepsize * (properties.depth + 1)) {
		properties.depth++;
	}
	// If we're shrinking, decrease the number of layers being drawn
	else if(progress < stepsize * properties.depth) {
		properties.depth--;
	}
};


// Draw a simple moon in the top left
var luna = function () {
	// Make the moon's size dependent on the height of the screen
	// Helps to make things more proportional on phones
	var size = h / 10;
	var c1 = [255, 255, 255];
	var c2 = [255, 201, 34];

	var color = "rgb(" + 
			avg(c1[0], c2[0], progress) + "," + 
			avg(c1[1], c2[1], progress) + "," + 
			avg(c1[2], c2[2], progress) + ")";
	bgctx.fillStyle = color;

	bgctx.ellipse(w * 0.1, h * 0.2, size, size, 0, 0, Math.PI * 2);
	bgctx.fill();
}