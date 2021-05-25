/*  global d3 */

function BoxPlotDetailed(theDetailedDiv)
{
	var mThis = this;
	var mTarget = theDetailedDiv;
	//console.log("BoxPlotDetailed - theDetailedDiv = " + theDetailedDiv);
	var mTitleA = "";
	var mTitleB = "";
	var mBoxData = null;
	var mOutlierData = null;
	var mColor= null;
	var mDataYScaleMax = 0;
	var mDataYScaleMin = 0;
	// histogram data and objects
	var mElementHistogramData = null;
	var mHistCount = null;
	// size of display window
	var mSvgWidth = 0;
	var mSvgHeight = 0;
	// width of area for scale on left side
	var mYScaleWidth = 50;
	var mYScaleHeight = 0;
	// size of diagram plotting area
	var mDiagramWidth = 0;
	var mDiagramHeight = 0;
	// size of title area
	var mTitleHeight = 30;
	var mTitleWidth = 0;
	//
	var mGlobalCss = " !--REPLACE-ME-- ";
	// SVG object and G in which to draw
	var mBoxplotTop = null;
	var mBoxplotTopBorder = null;
	// objects for title
	var mGTitleArea = null;
	var mTitleAreaBorder = null;
	var mTitleViewBox = null;
	var mTitleViewBoxRect = null;
	var mBoxplotTopTitleA = null;
	var mBoxplotTopTitleB = null;
	var mBoxplotTopTitleAG = null;
	var mBoxplotTopTitleBG = null;
	// objects for y scale
	var mYScale = null;
	var mYAxis = null;
	// objects for y scale area on left
	var mGYScaleArea = null;
	var mYScaleItself = null;
	var mYScaleAreaBorder = null;
	// objects for diagram plotting area
	var mGView = null;
	var mViewBorder = null;
	var mViewSVG = null;
	// no pan or zoom here, but used for drawing
	var mGViewPanAndZoom = null;
	// box for detailed boxplot
	var mBoxplotBox = null;

	this.getSvg = function()
	{
		return mBoxplotTop;
	};
	
	this.render = function (theOutlierData, theDetailId, theBaseData, theColor, 
							theSvgWidth, theSvgHeight, theMinValue, theMaxValue,
							theNValue, theElementHistogramData)
	{
		//console.log("BoxPlotDetailed - render started");
		//console.log("BoxPlotDetailed - render mTarget = " + mTarget);
		//console.log("BoxPlotDetailed - render theDetailId = " + theDetailId);
		//console.log("BoxPlotDetailed - render theColor = " + theColor);
		//console.log("BoxPlotDetailed - render theSvgWidth = " + theSvgWidth);
		//console.log("BoxPlotDetailed - render theSvgHeight = " + theSvgHeight);
		//console.log("BoxPlotDetailed - render theMinValue = " + theMinValue);
		//console.log("BoxPlotDetailed - render theMaxValue = " + theMaxValue);
//		try
//		{
		if (!theOutlierData)
		{
			throw new Error("'theOutlierData' argument missing");
		}
		if (!theDetailId)
		{
			throw new Error("'theDetailId' argument missing");
		}
		if (!theBaseData)
		{
			throw new Error("'theBaseData' argument missing");
		}
		if (null===theElementHistogramData)
		{
			//console.log("'theElementHistogramData' argument is null (not a problem)");
		}
		if (undefined===theElementHistogramData)
		{
			//console.log("'theElementHistogramData' argument is undefined (not a problem)");
			theElementHistogramData = null;
		}
		if (null!==theElementHistogramData)
		{
			//console.log("'theElementHistogramData[1]' is " + theElementHistogramData["1"]);
		}
		
		renderFromBreaks(mTarget, theOutlierData, theDetailId, theBaseData, theColor, 
						theSvgWidth, theSvgHeight, theMinValue, theMaxValue, theNValue,
						theElementHistogramData);
//		}
//		catch (e)
//		{
//			alert(e);
//		}
		//console.log("BoxPlotDetailed - render finished");
	};

	this.resize = function(theNewWidth, theNewHeight)
	{
		//console.log("BoxPlotDetailed - resize started");
		//console.log(theNewWidth);
		//console.log(theNewHeight);
// comment out to debug
//		try
//		{
		mSvgWidth = theNewWidth;
		mSvgHeight = theNewHeight;
		updatePlotting();
//		}
//		catch (e)
//		{
//			alert(e);
//		}
		//console.log("BoxPlotDetailed - resize finished");
	};

	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function renderFromBreaks(theTarget, theOutlierData, theDetailId, theBaseData, theColor, 
								theSvgWidth, theSvgHeight, theMinValue, theMaxValue, theNValue,
								theElementHistogramData)
	{
		//console.log("BoxPlotDetailed - renderFromBreaks started");
		buildData(theOutlierData, theDetailId, theBaseData, theColor, theMinValue, theMaxValue, theNValue, theElementHistogramData);
		makePlot(theTarget, theSvgWidth, theSvgHeight);
		//console.log("BoxPlotDetailed - renderFromBreaks finished");
	}
	
	function buildData(theOutlierData, theDetailId, theBaseData, theColor, theMinValue, theMaxValue, theNValue, theElementHistogramData)
	{
		//console.log("BoxPlotDetailed - buildData started");
		// use passed in values, to make sure everything is the same scale
		mDataYScaleMax = theMaxValue;
		mDataYScaleMin = theMinValue;
		//console.log("BoxPlotDetailed::buildData theMinValue = " + theMinValue);
		//console.log("BoxPlotDetailed::buildData theMaxValue = " + theMaxValue);
		//console.log("BoxPlotDetailed::buildData 1 mDataYScaleMin = " + mDataYScaleMin);
		//console.log("BoxPlotDetailed::buildData 1 mDataYScaleMax = " + mDataYScaleMax);
		// 1.1 to make scale slightly larger than numbers, to allow full point on screen
		mDataYScaleMax = mDataYScaleMax + Math.abs(mDataYScaleMax*0.001);
		mDataYScaleMin = mDataYScaleMin - Math.abs(mDataYScaleMin*0.001);
		//console.log("BoxPlotDetailed::buildData 2 mDataYScaleMin = " + mDataYScaleMin);
		//console.log("BoxPlotDetailed::buildData 2 mDataYScaleMax = " + mDataYScaleMax);
		mTitleA = theDetailId;
		mTitleB = " n=" + theNValue;
		mBoxData = theBaseData;
		mOutlierData = theOutlierData;
		mColor = theColor;
		mElementHistogramData = theElementHistogramData;
		if (null!==mElementHistogramData)
		{
			mHistCount = mElementHistogramData["size"];
			if (undefined===mHistCount)
			{
				mHistCount = (Object.keys(theElementHistogramData).length-1)/2;
			}
		}
		else
		{
			mHistCount = 0;
		}
		//console.log("BoxPlotDetailed - buildData finished");
	}

	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function d3AddUpdateId(theFromElement, theSelectId, theAppend)
	{
		//console.log("BoxPlotDetailed - d3AddUpdateId started");
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var myElement = theFromElement.selectAll("#" + theSelectId).data([1]);
		// this adds the element if it does not exist
		myElement.enter().append(theAppend);
		myElement.attr("id", theSelectId);
		//console.log("BoxPlotDetailed - d3AddUpdateId finished");
		return myElement;
	}

	function d3AddUpdateIdWithData(theFromElement, theSelectId, theAppend, theData)
	{
		//console.log("d3AddUpdateIdWithData - d3AddUpdateId started");
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var myElement = theFromElement.selectAll("#" + theSelectId).data([theData]);
		// this adds the element if it does not exist
		myElement.enter().append(theAppend);
		myElement.attr("id", theSelectId);
		myElement.exit().remove();
		//console.log("d3AddUpdateIdWithData - d3AddUpdateId finished");
		return myElement;
	}

	function makePlot(theTarget, theSvgWidth, theSvgHeight)
	{
		//console.log("BoxPlotDetailed - makePlot started");
		mTarget = theTarget;
		mSvgWidth = theSvgWidth;
		mSvgHeight = theSvgHeight;
		updatePlotting();
		//console.log("BoxPlotDetailed - makePlot finished");
	}

	function updatePlotting()
	{
		//var startTime = new Date().getTime();
		//console.log("BoxPlotDetailed - updatePlotting started");
		// call this first to get sizes
		calculateSizes();
		addTopLevel();
		addTitleArea();
		addYScaleArea();
		//console.log("BoxPlotDetailed - mBoxData = " + mBoxData);
		//console.log("BoxPlotDetailed - mOutlierData = " + mOutlierData);
		//console.log("BoxPlotDetailed - mColor = " + mColor);
		//console.log("BoxPlotDetailed - mDataYScaleMax = " + mDataYScaleMax);
		//console.log("BoxPlotDetailed - mDataYScaleMin = " + mDataYScaleMin);
		//console.log("BoxPlotDetailed - mSvgWidth = " + mSvgWidth);
		//console.log("BoxPlotDetailed - mSvgHeight = " + mSvgHeight);
		//console.log("BoxPlotDetailed - mYScaleWidth = " + mYScaleWidth);
		//console.log("BoxPlotDetailed - mYScaleHeight = " + mYScaleHeight);
		//console.log("BoxPlotDetailed - mDiagramWidth = " + mDiagramWidth);
		//console.log("BoxPlotDetailed - mDiagramHeight = " + mDiagramHeight);
		//console.log("BoxPlotDetailed - mTitleHeight = " + mTitleHeight);
		//console.log("BoxPlotDetailed - mTitleWidth = " + mTitleWidth);
		addView();
		//var finishTime = new Date().getTime();
		//console.log("BoxPlotDetailed - Render time" + ((finishTime - startTime) / 1000) + " sec");
		//console.log("BoxPlotDetailed - updatePlotting finished");
	}

	function calculateSizes()
	{
		//console.log("BoxPlotDetailed - calculateSizes started");
		//console.log("BoxPlotDetailed - calculateSizes pre mSvgWidth=" + mSvgWidth);
		//console.log("BoxPlotDetailed - calculateSizes pre mSvgHeight=" + mSvgHeight);
		//console.log("BoxPlotDetailed - calculateSizes pre mYScaleWidth=" + mYScaleWidth);
		//console.log("BoxPlotDetailed - calculateSizes pre mTitleHeight=" + mTitleHeight);
		// area where diagram is drawn
		mDiagramWidth = mSvgWidth - mYScaleWidth -1;
		mDiagramHeight = mSvgHeight - mTitleHeight -1;
		// height of y scale on left
		mYScaleHeight = mDiagramHeight -1;
		// title area
		mTitleWidth = mDiagramWidth -1;
		//console.log("BoxPlotDetailed - calculateSizes finished");
	}

	function addTopLevel()
	{
		//console.log("BoxPlotDetailed - addTopLevel started");
		// selects and/or creates element
		if (null === mBoxplotTop)
		{
			mBoxplotTop = d3AddUpdateId(d3.select(mTarget), "DetailBoxplotTop", "svg");
			mBoxplotTop.attr("xmlns","http://www.w3.org/2000/svg");
			// this is a hack, but it works
			mBoxplotTop.attr("xmlns:xlink", "http://www.w3.org/1999/xlink");
			mBoxplotTop.attr("version","1.1");
			var defs = d3AddUpdateId(mBoxplotTop, "Detailboxplot_defs", "defs");
			var style = d3AddUpdateId(mBoxplotTop, "Detailboxplot_styles", "style");
			style.attr("type", "text/css")
				.text(mGlobalCss);
		}
		mBoxplotTop.attr("class", "BoxplotTop")
				.attr("width", mSvgWidth)
				.attr("height", mSvgHeight);
		// we don't draw in the SVG (seems counterintutive)
		// instead we draw in a "g" element attached to the SVG
		// selects and/or creates element
		if (null === mBoxplotTopBorder)
		{
			mBoxplotTopBorder = d3AddUpdateId(mBoxplotTop, "DetailBoxplotTopBorder", "rect");
		}
		mBoxplotTopBorder.attr("class", "BoxplotTopBorder")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", mSvgWidth)
				.attr("height", mSvgHeight);
		//console.log("BoxPlotDetailed - addTopLevel finished");
	}

	function addTitleArea()
	{
		//console.log("BoxPlotDetailed - addTitleArea started");
		// selects and/or creates element
		if (null === mGTitleArea)
		{
			mGTitleArea = d3AddUpdateId(mBoxplotTop, "DetailGTitleArea", "g");
			// add border
			mTitleAreaBorder = d3AddUpdateId(mGTitleArea, "DetailTitleAreaBorder", "rect");
			// add theTitle text to area
			mTitleViewBox = d3AddUpdateId(mGTitleArea, "TitleViewBox", "svg");
			mTitleViewBox.attr("preserveAspectRatio", "xMidYMid");
			//.attr("preserveAspectRatio", "xMaxYMax");
			// add border
			mTitleViewBoxRect = d3AddUpdateId(mTitleViewBox, "TitleViewBoxRect", "rect");
			mTitleViewBoxRect.attr("class", "TitleViewBoxRect");
			mBoxplotTopTitleAG = d3AddUpdateId(mTitleViewBox, "DetailBoxplotTopTitleAG", "g");
			mBoxplotTopTitleBG = d3AddUpdateId(mTitleViewBox, "DetailBoxplotTopTitleBG", "g");
			mBoxplotTopTitleA = d3AddUpdateId(mBoxplotTopTitleAG, "DetailBoxplotTopTitleA", "text");
			mBoxplotTopTitleB = d3AddUpdateId(mBoxplotTopTitleBG, "DetailBoxplotTopTitleB", "text");
			mBoxplotTopTitleA.text(mTitleA);
			mBoxplotTopTitleB.text(mTitleB);
			mBoxplotTopTitleA.attr("class", "BoxplotDetailedTitle")
							.attr("text-anchor", "middle");
			mBoxplotTopTitleB.attr("class", "BoxplotDetailedTitle")
							.attr("text-anchor", "middle");
		}
		var largeWidth = mTitleWidth * 10;
		var largeHeight = mTitleHeight * 10;
		mTitleViewBox.attr("viewBox", "0 0 "+ largeWidth + " " + largeHeight);
		mTitleViewBoxRect.attr("width", largeWidth)
						.attr("height", largeHeight);
		mTitleViewBox.attr("width", mTitleWidth)
					.attr("height", mTitleHeight);
		mTitleAreaBorder.attr("class", "BoxplotTopBorder")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", mTitleWidth)
				.attr("height", mTitleHeight);
		var width=largeWidth*0.95; // magic number - font sizes and other information need to be coded into object
									// instead of in CSS for this to be really reliable.
		var height=(largeHeight/2)-2; // div 2 since height is for 2 rows of text... -2 to give padding between
		//var textNode = document.getElementById("DetailBoxplotTopTitleA");
		var textNode = mBoxplotTopTitleA.node();
		var bb = textNode.getBBox();
		var bbwidth=bb.width;
		var bbheight=bb.height;
		var widthTransform = width / bbwidth;
		var heightTransform = height / bbheight;
		var value = widthTransform < heightTransform ? widthTransform : heightTransform;
		//value = value * 0.95;
		//console.log("BoxPlotDetailed - addTitleArea width=" + width);
		//console.log("BoxPlotDetailed - addTitleArea height=" + height);
		//console.log("BoxPlotDetailed - addTitleArea bb.width=" + bbwidth);
		//console.log("BoxPlotDetailed - addTitleArea bb.height=" + bbheight);
		//console.log("BoxPlotDetailed - addTitleArea widthTransform=" + widthTransform);
		//console.log("BoxPlotDetailed - addTitleArea heightTransform=" + heightTransform);
		//console.log("BoxPlotDetailed - addTitleArea value=" + value);
		//console.log("BoxPlotDetailed - addTitleArea multi width=" + (bbwidth*value));
		mBoxplotTopTitleAG.attr("transform", "translate(" + (largeWidth/2) + ", " + (largeHeight/3) + ")");
		mBoxplotTopTitleBG.attr("transform", "translate(" + (largeWidth/2) + ", " + ((2*largeHeight/3)+10) + ")");
		mBoxplotTopTitleA.attr("transform", "matrix("+value+", 0, 0, "+value+", 0,0)");
		mBoxplotTopTitleB.attr("transform", "matrix("+value+", 0, 0, "+value+", 0,0)");
		mGTitleArea.attr("transform", "translate(" + mYScaleWidth + ")");
		//console.log("BoxPlotDetailed - addTitleArea finished");
	}

	function addYScaleArea()
	{
		//console.log("BoxPlotDetailed - addYScaleArea started");
		////////////////////
		//////////////////// scale and axis
		////////////////////
		// map Y as data and physical view
		if (null === mYScale)
		{
			mYScale = d3.scale.linear();
			mYAxis = d3.svg.axis();
		}
		//console.log("addYScaleArea - mDataYScaleMin = " + mDataYScaleMin);
		//console.log("addYScaleArea - mDataYScaleMax = " + mDataYScaleMax);
		mYScale.domain([mDataYScaleMin, mDataYScaleMax])
				.range([mYScaleHeight, 0]);
		mYAxis.scale(mYScale)
				.orient("left")
				.ticks(10);
		////////////////////
		//////////////////// display elements
		////////////////////
		var myNontransformedWidth = mYScaleWidth;
		var myNontransformedHeight = mYScaleHeight;
		if (null === mGYScaleArea)
		{
			// selects and/or creates element
			mGYScaleArea = d3AddUpdateId(mBoxplotTop, "DetailGYScaleArea", "g")
					.attr("class", "GYScaleArea");
			// not sure why the transform is required. Without it, the scale is too far left
			mYScaleItself = d3AddUpdateId(mGYScaleArea, "DetailYScaleItself", "g");
			// add border
			mYScaleAreaBorder = d3AddUpdateId(mGYScaleArea, "DetailYScaleAreaBorder", "rect");
		}
		// not sure why the transform is required. Without it, the scale is too far left
		mYScaleItself.attr("class", "YScaleItself")
				.call(mYAxis)
				.attr("transform", "translate(" + myNontransformedWidth + ")");
		mYScaleAreaBorder.attr("class", "BoxplotTopBorder")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", myNontransformedWidth)
				.attr("height", myNontransformedHeight);
		mGYScaleArea.attr("transform", "translate(" + 0 + ", " + (mTitleHeight) + ")");
		//console.log("BoxPlotDetailed - addYScaleArea finished");
	}

	function addView()
	{
		//console.log("BoxPlotDetailed - addView started");
		var myNontransformedWidth = mDiagramWidth;
		var myNontransformedHeight = mDiagramHeight;
		if (null === mGView)
		{
			// wrap this so it is only created the first time
			// selects and/or creates element
			mGView = d3AddUpdateId(mBoxplotTop, "DetailGView", "g");
			// add border
			mViewBorder = d3AddUpdateId(mGView, "DetailViewBorder", "rect");
			// add svg
			mViewSVG = d3AddUpdateId(mGView, "DetailViewSVG", "svg");
			mViewSVG.attr("xmlns","http://www.w3.org/2000/svg");
			// this is a hack, but it works
			mViewSVG.attr("xmlns:xlink", "http://www.w3.org/1999/xlink");
			mViewSVG.attr("version","1.1");
			// no pan or zoom here, but used for drawing
			mGViewPanAndZoom = d3AddUpdateId(mViewSVG, "DetailGViewPanAndZoom", "g");
		}
		mViewBorder.attr("class", "ViewBorder")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", myNontransformedWidth)
				.attr("height", myNontransformedHeight);
		mViewSVG.attr("top", 0)
				.attr("left", 0)
				.attr("width", myNontransformedWidth)
				.attr("height", myNontransformedHeight);
		//var location = -(mBoxplotPixels.mCanvasWidth-mBoxplotPixels.mViewWidth)*mBoxplotPixels.mScrollPercentage;
		mGViewPanAndZoom.attr("top", 0)
				.attr("left", 0)
				.attr("width", myNontransformedWidth)
				.attr("height", myNontransformedHeight);
		// add data panes to myG
		addDataPanes();
		// set transform on topG
		mGView.attr("transform", "translate(" + (mYScaleWidth) + ", " + (mTitleHeight) + ")");
		//console.log("BoxPlotDetailed - addView finished");
	}

	function addDataPanes()
	{
		//console.log("BoxPlotDetailed - addDataPanes started");
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		if (null === mBoxplotBox)
		{
			mBoxplotBox = d3AddUpdateIdWithData(mGViewPanAndZoom, "DetailedBoxplotBox", "g", mBoxData);
		}
		//var boxWidth = (mDiagramWidth*0.8);
		var boxWidth = mDiagramWidth;
		mBoxplotBox.style("fill", "white")
				.attr("class", "boxplotBox")
				//.attr("y", 0)
				// not used but set just FYI
				.attr("width", boxWidth)
				.attr("height", mDiagramHeight)
				//.attr("transform", "translate(" + (mDiagramWidth*0.2) + ", 0 )")
/*				.on("mouseenter", function(theData, theIndex)
				{
					//console.log("BoxPlotDetailed - addDataPanes boxplotBoxList mouse enter");
					// This uses D3 transitions to delay the mouseover action
					// If the mouseout happens before the delay in the mouseover
					// transition, the mouseout transition on "this" DOM element
					// will cause the mouseover transition to be canceled.
					// New versions of D3 support d3.select(this).interrupt(); instead
					d3.select(this).transition()
							.delay(250)
							.each("start", function ()
							{
								//console.log("BoxPlotDetailed - mouseenter boxplotBox " + theData.batchValue);
								addDplogData(theData);
							});
				})
				.on("mouseleave", function (d)
				{
					//console.log("BoxPlotDetailed - addDataPanes boxplotBoxList mouse leave");
					// This uses D3 transitions to delay the mouseover action
					// If the mouseout happens before the delay in the mouseover
					// transition, the mouseout transition on "this" DOM element
					// will cause the mouseover transition to be canceled.
					// New versions of D3 support d3.select(this).interrupt(); instead
					d3.select(this).transition().duration(0);
				})*/
				;
		//console.log("BoxPlotDetailed - addDataPanes plotbox");
		//console.log("BoxPlotDetailed - addDataPanes mHistCount=" + mHistCount);
		var myPlotbox = plotbox(mYScale, boxWidth, mDiagramHeight, mOutlierData, mColor, mElementHistogramData, mHistCount);
		mBoxplotBox.call(myPlotbox);
		//console.log("BoxPlotDetailed - addDataPanes finished");
	}

	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	return mThis;
}