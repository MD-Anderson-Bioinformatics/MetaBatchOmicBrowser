/* global Papa, globalDiagramControl */

class UtilBoxplot
{
	constructor(theDataAccess, theDiagramId, theLegendId, theDatapaneId, theNewDiagram, theIndexKO, theDatasetId)
	{
		this.dataAccess = theDataAccess;
		this.divDiagramId = theDiagramId;
		this.divLegendId = theLegendId;
		this.divDatapaneId = theDatapaneId;
		this.newDiagram = theNewDiagram;
		this.indexKO = theIndexKO;
		this.datasetId = theDatasetId;
	};
	
	// this is a required function, called from within DiagramControl.resize via the body onresize option, to update SVGs
	resize()
	{
		//console.log("UtilBoxplot::resize called");
		var [boxWidth, boxHeight, detailedWidth, detailedHeight] = this.dimensions(document.getElementById(this.divDiagramId));
		//console.log("UtilBoxplot width=" + boxWidth + " and height =" + boxHeight + " for main boxplot");
		//console.log("UtilBoxplot width=" + detailedWidth + " and height =" + detailedHeight + " for detailed boxplot");
		this.plot.resizePlot(boxWidth, boxHeight, detailedWidth, detailedHeight);
	};
	
	newBoxplot(theMakeDataPointLog)
	{
		var self = this;
		// BatchData.tsv 
		var batchFile = self.newDiagram.batch_data;
		// "entry_label": "ShipDate", -- batch type being viewed
		var batchType = self.newDiagram.entry_label;
		// batchType decodeURIComponent("%c2%b1")
		// "box_annotations": "/BoxPlot/AllSample-Data/BoxPlot_AllSample-Data_Annotations-ShipDate.tsv",
		var annotationFile = self.newDiagram.box_annotations;
		// "box_data": "/BoxPlot/AllSample-Data/BoxPlot_AllSample-Data_BoxData-ShipDate.tsv",
		var boxFile = self.newDiagram.box_data;
		// "box_histogram": "/BoxPlot/AllSample-Data/BoxPlot_AllSample-Data_Histogram-ShipDate.tsv"
		var histogramFile = self.newDiagram.box_histogram;
		// get DATA and TEST version if used
		var splitted = batchFile.split("/");
		var dataVersion = "";
		var testVersion = "";
		if (splitted.length>5)
		{
			dataVersion = splitted[4];
			if (splitted.length>6)
			{
				testVersion = splitted[5];
			}
		}
		// title from index
		var title = self.newDiagram.title;
		if (("" === title)||(!notUN(title)))
		{
			title = self.indexKO().source
					+ " / " + self.indexKO().program
					+ " / " + self.indexKO().project
					+ " / " + self.indexKO().category
					+ " / " + self.indexKO().platform
					+ " / " + self.indexKO().data
					+ ((""!==self.indexKO().details)?(" / " + self.indexKO().details):"")
					+ ((""!==dataVersion)?(" / " + dataVersion):"")
					+ ((""!==testVersion)?(" / " + testVersion):"")
					+ " / " + batchType;
		}
		var [plotDiv, plotDetailedDiv, legendDiv] = self.addDivs(document.getElementById(self.divDiagramId), document.getElementById(self.divLegendId));
		var [boxWidth,
			boxHeight,
			detailedWidth,
			detailedHeight] = self.dimensions(document.getElementById(self.divDiagramId));
		//console.log("newBoxplot boxWidth=" + boxWidth);
		//console.log("newBoxplot boxHeight=" + boxHeight);
		//console.log("newBoxplot detailedWidth=" + detailedWidth);
		//console.log("newBoxplot detailedHeight=" + detailedHeight);
		//console.log("newBoxplot boxFile=" + boxFile);
		//console.log("newBoxplot batchFile=" + batchFile);
		//console.log("newBoxplot annotationFile=" + annotationFile);
		//console.log("newBoxplot histogramFile=" + histogramFile);
		this.plot = new BeaBoxplot(
				boxFile, // theBoxDataFile
				batchFile, // theBatchDataFile
				annotationFile, // theAnnotationDataFile
				histogramFile, // theHistogramDataFile
				batchType, // theBatchType
				title, // theTitle1
				"", // theTitle2
				"", // theVersion
				batchType, // theXAxisLabel
				"values", // theYAxisLabel
				boxWidth, // theStartWidth
				boxHeight, // theStartHeight
				function ()
				{
					self.finishedCallback();
				}, // theFinishedCallback
				plotDiv, // thePlotDiv
				legendDiv, // theLegendDiv
				(struct) => 
				{
					theMakeDataPointLog(struct, document.getElementById(self.divDatapaneId));
				}, // theUpdateDatapointLogCallback
				function ()
				{
					return plotDetailedDiv;
				}, // theGetDetailedDivCallback
				detailedWidth, // theDetailedWidth
				detailedHeight, // theDetailedHeight
				function(theFile)
				{
					return self.getDataFileCallback(theFile); // theGetDataCallback
				});
	};

	finishedCallback()
	{
		//console.log("UtilBoxplot::finishedCallback called");
		//console.log("diagram_boxplot.js - finishedCallback");
		// call through globalDiagramControl in order to trigger other gui events
		// this.resize();
		globalDiagramControl.resize();
	};

	addDivs(theDiagramDiv, theLegendDiv)
	{
		var plotDiv = document.createElement("div");
		plotDiv.classList.add("BoxplotPlottingDiv");
		plotDiv.classList.add("plotChild");
		theDiagramDiv.appendChild(plotDiv);
		//
		var plotDetailedDiv = document.createElement("div");
		plotDetailedDiv.classList.add("BoxplotDetailedDiv");
		plotDetailedDiv.classList.add("plotChild");
		theDiagramDiv.appendChild(plotDetailedDiv);
		//
		var legendSubDiv = document.createElement("div");
		legendSubDiv.classList.add("BoxplotLegendDiv");
		legendSubDiv.classList.add("plotChild");
		theLegendDiv.appendChild(legendSubDiv);

		return [plotDiv, plotDetailedDiv, legendSubDiv];
	};

	dimensions(theDiagramDiv)
	{
		var bbox = theDiagramDiv.getBoundingClientRect();
		//console.log("UtilBoxplot::dimensions");
		//console.log(bbox);
		// TODO:BEV: remove magic numbers
		var bw = (bbox.width - 20);
		var bh = (bbox.height - 20);
		if (bw<500)
		{
			bw = 500;
		}
		if (bh<500)
		{
			bh = 500;
		}
		return [
			0.675 * bw, // start width
			1.0 * bh,	// start height
			0.275 * bw, // start detailed width
			0.9 * bh	// start detailed height
		];
	};
	
	getDataFileCallback(theTextFile)
	{
		//console.log("UtilBoxplot::getDataFileCallback theTextFile='" + theTextFile + "'");
		const dataPromise = new Promise((resolve, reject) =>
		{
			// used to not turn entry and Id columns into numbers, when batch "00314" becomes 314
			var myDynamicTyping = function(column)
			{
				var value = true;
				// added check for BatchData.tsv file--don't dynamicTyping any of them
				if (("entry"===column)||("Id"===column))
				{
					value = false;
				}
				return value;
			};
			if (notUN(theTextFile))
			{
				//getDataFile(theRequestedId, theTextFile, theProcessCallback)
				// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
				this.dataAccess.getDataFile(this.datasetId, theTextFile).then(function (theTextData)
				{
					//console.log("getDataFile");
					//console.log(theTextData);
					var myFunc = true;
					if (theTextFile.endsWith("BatchData.tsv"))
					{
						myFunc = false;
					}
					resolve(Papa.parse(theTextData, { delimiter: "\t", dynamicTyping: myFunc, fastMode: true, header: true, skipEmptyLines: true }).data);
				});
			}
			else
			{
				resolve(null);
			}
		});
		return dataPromise;
	};
}