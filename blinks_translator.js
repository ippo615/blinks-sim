Translator = {};
class Transformer {
	constructor(regex, action){
		this.regex = regex;
		this.action = action;
	}
	// action should take the following arguments:
	// match 	The matched substring. (Corresponds to $& above.)
	// p1, p2, ... 	The nth string found by a parenthesized capture group, provided the first argument to replace() was a RegExp object. (Corresponds to $1, $2, etc. above.) For example, if /(\a+)(\b+)/, was given, p1 is the match for \a+, and p2 for \b+.
	// offset 	The offset of the matched substring within the whole string being examined. (For example, if the whole string was 'abcd', and the matched substring was 'bc', then this argument will be 1.)
	// string 	The whole string being examined.
}
Translator.stringRepeat = function(s,n){
	var txt = '';
	for( var i=0; i<n; i+=1 ){
		txt += s;
	}
	return txt;
}
Translator.stringReplaceAt = function( txt, index, replacement ){
	return txt.substr(0, index) + replacement + txt.substr(index + replacement.length);
}
Translator.countLines = function(t){
	var reg = /\n\r*/g;
	var m = t.match(reg);
	if( m == null ){
		return 0;
	}
	return m.length;
}
Translator.findArrays = function( t ){
	var reg = /(\w+)\s+(\w+)\[\s*\]\s*=\s*\{([^]+?)\}\s*;/gm;
	var match = reg.exec(t);
	var results = [];
	while (match != null) {
		// matched text: match[0]
		// match start: match.index
		// capturing group n: match[n]
		results.push({
			type: match[1],
			name: match[2],
			values: match[3],
			strIndex: match.index,
			fullMatch: match[0],
			isArray: true
		});
		match = reg.exec(t);
	}
	return results;
}
Translator.findVariableInitialization = function( t ){
	var reg = /(\w+)\s+(\w+)\s*=\s*([^]+?);/gm;
	var match = reg.exec(t);
	var results = [];
	while (match != null) {
		results.push({
			type: match[1],
			name: match[2],
			value: match[3],
			strIndex: match.index,
			fullMatch: match[0]
		});
		match = reg.exec(t);
	}
	return results;
}
/*
for( var i=0, l=variables.length; i<l; i+=1 ){
		var gv = variables[i];
		if( gv.type == 'Timer' && gv.value == null ){
			code += prefix+''+gv.name +' = new Blinks.Time.Timer();\n';
		}else if( gv.hasOwnProperty('isArray') && gv.isArray ){
			code += prefix+''+gv.name +' = ['+Translator.cleanVariableValues(gv.values,names)+'];\n';
		}else if( gv.hasOwnProperty('isEnum') && gv.isEnum ){
			console.info( 'ENUM' );
			console.info( gv );
			var enumNames = gv.values.split(',');
			for( var enumIndex=0, enumCount=enumNames.length; enumIndex<enumCount; enumIndex += 1 ){
				var ev = enumNames[enumIndex];
				code += prefix +''+ ev +' = '+(enumIndex+1)+';\n';
			}
		}else{
			code += prefix+''+gv.name +' = '+Translator.cleanVariableValues(gv.value,names)+';\n';
		}
	}
 */
var variableTransforms = [
	// variable declaration
	new Transformer( /(\w+)\s+(\w+);/g, function(matchSubtring,type,name,offset,fullString){
		if( type == 'Timer' ){
			return 'var '+ name +' = new Blinks.Time.Timer();\n';
		}
		return 'var '+ name +';\n';
	} ),
	// variable initialization
	new Transformer( /(\w+)\s+(\w+)\s*=\s*([^]+?);/g, function(matchSubtring,type,name,value,offset,fullString){
		if( type == 'Timer' ){
			return 'var '+ name +' = new Blinks.Time.Timer();\n';
		}
		return 'var '+ name +' = '+value+';\n';
	} ),
	// arrays
	new Transformer( /(\w+)\s+(\w+)\[\s*\]\s*=\s*\{([^]+?)\}\s*;/gm, function(matchSubtring,type,name,values,offset,fullString){
		if( type == 'Timer' ){
			var valuesArray = values.split(',');
			var result = 'var '+name+' = [';
			for( var i=0,l=valuesArray.length; i<l; i+=1 ){
				result += 'new Blinks.Time.Timer(),\n';
			}
			result += '];\n';
			return result;
		}
		return 'var '+ name +' = ['+values+'];\n';
	} ),
	// enums
	new Transformer( /enum\s*([^{]*)\{([^]+?)\}\s*?;/gm, function(matchSubtring,name,values,offset,fullString){
		var enumNames = values.split(',');
		var result = '';
		for( var enumIndex=0, enumCount=enumNames.length; enumIndex<enumCount; enumIndex += 1 ){
			var ev = enumNames[enumIndex];
			result += 'var '+ ev +' = '+(enumIndex+1)+';\n';
		}
		return result;
	} )
]
Translator.findVariableDeclaration = function( t ){
	var reg = /(\w+)\s+(\w+);/gm;
	var match = reg.exec(t);
	var results = [];
	while (match != null) {
		results.push({
			type: match[1],
			name: match[2],
			value: null,
			strIndex: match.index,
			fullMatch: match[0]
		});
		match = reg.exec(t);
	}
	return results;
}
Translator.findDefineConstants = function( t ){
	// note these should technically be executed like
	// find and replace on all the text before
	// additional parsing is done (ie don't treat
	// them like constants/variables)
	var reg = /#define\s+(\w+)\s+([^]+?)$/gm;
	var match = reg.exec(t);
	var results = [];
	while (match != null) {
		results.push({
			name: match[1],
			value: match[2],
			strIndex: match.index,
			fullMatch: match[0]
		});
		match = reg.exec(t);
	}
	return results;
}
Translator.findDefineMacros = function( t ){
	var reg = /#define\s+(\w+)\(([^)]+)\)([^]+?)$/gm;
	var match = reg.exec(t);
	var results = [];
	while (match != null) {
		results.push({
			name: match[1],
			arguments: match[2],
			body: match[3],
			strIndex: match.index,
			fullMatch: match[0]
		});
		match = reg.exec(t);
	}
	return results;
}
Translator.findEnums = function( t ){
	var reg = /enum\s*([^{]*)\{([^]+?)\}\s*?;/gm;
	var match = reg.exec(t);
	var results = [];
	while (match != null) {
		results.push({
			name: match[1],
			values: match[2].replace(/\s+/g,''),
			strIndex: match.index,
			isEnum: true,
			fullMatch: match[0]
		});
		match = reg.exec(t);
	}
	return results;
}

Translator.getFunctions = function( t ){
	// this relies on functions with the following properties:
	// - no space between the name and opening paren of the arguments
	// - all internal brackets are indented
	// - the closing bracket is at the start of it's line
	var reg = /(\w+)\s+(\w+)\(([^{]*?)\)\s*\{([^]+?)^\}/gm;
	var match = reg.exec(t);
	var results = [];
	while (match != null) {
		console.log(match[0]); // == all
		// match[1] == return type
		// match[2] == name
		// match[3] == arguments
		// match[4] == function body
		results.push({
			returnType: match[1],
			name: match[2],
			arguments: match[3],
			body: match[4],
			strIndex: match.index,
			fullMatch: match[0]
		});
		match = reg.exec(t);
	}
	return results;
};
Translator.removeMatches = function( txt, matches ){
	var t = txt;
	for( var i=0, l=matches.length; i<l; i+=1 ){
		var match = matches[i];
		t = Translator.stringReplaceAt( t, match.strIndex, Translator.stringRepeat(' ', match.fullMatch.length) );
	}
	return t;
}
Translator.apiTranslation = {
	'RED': 'Blinks.Colors.RED_js',
	'ORANGE': 'Blinks.Colors.ORANGE_js',
	'YELLOW': 'Blinks.Colors.YELLOW_js',
	'GREEN': 'Blinks.Colors.GREEN_js',
	'CYAN': 'Blinks.Colors.CYAN_js',
	'BLUE': 'Blinks.Colors.BLUE_js',
	'MAGENTA': 'Blinks.Colors.MAGENTA_js',
	'WHITE': 'Blinks.Colors.WHITE_js',
	'OFF': 'Blinks.Colors.OFF_js',
	'MAX_BRIGHTNESS': 'Blinks.Colors.MAX_BRIGHTNESS_js',
	'dim': 'Blinks.Colors.dim_js',
	'makeColorHSB': 'Blinks.Colors.makeColorHSB_js',
	'makeColorRGB': 'Blinks.Colors.makeColorRGB_js',
	'buttonPressed':'this.buttonPressed',
	'buttonReleased':'this.buttonReleased',
	'buttonSingleClicked':'this.buttonSingleClicked',
	'buttonDoubleClicked':'this.buttonDoubleClicked',
	'buttonMultiClicked':'this.buttonMultiClicked',
	'buttonClickCount':'this.buttonClickCount',
	'buttonLongPressed':'this.buttonLongPressed',
	'buttonDown':'this.buttonDown',
	'setValueSentOnAllFaces':'this.setValueSentOnAllFaces',
	'setValueSentOnFace':'this.setValueSentOnFace',
	'getLastValueReceivedOnFace':'this.getLastValueReceivedOnFace',
	'isValueReceivedOnFaceExpired':'this.isValueReceivedOnFaceExpired',
	'didValueOnFaceChange':'this.didValueOnFaceChange',
	'isAlone':'this.isAlone',
	'setColor':'this.setColor',
	'setColorOnFace':'this.setColorOnFace',
	'setFaceColor':'this.setFaceColor',
	'getDatagramLengthOnFace':'this.getDatagramLengthOnFace',
	'isDatagramReadyOnFace':'this.isDatagramReadyOnFace',
	'getDatagramOnFace':'this.getDatagramOnFace',
	'markDatagramReadOnFace':'this.markDatagramReadOnFace',
	'sendDatagramOnFace':'this.sendDatagramOnFace',
	'hasWoken':'this.hasWoken',
	'startState':'this.startState',
	'getSerialNumberByte':'this.getSerialNumberByte',
	'getBlinkbiosVersion':'this.getBlinkbiosVersion',
	'COUNT_OF':'Blinks.Util.COUNT_OF',
	'FACE_COUNT':'Blinks.Util.FACE_COUNT',
	'random':'Blinks.Util.random',
	'map':'Blinks.Util.map',
	// build-in stuff
	'min': 'Math.min',
	'max': 'Math.max',
	'sin8_C': 'Blinks.Util.sin8_C_js'
}
Translator.complexTranslations = [
	new Transformer( /FOREACH_FACE\(([^]+?)\)/g, function(matchSubtring,p1,offset,fullString){
		return 'for( var '+p1+'=0; '+p1+'<Blinks.Util.FACE_COUNT; '+p1+'+=1 )';
	} )
];
Translator.applyJsApi = function( body ){
	var txt = body;
	for( var key in Translator.apiTranslation ){
		if( Translator.apiTranslation.hasOwnProperty(key) ){
			txt = txt.replace( new RegExp( '\\b'+key+'\\b', 'g' ), Translator.apiTranslation[key] );
		}
	}
	return txt;
}
Translator.applyJsApiEnd = function( body ){
	var txt = body;
	for( var i=0, l=Translator.complexTranslations.length; i<l; i+=1 ){
		var t = Translator.complexTranslations[i];
		txt = txt.replace( t.regex, t.action );
	}
	return txt;
}
Translator.translateFunction = function( func, globalVariables ){
	var body = func.body;
	
	for( var i=0, l=variableTransforms.length; i<l; i+=1 ){
		body = body.replace( variableTransforms[i].regex, variableTransforms[i].action );
	}
	/*
	var vars = Translator.findVariableDeclaration( body );
	body = Translator.removeMatches( body, vars );
	var vars2 = Translator.findVariableInitialization( body );
	body = Translator.removeMatches( body, vars2 );
	var arrays = Translator.findArrays(body);
	body = Translator.removeMatches( body, arrays );
	Array.prototype.push.apply(vars,vars2);
	Array.prototype.push.apply(vars,arrays);
	body = Translator.buildVariableInitialization( vars, 'var ')+body;
	*/
	
	return func.name+'( ' +func.arguments+ ' ){\n' +body+ '\n}';
}
Translator.buildVariableInitialization = function( variables, prefix ){
	var code = '';
	var names = [];
	for( var i=0, l=variables.length; i<l; i+=1 ){
		var gv = variables[i];
		if( gv.hasOwnProperty('isEnum') && gv.isEnum ){
			var enumNames = variables[i].values.split(',');
			for( var enumIndex=0, enumCount=enumNames.length; enumIndex<enumCount; enumIndex += 1 ){
				names.push( enumNames[enumIndex] );
			}
		}else{
			names.push( variables[i].name );
		}
	}
	for( var i=0, l=variables.length; i<l; i+=1 ){
		var gv = variables[i];
		if( gv.type == 'Timer' && gv.value == null ){
			code += prefix+''+gv.name +' = new Blinks.Time.Timer();\n';
		}else if( gv.hasOwnProperty('isArray') && gv.isArray ){
			code += prefix+''+gv.name +' = ['+Translator.cleanVariableValues(gv.values,names)+'];\n';
		}else if( gv.hasOwnProperty('isEnum') && gv.isEnum ){
			console.info( 'ENUM' );
			console.info( gv );
			var enumNames = gv.values.split(',');
			for( var enumIndex=0, enumCount=enumNames.length; enumIndex<enumCount; enumIndex += 1 ){
				var ev = enumNames[enumIndex];
				code += prefix +''+ ev +' = '+(enumIndex+1)+';\n';
			}
		}else{
			code += prefix+''+gv.name +' = '+Translator.cleanVariableValues(gv.value,names)+';\n';
		}
	}
	return code;
}
Translator.buildConstructor = function( globalVariables ){
	var code = '';
	code += '	constructor (scene, x, y){\n';
	code += '		super(scene, x, y);\n';
	code += Translator.buildVariableInitialization( globalVariables, '		this.' );
	code += '	}\n';
	return code;
}
Translator.cleanVariableValues = function( expression, gvNames ){
	if( ! expression ){
		return 'null';
	}
	var txt = expression;
	for( var i=0, l=gvNames.length; i<l; i+=1 ){
		txt = txt.replaceAll( gvNames[i], 'this.'+gvNames[i] );
	}
	txt = Translator.applyJsApi(txt);
	return txt;
}
Translator.buildClass = function( functions, globals ){
	var code = '';
	code += 'class Blink extends BlinkBase {\n';
	code += '\n';
	code += Translator.buildConstructor(globals);
	for( var i=0, l=functions.length; i<l; i+=1 ){
		code += '\n';
		code += Translator.translateFunction( functions[i], globals );
		code += '\n';
		code += '\n';
	}
	code += '}\n\n';
	// code += 'window.Blink = Blink;';
	code += '\nvar BlinkClass = Blink;';
	return code;
}
Translator.clean = function( code ){
	var t = code;
	
	// we dont care about `static` or `const`
	t = t.replace( /static/g, '' );
	t = t.replace( /const/g, '' );
	
	// line ending are important for how we parse things
	// but line ending comments mess up the re-building
	t = t.replace( /\/\/.*$/gm, '' );
	
	return t;
}
Translator.postClean = function( code ){
	var t = code;
	
	// sometimes we can have this.this.variable
	t = t.replace( /(this\.)+/g, 'this.' );
	
	// beautify code if we have a beatifier
	// https://github.com/beautify-web/js-beautify
	t = js_beautify(t, {
		"indent_size": "4",
		"indent_char": " ",
		"max_preserve_newlines": "-1",
		"preserve_newlines": false,
		"keep_array_indentation": false,
		"break_chained_methods": false,
		"indent_scripts": "normal",
		"brace_style": "collapse",
		"space_before_conditional": true,
		"unescape_strings": false,
		"jslint_happy": false,
		"end_with_newline": false,
		"wrap_line_length": "0",
		"indent_inner_html": false,
		"comma_first": false,
		"e4x": false,
		"indent_empty_lines": false
	});
	
	return t;
}
Translator.applyDefines = function( t ){
	var txt = t;
	var defines = Translator.findDefineConstants( txt );
	txt = Translator.removeMatches( txt, defines );
	for( var i=0, l=defines.length; i<l; i+=1 ){
		txt = txt.replaceAll( defines[i].name, defines[i].value );
	}
	return txt;
}
Translator.thisify = function( t, variables ){
	var txt = t;
	var names = [];
	for( var i=0, l=variables.length; i<l; i+=1 ){
		var gv = variables[i];
		if( gv.hasOwnProperty('isEnum') && gv.isEnum ){
			var enumNames = variables[i].values.split(',');
			for( var enumIndex=0, enumCount=enumNames.length; enumIndex<enumCount; enumIndex += 1 ){
				names.push( enumNames[enumIndex] );
			}
		}else{
			names.push( variables[i].name );
		}
	}
	for( var i=0, l=names.length; i<l; i+=1 ){
		txt = txt.replace( new RegExp( '\\b'+names[i]+'\\b', 'g' ), 'this.'+names[i] );
	}
	return txt;
}
Translator.translate = function( t ){
	var txt = t;
	txt = Translator.clean( txt );
	txt = Translator.applyDefines( txt );
	var functions = Translator.getFunctions( txt );
	txt = Translator.removeMatches( txt, functions );
	// get "global" variables
	var gv = Translator.findVariableDeclaration( txt );
	txt = Translator.removeMatches( txt, gv );
	var gv2 = Translator.findVariableInitialization( txt );
	txt = Translator.removeMatches( txt, gv2 );
	var arrays = Translator.findArrays(txt);
	txt = Translator.removeMatches( txt, arrays );
	var enums = Translator.findEnums(txt);
	txt = Translator.removeMatches( txt, enums );
	
	var vars = [];
	Array.prototype.push.apply(vars,enums);
	Array.prototype.push.apply(vars,gv);
	Array.prototype.push.apply(vars,gv2);
	Array.prototype.push.apply(vars,arrays);
	// add function names
	for( var i=0, l=functions.length; i<l; i+=1 ){
		vars.push( functions[i].name );
	}

	console.info( functions );
	console.info( vars );
	
	var jsCode = Translator.buildClass( functions, vars );
	jsCode = Translator.applyJsApi( jsCode );
	jsCode = Translator.applyJsApiEnd( jsCode );
	jsCode = Translator.thisify( jsCode, vars );
	jsCode = Translator.postClean( jsCode );

	console.info( jsCode );
	eval( jsCode );

	return BlinkClass; // Blink is created in the eval
};
