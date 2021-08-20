/*  global d3 */

(function ()
{

	var jitter = Array(100);	// 100 is arbitrary
	var symbol = d3.svg.symbol();

	// Inspired by http://informationandvisualization.de/blog/box-plot
	plotbox = function (theYScale, thePlotboxWidth, thePlotboxHeight, theOutlierPoints, theColorScale, 
			theElementHistogramData, theHistCount)
	{

		var showLabels = false;

		function box(theG)
		{
			if (null!==theOutlierPoints)
			{
				//console.log("draw the detailed boxplot");
				drawbox_high(d3.select(theG[0][0]).data()[0], theG, thePlotboxWidth, thePlotboxHeight, theYScale, 
							theOutlierPoints, theColorScale, theElementHistogramData, theHistCount);
			}
			else
			{
				//console.log("theG drawbox");
				theG.each(function (mydata)
				{
					var gVar = d3.select(this);
					drawbox(mydata, theYScale, thePlotboxWidth, showLabels, gVar, theColorScale);
				});
			}
		} //end of box()

		//define a resizeWidth function
		box.resizeWidth = function (newWidth)
		{
			thePlotboxWidth = newWidth;
		};
		//define a resizeShowLable function
		box.showLabels = function (show)
		{
			showLabels = show;
		};

		// initialize random jitter
		for (var ix = 0, end = jitter.length; ix < end; ix++)
		{
			jitter[ix] = Math.random();
		}

		return box;
	};

	/**
	 * draw plotbox
	 *
	 * @param {Object} theData for each box;
	 * @param {Object} theYScale scale of y coordinate;
	 * @param {interger} theWidth width of box;
	 * @param {Boolean} showLabels want to show box quartile and whisker data
	 * @param {Object} g DOM element
	 * @param {Object} theColorScale
	 */
	function drawbox(theData, theYScale, theWidth, showLabels, g, theColorScale)
	{
		//console.log("box::drawbox width=" + theWidth + " and showLabels=" + showLabels);
		// data has .name, .index, .data(), .namedData(),
		// (note--lower and upper notch not represented)
		// .breaks 0=lower whisker, 1=lower hinge, 2=median, 3=upper hinge, 4=upper whisker
		// .outlierBands 0=LowerOutMax, 1=LowerOutMin, 2=UpperOutMin, 3=UpperOutMax
		// TODO: ten is a "magic number". Alternative? -TDC
		if (theWidth >= 10)
		{
			drawbox_med(theData, theYScale, theWidth, showLabels, g, theColorScale);
		}
		else
		{
			drawbox_low(theData, theYScale, theWidth, showLabels, g, theColorScale);
		}
	} //end of drawbox()

	function addHighlighting(theClassname)
	{
		//console.log("inner addHighlighting started for " + theClassname);
		d3.selectAll(("."+theClassname)).classed("SelectedBatch", true);
	}

	function removeHighlighting(theClassname)
	{
		//console.log("inner removeHighlighting started for " + theClassname);
		d3.selectAll(("."+theClassname)).classed("SelectedBatch", false);
	}

	function addLegendClass(theElement, theColor, theLogData, theKeepSameColorFlag)
	{
		var classname = theColor.replace("#", "legend-");
		if (false===theKeepSameColorFlag)
		{
			theElement.classed(classname, true);
		}
		theElement
				//.attr("pointer-events", "all")
				//  MOUSE EVENTS
				.on("mouseover", function(theData, theIndex)
				{
					//console.log("inner addLegendClass over");
					// This uses D3 transitions to delay the mouseover action
					// If the mouseout happens before the delay in the mouseover
					// transition, the mouseout transition on "this" DOM element
					// will cause the mouseover transition to be canceled.
					// New versions of D3 support d3.select(this).interrupt(); instead
					d3.select(this).transition()
							.delay(250)
							.each("start", function ()
							{
								addHighlighting(classname);
							});
				})
				.on("mouseout", function (d)
				{
					//console.log("inner addLegendClass out");
					removeHighlighting(classname);
					// This uses D3 transitions to delay the mouseover action
					// If the mouseout happens before the delay in the mouseover
					// transition, the mouseout transition on "this" DOM element
					// will cause the mouseover transition to be canceled.
					// New versions of D3 support d3.select(this).interrupt(); instead
					d3.select(this).transition().duration(0);
				});
	}

	function drawbox_high(theData, theG, thePlotboxWidth, thePlotboxHeight, theYScale, 
							theOutlierPoints, theColor, theElementHistogramData, theHistCount)
	{

		//console.log("drawbox_high - theData = " + theData);
		//console.log("drawbox_high - theG = " + theG);
		//console.log("drawbox_high - thePlotboxWidth = " + thePlotboxWidth);
		//console.log("drawbox_high - thePlotboxHeight = " + thePlotboxHeight);
		//console.log("drawbox_high - theYScale = " + theYScale);
		//console.log("drawbox_high - theYScale.domain() = " + theYScale.domain());
		
		//console.log("drawbox_high - theOutlierPoints = " + theOutlierPoints);
		//console.log("drawbox_high - theColor = " + theColor);
		////console.log("box::drawbox_med theWidth=" + theWidth);
		var breaks = theData.breaks;
		//console.log("drawbox_high - breaks = " + breaks);
		// .outlierBands 0=LowerOutMax, 1=LowerOutMin, 2=UpperOutMin, 3=UpperOutMax
		var outlierBands = theData.outlierBands;

		// Update the vertical line for UpperOut outliers
		if ((false===isNaN(outlierBands[2]))&&(false===isNaN(outlierBands[3])))
		{
			// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
			var upperOutLine = theG.selectAll("line.upperOutLine").data([1]);
			// this adds the element if it does not exist
			upperOutLine.enter().append("line");
			// this sets/updates the attributes for the elements in the select or appended
			upperOutLine.attr("class", "upperOutLine")
					.attr("x1", thePlotboxWidth / 2)
					.attr("y1", function (d)
					{
						return theYScale(outlierBands[2]);		// 'UpperOutMin'
					})
					.attr("x2", thePlotboxWidth / 2)
					.attr("y2", function (d)
					{
						return theYScale(outlierBands[3]);		// 'UpperOutMax'
					});
		}

		///////////////////////////////////////////////////////////////////////
		// Update the vertical line for LowerOut outliers
		if ((false===isNaN(outlierBands[1]))&&(false===isNaN(outlierBands[0])))
		{
			// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
			var lowerOutLine = theG.selectAll("line.lowerOutLine").data([1]);
			// this adds the element if it does not exist
			lowerOutLine.enter().append("line");
			// this sets/updates the attributes for the elements in the select or appended
			lowerOutLine.attr("class", "lowerOutLine")
					.attr("x1", thePlotboxWidth / 2)
					.attr("y1", function (d)
					{
						return theYScale(outlierBands[1]);		// 'LowerOutMin'
					})
					.attr("x2", thePlotboxWidth / 2)
					.attr("y2", function (d)
					{
						return theYScale(outlierBands[0]);		// 'LowerOutMax'
					});
		}

		///////////////////////////////////////////////////////////////////////
		// Update the vertical line spanning the whiskers.
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var whiskers = theG.selectAll("line.whiskerLine").data([1]);
		// this adds the element if it does not exist
		whiskers.enter().append("line");
		// this sets/updates the attributes for the elements in the select or appended
		whiskers.attr("class", "whiskerLine")
				.attr("x1", thePlotboxWidth / 2)
				.attr("y1", function (d)
				{
					return theYScale(breaks[0]);		// 'LowerWhisker'
				})
				.attr("x2", thePlotboxWidth / 2)
				.attr("y2", function (d)
				{
					return theYScale(breaks[4]);		// 'UpperWhisker'
				});

		///////////////////////////////////////////////////////////////////////
		// Update the lower horizontal line at each end of whiskers at medium resolution
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var lowerHorizontalWhiskerLine = theG.selectAll("line.lowerHorizontalWhiskerLine").data([1]);
		// this adds the element if it does not exist
		lowerHorizontalWhiskerLine.enter().append("line");
		// this sets/updates the attributes for the elements in the select or appended
		lowerHorizontalWhiskerLine.attr("class", "lowerHorizontalWhiskerLine")
				.attr("x1", thePlotboxWidth / 4)
				.attr("x2", thePlotboxWidth * 3 / 4)
				.attr("y1", function (d)
				{
					return theYScale(breaks[0]);		// 'LowerWhisker'
				})
				.attr("y2", function (d)
				{
					return theYScale(breaks[0]);		// 'LowerWhisker'
				});

		///////////////////////////////////////////////////////////////////////
		// Update the upper horizontal line at each end of whiskers at medium resolution
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var upperHorizontalWhiskerLine = theG.selectAll("line.upperHorizontalWhiskerLine").data([1]);
		// this adds the element if it does not exist
		upperHorizontalWhiskerLine.enter().append("line");
		// this sets/updates the attributes for the elements in the select or appended
		upperHorizontalWhiskerLine.attr("class", "upperHorizontalWhiskerLine")
				.attr("x1", thePlotboxWidth / 4)
				.attr("x2", thePlotboxWidth * 3 / 4)
				.attr("y1", function (d)
				{
					return theYScale(breaks[4]);		// 'UpperWhisker'
				})
				.attr("y2", function (d)
				{
					return theYScale(breaks[4]);		// 'UpperWhisker'
				});

		///////////////////////////////////////////////////////////////////////
		// Update the box which is the box
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var boxBox = theG.selectAll("rect.boxBox").data([1]);
		// this adds the element if it does not exist
		boxBox.enter().append("rect");
		// this sets/updates the attributes for the elements in the select or appended
		boxBox.attr("class", "boxBox")
				.style("fill", theColor)
				.attr("y", function (d)
				{
					return theYScale(breaks[3]);			// 'UpperHinge'
				})
				.attr("x", (thePlotboxWidth / 4))
				.attr("width", (thePlotboxWidth / 2))
				.attr("height", function (d)
				{
					return theYScale(breaks[1]) - theYScale(breaks[3]);		// height from 'LowerHinge' to 'UpperHinge'
				});

		///////////////////////////////////////////////////////////////////////
		// Update the line which shows median for med resolution
		// remove the median lines so they appear after the rect boxes
		theG.selectAll("line.medianLine").data([1]).remove();
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var medianLine = theG.selectAll("line.medianLine").data([1]);
		// this adds the element if it does not exist
		medianLine.enter().append("line");
		// this sets/updates the attributes for the elements in the select or appended
		medianLine.attr("class", "medianLine")
				.attr("x2", thePlotboxWidth)
				.attr("y1", theYScale(breaks[2]))
				.attr("y2", theYScale(breaks[2]));

		if (theOutlierPoints.length>0)
		{
			// theOutlierPoints - array of objects with id (label) and value (y axis)
			// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
			var mycircles = theG.selectAll("circle").data(theOutlierPoints);
			// this adds the element if it does not exist
			mycircles.enter().append("circle");
			// this sets/updates the attributes for the elements in the select or appended
			mycircles.attr("class", "OutlierDot")
					.attr("cx", function (theOutlierObj, theIndex)
					{
						var value = (thePlotboxWidth / 4) + (jitter[theIndex % jitter.length] * (thePlotboxWidth / 2));
						return (value);
					})
					.attr("cy", function (theOutlierObj)
					{
						return theYScale(Number(theOutlierObj.value));
					})
					.attr("r", 3)
					.append("svg:title")
					.text(function (theOutlierObj)
					{
						return theOutlierObj.name;
					});
			// in case this is reused and the number of circles changes, remove the unused circles
			mycircles.exit().remove();
		}

		// draw violins, if available
		if(null!==theElementHistogramData)
		{
			var minY = 0;
			var maxY = 0;
			for(var i=0;i<theHistCount;i++)
			{
				var myY = theElementHistogramData["y" + i];
				if (myY>maxY)
				{
					maxY =myY;
				}
				if (myY<minY)
				{
					minY =myY;
				}
			}
			var maxX = 0;
			for(var i=0;i<theHistCount;i++)
			{
				var myX = theElementHistogramData["x" + i];
				if (myX>maxX)
				{
					maxX =myX;
				}
			}
			var histogramScaleLeftX = d3.scale.linear()
				.domain([0, maxX])
				.range([(thePlotboxWidth/2.0), 0]);
			var histogramScaleRightX = d3.scale.linear()
				.domain([0, maxX])
				.range([(thePlotboxWidth/2.0), thePlotboxWidth]);
			////var histogramScaleY = d3.scale.linear()
			////	.domain([minY, maxY])
			////	.range([0, thePlotboxHeight]);
			var histogramScaleY = theYScale;
			//console.log("thePlotboxHeight=" + thePlotboxHeight);
			//console.log("thePlotboxWidth=" + thePlotboxWidth);
			//console.log("histogramScaleLeftX.domain()=" + histogramScaleLeftX.domain());
			//console.log("histogramScaleLeftX.range()=" + histogramScaleLeftX.range());
			//console.log("histogramScaleRightX.domain()=" + histogramScaleRightX.domain());
			//console.log("histogramScaleRightX.range()=" + histogramScaleRightX.range());
			//console.log("histogramScaleY.domain()=" + histogramScaleY.domain());
			//console.log("histogramScaleY.range()=" + histogramScaleY.range());
			//
			//console.log("theYScale.domain()=" + theYScale.domain());
			//console.log("theYScale.range()=" + theYScale.range());
			//console.log("histogramScaleLeftX.domain()=" + histogramScaleLeftX.domain());
			//console.log("histogramScaleLeftX.range()=" + histogramScaleLeftX.range());
			//console.log("histogramScaleY.domain()=" + histogramScaleY.domain());
			//console.log("histogramScaleY.range()=" + histogramScaleY.range());
			// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
			var leftLine = theG.selectAll("path.leftLine").data([1]);
			var rightLine = theG.selectAll("path.rightLine").data([1]);
			// this adds the element if it does not exist
			leftLine.enter().append("path");
			rightLine.enter().append("path");
			// this sets/updates the attributes for the elements in the select or appended
			var leftLineData = [];
			var rightLineData = [];
			// add min value point
			leftLineData.push(
				{
						"x": histogramScaleLeftX.range()[0], 
						"y": histogramScaleY.range()[0]
				});
			leftLineData.push(
				{ 
					"x": histogramScaleLeftX.range()[0],  
					"y": histogramScaleY(theElementHistogramData["y" + 0])
				});
			rightLineData.push(
				{
						"x": histogramScaleLeftX.range()[0], 
						"y": histogramScaleY.range()[0]
				});
			rightLineData.push(
				{ 
					"x": histogramScaleLeftX.range()[0],  
					"y": histogramScaleY(theElementHistogramData["y" + 0])
				});
			//console.log("theHistCount=" + theHistCount);
			for(var i=0;i<theHistCount;i++)
			{
				//console.log("i=" + i);
				//console.log("theElementHistogramData[yi]=" + theElementHistogramData["y" + i]);
				//console.log("theElementHistogramData[xi]=" + theElementHistogramData["x" + i]);
				//console.log("histogramScaleLeftX(theElementHistogramData[yi])=" + histogramScaleLeftX(theElementHistogramData["y" + i]));
				//console.log("histogramScaleY(theElementHistogramData[xi])=" + histogramScaleY(theElementHistogramData["x" + i]));
				// NOTE: non-intuitive data design - x and y in the histogram data are reversed from the plot data
				var pointObjLeft = 
					{ 
						"x": histogramScaleLeftX(theElementHistogramData["x" + i]) , 
						"y": histogramScaleY(theElementHistogramData["y" + i])
					};
				leftLineData.push(pointObjLeft);
				var pointObjRight = 
					{ 
						"x": histogramScaleRightX(theElementHistogramData["x" + i]) , 
						"y": histogramScaleY(theElementHistogramData["y" + i])
					};
				rightLineData.push(pointObjRight);
			}
			// add max value point
			leftLineData.push(
				{ 
					"x": histogramScaleLeftX.range()[0], 
					"y": histogramScaleY(theElementHistogramData["y" + (theHistCount-1)])
				});
			leftLineData.push(
				{
						"x": histogramScaleLeftX.range()[0], 
						"y": histogramScaleY.range()[1]
				});
			rightLineData.push(
				{ 
					"x": histogramScaleRightX.range()[0], 
					"y": histogramScaleY(theElementHistogramData["y" + (theHistCount-1)])
				});
			rightLineData.push(
				{
						"x": histogramScaleRightX.range()[0], 
						"y": histogramScaleY.range()[1]
				});
			// make the line
			var lineFunction = d3.svg.line()
					.x(function(theD) { return theD.x; })
					.y(function(theD) { return theD.y; })
					.interpolate("basis");
			leftLine.attr("class", "leftLine")
					.attr("d", lineFunction(leftLineData));
			rightLine.attr("class", "rightLine")
					.attr("d", lineFunction(rightLineData));
			// in case this is reused and the number of circles changes, remove the unused circles
			leftLine.exit().remove();
			rightLine.exit().remove();

//			if (leftLineData.length>0)
//			{
//				// theOutlierPoints - array of objects with id (label) and value (y axis)
//				// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
//				var mycircles = theG.selectAll("circle").data(leftLineData);
//				// this adds the element if it does not exist
//				mycircles.enter().append("circle");
//				// this sets/updates the attributes for the elements in the select or appended
//				mycircles.attr("class", "OutlierDot")
//						.attr("cx", function (theOutlierObj, theIndex)
//						{
//							return theOutlierObj.x;
//						})
//						.attr("cy", function (theOutlierObj)
//						{
//							return theOutlierObj.y;
//						})
//						.attr("r", 3);
//				// in case this is reused and the number of circles changes, remove the unused circles
//				mycircles.exit().remove();
//			}
		
		}
		else
		{
			theG.selectAll("path.leftLine").data([1]).remove();
			theG.selectAll("path.rightLine").data([1]).remove();
		}

	
	} // end of drawbox_high

	function drawbox_low(theData, theYScale, theWidth, showLabels, g, theColorScale)
	{
		//console.log("box::drawbox_low width=" + theWidth);
		var breaks = theData.breaks;
		//console.log("box::drawbox_low breaks1=" + breaks);
		///////////////////////////////////////////////////////////////////////
		// Update the vertical line for UpperOut outliers
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		g.selectAll("line.upperOutLine").data([1]).remove();

		///////////////////////////////////////////////////////////////////////
		// Update the vertical line for LowerOut outliers
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		g.selectAll("line.lowerOutLine").data([1]).remove();

		///////////////////////////////////////////////////////////////////////
		// Update the vertical line spanning the whiskers.
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var whiskers = g.selectAll("line.whiskerLine").data([1]);
		// this adds the element if it does not exist
		whiskers.enter().append("line").attr("class", "whiskerLine");
		// this sets/updates the attributes for the elements in the select or appended
		whiskers.attr("x1", theWidth / 2)
				.attr("y1", function (d)
				{
					//console.log("box::drawbox_low breaks2=" + breaks);
					//console.log("box::drawbox_low breaks2 breaks[0]=" + breaks[0]);
					//console.log("box::drawbox_low breaks2 theYScale(breaks[0])=" + theYScale(breaks[0]));
					return theYScale(breaks[0]);		// 'LowerWhisker'
				})
				.attr("x2", theWidth / 2)
				.attr("y2", function (d)
				{
					//console.log("box::drawbox_low breaks3=" + breaks);
					//console.log("box::drawbox_low breaks3 breaks[4]=" + breaks[4]);
					return theYScale(breaks[4]);		// 'UpperWhisker'
				});
		addLegendClass(whiskers, theColorScale(theData.batchValue), theData, false);
		
		//console.log("box::drawbox_low breaks4=" + breaks);

		///////////////////////////////////////////////////////////////////////
		// Update the lower horizontal line at each end of whiskers at medium resolution
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		g.selectAll("line.lowerHorizontalWhiskerLine").data([1]).remove();

		///////////////////////////////////////////////////////////////////////
		// Update the upper horizontal line at each end of whiskers at medium resolution
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		g.selectAll("line.upperHorizontalWhiskerLine").data([1]).remove();

		//console.log("box::drawbox_low breaks5=" + breaks);
		///////////////////////////////////////////////////////////////////////
		// Update the vertical line which is the box for low resolution
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var boxLine = g.selectAll("line.boxLine").data([1]);
		// this adds the element if it does not exist
		boxLine.enter().append("line");
		// this sets/updates the attributes for the elements in the select or appended
		boxLine.attr("class", "boxLine")
				.style("stroke", theColorScale(theData.batchValue))
				.attr("x1", theWidth / 2)
				.attr("y1", function (d)
				{
					//console.log("box::drawbox_low breaks6=" + breaks);
					//console.log("box::drawbox_low breaks6 breaks[1]=" + breaks[1]);
					//console.log("box::drawbox_low breaks6 theYScale(breaks[1])=" + theYScale(breaks[1]));
					return theYScale(breaks[1]);		// 'LowerHinge'
				})
				.attr("x2", theWidth / 2)
				.attr("y2", function (d)
				{
					//console.log("box::drawbox_low breaks7=" + breaks);
					//console.log("box::drawbox_low breaks7 breaks[3]=" + breaks[3]);
					return theYScale(breaks[3]);		// 'UpperHinge'
				});
		addLegendClass(boxLine, theColorScale(theData.batchValue), theData, false);

		//console.log("box::drawbox_low breaks8=" + breaks);
		///////////////////////////////////////////////////////////////////////
		// Update the box which is the box for med resolution
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		g.selectAll("rect.boxBox").data([1]).remove();


		///////////////////////////////////////////////////////////////////////
		// Update the line which shows median for med resolution
		// remove the median lines so they appear after the rect boxes
		g.selectAll("line.medianLine").data([1]).remove();
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var medianLine = g.selectAll("line.medianLine").data([1]);
		// this adds the element if it does not exist
		medianLine.enter().append("line");
		// this sets/updates the attributes for the elements in the select or appended
		medianLine.attr("class", "medianLine")
				.attr("x1", (theWidth*0.45))
				.attr("x2", (theWidth*0.55))
				.attr("y1", theYScale(breaks[2]))
				.attr("y2", theYScale(breaks[2]));
		addLegendClass(medianLine, theColorScale(theData.batchValue), theData, true);

	}	//end of drawbox_low()

	function drawbox_med(theData, theYScale, theWidth, showLabels, g, theColorScale)
	{
		//console.log("drawbox_med for " + theData.name);
		//console.log("box::drawbox_med theWidth=" + theWidth);
		var breaks = theData.breaks;
		// .outlierBands 0=LowerOutMax, 1=LowerOutMin, 2=UpperOutMin, 3=UpperOutMax
		var outlierBands = theData.outlierBands;

		// Update the vertical line for UpperOut outliers
		if ((false===isNaN(outlierBands[2]))&&(false===isNaN(outlierBands[3])))
		{
			//console.log("box::drawbox_med upper outliers");
			// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
			var upperOutLine = g.selectAll("line.upperOutLine").data([1]);
			// this adds the element if it does not exist
			upperOutLine.enter().append("line");
			// this sets/updates the attributes for the elements in the select or appended
			upperOutLine.attr("class", "upperOutLine")
					.attr("x1", theWidth / 2)
					.attr("y1", function (d)
					{
						return theYScale(outlierBands[2]);		// 'UpperOutMin'
					})
					.attr("x2", theWidth / 2)
					.attr("y2", function (d)
					{
						return theYScale(outlierBands[3]);		// 'UpperOutMax'
					});
			addLegendClass(upperOutLine, theColorScale(theData.batchValue), theData, false);
		}

		///////////////////////////////////////////////////////////////////////
		// Update the vertical line for LowerOut outliers
		if ((false===isNaN(outlierBands[1]))&&(false===isNaN(outlierBands[0])))
		{
			//console.log("box::drawbox_med lower outliers");
			// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
			var lowerOutLine = g.selectAll("line.lowerOutLine").data([1]);
			// this adds the element if it does not exist
			lowerOutLine.enter().append("line");
			// this sets/updates the attributes for the elements in the select or appended
			lowerOutLine.attr("class", "lowerOutLine")
					.attr("x1", theWidth / 2)
					.attr("y1", function (d)
					{
						return theYScale(outlierBands[1]);		// 'LowerOutMin'
					})
					.attr("x2", theWidth / 2)
					.attr("y2", function (d)
					{
						return theYScale(outlierBands[0]);		// 'LowerOutMax'
					});
			addLegendClass(lowerOutLine, theColorScale(theData.batchValue), theData, false);
		}

		///////////////////////////////////////////////////////////////////////
		// Update the vertical line spanning the whiskers.
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		//console.log("whiskerLine breaks[0] =" + breaks[0]);
		//console.log("whiskerLine breaks[4] =" + breaks[4]);
		//console.log("whiskerLine theYScale(breaks[0]) =" + theYScale(breaks[0]));
		//console.log("whiskerLine theYScale(breaks[4]) =" + theYScale(breaks[4]));
		var whiskers = g.selectAll("line.whiskerLine").data([1]);
		// this adds the element if it does not exist
		whiskers.enter().append("line");
		// this sets/updates the attributes for the elements in the select or appended
		whiskers.attr("class", "whiskerLine")
				.attr("x1", theWidth / 2)
				.attr("y1", function (d)
				{
					return theYScale(breaks[0]);		// 'LowerWhisker'
				})
				.attr("x2", theWidth / 2)
				.attr("y2", function (d)
				{
					return theYScale(breaks[4]);		// 'UpperWhisker'
				});
		addLegendClass(whiskers, theColorScale(theData.batchValue), theData, false);

		///////////////////////////////////////////////////////////////////////
		// Update the lower horizontal line at each end of whiskers at medium resolution
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		//console.log("lowerHorizontalWhiskerLine breaks[0] =" + breaks[0]);
		//console.log("lowerHorizontalWhiskerLine breaks[0] =" + breaks[0]);
		//console.log("lowerHorizontalWhiskerLine theYScale(breaks[0]) =" + theYScale(breaks[0]));
		//console.log("lowerHorizontalWhiskerLine theWidth =" + theWidth);
		var lowerHorizontalWhiskerLine = g.selectAll("line.lowerHorizontalWhiskerLine").data([1]);
		// this adds the element if it does not exist
		lowerHorizontalWhiskerLine.enter().append("line");
		// this sets/updates the attributes for the elements in the select or appended
		lowerHorizontalWhiskerLine.attr("class", "lowerHorizontalWhiskerLine")
				.attr("x1", theWidth / 4)
				.attr("x2", theWidth * 3 / 4)
				.attr("y1", function (d)
				{
					return theYScale(breaks[0]);		// 'LowerWhisker'
				})
				.attr("y2", function (d)
				{
					return theYScale(breaks[0]);		// 'LowerWhisker'
				});
		addLegendClass(lowerHorizontalWhiskerLine, theColorScale(theData.batchValue), theData, false);

		///////////////////////////////////////////////////////////////////////
		// Update the upper horizontal line at each end of whiskers at medium resolution
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		//console.log("upperHorizontalWhiskerLine breaks[0] =" + breaks[0]);
		//console.log("upperHorizontalWhiskerLine breaks[4] =" + breaks[4]);
		//console.log("upperHorizontalWhiskerLine theYScale(breaks[4]) =" + theYScale(breaks[4]));
		//console.log("upperHorizontalWhiskerLine theWidth =" + theWidth);
		var upperHorizontalWhiskerLine = g.selectAll("line.upperHorizontalWhiskerLine").data([1]);
		// this adds the element if it does not exist
		upperHorizontalWhiskerLine.enter().append("line");
		// this sets/updates the attributes for the elements in the select or appended
		upperHorizontalWhiskerLine.attr("class", "upperHorizontalWhiskerLine")
				.attr("x1", theWidth / 4)
				.attr("x2", theWidth * 3 / 4)
				.attr("y1", function (d)
				{
					return theYScale(breaks[4]);		// 'UpperWhisker'
				})
				.attr("y2", function (d)
				{
					return theYScale(breaks[4]);		// 'UpperWhisker'
				});
		addLegendClass(upperHorizontalWhiskerLine, theColorScale(theData.batchValue), theData, false);

		///////////////////////////////////////////////////////////////////////
		// Update the vertical line which is the box for low resolution
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		g.selectAll("line.boxLine").data([1]).remove();

		///////////////////////////////////////////////////////////////////////
		// Update the box which is the box for med resolution
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var boxBox = g.selectAll("rect.boxBox").data([1]);
		// this adds the element if it does not exist
		boxBox.enter().append("rect");
		// this sets/updates the attributes for the elements in the select or appended
		boxBox.attr("class", "boxBox")
				.style("fill", theColorScale(theData.batchValue))
				.attr("x", (theWidth*0.05))
				.attr("y", function (d)
				{
					return theYScale(breaks[3]);			// 'UpperHinge'
				})
				.attr("width", (theWidth*0.90))
				.attr("height", function (d)
				{
					return theYScale(breaks[1]) - theYScale(breaks[3]);		// height from 'LowerHinge' to 'UpperHinge'
				});
		addLegendClass(boxBox, theColorScale(theData.batchValue), theData, false);

		///////////////////////////////////////////////////////////////////////
		// Update the line which shows median for med resolution
		// remove the median lines so they appear after the rect boxes
		g.selectAll("line.medianLine").data([1]).remove();
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var medianLine = g.selectAll("line.medianLine").data([1]);
		// this adds the element if it does not exist
		medianLine.enter().append("line");
		// this sets/updates the attributes for the elements in the select or appended
		medianLine.attr("class", "medianLine")
				.attr("x1", (theWidth*0.05))
				.attr("x2", (theWidth*0.95))
				.attr("y1", theYScale(breaks[2]))
				.attr("y2", theYScale(breaks[2]));
		addLegendClass(medianLine, theColorScale(theData.batchValue), theData, true);

	} //end of drawbox()
})();
