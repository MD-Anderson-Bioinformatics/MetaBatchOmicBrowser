/* global globalDiagramControl */
/* global Promise */
/* global Papa */
/* global jQuery */
/* global d3 */

class UtilBar
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
		this.plot = null;
		this.datapointLog = null; // passed into newBar
		this.iframeBarFunction = this.iframeBar;
	}
	
	// this is a required function, called from within DiagramControl.resize via the body onresize option, to update SVGs
	resize()
	{
		//console.log("UtilBar::resize called");
		var [boxWidth, boxHeight] = this.dimensions(document.getElementById(this.divDiagramId));
		//var minSize = Math.min(boxWidth, boxHeight);
		//console.log("UtilBar width=" + boxWidth + " and height =" + boxHeight + " for " + this.divDiagramId);
		this.plot.resizePlot(Math.floor(boxWidth), Math.floor(boxHeight));
	}
	
	buildLegendData(theBarData, theTitle)
	{
		var dataset = theBarData['dataset'];
		var pvalue = theBarData['negLog10PValue'];
		var cutoff = theBarData['negLog10Cutoff'];
		var batches = theBarData['batchesCalled'];
		//console.log(theBarData);
		var legendData = [];
		legendData[0] = {};
		legendData[0].finder = null;
		legendData[0].color = null;
		legendData[0].legend = theTitle;
		legendData[1] = {};
		legendData[1].finder = "bar-pvalue";
		legendData[1].color = "#0000FF";
		legendData[1].legend = "Negative Log10 P-Value = " + pvalue;
		legendData[2] = {};
		legendData[2].finder = "bar-cutoff";
		legendData[2].color = "#00FF00";
		legendData[2].legend = "Negative Log10 Cutoff = " + cutoff;
		if (notUN(batches))
		{
			legendData[3] = {};
			legendData[3].finder = null;
			legendData[3].color = null;
			legendData[3].legend = "Batches Called = " + batches;
		}
		return(legendData);
	}

	// Create the legend for Hierarhcical Clustering (requires the plot instance).
	// theLegendData label and color
	createBarLegend(theBarObj, theLegendData)
	{
		// create the content containers
		var legend = document.createElement("div");
		var legendContent = document.createElement("div");
		legend.classList.add("plotChild");
		legendContent.id = "barPlotLegend";
		legendContent.classList.add("barPlotLegend");
		legend.append(legendContent);
		return legend;
	}
	
	addDivs(theDiagramDiv, theLegendDiv)
	{
		// already exist in HTML inside iframe
		var plotDiv = theDiagramDiv.querySelector("#BarPlottingDiv");
		var controlDiv = theDiagramDiv.querySelector("#BarControlDiv");
		//
		var legendSubDiv = document.createElement("div");
		legendSubDiv.classList.add("BarLegendDiv");
		legendSubDiv.classList.add("plotChild");
		theLegendDiv.appendChild(legendSubDiv);

		return [plotDiv, controlDiv, legendSubDiv];
	}
	
	populateControlStrip(theControlDiv, theBarPlot)
	{
		// none here -- all done in static index.html
	}
	
	buildBarData(theValues)
	{
		//console.log("buildBarData");
		//console.log(theValues);
		var newObj = {};
		if (theValues.length>0)
		{
			newObj = theValues[0];
		}
		return(newObj);
	}
	
	newBar(theMakeDataPointLog)
	{
		// CALLED FROM VIEW FRAME (NOT BAR IFRAME)
		this.datapointLog = theMakeDataPointLog;
		var diagDivObj = document.getElementById(this.divDiagramId);
		var newIframe = document.createElement("iframe");
		newIframe.setAttribute("id", "BarIFrame");
		newIframe.classList.add("plotChild");
		newIframe.height = "100%";
		newIframe.width = "100%";
		newIframe.src = "GraphAPI/BAR/index.html?v=BEA_VERSION_TIMESTAMP&stamp=" + jQuery.now();
		//console.log(newIframe.src);
		diagDivObj.appendChild(newIframe);
	}
	
	iframeBar(theIframeDiagramDiv, theModelFun, theParam, theConst)
	{
		// CALLED FROM BAR IFRAME
		var self = this;
		var kwdFile = self.newDiagram.kwd_kwddata;
		var batchType = kwdFile.split("/")[3];
		var version = self.indexKO().version;
		var [plotDiv, controlDiv, legendDiv] = self.addDivs(theIframeDiagramDiv, document.getElementById(self.divLegendId));

		Promise.all([
			self.getDataFileCallback(kwdFile)
		]).then(function (values)
		{
			var kwdValues = values[0];
			var bardata = self.buildBarData(kwdValues);
			var dataset = bardata['dataset'];
			// get DATA and TEST version if used
			var splitted = self.newDiagram.kwd_kwddata.split("/");
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
			var pvalue = bardata['negLog10PValue'];
			var cutoff = bardata['negLog10Cutoff'];
			var batches = bardata['batchesCalled'];
			var legendValues = self.buildLegendData(bardata, batchType);
			// BarPlot.BasicModel = function (theTitle, theCutoff, thePvalue, theBatches, theVersion, theLegend)
			var model = theModelFun(title, cutoff, pvalue, batches, version, legendValues);
			var params = theParam;
			params.showDetailFunc = (struct) =>
			{ // showDetailFunc
				theMakeDataPointLog(struct, document.getElementById(self.divDatapaneId));
			};
			self.plot = theConst(model, plotDiv, legendDiv, params);
			//console.log("self.plot");
			//console.log(self.plot);
			// label and color
			var legend = self.createBarLegend(self.plot, legendValues);
			legendDiv.appendChild(legend);
			self.finishedCallback(self, controlDiv, self.plot);
		});
	}
	
	finishedCallback(self, controlDiv, thePlot)
	{
		//console.log("UtilBar::finishedCallback called");
		self.populateControlStrip(controlDiv, thePlot);
		// call through globalDiagramControl in order to trigger other gui events
		// this.resize();
		globalDiagramControl.resize();
	}

	dimensions(theDiagramDiv)
	{
		// TODO:BEV: fix hack: .8 is a magic number - not sure why need to reduce size by 20%
		var bbox = theDiagramDiv.getBoundingClientRect();
		return [
			(0.8 * bbox.width) - 20, // start width
			(0.8 * bbox.height) - 20 // start height
		];
	}

	getDataFileCallback(theTextFile)
	{
		const dataPromise = new Promise((resolve, reject) =>
		{
			// used to not turn entry and Id columns into numbers, when batch "00314" becomes 314
			var myDynamicTyping = function (column)
			{
				var value = true;
				//if (("key" === column) || ("entry" === column) || ("Id" === column))
				//{
				//	value = false;
				//}
				return value;
			};
			// added check for BatchData.tsv file--don't dynamicTyping any of them
			if (null !== theTextFile)
			{
				// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
				this.dataAccess.getDataFile(this.datasetId, theTextFile).then(function (theTextData)
				{
					var myFunc = myDynamicTyping;
					resolve(Papa.parse(theTextData, {delimiter: "\t", dynamicTyping: myFunc, fastMode: true, header: true, skipEmptyLines: true}).data);
				});
			} 
			else
			{
				resolve(null);
			}
		});
		return dataPromise;
	}
}