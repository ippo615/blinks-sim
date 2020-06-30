
// https://blinks.games/api/

class BlinkFace {
	constructor( ){
		this.color = 0x000000;
		this.sentValue = 0;
		this.lastRecievedValue = 0;
		this.timerRecievedValue = new Blinks.Time.Timer();
		this.timerRecievedValue.set(1);
		this.didValueChange = false;
		this.partner = null;
	}
	setColor( color ){
		this.color = color;
	}
	setRecievedValue( value ){
		this.timerRecievedValue.set( Blinks.Config.faceValueExperationMS );
		if( value != this.lastRecievedValue ){
			this.didValueChange = true;
			this.lastRecievedValue = value;
		}
	}
	getLastRecievedValue(){
		this.didValueChange = false;
		return this.lastRecievedValue;
	}
	isRecievedValueExpired(){
		return this.timerRecievedValue.isExpired();
	}
	setPartner( otherFace ){
		this.partner = otherFace;
	}
	broadcast(){
		if( this.partner != null ){
			this.partner.setRecievedValue( this.sentValue );
		}
	}
}

class BlinkBase {

	constructor (scene, x, y){
		//super(scene, x, y);
		
		this.scene = scene;
		this.x = x;
		this.y = y;
		
		Blinks.start(this.scene);
		
		this._buttonPressed = false;
		this._buttonReleased = false;
		this._buttonHeldPrevious = false;
		this._buttonHeld = false;
		this._buttonLongPress = false;
		this._buttonClickCount = 0;
		this._isSelected = false;
		this._isDragging = false;
		//this._timerButtonPress = new Blinks.Time.Timer();
		this._timerLongPress = new Blinks.Time.Timer();
		this._timerLongPress.never();
		this._angle = 0;
		this._gameObjectAngleOffset = 0;
		
		this._gameObject = this.scene.add.star(this.x, this.y, 3, Blinks.Config.puckRadius, Blinks.Config.puckRadius, 0x000000);
		this._gameObject.setAngle(this._angle+this._gameObjectAngleOffset);
		this._gameObject.setScale(1);

		//  Make interactive and draggable
		this._gameObject.setInteractive();
		/*
		this.scene.input.setDraggable(this._gameObject);
		this.scene.input.on('dragstart', function (pointer, gameObject) {
			//this.scene.children.bringToTop(gameObject);
		}, this);
		*/
		var that = this;
		this._gameObject.on('pointerdown', function(pointer, localX, localY, event){
			if( that.scene.inputStyle == that.scene.INPUT_STYLE_B ){
				if( ! that._isDragging ){
					that._isSelected = ! that._isSelected;
				}
			}
			if( that.scene.inputStyle == that.scene.INPUT_STYLE_A ){
				if( that.scene.inputMode == that.scene.INPUT_MODE_ROTATE ){
					that._isSelected = true;
					that.scene.inputRotate();
					that._isSelected = false;
				}
				if( that.scene.inputMode == that.scene.INPUT_MODE_CLICK ){
					that.jsPress();
				}
				if( that.scene.inputMode == that.scene.INPUT_MODE_SINGLE_CLICK ){
					that.jsClickCount(1);
				}
				if( that.scene.inputMode == that.scene.INPUT_MODE_DBL_CLICK ){
					that.jsClickCount(2);
				}
				if( that.scene.inputMode == that.scene.INPUT_MODE_TRIPLE_CLICK ){
					that.jsClickCount(3);
				}
				
				if( that.scene.inputMode == that.scene.INPUT_MODE_DRAG ){
					that._isSelected = true;
					that._isDragging = true;
					//that.scene.input.setDraggable(that._gameObject);
					//that.scene._isDraggingMode = true;
				}
				
			}
		});
		
		this._gameObject.on('pointerup', function(pointer, localX, localY, event){
			if( that.scene.inputStyle == that.scene.INPUT_STYLE_A ){
				if( that.scene.inputMode == that.scene.INPUT_MODE_CLICK ){
					that.jsRelease();
				}
				if( that.scene.inputMode == that.scene.INPUT_MODE_DRAG ){
					that.scene.endDraggingMode();
					that._isDragging = false;
					that._isSelected = false;
				}
				that.scene.computeConnections();
			}
		});
		
		
		// Generate all the x,y points of a polygon
		this.points = [];
		this.jsGeneratePoints();

		this.graphics = scene.add.graphics();
		
		this.faces = []
		for( var i=0; i<Blinks.Util.FACE_COUNT; i+=1 ){
			this.faces.push( new BlinkFace() );
		}
		/*
		this.setColor( Blinks.Colors.OFF_js );
		this.setColorOnFace( Blinks.Colors.dim_js( Blinks.Colors.RED_js, 255 ), 0 );
		this.setColorOnFace( Blinks.Colors.YELLOW_js, 1 );
		this.setColorOnFace( Blinks.Colors.GREEN_js, 2 );
		this.setColorOnFace( Blinks.Colors.CYAN_js, 3 );
		this.setColorOnFace( Blinks.Colors.BLUE_js, 4 );
		this.setColorOnFace( Blinks.Colors.MAGENTA_js, 5 );
		*/
	}
	jsGeneratePoints( ){
		var _angle = Math.PI*2 / Blinks.Util.FACE_COUNT;
		var rotatedRadians = this._angle * Math.PI/180;
		var halfOffset = _angle*0.5;
		var _r = Blinks.Config.puckRadius;
		this.points = [];
		for( var i=0; i<Blinks.Util.FACE_COUNT; i+=1 ){
			this.points.push( new Phaser.Math.Vector2(
				_r * Math.cos( halfOffset+rotatedRadians+_angle*i ),
				_r * Math.sin( halfOffset+rotatedRadians+_angle*i )
			) );
		}
	}
	
    setColor(color){
		for( var i=0; i<Blinks.Util.FACE_COUNT; i+=1 ){
			this.setColorOnFace( color, i );
		}
	}
    setColorOnFace(color, index){
		this.faces[index].setColor( color );
	}
	setFaceColor(index, color){
		console.warn('DEPRICATED: setFaceColor -> use setColorOnFace(color,index)');
		this.faces[index].setColor( color );
	}
	buttonPressed(){
		// reset the flag only when this function is called
		if( this._buttonPressed ){
			this._buttonPressed = false;
			return true;
		}
		return false;
	}
	buttonReleased(){
		// reset the flag only when this function is called
		if( this._buttonReleased ){
			this._buttonReleased = false;
			return true;
		}
		return false;
	}
	buttonSingleClicked(){
		if( this._buttonClickCount == 1 ){
			this._buttonClickCount = 0;
			return true;
		}
		return false;
	}
	buttonDoubleClicked(){
		if( this._buttonClickCount == 2 ){
			this._buttonClickCount = 0;
			return true;
		}
		return false;
	}
	buttonMultiClicked(){
		if( this._buttonClickCount >= 3 ){
			return true;
		}
		return false;
	}
	buttonClickCount(){
		var r = this._buttonClickCount;
		this._buttonClickCount = 0;
		return r;
	}
	buttonLongPressed(){
		if( this._buttonLongPress ){
			this._buttonLongPress = false;
			return true;
		}
		return false;
	}
	buttonDown(){
		return this._buttonHeld;
	}
	setValueSentOnFace(value,face){
		this.faces[face].sentValue = value;
	}
	setValueSentOnAllFaces(value){
		for( var i=0; i<Blinks.Util.FACE_COUNT; i+=1 ){
			this.setValueSentOnFace( value, i );
		}
	}
	getLastValueReceivedOnFace(face){
		return this.faces[face].lastRecievedValue;
	}
	
	isValueReceivedOnFaceExpired(face){
		return this.faces[face].isRecievedValueExpired();
	}
	didValueOnFaceChange(face){
		return this.faces[face].didValueChange();
	}
	isAlone(){
		// once we see an non-expired signal -> return cause we are not alone
		for( var i=0; i<Blinks.Util.FACE_COUNT; i+=1 ){
			if( ! this.faces[i].isRecievedValueExpired() ){
				return false;
			}
		}
		return true;
	}
	
	jsDestroy( ){
		try {
			this._gameObject.destroy(this.scene);
		}catch(e){}
		this._gameObject = null;
		try {
			this.graphics.clear();
			this.graphics.destroy(this.scene);
		}catch(e){}
		this.graphics = null;
		this.scene = null;
	}
	jsDrawBackground( fill, stroke ){
		var g = this.graphics;
		if( this._isSelected ){
			g.lineStyle(40, stroke._color, stroke.alphaGL);
		}else{
			g.lineStyle(4, stroke._color, stroke.alphaGL);
		}
		g.fillStyle(fill._color, fill.alphaGL);
		g.beginPath();
		g.moveTo(this.x+this.points[0].x, this.y+this.points[0].y);
		for( var i=0; i<6; i+=1 ){
			g.lineTo( this.x+this.points[i].x, this.y+this.points[i].y );
		}
		g.closePath();
		g.fillPath();
		g.strokePath();
	}
	jsDrawFace( fill, stroke, index ){
		var g = this.graphics;
		g.lineStyle(4, stroke._color, stroke.alphaGL);
		g.fillStyle(fill._color, fill.alphaGL);
		g.beginPath();
		g.moveTo(this.x, this.y);
		g.lineTo(this.x+this.points[index%6].x, this.y+this.points[index%6].y);
		g.lineTo(this.x+this.points[(index+1)%6].x, this.y+this.points[(index+1)%6].y);
		g.closePath();
		g.fillPath();
		//g.strokePath();
	}
	jsDraw( ){
		this.graphics.clear();
		this.jsDrawBackground( 0xDDDDDD, 0x777777 );
		for( var i=0; i<Blinks.Util.FACE_COUNT; i+=1 ){
			var face = this.faces[i];
			this.jsDrawFace( this.faces[i].color, this.faces[i].color, i );
		}
	}
	jsPress( ){
		this._buttonHeld = true;
		this._timerLongPress.set( Blinks.Config.longPressDurationMS );
	}
	jsRelease( ){
		this._buttonHeld = false;
		this._timerLongPress.never();
	}
	jsClick(){
		this.jsClickCount(1);
	}
	jsClickCount( count ){
		this._buttonClickCount = count;
	}
	
	preUpdate (time, delta){
		// Set flags for knowing if the button was just pressed or released
		if( (this._buttonHeldPrevious == false) && (this._buttonHeld == true) ){
			this._buttonPressed = true;
		}
		if( (this._buttonHeldPrevious == true) && (this._buttonHeld == false) ){
			this._buttonReleased = true;
			/*
			if( ! this._timerButtonPress.isExpired() ){
				this._buttonClickCount += 1;
			}
			*/
		}
		this._buttonHeldPrevious = this._buttonHeld;
		
		// Long pressed are trigged by time
		// console.info( this._timerLongPress.getRemaining() );
		if( this._timerLongPress.isExpired() ){
			this._buttonLongPress = true;
			this._timerLongPress.never();
		}
		
		// move to wherever dragged
		this.x = this._gameObject.x;
		this.y = this._gameObject.y;
		
		// send messages
		for( var i=0; i<Blinks.Util.FACE_COUNT; i+=1 ){
			this.faces[i].broadcast();
		}
		
	}
	rotateBy( degrees ){
		this._angle += degrees;
		this.jsGeneratePoints();
		this._gameObject.setAngle(this._angle+this._gameObjectAngleOffset);
	}
	
	jsGetOrientedFace( absoluteOrientedFace ){
		// for a "default" oriented blink
		var adjOrientedFace = (Blinks.Util.FACE_COUNT+2+absoluteOrientedFace) % Blinks.Util.FACE_COUNT;
		var angleShift = (this._angle % 360) / (360/Blinks.Util.FACE_COUNT);
		var lookupIndex = (adjOrientedFace-angleShift+Blinks.Util.FACE_COUNT) % Blinks.Util.FACE_COUNT;
		var actualFaceIndecies = [3,4,5,0,1,2];
		return actualFaceIndecies[ lookupIndex ];
		/*
		if( absoluteOrientedFace == -2 ){ return 3; }
		if( absoluteOrientedFace == -1 ){ return 4; }
		if( absoluteOrientedFace ==  0 ){ return 5; }
		if( absoluteOrientedFace ==  1 ){ return 0; }
		if( absoluteOrientedFace ==  2 ){ return 1; }
		if( absoluteOrientedFace ==  3 ){ return 2; }
		*/
	}

}

// https://blinks.games/ggj/
// https://forum.move38.com/t/beginner-tutorial-lets-make-a-blink-blink/46
// https://forum.move38.com/t/beginner-tutorial-lets-make-a-blink-blush/48
// https://github.com/bigjosh/Move38-Arduino-Platform/blob/master/libraries/Examples01/examples/B-ButtonPress/B-ButtonPress.ino
// https://blinks.games/api/

// Blink Class
// Blinks.Blink
//
// Button
//    buttonPressed()
//    buttonReleased()
//    buttonSingleClicked()
//    buttonDoubleClicked()
//    buttonMultiClicked()
//    buttonClickCount()
//    buttonLongPressed()
//    buttonDown()
//
// Communication
//    setValueSentOnAllFaces(63)
//    setValueSentOnFace(63, 0)
//    getLastValueReceivedOnFace(5)
//    isValueReceivedOnFaceExpired()
//    didValueOnFaceChange()
//    isAlone()
//
// Display
//    setColor(RED)
//    setColorOnFace(BLUE, 2)
//
// Datagrams
//    getDatagramLengthOnFace(5)
//    isDatagramReadyOnFace(5)
//    getDatagramOnFace(5)
//    markDatagramReadOnFace(5)
//    sendDatagramOnFace(*data, length, face)
//
// System
//    hasWoken()
//    startState()
//    - START_STATE_POWER_UP
//    - START_STATE_WE_ARE_ROOT
//    - START_STATE_DOWNLOAD_SUCCESS
//    getSerialNumberByte(0 - 8)
//    getBlinkbiosVersion()



