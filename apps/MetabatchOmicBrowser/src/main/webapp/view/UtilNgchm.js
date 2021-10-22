/* global globalDataAccess, globalDiagramControl */


	function newEmbedNgchm(theNgchmId, theUrl)
	{
		// This uses the functionality added by Chris to ngchbEmbed-min.js
		//console.log("newEmbedNgchm");
		embedNGCHM(theNgchmId, 'url', theUrl,
		{
			widgetPath: 'lib/ngchmWidget-min.js', 
			style: 'height:100%; width:100%; border-style: none;', 
			docStyle: 'height: calc(100vh - 16px); width: calc(100vw - 16px);', 
			embedStyle: 'display: flex; flex-direction: column; background-color: white; height: 100%; width:100%; border: 0px; padding: 0px;',
			onload: function()
				{
					//console.log("params onload");
					var firstIframe = document.querySelector("#ngchmIframeDiv > iframe:first-of-type");
					//console.log(firstIframe);
					// New from Bradley
					var nonce = "N";
					//console.log(firstIframe.contentWindow);
					firstIframe.contentWindow.postMessage ({ nonce: nonce, override: 'ShowMapDetail' });
					// Workaround apparent bug in NGCHM.  NGCHM content not sized properly until resized:
					setTimeout(() => firstIframe.contentWindow.dispatchEvent(new Event('resize')), 2000);
					// End New from Bradley
				}
		});
	}
	
	function ngchmMessagingSetup(theNgchmId, theUrl)
	{
		embedNGCHM(theNgchmId, 'url', theUrl,
		{
			widgetPath: 'lib/ngchmWidget-min.js', 
			style: 'height:100%; width:100%; border-style: none;', 
			docStyle: 'height: calc(100vh - 16px); width: calc(100vw - 16px);', 
			embedStyle: 'display: flex; flex-direction: column; background-color: white; height: 100%; width:100%; border: 0px; padding: 0px;'
		});
		//console.log("waiting for ngchmIframeDiv > iframe:first-of-type to exist");
		var firstIframe = document.querySelector("#ngchmIframeDiv > iframe:first-of-type");
		if (notUN(firstIframe))
		{
			//console.log("firstIframe valid");
			firstIframe.onload = function()
			{
				var nonce = "N";
				//console.log("onload triggered");
				let iframeDoc = firstIframe.contentDocument || firstIframe.contentWindow.document;
				if (null!==iframeDoc)
				{
					console.log("iframeDoc valid");
				}
				else
				{
					console.log("iframeDoc is null/undefined");
				}
				//console.log("onload called");
				// OLD firstIframe.contentWindow.postMessage ({ nonce: nonce, override: 'ShowMapDetail', ngchm_id: datapaneId }, '*');
				// New from Bradley
				firstIframe.contentWindow.postMessage ({ nonce: nonce, override: 'ShowMapDetail' });
				// Workaround apparent bug in NGCHM.  NGCHM content not sized properly until resized:
				setTimeout(() => firstIframe.contentWindow.dispatchEvent(new Event('resize')), 2000);
				// End New from Bradley
			};
		}
		else
		{
			console.log("firstIframe is null/undefined");
			return false;
		}
	}
	
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
			console.log('Map details message not valid');
			return;
		}
		else if(e.data.msg !== "ShowCovarDetail")
		{
			//console.log('ShowCovarDetail');
			var	struct = [ ["Value:", e.data.data.value], ['Row:', e.data.data.rowLabel], ['Column:', e.data.data.colLabel] ];
			var covariates = e.data.data.colCovariates;
			for (var x in covariates)
			{
				var indx = 3+parseInt(x);
				struct[indx] = [];
				struct[indx][0] = covariates[x].name+":";
				struct[indx][1] = covariates[x].value;
			}
			var dataNode = document.getElementById(this.divDatapaneId);
			this.makeDataPointLogFunction(struct, dataNode);
		}
		else
		{
			//console.log('legend ' + e.data.msg);
			var legendTable = document.createElement('table');
			legendTable.classList.add("plotChild");
			legendTable.innerHTML = e.data.data;
			var legendDisplayContent = document.getElementById(this.divLegendId);
			if (legendDisplayContent.hasChildNodes())
			{
				legendDisplayContent.removeChild(legendDisplayContent.firstElementChild);
			}
			legendDisplayContent.appendChild(legendTable);
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
		
		window.addEventListener('message', 
			function(theEvent)
			{
				//console.log("firstIframe.onload message event for iframe");
				self.showNgcmDatapoint(theEvent);
			}, 
			false);

		var mscript = document.createElement('script');
		mscript.setAttribute("type", "module");
		// old setup without onload parameter
		//mscript.innerHTML = ngchmMessagingSetup.toString() + 
		//		" ngchmMessagingSetup(\"" + ngchm.getAttribute("id") + "\", \"" + myUrl + "\");";
		// This uses the functionality added by Chris to ngchbEmbed-min.js
		mscript.innerHTML = 
				newEmbedNgchm.toString() + 
				" newEmbedNgchm(\"" + ngchm.getAttribute("id") + "\", \"" + myUrl + "\"); ";
		mscript.classList.add("plotChild");
		plotDiv.appendChild(mscript);
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