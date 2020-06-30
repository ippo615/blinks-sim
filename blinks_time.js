Blinks.Time = {};
Blinks.Time.millis = function(){
	return Blinks._clock.now;
}
Blinks.Time._timers = [];

(function(Blinks){
	class Timer {
		constructor(){
			this._durationMS = 0;
			this._startTime = 0;
			this._canExpire = true;
		}
		set( milliseconds ){
			this._durationMS = milliseconds;
			this._startTime = Blinks.Time.millis();
			this._canExpire = true;
		}
		getRemaining(){
			var deltaMS = Blinks.Time.millis() - this._startTime;
			var remaining = this._durationMS - deltaMS;
			//console.info( deltaMS );
			//console.info( remaining );
			if( remaining <= 0 ){
				return 0;
			}
			return remaining;
		}
		isExpired(){
			if( ! this._canExpire ){
				return false;
			}
			return (this.getRemaining() == 0);
		}
		never(){
			this._canExpire = false;
		}
	}
	Blinks.Time.Timer = Timer;
})(Blinks);

