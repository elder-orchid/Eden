function configureEvents() {
	addEvent(window, 'click', onClick);
}

function addEvent(object, type, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
    } else {
        object["on"+type] = callback;
    }
};


function onClick() {
	newPlant();
	//floractx.clearRect(0, 0, plantcanv.width, plantcanv.height);
	//plantctx.clearRect(0, 0, plantcanv.width, plantcanv.height);
	//plantRenderer(lsystem);
}