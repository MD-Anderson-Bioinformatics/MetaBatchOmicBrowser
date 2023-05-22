/* global globalDiagramControl */
/* global Promise */
/* global Papa */
/* global jQuery */
/* global d3 */

class UtilVenn
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
		this.datapointLog = null; // passed into newVenn
		this.iframeVennFunction = this.iframeVenn;
	};
	
	// this is a required function, called from within DiagramControl.resize via the body onresize option, to update SVGs
	resize()
	{
		//console.log("UtilVenn::resize called");
		var [boxWidth, boxHeight] = this.dimensions(document.getElementById(this.divDiagramId));
		//var minSize = Math.min(boxWidth, boxHeight);
		//console.log("UtilVenn width=" + boxWidth + " and height =" + boxHeight + " for " + this.divDiagramId);
		this.plot.resizePlot(Math.floor(boxWidth), Math.floor(boxHeight));
	};
	
	buildLegendData(theValString)
	{
		var vennOjb = JSON.parse(theValString);
		for (var i = 0; i < vennOjb.length; i++)
		{
			var set = vennOjb[i];
			if (set.sets.length>1)
			{
				set.color = "NA";
			}
			set.finder = "SET";
			for (var val in set.sets)
			{
				set.finder = set.finder + "_" + set.sets[val];
			}
		}
		return(vennOjb);
	}
	
	// Create the legend for Hierarhcical Clustering (requires the plot instance).
	// theLegendData label and color
	createVennLegend(theVennObj, theLegendData)
	{
		// create the content containers
		var legend = document.createElement("div");
		var legendContent = document.createElement("div");
		legend.classList.add("plotChild");
		legendContent.id = "vennPlotLegend";
		legendContent.classList.add("vennPlotLegend");
		legend.append(legendContent);
		return legend;
	};
   
	addDivs(theDiagramDiv, theLegendDiv)
	{
		// already exist in HTML inside iframe
		var plotDiv = theDiagramDiv.querySelector("#VennPlottingDiv");
		var controlDiv = theDiagramDiv.querySelector("#VennControlDiv");
		//
		var legendSubDiv = document.createElement("div");
		legendSubDiv.classList.add("VennLegendDiv");
		legendSubDiv.classList.add("plotChild");
		theLegendDiv.appendChild(legendSubDiv);

		return [plotDiv, controlDiv, legendSubDiv];
	};
	
	populateControlStrip(theControlDiv, theVennPlot)
	{
		// none here -- all done in static index.html
	};
	
	buildVennDataWithZeros(theValues)
	{
		//console.log("buildVennData");
		var vennObj = JSON.parse(theValues);
		var newObj = [];
		for (var i = 0; i < vennObj.length; i++)
		{
			var set = vennObj[i];
			set.popup = set.label;
			//if (set.sets.length>1)
			//{
			//	delete set.label;
			//}
			set.finder = "SET";
			for (var val in set.sets)
			{
				set.finder = set.finder + "_" + set.sets[val];
			}
			let bt = set.legend.split(":").length;
			set.size = 1 / bt;
			newObj.push(set);
		}
		return(newObj);
	};
	
	buildVennDataNoZeros(theValues)
	{
		//console.log("buildVennData");
		var vennObj = JSON.parse(theValues);
		var newObj = [];
		for (var i = 0; i < vennObj.length; i++)
		{
			var set = vennObj[i];
			set.popup = set.label;
			//if (set.sets.length>1)
			//{
			//	delete set.label;
			//}
			set.finder = "SET";
			for (var val in set.sets)
			{
				set.finder = set.finder + "_" + set.sets[val];
			}
			// override size of 0
			// so that plotting works for 0% intersections
			// override size of 0 for base Batch Types
			if ((0===set.size)&&(1===set.sets.length))
			{
				set.size = 0.75;
			}
			if (set.size>0)
			{
				let bt = set.legend.split(":").length;
				set.size = 1 / bt;
				newObj.push(set);
			}
		}
		return(newObj);
	};
	
	buildEulerData(theValues)
	{
		//console.log("buildVennData");
		var vennObj = JSON.parse(theValues);
		var newObj = [];
		for (var i = 0; i < vennObj.length; i++)
		{
			var set = vennObj[i];
			set.popup = set.label;
			//if (set.sets.length>1)
			//{
			//	delete set.label;
			//}
			set.finder = "SET";
			for (var val in set.sets)
			{
				set.finder = set.finder + "_" + set.sets[val];
			}
			// override size of 0 for base Batch Types
			// so that plotting works for 0% intersections
			if ((0===set.size)&&(1===set.sets.length))
			{
				set.size = 0.75;
			}
			if (set.size>0)
			{
				newObj.push(set);
			}
		}
		return(newObj);
	};
	
	buildVersion(thePlotValues)
	{
		//console.log("buildVersion");
		var myVersion = "unknown";
		for(var myIndex in thePlotValues)
		{
			var key = thePlotValues[myIndex].key;
			if ("version"===key)
			{
				myVersion = thePlotValues[myIndex].value;
			}
		}
		return(myVersion);
	};
	
	buildBatches(thePlotValues)
	{
		//console.log("buildBatches");
		var myLabels = [];
		for(var myIndex in thePlotValues)
		{
			var key = thePlotValues[myIndex].key;
			if ("labels"===key)
			{
				var tmpL = thePlotValues[myIndex].value;
				myLabels = tmpL.split("==|==");
			}
		}
		return(myLabels);
	};

	newVenn(theMakeDataPointLog)
	{
		// CALLED FROM VIEW FRAME (NOT VENN IFRAME)
		this.datapointLog = theMakeDataPointLog;
		var diagDivObj = document.getElementById(this.divDiagramId);
		var newIframe = document.createElement("iframe");
		newIframe.setAttribute("id","VennIFrame");
		newIframe.classList.add("plotChild");
		newIframe.height = "100%";
		newIframe.width = "100%";
		newIframe.src = "GraphAPI/VED/index.html?v=BEA_VERSION_TIMESTAMP&stamp=" + jQuery.now();
		//console.log(newIframe.src);
		diagDivObj.appendChild(newIframe);
	};

	iframeVenn(theIframeDiagramDiv, theModelFun, theParam, theConst)
	{
		// CALLED FROM VENN IFRAME
		var self = this;
		// "venn_data": "/MANOVA/VENN.json"
		var vennFile = self.newDiagram.venn_data;
		var manovaFile = self.newDiagram.manova_data;
		// title from index
		var title = self.indexKO().source
					+ "/" + self.indexKO().program
					+ "/" + self.indexKO().project
					+ "/" + self.indexKO().category
					+ "/" + self.indexKO().platform
					+ "/" + self.indexKO().data
					+ ((""!==self.indexKO().details)?("/" + this.indexKO().details):"")
					+ ((""!==self.indexKO().data_version)?("/" + this.indexKO().data_version):"")
					+ ((""!==self.indexKO().test_version)?("/" + this.indexKO().test_version):"");
		var [plotDiv, controlDiv, legendDiv ] = self.addDivs(theIframeDiagramDiv, document.getElementById(self.divLegendId));

		Promise.all([
			self.getDataFileCallback(vennFile),
			self.getDataFileCallback(manovaFile)
		]).then(function (values)
		{
			var vennValues = values[0];
			var manovaValues = values[1];

			var venndata = self.buildEulerData(vennValues);
			var venndataWithZero = self.buildVennDataWithZeros(vennValues);
			var venndataNoZero = self.buildVennDataNoZeros(vennValues);
			var version = self.buildVersion(manovaValues);
			var batches = self.buildBatches(manovaValues);
			var legendValues = self.buildLegendData(vennValues);
			var model = theModelFun(title, venndata, version, batches, legendValues, venndataWithZero, venndataNoZero);
			var params = theParam;
			params.showDetailFunc = (struct) =>
			{ // showDetailFunc
				theMakeDataPointLog(struct, document.getElementById(self.divDatapaneId));
			};
			self.plot = theConst(model, plotDiv, legendDiv, params);
			//console.log("self.plot");
			//console.log(self.plot);
			// label and color
			var legend = self.createVennLegend(self.plot, legendValues);
			legendDiv.appendChild(legend);
			self.finishedCallback(self, controlDiv, self.plot);
		});
	};

	finishedCallback(self, controlDiv, thePlot)
	{
		//console.log("UtilVenn::finishedCallback called");
		self.populateControlStrip(controlDiv, thePlot);
		// call through globalDiagramControl in order to trigger other gui events
		// this.resize();
		globalDiagramControl.resize();
	};

	dimensions(theDiagramDiv)
	{
		// TODO:BEV: fix hack: .8 is a magic number - not sure why need to reduce size by 20%
		var bbox = theDiagramDiv.getBoundingClientRect();
		return [
			(0.8 * bbox.width) - 20, // start width
			(0.8 * bbox.height) - 20 // start height
		];
	};
	
	getDataFileCallback(theTextFile)
	{
		const dataPromise = new Promise((resolve, reject) =>
		{
			// used to not turn entry and Id columns into numbers, when batch "00314" becomes 314
			var myDynamicTyping = function(column)
			{
				var value = true;
				if (("key"===column)||("entry"===column)||("Id"===column))
				{
					value = false;
				}
				return value;
			};
			// added check for BatchData.tsv file--don't dynamicTyping any of them
			if (null!==theTextFile)
			{
				// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
				this.dataAccess.getDataFile(this.datasetId, theTextFile).then(function (theTextData)
				{
					if (theTextFile.endsWith("json"))
					{
						resolve(theTextData);
					}
					else
					{
						var myFunc = myDynamicTyping;
						if (theTextFile.endsWith("BatchData.tsv"))
						{
							myFunc = false;
						}
						resolve(Papa.parse(theTextData, { delimiter: "\t", dynamicTyping: myFunc, fastMode: true, header: true, skipEmptyLines: true }).data);
					}
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