/*
 * 'pca-plot.js'
 *
 * Copyright 2012-2018 - The University of Texas MD Anderson Cancer Center
 *
 * Depends on d3 and jQuery ...
 */

//PcaPlot = {version: "0.2"};
/*---
// Older style api:

function PcaPlot (
			pcaValues, batchInfo, pcaAnnotations,								// file URLs
			node, legendNode,													// where to display (divs) Legend is optional - pass null to skip
			plotTitle, plotAnnotation, 											// title & annotations
			groupKey, oneToManyGroup, includeCentroids, xDimension, yDimension,	// data grouping, 1-to-many & centroid options, & selection
			showDetailFunc, selectCallbackFunc ) {								// callbacks for interaction
---*/

PcaPlot.uniqueSuffix = 1;

// node: where to display (divs)
// Legend is optional - pass null to skip

function PcaPlot (model, node, legendNode, params) {

	// Temporary scaffolding, get data out of model
	var pcaValues = model.getPcaValues(),
		batchInfo = model.getBatchInfo(),
		pcaAnnotations = model.getPcaAnnotations();
	// ### await all !

	// More scaffolding, put args into their old var names
	var plotTitle = params.plotTitle,
		plotAnnotation = params.plotAnnotation,
		groupKey = params.groupKey,					// data grouping
		oneToManyGroup = params.oneToManyGroup,
		includeCentroids = params.includeCentroids,
		xDimension = params.xDimension,
		yDimension = params.yDimension,
		showDetailFunc = params.showDetailFunc,
		selectCallbackFunc = params.selectCallbackFunc;

	var	samples = null,
		batchData = null,
		drawnBatchData = null,
		plotDataFields = null,
		auxDataFields = null,
		fractionalVariances = null,
		diagramAnnotations = null,
		componentAnnotations = null,
		versionString = null,
		pointCount = 0;

	var mySuffix = (PcaPlot.uniqueSuffix++).toString(),
		arrowheadId = 'PcaPlot-arrowhead-' + mySuffix;

	var	mouseoverTimer = null; //JAMES
	
	var _this = this;			// save for within event handling
		
	var	xDomain = [0, 0],		// min, max
		yDomain = [0, 0];

	var	plotGeometry = {	"titleHeight" : 40,
							"plotHeight" : 450,
							"bottomAxisHeight" : 30,
							"bottomAnnotation" : 10,

							"leftAxisWidth" : 20,
							"plotWidth" : 450,
							"rightAxisWidth" : 180
						},

		installedOptions = {
			"useUnicodeMinus" : false,
			"hiliteBatches" : true,
			"hiliteOverLines" : false,
			"showTooltip" : false,
			"autoAdjustTitleHeight" : true,
			"formatString" : ".3f",
			"hoverDelay" : 500,
			'baseUri': '//bioinformatics.mdanderson.org/main/TCGABatchEffects:Overview#'
		},

		fixedFormatter = d3.format (".3f");

	var	x,
		y;

		// variables for dragging the axes scaling logic
	var	downscalex,
		downscaley,
		downx = Math.NaN,
		downy = Math.NaN;

	var	svg,
		plotPanel,
		batchLayer,
		overlayLayer,
		centroidLayer,
		vAxisPanel,
		hAxisPanel,
		extraInfoPanel,
		batchOMeter = null;

	var	detailShown = false,
		hilitedBatch = null;


	// ###
	// This construct won't actually solve anything because the promise is never
	// returned, and is not reachable outside of this function
	//
	/*---
	new Promise(function(resolve, reject) {
	    makePcaPlot(pcaValues, batchInfo, pcaAnnotations);
	});
	---*/

	makePcaPlot(pcaValues, batchInfo, pcaAnnotations);

	function makePcaPlot (pcaValues, batchInfo, pcaAnnotations) {
		/*
		 * (1 / 3) : Process pcaValues
		 * */
		if (pcaValues[0]["Id"] === "FVE") {
			fractionalVariances = pcaValues[0];
			pcaValues = pcaValues.slice(1);
		}

		// plotDataFields will be of the PCA fields. Ex. ["PC1", "PC2", "PC3", "PC4"]
		plotDataFields = [];
		// plotDataFields = pcaValues[0].getKeys();		// ???
		for (var fld in pcaValues[0])					// this gets names of all fields/columns
			plotDataFields.push (fld);

		plotDataFields = plotDataFields.slice (1);

		// var batches = [];

		// sampleBuilder restuctures data in pcaValues into dictionary.
		// Ex: TCGA-OR-A5J1-01A-11R-A29S-07 : {Id: "TCGA-OR-A5J1-01A-11R-A29S-07", PC1: 39.3876761150013, PC2: 22.8192889903597, PC3: -22.7407924468845, PC4: 48.8058154505145} 
		var sampleBuilder = {};		// simply used as a Dictionary of sample ids

		pcaValues.forEach (function (elem, ix, array) {
			sampleBuilder[elem.Id] = elem;

			plotDataFields.forEach (function (fld) {
				elem[fld] = +(elem[fld]);
			});
		});

		samples = sampleBuilder;
		pointCount = pcaValues.length;

		auxDataFields = [];

		/*
		 * (2 / 3) : Process batchInfo
		 * */
		if (batchInfo.length > 0) {

			for (var fld in batchInfo[0])			// this gets names of all fields/columns
				auxDataFields.push (fld);

			var	idField = auxDataFields[0];			// we presume the first field is the sample id

			batchInfo.forEach (function (elem, ix, array) {
				var pointid = elem[idField];
				var sample = sampleBuilder[pointid];
				if (sample == null){
					//console.log ("Sample " + pointid + " was not in PCA data.");							
				}
				else {
					for (var i = 0 ; i < auxDataFields.length ; i++) {
						var key = auxDataFields[i];
						sample[key] = elem[key];
					}
				}
				});
		}

		/*
		 * (3 / 3) : Process pcaAnnotations
		 * */
		var	nest = d3.nest()
				.key (function (d) { return d.Type; })			// Type = Run|Diagram|Component
				.key (function (d) { return d.SubType; });		// SubType really only important for Component

		var nestedRows = nest.map (pcaAnnotations, d3.map);

		versionString = nestedRows.get("Run").get("-")["0"]["Value"]	// rows with Type = Run
		diagramAnnotations = nestedRows.get("Diagram").get("-");  		// rows with Type = Diagram
		performAnnotationSubstitution (diagramAnnotations);
		componentAnnotations = nestedRows.get("Component");			// rows with Type = Component

		batchData = makeGroups (groupKey, oneToManyGroup);
		drawnBatchData = batchData.slice(0);

		/*
		 * (4 / 3 ???) : Now that the data is organized, make the plot
		 * */
		makePlot();
		if (legendNode != undefined && legendNode != null)
			_makeLegend (legendNode);
	}


	function  makeGroups (batchKey, oneToManyGroup) {

		var batchBuilder = {};		// simply used as a Dictionary of batch ids
		var batches = [];

		for (var id in samples) {

			var sample = samples[id];
			var batchId = sample[batchKey];

			if (oneToManyGroup != null && batchId != oneToManyGroup) batchId = "Others";

			var batch = batchBuilder[batchId];
			if (batch == undefined) {
				batch = {batchID: batchId, centroid: null, points: [sample]};
				batchBuilder[batchId] = batch;
			}
			else {
				batch.points.push (sample);
			}
			sample.batch = batch;
		}

		var symbolRange = d3.scale.ordinal().range(d3.svg.symbolTypes);
		var color = d3.scale.category10();

		function  computeCentroids (array, accessors) {
			var	centroids = Array (accessors.length);

			accessors.forEach (function (ix) { centroids[ix] = 0; });

			array.forEach (function (pt, ipt) {
				accessors.forEach (function (ix) { centroids[ix] += +(pt[ix]); });
			});

			accessors.forEach (function (ix) { centroids[ix] /= array.length; });
			return centroids;
		}

		for (var i in batchBuilder) {
			var batch = batchBuilder[i];
			batch.centroid = computeCentroids (batch.points, plotDataFields);
			batch.symbol = d3.svg.symbol().type(symbolRange(i))();
			batch.color = color(i);
			batches.push (batch);
		}

			// Sort by number of points in batch so larger batches get drawn first (behind).
		batches.sort (function (a, b) { return (b.points.length - a.points.length); });

		return batches;
	}


		// This is very Batch Effects specific, but we may move it out in the future
	function performAnnotationSubstitution (annotations) {			// Modifies annotations in place
		var	substitutions = [
				["Disp. Sep. Crit. (DSC)", "DSC"],
				["Disp. within groups (Dw)", "Dw"],
				["Disp. between groups (Db)", "Db"] ];

		for (var ix = 0 ; ix < annotations.length ; ix++) {
			var elem = annotations[ix];
			var key = elem["Annotation"];

			substitutions.forEach (function (sub) {
				if (elem["Annotation"].indexOf (sub[0]) == 0)
					elem["Annotation"] = sub[1] + elem["Annotation"].substring (sub[0].length);
			});
		}
	}


	function makePlot () {

		findDomains();

		// X and Y axis
		x = d3.scale.linear().range([0, plotGeometry.plotWidth]).domain(xDomain).nice();
		y = d3.scale.linear().range([plotGeometry.plotHeight, 0]).domain(yDomain).nice();
		// drag x-axis and y-axis logic
		downscalex = x.copy();
		downscaley = y.copy();

		svg = d3.select(node)
			.append("svg:svg")
				.attr("class", "pca-plot");

		plotPanel = svg.append("svg:svg")
					.attr("class", "PlotPanel")
					.style("pointer-events", "all")
				.call(d3.behavior.zoom()
					.x(x)
					.y(y)
					.on("zoom", function () { redraw (); })
					)
				.on("keydown", function (ev) { handleKey (ev); });

		plotPanel.append("svg:defs")
			.append("svg:marker")
			.attr("id", arrowheadId)
			.attr("viewBox", "0 0 10 10")
			.attr("refX", 9)
			.attr("refY", 4)
			.attr("markerWidth", 10)
			.attr("markerHeight", 5)
			.attr("orient", "auto")
			.append("svg:path")
						.attr("d", "M 0 0 L 10 5 L 0 10 z")
						.attr("fill", "black")
				;

		// Plot border
		plotPanel.append("svg:rect")
			.attr("class", "pca-background");

		plotPanel.append("svg:g")
			.attr("class", "background-grid");

		vAxisPanel = svg.append("svg:svg")
					.attr("class", "vAxisPanel");

		// Create a group to hold the axes.  This keeps these "behind" the data points.		### This should move
		vAxisPanel.append("svg:g")
			.attr("class", "axes");
		vAxisPanel.append("svg:text")
			.attr("class", "axislabel")
			.attr("text-anchor", "middle")
			.text(yDimension);

		hAxisPanel = svg.append("svg:svg")
					.attr("class", "hAxisPanel");

		hAxisPanel.append("svg:g")
			.attr("class", "axes");
		
		hAxisPanel.append("svg:text")
			.attr("class", "plotfootnote")
			//.style("font-size", "8") Andy: This is not supported in IE 9
			.attr("text-anchor", "end")
			.text(plotAnnotation)
			;
		hAxisPanel.append("svg:text")
			.attr("class", "axislabel")
			.attr("text-anchor", "middle")
			.text(xDimension);

		// Plot border
		plotPanel.append("svg:rect")
			.attr("class", "pca-border");

		// Add layers for plots.  Order (front-to-back) is important!
		batchLayer = plotPanel.append("svg:svg")
						.attr("class", "PlotPanel")
						.style("pointer-events", "all");
		overlayLayer = plotPanel.append("svg:svg")
						.attr("class", "PlotPanel")
						.style("pointer-events", "none")

		centroidLayer = plotPanel.append("svg:svg")
							.attr("class", "PlotPanel")
							.style("pointer-events", "all");


		extraInfoPanel = svg.append('svg:foreignObject')
							.attr('class', 'extra-info-panel')
							.attr('width', 150)
							.attr('height', 200);
							//.attr('requiredExtensions', 'http://www.w3.org/1999/xhtml');
		extraInfoPanel = extraInfoPanel.append('xhtml:body')
							.attr('xmlns', 'http://www.w3.org/1999/xhtml')
							//.style('display', 'block');
							.style('margin', '0px');

		extraInfoPanel = extraInfoPanel.append('div')

		extraInfoPanel.append('ul').attr('class', 'c1').style('margin-top', '0px');
		//extraInfoPanel.append('hr');	// this fails since it won't have a '/hr'
		extraInfoPanel.append('ul').attr('class', 'c2');//.style('margin', '0px');
		extraInfoPanel.append('ul').attr('class', 'c3');//.style('margin', '0px');

			// Title
		var titlePanel = svg.append("svg:svg")
					.attr("class", "titlePanel");

		var titleElem = titlePanel.append("svg:text")
			.attr("class", "plottitle")
			.attr("text-anchor", "middle");

/*--- Move // Plot border from here to above  4/2/18 ---*/

		batchOMeter = riskGradient ({parent: svg.node(), x: 490, y: 20})();
		var temp = diagramAnnotations[0];							// ### kludgy
		if (temp['Annotation'] == 'DSC') temp = temp['Value'];		// ### else?
		batchOMeter.val(+(temp));

		// Just for demo !  Add a resize box...
/*---
		plotPanel.append("svg:rect")
			.attr("id", "resizebox")
			.attr("x", plotGeometry.plotWidth - 10)
			.attr("y", plotGeometry.plotHeight - 10)
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", "black")
			.call(d3.behavior.drag()
					.on("drag", function (d, i) {
						_this.resizePlot (plotGeometry.plotWidth + d3.event.dx, plotGeometry.plotHeight + d3.event.dx);
						}));
---*/

		redrawExtraInfo();		// ensure "extraInfo" panel is populated before resize  - kludge?
		_resizePlot (plotGeometry.plotWidth, plotGeometry.plotHeight);

		attachScaleDragHandlers();	// attach the mousemove and mouseup to the body in case one wonders off the axis line
	}


	function attachScaleDragHandlers () {
		// attach the mousemove and mouseup to the body
		// in case one wonders off the axis line
		d3.select('body')								// ###select
		  .on("mousemove", function(d) {
			var p = d3.mouse(plotPanel[0][0]);
			if (!isNaN(downx)) {
			  var rupx = downscalex.invert(p[0]),
				xaxis1 = downscalex.domain()[0],
				xaxis2 = downscalex.domain()[1],
				xextent = xaxis2 - xaxis1;
			  if (rupx != 0) {
				  var changex, new_domain;
				  changex = downx / rupx;
				  new_domain = [xaxis1, xaxis1 + (xextent * changex)];
				  x.domain(new_domain);
				  redraw ();
			  }
			  d3.event.preventDefault();
			  d3.event.stopPropagation();
			};
			if (!isNaN(downy)) {
				rupy = downscaley.invert(p[1]),
				yaxis1 = downscaley.domain()[1],
				yaxis2 = downscaley.domain()[0],
				yextent = yaxis2 - yaxis1;
			  if (rupy != 0) {
				  var changey, new_domain;
				  changey = downy / rupy;
				  new_domain = [yaxis1 + (yextent * changey), yaxis1];
				  y.domain(new_domain);
				  redraw ();
			  }
			  d3.event.preventDefault();
			  d3.event.stopPropagation();
			}
		  })
		  .on("mouseup", function(d) {
			  if (!isNaN(downx)) {
				  redraw ();
				  downx = Math.NaN;
				  d3.event.preventDefault();
				  d3.event.stopPropagation();
			  };
			  if (!isNaN(downy)) {
				  redraw ();
				  downy = Math.NaN;
				  d3.event.preventDefault();
				  d3.event.stopPropagation();
			  };
			  // d3.event.preventDefault();
			  // d3.event.stopPropagation();
		  })
			.on("keydown", function (ev) { handleKey (ev); })
			;
	}


	function handleKey (ev) {
		//console.log ("keyIdentifier = " + d3.event.keyIdentifier + "   this: " + this);
		if (detailShown && d3.event.keyIdentifier == 'U+0043') {
			selectCallbackFunc();
		}
	}


	function redraw () {

		function tx (d) { return "translate(" + x(d) + ",0)"; }
		function ty (d) { return "translate(0," + y(d) + ")"; }
		function stroke (d) { return d != 0 ? "#ccc" : "#666"; };

		if (d3.event && d3.event.transform && isNaN(downx) && isNaN(downy)) d3.event.transform(x, y);

		function cleanMinus (str) {
			if ((! installedOptions["useUnicodeMinus"]) && str.indexOf ("\u2212") == 0)
				str = '-' + str.substr(1);

			// check for silly "-0" misformat (d3 bug?)
			if (str[0] == '-' || str[0] == '\u2212') {
				var re = /^0\.*0*$/
				if (re.test (str.substr(1))) { str = str.substr(1); }
			}

			return str;
		}

		var fx, fy;
		var axes = hAxisPanel.selectAll("g.axes");		// keep the axes elements grouped

		// Regenerate x-ticks
		var ticks = x.ticks(10);
		if (Math.abs (ticks[1] - ticks[0]) > Math.pow (10, 4)) {		// 10^4 is arbitrary
			fx = d3.format (".0e");
		} else {
			fx = x.tickFormat(10);
		}

		ticks = axes.selectAll("text.xticks")
					.data(ticks, String);
		ticks.enter().append("svg:text")
			.attr("class", "xticks")
			.attr("y", 0)
			.attr("dy", "1em")
			.attr("text-anchor", "middle")
			.text(function (d) { return cleanMinus (fx(d)); })
			.on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
			.on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
			.on("mousedown", function(d) {
				var p = d3.mouse(plotPanel[0][0]);
				downx = x.invert(p[0]);
				downscalex = null;
				downscalex = x.copy();
				});

		ticks
			.attr("x", function (d) { return x(d); });
		ticks.exit().remove();


		var grid = plotPanel.select("g.background-grid");

		var gridLines = grid.selectAll("line.gridx")
							.data(x.ticks(10));
		gridLines.enter().append("svg:line")
			.attr("class", "gridx")
			.attr("y1", 0);
		gridLines
			.attr('stroke', stroke)
			.attr("x1", function (d) { return x(d); })
			.attr("x2", function (d) { return x(d); })
			.attr("y2", plotGeometry.plotHeight);
		gridLines.exit().remove();


		// Regenerate y-ticks
		axes = vAxisPanel.selectAll("g.axes");		// keep the axes elements grouped

		ticks = y.ticks(10);
		if (Math.abs (ticks[1] - ticks[0]) > Math.exp (10, 4)) {		// 10^4 is arbitrary
			fy = d3.format (".0e");
		} else {
			fy = y.tickFormat(10);
		}

		ticks = axes.selectAll("text.yticks")
					.data(ticks, String);
		ticks.enter().append("svg:text")
			.attr("class", "yticks")
			.attr("x", plotGeometry.leftAxisWidth-1)
			.attr("dy", ".25em")
			.attr("text-anchor", "end")
			.text(function (d) { return cleanMinus (fy(d)); })
			.on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
			.on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
			.on("mousedown", function(d) {
				var p = d3.mouse(vAxisPanel[0][0]);			// ### ???
				downy = y.invert(p[1]);
				downscaley = y.copy();
				});
		ticks
			.attr("y", function (d) { return y(d); });
		ticks.exit().remove();


		gridLines = grid.selectAll("line.gridy")
							.data(y.ticks(10));
		gridLines.enter().append("svg:line")
			.attr("class", "gridy")
			.attr("x1", 0);
		gridLines
			.attr('stroke', stroke)
			.attr("x2", plotGeometry.plotWidth)
			.attr("y1", function (d) { return y(d); })
			.attr("y2", function (d) { return y(d); });
		gridLines.exit().remove();


		hAxisPanel.select("text.axislabel")
			.text(xDimension);

		vAxisPanel.select("text.axislabel")
			.text(yDimension);

		redrawData();
		redrawExtraInfo();
	}


	function redrawExtraInfo () {

		function resetBoundList (sel, data, makeLink) {
			// this remove & replace is inefficient, but doesn't happen often
			var x = sel.selectAll('li').remove();
			x = sel.selectAll('li').data(data);

			x.enter().append('li')
				.each (function (d, id) {
					var sel = d3.select(this);
					sel.append(makeLink ? 'a':'span').attr('class', 'annot-label');
					sel.append('span').attr('class', 'annot-val');
				});

			x.selectAll('.annot-label')
				.text(function (d) { return d[0]; })
				.attr('href', function (d) {
						return d[2] ? installedOptions.baseUri + d[2] : '#';
					})
				.attr('target', '_blank');
			x.selectAll('.annot-val').text(function (d) { return d[1]; });
		}

		resetBoundList (extraInfoPanel.select('.c1'), _getDiagramAnnotations(), true);
		resetBoundList (extraInfoPanel.select('.c2'), _getComponentAnnotations().slice(0), true);

		var formatter = d3.format (".1f")
		var lineArray = [["FVE: " , formatter((+fractionalVariances[xDimension] + +fractionalVariances[yDimension]) * 100) + " %"]];
		if (versionString != null)
			lineArray.push (["MBatch v. ", versionString]);

		resetBoundList (extraInfoPanel.select('.c3'), lineArray, false);
	}


	function redrawData () {

		function ffx (val) { return fixedFormatter(x(val)); }
		function ffy (val) { return fixedFormatter(y(val)); }

		function drawScatter (layer) {

			var isHiliteLayer = (layer == overlayLayer);

			function getBatchColor (d) {	// d is a "batch"
				return isHiliteLayer ? "red" : d.color;
				//return (hilitedBatch == null || d != hilitedBatch) ? d.color : "red";
			}
			function getBatchStroke (d) {	// d is a "batch"
				return isHiliteLayer ? 2 : 1;
				//return (hilitedBatch == null || d != hilitedBatch) ? 1 : 2;
			}
			function hiliteVisible (d) {
				return ((!isHiliteLayer) || (hilitedBatch != null && d == hilitedBatch)) ? "visible" : "hidden";
			}

			var batches = layer.selectAll("g.batch")
				.data(drawnBatchData);
			batches.enter().append("svg:g")
					.attr("class", function () { return isHiliteLayer ? "batch-hilite hiliter batch" : "batch" })
					.attr("visibility", function () { return isHiliteLayer ? "hidden" : "visible"});	// ???

			batches
				.attr("id", function (d) { return d.batchID; })
				.style("fill", function (d, i) { return d.color; })
				.style("stroke", function (d, i) { return getBatchColor (d); })
				.attr("stroke-width", function (d, i) { return getBatchStroke (d); })
				.attr("visibility", function (d) { return hiliteVisible (d); });

			batches.exit().remove();

			if (includeCentroids) {

				var lines = batches.selectAll ("line.ptline")
							.data (getLines);

				lines.enter().append("svg:line")
					.attr("class", function () { return isHiliteLayer ? "hiliter ptline" : "ptline" })
					.on("mouseover", lineMouseover);

				lines
					.attr("x1", function (d) { return ffx(d.x1); })		// these are static so
					.attr("x2", function (d) { return ffx(d.x2); })		// can probably go in "enter()"...
					.attr("y1", function (d) { return ffy(d.y1); })
					.attr("y2", function (d) { return ffy(d.y2); });

				lines.exit().remove();
			}

			var points = batches.selectAll ("path.dot")
				.data(function (d) { return d.points; });

			points.enter().append("svg:path")
				.attr("class", function () { return isHiliteLayer ? "hiliter dot" : "dot" })
				.on("mouseover", memberMouseover)
				.on("mouseout", commonMouseout);

			points
				.attr("id", function (d) { return "" + d.batch.batchID + "-" + d.Id; })
				.attr("transform", function(d) { return "translate(" + ffx(d[xDimension]) + "," + ffy(d[yDimension]) + ")"; })
				.attr("d", function (d) { return d.batch.symbol; });

			points.exit().remove();


			//===============
			// if (includeCentroids) {}
		}

		drawScatter (batchLayer);
		drawScatter (overlayLayer);

		if (includeCentroids) {

			function getCentroidColor (d) {	// d is a "batch"
				//return isHiliteLayer ? "black" : d.color;
				return (hilitedBatch == null || d != hilitedBatch) ? d.color : "black";
			}

			var centroids = centroidLayer.selectAll("path.centroid")
									.data(drawnBatchData);

			centroids.enter().append("svg:path")
					.attr("class", "centroid")
					.attr("stroke-width", "1")
					.on("mouseover", centroidMouseover)
					.on("mouseout", commonMouseout);

			centroids
				.attr("id", function (d) { return d.batchID; })
				.attr("transform", function(d) { return "translate(" + ffx(d.centroid[xDimension]) + "," + ffy(d.centroid[yDimension]) + ")"; })
				.attr("d", function (d) { return d.symbol; })
				//.style("fill", function (d, i) { return getCentroidColor (d); });
				.style("fill", function (d) { return d.color; });

			centroids.exit().remove();

			if (groupKey == "ShipDate") {

				var trendlines = getTrendLines (batchData);

				var lines = centroidLayer.selectAll ("line.trendline")
							.data (trendlines);
	
				lines.enter().append("svg:line")
					.attr("class", "trendline")
					.attr("stroke-width", "2")
					.style("stroke", "black")
					.attr("marker-end", "url(#"+arrowheadId+")");
	
				lines
					.attr("x1", function (d) { return ffx(d.x1); })
					.attr("x2", function (d) { return ffx(d.x2); })
					.attr("y1", function (d) { return ffy(d.y1); })
					.attr("y2", function (d) { return ffy(d.y2); });
				lines.exit().remove();
			}
		}
	}


	function getLines (d) {
		var r = [];

		d.points.forEach (function (pt) {
			// Add lines between points and centroid first
			r.push ({x1: d.centroid[xDimension], x2: pt[xDimension], y1: d.centroid[yDimension], y2: pt[yDimension], batch: d});
		});
		return r;
	}


	function getTrendLines (d) {

			// Copy batch array so we can sort by batch ID
		var trendBatches = d.slice(0);		// copy before sort
		trendBatches.sort (function (a, b) { return (a.batchID < b.batchID ? -1 : (a.batchID > b.batchID ? 1 : 0)); });

		var r = [];
		var lastb = null;
		trendBatches.forEach (function (b, ix) {

			if (lastb != null) {
				var entry = {x1: lastb.centroid[xDimension], x2: b.centroid[xDimension], y1: lastb.centroid[yDimension], y2: b.centroid[yDimension]};
				//entry.color = Math.round ((1 - (ix / trendBatches.length)) * 0xffffff);
				//console.log ("Color[" + ix + "] = " + entry.color);
				r.push (entry);
			}
			lastb = b;
		});
		return r;
	}


	function centroidMouseover (d, i) {

		if (installedOptions["hiliteBatches"]) {
			//console.log ("centroidMouseover");
			showHiliteOverlay (d);
		}

		// if ...
		findAndHiliteLegend (d);

		if (installedOptions["showTooltip"])
			showMyPopup ("Centroid for batch " + d.batchID, d.centroid[xDimension], d.centroid[yDimension]);
	
		var	struct = [ ["Centroid", ""], [groupKey + ":", d.batchID] ];

		plotDataFields.forEach (function (fld) {
			struct.push ([fld + ":", fixedFormatter(+d.centroid[fld])]);
		});

		// We may add batch vars by searching for a point in auxData that matches this centroids "batch", and using that auxData.
		// That'd be ugly

		if(showDetailFunc) {

			if (_this.mouseoverTimer) {
				clearInterval (_this.mouseoverTimer);
			}

			_this.mouseoverTimer = setInterval(function() {
				if (_this.mouseoverTimer) {
					clearInterval (_this.mouseoverTimer);
				}
				_this.mouseoverTimer = null;

				showDetailFunc (struct);
				detailShown = true;
				
			}, installedOptions["hoverDelay"]);
		}
	}


	function memberMouseover (d, i) {
/*---
		//console.log ("+++ MouseOver +++");
		var eventTarget = d3.select(d3.event.target);
		var eventRelated = d3.select(d3.event.relatedTarget);
		//console.log ("target:", eventTarget);
		//console.log ("related:", eventRelated);
		//console.log ("event:", d3.event);
---*/
		if (installedOptions["hiliteBatches"]) {
			//console.log ("memberMouseover");
			showHiliteOverlay (d.batch);
		}

		// if ...
		findAndHiliteLegend (d.batch);

		if (installedOptions["showTooltip"])
			showMyPopup (d.Id, d[xDimension], d[yDimension]);

		var	struct = [ ["Sample:", d.Id], [groupKey + ":", d.batch.batchID] ];

/*
		plotDataFields.forEach (function (fld) {
			struct.push ([fld + ":", fixedFormatter(+d[fld])]);
		});
*/
		struct.push ([xDimension + ":", fixedFormatter(+d[xDimension])]);
		struct.push ([yDimension + ":", fixedFormatter(+d[yDimension])]);

		struct.push (["", ""]);

		for (var i = 0 ; i < auxDataFields.length ; i++) {
			var key = auxDataFields[i];
			if (key != "Sample") {
				var data = d[key];
				struct.push ([key + ":", data]);
			}
		}

		if(showDetailFunc) {

			if (_this.mouseoverTimer) {
				clearInterval (_this.mouseoverTimer);
			}

			_this.mouseoverTimer = setInterval(function() {
				if (_this.mouseoverTimer) {
					clearInterval (_this.mouseoverTimer);
				}
				_this.mouseoverTimer = null;

				showDetailFunc (struct);
				detailShown = true;
				
			}, installedOptions["hoverDelay"]);
		}

		return false;
	}

	function lineMouseover (d, i) {

		if (installedOptions["hiliteBatches"] && installedOptions["hiliteOverLines"]) {
			showHiliteOverlay (d.batch);
		}
	}

	function commonMouseout(d, i) {

/*---
		//console.log ("--- MouseOut ---")
		var eventTarget = d3.select(d3.event.target);
		var eventRelated = d3.select(d3.event.relatedTarget);
		//console.log ("target:", eventTarget);
		//console.log ("related:", eventRelated);
		//console.log ("event:", d3.event);
---*/
		if (_this.mouseoverTimer) {
			clearInterval (_this.mouseoverTimer);
		}
		_this.mouseoverTimer = null;

		hilitedBatch = null;

		if (installedOptions["hiliteBatches"]) {
			killHiliteOverlay();
		}

		var	legend = d3.select ("svg.batchlegend");			// ###select legend
		legend.selectAll("rect.legendhilite").remove();

		if (installedOptions["showTooltip"])
			hideMyPopup();

		if(showDetailFunc) {
			showDetailFunc ([]);
			detailShown = false;
		}
	}

	function showHiliteOverlay (targetBatch) {
		// copy batches and duplicate hilite batch to be (re)drawn last
		/*---
		drawnBatchData = batchData.slice(0);
		drawnBatchData.push (targetBatch);

		hilitedBatch = targetBatch;
		redrawData();
		---*/
		
		overlayLayer.selectAll ("g.batch").each (function (d, i) {
				if (d == targetBatch) {d3.select(this).style ("visibility", "visible");}
			});
		centroidLayer.selectAll ("path.centroid").each (function (d, i) {
				if (d == targetBatch) {d3.select(this).style("fill", "black");}
			});
	}

	function killHiliteOverlay () {
		hilitedBatch = null;
		drawnBatchData = batchData;
		//---redrawData();
		overlayLayer.selectAll ("g.batch").style ("visibility", "hidden");
		centroidLayer.selectAll ("path.centroid").style ("fill", function (d) { return d.color; });
	}


	function findAndHiliteBatch (targetBatch) {
		//overlayLayer.selectAll ("g.batch").each (function (d, i) {
		//		if (d == targetBatch) showHiliteOverlay (d);
		//	});
		// OR, more simply:
		showHiliteOverlay (targetBatch);
	}


	function showMyPopup (someText, h, v) {

		hideMyPopup();	// clean up old popups

		var g = svg.append("svg:g")
					.attr("class", "tooltip-pane")
					.attr("display", "none")
					.on("mouseout", commonMouseout);

		var r = g.append("svg:rect")
					//.attr("width", 200)
					//.attr("height", 50)
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

		var mouseX = x(h);
		var mouseY = y(v);
		var hOffset = 30; //10;
		var vOffset = 20;

		var hPos = mouseX + hOffset;
		var vPos = y(v) - vOffset;

		//if ((hPos + jqueryTextWidth[0]) > svg.node().getBoundingClientRect().width - plotGeometry.leftAxisWidth)
		if ((hPos + jqueryTextWidth[0]) > svg.node().getBoundingClientRect().width)
			if (mouseX - jqueryTextWidth[0] - hOffset > 0)
				hPos = mouseX - jqueryTextWidth[0] - hOffset;

		g.attr("transform", "translate(" + hPos + "," + vPos + ")")
			.attr("display", "inline");
	}


	function hideMyPopup () {
		svg.selectAll(".tooltip-pane").remove();
	}


	function _makeLegend (div) {

		var callerSuppliedDiv = (div != undefined && div != null);

			// Copy batch array so we can sort by batch ID
		var legendBatches = batchData.slice(0);		// copy before sort
		legendBatches.sort (function (a, b) { return (a.batchID < b.batchID ? -1 : (a.batchID > b.batchID ? 1 : 0)); });

		if (!callerSuppliedDiv) {
			div = document.createElement('div');
			document.body.appendChild(div);
			$(div).css ({ position: 'absolute', left: -1000, top: -1000, display: 'none' });
		}

		var spaceBelowTitle = 5;

		var legendSvg = d3.select(div)
			.append("svg:svg")
				.attr("class", "batchlegend")
				.attr("pointer-events", "all")			// ??? ###
//				.on("mouseout", legendRectMouseout)		// ??? ###
				.attr("height", (legendBatches.length * 20) + 10 + spaceBelowTitle) // +10 for legendtitle
				;

		legendSvg.append("svg:text")
				.attr("class", "legendtitle")
				.attr("x", 20)
				.attr("y", 10)
				.text(/*"PCA Plus" + */" (n: " + pointCount + ")");

		var batches = legendSvg.selectAll("g.legenditem")
			.data(legendBatches);
		batches.enter().append("svg:g")
				.attr("class", "legenditem")
				.style("fill", function (d, i) { return d.color; })
				.style("stroke", function (d, i) { return d.color; })
				.attr("stroke-width", "1")
				.attr("transform", function(d, i) { return "translate(10," + (((i+1) * 20) + spaceBelowTitle) + ")"; })
				.on("mouseover", legendMouseover)
				.on("mouseout", legendRectMouseout)		// ??? ###
				;

		batches.exit().remove();

		var symbols = batches.selectAll ("path.legendsymbol")
						.data(function (d) { return [d]; });

		symbols.enter().append("svg:path")
				.attr("class", "legendsymbol")
				.attr("d", function (d) { return d.symbol; });

		symbols.exit().remove();

		var labels = batches.selectAll ("text.legendtext")
						.data(function (d) { return [d]; });

		labels.enter().append("svg:text")
				.attr("class", "legendtext")
				.attr("x", 20)
				.attr("y", 3)
				.text(function (d) { return d.batchID + " (" + d.points.length + ")"; });

		labels.exit().remove();

		var content = d3.select(div).node().innerHTML;
		if (!callerSuppliedDiv)
			$(div).remove();
		return content;
	}


	function findAndHiliteLegend (targetBatch) {
		if (legendNode == null) return;

		var legend = d3.select (legendNode);
		legend.selectAll ("g.legenditem").each (function (d, i) {
				if (d == targetBatch) {
					legend.selectAll("rect.legendhilite").remove();

					var theNode = d3.select(this).node();
					var bbox = theNode.getBBox();

					d3.select(this)
						.append("svg:rect")
							.attr("class", "legendhilite")
							.attr("x", bbox.x - 1)
							.attr("y", bbox.y - 1)
							.attr("width", bbox.width + 2)
							.attr("height", bbox.height + 2)
							.attr("stroke", "red")
							.attr("pointer-events", "none");	// so it won't cause mouseout to be fired immediately

					return;
				}
			});
	}


	function legendMouseover (d, i) {
		if (legendNode == null) return;

		d3.select(legendNode).selectAll("rect.legendhilite").remove();
		killHiliteOverlay();

		findAndHiliteBatch (d);
		findAndHiliteLegend (d);
	}


	function legendRectMouseout (d, i) {
		d3.select(this).selectAll("rect.legendhilite").remove();		// ###select interesting...
		killHiliteOverlay();
	}


	// recalc max width of labels in element el
	function findAxisLabelWidth (labels, el) {
		var textnode = el.node();
		var maxWidth = d3.max (labels, function(label) { return myTextWidth (textnode, label)[0]; });
		return maxWidth;
	}

	// recalc max height of labels in element el
	function findAxisLabelHeight (labels, el) {
		var textnode = el.node();
		var maxHeight = d3.max (labels, function(label) { return myTextWidth (textnode, label)[1]; });
		return maxHeight;
	}

	// Find min and max of data.  Force domains to be non-empty.
	function findDomains ()
	{
		xDomain[0] = d3.min (batchData, function(batch) { return d3.min (batch.points, function(pt) {return pt[xDimension];}); });
		xDomain[1] = d3.max (batchData, function(batch) { return d3.max (batch.points, function(pt) {return pt[xDimension];}); });
		if (xDomain[0] == xDomain[1]) {
			xDomain[0] -= 5;
			xDomain[1] += 5;
		}

		yDomain[0] = d3.min (batchData, function(batch) { return d3.min (batch.points, function(pt) {return pt[yDimension];}); });
		yDomain[1] = d3.max (batchData, function(batch) { return d3.max (batch.points, function(pt) {return pt[yDimension];}); });
		if (yDomain[0] == yDomain[1]) {
			yDomain[0] -= 5;
			yDomain[1] += 5;
		}
	}


	//
	//  Public "methods":
	// -------------------

var	lastHeight = null;
var lastPixelRatio = null;

	function _resizePlot (wNew, hNew) {

		//console.log ("_resizePlot (" + wNew + ", " + hNew + ")");

		plotGeometry.plotWidth = +(wNew);
		plotGeometry.plotHeight = +(hNew);

		var titlePanel = svg.select("svg.titlePanel");
		var titleElem = titlePanel.select("text.plottitle");

		var	titleArray = breakStringForWrap (plotTitle, plotGeometry.plotWidth, titleElem.node());
		var lineHeight = getRealLineHeight (titleElem.node());

		if (installedOptions["autoAdjustTitleHeight"] && titleArray != null) {
			plotGeometry.titleHeight = lineHeight * titleArray.length + 3;	// ???
		}

		// X and Y axis
		x.range([0, plotGeometry.plotWidth]);
		y.range([plotGeometry.plotHeight, 0]);

		// drag x-axis logic
		downscalex = x.copy();
		downscaley = y.copy();

		var yticks = y.ticks(10);
		var axisLabelWidth = findAxisLabelWidth (yticks, vAxisPanel);	// ### not sure we're passing the right element
		plotGeometry.leftAxisWidth = axisLabelWidth + 5;	// 5 is arbitrary but seemed right

		var vLabelMargin = findAxisLabelHeight (yticks, vAxisPanel);


		axisLabelWidth = findAxisLabelWidth (x.ticks(10), hAxisPanel);	// ### not sure we're passing the right element
		var hLabelMargin = (axisLabelWidth + 1) / 2;					// round up
		var hAxisMidpoint = (plotGeometry.plotWidth + hLabelMargin + hLabelMargin) / 2;

		svg
			.attr("width", plotGeometry.leftAxisWidth + plotGeometry.plotWidth + plotGeometry.rightAxisWidth)
			.attr("height", plotGeometry.titleHeight + plotGeometry.plotHeight + plotGeometry.bottomAxisHeight + plotGeometry.bottomAnnotation);

		plotPanel
			.attr("x", plotGeometry.leftAxisWidth)
			.attr("y", plotGeometry.titleHeight)
			.attr("width", plotGeometry.plotWidth)
			.attr("height", plotGeometry.plotHeight);

		hAxisPanel
			.attr("x", plotGeometry.leftAxisWidth - hLabelMargin)
			//.attr("y", plotGeometry.titleHeight + plotGeometry.plotHeight)
			.attr("y", plotGeometry.titleHeight + plotGeometry.plotHeight + 2)
			.attr("width", plotGeometry.plotWidth + hLabelMargin + hLabelMargin)
			.attr("height", plotGeometry.bottomAxisHeight + plotGeometry.bottomAnnotation);

		hAxisPanel.select(".axes")
			.attr("transform", "translate(" + hLabelMargin + ",0)");

		hAxisPanel.select("text.axislabel")
			.attr("x", hAxisMidpoint)
			.attr("y", plotGeometry.bottomAxisHeight - 1);

		hAxisPanel.select("text.plotfootnote")
			.attr("x", plotGeometry.plotWidth)
			.attr("y", plotGeometry.bottomAxisHeight + plotGeometry.bottomAnnotation - 1);		// ###  bottomAnnotation ?

		vAxisPanel
			.attr("x", 0)
			.attr("y", plotGeometry.titleHeight - vLabelMargin)		// ###
			.attr("width", plotGeometry.leftAxisWidth)
			.attr("height", plotGeometry.plotHeight + 20);

		vAxisPanel.select(".axes")
			.attr("transform", "translate(0," + vLabelMargin + ")");

		vAxisPanel.select("text.axislabel")
			.attr("transform", "translate(" + plotGeometry.leftAxisWidth / 2 + "," + plotGeometry.plotHeight / 2 + ") rotate(-90)");

		plotPanel.select("rect.pca-border")
			.attr("width", plotGeometry.plotWidth)
			.attr("height", plotGeometry.plotHeight);

			//
			// Title
			//
		titlePanel
			.attr("x", plotGeometry.leftAxisWidth)
			.attr("y", 0)
			.attr("width", plotGeometry.plotWidth)
			.attr("height", plotGeometry.titleHeight);

		titleElem
			.attr("x", plotGeometry.plotWidth / 2)
			.attr("y", plotGeometry.titleHeight - 2);

		var titleArrayWithLineNums = [];
		if (titleArray != null)
			titleArray.forEach (function (line, ix) { titleArrayWithLineNums.push ([ix, line]); });

		var	titleSpans = titleElem.selectAll("tspan")
				.data(titleArrayWithLineNums);

		titleSpans.enter().append("svg:tspan")
				.text(function (d) { return d[1]; })
				.attr("x", plotGeometry.plotWidth / 2)
				.attr("y", lineHeight)
				.attr("dy", function (d) { return d[0] * lineHeight; });
		titleSpans
				.text(function (d) { return d[1]; })
				.attr("x", plotGeometry.plotWidth / 2)
				.attr("y", lineHeight)
				.attr("dy", function (d) { return d[0] * lineHeight; });
		titleSpans.exit().remove();

		var extraBBox = extraInfoPanel.node().getBoundingClientRect();

		// This is here due to inconsistency between Firefox and Chrome browsers, and
		// disagreement over boundingClientRect when zoomed
		if (lastHeight && lastPixelRatio) {
			if (window.devicePixelRatio != lastPixelRatio && 
				Math.abs(extraBBox.height - lastHeight) > 1.0) {
				//console.log ('*** Should need fix! ***');
				extraBBox.height = extraBBox.height / window.devicePixelRatio;
			}
		}
		lastHeight = extraBBox.height;
		lastPixelRatio = window.devicePixelRatio;

		d3.select(extraInfoPanel.node().parentNode)
			.attr('width', extraBBox.width)
			.attr('height', extraBBox.height);

		var foreignObj = d3.select(extraInfoPanel.node().parentNode.parentNode);
		foreignObj
			// leave 1 pixel on left
			.attr("x", plotGeometry.leftAxisWidth + plotGeometry.plotWidth + 1)
			// and anchor at bottom
			.attr("y", plotGeometry.plotHeight + plotGeometry.titleHeight - extraBBox.height)
			.attr('width', extraBBox.width)
			.attr('height', extraBBox.height);

		var bomWidth = extraBBox.width - 10;	// was extraBBox.width - 0;
		if (bomWidth > 170) bomWidth = 170;
		batchOMeter
			.x(plotGeometry.leftAxisWidth + plotGeometry.plotWidth + 6)
			.resize(bomWidth,
					plotGeometry.plotHeight + plotGeometry.titleHeight - 20 - extraBBox.height);

		redraw ();
	}


	function _resetScale () {
		x.domain(xDomain).nice();
		y.domain(yDomain).nice();

		downscalex = x.copy();
		downscaley = y.copy();

		plotPanel.call(d3.behavior.zoom()
			.x(x).y(y)
			.on("zoom", function () { redraw (); })
			);

		redraw ();
	}


	function _getGraphVariables () { return plotDataFields.slice (0); }		// return copy of the array


	function _setDimensions (newXDim, newYDim) {
		xDimension = newXDim;
		yDimension = newYDim;

		findDomains();

		x.domain(xDomain).nice();
		y.domain(yDomain).nice();
		downscalex = x.copy();
		downscaley = y.copy();

		redraw();
	}


	function _getComponentAnnotations () {
		var compString = xDimension + "," + yDimension;
		var result = [];
		var anchor;

		var elems = componentAnnotations.get(compString);
		if (elems != null) {
			performAnnotationSubstitution (elems);

			elems.forEach (function (elem, ix) {
				var key = elem["Annotation"];
				var data = elem["Value"];
				if (key.indexOf ("pvalue") == -1)
				{
					data = fixedFormatter (+data);
					if (key.startsWith('DSC')) anchor = 'DSCcomp';
					else if (key.startsWith('Dw')) anchor = 'DwComp';
					else if (key.startsWith('Db')) anchor = 'DbComp';
				} else {
					anchor = 'pvalueComp';
				}
				result.push ([key + ":", data, anchor]);
			});
		}

		return result;
	}


	function _getDiagramAnnotations () {
		var result = [];
		var	anchor;

		for (var ix = 0 ; ix < diagramAnnotations.length ; ix++) {
			var elem = diagramAnnotations[ix];
			var key = elem["Annotation"];
			var data = elem["Value"];
			anchor = 'pvalue';
			if (key.indexOf ("pvalue") == -1) {
				data = fixedFormatter (+data);
				anchor = key;
			}
			result.push ([key + ":", data, anchor]);
		}

		return result;
	}


	function _getGroupVariables () {
		return auxDataFields.slice (1);
	}


	function _plotOptions (newOptions) {
		var	result;

		if (newOptions == null)
			result = {};
		else {
			result = newOptions;

			// check for need to redraw ###
			for (var fld in installedOptions)
				if (newOptions[fld] != undefined)
					installedOptions[fld] = newOptions[fld];

			if (newOptions["formatString"] != undefined)
				fixedFormatter = d3.format (installedOptions["formatString"]);
		}

		for (var fld in installedOptions)
			result[fld] = installedOptions[fld];

		return (result);
	}

		// Next 2 functions could go in a utilities module
	function findCSS (cssName) {
		var sheets = window.document.styleSheets;
		for (cur in sheets) {
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
			for (ruleKey in rulesList) {
				if (rulesList.hasOwnProperty(ruleKey)) {
					var rule = rulesList[ruleKey].cssText;
					result += rule + '\n';
				}
			}
		}
		return result;
	}


	// Provides the header necessary for browser to display SVG tags as an image
	function _makeHeader(){
		// Package the image itself

		header = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n';
		
		//var header = '<?xml version="1.0" standalone="no"?>';
		//header = header + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
		//header = header + '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n';

		// Embedded stylesheet settings
		var	rules = getCssAsText ('GraphAPI_PCA.css');
		rules = '<![CDATA[\n' + rules + ']]>';
		rules = '<style type="text/css">' + rules + '</style>';
		rules = '<defs>' + rules + '</defs>\n';

		header += rules;
		return header;
	}
	
	// To match the SVG opening tap in the header
	function _makeFooter(){
		return '</svg>';
	}
	
	function _getSVGContent () {
		// should check that svg is actually in parent ? ###
		return _makeHeader() + svg.node().parentNode.innerHTML + _makeFooter();
	}
	
	function _getExtraPdfContent(thePdfObject)
	{
		thePdfObject.addPage();
		var annots = _getComponentAnnotations();
		annots.forEach(function(theRow)
		{
			thePdfObject.text(theRow[0] + " " + theRow[1]);
		});
		var diagAn = _getDiagramAnnotations();
		diagAn.forEach(function(theRow)
		{
			thePdfObject.text(theRow[0] + " " + theRow[1]);
		});
		var formatter = d3.format (".1f");
		var lineArray = [["FVE: " , formatter((+fractionalVariances[xDimension] + +fractionalVariances[yDimension]) * 100) + " %"]];
		lineArray.push (["MBatch v. ", versionString]);
		lineArray.forEach(function(theRow)
		{
			thePdfObject.text(theRow[0] + " " + theRow[1]);
		});
		return thePdfObject;
	}
	
	function _getLegendSVGContent () {
		// should check that svg is actually in parent ? ###
		if(legendNode != null) {
			return _makeHeader() + legendNode.innerHTML + _makeFooter();	
		}else{
			return "";
		}
	}

//	function plot () {}
//	plot.resizePlot = _resizePlot;
//	plot.resetScale = _resetScale;
//	plot.getGraphVariables = _getGraphVariables;
//	plot.setDimensions = _setDimensions;
//	plot.getComponentAnnotations = _getComponentAnnotations;
//	plot.getDiagramAnnotations = _getDiagramAnnotations;
//	plot.getGroupVariables = _getGroupVariables;
//	plot.plotOptions = _plotOptions;
//	plot.makeLegend = _makeLegend;
//	plot.getSVGContent = _getSVGContent;
//	plot.getLegendSVGContent = _getLegendSVGContent;
//	plot.getPlotType = () => "PcaPlot";		// ### Ugly
//	return plot;
	
	// TODO: fix hack: not sure what plot(){} is for above
	this.resizePlot = _resizePlot;
	this.resetScale = _resetScale;
	this.getGraphVariables = _getGraphVariables;
	this.setDimensions = _setDimensions;
	this.getComponentAnnotations = _getComponentAnnotations;
	this.getDiagramAnnotations = _getDiagramAnnotations;
	this.getGroupVariables = _getGroupVariables;
	this.plotOptions = _plotOptions;
	this.makeLegend = _makeLegend;
	this.getSVGContent = _getSVGContent;
	this.getExtraPdfContent = _getExtraPdfContent;
	this.getLegendSVGContent = _getLegendSVGContent;
	this.getPlotType = () => "PcaPlot";		// ### Ugly
	return this;
}  // function PcaPlot


PcaPlot.BasicModel = function (pcaValues, batchInfo, annotations) {

	function model () {}
		// copy these instead of returning direct refs? ###
	model.getPcaValues = function () { return pcaValues; }
	model.getBatchInfo = function () { return batchInfo; }
	model.getPcaAnnotations = function () { return annotations; }

	return model;
}


PcaPlot.DefaultParams = function () {
	return {
		plotTitle : 'Title',
		plotAnnotation : 'Annotation',
		groupKey : 'BatchId',
		oneToManyGroup : null,
		includeCentroids : true,
		xDimension : 'PC1',
		yDimension : 'PC2',
		showDetailFunc : null,
		selectCallbackFunc : null
	};
}
