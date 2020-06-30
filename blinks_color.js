Blinks.Colors = {};
Blinks.Colors.makeColorRGB_js = function(red,green,blue){
	return new Phaser.Display.Color( red, green, blue, 255 );
}
Blinks.Colors.makeColorHSB_js = function( hue, saturation, brightness ){
	// blinks hue, saturation, brightness are 0-255
	// Start with a black that has the right brightness then set the hsv
	var color = new Phaser.Display.Color( 0,0,0, brightness );
	color.setFromHSV( hue/255.0, saturation/255.0, 0.5 );
	return color;
}
Blinks.Colors.dim_js = function( color, brightness ){
	// to match the behaviour of blinks we copy the color instead of replacing it
	var newColor = new Phaser.Display.Color( color.red, color.green, color.blue, brightness );
	return newColor;
}
Blinks.Colors.RED_js = Blinks.Colors.makeColorRGB_js( 255, 0, 0 );
Blinks.Colors.ORANGE_js = Blinks.Colors.makeColorRGB_js( 255, 128, 0 );
Blinks.Colors.YELLOW_js = Blinks.Colors.makeColorRGB_js( 255, 255, 0 );
Blinks.Colors.GREEN_js = Blinks.Colors.makeColorRGB_js( 0, 255, 0 );
Blinks.Colors.CYAN_js = Blinks.Colors.makeColorRGB_js( 0, 255, 255 );
Blinks.Colors.BLUE_js = Blinks.Colors.makeColorRGB_js( 0, 0, 255 );
Blinks.Colors.MAGENTA_js = Blinks.Colors.makeColorRGB_js( 255, 0, 255 );
Blinks.Colors.WHITE_js = Blinks.Colors.makeColorRGB_js( 255, 255, 255 );
Blinks.Colors.OFF_js = Blinks.Colors.makeColorHSB_js( 0, 0, 0 );
Blinks.Colors.MAX_BRIGHTNESS_js = 255;

