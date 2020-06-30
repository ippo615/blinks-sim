
Blinks.Util = {};
// Blinks.Util.FOREACH_FACE(){} --> not possible here
Blinks.Util.COUNT_OF = function( array ){
	return array.length;
};
Blinks.Util.sin8_C_js = function(theta){
	// Maps theta 0-255 to values 0-255 in a sine wave
	var detailedAngle = Blinks.Util.map( theta, 0, 255, 0, Math.PI*2 );
	var detailedValue = Math.sin( detailedAngle );
	return 128+Math.floor(Blinks.Util.map( detailedValue, -1, 1, 0, 255 ));
};
Blinks.Util.random = function( maxInt ){
	return Math.floor( Math.random()*maxInt );
};
Blinks.Util.randomWord = function(){
	// 16-bit word
	return Math.floor( Math.random()*0xFFFF );
};
Blinks.Util.randomize = function(){
	// dont do anything - we'll just use js's randomness
};

Blinks.Util.map = function( value, fromMin, fromMax, toMin, toMax ){
	var fromDelta = fromMax - fromMin;
	var percentPosition = value / fromDelta;
	var toDelta = toMax - toMin;
	return toMin + percentPosition*toDelta;
}
Blinks.Util.FACE_COUNT = 6;
Blinks.Util.MAX_BRIGHTNESS = 255;
Blinks.Util.hasWoken = function(){
	// not sure the actual behvaiour of this
	return true;
}
Blinks.Util.startState = function(){
	// no clue what this does
	return 0x01;
}

