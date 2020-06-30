var Blinks = {};

Blinks.start = function(scene){
	Blinks._clock = new Phaser.Time.Clock(scene);
};
Blinks.update = function(time,delta){
	Blinks._clock.update( time, delta );
};

