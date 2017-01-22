function configureEvents() {
	addEvent(window, 'keydown', onKeyDown);
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
}

function onKeyDown(e) {
	if(e.which == 32)
		newPlant();
}