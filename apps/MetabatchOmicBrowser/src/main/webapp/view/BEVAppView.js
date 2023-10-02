
/* global globalDataAccess, appview, globalDiagramControl, Promise, ko */

// access KnockoutJS appview in this file
var jsBEVAppView = null;

////////////////////////////////////////////////////////////////
//// GUI utility function to disable input during long running processes
////////////////////////////////////////////////////////////////

disableInput = function()
{
	if (notUN(window.frameElement))
	{
		window.parent.disableInput();
	}
	else
	{
		$(":input, a, button, tbody tr").prop("disabled",true);
	}
};

enableInput = function()
{
	if (notUN(window.frameElement))
	{
		window.parent.enableInput();
	}
	else
	{
		$(":input, a, button, tbody tr").prop("disabled",false);
	}
};

////////////////////////////////////////////////////////////////
//// 
////////////////////////////////////////////////////////////////

notUN = function(theValue)
{
	return ((undefined!==theValue)&&(null!==theValue));
};

function supportsPdf(theAlgorithm)
{
	var result = true;
	if (!notUN(theAlgorithm))
	{
		result = false;
	}
	else if (!notUN(theAlgorithm()))
	{
		result = false;
	}
	else if ("NGCHM" === theAlgorithm().entry_label)
	{
		result = false;
	}
	else if ("Supervised Clustering" === theAlgorithm().entry_label)
	{
		result = false;
	}
	else if ("Dispersion Separability Criterion" === theAlgorithm().entry_label)
	{
		result = false;
	}
	return result;
}

function toggleClass(theIdArray, theClass)
{
	for (const id of theIdArray)
	{
		var element1 = document.getElementById(id);
		element1.classList.toggle(theClass);
	}
}

function getWithCheck(theJsonObj, theAttr1, theAttr2)
{
	let val = null;
	if (notUN(theJsonObj))
	{
		val = theJsonObj[theAttr1];
		if (notUN(theAttr2))
		{
			val = val[theAttr2];
		}
	}
	return val;
}
	
function getExistanceNoPromise(theRequestedId, theTextFile)
{
	//duplicated without promise from DataAccess.js to have synchronous option
	var result = "false";
	$.ajax(
	{
		type: "GET",
		dataType: 'text',
		url: "../dsexists",
		cache: false,
		async: false,
		data:
		{
			id: theRequestedId,
			text: theTextFile
		},
		success: function(theText)
		{
			result = theText;
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			console.log("dsexistsnp call" + " :" + textStatus + " and " + errorThrown);
			alert("dsexistsnp call" + " :" + textStatus + " and " + errorThrown);
		}
	});
	return result;
}

function populateArray(theAlg, theLvl1, theArray, theElem)
{
	if ((notUN(theAlg))&&(notUN(theLvl1)))
	{
		theArray.push([theAlg, theLvl1, theElem]);
	}
	else if (notUN(theAlg))
	{
		theArray.push([theAlg, theElem, null]);
	}
	else
	{
		theArray.push([theElem, null, null]);
	}
	return theArray;
}
	
function lookForDiagram(theOptList, theAlg, theLvl1, theLvl2, theLvl3, theArray)
{
	var diaPath = null;
	for (var attr in theOptList)
	{
		if (null===diaPath)
		{
			var elem = theOptList[attr];
			if(notUN(elem.dropdown_entries))
			{
				// search deeper for diagrams
				if (null===theAlg)
				{
					theArray = lookForDiagram(elem.dropdown_entries, elem, null, null, null, theArray);
				}
				else if (null===theLvl1)
				{
					theArray = lookForDiagram(elem.dropdown_entries, theAlg, elem, null, null, theArray);
				}
				else if (null===theLvl2)
				{
					theArray = lookForDiagram(elem.dropdown_entries, theAlg, theLvl1, elem, null, theArray);
				}
				else if (null===theLvl3)
				{
					theArray = lookForDiagram(elem.dropdown_entries, theAlg, theLvl1, theLvl2, elem, theArray);
				}
			}
			else if(notUN(elem.diagram_type))
			{
				if (notUN(elem.pca_values))
				{
					if ("true"===getExistanceNoPromise(jsBEVAppView.requestedId(), elem.pca_values))
					{
						theArray = populateArray(theAlg, theLvl1, theArray, elem);
					}
				}
				else if (notUN(elem.box_data))
				{
					if ("true"===getExistanceNoPromise(jsBEVAppView.requestedId(), elem.box_data))
					{
						theArray = populateArray(theAlg, theLvl1, theArray, elem);
					}
				}
				else if (notUN(elem.umap_umapdata))
				{
					if ("true"===getExistanceNoPromise(jsBEVAppView.requestedId(), elem.umap_umapdata))
					{
						theArray = populateArray(theAlg, theLvl1, theArray, elem);
					}
				}
				else if (notUN(elem.hc_order))
				{
					if ("true"===getExistanceNoPromise(jsBEVAppView.requestedId(), elem.hc_order))
					{
						theArray = populateArray(theAlg, theLvl1, theArray, elem);
					}
				}
				else if (notUN(elem.ngchm))
				{
					if ("true"===getExistanceNoPromise(jsBEVAppView.requestedId(), elem.ngchm))
					{
						theArray = populateArray(theAlg, theLvl1, theArray, elem);
					}
				}
				else if (notUN(elem.pca_values))
				{
					if ("true"===getExistanceNoPromise(jsBEVAppView.requestedId(), elem.pca_values))
					{
						theArray = populateArray(theAlg, theLvl1, theArray, elem);
					}
				}
				else if (notUN(elem.diagram_image))
				{
					if ("true"===getExistanceNoPromise(jsBEVAppView.requestedId(), elem.diagram_image))
					{
						theArray = populateArray(theAlg, theLvl1, theArray, elem);
					}
				}
			}
		}
	}
	return theArray;
}

function pickInterestingDiagram(theDiagramList, theDiagramType)
{
	var diagram = null;
	for (var dia in theDiagramList)
	{
		if (null===diagram)
		{
			dia = theDiagramList[dia];
			// find diagram
			var diaObj = dia[0];
			if (notUN(dia[2]))
			{
				diaObj = dia[2];
			}
			else if (notUN(dia[1]))
			{
				diaObj = dia[1];
			}
			if (theDiagramType === diaObj.diagram_type)
			{
				diagram = dia;
			}
		}
	}
	return diagram;
}

function bevFindDiagram()
{
	//console.log("bevFindDiagram");
	// all diagrams are reachable from alg (top level), which also lets us build selection pattern
	var diaList = lookForDiagram(globalDiagramControl.mAlgOpt(), null, null, null, null, []);
	if (diaList.length>0)
	{
		var selected = pickInterestingDiagram(diaList, "pca");
		if (null===selected)
		{
			selected = pickInterestingDiagram(diaList, "ngchm");
		}
		if (null===selected)
		{
			selected = pickInterestingDiagram(diaList, "sc");
		}
		if (null===selected)
		{
			selected = pickInterestingDiagram(diaList, "hc");
		}
		if (null===selected)
		{
			selected = pickInterestingDiagram(diaList, "boxplot");
		}
		if (null===selected)
		{
			selected = pickInterestingDiagram(diaList, "umap");
		}
		if (null===selected)
		{
			selected = pickInterestingDiagram(diaList, "discrete");
		}
		if (null===selected)
		{
			selected = pickInterestingDiagram(diaList, "mutbatch");
		}
		var alg = selected[0];
		var lvl1 = selected[1];
		var lvl2 = selected[2];
		var lvl3 = selected[3];
		var url = new URL(window.location.href);
		var tmpId = url.searchParams.get("id");
		var tmpIndex = url.searchParams.get("index");
		var newUrl = window.location.origin + window.location.pathname
					+ '?id=' + encodeURIComponent(tmpId) 
					+ '&index='+ encodeURIComponent(tmpIndex);
		if ((notUN(alg))&&(null===lvl1)&&(null===lvl2)&&(null===lvl3))
		{
			// only alg populated
			newUrl = newUrl + '&alg='+ encodeURIComponent(alg.entry_label);
		}
		else if ((notUN(alg))&&(notUN(lvl1))&&(null===lvl2)&&(null===lvl3))
		{
			// alg and lvl1 populated
			newUrl = newUrl + '&alg='+ encodeURIComponent(alg.entry_label);
			newUrl = newUrl + '&lvl1='+ encodeURIComponent(lvl1.entry_label);
		}
		else if ((notUN(alg))&&(notUN(lvl1))&&(notUN(lvl2))&&(null===lvl3))
		{
			// all three populated
			newUrl = newUrl + '&alg='+ encodeURIComponent(alg.entry_label);
			newUrl = newUrl + '&lvl1='+ encodeURIComponent(lvl1.entry_label);
			newUrl = newUrl + '&lvl2='+ encodeURIComponent(lvl2.entry_label);
		}
		else if ((notUN(alg))&&(notUN(lvl1))&&(notUN(lvl2))&&(notUN(lvl3)))
		{
			// all three populated
			newUrl = newUrl + '&alg='+ encodeURIComponent(alg.entry_label);
			newUrl = newUrl + '&lvl1='+ encodeURIComponent(lvl1.entry_label);
			newUrl = newUrl + '&lvl2='+ encodeURIComponent(lvl2.entry_label);
			newUrl = newUrl + '&lvl3='+ encodeURIComponent(lvl3.entry_label);
		}
		//console.log(newUrl);
		window.open(newUrl, 'viewIframe');
	}
	else
	{
		alert("No diagrams were buildable for this dataset.");
	}
}

function bevDatapaneClear()
{
	$('.dpselect').remove();
}

function bevDatapaneCopyAll()
{
	// clear current selection
	window.getSelection().removeAllRanges();
	// get datapane parent node
	let parent = document.querySelector("#BEVDisplay_Datapane_Content");
	// select all children
	window.getSelection().selectAllChildren(parent);
	// do copy
	document.execCommand('copy');
}

function copyURLString()
{
	// based on https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
	var copyText = document.getElementById("bevCopyURL");
	var text = appview.newTabUrl();
	//text = text.replace(/\"/g, "\\\"");
	copyText.value = text;
	copyText.select();
	//For mobile devices
	copyText.setSelectionRange(0, 99999);
	document.execCommand("copy");
	copyText.blur();
}

function processZipSelectEvent(theEvent)
{
	//console.log("file changed");
	let files = theEvent.target.files;
	//console.log(files);
	if (files.length>0)
	{
		let file = files[0];
		//console.log(file);
		globalDataAccess.setZipFile(file);
		globalDataAccess.loadIndexAndId().then((theIndexJson) =>
		{
			appview.jsonIndex(theIndexJson);
		});
	}
}

function BEVAppView(theUseZip)
{
	//console.log("BEVAppView::BEVAppView window.location.href=" + window.location.href);
	//console.log("BEVAppView::BEVAppView id=" + new URL(window.location.href).searchParams.get("id"));
	var self = this;
	jsBEVAppView = this;
	self.type = "deferred";
	// used for prettifying initial load
	self.makeGuiVisible = ko.observable(false);
	// used for ZIP archive file buttons
	self.usezip = ko.observable(theUseZip);
	self.zipFile = ko.observable(null);
	// selected/requested ID/index prefix for data
	self.requestedId = ko.observable(undefined);
	// JSON index from ZIP archive
	self.jsonIndexShowNotice = ko.observable(true);
	self.jsonIndex = ko.observable(undefined);
	self.jsonIndex.subscribe(function(theNewValue)
	{
		// index changed, so make sure Group-Mean is first option for Boxplot
		// simplistic fix -- sort backwards
		theNewValue.mbatch.dropdown_entries.forEach (function (theEntry, theIndex, theArray)
		{
			if ("Boxplot"===theEntry.entry_label)
			{
				theEntry.dropdown_entries.sort(function(theA, theB)
				{
					return theA.entry_label === theB.entry_label ? 0 : (theA.entry_label > theB.entry_label) ? -1 : 1;  
				});
			}
		});
	});
	// this below only needs to be called once, 
	// since it is setting the KnockoutJS object, 
	// which does not change, only the contents change
	globalDiagramControl.setValues(self.jsonIndex);
	// Level 0 dropdown JSON index selections
	self.algorithmLabel = ko.computed(function ()
	{
		let val = undefined;
		if (notUN(self.jsonIndex()))
		{
			val = self.jsonIndex().mbatch.dropdown_label;
		}
		return val;
	});
	self.algorithmOptions = ko.computed(function ()
	{
		let val = undefined;
		if (notUN(self.jsonIndex()))
		{
			val = self.jsonIndex().mbatch.dropdown_entries;
		}
		return val;
	});
	self.algorithmSelected = ko.observable(undefined);
	if (notUN(self.algorithmOptions()))
	{
		self.algorithmSelected(self.algorithmOptions()[0]);
	};
	// Level 1 dropdown JSON index selections
	self.level1Label = ko.computed(function () 
	{
		var result =  null;
		if(notUN(self.algorithmSelected()))
		{
			if(notUN(self.algorithmSelected().dropdown_label))
			{
				result = self.algorithmSelected().dropdown_label;
			}
		}
		return result;
	});
	self.level1Options = ko.computed(function () 
	{
		//console.log("self.level1Options = ko.computed");
		var result =  null;
		if(notUN(self.algorithmSelected()))
		{
			if(notUN(self.algorithmSelected().dropdown_entries))
			{
				result = self.algorithmSelected().dropdown_entries;
			}
		}
		return result;
	});
	self.level1Selected = ko.observable(null);
	if (notUN(self.level1Options()))
	{
		//console.log("if (notUN(self.level1Options()))");
		self.level1Selected(self.level1Options()[0]);
	}
	// Level 2 dropdown JSON index selections
	self.level2Label = ko.computed(function () 
	{
		var result =  null;
		if(notUN(self.level1Selected()))
		{
			if(notUN(self.level1Selected().dropdown_label))
			{
				result = self.level1Selected().dropdown_label;
			}
		}
		return result;
	});
	self.level2Options = ko.computed(function () 
	{
		var result =  null;
		if(notUN(self.level1Selected()))
		{
			if(notUN(self.level1Selected().dropdown_entries))
			{
				result = self.level1Selected().dropdown_entries;
			}
		}
		return result;
	});
	self.level2Selected = ko.observable(null);
	if (notUN(self.level2Options()))
	{
		self.level2Selected(self.level2Options()[0]);
	}
	// Level 3 dropdown JSON index selections
	self.level3Label = ko.computed(function () 
	{
		var result =  null;
		if(notUN(self.level2Selected()))
		{
			if(notUN(self.level2Selected().dropdown_label))
			{
				result = self.level2Selected().dropdown_label;
			}
		}
		return result;
	});
	self.level3Options = ko.computed(function () 
	{
		var result =  null;
		if(notUN(self.level2Selected()))
		{
			if(notUN(self.level2Selected().dropdown_entries))
			{
				result = self.level2Selected().dropdown_entries;
			}
		}
		return result;
	});
	self.level3Selected = ko.observable(null);
	if (notUN(self.level3Options()))
	{
		self.level3Selected(self.level3Options()[0]);
	}
	// Level 4 dropdown JSON index selections
	self.level4Label = ko.computed(function () 
	{
		var result =  null;
		if(notUN(self.level3Selected()))
		{
			if(notUN(self.level3Selected().dropdown_label))
			{
				result = self.level3Selected().dropdown_label;
			}
		}
		return result;
	});
	self.level4Options = ko.computed(function () 
	{
		var result =  null;
		if(notUN(self.level3Selected()))
		{
			if(notUN(self.level3Selected().dropdown_entries))
			{
				result = self.level3Selected().dropdown_entries;
			}
		}
		return result;
	});
	self.level4Selected = ko.observable(null);
	if (notUN(self.level4Options()))
	{
		self.level4Selected(self.level4Options()[0]);
	}
	//console.log("globalDiagramControl.setKOVars");
	globalDiagramControl.setKOVars(self.algorithmOptions, self.algorithmSelected, 
									self.level1Options, self.level1Selected, 
									self.level2Options, self.level2Selected, 
									self.level3Options, self.level3Selected, 
									self.level4Options, self.level4Selected);
	// selected diagram
	self.selectedDiagram = ko.computed(function () 
	{
		var selected = self.level4Selected();
		//console.log("selectedDiagram 4 = " + selected);
		if(!notUN(selected))
		{
			selected = self.level3Selected();
			//console.log("selectedDiagram 3 = " + selected);
			if(!notUN(selected))
			{
				selected = self.level2Selected();
				//console.log("selectedDiagram 2 = " + selected);
				if(!notUN(selected))
				{
					selected = self.level1Selected();
					//console.log("selectedDiagram 1 = " + selected);
					if(!notUN(selected))
					{
						selected = self.algorithmSelected();
						//console.log("selectedDiagram a = " + selected);
					}
				}
			}
		}
		if (self.jsonIndexShowNotice())
		{
			if (selected)
			{
				if (notUN(selected.notice))
				{
					if (""!==selected.notice)
					{
						alert(selected.notice);
						self.jsonIndexShowNotice(false);
					}
				}
			}
		}
		globalDiagramControl.handleNewDiagram(self.requestedId(), selected);
		return selected;
	}).extend({ throttle: 500 });
	//
	self.urlQueryForm = ko.observable("");
	self.urlBevForm = ko.observable("");
	self.urlStdData = ko.observable("");

	self.listOfBatchTypes = ko.observableArray([]);
	//
	Promise.all([
		globalDataAccess.loadLinks(),
		globalDataAccess.setIndexAndId()
	]).then((values) =>
	{
		var linksJson = values[0];
		//console.log("linksJson.queryForm");
		//console.log(linksJson.queryForm);
		if (notUN(linksJson.queryForm))
		{
			self.urlQueryForm(linksJson.queryForm);
		}
		//console.log("linksJson.bevForm");
		//console.log(linksJson.bevForm);
		self.urlBevForm(linksJson.bevForm);
		//console.log("linksJson.stdData");
		//console.log(linksJson.stdData);
		if (notUN(linksJson.stdData))
		{
			self.urlStdData(linksJson.stdData);
		}
		var requestedJson = values[1];
		//console.log("requestedJson");
		//console.log(requestedJson);
		if(notUN(requestedJson))
		{
			if(notUN(requestedJson.mID))
			{
				self.requestedId(requestedJson.mID);
				// handles URL containing link to specific dataset and diagram
				globalDataAccess.loadIndexAndId(self.requestedId).then((theIndexJson) =>
				{
					self.jsonIndex(theIndexJson);
					if(notUN(requestedJson.mAlg))
					{
						self.algorithmOptions().forEach(function(theOpt)
						{
							if (requestedJson.mAlg===theOpt.entry_label)
							{
								self.algorithmSelected(theOpt);
							}
						});
					}
					if((notUN(requestedJson.mLvl1))||(notUN(requestedJson.mData))||(notUN(requestedJson.mTest)))
					{
						//console.log("if(notUN(requestedJson.mLvl1))");
						//console.log(self.level1Options());
						self.level1Options().forEach(function(theOpt)
						{
							if ((notUN(requestedJson.mLvl1))&&(requestedJson.mLvl1===theOpt.entry_label))
							{
								self.level1Selected(theOpt);
							}
							else if ((notUN(requestedJson.mData))&&(requestedJson.mData===theOpt.entry_label))
							{
								self.level1Selected(theOpt);
							}
							else if ((notUN(requestedJson.mTest))&&(requestedJson.mTest===theOpt.entry_label))
							{
								self.level1Selected(theOpt);
							}
						});
					}
					if((notUN(requestedJson.mLvl2))||(notUN(requestedJson.mData))||(notUN(requestedJson.mTest)))
					{
						self.level2Options().forEach(function(theOpt)
						{
							if ((notUN(requestedJson.mLvl2))&&(requestedJson.mLvl2===theOpt.entry_label))
							{
								self.level2Selected(theOpt);
							}
							else if ((notUN(requestedJson.mData))&&(requestedJson.mData===theOpt.entry_label))
							{
								self.level2Selected(theOpt);
							}
							else if ((notUN(requestedJson.mTest))&&(requestedJson.mTest===theOpt.entry_label))
							{
								self.level2Selected(theOpt);
							}
						});
					}
					if((notUN(requestedJson.mLvl3))||(notUN(requestedJson.mData))||(notUN(requestedJson.mTest)))
					{
						self.level3Options().forEach(function(theOpt)
						{
							if ((notUN(requestedJson.mLvl3))&&(requestedJson.mLvl3===theOpt.entry_label))
							{
								self.level3Selected(theOpt);
							}
							else if ((notUN(requestedJson.mData))&&(requestedJson.mData===theOpt.entry_label))
							{
								self.level3Selected(theOpt);
							}
							else if ((notUN(requestedJson.mTest))&&(requestedJson.mTest===theOpt.entry_label))
							{
								self.level3Selected(theOpt);
							}
						});
					}
					if((notUN(requestedJson.mLvl4))||(notUN(requestedJson.mData))||(notUN(requestedJson.mTest)))
					{
						self.level4Options().forEach(function(theOpt)
						{
							if ((notUN(requestedJson.mLvl4))&&(requestedJson.mLvl4===theOpt.entry_label))
							{
								self.level4Selected(theOpt);
							}
							else if ((notUN(requestedJson.mData))&&(requestedJson.mData===theOpt.entry_label))
							{
								self.level4Selected(theOpt);
							}
							else if ((notUN(requestedJson.mTest))&&(requestedJson.mTest===theOpt.entry_label))
							{
								self.level4Selected(theOpt);
							}
						});
					}
					// mark index as changed
					self.jsonIndexShowNotice(true);
					self.makeGuiVisible(true);
				});
				// handle batch types
				globalDataAccess.loadListOfBatchTypes(self.requestedId).then((theBatchTypesJson) =>
				{
					//console.log("theBatchTypesJson");
					//console.log(theBatchTypesJson);
					self.listOfBatchTypes.removeAll();
					for(let index in theBatchTypesJson)
					{
						let bt = theBatchTypesJson[index];
						//console.log("bt=" + bt);
						self.listOfBatchTypes.push(bt);
					}
				});
				//console.log("requestedJson.hideDB=" + requestedJson.hideDB);
				if (true===requestedJson.hideDB)
				{
					//console.log("hide DB");
					hidePlotPicker();
					globalDiagramControl.resize();
				}
				//console.log("requestedJson.hideLP=" + requestedJson.hideLP);
				if (true===requestedJson.hideLP)
				{
					//console.log("hide LP");
					hideLegPaneColumn();
					globalDiagramControl.resize();
				}
			}
			self.makeGuiVisible(true);
		}
		else
		{
			self.makeGuiVisible(true);
		}
		try
		{
			if (notUN(window.parent.setCurrentViewDiagramMqa))
			{
				//console.log("BEVAppView setCurrentViewDiagramMqa");
				//console.log(self.requestedId());
				window.parent.setCurrentViewDiagramMqa(self.requestedId());
			}
			else
			{
				console.log("Skipping call to setCurrentViewDiagramMqa (not integrated)");
			}
		}
		catch(exp)
		{
			console.log("BEVAppView catch");
			console.log(exp);
			alert("Error loading diagram");
		}
	});

	self.newTabUrl = ko.computed(function () 
	{
		let tabUrl = null;
		//console.log("newTabUrl");
		if (false === self.usezip())
		{
			//console.log("newTabUrl process URL");
			var url = new URL(window.location.href);
			var tmpId = url.searchParams.get("id");
			var tmpIndex = url.searchParams.get("index");
			if ((null !== tmpId) && (null !== tmpIndex))
			{
				tabUrl = self.urlBevForm() 
						+ '/?id='+ encodeURIComponent(tmpId) 
						+ '&index='+ encodeURIComponent(tmpIndex);
				if (notUN(self.algorithmSelected()))
				{
					tabUrl = tabUrl + '&alg='+ encodeURIComponent(self.algorithmSelected().entry_label);
				}
				if (notUN(self.level1Selected()))
				{
					tabUrl = tabUrl + '&lvl1='+ encodeURIComponent(self.level1Selected().entry_label);
				}
				if (notUN(self.level2Selected()))
				{
					tabUrl = tabUrl + '&lvl2='+ encodeURIComponent(self.level2Selected().entry_label);
				}
				if (notUN(self.level3Selected()))
				{
					tabUrl = tabUrl + '&lvl3='+ encodeURIComponent(self.level3Selected().entry_label);
				}
				if (notUN(self.level4Selected()))
				{
					tabUrl = tabUrl + '&lvl4='+ encodeURIComponent(self.level4Selected().entry_label);
				}
			}
		}
		if ((notUN(tabUrl))&&(tabUrl.length>=2000))
		{
			alert("Too many criteria selected - resulting URL is too long and may not function properly. Please select fewer criteria.");
		}
		return tabUrl;
	});

	self.getViewSearchFromPath = function(theId, thePath)
	{
		var result = "";
		// id=ed4fa338574fcdd831e6fee5cc793dd4&amp;alg=PCA%2B&amp;lvl1=batch_id&amp;lvl2=ManyToMany&amp;lvl3=DATA_2018-08-23&amp;lvl4=TEST_2022_12_28_1300
		if (""!==theId)
		{
			result = "id=" + theId;
		}
		if (""!==thePath)
		{
			var splitted = thePath.split("/", -1);
			// [0] is empty from initial /
			if (splitted.length>1)
			{
				var algo = splitted[1];
				if ("PCA"===algo)
				{
					algo = "PCA%2B";
				}
				result = result + "&amp;alg=" + algo;
			}
			if (splitted.length>2)
			{
				var lvl1 = splitted[2];
				result = result + "&amp;lvl1=" + lvl1;
			}
			if (splitted.length>3)
			{
				var lvl2 = splitted[3];
				result = result + "&amp;lvl2=" + lvl2;
			}
			if (splitted.length>4)
			{
				var lvl3 = splitted[4];
				result = result + "&amp;lvl3=" + lvl3;
			}
			if (splitted.length>5)
			{
				var lvl4 = splitted[5];
				result = result + "&amp;lvl4=" + lvl4;
			}
		}
		return result;
	};

	self.checkIndexForValue = function(theAttribute, theValue)
	{
		var result = false;
		if (notUN(self.jsonIndex()))
		{
			if (theValue===self.jsonIndex()[theAttribute])
			{
				result = true;
			}
		}
		return result;
	};

	self.indexSource = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'source', null);
	});

	self.indexProgram = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'program', null);
	});

	self.indexProject = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'project', null);
	});
	self.indexCategory = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'category', null);
	});

	self.indexPlatform = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'platform', null);
	});

	self.indexData = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'data', null);
	});

	self.indexDetails = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'details', null);
	});

	self.indexJobType = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'job_type', null);
	});

	self.indexDataVersion = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'data_version', null);
	});

	self.indexTestVersion = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'test_version', null);
	});

	self.indexJobId = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'job_id', null);
	});

	self.indexJobType = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'job_type', null);
	});

	self.indexNotice = ko.computed(function () 
	{
		return getWithCheck(self.jsonIndex(), 'notice', null);
	});
	
	self.isPngDiagram = ko.observable(false);
	self.algorithmSelected.subscribe(function(theNewValue)
	{
		// no longer used -- keep funcationality if needed later
		self.isPngDiagram(false);
	});

	self.humanIdentifier = ko.computed(function ()
	{
		let val =	"BEV ID : " + self.requestedId() + " | " +
					"Source : " + self.indexSource() + " | " +
					"Program : " + self.indexProgram() + " | " +
					"Project : " + self.indexProject() + " | " +
					"Category : " + self.indexCategory() + " | " +
					"Platform : " + self.indexPlatform() + " | " +
					"Data : " + self.indexData() + " | " +
					"Details : " + self.indexDetails() + " | " +
					"Job Type : " + self.indexJobType() + " | " +
					"Data Version : " + self.indexDataVersion() + " | " +
					"Test Version : " + self.indexTestVersion() + " | " +
					"Job Id : " + self.indexJobId() + " | " +
					"Notice : " + self.indexNotice();
		return val;
	}).extend({ rateLimit: 500, method: "notifyWhenChangesStop" });

	self.humanIdentifier.subscribe(function (theValue)
	{
		sendGAEvent('action', 'mobevent-view-results', theValue);
	}, this);
} // END model view
