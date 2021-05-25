/* global URL, globalDiagramControl */

class DiagramControl
{
	constructor(theDataAccess, theDiagramId, theLegendId, theDatapaneId, theBevUrl)
	{
		this.dataAccess = theDataAccess;
		this.divDiagramId = theDiagramId;
		this.divLegendId = theLegendId;
		this.divDatapaneId = theDatapaneId;
		this.indexKO = null;
		this.resizeUtil = null;
		this.widthKO = null;
		this.mAlgOpt = null;
		this.mAlgSel = null;
		this.mLv1Opt = null;
		this.mLv1Sel = null;
		this.mLv2Opt = null;
		this.mLv2Sel = null;
		this.mBevUrl = theBevUrl;
	};
	
	setKOVars(theAlgOpt, theAlgSel, theLv1Opt, theLv1Sel, theLv2Opt, theLv2Sel)
	{
		this.mAlgOpt = theAlgOpt;
		this.mAlgSel = theAlgSel;
		this.mLv1Opt = theLv1Opt;
		this.mLv1Sel = theLv1Sel;
		this.mLv2Opt = theLv2Opt;
		this.mLv2Sel = theLv2Sel;
	};
	
	getEntries(theDatasetPath)
	{
		var splitted = theDatasetPath.split("/");
		var size = splitted.length;
		return [ splitted[size-3], splitted[size-2], splitted[size-1] ];
	};
	
	getMatchingList(theList, theValue)
	{
		if(notUN(theList))
		{
			for (var index=0; index<theList.length; index++)
			{
				var myOpt = theList[index];
				if (theValue===myOpt.entry_label)
				{
					return myOpt;
				}
			}
		}
		return undefined;
	}
	
	selectDiagram(theDatasetPath)
	{
		//console.log("DiagramControl::selectDiagram called");
		//console.log("theDatasetPath=" + theDatasetPath);
		// get last three entries (algorith, level 1, level 2)
		var [alg, lv1, lv2] = this.getEntries(theDatasetPath);
		if ("PCA"===alg)
		{
			alg = "PCA+";
		}
		if(alg!==this.mAlgSel().entry_label)
		{
			this.mAlgSel(this.getMatchingList(this.mAlgOpt(), alg));
		}
		if((notUN(this.mLv1Sel()))&&(lv1!==this.mLv1Sel().entry_label))
		{
			this.mLv1Sel(this.getMatchingList(this.mLv1Opt(), lv1));
		}
		if((notUN(this.mLv2Sel()))&&(lv2!==this.mLv2Sel().entry_label))
		{
			this.mLv2Sel(this.getMatchingList(this.mLv2Opt(), lv2));
		}
	};
	
	setWidthKO(theWidthKO)
	{
		this.widthKO = theWidthKO;
	};
	
	// called from within DiagramControl.resize via the index.html body onresize option, to update SVGs
	resize()
	{
		//console.log("DiagramControl::resize called");
		var bbox = document.getElementById(this.divDiagramId).getBoundingClientRect();
		if (null!==this.widthKO)
		{
			this.widthKO(window.innerWidth);
		}
		//console.log("DiagramControl::resize bbox.height =" + bbox.height);
		//console.log("DiagramControl::resize bbox.width =" + bbox.width);
		if (notUN(this.resizeUtil))
		{
			//console.log("DiagramControl::resize before resizeUtil.resize");
			this.resizeUtil.resize();
			//console.log("DiagramControl::resize after resizeUtil.resize");
		}
		//console.log("DiagramControl::resize enable input disabled when new diagram started - disable in handleNewDiagram");
		enableInput();
	};
	
	setValues(theIndexKO)
	{
		this.indexKO = theIndexKO;
	};

	notUN(theValue)
	{
		return ((undefined !== theValue) && (null !== theValue));
	};

	handleNewDiagram(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewDiagram called");
		//console.log("handleNewDiagram start");
		if (notUN(theNewDiagram))
		{
			//console.log("handleNewDiagram continue");
			if(notUN(theNewDiagram.diagram_type))
			{
				//console.log("handleNewDiagram " + theDatasetId);
				//console.log(theNewDiagram);
				
				//console.log("DiagramControl::handleNewDiagram disable input disabled when new diagram started - enable in resize");
				disableInput();
				this.resizeFunction = null;
				this.removePlotChildren();
				var diagramType = theNewDiagram.diagram_type;
				//console.log("diagramType = " + diagramType);
				if ("boxplot" === diagramType)
				{
					this.handleNewBoxplot(theDatasetId, theNewDiagram);
				}
				else if ("cdp" === diagramType)
				{
					this.handleNewCdp(theDatasetId, theNewDiagram);
				}
				else if ("DSC" === diagramType)
				{
					this.handleNewDsc(theDatasetId, theNewDiagram);
				}
				else if ("hc" === diagramType)
				{
					this.handleNewHierClust(theDatasetId, theNewDiagram);
				}
				else if ("ngchm" === diagramType)
				{
					this.handleNewNgchm(theDatasetId, theNewDiagram, this.mBevUrl);
				}
				else if ("pca" === diagramType)
				{
					this.handleNewPca(theDatasetId, theNewDiagram);
				}
				else if ("sc" === diagramType)
				{
					this.handleNewSuperClust(theDatasetId, theNewDiagram);
				}
				else if ("discrete" === diagramType)
				{
					this.handleNewDiscrete(theDatasetId, theNewDiagram);
				}
				else if ("mutbatch" === diagramType)
				{
					this.handleNewMutbatch(theDatasetId, theNewDiagram);
				}
				else
				{
					console.log("Unknown diagram type:" + diagramType);
					console.log(theNewDiagram);
				}
				// do not use async, call in finished called for diagrams
				// this.resize();
			}
		}
	};
	
	removePlotChildren()
	{
		$('.plotChild').remove();
	};
	
	handleNewMutbatch(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewMutbatch called");
		// clear any existing images -- clear calls are syncronous
		this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
		this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
		this.resizeUtil = null;
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		var passedThis = this;
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.diagram_image).then(function (exists)
		{
			//console.log("DiagramControl::handleNewMutbatch getExistance");
			if ("false"===exists)
			{
				passedThis.dataAccess.addText("<br>Due to NAs or other data issues, this analysis was unable to be generated.", passedThis.divDiagramId);
			}
			else
			{
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, passedThis.divDiagramId);
				passedThis.dataAccess.addImage(theDatasetId, undefined, passedThis.divLegendId);
				passedThis.resizeUtil = null;
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				globalDiagramControl.resize();
			}
			//console.log("DiagramControl::handleNewMutbatch getExistance done");
		});
	};

	handleNewDiscrete(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewDiscrete called");
		// clear any existing images -- clear calls are syncronous
		this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
		this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
		this.resizeUtil = null;
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		var passedThis = this;this.dataAccess.getExistance(theDatasetId, theNewDiagram.diagram_image).then(function (exists)
		{
			//console.log("DiagramControl::handleNewDiscrete getExistance");
			if ("false"===exists)
			{
				passedThis.dataAccess.addText("<br>Due to NAs or other data issues, this analysis was unable to be generated.", passedThis.divDiagramId);
			}
			else
			{
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, passedThis.divDiagramId);
				passedThis.dataAccess.addImage(theDatasetId, undefined, passedThis.divLegendId);
				passedThis.resizeUtil = null;
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				globalDiagramControl.resize();
			}
			//console.log("DiagramControl::handleNewDiscrete getExistance done");
		});
	};

	handleNewBoxplot(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewBoxplot called");
		// clear any existing images -- clear calls are syncronous
		this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
		this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
		this.resizeUtil = null;
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		var passedThis = this;
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.box_data).then(function (exists)
		{
			//console.log("DiagramControl::handleNewBoxplot getExistance");
			if ("false"===exists)
			{
				passedThis.dataAccess.addText("<br>Due to NAs or other data issues, this analysis was unable to be generated.", passedThis.divDiagramId);
			}
			else
			{
				//console.log("DiagramControl::handleNewBoxplot pre newBoxplot");
				var ub = new UtilBoxplot(passedThis.dataAccess, passedThis.divDiagramId, passedThis.divLegendId, passedThis.divDatapaneId, theNewDiagram, passedThis.indexKO, theDatasetId);
				ub.newBoxplot(passedThis.makeDataPointLog);
				passedThis.resizeUtil = ub;
				//console.log("DiagramControl::handleNewBoxplot post newBoxplot");
				//this.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, this.divDiagramId);
				//this.dataAccess.addImage(theDatasetId, theNewDiagram.legend_image, this.divLegendId);
			}
			//console.log("DiagramControl::handleNewBoxplot getExistance done");
		});
	};

	handleNewCdp(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewCdp called");
		// clear any existing images -- clear calls are syncronous
		this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
		this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
		this.resizeUtil = null;
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		var passedThis = this;
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.diagram_image).then(function (exists)
		{
			//console.log("DiagramControl::handleNewCdp getExistance");
			if ("false"===exists)
			{
				passedThis.dataAccess.addText("<br>Due to NAs or other data issues, this analysis was unable to be generated.", passedThis.divDiagramId);
			}
			else
			{
				// load calls for an image are asyncronous
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, passedThis.divDiagramId);
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.legend_image, passedThis.divLegendId);
				passedThis.resizeUtil = null;
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				globalDiagramControl.resize();
			}
			//console.log("DiagramControl::handleNewCdp getExistance done");
		});
	};

	handleNewDsc(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewDsc called");
		// clear any existing images -- clear calls are syncronous
		this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
		this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
		this.resizeUtil = null;
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		var passedThis = this;
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.dsc_values).then(function (exists)
		{
			//console.log("DiagramControl::handleNewDsc getExistance");
			if ("false"===exists)
			{
				passedThis.dataAccess.addText("<br>Due to NAs or other data issues, this analysis was unable to be generated.", passedThis.divDiagramId);
			}
			else
			{
				var ub = new UtilDsc(passedThis.dataAccess, passedThis.divDiagramId, passedThis.divLegendId, passedThis.divDatapaneId, theNewDiagram, passedThis.indexKO, theDatasetId);
				ub.newDsc();
				passedThis.resizeUtil = ub;
			}
			//console.log("DiagramControl::handleNewDsc getExistance done");
		});
	};

	handleNewHierClust(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewHierClust called");
		// clear any existing images -- clear calls are syncronous
		this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
		this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
		this.resizeUtil = null;
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		var passedThis = this;
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.hc_order).then(function (exists)
		{
			//console.log("DiagramControl::handleNewHierClust getExistance");
			if ("false"===exists)
			{
				passedThis.dataAccess.addText("<br>Due to NAs or other data issues, this analysis was unable to be generated.", passedThis.divDiagramId);
			}
			else
			{
				var ub = new UtilHierClust(passedThis.dataAccess, passedThis.divDiagramId, passedThis.divLegendId, passedThis.divDatapaneId, theNewDiagram, passedThis.indexKO, theDatasetId);
				ub.newHierClust(passedThis.makeDataPointLog);
				passedThis.resizeUtil = ub;
				//this.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, this.divDiagramId);
				//this.dataAccess.addImage(theDatasetId, theNewDiagram.legend_image, this.divLegendId);
			}
			//console.log("DiagramControl::handleNewHierClust getExistance done");
		});
	};

	handleNewNgchm(theDatasetId, theNewDiagram, theBevUrl)
	{
		//console.log("DiagramControl::handleNewNgchm called");
		// clear any existing images -- clear calls are syncronous
		this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
		this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
		this.resizeUtil = null;
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		var passedThis = this;
		//console.log("handleNewNgchm theDatasetId=" + theDatasetId);
		//console.log("handleNewNgchm theNewDiagram.ngchm=" + theNewDiagram.ngchm);
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.ngchm).then(function (exists)
		{
			//console.log("DiagramControl::handleNewNgchm getExistance");
			//console.log("handleNewNgchm exists=" + exists);
			if ("false"===exists)
			{
				passedThis.dataAccess.addText("<br>Due to NAs or other data issues, this analysis was unable to be generated.", passedThis.divDiagramId);
			}
			else
			{
				var ub = new UtilNgchm(passedThis.dataAccess, passedThis.divDiagramId, passedThis.divLegendId, passedThis.divDatapaneId, theNewDiagram, passedThis.indexKO, theDatasetId, passedThis.makeDataPointLog, theBevUrl);
				ub.newNgchm();
				passedThis.resizeUtil = ub;
				// use undefined to remove images from previous diagram
				//this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
				//this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
			}
			//console.log("DiagramControl::handleNewNgchm getExistance done");
		});
	};

	handleNewPca(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewPca called");
		// clear any existing images -- clear calls are syncronous
		this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
		this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
		this.resizeUtil = null;
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		var passedThis = this;
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.pca_values).then(function (exists)
		{
			//console.log("DiagramControl::handleNewPca getExistance");
			if ("false"===exists)
			{
				passedThis.dataAccess.addText("<br>Due to NAs or other data issues, this analysis was unable to be generated.", passedThis.divDiagramId);
			}
			else
			{
				var ub = new UtilPca(passedThis.dataAccess, passedThis.divDiagramId, passedThis.divLegendId, passedThis.divDatapaneId, theNewDiagram, passedThis.indexKO, theDatasetId);
				ub.newPca(passedThis.makeDataPointLog);
				passedThis.resizeUtil = ub;
				//this.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, this.divDiagramId);
				//this.dataAccess.addImage(theDatasetId, theNewDiagram.legend_image, this.divLegendId);
			}
			//console.log("DiagramControl::handleNewPca getExistance done");
		});
	};

	handleNewSuperClust(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewSuperClust called");
		// clear any existing images -- clear calls are syncronous
		this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
		this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
		this.resizeUtil = null;
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		var passedThis = this;
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.diagram_image).then(function (exists)
		{
			//console.log("DiagramControl::handleNewSuperClust getExistance");
			if ("false"===exists)
			{
				passedThis.dataAccess.addText("<br>Due to NAs or other data issues, this analysis was unable to be generated.", passedThis.divDiagramId);
			}
			else
			{
				// load calls for an image are asyncronous
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, passedThis.divDiagramId);
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.legend_image, passedThis.divLegendId);
				passedThis.resizeUtil = null;
			}
			//console.log("DiagramControl::handleNewSuperClust getExistance done");
		});
	};
	
	makeDataPointLog(struct, dataNode)
	{
		if (struct.length > 0)
		{
			var dataPointText = "<p class='barlabel plotChild dpselect'><b class='barlabelbold'>[" + Date().split("GMT")[0] + "]</b><br>";
			for (var i = 0; i < struct.length; i++) {
				for (var j = 0; j < struct[i].length; j++) {
					if (struct[i][0] === "Sample:" || struct[i][0] === "Name:")
					{
						dataPointText += "<b class='barlabelbold'>" + struct[i][0] + "&nbsp;" + struct[i][1] + "</b>";
						j = struct[i].length;
					}
					else
					{
						dataPointText += "&nbsp;" + struct[i][j];
					}
				}
				dataPointText += "<br>";
			}
			dataPointText += "</p>";
			dataNode.innerHTML += dataPointText;
			dataNode.scrollTop = dataNode.scrollHeight;
		}
	};
	
	//// ///////////////////////////////////////////////////////////////////////
	//// save as PDF code
	//// ///////////////////////////////////////////////////////////////////////

	saveAsPdf()
	{
		$("body").addClass("wait");
		try
		{
			//console.log("saveAsPdf start");
			let docPdf = new PDFDocument({compress: false});
			if(notUN(this.resizeUtil))
			{
				// D3 plugin (or DSC)
				if(notUN(this.resizeUtil.plot.getSVGContent))
				{
					// getSVGContent
					let hiddenDiv = document.getElementById('renderSvgForPrinting');
					hiddenDiv.innerHTML = this.resizeUtil.plot.getSVGContent();
					SVGtoPDF(docPdf, hiddenDiv.firstChild, 0, 0, {useCSS:true});
					hiddenDiv.innerHTML = "";
					// handle plots that also have HTML content (like PCA+)
					if(notUN(this.resizeUtil.plot.getExtraPdfContent))
					{
						docPdf = this.resizeUtil.plot.getExtraPdfContent(docPdf);
					}
					//console.log("typeof(this.resizeUtil.plot)");
					// TODO: change method to detect hierclustering
					if (typeof(this.resizeUtil.plot) === "function")
					{
						// iterate over batch types
						// getLegendSVGContent
						//console.log(this.resizeUtil.plot.getGroupVariables());
						var batchTypeArray = this.resizeUtil.plot.getGroupVariables();
						for(var batchTypeIndex in batchTypeArray)
						{
							//console.log("batchTypeIndex = " + batchTypeIndex);
							var batchType = batchTypeArray[batchTypeIndex];
							//console.log("batchType");
							//console.log(batchType);
							docPdf.addPage();
							// hierClustPlotSelect
							//console.log("set batchType");
							$('#hierClustPlotSelect').val(batchType).change();
							// changes drop down, does not fire change event, manually update legend 
							let divEle = document.getElementById("hierClustPlotLegend");
							divEle.innerHTML = "";
							this.resizeUtil.plot.makeLegend(batchType, divEle);
							// get SVG text
							//console.log("get SVG via batchType text");
							var svgText = this.resizeUtil.plot.getLegendSVGContent(batchType);
							//console.log("got svg text");
							//console.log(svgText);
							hiddenDiv.innerHTML = svgText;
							SVGtoPDF(docPdf, hiddenDiv.firstChild, 0, 0, {useCSS:true});
							hiddenDiv.innerHTML = "";
						}
					}
					else
					{
						// getLegendSVGContent - for things other than hierarchical clustering
						//console.log("this.resizeUtil.plot.getLegendSVGContent() 2");
						docPdf.addPage();
						hiddenDiv.innerHTML = this.resizeUtil.plot.getLegendSVGContent();
						SVGtoPDF(docPdf, hiddenDiv.firstChild, 0, 0, {useCSS:true});
						hiddenDiv.innerHTML = "";
					}
				}
			}
			else
			{
				// PNG files - use buffer cause Base64 fails in Chrome only
				//const buffer = Buffer.from($('#BEVDisplay_DiagramdynamicImg')[0].src,'base64');
				var b64strA = String(document.getElementById('BEVDisplay_DiagramdynamicImg').src);
				docPdf.image(b64strA, 
				{
					fit: [ docPdf.page.width - docPdf.page.margins.left - docPdf.page.margins.right, docPdf.page.height - docPdf.page.margins.top - docPdf.page.margins.bottom ] 
				});
				if (notUN(document.getElementById('BEVDisplay_Legend_ContentdynamicImg')))
				{
					docPdf.addPage();
					//const buffer2 = Buffer.from($('#BEVDisplay_Legend_ContentdynamicImg')[0].src,'base64');
					var b64strB = String(document.getElementById('BEVDisplay_Legend_ContentdynamicImg').src);
					docPdf.image(b64strB, 
					{
						fit: [ docPdf.page.width - docPdf.page.margins.left - docPdf.page.margins.right, docPdf.page.height - docPdf.page.margins.top - docPdf.page.margins.bottom ] 
					});
				}
			}
			//console.log("saveAsPdf end");
			docPdf.end();
			//console.log("stream pipe");
			let stream = docPdf.pipe(blobStream());
			stream.on('finish', function()
			{
				//console.log("stream.toBlob");
				let blob = stream.toBlob('application/pdf');
				const downloadFile = (blob, fileName) => 
				{
					const link = document.createElement('a');
					// create a blobURI pointing to our Blob
					link.href = URL.createObjectURL(blob);
					link.download = fileName;
					// TODO: look for nicer way to download blob
					// some browser needs the anchor to be in the doc
					document.body.append(link);
					link.click();
					link.remove();
					// in case the Blob uses a lot of memory
					window.addEventListener('focus', e=>URL.revokeObjectURL(link.href), {once:true});
					$("body").removeClass("wait");
				};
				downloadFile(blob, "diagram.pdf");
				//console.log("saveAsPdf done");
			});
		}
		catch(theExp)
		{
			$("body").removeClass("wait");
			console.log(theExp.message);
			console.log(theExp.stack);
			alert(theExp);
		}
	};
	
	//// ///////////////////////////////////////////////////////////////////////
	//// toggle fit class for diagram static images
	//// ///////////////////////////////////////////////////////////////////////
	toggleImgFit()
	{
		$(".displayPngImg").toggleClass("displayPngImgNoFit");
		$(".displayPngDiv").toggleClass("displayPngImgNoFit");
	};
	
	//// ///////////////////////////////////////////////////////////////////////
	//// ///////////////////////////////////////////////////////////////////////
	//// ///////////////////////////////////////////////////////////////////////
}