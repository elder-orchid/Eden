// Draws a flower at the current location
var drawFlower = function(turtle, percent) {
	console.log("drawing to the leafCanv");

	const canv = document.createElement('canvas');

	canv.width = properties.petalLength * 2;
	canv.height = properties.petalLength * 2;
	const ctx = canv.getContext('2d');

	// Draw a flower
	var petals = 5;
	var angle = 0;
	ctx.fillStyle = '#edd8e9';
	ctx.strokeStyle = '#edd8e9';

	ctx.translate(canv.width / 2, canv.height / 2);

	for(var j = 0; j < petals; j++) {
		// Draw 5 distinct petals
		ctx.beginPath();
		ctx.ellipse(0, 0, properties.petalLength, properties.petalLength / 4, angle, 0, 2 * Math.PI, true);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		angle += Math.PI * 2 / petals;
	}

	// Draw the center of the flower
	ctx.beginPath();
	ctx.fillStyle = '#e4097d';
	ctx.arc(0, 0, properties.petalLength / 3, 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();

	return canv;
}

// Draws a leaf at the current location
var drawLeaf = function(turtle, percent) {
	console.log("drawing to the leafCanv");

	const canv = document.createElement('canvas');

	canv.width = properties.leafLength;
	canv.height = properties.leafLength / 2;
	const ctx = canv.getContext('2d');


	// Draw a leaf
	ctx.fillStyle = 'green';
	ctx.strokeStyle = 'darkgreen';
	// Find the width, dependent on the length

	// Each bezier curve is half of the leaf
	ctx.beginPath();
	ctx.translate(0, canv.height / 2);
	ctx.moveTo(0,0);
	ctx.bezierCurveTo(canv.width / 4, canv.height / 2, 
					  canv.width / 2, canv.height / 2,
					  canv.width / 1, 0);
	ctx.moveTo(0,0);
	ctx.bezierCurveTo(canv.width / 4, -canv.height / 2,
					  canv.width / 2, -canv.height / 2, 
					  canv.width / 1, 0);
	ctx.fill();
	ctx.translate(0, -canv.height / 2);
	ctx.closePath();

	// Draw a line through the leaf and outline the whole shape
	ctx.moveTo(0,0);
	ctx.lineWidth = properties.leafLength / 40;
	ctx.lineTo(properties.leafLength * percent, 0);
	ctx.stroke();

	return canv;
}

// Plant renderer obj
var plantRenderer = function(lsystem) {
	plantctx.beginPath();
	bgctx.beginPath();
	floractx.beginPath();


	var turtle = new Turtle(
		// Initial state
		[plantcanv.width/2, plantcanv.height, -Math.PI / 2]
	);

	var leafsize;
	var stepsize = 1.0 / (maxIterations);
	var percent = Math.abs((progress - (properties.depth * stepsize)) / stepsize);
	var cd = 0;
	var factors = [0.66, 0.9, 1.25, 1.2];

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
			cd++;
			break;
		case ']':
			// Move up a layer
			turtle.state = turtle.stack.pop();
			properties.bWidth /= factors[0];
			properties.distance /= factors[1];
			cd--;
			break;
		case 'f':
			var factor = leafsize / 10 * (cd * factors[3]);
			floractx.save();
			floractx.beginPath();

			floractx.translate(turtle.state[0], turtle.state[1]);
			floractx.translate(-preFlower.width / 2 * factor, -preFlower.height / 2 * factor);

			floractx.drawImage(preFlower, 0, 0,  preFlower.width * factor, preFlower.height * factor);

			floractx.closePath();
			floractx.restore();
			break;
		case 'l':
			var factor = leafsize / 15 * (cd * factors[2]);
			floractx.save();
			floractx.beginPath();

			floractx.translate(turtle.state[0], turtle.state[1]);
			floractx.rotate(turtle.state[2]);
			floractx.translate(0, -preLeaf.height / 2 * factor);
			
			floractx.drawImage(preLeaf, 0, 0,  preLeaf.width * factor, preLeaf.height * factor);

			floractx.closePath();
			floractx.restore();
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