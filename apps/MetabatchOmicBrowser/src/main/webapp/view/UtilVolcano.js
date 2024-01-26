/* global globalDiagramControl */
/* global Promise */
/* global Papa */
/* global jQuery */
/* global d3 */

class UtilVolcano
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
		this.datapointLog = null; // passed into newVolcano
		this.iframeVolcanoFunction = this.iframeVolcano;
	}
	
	// this is a required function, called from within DiagramControl.resize via the body onresize option, to update SVGs
	resize()
	{
		//console.log("UtilVolcano::resize called");
		var [boxWidth, boxHeight] = this.dimensions(document.getElementById(this.divDiagramId));
		//var minSize = Math.min(boxWidth, boxHeight);
		//console.log("UtilVolcano width=" + boxWidth + " and height =" + boxHeight + " for " + this.divDiagramId);
		this.plot.resizePlot(Math.floor(boxWidth), Math.floor(boxHeight));
	}
	
	buildLegendData(theBatchType, theBatchName, theFoldchangecut, theTranspvaluecut)
	{
		//console.log(theVolcanoData);
		var legendData = [];
		legendData[0] = {};
		legendData[0].finder = null;
		legendData[0].color = null;
		legendData[0].legend = theBatchType + " - " + theBatchName;
		legendData[1] = {};
		legendData[1].finder = "bar-pvalue";
		legendData[1].color = "#005500";
		legendData[1].legend = "Negative Log10 P-Value Cutoff = " + theTranspvaluecut.toFixed(4);
		legendData[2] = {};
		legendData[2].finder = "bar-cutoff";
		legendData[2].color = "#00FF00";
		legendData[2].legend = "Log2 Fold Change Cutoff = " + theFoldchangecut.toFixed(4);
		legendData[3] = {};
		legendData[3].finder = "up-sig";
		legendData[3].color = "#ff3300";
		legendData[3].legend = "Upregulated and Significant";
		legendData[4] = {};
		legendData[4].finder = "down-sig";
		legendData[4].color = "#0066ff";
		legendData[4].legend = "Downregulated and Significant";
		legendData[5] = {};
		legendData[5].finder = "sig-only";
		legendData[5].color = "#9900FF";
		legendData[5].legend = "Significant-Only";
		legendData[6] = {};
		legendData[6].finder = "standard";
		legendData[6].color = "#cccccc";
		legendData[6].legend = "Standard";
			
		return(legendData);
	}

	// Create the legend for Hierarhcical Clustering (requires the plot instance).
	// theLegendData label and color
	createVolcanoLegend(theVolcanoObj, theLegendData)
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
		var plotDiv = theDiagramDiv.querySelector("#VolcanoPlottingDiv");
		var controlDiv = theDiagramDiv.querySelector("#VolcanoControlDiv");
		//
		var legendSubDiv = document.createElement("div");
		legendSubDiv.classList.add("VolcanoLegendDiv");
		legendSubDiv.classList.add("plotChild");
		theLegendDiv.appendChild(legendSubDiv);

		return [plotDiv, controlDiv, legendSubDiv];
	}
	
	populateControlStrip(theControlDiv, theVolcanoPlot)
	{
		// none here -- all done in static index.html
	}
	
	buildVolcanoData(theValues)
	{
		//console.log("buildVolcanoData");
		//console.log(theValues);
		var newObj = {};
		if (theValues.length>0)
		{
			newObj = theValues[0];
		}
		return(newObj);
	}
	
	newVolcano(theMakeDataPointLog)
	{
		// CALLED FROM VIEW FRAME (NOT BAR IFRAME)
		this.datapointLog = theMakeDataPointLog;
		var diagDivObj = document.getElementById(this.divDiagramId);
		var newIframe = document.createElement("iframe");
		newIframe.setAttribute("id", "VolcanoIFrame");
		newIframe.classList.add("plotChild");
		newIframe.height = "100%";
		newIframe.width = "100%";
		newIframe.src = "GraphAPI/VOL/index.html?v=BEA_VERSION_TIMESTAMP&stamp=" + jQuery.now();
		//console.log(newIframe.src);
		diagDivObj.appendChild(newIframe);
	}
	
	iframeVolcano(theIframeDiagramDiv, theModelFun, theParam, theConst)
	{
		// CALLED FROM BAR IFRAME
		var self = this;
		var volFile = self.newDiagram.volcano_data;
		var version = self.indexKO().version;
		var [plotDiv, controlDiv, legendDiv] = self.addDivs(theIframeDiagramDiv, document.getElementById(self.divLegendId));

		Promise.all([
			self.getDataFileCallback(volFile)
		]).then(function (values)
		{
			// var volValues = values[0];
			var voldata = self.buildVolcanoData(values);
			// get DATA and TEST version if used
			var splitted = volFile.split("/");
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
						+ ((""!==self.indexKO().details)?(" / " + this.indexKO().details):"")
						+ ((""!==dataVersion)?(" / " + dataVersion):"")
						+ ((""!==testVersion)?(" / " + testVersion):"")
						+ " / " + self.newDiagram.batch_type + " - " + self.newDiagram.batch_id;
			}
			var fold_change_list = voldata.values.map((line) => line.fold_change);
			var foldchangecut = Math.log2(2.0);
			var trans_pvalue_list = voldata.values.map((line) => line.trans_pvalue);
			var transpvaluecut = -Math.log2(0.05);
			// var maxFoldchange = fold_change_list.reduce((a, b) => Math.max(a, b), 0);
			// var minFoldchange = fold_change_list.reduce((a, b) => Math.min(a, b), 0);
			// var maxTranspvalue = trans_pvalue_list.reduce((a, b) => Math.max(a, b), 0);
			// var minTranspvalue = trans_pvalue_list.reduce((a, b) => Math.min(a, b), 0);
			var feature_list = voldata.values.map((line) => line.feature);
			var legendValues = self.buildLegendData(voldata.batch_type, voldata.batch_name,
													foldchangecut, transpvaluecut);
			// VolcanoPlot.BasicModel = function (theTitle, theCutoff, thePvalue, theBatches, theVersion, theLegend)
			var model = theModelFun(title, foldchangecut, transpvaluecut,
									fold_change_list, trans_pvalue_list, feature_list, 
									version, legendValues);
			var params = theParam;
			params.showDetailFunc = (struct) =>
			{ // showDetailFunc
				theMakeDataPointLog(struct, document.getElementById(self.divDatapaneId));
			};
			self.plot = theConst(model, plotDiv, legendDiv, params);
			//console.log("self.plot");
			//console.log(self.plot);
			// label and color
			var legend = self.createVolcanoLegend(self.plot, legendValues);
			legendDiv.appendChild(legend);
			self.finishedCallback(self, controlDiv, self.plot);
		});
	}
	
	finishedCallback(self, controlDiv, thePlot)
	{
		//console.log("UtilVolcano::finishedCallback called");
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
					if (theTextFile.endsWith("json"))
					{
						resolve(JSON.parse(theTextData));
					}
					else
					{
						var myFunc = myDynamicTyping;
						resolve(Papa.parse(theTextData, {delimiter: "\t", dynamicTyping: myFunc, fastMode: true, header: true, skipEmptyLines: true}).data);
					}
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