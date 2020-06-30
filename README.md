# Blinks Simulator

This is a really simply simulator for [Blinks](https://blinks.games/).

It is not a good simulator. It barely works. Most of the functionality
is not there (or just weird).

The editor is ACE Editor.

The game engine is Phaser.

The C to JS "transpiler" is really just a bunch of regular expressions.

The space bar doesnt work in the editor (sorry =/) The bug is actually
caused by Phasor's handling of the space bar input. I should just use
a different key. I should also document things.

Dont use functions. Dont use pointers. Dont use function pointers.
Enums are fine, arrays are fine. Local variables and global variables
are fine. `#define`s are fine (they're handled as inline replacements
not variables). I didnt touch anything with Blink's datagrams. I may
have completely forgotten an entire portion of the API. I may have
handled things differently than the actual API. I may have left a
collection of swear words in the code.

Play. Enjoy. Don't hurt yourself.

And press `ctl+enter` to run your code in the editor/simulator.

## Example Programs

These were taken directly from the Blinks forum or are examples that
ship with the arduino library/dev tools.

### Different Types of Input

	void setup() {
	  setColor( OFF );
	}

	void loop() {
	  if (buttonDown()) {
		setColor( RED );
	  }
	  if( buttonSingleClicked() ){
		  setColor(GREEN);
	  }
	  if( buttonDoubleClicked() ){
		  setColor(BLUE);
	  }
	  if( buttonMultiClicked() ){
		  setColor(YELLOW);
	  }
	}

### Counting Neighbors

	/*
	 * Color By Number/Neighbor
	 * 
	 * An example showing how to count the number of neighbors.
	 * 
	 * Each Blink displays a color based on the number of neighbors around it.
	 *  
	 */

	// color by number of neighbors
	Color colors[] = {  
	  OFF,   // 0 neighbors
	  RED,            // 1 neighbors
	  YELLOW,         // 2 neighbors
	  GREEN,          // 3 neighbors
	  CYAN,           // 4 neighbors
	  BLUE,           // 5 neighbors
	  MAGENTA        // 6 neighbors
	}; 

	void setup() {
	  // Blank
	}


	void loop() {

	  // count neighbors we have right now
	  int numNeighbors = 0;
	  int f;
	  for( f=0; f<FACE_COUNT; f+=1 ){

		if ( !isValueReceivedOnFaceExpired( f ) ) {      // Have we seen an neighbor on this face recently?
		  numNeighbors++;
		}
	  
	  }

	  // look up the color to show based on number of neighbors
	  // No need to bounds check here since we know we can never see more than 6 neighbors 
	  // because we only have 6 sides.
	  
	  setColor( colors[ numNeighbors ] );
	  
	}

### Rainbow Blinky

	Timer blinkTimer;
	bool isBlinkOn;

	void setup() {
	  // this only happens once
	  blinkTimer.set(500);
	  isBlinkOn = false;
	}

	void loop() {
	  // this happens ~30 times per second
	  if(blinkTimer.isExpired()) {
		isBlinkOn = !isBlinkOn;
		blinkTimer.set(500);
	  }
	  
	  if(isBlinkOn) {
		setColorOnFace(RED,0);
		setColorOnFace(ORANGE,1);
		setColorOnFace(YELLOW,2);
		setColorOnFace(GREEN,3);
		setColorOnFace(CYAN,4);
		setColorOnFace(BLUE,5);
	  }
	  else {
		setColor(OFF);
	  }
	}

