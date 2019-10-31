var canv, ctx, turtle, progress = [];
var stack    = [],
    w        = window.innerWidth,
    h        = window.innerHeight;

var initCanvas = function() {
	canv = document.getElementById("canv"), ctx = canv.getContext("2d");
	// Set dimensions to fullscreen
	canv.width = window.innerWidth;
	canv.height = window.innerHeight;

	turtle = new Turtle(
		// Initial state
		[canv.width/2, canv.height, -Math.PI / 2]
	);


	for(var x = 0; x<400;x++){stack.push(grass());}
	

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


	stack.forEach(function(el){
	  el();
	})

	requestAnimationFrame(animationLoop);
};



var grass = function(){
  var x = 0, y = 0;
  var maxTall = Math.random()*100;
  var maxSize = Math.random()*10+5;
  var speed = Math.random()*2;  
  var position = Math.random()*w-w/2;
  var c = function(l,u){return Math.round(Math.random()*(u||255)+l||0);}
  var color = 'rgb('+c(60,10)+','+c(201,50)+','+c(120,50)+')';
  return function(){
    var deviation=Math.cos(x/30)*Math.min(x/40,50),
        tall = Math.min(x/2,maxTall),
        size = Math.min(x/50,maxSize);
    x+=speed;
    ctx.save();
    ctx.strokeWidth=10;
    ctx.translate(w/2+position,h)
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.lineTo(-size,0);
    ctx.quadraticCurveTo(-size,-tall/2,deviation,-tall);
    ctx.quadraticCurveTo(size,-tall/2,size,0);
    ctx.fill();
    ctx.restore()
  }    
};

