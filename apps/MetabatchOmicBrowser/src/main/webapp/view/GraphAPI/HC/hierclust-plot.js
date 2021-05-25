/*
 * 'hierclust-plot.js'
 *
 * Copyright (c) 2014-2016 - The University of Texas MD Anderson Cancer Center
 *
 * 
 * Depends on d3 and jQuery ...
 */


/* global d3 */

//HierClustPlot = {version: "0.2"};

//function HierClustPlot (inputData, domNode, showDetailFunc, plotAnnotation)


function HierClustPlot (model, domNode, params)
{
	var	svg = null,
		dendroPanel = null,
		barsPanel = null,
		yAxis = null,
		legendNode = null;

	var myzoom = null;

	var	xDomain = [0, 0],		// min, max
		hScale = null,
		vScale = null;
		
	var	plotGeometry = {	"titleHeight" : 40,
							"plotHeight" : 450,
							"bottomAxisHeight" : 13,
							"bottomAnnotation" : 10,

							"leftAxisWidth" : 30,
							"plotWidth" : 450,
							"rightAxisWidth" : 10,
							
							"heightForBars" : 50
						};

	var	installedOptions = {
			"showTooltip" : false,
			"hoverDelay" : 500
		};

	var	mouseoverTimer = null,
		sampleHilited = null;


	function hc_node (left, right, height, h) {
		return new hc_Node (left, right, height, h);
	}

	function hc_Node (left, right, height, h) {
		this.type = "Node";
		this.parent = null;
		this.left = left;
		this.right = right;
		this.height = Number(height);
		this.h = h;
	}

	function hc_leaf (order, covars) {
		return new hc_Leaf (order, covars);
	}

	function hc_Leaf (order, covars) {
		this.type = "Leaf";
		this.parent = null;
		this.order = order;
		this.h = order;
		this.height = 0;
		this.covars = covars;
	}


	var rows = [];
	var segments = [];
	var leaves = [];
	var covarFields = null;
	var colorIndex = null;

	var color = d3.scale.category20();

	// Scaffolding, put args into their old var names
	var showDetailFunc = params.showDetailFunc,
		plotAnnotation = params.plotAnnotation;
	
	if (showDetailFunc === undefined) { showDetailFunc = null; }

		// ### Validate input data?  (At least validate the structure)
	dataReady (model, domNode);


	function dataReady (model, domNode)
	{
		var samples = model.getSamples();
		rows = model.getRows();
		var orders = model.getOrders();

		covarFields = [];
		for (var fld in samples[0])				// this gets names of all fields/columns
			covarFields.push (fld);
		covarFields = covarFields.slice (1);	// the first field is always sample ID

		covarFields = covarFields.sort(d3.descending);		// order the same as the R code

		var sampleBuilder = {};		// simply used as a Dictionary of sample ids

		samples.forEach (function (elem, ix, array) {
			sampleBuilder[elem.Sample] = elem;				// ### "Sample" .. make parameter
		});

		var topHeight = 0;
		var topNode;
		var left, right, leftEdge, rightEdge;

		leaves = new Array (orders.length + 1);		// indices in hclust data are 1-based
//		console.log (orders);
		orders.forEach (function (order, ix) {
			var thisOrder = +(order.Order);
			var orderWithId = orders[thisOrder - 1];
			leaves[thisOrder] = hc_leaf (ix, sampleBuilder[orderWithId.Id]);
		});

//			console.log (leaves);

		rows.forEach (function (element, ix, array) {
			element.Height = Number(element.Height);

			if (element.A < 0) {
				left = leaves[-element.A];
				leftEdge = left.order;
			}
			else {
				left = rows[element.A - 1].Node;
				leftEdge = left.h;
			}

			if (element.B < 0) {
				right = leaves[-element.B];
				rightEdge = right.order;
			}
			else {
				right = rows[element.B - 1].Node;
				rightEdge = right.h;
			}

			var h = (leftEdge + rightEdge) / 2;
		//	console.log ("leftEdge = " + leftEdge + ",  rightEdge = " + rightEdge + ",  h = " + h);
			element.Node = hc_node (left, right, element.Height, h);	// Adding new Node slot to object element

			left.parent = element.Node;
			right.parent = element.Node;		// needed?  used?

			if (element.Height > topHeight) {
				topNode = element.Node;
				topHeight = element.Height;
			}
		});

		leaves = leaves.slice (1);

		var justOrders = orders.map (function (ord) { return ord.Order-1; });
		leaves = d3.permute (leaves, justOrders);
	/*
		//console.log ("Leaves:");
		leaves.forEach (function (leaf, ix) {
			//console.log (leaf);
			//console.log ("" + ix + " -> " + leaf.order + " : " + leaf.covars["Sample"]);
		});
	*/

			// Is topNode always the last one ???
		doMakeDendro (topNode);

		colorIndex = matchColors (samples, covarFields);
		//console.log (colorIndex);
		makePlot(domNode);
	}


	function findTopHeight (segs)
	{
		var	minH=0, maxH=0;

		segs.forEach (function (seg, ix, array) {
			if (seg.y1 < minH) minH = seg.y1;
			if (seg.y2 < minH) minH = seg.y2;
			if (seg.y1 > maxH) maxH = seg.y1;
			if (seg.y2 > maxH) maxH = seg.y2;
		});

		return ([minH, maxH]);
	}


	function doMakeDendro (thing)	// thing is either node or leaf
	{
		if (thing.type === "Node") {
			doMakeDendro (thing.left);
			doMakeDendro (thing.right);
		//	console.log ("Connect at height " + thing.height);
				
			segments.push ({x1: thing.left.h + 0.5, x2: thing.right.h + 0.5, y1: thing.height, y2: thing.height});

				// these two drop _down_			
			segments.push ({x1: thing.left.h + 0.5, x2: thing.left.h + 0.5, y1: thing.left.height, y2: thing.height});
			segments.push ({x1: thing.right.h + 0.5, x2: thing.right.h + 0.5, y1: thing.right.height, y2: thing.height});
		}
		else {	// leaf
			//console.log ("Leaf for " + thing.order);
			//segments.push ({x1: thing.order, x2: thing.order, y1: 0, y2: 1});
		}
	}


	function redraw ()
	{
		if (d3.event && d3.event.transform) d3.event.transform(hScale);

		var lines = dendroPanel.selectAll ("line.ptline")
			.data (segments);

		lines.enter().append("svg:line")
			.attr("class", "ptline");
	
		lines
			.attr("x1", function (d) { return hScale(d.x1); })
			.attr("x2", function (d) { return hScale(d.x2); })
			.attr("y1", function (d) { return vScale(d.y1); })
			.attr("y2", function (d) { return vScale(d.y2); });

		lines.exit().remove();
	
			// Calc width of one column at current scale
		var	leafWidth = hScale(1) - hScale(0);
		var barHeight = plotGeometry.heightForBars / covarFields.length;

		var bars = barsPanel.selectAll("g.covar")
			.data (covarFields);

		bars.enter().append("svg:g")
			.attr("class", "covar")
			.attr("name", function (d) { return d; })
			.attr("transform", function(d, i) { return "translate(0," + (i * barHeight) + ")"; });

		bars.exit().remove();

		function getBarData (covar) {
			var	r = [];
			//console.log (covar);
			leaves.forEach (function (sample) {
				var thisValue = sample.covars[covar];
				r.push ({value: thisValue, "covar": covar, sample: sample, color: colorIndex(covar, thisValue)});
			});
			return r;
		}

		var cells = bars.selectAll("rect.covar-rect")
			.data (getBarData);

		cells.enter().append("svg:rect")
			.attr("class", "covar-rect")
			.style("stroke", "none");

		cells
			.attr("x", function(d) { return hScale(d.sample.order); })
			.attr("y", 0)
			.attr("width", leafWidth)
			.attr("height", barHeight)
			.style("fill", function (d, i) { return color(d.color); })
			.on("mouseover", function (d) {
				hiliteSimilarSamples (d);
				hiliteBarLabel (d);
				clearLegendHilite();
				//---findAndHiliteLegend (d.covar, d.sample.covars[d.covar]);
				covarFields.forEach (function (covar, ix, array) {
					findAndHiliteLegend (covar, d.sample.covars[covar]);
				});
				sampleHilited = d;
				})
			.on("mouseout", function (d) {
				clearHiliteSimilarSamples();
				clearBarLabelHilite();
				clearLegendHilite();
				sampleHilited = null;
				});

		cells.exit().remove();

		var labels = svg.selectAll ("text.barlabel")
			.data (covarFields);

		labels.enter().append("svg:text")
			.attr("class", "barlabel");
		labels
			.attr("name", function (d) { return d; })		// used to find it again later
			.attr("x", 0)
			.attr("y", function (d, ix) {
				return ((ix + 1) * barHeight) + plotGeometry.titleHeight + plotGeometry.plotHeight - plotGeometry.heightForBars;
				})
			.text(function (d) { return d; });
		labels.exit().remove();
	}


	function hiliteBarLabel (d) {
		// find "barlabel" element whose text == d.covar ???
		// change its class to be hilighted

		svg.selectAll ("text.barlabel[name=" + d.covar + "]")
			.classed ("hilite-label", true);
	}


	function clearBarLabelHilite () {
		// remove hilighting class
		svg.selectAll ("text.barlabel").classed ("hilite-label", false);
	}


	function hiliteSimilarSamples (d) {

		var	r = [];
		leaves.forEach (function (sample) {
			if (sample.covars[d.covar] === d.value) r.push (sample.order);
			});

			// Get the group containing the whole bar
		var hilites = barsPanel.select("g.covar[name=" + d.covar + "]")
							.selectAll("hilite-indicator")
								.data(r);

		hilites.enter().append("svg:circle")
			.attr("class", "hilite-indicator")
			.attr("r", 1)
			.attr("stroke", "black")
			.attr("stroke-width", 1)
			.attr("fill", "black")
			.style("pointer-events", "none");


			// Calc width of one column at current scale
		var	leafWidth = hScale(1) - hScale(0);
		var barHeight = plotGeometry.heightForBars / covarFields.length;

		var halfHeight = barHeight / 2,
			halfWidth = leafWidth / 2;

		hilites
			.attr("cx", function(d) { return hScale(d) + halfWidth; })	// ### ???
			.attr("cy", halfHeight);

		hilites.exit().remove();

		hilites = svg.select("g.HiliteTicks")
							.selectAll("hilite-tick")
								.data(r);

		hilites.enter().append("path")
			.attr("class", "hilite-tick")
			.attr("fill", "red");

		hilites
			.attr("d", function(d) {
					var h = hScale(d) + halfWidth;
					return "M " + h + " 1 l -3 3 l 6 0 z";
					});

		hilites.exit().remove();
	}


	function clearHiliteSimilarSamples (d) {
		barsPanel.selectAll("g.covar").selectAll(".hilite-indicator").remove();  //.attr("display", "none");
		svg.selectAll("g.HiliteTicks").selectAll(".hilite-tick").remove();  //attr("display", "none");
	}


	function findCovarLabelWidth (labelsList, el) {
		var maxWidth = 0;
		labelsList.forEach (function (label) {
			var thisWidth = myTextWidth (el, label)[0];
			if (thisWidth > maxWidth) maxWidth = thisWidth;
		});
		return maxWidth;
	}


	function makePlot (domNode) {
		xDomain = [0, leaves.length];
		var	yDomain = findTopHeight(segments);		// dendroExtent

		// X and Y axis
		hScale = d3.scale.linear().range([0, plotGeometry.plotWidth]).domain(xDomain);
		vScale = d3.scale.linear().range([plotGeometry.plotHeight - plotGeometry.heightForBars, 0]).domain(yDomain);

		myzoom = d3.behavior.zoom()
					.x(hScale)
					.scaleExtent([1, Number.POSITIVE_INFINITY])
					.on("zoom", function () {
									clearHiliteSimilarSamples();
									redraw (); });
				// ### this still allows panning "out-of-boundary" ###
				// to be fixed with xExtent, yExtent in future D3  -- CDW 2/4/14

		svg = d3.select(domNode)
			.append("svg:svg")
				.attr("class", "hc-plot")
				.attr("pointer-events", "all")
				.call(myzoom);

		yAxis = d3.svg.axis().orient("left").scale(vScale).ticks(10);

		dendroPanel = svg.append("svg:svg")
					.attr("class", "DendroPanel");

		var	labelWidth = findCovarLabelWidth (covarFields, svg.node()) + 4;
		if (plotGeometry.leftAxisWidth < labelWidth)
			plotGeometry.leftAxisWidth = labelWidth;

		svg.append("g")
			.attr("class", "AxisTicks")
			.attr("transform", "translate(" + (plotGeometry.leftAxisWidth) + "," + plotGeometry.titleHeight + ")")
			.call(yAxis)
			.call(function (g) {
						// Remove unneeded element that axis added
						// (newer D3 may not need this. Try .outerTickSize(0) )
					g.selectAll("path.domain").remove();
						// Also remove first ("0") tick mark
					g.select("g").remove();
					});

		barsPanel = svg.append("svg:svg")
					.attr("class", "BarsPanel");
		barsPanel.append("svg:rect")
			.style("fill", "black")
			.attr("width", plotGeometry.plotWidth)
			.attr("height", plotGeometry.heightForBars);

		function cleanupDetail () {
			if (mouseoverTimer) {
				clearInterval (mouseoverTimer);
			}
			mouseoverTimer = null;

			if (showDetailFunc) {
				showDetailFunc ([]);
			}
		}

		svg
			.attr("pointer-events", "all")
			.on("mouseover", function (d) {
				var p = d3.mouse(barsPanel[0][0]);
				popupAction (p[0], 100);
				})
			.on("mousemove", function (d) {
				cleanupDetail();
				var p = d3.mouse(barsPanel[0][0]);
				popupAction (p[0], 100);
				})
			.on("mouseleave", function (d) {
				cleanupDetail();
				hideMyPopup();	// clean up old popups
				});

		svg.append("g")
			.attr("class", "HiliteTicks");

		if (plotAnnotation !== undefined && plotAnnotation !== null) {
			svg.append("svg:text")
				.attr("class", "plotfootnote")
				.style("text-anchor", "end")
				.text(plotAnnotation);
		}

		_resizePlot (plotGeometry.plotWidth, plotGeometry.plotHeight);
	}


	function _resizePlot (wNew, hNew)
	{
		//console.log("HC _resizePlot " + wNew + " , " + hNew);
		plotGeometry.plotWidth = +(wNew);
		plotGeometry.plotHeight = +(hNew);

		hScale.range([0, plotGeometry.plotWidth]);
		vScale.range([plotGeometry.plotHeight - plotGeometry.heightForBars, 0]);

		svg
			.attr("width", plotGeometry.leftAxisWidth + plotGeometry.plotWidth + plotGeometry.rightAxisWidth)
			.attr("height", plotGeometry.titleHeight + plotGeometry.plotHeight + plotGeometry.bottomAxisHeight + plotGeometry.bottomAnnotation);

		dendroPanel
			.attr("x", plotGeometry.leftAxisWidth)
			.attr("y", plotGeometry.titleHeight)
			.attr("width", plotGeometry.plotWidth)
			.attr("height", plotGeometry.plotHeight - plotGeometry.heightForBars);

		barsPanel
			.attr("x", plotGeometry.leftAxisWidth)
			.attr("y", plotGeometry.titleHeight + plotGeometry.plotHeight - plotGeometry.heightForBars)
			.attr("width", plotGeometry.plotWidth)
			.attr("height", plotGeometry.heightForBars);

		svg.select("g.HiliteTicks")
			.attr("transform", "translate(" + plotGeometry.leftAxisWidth + "," +
				(plotGeometry.titleHeight  + plotGeometry.plotHeight) + ")");

		svg.select("g.AxisTicks")
			.call(yAxis)
			.call(function (g) {
						// Remove unneeded element that axis added
						// (newer D3 may not need this. Try .outerTickSize(0) )
					g.selectAll("path.domain").remove();
						// Also remove first ("0") tick mark
					//g.select("g").remove();
					});

		d3.select("#svg-border")						// ### ??? svg-border never used?
			.attr("x", plotGeometry.leftAxisWidth)
			.attr("y", plotGeometry.titleHeight)
			.attr("width", plotGeometry.plotWidth)
			.attr("height", plotGeometry.plotHeight);

		svg.select("text.plotfootnote")
			.attr("x", plotGeometry.leftAxisWidth + plotGeometry.plotWidth)
			.attr("y", plotGeometry.titleHeight + plotGeometry.plotHeight + plotGeometry.bottomAxisHeight);

		redraw ();
	}


	function popupAction (h, v) {

		if (sampleHilited === null) {
			hideMyPopup();
			if(showDetailFunc) {
				showDetailFunc ([]);
			}
		} else {

			someText = "";
			var sample = sampleHilited.sample;

			if (installedOptions["showTooltip"]) {
				showMyPopup (sample.covars["Sample"], h, v);
			}

			if(showDetailFunc) {
				var	struct = [["Sample:", sample.covars["Sample"]]];

				covarFields.forEach (function (covar, ix, array) {
					struct.push ([covar + ":", sample.covars[covar] ]);
				});

				if (mouseoverTimer) {
					clearInterval (mouseoverTimer);
				}

				mouseoverTimer = setInterval(function() {
					if (mouseoverTimer) {
						clearInterval (mouseoverTimer);
					}
					mouseoverTimer = null;
	
					showDetailFunc (struct);
					
				}, installedOptions["hoverDelay"]);
			}
		}
	}


	function showMyPopup (someText, h, v) {

		hideMyPopup();	// clean up old popups

		var g = svg.append("svg:g")
					.attr("class", "tooltip-pane")
					.attr("display", "none")
					.on("mouseout", hideMyPopup);

		var r = g.append("svg:rect")
					//.attr("id", "tooltip-rect")
					.attr("width", 200)
					.attr("height", 50)
					.attr("rx", "5")
					.attr("ry", "5");

		var t = g.append("svg:text")
					.attr("class", "tooltip-text")
					.attr("x", 5)
					.attr("y", 20)
	//				.attr("left-padding", 20)		// this doesn't do anything
					.text(someText);

		var jqueryTextWidth = myTextWidth (t.node(), someText);

		r.attr("width", jqueryTextWidth[0] + 10);
		r.attr("height", jqueryTextWidth[1] + 20);

		var mouseX = h; //x(h);
		var mouseY = v; //y(v);
		var hOffset = 10;
		var vOffset = 20;

		var hPos = mouseX + hOffset;
		var vPos = v - vOffset;

		if ((hPos + jqueryTextWidth[0]) > svg.node().getBoundingClientRect().width)
			if (mouseX - jqueryTextWidth[0] - hOffset > 0)
				hPos = mouseX - jqueryTextWidth[0] - hOffset;

		g.attr("transform", "translate(" + hPos + "," + vPos + ")")
			.attr("display", "inline");
	}


	function hideMyPopup () {
		svg.selectAll(".tooltip-pane").remove();
	}


	function _makeLegend (covar, div) {

		var callerSuppliedDiv = (div !== undefined && div !== null);

		if (!callerSuppliedDiv) {
			div = document.createElement('div');
			document.body.appendChild(div);
			$(div).css ({ position: 'absolute', left: -1000, top: -1000, display: 'none' });
		}

		var	nest = d3.nest()
				.key (function (d) { return d.covars[covar]; });

		var nestedRows = nest.entries(leaves);
		//console.log (nestedRows);

		var legendSvg = d3.select(div)
			.append("svg:svg")
				.attr("class", "batchlegend")
				.attr("pointer-events", "all")
				.attr("covar-name", covar)
				.attr("height", (nestedRows.length + 1) * 20);		// ???

		legendSvg.append("svg:text")
				.attr("class", "legendtitle")
				.attr("x", 20)
				.attr("y", 10)
				.text(covar + " (n: " + leaves.length + ")");


		var batches = legendSvg.selectAll("g.legenditem")
			.data(nestedRows);
		batches.enter().append("svg:g")
				.attr("class", "legenditem")
				//.style("stroke",	// do not set stroke here or Safari (6.0?) will bold the text
				.attr("transform", function(d, i) { return "translate(10," + ((i+1) * 20) + ")"; })
				.attr("covar-name", covar)
				.attr("covar-val", function (d) { return d.key; })
				.on("mouseover", legendMouseover)
				.on("mouseout", legendRectMouseout)		// ??? ###
				;

		batches.exit().remove();

		var symbols = batches.selectAll ("rect.legendsymbol")
						.data(function (d) { return [d]; });

		symbols.enter().append("svg:rect")
				.attr("class", "legendsymbol")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", function (d, i) { return color(colorIndex(covar, d.key)); });

		symbols.exit().remove();

		var labels = batches.selectAll ("text.legendtext")
						.data(function (d) { return [d]; });

		labels.enter().append("svg:text")
				.attr("class", "legendtext")
				.attr("x", 20)
				.attr("y", 10)
				.text(function (d) { return d.key + " (" + d.values.length + ")"; });

		labels.exit().remove();

		var content = d3.select(div).node().innerHTML;
		if (!callerSuppliedDiv)
			$(div).remove();
		else
			legendNode = legendSvg;

		return content;
	}


	function findAndHiliteLegend (covarName, batchName) {

		if (legendNode !== null) {
			var theGroup = legendNode.selectAll ("g.legenditem[covar-val=\"" + batchName + "\"]");

			if (! theGroup.empty()) {
					// find the size of the group element
				var bbox = theGroup.node().getBBox();
					// ### Better just to set style of <g> to hilite? ###
				theGroup.append("svg:rect")
						.attr("class", "legendhilite")
						.attr("x", bbox.x - 1)
						.attr("y", bbox.y - 1)
						.attr("width", bbox.width + 2)
						.attr("height", bbox.height + 2)
						.attr("pointer-events", "none");	// so it won't cause mouseout to be fired immediately
			}
		}
	}


	function clearLegendHilite () {
		if (legendNode !== null) {
			legendNode.selectAll ("rect.legendhilite").remove();
		}
	}


	function legendMouseover (d, i) {
		clearLegendHilite();

		var sel = d3.select (this);
		var covar = sel.attr("covar-name");
		var val = sel.attr("covar-val");

		findAndHiliteLegend (covar, d.key);

		hiliteBarLabel ({"covar" : covar});
		hiliteSimilarSamples ({"covar" : covar, "value" : val});
	}


	function legendRectMouseout (d, i) {
		d3.select(this).selectAll("rect.legendhilite").remove();
		clearBarLabelHilite();
		clearHiliteSimilarSamples();
	}


		// Next 2 functions could go in a utilities module
		// ### Next round, move these duplicates out
	function findCSS (cssName) {
		var sheets = window.document.styleSheets;
		for (var cur in sheets) {
			if (sheets.hasOwnProperty(cur)) {
				if (sheets[cur].href.endsWith(cssName)) {
					return sheets[cur];
				}
			}
		}
		return null;
	}

	function getCssAsText (cssName) {
		var result = "";
		var	sheet = findCSS (cssName);
		if (sheet !== null) {
			var rulesList = sheet.rules;	// a CSSRuleList
			for (var ruleKey in rulesList) {
				if (rulesList.hasOwnProperty(ruleKey)) {
					var rule = rulesList[ruleKey].cssText;
					result += rule + '\n';
				}
			}
		}
		return result;
	}


	// Provides the header necessary for browser to display SVG tags as an image
	// Find a more principled way of handling stylesheet settings
	function _makeHeader() {
		// Package the image itself

		header = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n';
		
		//var header = '<?xml version="1.0" standalone="no"?>';
		//header = header + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
		//header = header + '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n';

		// Embedded stylesheet settings
		var	rules = getCssAsText ('GraphAPI_HC.css');
		rules = '<![CDATA[\n' + rules + ']]>';
		rules = '<style type="text/css">' + rules + '</style>';
		rules = '<defs>' + rules + '</defs>\n';

		header += rules;
		return header;
	}


	function _makeFooter(){
		return '</svg>';			// To match the SVG opening tag in the header
	}


	function _getGroupVariables () {
		return covarFields.slice (0);		// returns a copy
	}


	function _getSVGContent () {
		// should check that svg is actually in parent ? ###
		return _makeHeader() + svg.node().parentNode.innerHTML + _makeFooter();
	}


	function _getLegendSVGContent (covarName) {
		var	legend = d3.select("svg.batchlegend[covar-name=\"" + covarName + "\"]");
		if (! legend.empty())
		{
			var legendNode = legend.node();
			// user other to get SVG entry
			return _makeHeader() + legendNode.outerHTML + _makeFooter();	
		}
		else
		{
			return "";
		}
	}


	function _resetScale () {
		hScale.domain(xDomain);
		myzoom.x(hScale);
		svg.call (myzoom);

		redraw ();
	}


	function _plotOptions (newOptions) {
		var	result;
		if ((newOptions === null)||(newOptions === undefined))
			result = {};
		else {
			result = newOptions;

			// check for need to redraw ###
			for (var fld in installedOptions)
				if (newOptions[fld] !== undefined)
					installedOptions[fld] = newOptions[fld];

			//if (newOptions["formatString"] !== undefined)
			//	fixedFormatter = d3.format (installedOptions["formatString"]);
		}

		for (var fld in installedOptions)
			result[fld] = installedOptions[fld];

		return (result);
	}

	// TODO: convert to class to fix hack of using plot for "class"
	function plot () {}
	plot.resizePlot = _resizePlot;
	plot.resetScale = _resetScale;
	plot.plotOptions = _plotOptions;
	plot.makeLegend = _makeLegend;
	plot.getGroupVariables = _getGroupVariables;
	plot.getSVGContent = _getSVGContent;
	plot.getLegendSVGContent = _getLegendSVGContent;
	return plot;
} // function HierClustPlot


HierClustPlot.BasicModel = function (samples, rows, orders) {

	function model () {}
		// copy these instead of returning direct refs? ###
	model.getSamples = function () { return samples; };
	model.getRows = function () { return rows; };
	model.getOrders = function () { return orders; };

	return model;
};


HierClustPlot.DefaultParams = function () {
	return {
		showDetailFunc : null,
		plotAnnotation : 'Annotation'
	};
};
