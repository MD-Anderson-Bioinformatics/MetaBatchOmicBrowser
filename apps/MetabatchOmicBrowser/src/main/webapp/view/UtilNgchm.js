/* global globalDataAccess, globalDiagramControl */

class UtilNgchm
{
	constructor(theDataAccess, theDiagramId, theLegendId, theDatapaneId, theNewDiagram, theIndexKO, theDatasetId,
				theMakeDataPointLogFunction, theBevUrl)
	{
		//console.log("UtilNgchm this");
		//console.log(this);
		//console.log("UtilNgchm theMakeDataPointLogFunction");
		//console.log(theMakeDataPointLogFunction);
		this.dataAccess = theDataAccess;
		this.divDiagramId = theDiagramId;
		this.divLegendId = theLegendId;
		this.divDatapaneId = theDatapaneId;
		this.newDiagram = theNewDiagram;
		this.indexKO = theIndexKO;
		this.datasetId = theDatasetId;
		this.makeDataPointLogFunction = theMakeDataPointLogFunction;
		this.bevUrl = theBevUrl;
	};
	
	// this is a required function, called from within DiagramControl.resize via the body onresize option, to update SVGs
	resize()
	{
		//console.log("UtilNgchm::resize called");
		// not used here
	};

	showNgcmDatapoint(e) 
	{
		//console.log("showNgcmDatapoint");
		//console.log(e);
		if (!e.data)
		{
			//console.log ('Map details message not valid');
			return;
		}
		else if(e.data.msg !== "ShowCovarDetail")
		{
			var	struct = [ ["Value:", e.data.data.value], ['Row:', e.data.data.rowLabel], ['Column:', e.data.data.colLabel] ];
			var covariates = e.data.data.colCovariates;
			for (var x in covariates)
			{
				var indx = 3+parseInt(x);
				struct[indx] = [];
				struct[indx][0] = covariates[x].name+":";
				struct[indx][1] = covariates[x].value;
			}
			var dataNode = document.getElementById(e.data.id);
			//console.log("showNgcmDatapoint this");
			//console.log(this);
			//console.log("showNgcmDatapoint this.makeDataPointLogFunction");
			//console.log(this.makeDataPointLogFunction);
			this.makeDataPointLogFunction(struct, dataNode);
		}
		else
		{
			var legendTable = document.createElement('table');
			legendTable.classList.add("plotChild");
			legendTable.innerHTML = e.data.data.split('class="chmTblRow"').join('class="chmTblRow-legend"').split('class="color-box"').join('class="color-box color-box-legend"');
			var legend = document.getElementById(e.data.id).parentElement.parentElement.parentElement.getElementsByClassName('legendTop')[0].getElementsByClassName('flexInteriorWrapper')[0];
			if (legend.hasChildNodes())
			{
				legend.removeChild(legend.firstElementChild);
			}
			legend.appendChild(legendTable);
		}
	}
	
	newNgchm()
	{
		$("body").addClass("wait");
		var self = this;
		try
		{
			//console.log("newNgchm self");
			//console.log(self);
			// "ngchm": "/NGCHM/ShipDate_ngchm.ngchm"
			var ngchmFile = this.newDiagram.ngchm;
			var ngchm = document.createElement('iframe');
			// NOTE: assumes only one ngchm iframe
			ngchm.setAttribute("id","ngchmIframe");
			ngchm.style = "height:100%; width:100%; border-style:none; ";
			// Make visible and append to DOM
			ngchm.classList.remove("ngchmHidden");
			ngchm.classList.add("ngchmVisible");
			ngchm.classList.add("plotChild");
			globalDataAccess.getDataFile(this.datasetId, ngchmFile).then(function (theTextData)
			{
				if (""===theTextData)
				{
					theTextData = "<html><body><strong>No NGCHM HTML file available. Download the MBatch Archive and use the .ngchm file with the standalone NGCHM viewer.</strong></body></html>";
				}
				ngchm.setAttribute("srcdoc", theTextData);
				var plotDiv = document.getElementById(self.divDiagramId);
				plotDiv.appendChild(ngchm);
				// messages do not work in this version, so comment this out
				// var nonce = "N";
				// var datapaneId = self.divDatapaneId;
				//ngchm.onload = function() 
				//{
				// 	//console.log("ngchm.onload");
				// 	// https://stackoverflow.com/questions/62087163/iframe-onload-event-when-content-is-set-from-srcdoc
				// 	// do a timer until contentDocument or contentWindow.document are populated
				// 	// messages still do not work...
				// 	var timer = setInterval(function()
				// 	{
				// 		//console.log("ngchm.onload interval");
				// 		let iframeDoc = ngchm.contentDocument || ngchm.contentWindow.document;
				// 		if (null!==iframeDoc)
				// 		{
				// 			//console.log("iframeDoc not null");
				// 			//console.log(iframeDoc);
				// 			iframeDoc.addEventListener('message', 
				// 				function(theEvent)
				// 				{
				// 					//console.log("message event for iframe");
				// 					self.showNgcmDatapoint(theEvent);
				// 				}, 
				// 				false);
				// 			//console.log ('Sending message to ngchm');
				// 			ngchm.contentWindow.postMessage ({ nonce: nonce, override: 'ShowMapDetail', ngchm_id: datapaneId }, '*');
				$("body").removeClass("wait");
				self.finishedCallback();
				// 			clearInterval(timer);
				// 		}
				// 	}, 1000);
				//};
			});
		}
		catch(theExp)
		{
			$("body").removeClass("wait");
			alert(theExp);
			self.finishedCallback();
		}
	}
	
	finishedCallback()
	{
		//console.log("UtilNgchm::finishedCallback called");
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

}