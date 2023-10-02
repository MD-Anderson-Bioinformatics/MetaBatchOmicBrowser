/* global globalDiagramControl, Papa, Promise, PcaPlot */

class UtilPca
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
		//console.log("UtilPca::resize called");
		var [boxWidth, boxHeight] = this.dimensions(document.getElementById(this.divDiagramId));
		//console.log("UtilPca width=" + boxWidth + " and height =" + boxHeight + " for " + this.divDiagramId);
		this.plot.resizePlot(boxWidth, boxHeight);
	};
	
	populateAxisDropdown(theControlDiv, theAxisLabel, theSelectedIndex, theAxisId)
	{
		//var dimensions = this.plot.getDimensions();
		var dimensions = this.plot.getGraphVariables();
		var selectDiv = document.createElement("span");
		selectDiv.classList.add("plotChild");
		selectDiv.classList.add("controlSelect");
		var selectTitle = document.createElement("span");
		selectTitle.classList.add("plotChild");
		selectTitle.classList.add("controlSelectLabel");
		selectTitle.innerText = theAxisLabel;
		var selectElement = document.createElement("select");
		selectElement.id = theAxisId;
		selectElement.classList.add("plotChild");
		selectElement.classList.add("controlSelectWidget");
		for (var i=0; i<dimensions.length; i++)
		{
			var option = document.createElement("option");
			option.classList.add("plotChild");
			option.value = dimensions[i];
			option.text = dimensions[i];
			selectElement.append(option); 
		}
		selectDiv.appendChild(selectTitle);
		selectDiv.appendChild(selectElement);
		theControlDiv.appendChild(selectDiv);
		selectElement.options[theSelectedIndex].selected = true;
//		$( "#" + theAxisId )
//				.selectmenu({ width : 'auto', height: '15px', padding: 0, font-size: '8px' })
//				.addClass("plotChild");
		return selectElement;
	};
	
	populateControlStrip(theControlDiv, thePcaPlot)
	{
		/////////////////////////////
		//// add reset zoom button
		/////////////////////////////
		var resetZoom = document.createElement("span");
		resetZoom.id = "PcaResetZoomButton";
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
		$('#PcaResetZoomButton').on('click', function(event, ui) { thePcaPlot.resetScale(); });
		/////////////////////////////
		//// add toggle tooltips
		/////////////////////////////
		var toggleTooltipsButton = document.createElement("span");
		toggleTooltipsButton.id = "PcaToggleTooltipsButton";
		toggleTooltipsButton.classList.add("plotChild");
		toggleTooltipsButton.classList.add("controlButton");
		// build icon
		var iconQuestion = document.createElement("span");
		iconQuestion.classList.add("plotChild");
		iconQuestion.classList.add("far");
		iconQuestion.classList.add("fa-question-circle");
		iconQuestion.classList.add("controlButtonIcon");
		var val = this.getTooltipFlag(thePcaPlot);
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
		toggleTitle.innerText = "Tooltips";
		toggleTooltipsButton.appendChild(toggleTitle);
		theControlDiv.appendChild(toggleTooltipsButton);
		var utilPcaThis = this;
		$('#PcaToggleTooltipsButton').on('click', function(event, ui) { utilPcaThis.toggleTooltips(thePcaPlot, iconQuestion); });
		/////////////////////////////
		//// add toggle includeCentroids
		/////////////////////////////
		var toggleCentroidsButton = document.createElement("span");
		toggleCentroidsButton.id = "PcaToggleCentroidsButton";
		toggleCentroidsButton.classList.add("plotChild");
		toggleCentroidsButton.classList.add("controlButton");
		// build icon
		var iconCentroids = document.createElement("span");
		iconCentroids.classList.add("plotChild");
		iconCentroids.classList.add("fas");
		iconCentroids.classList.add("fa-cookie");
		iconCentroids.classList.add("controlButtonIcon");
		var val = this.getCentroidsFlag(thePcaPlot);
		if(true===val)
		{
			iconCentroids.style.color = "green";
		}
		else
		{
			iconCentroids.style.color = "red";
		}
		toggleCentroidsButton.appendChild(iconCentroids);
		// icon label
		var toggleTitle = document.createElement("span");
		toggleTitle.classList.add("plotChild");
		toggleTitle.classList.add("controlButtonLabel");
		toggleTitle.innerText = "Centroids";
		toggleCentroidsButton.appendChild(toggleTitle);
		theControlDiv.appendChild(toggleCentroidsButton);
		var utilPcaThis = this;
		$('#PcaToggleCentroidsButton').on('click', function(event, ui) { utilPcaThis.toggleCentroids(thePcaPlot, iconCentroids); });
		/////////////////////////////
		//// add Axis dropdowns
		/////////////////////////////
		var xSelect = this.populateAxisDropdown(theControlDiv, "X-Axis:", 0, "pcaXselect");
		var ySelect = this.populateAxisDropdown(theControlDiv, "Y-Axis:", 1, "pcaYselect");

		var setDimensionHandler = (e) => 
		{
			this.plot.setDimensions(xSelect.value, ySelect.value);
		};
		xSelect.addEventListener("change", setDimensionHandler, false);
		ySelect.addEventListener("change", setDimensionHandler, false);
	};
	
	newPca(theMakeDataPointLog)
	{
		var self = this;
		// BatchData.tsv 
		var batchFile = self.newDiagram.batch_data;
		// "entry_label": "ShipDate", -- batch type being viewed
		// entry label is no longer batch type, pull batch type from path
		// /analysis/PCA/BatchId/ManyToMany/DATA_2023_2_3_0920/TEST_2023_2_3_0920/foo.foo"
		// remove starting / if present, so split below works
		// console.log("newPca batchType = '" + batchType + "'");
		var batchType = self.newDiagram.pca_values;
		if (batchType.startsWith("/"))
		{
			batchType = batchType.substring(1);
		}
		batchType = batchType.split("/")[2];
		// "pca_annotations": "/analysis/PCA/BatchId/ManyToMany/DATA_2023_2_3_0920/TEST_2023_2_3_0920/PCAAnnotations.tsv",
		var annotationFile = self.newDiagram.pca_annotations;
		// "pca_values": "/analysis/PCA/BatchId/ManyToMany/DATA_2023_2_3_0920/TEST_2023_2_3_0920/PCAValues.tsv"
		var plotFile = self.newDiagram.pca_values;
		// get DATA and TEST version if used
		var splitted = plotFile.split("/");
		var dataVersion = "";
		var testVersion = "";
		if (splitted.length>6)
		{
			dataVersion = splitted[5];
			if (splitted.length>7)
			{
				testVersion = splitted[6];
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
						+ ((""!==testVersion)?(" / " + testVersion):"")
						+ " / " + batchType;
		}
		var [plotDiv, controlDiv, legendDiv] = self.addDivs(document.getElementById(self.divDiagramId), document.getElementById(self.divLegendId));

		var self = this;
		Promise.all([
			self.getDataFileCallback(plotFile),
			self.getDataFileCallback(batchFile),
			self.getDataFileCallback(annotationFile)
		]).then(function (values)
		{
			var pcaValues = values[0];
			var BatchData = values[1];
			var pcaAnnotations = values[2];

			var model = PcaPlot.BasicModel(pcaValues, BatchData, pcaAnnotations, "Id");

			var params = PcaPlot.DefaultParams();
			params.plotTitle = title;
			params.plotAnnotation = null;
			params.groupKey = batchType;
			//params.groupKey = this.querySelections.getDiagramType();
			params.showDetailFunc = (struct) => 
			{
				theMakeDataPointLog(struct, document.getElementById(self.divDatapaneId));
			};
			params.selectCallbackFunc = null;

			self.plot = PcaPlot(model, plotDiv, legendDiv, params);
			self.finishedCallback(self, controlDiv, self.plot);
		});
	};

	finishedCallback(self, controlDiv, thePlot)
	{
		//console.log("UtilPca::finishedCallback called");
		self.populateControlStrip(controlDiv, thePlot);
		// call through globalDiagramControl in order to trigger other gui events
		// this.resize();
		globalDiagramControl.resize();
	};

	addDivs(theDiagramDiv, theLegendDiv)
	{
		// make a column flex container for stack the plot and control strips
		var columnDiv = document.createElement("div");
		columnDiv.classList.add("columnDiv");
		columnDiv.classList.add("plotChild");
		theDiagramDiv.appendChild(columnDiv);
		
		var plotDiv = document.createElement("div");
		plotDiv.classList.add("PcaPlottingDiv");
		plotDiv.classList.add("plotChild");
		columnDiv.appendChild(plotDiv);
		//
		var controlDiv = document.createElement("div");
		controlDiv.classList.add("PcaControlDiv");
		controlDiv.classList.add("controlStrip");
		controlDiv.classList.add("plotChild");
		columnDiv.appendChild(controlDiv);
		
		var legendSubDiv = document.createElement("div");
		legendSubDiv.classList.add("PcaLegendDiv");
		legendSubDiv.classList.add("plotChild");
		theLegendDiv.appendChild(legendSubDiv);

		return [plotDiv, controlDiv, legendSubDiv];
	};

	dimensions(theDiagramDiv)
	{
		// TODO:BEV: fix hack: magic numbers - not sure why need to reduce size
		var bbox = theDiagramDiv.getBoundingClientRect();
		return [
			(0.7 * bbox.width) - 15, // start width
			(0.85 * bbox.height) - 15 // start height
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
	

	getCentroidsFlag(thePlot)
	{
		var result = null;
		if (thePlot.plotOptions)
		{
			var options = thePlot.plotOptions();
			result = options["includeCentroids"];
		}
		return result;
	}
	
	toggleCentroids(thePlot, theIcon)
	{
		if (thePlot.plotOptions)
		{
			var options = thePlot.plotOptions();
			options["includeCentroids"] = !options["includeCentroids"];
			var val = options["includeCentroids"];
			if(true===val)
			{
				theIcon.style.color = "green";
			}
			else
			{
				theIcon.style.color = "red";
			}
			//console.log("toggleCentroids plotOptions");
			thePlot.plotOptions(options);
			//console.log(thePlot);
			thePlot.redrawPlot();
		}
	}
}