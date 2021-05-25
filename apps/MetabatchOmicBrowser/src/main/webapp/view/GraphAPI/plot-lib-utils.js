/*
 * 'plot-lib-utils.js'
 *
 * Copyright (c) 2012 - The University of Texas MD Anderson Cancer Center
 *
 * 
 * Depends on d3 and jQuery ...
 */


// myTextWidth :  Depends on jQuery

function myTextWidth (el, someText) {
	var div = document.createElement('div');
	document.body.appendChild(div);
	$(div).css ({
		position: 'absolute',
		left: -1000,
		top: -1000,
		display: 'none'
		});
	$(div).html(someText);

	var styles = ['font-size','font-style','font-weight','font-family','line-height','text-transform','letter-spacing'];
	$(styles).each(function() {
		var s = this.toString();
		$(div).css(s, $(el).css(s));
		});

	var w = $(div).outerWidth();
	var h = $(div).outerHeight();
	$(div).remove();

	return [w, h];
}


// getRealLineHeight :  Depends on jQuery

function getRealLineHeight (el)
{
	var span = document.createElement('span');
	document.body.appendChild(span);
	$(span).css ({
		position: 'absolute',
		left: -1000,
		top: -1000,
		display: 'none'
		});
	$(span).html("&nbsp;");

	var styles = ['font-size','font-style','font-weight','font-family','line-height','text-transform','letter-spacing'];
	$(styles).each(function() {
		var s = this.toString();
		$(span).css(s, $(el).css(s));
		});

	var h = $(span).height();
	$(span).remove();

	return h;
}



function textDimsWithStyles (someText, arrayOfStyles)
{
	var div = document.createElement('div');
	document.body.appendChild(div);
	$(div).css ({
		position: 'absolute',
		left: -1000,
		top: -1000,
		display: 'none'
		});
	$(div).html(someText);

//	...			### still need to MAKE USE of styles ###

	var w = $(div).outerWidth();
	var h = $(div).outerHeight();
	$(div).remove();

	return [w, h];
}


function getRealLineHeightWithStyles (arrayOfStyles)
{
	var span = document.createElement('span');
	document.body.appendChild(span);
	$(span).css ({
		position: 'absolute',
		left: -1000,
		top: -1000,
		display: 'none'
		});
	$(span).html("&nbsp;");

//	...			### still need to MAKE USE of styles ###

	var h = $(span).height();
	$(span).remove();

	return h;
}


function  splitStringInTwo (s)
{
	var mid = Math.round (s.length / 2);
	var nextSpace = s.indexOf (' ', mid);
	var prevSpace = s.lastIndexOf (' ', mid);
	var	breakLoc;

	if (mid - prevSpace < nextSpace - mid)		// closer to prev?
		breakLoc = prevSpace;
	else
		breakLoc = nextSpace;

	return ([s.substring (0, breakLoc), s.substring (breakLoc+1)]);
}


function  splitStringInThree (s)
{
	var twothirds = Math.round (s.length / 3) * 2;
	var nextSpace = s.indexOf (' ', twothirds);
	var prevSpace = s.lastIndexOf (' ', twothirds);
	var	breakLoc;

	if (twothirds - prevSpace < nextSpace - twothirds)		// closer to prev?
		breakLoc = prevSpace;
	else
		breakLoc = nextSpace;

	var last = s.substring (breakLoc+1);
	var first = splitStringInTwo (s.substring (0, breakLoc));

	return (first.concat (last));
}


function  splitStringInFour (s)
{
	var temp = splitStringInTwo (s);
	return (splitStringInTwo(temp[0]).concat (splitStringInTwo(temp[1])));
}


function  breakStringForWrap2 (s, width, styles)
{
		//
		// This could be optimized by bringing part of 'textDimsWithStyles' inside of
		// here to avoid creating a div multiple times.
		//
	var	testDims = textDimsWithStyles (s, styles);
	if (testDims[0] > width)
	{
		var splits = splitStringInTwo (s);
		testDims = textDimsWithStyles (splits[0] + "<br/>" + splits[1], styles);
		if (testDims[0] > width)
		{
			splits = splitStringInThree (s);
			testDims = textDimsWithStyles (splits[0] + "<br/>" + splits[1] + "<br/>" + splits[2], styles);
			if (testDims[0] > width)
			{
				splits = splitStringInFour (s);
				testDims = textDimsWithStyles (splits[0] + "<br/>" + splits[1] + "<br/>" + splits[2] + "<br/>" + splits[3], styles);
				if (testDims[0] <= width)
					return splits;				// split to 4 lines
				else
					return null;				// still would not fit
			}
			else
				return splits;					// split to 3 lines
		}
		else
			return splits;						// split to 2 lines
	}
	else
		return [s];								// no need to split
}


function  breakStringForWrap (s, width, el)
{
		//
		// This could be optimized by bringing part of 'textDimsWithStyles' or 'myTextWidth' inside of
		// here to avoid creating a div multiple times.
		//
	var	testDims = myTextWidth (el, s);
	if (testDims[0] > width)
	{
		var splits = splitStringInTwo (s);
		testDims = myTextWidth (el, splits[0] + "<br/>" + splits[1]);
		if (testDims[0] > width)
		{
			splits = splitStringInThree (s);
			testDims = myTextWidth (el, splits[0] + "<br/>" + splits[1] + "<br/>" + splits[2]);
			if (testDims[0] > width)
			{
				splits = splitStringInFour (s);
				testDims = myTextWidth (el, splits[0] + "<br/>" + splits[1] + "<br/>" + splits[2] + "<br/>" + splits[3]);
				if (testDims[0] <= width)
					return splits;				// split to 4 lines
				else
					return null;				// still would not fit
			}
			else
				return splits;					// split to 3 lines
		}
		else
			return splits;						// split to 2 lines
	}
	else
		return [s];								// no need to split
}


// traverseSvg :  Depends on jQuery

function traverseSvg (elem)
{
	var	result = "";
	var  myLevel = 0;

	var addIndent = function (num)		// ???
	{
		while (num--)
			result += "&nbsp;";
	}

	var func = function (elem)
	{
		//print pre
		addIndent (myLevel);			// ???
		var jElem = $(elem);
		result += elem + ": " + jElem.attr("nodeName");

		// ### Check jquery and d3 to see how to query all attributes & properties...  ###

		$.each(jElem.get(0).attributes, function (i, attr) {
			result += " " + attr.name + "=\"" + attr.value + "\"";
			});

		result +=  '<br/>';

		myLevel += 1;

		//traverse children
		var childs = jElem.children();
		childs.each (function (i, elem) {
			func (elem);
			});

		//  Need to print out value (text) here somewhere ###

		myLevel -= 1;

		//print post
		result += "</" + jElem.attr("nodeName") + ">";
	};

	func (elem);
	return result;
}


// tsvreader : Depends on d3

//---
//(function(){tsv.reader = function(url, callback) {
function tsvreader (url, callback) {
	d3.text(url, "text/tsv", function(text) {
		callback(text && tsv_reader_parse(text));
	});
};

tsv_reader_parse = function(text) {

	//console.log ("in tsv_reader_parse, text.length is " + text.length);

	var malformedCount = 0;
	var header;
	var result = [];
	var lines = text.split('\n');

	//console.log ("lines.length is " + lines.length);

	header  = lines[0].split('\t');
	header[header.length - 1] = header[header.length - 1].trim();	// Remove troublesome \n at end

	//console.log ("header.length = " + header.length);

	// Build proto object first ???

	var doneOnce = false;

	lines.forEach (function (oneline, ix) {
			if (ix == 0) return;

			var values = oneline.split('\t');
			if (values.length != header.length)
			{
				malformedCount += 1;
				//console.log ("malformed content length =" + values.length);
			}
			else
			{
				var a = new Object();

				values.forEach (function (val, ix) {
					a[header[ix]] = val;
					});

				result.push(a);
			}
			doneOnce = true;
		});

	//console.log ("malformedCount =" + malformedCount);

	var first = result[0];

	return result;
}
//})();
//---



/*---
function getObjectStructure (arrayOfObj)
{
	var result = [];

	if (arrayOfObj && arrayOfObj.length > 0)
	{
					pointsrows.forEach (function (elem, ix, array) {
						//console.log ("ID?  " + elem[0]);
						for (fld in elem)
							//console.log ("fld: " + fld + "   elem[]: " + elem[fld]);
						});
					});
	}
}
---*/