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
		console.log("showNgcmDatapoint");
		console.log(e);
		if (!e.data)
		{
			console.log('Map details message not valid');
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

	plotNGCHMhtml(theTextData, theNgchm)
	{
		var self = this;
		var ngchm = document.createElement('iframe');
		// NOTE: assumes only one ngchm iframe
		ngchm.setAttribute("id","ngchmIframe");
		ngchm.style = "height:100%; width:100%; border-style:none; ";
		// Make visible and append to DOM
		ngchm.classList.remove("ngchmHidden");
		ngchm.classList.add("ngchmVisible");
		ngchm.classList.add("plotChild");
		theNgchm.setAttribute("srcdoc", theTextData);
		var plotDiv = document.getElementById(self.divDiagramId);
		plotDiv.appendChild(theNgchm);
	}
	
	plotNGCHMngchm(theDatasetId, theNgchmFile)
	{
		var self = this;
		// 'http://localhost:8080/MQA/dsblob?text=%2FSupervisedClustering%2FBatches%2FBatchId_ngchm.ngchm&id=bev-gdc-b23f7958311814b0b696c2251c5b08c0'
		var myUrl = window.location.origin + (window.location.pathname).replace("view/", "") + "/dsblob?text=" + encodeURIComponent(theNgchmFile) + "&id=" + theDatasetId;

		var plotDiv = document.getElementById(self.divDiagramId);
		var ngchm = document.createElement('div');
		// NOTE: assumes only one ngchm iframe
		ngchm.setAttribute("id","ngchmIframeDiv");
		ngchm.style = "height:100%; width:100%; border-style:none; ";
		// Make visible and append to DOM
		ngchm.classList.remove("ngchmHidden");
		ngchm.classList.add("ngchmVisible");
		ngchm.classList.add("plotChild");
		plotDiv.appendChild(ngchm);

		var mscript = document.createElement('script');
		mscript.setAttribute("type", "module");
		mscript.innerHTML = "embedNGCHM(\"" + ngchm.getAttribute("id") + "\", 'url', \"" + myUrl +
				"\", { widgetPath: 'lib/ngchmWidget-min.js', style: 'height:99%; width:100%; border-style: none;' });";
		mscript.classList.add("plotChild");
		plotDiv.appendChild(mscript);

		var firstIframe = document.querySelector("#ngchmIframeDiv > iframe:first-of-type");
		if (notUN(firstIframe))
		{
			var nonce = "N";
			var datapaneId = self.divDatapaneId;
			firstIframe.onload = function() 
			{
			 	console.log("firstIframe.onload");
			 	// https://stackoverflow.com/questions/62087163/iframe-onload-event-when-content-is-set-from-srcdoc
			 	// do a timer until contentDocument or contentWindow.document are populated
			 	// messages still do not work...
			 	var timer = setInterval(function()
			 	{
			 		console.log("firstIframe.onload interval");
			 		let iframeDoc = firstIframe.contentDocument || firstIframe.contentWindow.document;
			 		if (null!==iframeDoc)
			 		{
			 			console.log("firstIframe.onload not null");
			 			console.log(iframeDoc);
			 			iframeDoc.addEventListener('message', 
			 				function(theEvent)
			 				{
			 					console.log("firstIframe.onload message event for iframe");
			 					self.showNgcmDatapoint(theEvent);
			 				}, 
			 				false);
			 			console.log('firstIframe.onload Sending message to ngchm');
			 			console.log(datapaneId);
			 			firstIframe.contentWindow.postMessage ({ nonce: nonce, override: 'ShowMapDetail', ngchm_id: datapaneId }, '*');
						clearInterval(timer);
					}
				}, 1000);
			};
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
			var ngchmFileHtml = self.newDiagram.ngchm;
			var ngchmFileNgchm = ngchmFileHtml.replace(".html", "");
			this.dataAccess.getExistance(self.datasetId, ngchmFileNgchm).then(function (exists)
			{
				if ("false"===exists)
				{
					globalDataAccess.getDataFile(self.datasetId, ngchmFileHtml).then(function (theTextData)
					{
						if (""===theTextData)
						{
							theTextData = "<html><body><strong>No NGCHM available.</strong></body></html>";
						} 
						self.plotNGCHMhtml(theTextData);
					});
				}
				else
				{
					self.plotNGCHMngchm(self.datasetId, ngchmFileNgchm);
				}
				$("body").removeClass("wait");
				self.finishedCallback();
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