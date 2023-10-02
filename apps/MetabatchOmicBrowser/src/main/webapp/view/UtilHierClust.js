/* global globalDiagramControl */
/* global Promise */
/* global HierClustPlot */
/* global Papa */

class UtilHierClust
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
	};
	
	// this is a required function, called from within DiagramControl.resize via the body onresize option, to update SVGs
	resize()
	{
		//console.log("UtilHierClust::resize called");
		var [boxWidth, boxHeight] = this.dimensions(document.getElementById(this.divDiagramId));
		//var minSize = Math.min(boxWidth, boxHeight);
		//console.log("UtilHierClust width=" + boxWidth + " and height =" + boxHeight + " for " + this.divDiagramId);
		this.plot.resizePlot(Math.floor(boxWidth), Math.floor(boxHeight));
	};
	
	// Create the legend for Hierarhcical Clustering (requires the plot instance).
	createHierClustLegend(hierClustObj)
	{
		// create the content containers
		var legend = document.createElement("div");
		var legendDropdown = document.createElement("div");
		var dropdown = document.createElement("select");
		var legendDivider = document.createElement("div");
		var legendContent = document.createElement("div");
		legend.classList.add("plotChild");
		legendDropdown.classList.add("hierClustPlotDropdown");
		dropdown.id = "hierClustPlotSelect";
		dropdown.classList.add("hierClustPlotSelect");
		legendDivider.classList.add("legendSplitter");
		legendContent.id = "hierClustPlotLegend";
		legendContent.classList.add("hierClustPlotLegend");

		// populate options for legend dropdown
		var groups = hierClustObj.getGroupVariables();
		for (var i = 0; i < groups.length; i++) 
		{
			var option = document.createElement("option");
			option.value = groups[i];
			option.text = groups[i];
			dropdown.add(option);
		}

		// assign the event listener for dropdown change
		dropdown.addEventListener("change", (e) => 
		{
			legendContent.innerHTML = "";
			hierClustObj.makeLegend(e.target.value, legendContent);
		}, false);

		// assemble the HTML elements
		legendDropdown.appendChild(dropdown);
		legend.append(legendDropdown);
		legend.append(legendDivider);
		legend.append(legendContent);

		// make the first legend
		hierClustObj.makeLegend(groups[0], legendContent);

		return legend;
	};

	addDivs(theDiagramDiv, theLegendDiv)
	{
		// make a column flex container for stack the plot and control strips
		var columnDiv = document.createElement("div");
		columnDiv.classList.add("columnDiv");
		columnDiv.classList.add("plotChild");
		theDiagramDiv.appendChild(columnDiv);
		
		var plotDiv = document.createElement("div");
		plotDiv.classList.add("HcPlottingDiv");
		plotDiv.classList.add("plotAboveStrip");
		plotDiv.classList.add("plotChild");
		columnDiv.appendChild(plotDiv);
		//
		var controlDiv = document.createElement("div");
		controlDiv.classList.add("HcControlDiv");
		controlDiv.classList.add("controlStrip");
		controlDiv.classList.add("plotChild");
		columnDiv.appendChild(controlDiv);
		//
		var legendSubDiv = document.createElement("div");
		legendSubDiv.classList.add("HcLegendDiv");
		legendSubDiv.classList.add("plotChild");
		theLegendDiv.appendChild(legendSubDiv);

		return [plotDiv, controlDiv, legendSubDiv];
	};
	
	populateControlStrip(theControlDiv, theHierClustPlot)
	{
		/////////////////////////////
		//// add reset zoom button
		/////////////////////////////
		var resetZoom = document.createElement("span");
		resetZoom.id = "HcResetZoomButton";
		resetZoom.classList.add("plotChild");
		resetZoom.classList.add("controlButton");
		// build icon
		var iconZoom = document.createElement("span");
		iconZoom.classList.add("plotChild");
		iconZoom.classList.add("fa-stack");
		iconZoom.classList.add("fa-lg");
		iconZoom.classList.add("controlButtonIcon");
		resetZoom.appendChild(iconZoom);
		var boxIcon = document.createElement("i");
		boxIcon.classList.add("plotChild");
		boxIcon.classList.add("fas");
		boxIcon.classList.add("fa-square");
		boxIcon.classList.add("fa-stack-1x");
		boxIcon.classList.add("controlButtonIcon");
		boxIcon.style.color = "#ffcc99";
		iconZoom.appendChild(boxIcon);
		var borderIcon = document.createElement("i");
		borderIcon.classList.add("plotChild");
		borderIcon.classList.add("fas");
		borderIcon.classList.add("fa-border-all");
		borderIcon.classList.add("fa-stack-1x");
		borderIcon.classList.add("controlButtonIcon");
		borderIcon.style.color = "#1a0d00";
		iconZoom.appendChild(borderIcon);
		var expandIcon = document.createElement("i");
		expandIcon.classList.add("plotChild");
		expandIcon.classList.add("fas");
		expandIcon.classList.add("fa-expand");
		expandIcon.classList.add("fa-stack-1x");
		expandIcon.classList.add("controlButtonIcon");
		expandIcon.style.color = "#994d00";
		iconZoom.appendChild(expandIcon);
		// icon label
		var selectTitle = document.createElement("span");
		selectTitle.classList.add("plotChild");
		selectTitle.classList.add("controlButtonLabel");
		selectTitle.innerText = "Reset Zoom";
		resetZoom.appendChild(selectTitle);
		theControlDiv.appendChild(resetZoom);
		$('#HcResetZoomButton').on('click', function(event, ui) { theHierClustPlot.resetScale(); });
		
		/////////////////////////////
		//// add toggle tooltips
		/////////////////////////////
		var toggleTooltipsButton = document.createElement("span");
		toggleTooltipsButton.id = "HierClustToggleTooltipsButton";
		toggleTooltipsButton.classList.add("plotChild");
		toggleTooltipsButton.classList.add("controlButton");
		// build icon
		var iconQuestion = document.createElement("span");
		iconQuestion.classList.add("plotChild");
		iconQuestion.classList.add("far");
		iconQuestion.classList.add("fa-question-circle");
		iconQuestion.classList.add("controlButtonIcon");
		var val = this.getTooltipFlag(theHierClustPlot);
		if(true===val)
		{
			iconQuestion.style.color = "green";
		}
		else
		{
			iconQuestion.style.color = "red";
		}
		toggleTooltipsButton.appendChild(iconQuestion);
		// icon label
		var toggleTitle = document.createElement("span");
		toggleTitle.classList.add("plotChild");
		toggleTitle.classList.add("controlButtonLabel");
		toggleTitle.innerText = "Toggle Tooltips";
		toggleTooltipsButton.appendChild(toggleTitle);
		theControlDiv.appendChild(toggleTooltipsButton);
		var utilHCThis = this;
		$('#HierClustToggleTooltipsButton').on('click', function(event, ui) { utilHCThis.toggleTooltips(theHierClustPlot, iconQuestion); });
	};
	
	newHierClust(theMakeDataPointLog)
	{
		var self = this;
		// BatchData.tsv 
		var batchFile = self.newDiagram.batch_data;
		// "hc_order": "/HierarchicalClustering/HCOrder.tsv"
		var orderFile = self.newDiagram.hc_order;
		// "hc_data": "/HierarchicalClustering/HCData.tsv",
		var plotFile = self.newDiagram.hc_data;
		// get DATA and TEST version if used
		var batchType = batchFile.split("/")[3];
		var splitted = plotFile.split("/");
		var dataVersion = "";
		var testVersion = "";
		if (splitted.length>4)
		{
			dataVersion = splitted[3];
			if (splitted.length>5)
			{
				testVersion = splitted[4];
			}
		}
		// title from index
		var title = self.newDiagram.title;
		if ("" === title)
		{
			title = self.indexKO().source
					+ " / " + self.indexKO().program
					+ " / " + self.indexKO().project
					+ " / " + self.indexKO().category
					+ " / " + self.indexKO().platform
					+ " / " + self.indexKO().data
					+ ((""!==self.indexKO().details)?(" / " + this.indexKO().details):"")
					+ ((""!==dataVersion)?(" / " + dataVersion):"")
					+ ((""!==testVersion)?(" / " + testVersion):"");
		}
		var [plotDiv, controlDiv, legendDiv] = self.addDivs(document.getElementById(self.divDiagramId), document.getElementById(self.divLegendId));

		//console.log("newHierClust plotFile=" + plotFile);
		//console.log("newHierClust batchFile=" + batchFile);
		//console.log("newHierClust orderFile=" + orderFile);
		Promise.all([
			self.getDataFileCallback(plotFile),
			self.getDataFileCallback(batchFile),
			self.getDataFileCallback(orderFile)
		]).then(function (values)
		{
			var plotValues = values[0];
			var BatchData = values[1];
			var orderValues = values[2];

			var model = HierClustPlot.BasicModel(BatchData, plotValues, orderValues);
			var params = HierClustPlot.DefaultParams();
			params.plotTitle = title;
			params.plotAnnotation = "annotation";
			params.showDetailFunc = (struct) =>
			{ // showDetailFunc
				theMakeDataPointLog(struct, document.getElementById(self.divDatapaneId));
			};
			self.plot = HierClustPlot(model, plotDiv, params);
			//console.log("self.plot");
			//console.log(self.plot);
			var legend = self.createHierClustLegend(self.plot);
			legendDiv.appendChild(legend);
			self.finishedCallback(self, controlDiv, self.plot);
		});
	};

	finishedCallback(self, controlDiv, thePlot)
	{
		//console.log("UtilHierClust::finishedCallback called");
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
				if (("entry"===column)||("Id"===column))
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
					var myFunc = myDynamicTyping;
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


	getTooltipFlag(thePlot)
	{
		var result = null;
		if (thePlot.plotOptions)
		{
			var options = thePlot.plotOptions();
			result = options["showTooltip"];
		}
		return result;
	}

	toggleTooltips(thePlot, theIcon)
	{
		if (thePlot.plotOptions)
		{
			var options = thePlot.plotOptions();
			options["showTooltip"] = !options["showTooltip"];
			var val = options["showTooltip"];
			if(true===val)
			{
				theIcon.style.color = "green";
			}
			else
			{
				theIcon.style.color = "red";
			}
			thePlot.plotOptions(options);
		}
	}
}