var canv, ctx, turtle, progress = [];

var initCanvas = function() {
	canv = document.getElementById("canv"), ctx = canv.getContext("2d");
	// Set dimensions to fullscreen
	canv.width = window.innerWidth;
	canv.height = window.innerHeight;

	turtle = new Turtle(
		// Initial state
		[canv.width/2, canv.height, -Math.PI / 2]
	);

	requestAnimationFrame(animationLoop);
}

var drawLine = function(turtle, progress) {
	ctx.beginPath();
	ctx.lineWidth = 5;
	ctx.strokeStyle = '#614126';
	ctx.moveTo(turtle.state[0], turtle.state[1]);
	var x = turtle.state[0] + Math.cos(turtle.state[2]) * 40 * progress;
	var y = turtle.state[1] + Math.sin(turtle.state[2]) * 40 * progress;
	ctx.lineTo(x, y);
	ctx.stroke();
	ctx.closePath();
}

animationLoop = function() {

	ctx.fillRect(0, 0, canv.width, canv.height);
	drawLine(turtle);
	if (progress < 1) {
		progress += 0.01;
	} else {
		progress = 0;
	}

	console.log(progress);
	requestAnimationFrame(animationLoop);
};