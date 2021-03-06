
riskGradient.uniqueSuffix = 1;

function riskGradient (config) {

// Make rectangle narrower, or adjustable
// Make resizable
// Squeeze in axis ticks

	var parent;
	var x;
	var y;
	var val = 0;
	var width = 20;
	var height = 200;
	var zoom = 1;

	var yScale;				// the d3.scale used internally
	var yAxis;
	var svg;
	var scalingGroup;
	//var rectX = 95;			// constant for spacing to the rectangle
	var rectX = 70;			// constant for spacing to the rectangle
	var	originalSize;

	var gradient = [['0%', 'red'], ['20%', 'red'], ['40%', 'yellow'], ['60%', 'yellow'],
						['80%', 'green'], ['100%', 'green']];

	var domain = [0.0, 0.8];		// 0.8 per Rehan


	function my () {
		if (config != undefined) {
			parent = config['parent'];
			x = config['x'];
			y = config['y'];

			if (config['width'] != undefined) width = config['width'];
			if (config['height'] != undefined) height = config['height'];
			if (config['zoom'] != undefined) zoom = config['zoom'];

			if (parent != undefined && x != undefined && y != undefined) {
				makeMeter();
			}
		}

		return my;
	}

	my.parent = function (parent) {
	}

	my.x = function (x) {
		// if args ...
		svg.attr('x', x);
		return my;
	}

	my.y = function (y) {
	}

	my.val = function (newVal) {
		// if args ...
		val = newVal;
		redrawIndicator(val);
		return my;
	}

	my.zoom = function (newZoom) {
		// if args ...
		zoom = newZoom;
		scalingGroup.attr('transform', 'scale(' + zoom + ')');
		return my;
	}

	my.resize = function (h, v) {
		// See which dimension constrains the plot most, then scale the entire plot to fit
		var hFactor = (+h) / originalSize[0];
		var vFactor = (+v) / originalSize[1];
		var factor = (hFactor < vFactor) ? hFactor : vFactor;
		factor = factor * 0.9;
		//console.log ("Factor: " + factor);	// useful in debugging
		my.zoom (factor);
		return my;
	}


	function redrawIndicator (val) {
		var yInd = yScale(val);
		if (yInd < 0) yInd = 0;

		scalingGroup.select('path')
			.attr('transform', 'translate(' + (rectX+width+0-3) + ',' + (yInd+20) + ')');	// +7 for path

		scalingGroup.select('#DSC')
			.attr('y', yInd+24);
	}


	function makeMeter () {

		var mySuffix = (riskGradient.uniqueSuffix++).toString(),
			gradientId = 'riskGradient-gradient-' + mySuffix,
			arrowheadId = 'riskGradient-arrowhead-' + mySuffix,
			startArrowheadId = 'riskGradient-start-arrow-' + mySuffix;

		yScale = d3.scale.linear().range([height, 0]).domain(domain).nice();

		svg = d3.select(parent).append('svg:svg')
				.attr('version', '1.1')
				.attr('xmlns', 'http://www.w3.org/2000/svg')
				.attr('class', 'riskGradient')
				.attr('x', x)
				.attr('y', y);

		var defs = svg.append ('svg:defs');
		var lg = defs.append ('linearGradient')
				.attr('id', gradientId)		// x1 & y1 default to 0
				.attr('x2', 0)					// letting x2 default gives 'candy cane'
				.attr('y2', 1);

		d3.select(lg[0][0]).selectAll('stop')
				.data(gradient)
				.enter().append('svg:stop')
					.attr('offset', function (d) { return d[0]; })
					.attr('stop-color', function (d) { return d[1]; });

		defs.append("svg:marker")
			.attr("id", arrowheadId)
			.attr("viewBox", "-6 -6 12 12")
			.attr("refX", -2)
			.attr("refY", 0)
			.attr("markerWidth", 5)
			.attr("markerHeight", 5)
			.attr("orient", "auto")
			.append('svg:polygon')
				.attr('points', '-2,0 -5,5 5,0 -5,-5')
				.attr('stroke-width', '1px')
				.attr('stroke', 'black')
				.attr('fill', 'black');
		defs.append("svg:marker")
			.attr("id", startArrowheadId)
			.attr("viewBox", "-6 -6 12 12")
			.attr("refX", 2)
			.attr("refY", 0)
			.attr("markerWidth", 5)
			.attr("markerHeight", 5)
			.attr("orient", "auto")
			.append('svg:polygon')
				.attr('points', '2,0 5,5 -5,0 5,-5')
				.attr('stroke-width', '1px')
				.attr('stroke', 'black')
				.attr('fill', 'black');

		scalingGroup = svg.append('svg:g')
					.attr('transform', 'scale(' + zoom + ')');

		scalingGroup.append('svg:rect')
			.attr('x', rectX)
			.attr('y', 20)
			.attr('width', width)
			.attr('height', height)
			.style('fill', 'url(#'+gradientId+')');

		scalingGroup.append('svg:path')
			.attr('d', 'M 0 -12 l -12 12 l 12 12 l 0 -8 l 8 0 l 0 -8 l -8 0 z')
			.attr('fill', 'black');		// will translate to position later

		scalingGroup.append("svg:text")
			.attr('id', 'DSC')
			.attr('x', (rectX+width+0-4+12))
			.text('DSC');				// set y coord later


		var fmt = d3.format('.1g');

		yAxis = d3.svg.axis().orient("left").scale(yScale).ticks(4)
				//.outerTickSize(0)
				//.innerTickSize(3);
				.tickFormat (function (tick) {
					var result = fmt(tick);
					if (result == '0.8') result = '\u2265 0.8';		// >= sign
					return result;
					});

		scalingGroup.append("g")
			.attr("class", "AxisTicks")
			.attr("transform", "translate(" + (rectX-4) + ", 20)")
			.style('stroke-width', '1px')
			.call(yAxis)
			.call(function (g) {
						// Remove unneeded element that axis added
						// (newer D3 may not need this. Try .outerTickSize(0) )
					g.selectAll("path.domain").remove();
						// Also remove first ("0") tick mark
					//g.select("g").remove();

					g.selectAll('line').style('stroke', 'black');
					});

		scalingGroup.append("svg:text")
			//.attr("class", "label")
			.attr("text-anchor", "middle")
			.attr('x', 30)
			.attr('y', 40)
			.text('Severity');
		scalingGroup.append('svg:text')
			.attr("text-anchor", "end")
			//.attr('x', 20)
			.attr('x', 25)
			.attr('y', 90)
			.text('High');
		scalingGroup.append('svg:text')
			.attr("text-anchor", "end")
			//.attr('x', 20)
			.attr('x', 25)
			.attr('y', 170)
			.text('Low');

		scalingGroup.append("svg:line")
			.attr("x1", 30)
			.attr("x2", 30)
			.attr("y1", 60)
			.attr("y2", 200)
			.attr("stroke-width", "2")
			.style("stroke", "black")
			.attr("marker-start", "url(#"+startArrowheadId+")")
			.attr("marker-end", "url(#"+arrowheadId+")")


		redrawIndicator(val);


		var bbox = svg.node().getBBox();		// This gives a "SVGRect"
		//console.log (bbox);
		originalSize = [ bbox.width, bbox.height ];
		//console.log ('Orig size = [' + originalSize[0] + ', ' + originalSize[1]);
	}


	return my;
}
