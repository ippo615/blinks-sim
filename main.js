
var WORLD_SIZE_X = 1920;
var WORLD_SIZE_Y = 1080;

var ButtonFullScreen = {
	preload: function(scene){
		scene.load.spritesheet('fullscreen', 'http://labs.phaser.io/assets/ui/fullscreen.png', { frameWidth: 64, frameHeight: 64 });
	},
	create: function(scene){
		var button = scene.add.image(WORLD_SIZE_X-16, 16, 'fullscreen', 0).setOrigin(1, 0).setInteractive();
		button.on('pointerup', function () {
			if (this.scale.isFullscreen){
				button.setFrame(0);
				this.scale.stopFullscreen();
			}else{
				button.setFrame(1);
				this.scale.startFullscreen();
			}
		}, scene);
		var FKey = scene.input.keyboard.addKey('F');
		FKey.on('down', function () {

			if (this.scale.isFullscreen){
				button.setFrame(0);
				this.scale.stopFullscreen();
			}else{
				button.setFrame(1);
				this.scale.startFullscreen();
			}
		}, scene);
	}
};

var sceneSerial = 0;
var GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

	initialize: function GameScene (){
		sceneSerial += 1;
        Phaser.Scene.call(this, { key: 'scene'+sceneSerial, active: true });
		
		this.blinks = [];
		this._isDraggingMode = false;
		this._recomputeSnaps = false;
		this._recomputeSnapEpsilon = 2.0;
		
		Phaser.GameObjects.GameObjectFactory.register('Blink', function (x, y){
			let sprite = new Blink(this.scene, x, y);
			sprite.setup();
			return sprite;
		});
		
		// for slowing things down for debugging
		this.frameIndex = 0;
		
    },
	
	preload: function(){
		ButtonFullScreen.preload(this);
	},
	create: function(){
		this.blinks = [];
		for( var i=0; i<7; i+=1 ){
			this.blinks.push( this.add.Blink(64+i*Blinks.Config.puckRadius*4,320) );
		};
		this.frameIndex = 0;
		this.INPUT_STYLE_A = 1;
		this.INPUT_STYLE_B = 2;
		this.INPUT_MODE_CLICK = 1;
		this.INPUT_MODE_DRAG = 2;
		this.INPUT_MODE_ROTATE = 3;
		this.INPUT_MODE_DBL_CLICK = 4;
		this.INPUT_MODE_TRIPLE_CLICK = 5;
		this.INPUT_MODE_SINGLE_CLICK = 6;
		this.inputStyle = this.INPUT_STYLE_B;
		this.inputMode = this.INPUT_MODE_CLICK;
		
		this.textSize = 48;
		this.textStyle = {
			fontFamily: 'Courier',
			fontSize: this.textSize+'px',
			fontStyle: '',
			backgroundColor: null,
			color: '#000'
		};
		var tx = this.textSize;
		this.textInputStyle = this.add.text(0, tx*0, 'Input Style: "B" ([S] to change, disabled)', this.textStyle);
		this.textInputInfo = this.add.text(0, tx*1, 'Click to Select -> Press Key', this.textStyle);
		this.textInputDrag = this.add.text(0, tx*2, '[D] Enable Dragging', this.textStyle);
		this.textInputRotate = this.add.text(0, tx*3, '[R] Rotate', this.textStyle);
		this.textInputSingleClick = this.add.text(0, tx*4, '[1] Single Click', this.textStyle);
		this.textInputDoubleClick = this.add.text(0, tx*5, '[2] Double Click', this.textStyle);
		this.textInputTripleClick = this.add.text(0, tx*6, '[3] Triple Click', this.textStyle);
		this.textInputHold = this.add.text(0, tx*7, '[SPACE] Press/Hold/Release', this.textStyle);
		this.textInputHold = this.add.text(0, tx*8, '[ESC] End Action', this.textStyle);
		this.textInputHold = this.add.text(0, tx*9, '[C] Create Blink', this.textStyle);
		this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		
		var that = this;
		this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
			var dx = dragX-gameObject.x;
			var dy = dragY-gameObject.y;

			if( that.inputStyle == that.INPUT_STYLE_B ){
				for( var i=0, l=that.blinks.length; i<l; i+=1 ){
					var blink = that.blinks[i];
					if( blink._isSelected ){
						blink._gameObject.x += dx;
						blink._gameObject.y += dy;
					}
				}
			}else{
				for( var i=0, l=that.blinks.length; i<l; i+=1 ){
					var blink = that.blinks[i];
					if( blink._isSelected ){
						blink._gameObject.x += dx;
						blink._gameObject.y += dy;
					}
				}
			}
		});
		
		this.input.keyboard.on('keydown-C', function (event) {
			if( that.inputStyle == that.INPUT_STYLE_A ){
				return; // TODO
			}else{
				var x = that.input.activePointer.x;
				var y = that.input.activePointer.y;
				that.blinks.push( that.add.Blink(x,y) );
			}
		});
		
		this.input.keyboard.on('keydown-S', function (event) {
			// style A doesnt fully work yet
			return;
			if( that.inputStyle == that.INPUT_STYLE_A ){
				that.inputStyle = that.INPUT_STYLE_B;
			}else{
				that.inputStyle = that.INPUT_STYLE_A;
			}
		});
		this.input.keyboard.on('keydown-ONE', function (event) {
			if( that.inputStyle == that.INPUT_STYLE_B ){
				for( var i=0, l=that.blinks.length; i<l; i+=1 ){
					var blink = that.blinks[i];
					if( blink._isSelected ){
						blink.jsClickCount(1);
						blink._isSelected = false;
					}
				}
			}
			if( that.inputStyle == that.INPUT_STYLE_A ){
				that.inputMode = that.INPUT_MODE_SINGLE_CLICK;
			}
		});
		this.input.keyboard.on('keydown-TWO', function (event) {
			if( that.inputStyle == that.INPUT_STYLE_B ){
				for( var i=0, l=that.blinks.length; i<l; i+=1 ){
					var blink = that.blinks[i];
					if( blink._isSelected ){
						blink.jsClickCount(2);
						blink._isSelected = false;
					}
				}
			}
			if( that.inputStyle == that.INPUT_STYLE_A ){
				that.inputMode = that.INPUT_MODE_DBL_CLICK;
			}
		});
		this.input.keyboard.on('keydown-THREE', function (event) {
			if( that.inputStyle == that.INPUT_STYLE_B ){
				for( var i=0, l=that.blinks.length; i<l; i+=1 ){
					var blink = that.blinks[i];
					if( blink._isSelected ){
						blink.jsClickCount(3);
						blink._isSelected = false;
					}
				}
			}
			if( that.inputStyle == that.INPUT_STYLE_A ){
				that.inputMode = that.INPUT_MODE_TRIPLE_CLICK;
			}
		});
		this.input.keyboard.on('keyup-SPACE', function (event) {
			if( that.inputStyle == that.INPUT_STYLE_B ){
				for( var i=0, l=that.blinks.length; i<l; i+=1 ){
					var blink = that.blinks[i];
					if( blink._isSelected ){
						blink.jsRelease();
					}
				}
			}
		});
		this.input.keyboard.on('keydown-R', function (event) {
			if( that.inputStyle == that.INPUT_STYLE_B ){
				that.inputRotate();
			}
			if( that.inputStyle == that.INPUT_STYLE_A ){
				that.inputMode = that.INPUT_MODE_ROTATE;
			}
		});
		this.input.keyboard.on('keydown-ESC', function (event) {
			if( that.inputStyle == that.INPUT_STYLE_B ){
				that.endDraggingMode();
				for( var i=0, l=that.blinks.length; i<l; i+=1 ){
					var blink = that.blinks[i];
					blink._isSelected = false;
				}
			}
		});
		
		this.input.keyboard.on('keydown-D', function (event) {
			if( that.inputStyle == that.INPUT_STYLE_B ){
				if( ! that._isDraggingMode ){
					that._isDraggingMode = true;
					for( var i=0, l=that.blinks.length; i<l; i+=1 ){
						var blink = that.blinks[i];
						if( blink._isSelected ){
							blink._isDragging = true;
							that.input.setDraggable(blink._gameObject);
						}
					}
					//that.input.setDragState(that.input.activePointer,3);
				}else{
					that.endDraggingMode();
				}
			}
			if( that.inputStyle == that.INPUT_STYLE_A ){
				that.inputMode = that.INPUT_MODE_DRAG;
				that._isDraggingMode = true;
				for( var i=0, l=that.blinks.length; i<l; i+=1 ){
					var blink = that.blinks[i];
					that.input.setDraggable(blink._gameObject);
				}
			}
		});
	},
	inputRotate: function(){
		for( var i=0, l=this.blinks.length; i<l; i+=1 ){
			var blink = this.blinks[i];
			if( blink._isSelected ){
				blink.rotateBy(360/6);
			}
		}
	},
	endDraggingMode: function(){
		this._isDraggingMode = false;
		this._recomputeSnaps = true;
		this.input.setDragState(this.input.activePointer,5);
		// We sort the list of blinks so that when processing "snapping"
		// the ones that have been dragged most recently are more likely
		// to be re-positioned when snapped
		var blinksForEnd = [];
		var blinksForStart = [];
		for( var i=0, l=this.blinks.length; i<l; i+=1 ){
			var blink = this.blinks[i];
			if( blink._isSelected ){
				blink._isDragging = false;
				this.input.setDraggable(blink._gameObject,false);
				blinksForEnd.push(i);
			}else{
				blinksForStart.push(i);
			}
		}
		var tmpBlinks = [];
		for( var i=0,l=blinksForStart.length; i<l; i+=1 ){
			tmpBlinks.push( this.blinks[blinksForStart[i]] );
		}
		for( var i=0,l=blinksForEnd.length; i<l; i+=1 ){
			tmpBlinks.push( this.blinks[blinksForEnd[i]] );
		}
		for( var i=0,l=this.blinks.length; i<l; i+=1 ){
			this.blinks[i] = tmpBlinks[i];
		}
	},
	computeConnections: function(){
		var commDistance = Blinks.Config.commDistance*Blinks.Config.puckRadius;
		var commDistanceSquared = commDistance*commDistance;
		var angle = 360 / Blinks.Util.FACE_COUNT;
		for( var i=0, l=this.blinks.length; i<l; i+=1 ){
			var blink = this.blinks[i];
			for( var f=0; f<Blinks.Util.FACE_COUNT; f+=1 ){
				blink.faces[f].setPartner( null );
			}
		}
		for( var i=0, l=this.blinks.length; i<l; i+=1 ){
			for( var j=i+1; j<l; j+=1 ){
				
				var fixed = this.blinks[i];
				var movable = this.blinks[j];
				var dx = movable.x - fixed.x;
				var dy = movable.y - fixed.y;
				if( dx*dx + dy*dy < commDistanceSquared ){
					
					var directionToMovable = Math.atan2(dy,dx) * 180 / Math.PI;
					var absoluteOrientedFaceToMovable = Math.round(directionToMovable/angle);
					var directionToFixed = Math.atan2(-dy,-dx) * 180 / Math.PI;
					var absoluteOrientedFaceToFixed = Math.round(directionToFixed/angle);
					
					var faceIndexFixed = fixed.jsGetOrientedFace( absoluteOrientedFaceToMovable );
					var faceIndexMovable = movable.jsGetOrientedFace( absoluteOrientedFaceToFixed );
					movable.faces[faceIndexMovable].setPartner( fixed.faces[faceIndexFixed] );
					fixed.faces[faceIndexFixed].setPartner( movable.faces[faceIndexMovable] );
				}
			}
		}
	},
	update: function(time, delta){
		Blinks.update( time, delta );
		
		if (Phaser.Input.Keyboard.JustDown(this.keySpace)){
			if( this.inputStyle == this.INPUT_STYLE_B ){
				for( var i=0, l=this.blinks.length; i<l; i+=1 ){
					var blink = this.blinks[i];
					if( blink._isSelected ){
						blink.jsPress();
					}
				}
			}
		}
		
		if( ! this._isDraggingMode && this._recomputeSnaps ){
			var changed = false;
			var snapDistance = Blinks.Config.snapDistance*Blinks.Config.puckRadius;
			var snapDistanceSquared = snapDistance*snapDistance;
			for( var i=0, l=this.blinks.length; i<l; i+=1 ){
				for( var j=i+1; j<l; j+=1 ){
					var fixed = this.blinks[i];
					var movable = this.blinks[j];
					var dx = movable.x - fixed.x;
					var dy = movable.y - fixed.y;
					if( dx*dx + dy*dy < snapDistanceSquared ){

						// snap the blinks!
						// direction from fixed to movable
						var direction = Math.atan2(dy,dx) * 180 / Math.PI;
						// quantize the direction to nearest face
						var angle = 360 / Blinks.Util.FACE_COUNT;
						var halfAngle = 0; //angle / 2;
						var absoluteOrientedFace = Math.round(direction/angle);
						var quantDirection = halfAngle + absoluteOrientedFace*angle;
						var xNew = fixed.x + 2*Blinks.Config.puckRadius*Math.cos( quantDirection * Math.PI/180 );
						var yNew = fixed.y + 2*Blinks.Config.puckRadius*Math.sin( quantDirection * Math.PI/180 );
						if( this._recomputeSnapEpsilon < Math.abs( xNew - movable.x ) ){
							if( this._recomputeSnapEpsilon < Math.abs( yNew - movable.y ) ){
								changed = true;
							}
						}
						movable._gameObject.x = xNew;
						movable._gameObject.y = yNew;
						movable.x = xNew;
						movable.y = yNew;
					}
				}
			}
			if( ! changed ){
				this._recomputeSnaps = false;
				this.computeConnections();
			}
		}
		this.computeConnections(); // this might not be very efficient
		for( var i=0, l=this.blinks.length; i<l; i+=1 ){
			this.blinks[i].preUpdate(time,delta);
			this.blinks[i].loop();
		}
		for( var i=0, l=this.blinks.length; i<l; i+=1 ){
			this.blinks[i].jsDraw();
		}

		// determine which blinks are closest/able to send messages
		// send messages from one blink to another
	}

});


// ---------------------------------------------- [ User Code Runner ] -

function showError(error) {
	toastr.clear();
	toastr.error(error, "Script Error - See JS Console for Details");
	console.error( error );
}

function showSuccess(msg) {
	toastr.clear();
	toastr.success(msg, "Script Ran");
}

function runNewCode(code) {
	try {
		var Blink = Translator.translate(code);
	} catch (e) {
		showError(e);
		return;
	}

	try {
		window.Blink = Blink;
		if( game ){
			
			// Destroy the game and remove the created html elements (phaser doesnt)
			game.destroy();
			$('#phaser-example').html('');
			
			// Create a new game
			game = new Phaser.Game(config);
		}
	} catch (e) {
		showError(e);
		return;
	}

	showSuccess('The preview has been updated');
}

// --------------------------------------------------- [ Code Editor ] -

// Show the code editor on the right.
var obj = document.getElementById('editor');
obj.style.width = Math.round(window.innerWidth / 2) + 'px';
obj.style.height = Math.round(window.innerHeight) + 'px';
var editor = ace.edit('editor');
editor.setTheme('ace/theme/monokai');
editor.getSession().setMode('ace/mode/c_cpp');

// Resize the UI whenever the view size changes.
function editorResize(){
	var editorContainer = document.getElementById('editor');
	editorContainer.style.width = Math.round(window.innerWidth / 2) + 'px';
	editorContainer.style.height = Math.round(window.innerHeight) + 'px';
	editor.resize();
}
window.addEventListener('resize',editorResize);

// Update the previews when the user changes their input
editor.getSession().on('change', function(e) {
	//var code = editor.getValue();
	//runNewCode(code);
});
editor.commands.addCommand({
	name: "run",
	bindKey: {win: "Ctrl-Enter", mac: "Command-Enter"},
	exec: function(editor) {
		var code = editor.getValue();
		runNewCode(code);
	}
});

// -- preview

function previewResize(){
	var container = document.getElementById('preview');
	container.style.width = Math.round(window.innerWidth / 2) + 'px';
	container.style.height = Math.round(window.innerHeight) + 'px';
}
previewResize();
window.addEventListener('resize',previewResize);


var code = editor.getValue();
runNewCode(code);

var config = {
    type: Phaser.AUTO,
	pixelArt: true,
	backgroundColor: '#eeeeee',
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: WORLD_SIZE_X,
        height: WORLD_SIZE_Y
    },
    physics: {
        default: 'matter',
        matter: {
            enableSleeping: true,
			debug: true
        },
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: GameScene
};

var game = new Phaser.Game(config);
console.info( game );

