/* global globalDiagramControl */

class UtilDsc
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
		//console.log("UtilDsc::resize called");
		// not used here
	};
	
	newDsc()
	{
		var self = this;
		// "dsc_values": "DSCOverview.tsv"
		var dscFile = self.newDiagram.dsc_values;
		// title from index
		var title = self.indexKO().mbatch.mbatch_run
					+ "/" + self.indexKO().source
					+ "/" + self.indexKO().variant
					+ "/" + self.indexKO().project
					+ "/" + self.indexKO().subProject
					+ "/" + self.indexKO().category
					+ "/" + self.indexKO().platform
					+ "/" + self.indexKO().data
					+ "/" + self.indexKO().algorithm
					+ ((""!==self.indexKO().details)?("/" + this.indexKO().details):"")
					+ "/" + self.indexKO().mbatch.dataset_type;
		var [plotDiv, legendDiv] = self.addDivs(document.getElementById(self.divDiagramId), document.getElementById(self.divLegendId));
		self.plot = new BeaDsc(title, plotDiv);
		self.getDataFileCallback(dscFile).then(function(theTextData)
		{
			self.plot.addTable(theTextData);
			$('#dscTable').DataTable(
			{
				lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
				ordering: true,
				searching: false
			});
			self.finishedCallback();
		});
	};

	finishedCallback()
	{
		//console.log("UtilDsc::finishedCallback called");
		// TODO: TDC new
		// call through globalDiagramControl in order to trigger other gui events
		// this.resize();
		globalDiagramControl.resize();
	};

	addDivs(theDiagramDiv, theLegendDiv)
	{
		var plotDiv = document.createElement("div");
		plotDiv.classList.add("DscPlottingDiv");
		plotDiv.classList.add("plotChild");
		theDiagramDiv.appendChild(plotDiv);
		//
		var legendSubDiv = document.createElement("div");
		legendSubDiv.classList.add("DscLegendDiv");
		legendSubDiv.classList.add("plotChild");
		theLegendDiv.appendChild(legendSubDiv);

		return [plotDiv, legendSubDiv];
	};

	getDataFileCallback(theTextFile)
	{
		const dataPromise = new Promise((resolve, reject) =>
		{
			if (null!==theTextFile)
			{
				// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
				this.dataAccess.getDataFile(this.datasetId, theTextFile).then(function(theTextData)
				{
					resolve(Papa.parse(theTextData, { delimiter: "\t", dynamicTyping: true, fastMode: true, header: true, skipEmptyLines: true }).data);
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