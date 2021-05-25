/*  global d3, d3plus */
BoxPlotOuter.uniqueSuffix = 1;

function BoxPlotOuter(theDiv)
{
	var mThis = this;
	mThis.mTarget = theDiv;
	// set from data
	mThis.mDataSeries = null;
	var mDataYScaleMax = null;
	var mDataYScaleMin = null;
	// set by data
	var mTarget = null;
	var mPlotTitle1 = "";
	var mPlotTitle2 = "";
	var mXLabel = "";
	var mYLabel = "";
	// static values
	var mTitleHeight = 30;
	var mYLabelWidth = 20;
	var mYScaleWidth = 50;
	var mXScaleHeight = 170;
	var mScrollbarHeight = 15;
	var mXLabelHeight = 20;
	// set by data
	var mTitleWidth = 0;
	var mYLabelHeight = 0;
	var mYScaleHeight = 0;
	var mXLabelWidth = 0;
	var mXScaleWidth = 0;
	// set by data
	var mXScale = null;
	var mYScale = null;
	var mXAxis = null;
	var mYAxis = null;
	var mYDataStart = 0;
	var mYDataEnd = 0;
	var mDrag = null;
	// pan targets
	var mGViewPanAndZoom = null;
	var mGXScaleAreaPanAndZoom = null;
	// height/widgth of tick text for relocating after rotation
	var mTickSpace = 0;
	// place for render time
	var mTimerText = null;
	// "permament" html/dom objects
	var mBoxplotTop = null;
	var mBoxplotTopBorder = null;
	var mTimerTextG = null;
	var mGTitleArea = null;
        var mTitleTextBox = null;
	var mGYLabelArea = null;
	var mYLabelAreaBorder = null;
	var mBoxplotYLabel = null;
	var mGYScaleArea = null;
	var mYScaleItself = null;
	var mYScaleAreaBorder = null;
	var mGXScaleArea = null;
	var mGXScaleAreaSvg = null;
	var mSelectedTickText = null;
	var mGXLabelArea = null;
	var mXLabelAreaBorder = null;
	var mBoxplotXLabel = null;
	var mGView = null;
	var mViewBorder = null;
	var mViewSVG = null;
	var mGViewEventCatcherFront = null;
	var mGViewEventCatcherBack = null;
	var mGScrollbarArea = null;
	var mScrollbarObject = null;
	//var mScrollbarScale = null;
	// color mapping
	var mColorScale = null;
	// legend values
	var mLegendDiv = null;
	var mLegendNames = null;
	var mLegendColors = null;
	var mLegendTitle = null;
	var mColors = [
		"#00FF00", "#FF00FF", "#F0F8FF", "#000080", "#FF7F00", "#00B2EE", "#006400", "#C0FF3E", "#8B0000", "#8B668B",
		"#FF83FA", "#54FF9F", "#0000FF", "#00688B", "#CD1076", "#8B6508", "#912CEE", "#FF0000", "#87CEFA", "#D2B48C",
		"#00CD66", "#66CD00", "#4169E1", "#424242", "#FFD700", "#00FFFF", "#FF6A6A", "#FFF68F", "#9F79EE", "#68228B",
		"#548B54", "#FF34B3", "#CD3700", "#B4EEB4", "#7CCD7C", "#458B00", "#008B45", "#20B2AA", "#00FA9A", "#FFA54F",
		"#CDAD00", "#8B0A50", "#6CA6CD", "#D8BFD8", "#9ACD32", "#32CD32", "#CD00CD", "#CD6839", "#FF3030", "#7FFF00",
		"#999999", "#40E0D0", "#8B3626", "#FF6EB4", "#7FFFD4", "#CD6090", "#4A708B", "#00CD00", "#3CB371", "#B452CD",
		"#27408B", "#8B3A62", "#9400D3", "#A2B5CD", "#8B814C", "#AEEEEE", "#556B2F", "#FFBBFF", "#8B008B", "#BF3EFF",
		"#FFAEB9", "#B8860B", "#0000CD", "#CD96CD", "#1E90FF", "#CD0000", "#FFE4C4", "#616161", "#CD8C95", "#66CDAA",
		"#6B8E23", "#DA70D6", "#FFFF00", "#FF4500", "#90EE90", "#CD8162", "#00CDCD", "#FF1493", "#008B00", "#5F9EA0",
		"#6A5ACD", "#8B5742", "#CAFF70", "#EEB422", "#228B22", "#CD3333", "#5D478B", "#8B8B00", "#4682B4", "#CD6600" ];
	// datapoint log (dplog) values
	var mUpdateDatapointLogCallback = null;
	// batch data
	mThis.mBatchData = null;
	var mBatchDataDict = null;
	// Boxplot Pixels object (scroll, zoom, and resize)
	var mBoxplotPixels = null;
	// mGetDetailDataCallback
	var mGetDetailDataCallback = null;
	// annotation data
	mThis.mAnnotationData = null;
	var mAnnotationDataDict = null;
	var mAnnotationTotalPoints = null;
	var mBatchField = null;
	// histogram data
	mThis.mHistogramData = null;
	var mHistogramDataDict = null;
	var mHistogramTotalPoints = null;
	// this variable prevents a repeated select call, but also assumes the number of boxplotBox stays the same
	var mBoxplotBoxList = null;

	
	//var mGlobalCss = " <![CDATA[ !--REPLACE-ME-- ]]>";
	var mGlobalCss = " !--REPLACE-ME-- ";
	
	this.setSizes = function(theTitleHeight, theYLabelWidth, theYScaleWidth,
								theXScaleHeight, theScrollbarHeight, theXLabelHeight)
	{
		// static values
		mTitleHeight = theTitleHeight;
		mYLabelWidth = theYLabelWidth;
		mYScaleWidth = theYScaleWidth;
		mXScaleHeight = theXScaleHeight;
		mScrollbarHeight = theScrollbarHeight;
		mXLabelHeight = theXLabelHeight;
	};
	
	this.getSvg = function()
	{
		return mBoxplotTop;
	};
	
	this.getSvgLegend = function()
	{
		return mLegendDiv;
	};
	
	this.render = function (theData, theBatchData, theAnnotationData, theHistogramData, 
					theWidth, theHeight, thePlotTitle1, thePlotTitle2, 
					theXLabel, theYLabel, theLegendDiv, theUpdateDatapointLogCallback,
					theGetDetailDataCallback, theBatchField)
	{
		//console.log("render started");
//comment out to debug in debug
//		try
//		{
		if (!theData)
		{
			throw new Error("'theData' argument missing");
		}
		mBatchField = theBatchField;
		mGetDetailDataCallback = theGetDetailDataCallback;
		renderFromBreaks(mThis.mTarget, theData, theBatchData, theAnnotationData, theHistogramData, 
						theWidth, theHeight, thePlotTitle1, thePlotTitle2, 
						theXLabel, theYLabel, theLegendDiv, theUpdateDatapointLogCallback);
//		}
//		catch (e)
//		{
//			alert(e);
//		}
		//console.log("render finished");
	};

	this.openFirstDetail = function()
	{
		//console.log("openFirstDetail started");
		mBoxplotBoxList.each(function (theData, theIndex)
		{
			if (0===theIndex)
			{
				//console.log("openFirstDetail clickTarget");
				clickTarget = d3.select(this).data()[0];
				//console.log("openFirstDetail doSelectFunction");
				doSelectFunction();
				//console.log("openFirstDetail after doSelectFunction");
			}
		});
	};
	
	this.resize = function(theNewWidth, theNewHeight)
	{
		//console.log("resize started");
//comment out to debug
//		try
//		{
		resizePlot(theNewWidth, theNewHeight);             // resize the SVG
//		}
//		catch (e)
//		{
//			alert(e);
//		}
		//console.log("resize finished");
	};

	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function indexToColor(theIndex)
	{
		//console.log("indexToColor started");
		//console.log("indexToColor mThis.mDataSeries[theIndex].batchValue=" + mThis.mDataSeries[theIndex].batchValue);
		var result = mColorScale(mThis.mDataSeries[theIndex].batchValue);
		//console.log("indexToColor finished");
		return result;
	};

	function renderFromBreaks(theTarget, theData, theBatchData, theAnnotationData, theHistogramData, 
						theWidth, theHeight, thePlotTitle1, thePlotTitle2, 
						theXLabel, theYLabel, theLegendDiv, theUpdateDatapointLogCallback)
	{
		//console.log("renderFromBreaks started");
		buildData(theData, theBatchData, theAnnotationData, theHistogramData, theLegendDiv, theXLabel, theUpdateDatapointLogCallback);
		makePlot(theTarget, theWidth, theHeight, thePlotTitle1, thePlotTitle2, theXLabel, theYLabel);
		//console.log("renderFromBreaks finished");
	};
	
	function buildBatchData(theBatchData)
	{
		if (null===mThis.mBatchData)
		{
			mThis.mBatchData = theBatchData;
			mBatchDataDict = {};
			for(var index=0;index<mThis.mBatchData.length;index++)
			{
				var myBatchObj = mThis.mBatchData[index];
				// Sample BatchId PlateId ShipDate TSS Type
				mBatchDataDict[myBatchObj.Sample] = myBatchObj;
			}
		}
	};
	
	function buildHistogramData(theHistogramData)
	{
		//console.log("boxplot_outer.js::buildHistogramData theHistogramData[0]="+theHistogramData[0]);
		//console.log("boxplot_outer.js::buildHistogramData theHistogramData[1]="+theHistogramData[1]);
		if ((null===mThis.mHistogramData)&&(null!==theHistogramData)&&(undefined!==theHistogramData[0]))
		{
			// check for error condition in histogram data
			if(theHistogramData[0].hasOwnProperty("x0"))
			{
				mThis.mHistogramData = theHistogramData;
				mHistogramDataDict = {};
				mHistogramTotalPoints = mThis.mHistogramData[0].length-1;
				for(var index=0;index<mThis.mHistogramData.length;index++)
				{
					var myHistogramObj = mThis.mHistogramData[index];
					// Sample HistogramId PlateId ShipDate TSS Type
					var identifier = myHistogramObj.entry;
					mHistogramDataDict[identifier] = myHistogramObj;
					//console.log("boxplot_outer.js::buildHistogramData identifier="+identifier);
				}
			}
			else
			{
				mThis.mHistogramData = null;
			}
		}
	};
	
	function buildAnnotationData(theAnnotationData)
	{
		if ((null!==theAnnotationData)&&(null===mThis.mAnnotationData))
		{
			mThis.mAnnotationData = theAnnotationData;
			mAnnotationDataDict = {};
			mAnnotationTotalPoints = mThis.mAnnotationData[0].value;
			for(var index=1;index<mThis.mAnnotationData.length;index++)
			{
				var myAnnotationObj = mThis.mAnnotationData[index];
				// Sample AnnotationId PlateId ShipDate TSS Type
				var identifier = myAnnotationObj.key;
				identifier = identifier.replace("Non-NA-Points-", "");
				mAnnotationDataDict[identifier] = myAnnotationObj.value;
			}
		}
	};

	function buildData(theData, theBatchData, theAnnotationData, theHistogramData,
						theLegendDiv, theXLabel, theUpdateDatapointLogCallback)
	{
		//console.log("buildData started");
		buildBatchData(theBatchData);
		buildAnnotationData(theAnnotationData);
		buildHistogramData(theHistogramData);
		var series = theData.seriesIterator();
		//console.log(series);

		var usesOutlierBands = (series[0]['outlierBands'] !== undefined) &&
				(series[0]['outlierBands'][0] !== undefined) && (!isNaN(series[0]['outlierBands'][0]));

		// ### computing of extent should be done when data changes
		if (usesOutlierBands)
		{
			mDataYScaleMax = d3.max(series.map(function (elem)
			{
				//console.log("mDataYScaleMax");
				// max value is last (3rd) element
				var val = elem['outlierBands'][3];
				var ret = (val === 'NA') ? Number.NaN : +val;
				return ret;
			}));
			mDataYScaleMin = d3.min(series.map(function (elem)
			{
				//console.log("mDataYScaleMin");
				// min value is first (0th) element
				var val = elem['outlierBands'][0];
				var ret = (val === 'NA') ? Number.NaN : +val;
				return ret;
			}));
			var tempMax = d3.max(series.map(function (elem)
			{
				return elem['breaks'][4];
			}));
			if((undefined===mDataYScaleMax)||(tempMax>mDataYScaleMax))
			{
				mDataYScaleMax = tempMax; 
			}
			var tempMin = d3.min(series.map(function (elem)
			{
				return elem['breaks'][0];
			}));
			if((undefined===mDataYScaleMin)||(tempMin<mDataYScaleMin))
			{
				mDataYScaleMin = tempMin; 
			}
		}
		else
		{
			mDataYScaleMax = d3.max(series.map(function (elem)
			{
				return elem['breaks'][4];
			}));
			mDataYScaleMin = d3.min(series.map(function (elem)
			{
				return elem['breaks'][0];
			}));

			var displayOutliers = false;

			if (displayOutliers)
			{
				//console.log ("min = " + min + ",  max = " + max);
				var extents = series.map(function (elem)
				{
					//console.log("extents");
					return d3.extent(elem.outlierData());
				});
				var minExtent = d3.min(extents, function (elem)
				{
					//console.log("minExtent");
					return elem[0];
				});
				var maxExtent = d3.max(extents, function (elem)
				{
					//console.log("maxExtent");
					return elem[1];
				});
				mDataYScaleMin = d3.min([mDataYScaleMin, minExtent]);
				mDataYScaleMax = d3.max([mDataYScaleMax, maxExtent]);
				//console.log (extents);
				//console.log ("minExtent = " + minExtent + ",  maxExtent = " + maxExtent);
				//console.log ("new min = " + min + ",  new max = " + max);
			}
		}
		//console.log("new min = " + mDataYScaleMin + ",  new max = " + mDataYScaleMax);
		mThis.mDataSeries = series;

		var colorList = mThis.mDataSeries.map(function (obj)
		{
			//console.log("mThis.mDataSeries.map");
			return obj.batchValue;
		});
		colorList = colorList.filter(function (v, i)
		{
			//console.log("colorList.filter");
			return colorList.indexOf(v) === i;
		});

		mColorScale = d3.scale.ordinal()
				.domain(colorList)
				.range(mColors);
		// Copy batch array so we can sort by batch ID
		mLegendNames = mColorScale.domain();
		mLegendColors = mColorScale.range().slice(0,mLegendNames.length);
		//console.log("mLegendNames = " + mLegendNames);
		//console.log("mLegendColors = " + mLegendColors);
		//
		mXLabel = theXLabel;
		mThis.buildLegend(theLegendDiv, true);
		buildDplog(theUpdateDatapointLogCallback);
		//console.log("buildData finished");
	}

	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	///// functions sent to boxplot_pixels
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function boxplotZoom()
	{
		document.body.style.cursor = 'progress';
		setTimeout(boxplotZoomProgress, 2);
	}
	
	function boxplotZoomProgress()
	{
		updatePlotting();
		document.body.style.cursor = 'auto';
	}

	function boxplotDrag()
	{
		// d3.event.scale + ", 1)" tells it to scroll only the X axis/scale
		// this resets where the current location is, so you don't have to scroll back
		// through stuff that was skipped. Meaning, this makes translate stay at the front
		// or back, if that's where it is at
		var location = -(mBoxplotPixels.mCanvasWidth-mBoxplotPixels.mViewWidth)*mBoxplotPixels.mScrollPercentage;
		//console.log("boxplotDrag location=" + location);
		mGViewPanAndZoom.attr("transform", "translate(" + location + ")");
		mGXScaleAreaPanAndZoom.attr("transform", "translate(" + location + ")");
		mScrollbarObject.render();
	}

	function boxplotResize()
	{
		updatePlotting();
	}

	function viewWidth(theImageWidth)
	{
		//console.log("view width theImageWidth=" + theImageWidth);
		//console.log("view width mYScaleWidth=" + mYScaleWidth);
		//console.log("view width mYLabelWidth=" + mYLabelWidth);
		return(theImageWidth - mYScaleWidth - mYLabelWidth - 1);
	}

	function viewHeight(theImageHeight)
	{
		return(theImageHeight - mTitleHeight - mXLabelHeight - mXScaleHeight - mScrollbarHeight);
	}

	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function d3AddUpdateId(theFromElement, theSelectId, theAppend)
	{
		//console.log("d3AddUpdateId started");
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var myElement = theFromElement.selectAll("#" + theSelectId).data([1]);
		// this adds the element if it does not exist
		myElement.enter().append(theAppend);
		myElement.attr("id", theSelectId);
		//console.log("d3AddUpdateId finished");
		return myElement;
	}

	function resizePlot(theX, theY)
	{
		mBoxplotPixels.changeSize(theX, theY);
	}

	function makePlot(theTarget, theWidth, theHeight, thePlotTitle1, thePlotTitle2, theXLabel, theYLabel)
	{
		//console.log("makePlot started");
		mTarget = theTarget;
		mPlotTitle1 = thePlotTitle1;
		mPlotTitle2 = thePlotTitle2;
		mXLabel = theXLabel;
		mYLabel = theYLabel;
		if (null===mBoxplotPixels)
		{
			// TODO: replace 0 with mScrollbarHeight and move scrollbar and time result outside SVG, also need top level G
			mBoxplotPixels = new Pixels(theWidth, theHeight,
									viewWidth, viewHeight,
									boxplotResize, boxplotZoom, boxplotDrag, 0);
			//console.log("Pixels");
			//console.log(mBoxplotPixels);
		}
		updatePlotting();
		//console.log("makePlot finished");
	}

	function setRenderTime(theStartTime, theFinishTime)
	{
		//console.log("setRenderTime started");
		mTimerText.text(((theFinishTime - theStartTime) / 1000) + " sec");
		//console.log("setRenderTime finished");
	}

	function updatePlotting()
	{
		var startTime = new Date().getTime();
		//console.log("updatePlotting started");
		// call this first to get sizes
		calculateSizes();
		addTopLevel();
		addTitleArea();
		addYLabelArea();
		addYScaleArea();
		addScrollbar();
		addXScaleArea();
		addXLabelArea();
		addView();
		setRenderTime(startTime, new Date().getTime());
		//console.log("updatePlotting finished");
	}

	function calculateSizes()
	{
		//console.log("calculateSizes started");
		//console.log(mBoxplotPixels);
		//console.log("mTitleHeight=" + mTitleHeight);
		//console.log("mXLabelHeight=" + mXLabelHeight);
		//console.log("mXScaleHeight=" + mXScaleHeight);
		//console.log("mScrollbarHeight=" + mScrollbarHeight);
		//console.log("mYScaleWidth=" + mYScaleWidth);
		//console.log("mYLabelWidth=" + mYLabelWidth);
		//console.log("mDataYScaleMin=" + mDataYScaleMin);
		//console.log("mDataYScaleMax=" + mDataYScaleMax);
		// TitleArea
		mTitleWidth = mBoxplotPixels.mSvgWidth -1;
		// YLabelArea
		mYLabelHeight = mBoxplotPixels.mSvgHeight - mTitleHeight - mXLabelHeight - mXScaleHeight - mScrollbarHeight;
		// YScaleArea
		mYScaleHeight = mBoxplotPixels.mSvgHeight - mTitleHeight - mXLabelHeight - mXScaleHeight - mScrollbarHeight;
		// addXScaleArea
		mXScaleWidth = mBoxplotPixels.mSvgWidth -1 - mYScaleWidth - mYLabelWidth;
		// XLabelArea
		mXLabelWidth = mBoxplotPixels.mSvgWidth -1 - mYScaleWidth - mYLabelWidth;
		// Y render sizes
		mYDataStart = mDataYScaleMin;
		mYDataEnd = mDataYScaleMax;
		//console.log("calculateSizes finished");
	}

	function addTopLevel()
	{
		//console.log("addTopLevel started");
		// selects and/or creates element
		if (null === mBoxplotTop)
		{
			//console.log("addTopLevel mBoxplotTop");
			mBoxplotTop = d3AddUpdateId(d3.select(mTarget), "BoxplotTop", "svg");
			//console.log("addTopLevel attr 1");
			mBoxplotTop.attr("xmlns","http://www.w3.org/2000/svg");
			// this is a hack, but it works
			//console.log("addTopLevel attr 2");
			//mBoxplotTop.attr("xmlns:xmlns:xlink", "http://www.w3.org/1999/xlink");
			mBoxplotTop.attr("xmlns:xlink", "http://www.w3.org/1999/xlink");
			//console.log("addTopLevel attr 3");
			mBoxplotTop.attr("version","1.1");
			//console.log("addTopLevel defs");
			var defs = d3AddUpdateId(mBoxplotTop, "boxplot_defs", "defs");
			//console.log("addTopLevel style");
			var style = d3AddUpdateId(mBoxplotTop, "boxplot_styles", "style");
			//console.log("addTopLevel attr and text");
			style.attr("type", "text/css")
				.text(mGlobalCss);
			//console.log("addTopLevel end of if");
		}
		//console.log("addTopLevel outside if");
		//console.log("addTopLevel mBoxplotPixels.mSvgWidth=" + mBoxplotPixels.mSvgWidth);
		//console.log("addTopLevel mBoxplotPixels.mSvgHeight=" + mBoxplotPixels.mSvgHeight);
		mBoxplotTop.attr("class", "BoxplotTop")
				.attr("width", mBoxplotPixels.mSvgWidth)
				.attr("height", mBoxplotPixels.mSvgHeight);
		// we don't draw in the SVG (seems counterintutive)
		// instead we draw in a "g" element attached to the SVG
		// selects and/or creates element
		if (null === mBoxplotTopBorder)
		{
			mBoxplotTopBorder = d3AddUpdateId(mBoxplotTop, "BoxplotTopBorder", "g");
		}
		mBoxplotTopBorder.attr("class", "BoxplotTopBorder")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", mBoxplotPixels.mSvgWidth)
				.attr("height", mBoxplotPixels.mSvgHeight);
		// add a timer window
		if (null === mTimerText)
		{
			mTimerTextG = d3AddUpdateId(mBoxplotTop, "TimerTextG", "g");
			mTimerText = d3AddUpdateId(mTimerTextG, "TimerText", "text");
			mTimerText.attr("class", "TimerText")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", 50)
					.attr("height", 20)
					.on("click", function ()
					{
						//console.log("debug d3.event.scale=" + d3.event.scale);
						//console.log("debug d3.event.translate=" + d3.event.translate);
						//console.log("debug mRenderScale=" + mRenderScale);
					});
		}
		mTimerTextG.attr("transform", "translate(0, " + (mBoxplotPixels.mSvgHeight) + ")");
		//console.log("addTopLevel finished");
	}

	function addTitleArea()
	{
            // selects and/or creates element	
            if (null === mGTitleArea)
		{
			mGTitleArea = d3AddUpdateId(mBoxplotTop, "GTitleArea", "g");
                        // Ensure elements have unique IDs even across tabs
                        var uniqueSuffix = (BoxPlotOuter.uniqueSuffix++).toString();
                        
                        //create the title svg with the generated id
                        titleL1 = d3AddUpdateId(mGTitleArea, "titleTextBox"+uniqueSuffix, "svg");
                        titleL1.attr("width", '100%')
                            .attr("height", mTitleHeight);
                        //make the data object that drives the textBox
						var dataT1 = [{
                            "text": mPlotTitle1+mPlotTitle2
                        }];
                        //get the width from the size of the boxplot svg
                        var wid = mBoxplotTop.style("width");
                        wid = wid.split(".")[0];
                        
                        //select the svg created above with the unique ID and create the textBox in it
                        mTitleTextBox = new d3plus.TextBox()
                            .data(dataT1)
                            .height(45)
                            .width(wid)
                            .textAnchor("middle")
                            .fontResize(true)
                            .select("#titleTextBox"+uniqueSuffix)
                            .render();
                }else{
                    //when resizing just gets the new width and rerenders the textBox
                    var wid = mBoxplotTop.style("width");
                    wid = wid.split(".")[0];
                    mTitleTextBox.width(wid).render(); 
                }     	
	}

	function addYLabelArea()
	{
		//console.log("addYLabelArea started");
		// These are "backwards" because the result is rotated
		var myNontransformedWidth = mYLabelHeight;
		var myNontransformedHeight = mYLabelWidth;
		if (null === mGYLabelArea)
		{
			// selects and/or creates element
			mGYLabelArea = d3AddUpdateId(mBoxplotTop, "GYLabelArea", "g");
			// add border
			mYLabelAreaBorder = d3AddUpdateId(mGYLabelArea, "YLabelAreaBorder", "rect");
			// add theTitle text to area
			mBoxplotYLabel = d3AddUpdateId(mGYLabelArea, "BoxplotYLabel", "text");
		}
		mYLabelAreaBorder.attr("class", "BoxplotTopBorder")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", myNontransformedWidth)
				.attr("height", myNontransformedHeight);
		mBoxplotYLabel.attr("class", "BoxplotYLabel")
				.attr("x", myNontransformedWidth / 2)
				.attr("y", (2 / 3) * myNontransformedHeight)
				.attr("width", myNontransformedWidth)
				.attr("height", myNontransformedHeight)
				.attr("text-anchor", "middle")
				.text(mYLabel);
		mGYLabelArea.attr("transform", "rotate(-90 0 0) " +
				"translate(-" + (myNontransformedWidth + mTitleHeight) + ", " + 0 + ")");
		//console.log("addYLabelArea finished");
	}

	function addYScaleArea()
	{
		//console.log("addYScaleArea started");
		////////////////////
		//////////////////// scale and axis
		////////////////////
		// map Y as data and physical view
		if (null === mYScale)
		{
			mYScale = d3.scale.linear();
			mYAxis = d3.svg.axis();
		}
		// try padding the data
		//mYScale.domain([mYDataStart, mYDataEnd])
		//console.log("mYDataStart=" + mYDataStart);
		//console.log("mYDataEnd=" + mYDataEnd);
		var tempPad = (mYDataStart - mYDataEnd)*0.1;
		mYScale.domain([mYDataStart+tempPad, mYDataEnd-tempPad])
				.range([mBoxplotPixels.mViewHeight, 0]);
		mYAxis.scale(mYScale)
				.orient("left");
		////////////////////
		//////////////////// display elements
		////////////////////
		var myNontransformedWidth = mYScaleWidth;
		var myNontransformedHeight = mYScaleHeight;
		if (null === mGYScaleArea)
		{
			// selects and/or creates element
			mGYScaleArea = d3AddUpdateId(mBoxplotTop, "GYScaleArea", "g")
					.attr("class", "GYScaleArea");
			// not sure why the transform is required. Without it, the scale is too far left
			mYScaleItself = d3AddUpdateId(mGYScaleArea, "YScaleItself", "g");
			// add border
			mYScaleAreaBorder = d3AddUpdateId(mGYScaleArea, "YScaleAreaBorder", "rect");
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
		mGYScaleArea.attr("transform", "translate(" + mYLabelWidth + ", " + (mTitleHeight) + ")");
		//console.log("addYScaleArea finished");
	}

	function addXScaleArea()
	{
		//console.log("addXScaleArea started");
		////////////////////
		//////////////////// scale and axis
		////////////////////
		// domain is based on data - range is based on plotting
		if (null === mXScale)
		{
			mXScale = d3.scale.ordinal()
					.domain(mThis.mDataSeries.map(function (theData)
					{
						//console.log("mXScale");
						return (theData.name + " / " + theData.batchValue);
					}));
		}
		// do this outside if, as it needs to be reset and render end changes
		//mXScale.range([mXRenderStart, mXRenderEnd]);
		mXScale.range([0, mBoxplotPixels.mCanvasWidth]);
		///////////////////////////////////////////
		///////////////////////////////////////////
		// CHRIS START
		// do not use rangeRoundBands -- it adds unacceptable padding which is not
		// very noticable up to 80 or so samples, but is horrible with 2000
		//mXScale.rangeRoundBands([0, mXRenderEnd], 0, 0);     //round to integer
		//mXScale.rangeBands([0, mXRenderEnd], 0, 0);     //no rounding
		mXScale.rangeBands([0, mBoxplotPixels.mCanvasWidth], 0, 0);     //no rounding
		// CHRIS END
		///////////////////////////////////////////
		///////////////////////////////////////////
		mTickSpace = mXScale.rangeBand();
		mXAxis = d3.svg.axis()
				.scale(mXScale)
				.orient("bottom");
		////////////////////
		//////////////////// display elements
		////////////////////
		// selects and/or creates element
		// viewBox not used
		if (null === mGXScaleArea)
		{
			mGXScaleArea = d3AddUpdateId(mBoxplotTop, "GXScaleArea", "g");
			mGXScaleAreaSvg = d3AddUpdateId(mGXScaleArea, "GXScaleAreaSvg", "svg");
			mGXScaleAreaSvg.attr("xmlns","http://www.w3.org/2000/svg");
			// this is a hack, but it works
			mGXScaleAreaSvg.attr("xmlns:xlink", "http://www.w3.org/1999/xlink");
			mGXScaleAreaSvg.attr("version","1.1");
			mGXScaleAreaPanAndZoom = d3AddUpdateId(mGXScaleAreaSvg, "GXScaleAreaPanAndZoom", "g");
		}
		mGXScaleArea.attr("class", "GXScaleArea")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", mXScaleWidth)
				.attr("height", mXScaleHeight);
		mGXScaleAreaSvg.attr("class", "GXScaleAreaSvg")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", mXScaleWidth)
				.attr("height", mXScaleHeight);
		mGXScaleAreaPanAndZoom.attr("class", "GXScaleAreaPanAndZoom")
				.call(mXAxis);
		// scale(" + mRenderScale + ")
		///////////////////////////////////////////
		///////////////////////////////////////////
		// CHRIS START
		// this is how I resize text to fit in the given area.
		// it seems to work really well.
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		var textWidth = 0;
		var textHeight = 0;
		if (null === mSelectedTickText)
		{
			mSelectedTickText = mGXScaleAreaPanAndZoom.selectAll(".tick text");
		}
		mSelectedTickText.each(function (theText, theIndex)
		{
			//console.log("mSelectedTickText.each");
			//console.log("mSelectedTickText.each theText=" + theText);
			var bbox = this.getBBox();
			if (bbox.height > textHeight)
			{
				textHeight = bbox.height;
			}
			if (bbox.width > textWidth)
			{
				textWidth = bbox.width;
			}
			var tooltip = d3AddUpdateId(d3.select(this), "ToolTip", "title");
			tooltip.text(theText);
		});
		var heightTransform = ((mTickSpace) / textHeight);
		var widthTransform = ( (mXScaleHeight-20) / textWidth);
		var matrixValue = widthTransform < heightTransform ? widthTransform : heightTransform;
		console.log("matrixValue = " + matrixValue);
		mSelectedTickText.attr("dy", 0)
				.attr("y", 0)
				// This works with magic numbers. I'm not sure why 5.0 works to line up the values, but it does. The -10 is to drop below the border for the label area.
				//.attr("transform", "scale(" + matrixValue + ") rotate(-90) translate(-7," + ((textHeight*matrixValue) / 5.0) + ") ")
				// still a magic number but now dividing by 12 works
				.attr("transform", "scale(" + matrixValue + ") rotate(-90) translate(-7," + ((textHeight*matrixValue) / 12.0) + ") ")
				.style("text-anchor", "end")
				//.attr("transform", "scale(" + matrixValue + ") translate(" + ((textHeight*matrixValue)*0.5) + "," + (15) + ")  rotate(" + (-90) + ")")
				.each(function (theData, theIndex)
				{
					//console.log("mSelectedTickText stuff");
					d3.select(this).classed(indexToColor(theIndex).replace("#", "legend-"), true);
					d3.select(this).on("mouseover", function()
					{
						// This uses D3 transitions to delay the mouseover action
						// If the mouseout happens before the delay in the mouseover
						// transition, the mouseout transition on "this" DOM element
						// will cause the mouseover transition to be canceled.
						// New versions of D3 support d3.select(this).interrupt(); instead
						d3.select(this).transition()
								.delay(250)
								.each("start", function ()
								{
									//console.log("mouseover tick " + theIndex);
									addHighlighting(indexToColor(theIndex).replace("#", "legend-"));
								});
					});
					d3.select(this).on("mouseout", function()
					{
						//console.log("mouseout tick " + theIndex);
						removeHighlighting(indexToColor(theIndex).replace("#", "legend-"));
						// This uses D3 transitions to delay the mouseover action
						// If the mouseout happens before the delay in the mouseover
						// transition, the mouseout transition on "this" DOM element
						// will cause the mouseover transition to be canceled.
						// New versions of D3 support d3.select(this).interrupt(); instead
						d3.select(this).transition().duration(0);
					});
				});
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		// CHRIS END
		///////////////////////////////////////////
		///////////////////////////////////////////
		// add border
		mGXScaleArea.attr("transform", "translate(" + (mYLabelWidth + mYScaleWidth) + ", " + (mYScaleHeight + mTitleHeight + mScrollbarHeight) + ")");
		//console.log("addXScaleArea finished");
	}

	function addXLabelArea()
	{
		//console.log("addXLabelArea started");
		if (null === mGXLabelArea)
		{
			// selects and/or creates element
			mGXLabelArea = d3AddUpdateId(mBoxplotTop, "GXLabelArea", "g");
			// add border
			mXLabelAreaBorder = d3AddUpdateId(mGXLabelArea, "XLabelAreaBorder", "rect");
			// add theTitle text to area
			mBoxplotXLabel = d3AddUpdateId(mGXLabelArea, "BoxplotXLabel", "text");
		}
		mXLabelAreaBorder.attr("class", "BoxplotTopBorder")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", mXLabelWidth)
				.attr("height", mXLabelHeight);
		mBoxplotXLabel.attr("class", "BoxplotXLabel")
				.attr("x", mXLabelWidth / 2)
				.attr("y", (2 / 3) * mXLabelHeight)
				.attr("width", mXLabelWidth)
				.attr("height", mXLabelHeight)
				.attr("text-anchor", "middle")
				.text(mXLabel);
		mGXLabelArea.attr("transform", "translate(" + (mYLabelWidth + mYScaleWidth) + ", " +
				(mYScaleHeight + mTitleHeight + mXScaleHeight + mScrollbarHeight) + ")");
		//console.log("addXLabelArea finished");
	}

	function addView()
	{
		//console.log("addView started");
		var myNontransformedWidth = mBoxplotPixels.mViewWidth;
		var myNontransformedHeight = mBoxplotPixels.mViewHeight;
		if (null === mGView)
		{
			// wrap this so it is only created the first time
			// selects and/or creates element
			mGView = d3AddUpdateId(mBoxplotTop, "GView", "g");
			addZoomEventCatcherToExisting(mGView);
			// add border
			mViewBorder = d3AddUpdateId(mGView, "ViewBorder", "rect");
			// add svg
			mViewSVG = d3AddUpdateId(mGView, "ViewSVG", "svg");
			mViewSVG.attr("xmlns","http://www.w3.org/2000/svg");
			// this is a hack, but it works
			mViewSVG.attr("xmlns:xlink", "http://www.w3.org/1999/xlink");
			mViewSVG.attr("version","1.1");
			mGViewPanAndZoom = d3AddUpdateId(mViewSVG, "GViewPanAndZoom", "g");
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
		// add data panes to myG
		addDataPanes();
		// set transform on topG
		mGView.attr("transform", "translate(" + (mYLabelWidth + mYScaleWidth) + ", " + (mTitleHeight) + ")");
		//console.log("addView finished");
	}

	function addDataPanes()
	{
		//console.log("addDataPanes started");
		//console.log("addDataPanes start");
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		if (null === mBoxplotBoxList)
		{
			mBoxplotBoxList = mGViewPanAndZoom.selectAll("g.boxplotBox").data(mThis.mDataSeries);
			// this adds the element if it does not exist
			mBoxplotBoxList.enter().append("g")
				.style("fill", "white");
		}
		var boxWidth = mXScale.rangeBand();
		mBoxplotBoxList.attr("class", "boxplotBox")
				//.attr("y", 0)
				// not used but set just FYI
				.attr("width", boxWidth)
				.attr("height", mBoxplotPixels.mViewHeight)
				.each(function (theData, theIndex)
				{
					//console.log("mBoxplotBoxList theIndex = " + theIndex);
					//d3.select(this).attr("x", (theIndex * boxWidth));
					d3.select(this).attr("transform", "translate(" + (theIndex * boxWidth) + ", 0 )");
				})
				.on("mouseenter", function(theData, theIndex)
				{
					//console.log("addDataPanes boxplotBoxList mouse enter");
					// This uses D3 transitions to delay the mouseover action
					// If the mouseout happens before the delay in the mouseover
					// transition, the mouseout transition on "this" DOM element
					// will cause the mouseover transition to be canceled.
					// New versions of D3 support d3.select(this).interrupt(); instead
					d3.select(this).transition()
							.delay(250)
							.each("start", function ()
							{
								//console.log("mouseenter boxplotBox " + theData.batchValue);
								addDplogData(theData);
							});
				})
				.on("mouseleave", function (d)
				{
					//console.log("addDataPanes boxplotBoxList mouse leave");
					// This uses D3 transitions to delay the mouseover action
					// If the mouseout happens before the delay in the mouseover
					// transition, the mouseout transition on "this" DOM element
					// will cause the mouseover transition to be canceled.
					// New versions of D3 support d3.select(this).interrupt(); instead
					d3.select(this).transition().duration(0);
				})
				;
		//console.log("addDataPanes plotbox");
		// ? replace myPlotbox with an object that gets updated?
		var myPlotbox = plotbox(mYScale, boxWidth, mBoxplotPixels.mViewHeight, null, mColorScale);
		mBoxplotBoxList.call(myPlotbox);
		//console.log("addDataPanes finished");
	}

	function addScrollbar()
	{
		//console.log("addScrollbar started");
		if (null === mGScrollbarArea)
		{
			// selects and/or creates element
			mGScrollbarArea = d3AddUpdateId(mBoxplotTop, "GScrollbarArea", "g");
			mScrollbarObject = ScrollBar(mGScrollbarArea, (mYLabelWidth + mYScaleWidth), mBoxplotPixels, mScrollbarHeight);
		}
		// this might need to be inside the if with a different redraw to prevent interference from dragging
		mScrollbarObject.render();
		mGScrollbarArea.attr("class", "GScrollbarArea")
				.attr("width", mBoxplotPixels.mViewWidth)
				.attr("height", mScrollbarHeight)
				.attr("transform", "translate(" + (mYLabelWidth + mYScaleWidth) + ", " +
						(mYScaleHeight + mTitleHeight) + ")");
		//console.log("addScrollbar finished");
	}

	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function range1(i)
	{
		//console.log("range1 started");
		return i?range1(i-1).concat(i):[];
		//console.log("range1 finished");
	}

	function addHighlighting(theClassname)
	{
		//console.log("outer addHighlighting started for " + theClassname);
		d3.selectAll(("."+theClassname)).classed("SelectedBatch", true);
		//console.log("addHighlighting finished");
	}

	function removeHighlighting(theClassname)
	{
		//console.log("outer removeHighlighting started for " + theClassname);
		d3.selectAll(("."+theClassname)).classed("SelectedBatch", false);
		//console.log("removeHighlighting finished");
	}
	
	function buildDplog(theUpdateDatapointLogCallback)
	{
		if (null!==theUpdateDatapointLogCallback)
		{
			mUpdateDatapointLogCallback = theUpdateDatapointLogCallback;
		}
	}
	
	function addDplogData(theData)
	{
		if (null!==mUpdateDatapointLogCallback)
		{
			// 0=lowerWhisker 1=LowerHinge 2=Median 3=UpperHinge 4=upperWhisker
			var breaks = theData.breaks;
			// .outlierBands 0=LowerOutMax, 1=LowerOutMin, 2=UpperOutMin, 3=UpperOutMax
			var outlierBands = theData.outlierBands;
			addDplogDataDetail(theData.name, theData.batchValue, 
				outlierBands[0], outlierBands[1], 
				breaks[0], breaks[1], breaks[2], breaks[3], breaks[4], 
				outlierBands[2], outlierBands[3]);
		}
	}
	
	function addLabeledSpan(theLabel, theValue, theParent)
	{
		var mydiv = theParent
					.append("div")
					.attr("class", "dplog-data-div");
		mydiv
					.append("span")
					.attr("class", "dplog-data-label")
					.text(theLabel);
		mydiv
					.append("span")
					.attr("class", "dplog-data-value")
					.text(theValue);

	}
	
	function addLabeledSpanTitle(theLabel1, theValue1, theLabel2, theValue2, theParent)
	{
		var mydiv = theParent
					.append("div")
					.attr("class", "dplog-title-div");
		mydiv
					.append("span")
					.attr("class", "dplog-title-label")
					.text(theLabel1);
		mydiv
					.append("span")
					.attr("class", "dplog-title-value")
					.text(theValue1);
		mydiv
					.append("span")
					.attr("class", "dplog-title-label")
					.text(theLabel2);
		mydiv
					.append("span")
					.attr("class", "dplog-title-value")
					.text(theValue2);
	}
	
	mThis.getElementHistgramData = function(theGroup)
	{
		var result = null;
		//console.log("boxplot_outer.js::getElementHistgramData theGroup=" + theGroup);
		if (null!==mHistogramDataDict)
		{
			result = mHistogramDataDict[theGroup];
			//console.log("boxplot_outer.js::getElementHistgramData result=" + result);
		}
		return result;
	};
	
	mThis.getNfor = function(theGroup)
	{
		var currentN = mAnnotationDataDict[theGroup];
		if ((undefined === currentN) || (null === currentN))
		{
			var counter = 0;
			Object.keys(mBatchDataDict).forEach(function (key) 
			{
				var value = mBatchDataDict[key];
				if (theGroup===value[mBatchField])
				{
					counter = counter + 1;
				}
			});
			currentN = "" + counter + "";
		}
		return currentN;
	};
	
	function valueOrNone(theValue)
	{
		if (isNaN(theValue))
		{
			theValue = "none";
		}
		return theValue;
	}
	
	function addDplogDataDetail(theName, theBatch, theLowerOutMax, theLowerOutMin, theLowerWhisker, theLowerHinge, 
							theMedian, theUpperHinge, theUpperWhisker, theUpperOutMin, theUpperOutMax)
	{
		if (null!==mUpdateDatapointLogCallback)
		{
			var stringArray =
				[
			["Name:", theName],
			["n:", mThis.getNfor(theName)],
			["Batch:", theBatch],
			["Upper Outlier Max:", ""+valueOrNone(theUpperOutMax.toPrecision(3))],
			["Upper Outlier Min:", ""+valueOrNone(theUpperOutMin.toPrecision(3))],
			["Upper Whisker:", ""+theUpperWhisker.toPrecision(3)],
			["Upper Hinge:", ""+theUpperHinge.toPrecision(3)],
			["Median:", ""+theMedian.toPrecision(3)],
			["Lower Hinge:", ""+theLowerHinge.toPrecision(3)],
			["Lower Whisker:", ""+theLowerWhisker.toPrecision(3)],
			["Lower Outlier Min:", ""+valueOrNone(theLowerOutMin.toPrecision(3))]
				];
			stringArray.push(["Lower Outlier Max:", ""+valueOrNone(theLowerOutMax.toPrecision(3))]);
			// Sample BatchId PlateId ShipDate TSS Type
 			var myBatchObj = mBatchDataDict[theName];
			if (undefined !== myBatchObj)
			{
				stringArray.push(["Batch Id:", myBatchObj.BatchId]);
				stringArray.push(["Plate Id:", myBatchObj.PlateId]);
				stringArray.push(["Ship Date:", myBatchObj.ShipDate]);
				stringArray.push(["TSS:", myBatchObj.TSS]);
				if (undefined !== myBatchObj.Type)
				{
					stringArray.push(["Tissue Type:", myBatchObj.Type]);
				}
			}
			mUpdateDatapointLogCallback(stringArray);
		}
	}

	mThis.buildLegend = function(theLegendDiv, theSetGlobalFlag)
	{
		//console.log("buildLegend started");
		if (null!==theLegendDiv)
		{
			mLegendTitle =  mXLabel;
			if (true===theSetGlobalFlag)
			{
				mLegendDiv = theLegendDiv;
			}
			var indexData = range1(mLegendColors.length+1);
			//console.log("mLegendColors = " + mLegendColors);
			//console.log("mLegendNames = " + mLegendNames);
			//console.log("indexData = " + indexData);
			//console.log("mLegendDiv = " + mLegendDiv);
			//console.log("theLegendDiv = " + theLegendDiv);

			var legendSvg = d3.select(theLegendDiv)
					.append("svg:svg")
					.attr("class", "batchlegend")
					.attr("height", ((mLegendColors.length+1)*20+20));

			//console.log("legendGentry selectAll");
			var legendGentry = legendSvg.selectAll("g.legenditem").data(indexData);
			//console.log("legendGentry append");
			legendGentry.enter().append("svg:g")
					.attr("class", "legenditem")
					.attr("transform", function(d, i)
					{
						//console.log("legendGentry transform");
						return "translate(10," + ((i) * 20) + ")";
					})
					.each(function (theData, theIndex)
					{
						if (0===theIndex)
						{
							// title
							d3.select(this).append("svg:text")
								.attr("class", "legendtext")
								.attr("x", 20)
								.attr("y", 9)
								.text(function (d, i)
								{
									//console.log("legendtext="+mLegendTitle);
									return mLegendTitle;
								});
						}
						else
						{
							// entries
							//d3.select(this).attr("x", (theIndex * boxWidth));
							d3.select(this).classed(mLegendColors[theIndex-1].replace("#", "legend-"), true);
							d3.select(this).on("mouseover", function()
							{
								// This uses D3 transitions to delay the mouseover action
								// If the mouseout happens before the delay in the mouseover
								// transition, the mouseout transition on "this" DOM element
								// will cause the mouseover transition to be canceled.
								// New versions of D3 support d3.select(this).interrupt(); instead
								d3.select(this).transition()
										.delay(250)
										.each("start", function ()
										{
											//console.log("mouseover tick " + theIndex);
											addHighlighting(mLegendColors[theIndex-1].replace("#", "legend-"));
										});
							});
							d3.select(this).on("mouseout", function()
							{
								//console.log("mouseout tick " + theIndex);
								removeHighlighting(mLegendColors[theIndex-1].replace("#", "legend-"));
								// This uses D3 transitions to delay the mouseover action
								// If the mouseout happens before the delay in the mouseover
								// transition, the mouseout transition on "this" DOM element
								// will cause the mouseover transition to be canceled.
								// New versions of D3 support d3.select(this).interrupt(); instead
								d3.select(this).transition().duration(0);
							});
							d3.select(this).append("svg:rect")
								.attr("class", "legendsymbol")
								.attr("x", 0)
								.attr("y", 0)
								.attr("width", 10)
								.attr("height", 10)
								.style("fill", function (d, i)
								{
									//console.log("legendsymbol");
									return mLegendColors[theIndex-1];
								});
							d3.select(this).append("svg:text")
								.attr("class", "legendtext")
								.attr("x", 20)
								.attr("y", 9)
								.text(function (d, i)
								{
									//console.log("legendtext");
									return mLegendNames[theIndex-1];
								});
						}
					});
			//console.log("legendGentry exit");
			legendGentry.exit().remove();
		}
		//console.log("buildLegend finished");
	};

	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function doSelectFunction()
	{
		//console.log("doSelectFunction");
		if (null!==clickTarget)
		{
			//console.log("doSelectFunction clickTarget has value");
			//var data = d3.select((d3.event.explicitOriginalTarget).parentNode).data()[0];
			var data = clickTarget;
			var id = data.name;
			var batchValue = data.batchValue;
			if ((1===data)||(undefined===id))
			{
				//console.log("ignore - user clicked on something with no data");
			}
			else
			{
				//console.log("doSelectFunction target name=" + id);
				// original file name, replace "BoxData" with "CatData",
				// add a "-" and the "name" from above before the ".tsv" to get detail file
				//console.log("doSelectFunction target batchValue=" + batchValue);
				//console.log("doSelectFunction target mColorScale(batchValue)=" + mColorScale(batchValue));
				//console.log("doSelectFunction target mDataYScaleMin=" + mDataYScaleMin);
				//console.log("doSelectFunction target mDataYScaleMax=" + mDataYScaleMax);
				//console.log("doSelectFunction mGetDetailDataCallback=" + mGetDetailDataCallback);
				mGetDetailDataCallback(id, data, mColorScale(batchValue), mDataYScaleMin, mDataYScaleMax);
			}
		}
	}
	
	// zoom/pan functionality
	function doZoomFunction()
	{
		//console.log("doZoomFunction");
		//console.log("doZoomFunction d3.event.shiftKey = " + d3.event.shiftKey);
		if ((true===d3.event.ctrlKey)||(true===d3.event.metaKey))
		{
			//console.log("doZoomFunction d3.event.ctrlKey");
		}
		else if (false===d3.event.shiftKey)
		{
			// zoom in +1
			mBoxplotPixels.changeZoom(mBoxplotPixels.mCurrentZoom+1);
		}
		else
		{
			// zoom out -1
			mBoxplotPixels.changeZoom(mBoxplotPixels.mCurrentZoom-1);
		}
	}

	function doDragFunction()
	{
		if (undefined!==d3.event.dx)
		{
			//console.log("doDragFunction d3.event.dx = " + change);
			var change = -Number(d3.event.dx);
			//console.log("doDragFunction change = " + change);
			var recalc = ((mBoxplotPixels.mCanvasWidth-mBoxplotPixels.mViewWidth)*mBoxplotPixels.mScrollPercentage) + change;
			recalc = recalc / (mBoxplotPixels.mCanvasWidth-mBoxplotPixels.mViewWidth);
			//console.log("doDragFunction recalc = " + recalc);
			mBoxplotPixels.changeScroll(recalc);
		}
	}
	
	var clickTarget = null;
	
	function addZoomEventCatcherToExisting(theExisting)
	{
		if (null === mDrag)
		{
			mDrag = d3.behavior.drag()
				//.on("dragstart", dragstarted)
				.on("drag", doDragFunction)
				//.on("dragend", dragended)
			;
		}
		theExisting.attr("fill", "none")
				.attr("pointer-events", "all")
				.call(mDrag)
				.on("click", 
					function()
					{
						clickTarget = d3.select((d3.event.target).parentNode).data()[0];
						setTimeout(doSelectFunction, 250);
					})
				.on("dblclick",
					function()
					{
						clickTarget = null;
						doZoomFunction();
					});
	}
	
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	return mThis;
}
