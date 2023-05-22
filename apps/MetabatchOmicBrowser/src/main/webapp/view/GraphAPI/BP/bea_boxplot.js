/* */
/* global Promise, d3 */

function BeaBoxplot(theBoxDataFile, theBatchDataFile, theAnnotationDataFile, theHistogramDataFile,
		theBatchType,
		theTitle1, theTitle2, theVersion, theXAxisLabel, theYAxisLabel,
		theStartWidth, theStartHeight, theFinishedCallback,
		thePlotDiv, theLegendDiv, theUpdateDatapointLogCallback,
		theGetDetailedDivCallback, theDetailedWidth, theDetailedHeight, theGetDataCallback)
{
	//console.log("bea_bosplot.js init thePlotDiv="+thePlotDiv);
	var mThis = this;
	
	var mBoxplotOuter = null;
	var mGetDetailedDivCallback = theGetDetailedDivCallback;
	var mDetailedWidth = theDetailedWidth;
	var mDetailedHeight = theDetailedHeight;
	var mBoxplotDetailed = null;

	mThis.version = function ()
	{
		return "BEA_VERSION_TIMESTAMP";
	};

	console.log("BEA Boxplot: " + mThis.version());
	
	mThis.mTimer = null;
	mThis.resizePlot = function (theNewWidth, theNewHeight, theNewDetailWidth, theNewDetailHeight)
	{
		//console.log("BEA Boxplot: resizePlot 1");
		if (null !== mThis.mTimer)
		{
			clearTimeout(mThis.mTimer);
			mThis.mTimer = null;
		}
		mThis.mTimer = setTimeout(function ()
		{
			//console.log("BEA Boxplot: resizePlot 2");
			resizeInternal(theNewWidth, theNewHeight, theNewDetailWidth, theNewDetailHeight);
		}, 250);
	};

	resizeInternal = function (theNewWidth, theNewHeight, theNewDetailWidth, theNewDetailHeight)
	{
		//console.log("BEA Boxplot: resizeInternal");
		mThis.mTimer = null;
		if (null !== mBoxplotOuter)
		{
			//console.log("BEA Boxplot: mBoxplotOuter");
			mBoxplotOuter.resize(theNewWidth, theNewHeight);
		}
		if (null !== mBoxplotDetailed)
		{
			//console.log("BEA Boxplot: mBoxplotDetailed");
			mBoxplotDetailed.resize(theNewDetailWidth, theNewDetailHeight);
		}
	};

	mThis.getGraphVariables = function ()
	{
		return mBoxplotOuter.mDataSeries;
	};

	mThis.getGroupVariables = function ()
	{
		return mBoxplotOuter.mBatchData;
	};

	mThis.makeLegend = function (theDiv)
	{
		if ((undefined === theDiv) || (null === theDiv))
		{
			theDiv = document.createElement('div');
			document.body.appendChild(theDiv);
			theDiv.style.position = 'absolute';
			theDiv.style.left = -1000;
			theDiv.style.top = -1000;
			theDiv.style.display = 'none';
		}
		mBoxplotOuter.buildLegend(theDiv, false);
		return theDiv;
	};

	/* uses resrouces: src="http://eligrey.com/demos/FileSaver.js/Blob.js",
	 src="http://eligrey.com/demos/FileSaver.js/FileSaver.js">
	 but safari is broken
	 mThis.saveDiagram = function(theFilename)
	 {
	 try
	 {
	 var isFileSaverSupported = !!new Blob();
	 }
	 catch (e)
	 {
	 alert("Saving not support by this browser");
	 }
	 var html = mBoxplotOuter.getSvg()
	 .attr("title", "Boxplot")
	 .attr("version", mmThis.version())
	 .attr("xmlns", "http://www.w3.org/2000/svg")
	 .node().parentNode.innerHTML;
	 var blob = new Blob([html], {type: "image/svg+xml"});
	 saveAs(blob, theFilename);
	 };*/

	function post(theUrl, theParams)
	{
		// The rest of this code assumes you are not using a library.
		// It can be made less wordy if you use one.
		var form = document.createElement("form");
		form.setAttribute("method", "post");
		form.setAttribute("action", theUrl);
		form.setAttribute("enctype", "multipart/form-data");
		for (var key in theParams)
		{
			if (theParams.hasOwnProperty(key))
			{
				var hiddenField = document.createElement("input");
				hiddenField.setAttribute("type", "hidden");
				hiddenField.setAttribute("name", key);
				hiddenField.setAttribute("value", theParams[key]);

				form.appendChild(hiddenField);
			}
		}
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
	}

	function tsvDataIterator(data)
	{
		//console.log("tsvDataIterator started");

		function iter()
		{
		}

		iter.seriesNames = function ()
		{
			//return headerline;					// copy? ###
			return data.map(function (elem)
			{
				return elem.Id;
			});
		};

		iter.seriesCount = function ()
		{
			return (data.length);
		};

		iter.seriesIterator = function ()
		{
			return data.map(
					function (elem, colIndex)
					{
						return {
							"name": elem.Id,
							"index": colIndex + 1,
							"data": function ()
							{
								return null;
							},
							"namedData": function ()
							{
								return null;
							},
							"breaks": [elem['LowerWhisker'], elem['LowerHinge'], elem['Median'],
								elem['UpperHinge'], elem['UpperWhisker']]
						};
					});
		};
		//console.log("tsvDataIterator finished");

		return iter;
	}

	getBatchValue = function (theId, theBatchData, theBatchType)
	{
		var value = "";
		if (null === theBatchType)
		{
			value = theId;
		}
		else
		{
			for (var ind = 0; ind < theBatchData.length; ind++)
			{
				if (theBatchData[ind]["Sample"] === theId)
				{
					value = theBatchData[ind][theBatchType];
				}
			}
			if ("" === value)
			{
				// this is either a bug in the data, or the "group" method, so return theId value = "Not Found";
				value = theId;
			}
		}
		return value;
	};

	tsvDataIteratorWithOutliers = function (data, outliers, theBatchData, theBatchType)
	{
		//console.log("tsvDataIteratorWithOutliers started");
		var myBatchData = theBatchData;
		var myBatchType = theBatchType;

		outliers = "";	// ###

		outliers = outliers.split("\n");
		//console.log("After split, found " + outliers.length + " lines.");

		//console.log (data[data.length-1].length);
		if (outliers[outliers.length - 1] === 0)
		{		// trailing \r ?
			outliers = outliers.slice(0, -1);
		}

		outliers = outliers.map(function (line)
		{
			return line.split("\t");
		});

		// The header line is not used
		//var headerline = outliers[0];
		//headerline = headerline.slice(1);		// trim off first column
		outliers = outliers.slice(1);			// trim off header row

		//console.log("After clean up, found " + outliers.length + " lines.");

		// So we now have a rectangular matrix.  See if it is sparse, or if it
		// is really not rectangular but filled to appear so

		//var minLen = d3.extent (outliers.map (function (row) { return row.length; })); //console.log ("min len = " + minLen);
//		var minMax = d3.extent(outliers.map(function (row)
//		{
//			for (var ix = 0; ix < row.length; ix++)
//			{
//				var col = row[ix];
//				if ((col === undefined) || (col === null) || (col === ''))
//				{
//					return ix;
//				}
//			}
//		}));

		//console.log("min len = " + minMax);

		var outlierMap = [];
		outliers.forEach(function (line, ix)
		{
			//outlierMap[line[0]] = line.slice (1);
			outlierMap[line[0]] = ix;
		});

		//console.log (outlierMap);

		function iter()
		{
		}

		iter.seriesNames = function ()
		{
			//return headerline;					// copy? ###
			return data.map(function (elem)
			{
				return elem.Id;
			});
		};

		iter.seriesCount = function ()
		{
			return (data.length);
		};

		iter.seriesIterator = function ()
		{
			return data.map(
					function (elem, colIndex)
					{
						return {
							"name": elem['Id'],
							"index": colIndex + 1,
							"data": function ()
							{
								return null;
							},
							"namedData": function ()
							{
								return null;
							},
							"breaks": [Number(elem['LowerWhisker']), Number(elem['LowerHinge']), Number(elem['Median']),
								Number(elem['UpperHinge']), Number(elem['UpperWhisker'])],
							"outlierBands": [Number(elem['LowerOutMax']), Number(elem['LowerOutMin']),
								Number(elem['UpperOutMin']), Number(elem['UpperOutMax'])],
							"batchValue": getBatchValue(elem['Id'], myBatchData, myBatchType)
						};
					});
		};
		//console.log("tsvDataIteratorWithOutliers finished");

		return iter;
	};

	function passValue(arg, callback)
	{
		setTimeout(function ()
		{
			callback(null, arg);
		}, 250);
	}

	function useDetailDataCallback(theOutlierData, theDetailId, theBaseData, theColor, theMinValue, theMaxValue)
	{
		//console.log("useDetailDataCallback theDetailId = " + theDetailId);
		//console.log("useDetailDataCallback theBaseData");
		//console.log(theBaseData);
		//console.log("useDetailDataCallback theColor = " + theColor);
		//console.log("useDetailDataCallback theMinValue = " + theMinValue);
		//console.log("useDetailDataCallback theMaxValue = " + theMaxValue);
		//console.log("useDetailDataCallback - start");
		// if (null !== theError)
		// {
		// 	alert("error loading data:" + theError)
		// }
		// else
		// {}
		var theOutlierData = theOutlierData.map(function (elem, colIndex)
		{
			return {
				name: elem['id'],
				value: +elem['value']
			};
		});
		//console.log("useDetailDataCallback theOutlierData = " + theOutlierData.length);
		//console.log("useDetailDataCallback call BoxplotDetailed");
		mBoxplotDetailed = new BoxPlotDetailed(mGetDetailedDivCallback());
		//console.log("useDetailDataCallback call BoxplotDetailed render");
		mBoxplotDetailed.render(theOutlierData, theDetailId, theBaseData, theColor,
				mDetailedWidth, mDetailedHeight, theMinValue, theMaxValue,
				mBoxplotOuter.getNfor(theDetailId),
				mBoxplotOuter.getElementHistgramData(theDetailId));
		//console.log("useDetailDataCallback after BoxplotDetailed render");
		//plotIter, batchData, startWidth, startHeight, [titleMain, mbatchVersion],
		//	xAxisLabel, yAxisLabel, legendDiv, updateDatapointLogCallback, getDetailDataCallback, theDetailedWindow);
		//console.log("useDetailDataCallback after BoxplotDetailed render");
	};

	function getDetailDataCallback(theDetailId, theBaseData, theColor, theMinValue, theMaxValue)
	{
		// use empty array for file no longer generated
		useDetailDataCallback([], theDetailId, theBaseData, theColor, theMinValue, theMaxValue);
		// original file name, replace "_BoxData-" with "_CatData-",
		// add a "-" and the "name" from above before the ".tsv" to get detail file
//		var catDataFile = theBoxDataFile;
//		catDataFile = catDataFile.replace("_BoxData-", "_CatData-");
//		catDataFile = catDataFile.replace(".tsv", ("-" + theDetailId + ".tsv"));
//		// returns a promise
//		theGetDataCallback(catDataFile).then(function (data)
//		{
//			//console.log("getDetailDataCallback - theGetDataCallback.then start");
//			useDetailDataCallback(data, theDetailId, theBaseData, theColor, theMinValue, theMaxValue);
//			//console.log("getDetailDataCallback - theGetDataCallback.then end");
//		}, function (theError)
//		{
//			alert("error loading data:" + theError);
//		});
		//console.log("getDetailDataCallback - read " + catDataFile);
	}

	function dataReady2(theData)
	{
		// The following code was error handling when bea_boxplot used d3.tsv to obtain data
		//
		//console.log("dataReady2 started");
		// if (error)
		// {
		//	var msg = 'Error loading chart data';
		//	//console.error(msg + ': ' + error);
		//	alert(msg);
		//	return;
		//	// or some different error handling. . .
		//}

		//var outlierMatrix = data[1];
		var plotData = theData[0];
		//console.log("# plotData " + plotData.length);
		//console.log(plotData[0]);

		var batchData = theData[1];
		//console.log("# batchData " + batchData.length);
		//console.log(batchData[0]);

		var annotationData = theData[2];
		//console.log("# annotationData " + annotationData.length);
		//console.log(annotationData[0]);
		//console.log(annotationData[1]);

		var histogramData = null;
		if (theData.length > 3)
		{
			if (null !== theData[3])
			{
				//console.log("# theData[3] " + theData[3].length);
				histogramData = theData[3];
				for (var i = 0; i < histogramData.length; i++)
				{
					var myData = histogramData[i];
					var keyList = Object.keys(myData);
					for (var j = 1; j < keyList.length; j++)
					{
						var key = keyList[j];
						// convert to numeric - converts in place for established object
						// console.log("---- pree myData[key]=[" + key + "]=" + myData[key]);
						myData[key] = +myData[key];
						// console.log("---- post myData[key]=[" + key + "]=" + myData[key]);
					}
				}
			}
			//console.log("# histogramData " + histogramData.length);
			//console.log(histogramData[0]);
			//console.log(histogramData[1]);
		}
		else
		{
			//console.log("no histogramData provided");
		}

		var batchField = theBatchType;
		//console.log("batchField '" + batchField + "'");

		var titleMain1 = theTitle1;
		var titleMain2 = theTitle2;
		//console.log("theTitle1 " + theTitle1);
		//console.log("theTitle2 " + theTitle2);
		var mbatchVersion = theVersion;
		//console.log("mbatchVersion " + mbatchVersion);
		var xAxisLabel = theXAxisLabel;
		//console.log("xAxisLabel " + xAxisLabel);
		var yAxisLabel = theYAxisLabel;
		//console.log("yAxisLabel " + yAxisLabel);
		var startWidth = theStartWidth;
		//console.log("startWidth " + startWidth);
		var startHeight = theStartHeight;
		//console.log("startHeight " + startHeight);
		var callbackDoneFunction = theFinishedCallback;
		//console.log("callbackDoneFunction");
		var div = thePlotDiv;
		//console.log("div=" + div);
		var legendDiv = theLegendDiv;
		//console.log("legendDiv=" + legendDiv);
		var updateDatapointLogCallback = theUpdateDatapointLogCallback;
		//console.log("updateDatapointLogCallback");

		var plotIter = tsvDataIteratorWithOutliers(plotData, [], batchData, batchField);
		//console.log("plotIter=" + plotIter);
		//console.log("plotIter.seriesIterator()[0]['breaks']=" + plotIter.seriesIterator()[0]['breaks']);
		//console.log("plotIter.seriesIterator()[0]['outlierBands']=" + plotIter.seriesIterator()[0]['outlierBands']);
		//console.log("plotIter.seriesCount()=" + plotIter.seriesCount());
		//console.log("call BoxPlotOuter.Plot");
		mBoxplotOuter = new BoxPlotOuter(div);
		// call setSizes if desired
		// BoxPlotOuter.setSizes
		//console.log("dataReady2 call render");
		mBoxplotOuter.render(plotIter, batchData, annotationData, histogramData,
				startWidth, startHeight, titleMain1, titleMain2 + " " + mbatchVersion,
				xAxisLabel, yAxisLabel, legendDiv, updateDatapointLogCallback, 
				getDetailDataCallback, batchField);
		//console.log("dataReady2 call openFirstDetail");
		mBoxplotOuter.openFirstDetail();
		//console.log("dataReady2 after render and openFirstDetail");
		// TODO:BEV: add back in?
		// $('#Reseter').click (function() {
		//	myPlot.resetScale();
		//});
		//console.log("dataReady2 dataReady2 finished");
		callbackDoneFunction();
	}
	;

	// Gather all the data asynchronously, then feed to dataReady2
	Promise.all([
		theGetDataCallback(theBoxDataFile),
		theGetDataCallback(theBatchDataFile),
		theGetDataCallback(theAnnotationDataFile),
		theGetDataCallback(theHistogramDataFile)
	]).then(function (values)
	{
		// values = [boxdata, batchdata, annotationdata, histdata]
		dataReady2(values);
	}).catch(function (theError)
	{
		console.error("bea_boxplot :: Promise.all data gathering. Propogated Error forward.", theError);
		throw theError;
	});

//	var boxdata = null;
//	var batchdata = null;
//	var annotationdata = null;
//	var histdata = null;
//	var error = null;
//	var startA = 0;
//	var startB = 0;
//	var startC = 0;
//	var startD = 0;
//	var startE = 0;
//
//	function gotHistogramData(data)
//	{
//		startE = performance.now();
//		//alert("times are " + (startB-startA) + " ~ " + (startC-startB) + " ~ " + (startD-startC) + " ~ " + (startE-startD));  
//		histdata = data;
//		//console.log("bea_boxplot.js call ready 2 from histogram");
//		//console.log("bea_boxplot.js histogram data=" + histdata);
//		dataReady2(error, [boxdata, batchdata, annotationdata, histdata]);
//	}
//
//	function gotAnnotationData(data)
//	{
//		startD = performance.now();
//		annotationdata = data;
//		histdata = null;
//		if (null !== theHistogramDataFile)
//		{
//			//console.log("bea_boxplot.js load histogram data");
//			//console.log("bea_boxplot.js theHistogramDataFile=" + theHistogramDataFile);
//			d3.tsv(theHistogramDataFile, gotHistogramData);
//		}
//		else
//		{
//			//alert("times are " + (startB-startA) + " ~ " + (startC-startB) + " ~ " + (startD-startC));  
//			//console.log("bea_boxplot.js call ready 2 from annotation");
//			dataReady2(error, [boxdata, batchdata, annotationdata, histdata]);
//		}
//	}
//
//	function gotBatchData(data)
//	{
//		startC = performance.now();
//		batchdata = data;
//		//console.log("bea_boxplot.js load annotation data");
//		d3.tsv(theAnnotationDataFile, gotAnnotationData);
//	}
//
//	function gotBoxData(data)
//	{
//		startB = performance.now();
//		boxdata = data;
//		//console.log("bea_boxplot.js load batch data");
//		d3.tsv(theBatchDataFile, gotBatchData);
//	}
//
//	//console.log("bea_boxplot.js theBoxDataFile=" + theBoxDataFile);
//	//console.log("bea_boxplot.js theBatchDataFile=" + theBatchDataFile);
//	//console.log("bea_boxplot.js theAnnotationDataFile=" + theAnnotationDataFile);
//	//console.log("bea_boxplot.js theHistogramDataFile=" + theHistogramDataFile);
//
//	try
//	{
//		startA = performance.now();
//		//console.log("bea_boxplot.js load box data");
//		boxdata = d3.tsv(theBoxDataFile, gotBoxData);
//	}
//	catch(thrownError)
//	{
//		error = thrownError;
//		//console.log("bea_boxplot.js error = " + error);
//	}
//	/* 
//	var myQueue = queue()
//		.defer(d3.tsv, theBoxDataFile)
//		.defer(d3.tsv, theBatchDataFile)
//		.defer(d3.tsv, theAnnotationDataFile);
//	if (null !== theHistogramDataFile)
//	{
//		myQueue.defer(d3.tsv, theHistogramDataFile);
//	}
//	myQueue.awaitAll(dataReady2);
//*/
//	/*			This was implemented when calls to queue and the dataReady2 function were in different files
//	 passValue is no longer needed as the function/scope has the values already
//	 Comment left for historical/future purposes
//	 .defer(passValue, theBatchType)
//	 .defer(passValue, theTitle)
//	 .defer(passValue, theVersion)
//	 .defer(passValue, theXAxisLabel)
//	 .defer(passValue, theYAxisLabel)
//	 .defer(passValue, theStartWidth)
//	 .defer(passValue, theStartHeight)
//	 .defer(passValue, theFinishedCallback)
//	 .defer(passValue, thePlotDiv)
//	 .defer(passValue, theLegendDiv)
//	 .defer(passValue, theUpdateDatapointLogCallback)*/
//
	// Next 2 functions could go in a utilities module
	function findCSS(cssName)
	{
		var sheets = window.document.styleSheets;
		for (var cur in sheets)
		{
			if (sheets.hasOwnProperty(cur))
			{
				if ((undefined !== sheets[cur].href) && (null !== sheets[cur].href))
				{
					if (sheets[cur].href.endsWith(cssName))
					{
						return sheets[cur];
					}
				}
			}
		}
		return null;
	}

	function getCssAsText(cssName)
	{
		var result = "";
		var sheet = findCSS(cssName);
		if (sheet !== null)
		{
			var rulesList = sheet.rules;	// a CSSRuleList
			for (var ruleKey in rulesList)
			{
				if (rulesList.hasOwnProperty(ruleKey))
				{
					var rule = rulesList[ruleKey].cssText;
					result += rule + '\n';
				}
			}
		}
		return result;
	}

	// Provides the header necessary for browser to display SVG tags as an image
	function _makeHeader()
	{
		// Package the image itself
		var header = '';
		
		header = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n';
		
//		header = '<?xml version="1.0" standalone="no"?>';
//		header = header + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
//		header = header + '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n';

		// Embedded stylesheet settings
		var rules = getCssAsText('boxplot_styles.css');
		rules = '<![CDATA[\n' + rules + ']]>';
		rules = '<style type="text/css">' + rules + '</style>';
		rules = '<defs>' + rules + '</defs>\n';
		header += rules;

		return header;
	}


	function _makeFooter()
	{
		return '</svg>';			// To match the SVG opening tag in the header
	}

	function _getSVGContent()
	{
		return _makeHeader() + mBoxplotOuter.getSvg().node().parentNode.innerHTML + _makeFooter();
	}

	function _getLegendSVGContent()
	{
		//console.log(mBoxplotOuter.getSvgLegend());
		return _makeHeader() + mBoxplotOuter.getSvgLegend().innerHTML + _makeFooter();
	}

	this.getSVGContent = _getSVGContent;
	this.getLegendSVGContent = _getLegendSVGContent;

	return mThis;
}
