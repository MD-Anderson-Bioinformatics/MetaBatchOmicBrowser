/* global URL, globalDiagramControl, d3 */

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
		this.mLv3Opt = null;
		this.mLv3Sel = null;
		this.mLv4Opt = null;
		this.mLv4Sel = null;
		this.mBevUrl = theBevUrl;

		this.notExistHTML = function()
		{
			var alg = this.mAlgSel();
			if (notUN(alg))
			{
				alg = alg.entry_label;
			}
			else
			{
				alg = "";
			}
			var lvl1 = this.mLv1Sel();
			if (notUN(lvl1))
			{
				lvl1 = lvl1.entry_label;
			}
			else
			{
				lvl1 = "";
			}
			var lvl2 = this.mLv2Sel();
			if (notUN(lvl2))
			{
				lvl2 = lvl2.entry_label;
			}
			else
			{
				lvl2 = "";
			}
			var lvl3 = this.mLv3Sel();
			if (notUN(lvl3))
			{
				lvl3 = lvl3.entry_label;
			}
			else
			{
				lvl3 = "";
			}
			var lvl4 = this.mLv4Sel();
			if (notUN(lvl4))
			{
				lvl4 = lvl4.entry_label;
			}
			else
			{
				lvl4 = "";
			}
			return "<br>Due to NAs or other data issues, this analysis was unable to be generated. Please try a different diagram." + 
				"Click <button type='button' id='NotExistButton' " +
				"onclick='bevFindDiagram(\"" + 
				alg + "\", \"" + 
				lvl1 + "\", \"" + 
				lvl2 + "\", \"" + 
				lvl3 + "\", \"" + 
				lvl4 + "\" ); " + 
				"return false;'>here</button> to find an available diagram.";
		};
	};
	
	addHighlighting(theClassname)
	{
		d3.selectAll(("."+theClassname)).classed("SelectedBatch", true);
	}

	removeHighlighting(theClassname)
	{
		d3.selectAll(("."+theClassname)).classed("SelectedBatch", false);
	}
	
	setKOVars(theAlgOpt, theAlgSel, theLv1Opt, theLv1Sel, theLv2Opt, theLv2Sel, theLv3Opt, theLv3Sel, theLv4Opt, theLv4Sel)
	{
		this.mAlgOpt = theAlgOpt;
		this.mAlgSel = theAlgSel;
		this.mLv1Opt = theLv1Opt;
		this.mLv1Sel = theLv1Sel;
		this.mLv2Opt = theLv2Opt;
		this.mLv2Sel = theLv2Sel;
		this.mLv3Opt = theLv3Opt;
		this.mLv3Sel = theLv3Sel;
		this.mLv4Opt = theLv4Opt;
		this.mLv4Sel = theLv4Sel;
	};
	
	getEntries(theDatasetPath)
	{
		if (theDatasetPath.startsWith("/"))
		{
			theDatasetPath = theDatasetPath.substr(1);
		}
		var splitted = theDatasetPath.split("/");
		var alg = splitted[0];
		var batchType = splitted[1];
		var plotType = splitted[2];
		var dataVersion = "";
		if (splitted.length>3)
		{
			dataVersion = splitted[3];
		}
		var testVersion = "";
		if (splitted.length>4)
		{
			testVersion = splitted[4];
		}
		return [ alg, batchType, plotType, dataVersion, testVersion ];
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
		// only called from DSC to select a PCA+ result
		//console.log("DiagramControl::selectDiagram called");
		//console.log("theDatasetPath=" + theDatasetPath);
		// get last four entries (algorith, level 1, level 2, level 3)
		var [alg, lv1, lv2, lv3, lv4] = this.getEntries(theDatasetPath);
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
		if((notUN(this.mLv3Sel()))&&(lv3!==this.mLv3Sel().entry_label))
		{
			this.mLv3Sel(this.getMatchingList(this.mLv3Opt(), lv3));
		}
		if((notUN(this.mLv4Sel()))&&(lv4!==this.mLv4Sel().entry_label))
		{
			this.mLv4Sel(this.getMatchingList(this.mLv4Opt(), lv4));
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
			//console.log("handleNewDiagram theNewDiagram.diagram_type='" + theNewDiagram.diagram_type + "'");
			//console.log(theNewDiagram);
			if(notUN(theNewDiagram.diagram_type)&&(''!==theNewDiagram.diagram_type))
			{
				//console.log("handleNewDiagram " + theDatasetId);
				//console.log(theNewDiagram);
				
				//console.log("DiagramControl::handleNewDiagram disable input disabled when new diagram started - enable in resize");
				disableInput();
				this.resizeFunction = null;
				this.removePlotChildren();
				var diagramType = theNewDiagram.diagram_type;
				//console.log("diagramType = '" + diagramType + "'");
				if ("boxplot" === diagramType)
				{
					this.handleNewBoxplot(theDatasetId, theNewDiagram);
				}
				else if ("volcano" === diagramType)
				{
					this.handleNewVolcano(theDatasetId, theNewDiagram);
				}
				else if ("cdp" === diagramType)
				{
					this.handleNewCdp(theDatasetId, theNewDiagram);
				}
				else if ("umap" === diagramType)
				{
					this.handleNewUmap(theDatasetId, theNewDiagram);
				}
				else if ("dsc" === diagramType)
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
				else if ("venn" === diagramType)
				{
					this.handleNewVenn(theDatasetId, theNewDiagram);
				}
				else
				{
					console.log("Unknown diagram type:" + diagramType);
					//console.log(theNewDiagram);
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
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
			}
			else
			{
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, passedThis.divDiagramId);
				passedThis.dataAccess.addImage(theDatasetId, undefined, passedThis.divLegendId);
			}
			passedThis.resizeUtil = null;
			// call through globalDiagramControl in order to trigger other gui events
			// done here, since there is no Util for images
			globalDiagramControl.resize();
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
		var passedThis = this;
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.diagram_image).then(function (exists)
		{
			//console.log("DiagramControl::handleNewDiscrete getExistance");
			if ("false"===exists)
			{
				//console.log("DiagramControl::handleNewDiscrete false===exists");
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
				passedThis.resizeUtil = null;
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				globalDiagramControl.resize();
			}
			else
			{
				//console.log("DiagramControl::handleNewDiscrete pre newBoxplot");
				var ub = new UtilBar(passedThis.dataAccess, passedThis.divDiagramId, passedThis.divLegendId, 
									passedThis.divDatapaneId, theNewDiagram, passedThis.indexKO, theDatasetId);
				ub.newBar(passedThis.makeDataPointLog);
				passedThis.resizeUtil = ub;
				//console.log("DiagramControl::handleNewDiscrete post newBoxplot");
				//this.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, this.divDiagramId);
				//this.dataAccess.addImage(theDatasetId, theNewDiagram.legend_image, this.divLegendId);
			}
			//console.log("DiagramControl::handleNewDiscrete getExistance done");
		});
	};
	
	handleNewVolcano(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewVolcano called");
		// clear any existing images -- clear calls are syncronous
		this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
		this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
		this.resizeUtil = null;
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		var passedThis = this;
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.volcano_data).then(function (exists)
		{
			//console.log("DiagramControl::handleNewVolcano getExistance");
			if ("false"===exists)
			{
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
				passedThis.resizeUtil = null;
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				globalDiagramControl.resize();
			}
			else
			{
				//console.log("DiagramControl::handleNewVolcano pre newBoxplot");
				var ub = new UtilVolcano(passedThis.dataAccess, passedThis.divDiagramId, passedThis.divLegendId, passedThis.divDatapaneId, theNewDiagram, passedThis.indexKO, theDatasetId);
				ub.newVolcano(passedThis.makeDataPointLog);
				passedThis.resizeUtil = ub;
				console.log("DiagramControl::handleNewVolcano post newBoxplot");
				// passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, passedThis.divDiagramId);
				//passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.legend_image, passedThis.divLegendId);
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				// globalDiagramControl.resize();
			}
			//console.log("DiagramControl::handleNewBoxplot getExistance done");
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
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
				passedThis.resizeUtil = null;
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				globalDiagramControl.resize();
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
	
	handleNewUmap_images(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewUmap called");
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
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
			}
			else
			{
				// load calls for an image are asyncronous
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, passedThis.divDiagramId);
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.legend_image, passedThis.divLegendId);
			}
			passedThis.resizeUtil = null;
			// call through globalDiagramControl in order to trigger other gui events
			// done here, since there is no Util for images
			globalDiagramControl.resize();
			//console.log("DiagramControl::handleNewUmap getExistance done");
		});
	};
	
	handleNewUmap(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewUmap called");
		// clear any existing images -- clear calls are syncronous
		this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
		this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		var passedThis = this;
		passedThis.resizeUtil = null;
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.umap_umapdat).then(function (exists)
		{
			//console.log("DiagramControl::handleNewUmap getExistance");
			if ("false"===exists)
			{
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
				passedThis.resizeUtil = null;
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				globalDiagramControl.resize();
			}
			else
			{
				// load calls for an image are asyncronous
				//passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, passedThis.divDiagramId);
				//passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.legend_image, passedThis.divLegendId);
				var ub = new UtilScatterplot(passedThis.dataAccess, passedThis.divDiagramId, passedThis.divLegendId, passedThis.divDatapaneId, theNewDiagram, passedThis.indexKO, theDatasetId);
				ub.newScatterplot(passedThis.makeDataPointLog);
				passedThis.resizeUtil = ub;
			}
			//passedThis.resizeUtil = null;
			// call through globalDiagramControl in order to trigger other gui events
			// done here, since there is no Util for images
			//globalDiagramControl.resize();
			//console.log("DiagramControl::handleNewUmap  getExistance done");
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
		//console.log("DiagramControl::handleNewCdp theNewDiagram.diagram_image=" + theNewDiagram.diagram_image);
		var passedThis = this;
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.diagram_image).then(function (exists)
		{
			//console.log("DiagramControl::handleNewCdp getExistance");
			if ("false"===exists)
			{
				//console.log("DiagramControl::handleNewCdp addText");
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
			}
			else
			{
				//console.log("DiagramControl::handleNewCdp addImage");
				// load calls for an image are asyncronous
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, passedThis.divDiagramId);
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.legend_image, passedThis.divLegendId);
			}
			passedThis.resizeUtil = null;
			// call through globalDiagramControl in order to trigger other gui events
			// done here, since there is no Util for images
			globalDiagramControl.resize();
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
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
				passedThis.resizeUtil = null;
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				globalDiagramControl.resize();
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
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
				passedThis.resizeUtil = null;
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				globalDiagramControl.resize();
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

	handleNewVenn(theDatasetId, theNewDiagram)
	{
		//console.log("DiagramControl::handleNewVenn called");
		// clear any existing images -- clear calls are syncronous
		this.dataAccess.addImage(theDatasetId, undefined, this.divDiagramId);
		this.dataAccess.addImage(theDatasetId, undefined, this.divLegendId);
		this.resizeUtil = null;
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		var passedThis = this;
		this.dataAccess.getExistance(theDatasetId, theNewDiagram.venn_data).then(function (exists)
		{
			//console.log("DiagramControl::handleNewVenn getExistance");
			if ("false"===exists)
			{
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
				passedThis.resizeUtil = null;
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				globalDiagramControl.resize();
			}
			else
			{
				var uv = new UtilVenn(passedThis.dataAccess, passedThis.divDiagramId, 
									passedThis.divLegendId, passedThis.divDatapaneId, 
									theNewDiagram, passedThis.indexKO, theDatasetId);
				uv.newVenn(passedThis.makeDataPointLog);
				passedThis.resizeUtil = uv;
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
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
				passedThis.resizeUtil = null;
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				globalDiagramControl.resize();
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
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
				passedThis.resizeUtil = null;
				// call through globalDiagramControl in order to trigger other gui events
				// done here, since there is no Util for images
				globalDiagramControl.resize();
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
				passedThis.dataAccess.addText(globalDiagramControl.notExistHTML(), passedThis.divDiagramId);
			}
			else
			{
				// load calls for an image are asyncronous
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.diagram_image, passedThis.divDiagramId);
				passedThis.dataAccess.addImage(theDatasetId, theNewDiagram.legend_image, passedThis.divLegendId);
			}
			passedThis.resizeUtil = null;
			// call through globalDiagramControl in order to trigger other gui events
			// done here, since there is no Util for images
			globalDiagramControl.resize();
			//console.log("DiagramControl::handleNewSuperClust getExistance done");
		});
	};
	
	makeDataPointLog(struct, dataNode)
	{
		//console.log("makeDataPointLog struct");
		//console.log(struct);
		//console.log("makeDataPointLog dataNode");
		//console.log(dataNode);
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

	asyncedSaveAsPdf(theSvg, theMyThis)
	{
		// TODO: remove code duplication between saveAsPdf and asyncedSaveAsPdf, caused because Plotly insists on uses promises when none of the other code does
		try
		{
			//console.log("saveAsPdf try");
			// LETTER = width: 612, height: 792
			let docPdf = new PDFDocument({compress: false, size: [612, 792]});
			// getSVGContent
			let hiddenDiv = document.getElementById('renderSvgForPrinting');
			console.log("Before Call myThis.resizeUtil.plot.getSVGContent()");
			hiddenDiv.innerHTML = theSvg;
			console.log("After Call myThis.resizeUtil.plot.getSVGContent()");
			SVGtoPDF(docPdf, hiddenDiv.firstChild, 0, 0, {useCSS: true, assumePt: false, preserveAspectRatio: 'xMinYMin meet', width: 612, height: 792});
			hiddenDiv.innerHTML = "";
			// handle plots that also have HTML content (like PCA+)
			if(notUN(theMyThis.resizeUtil.plot.getExtraPdfContent))
			{
				docPdf = theMyThis.resizeUtil.plot.getExtraPdfContent(docPdf);
			}
			//console.log("typeof(myThis.resizeUtil.plot)");
			// TODO:BEV: change method to detect hierclustering
			if ( (notUN(theMyThis.resizeUtil.plot.getGroupVariables)) && (notUN(document.getElementById("hierClustPlotLegend"))) )
			{
				// iterate over batch types -- should be only for HC
				// getLegendSVGContent
				//console.log(myThis.resizeUtil.plot.getGroupVariables());
				var batchTypeArray = theMyThis.resizeUtil.plot.getGroupVariables();
				for(var batchTypeIndex in batchTypeArray)
				{
					//console.log("batchTypeIndex = " + batchTypeIndex);
					var batchType = batchTypeArray[batchTypeIndex];
					//console.log("batchType");
					//console.log(batchType);
					docPdf.addPage({compress: false, size: [612, 792]});
					// hierClustPlotSelect
					//console.log("set batchType");
					$('#hierClustPlotSelect').val(batchType).change();
					// changes drop down, does not fire change event, manually update legend 
					let divEle = document.getElementById("hierClustPlotLegend");
					divEle.innerHTML = "";
					theMyThis.resizeUtil.plot.makeLegend(batchType, divEle);
					// get SVG text
					//console.log("get SVG via batchType text");
					var svgText = theMyThis.resizeUtil.plot.getLegendSVGContent(batchType);
					//console.log("got svg text");
					//console.log(svgText);
					hiddenDiv.innerHTML = svgText;
					SVGtoPDF(docPdf, hiddenDiv.firstChild, 0, 0, {useCSS: true, assumePt: false, preserveAspectRatio: 'xMinYMin meet', width: 612, height: 792});
					hiddenDiv.innerHTML = "";
				}
			}
			else
			{
				// getLegendSVGContent - for things other than hierarchical clustering
				//console.log("myThis.resizeUtil.plot.getLegendSVGContent() 2");
				docPdf.addPage({compress: false, size: [612, 792]});
				hiddenDiv.innerHTML = theMyThis.resizeUtil.plot.getLegendSVGContent();
				SVGtoPDF(docPdf, hiddenDiv.firstChild, 0, 0, {useCSS: true, assumePt: false, preserveAspectRatio: 'xMinYMin meet', width: 612, height: 792});
				hiddenDiv.innerHTML = "";
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
					// some browser needs the anchor to be in the doc
					document.body.append(link);
					link.click();
					link.remove();
					// in case the Blob uses a lot of memory
					window.addEventListener('focus', e=>URL.revokeObjectURL(link.href), {once:true});
					$("body").removeClass("wait");
				};
				downloadFile(blob, "diagram.pdf");
				//console.log("saveAsPdf done (enable input)");
				enableInput();
			});
		}
		catch(theExp)
		{
			$("body").removeClass("wait");
			console.log(theExp.message);
			console.log(theExp.stack);
			alert(theExp);
			enableInput();
		}
	}

	saveAsPdf()
	{
		//console.log("saveAsPdf start");
		disableInput();
		$("body").addClass("wait");
		// inside setTimeout, this changes to something else, so save this
		var myThis = this;
		// use timeout to move other code later in thread execution, so disable input can disable the buttons
		setTimeout(function()
		{
			try
			{
				var doingAsync = false;
				if(notUN(myThis.resizeUtil))
				{
					// D3 plugin (or DSC)
					if(notUN(myThis.resizeUtil.plot.getAsyncSVGContent))
					{
						myThis.resizeUtil.plot.getAsyncSVGContent(myThis.asyncedSaveAsPdf, myThis);
						doingAsync = true;
					}
				}
				if (!doingAsync)
				{
					//console.log("saveAsPdf try");
					// LETTER = width: 612, height: 792
					let docPdf = new PDFDocument({compress: false, size: [612, 792]});
					if(notUN(myThis.resizeUtil))
					{
						if(notUN(myThis.resizeUtil.plot.getSVGContent))
						{
							// getSVGContent
							let hiddenDiv = document.getElementById('renderSvgForPrinting');
							console.log("Before Call myThis.resizeUtil.plot.getSVGContent()");
							hiddenDiv.innerHTML = myThis.resizeUtil.plot.getSVGContent();
							console.log("After Call myThis.resizeUtil.plot.getSVGContent()");
							SVGtoPDF(docPdf, hiddenDiv.firstChild, 0, 0, {useCSS: true, assumePt: false, preserveAspectRatio: 'xMinYMin meet', width: 612, height: 792});
							hiddenDiv.innerHTML = "";
							// handle plots that also have HTML content (like PCA+)
							if(notUN(myThis.resizeUtil.plot.getExtraPdfContent))
							{
								docPdf = myThis.resizeUtil.plot.getExtraPdfContent(docPdf);
							}
							//console.log("typeof(myThis.resizeUtil.plot)");
							// TODO:BEV: change method to detect hierclustering
							if ( (notUN(myThis.resizeUtil.plot.getGroupVariables)) && (notUN(document.getElementById("hierClustPlotLegend"))) )
							{
								// iterate over batch types -- should be only for HC
								// getLegendSVGContent
								//console.log(myThis.resizeUtil.plot.getGroupVariables());
								var batchTypeArray = myThis.resizeUtil.plot.getGroupVariables();
								for(var batchTypeIndex in batchTypeArray)
								{
									//console.log("batchTypeIndex = " + batchTypeIndex);
									var batchType = batchTypeArray[batchTypeIndex];
									//console.log("batchType");
									//console.log(batchType);
									docPdf.addPage({compress: false, size: [612, 792]});
									// hierClustPlotSelect
									//console.log("set batchType");
									$('#hierClustPlotSelect').val(batchType).change();
									// changes drop down, does not fire change event, manually update legend 
									let divEle = document.getElementById("hierClustPlotLegend");
									divEle.innerHTML = "";
									myThis.resizeUtil.plot.makeLegend(batchType, divEle);
									// get SVG text
									//console.log("get SVG via batchType text");
									var svgText = myThis.resizeUtil.plot.getLegendSVGContent(batchType);
									//console.log("got svg text");
									//console.log(svgText);
									hiddenDiv.innerHTML = svgText;
									SVGtoPDF(docPdf, hiddenDiv.firstChild, 0, 0, {useCSS: true, assumePt: false, preserveAspectRatio: 'xMinYMin meet', width: 612, height: 792});
									hiddenDiv.innerHTML = "";
								}
							}
							else
							{
								// getLegendSVGContent - for things other than hierarchical clustering
								//console.log("myThis.resizeUtil.plot.getLegendSVGContent() 2");
								docPdf.addPage({compress: false, size: [612, 792]});
								hiddenDiv.innerHTML = myThis.resizeUtil.plot.getLegendSVGContent();
								SVGtoPDF(docPdf, hiddenDiv.firstChild, 0, 0, {useCSS: true, assumePt: false, preserveAspectRatio: 'xMinYMin meet', width: 612, height: 792});
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
							docPdf.addPage({compress: false, size: [612, 792]});
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
							// some browser needs the anchor to be in the doc
							document.body.append(link);
							link.click();
							link.remove();
							// in case the Blob uses a lot of memory
							window.addEventListener('focus', e=>URL.revokeObjectURL(link.href), {once:true});
							$("body").removeClass("wait");
						};
						downloadFile(blob, "diagram.pdf");
						//console.log("saveAsPdf done (enable input)");
						enableInput();
					});
				}
			}
			catch(theExp)
			{
				$("body").removeClass("wait");
				console.log(theExp.message);
				console.log(theExp.stack);
				alert(theExp);
				enableInput();
			}
		}, 0);
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