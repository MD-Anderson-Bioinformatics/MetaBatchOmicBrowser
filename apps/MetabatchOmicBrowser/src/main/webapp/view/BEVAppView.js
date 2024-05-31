
/* global globalDataAccess, appview, globalDiagramControl, Promise, ko */

// access KnockoutJS appview in this file
var jsBEVAppView = null;

function modifyIndexJson(theObject)
{
	if ((typeof theObject !== 'object') || (theObject === null))
	{
		return theObject;
	}
	if (Array.isArray(theObject))
	{
		return theObject.map(modifyIndexJson);
	}
	for (const key in theObject)
	{
		if (theObject.hasOwnProperty(key))
		{
			const value = theObject[key];
			if (key === 'dropdown_label' && value === 'Test Version')
			{
				theObject[key] = 'Result Version'; // Change the value to 'dvorak'
			} else
			{
				theObject[key] = modifyIndexJson(value); // Recursively modify nested objects/arrays
			}
		}
	}
	return theObject;
};

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

function convertToArray(theArrayValue)
{
	var myArray = [];
	if (notUN(theArrayValue))
	{
		if (""!==theArrayValue)
		{
			myArray = [ theArrayValue ];
		}
	}
	return myArray;
}

function getDrilldownNoPromise(theSource, theProgram, theProject, theCategory,
	thePlatform, theData, theDetails, theJobType, theDataVersion, theTestVersion)
{
	//console.log("start getDrilldownNoPromise");
	//console.log("getDrilldownNoPromise theSource= '" + theSource + "'");
	//console.log("getDrilldownNoPromise theProgram= '" + theProgram + "'");
	var drillObj = {};
	drillObj["mSources"] = convertToArray(theSource);
	drillObj["mProgram"] = convertToArray(theProgram);
	drillObj["mProjects"] = convertToArray(theProject);
	drillObj["mCategories"] = convertToArray(theCategory);
	drillObj["mPlatforms"] = convertToArray(thePlatform);
	drillObj["mData"] = convertToArray(theData);
	drillObj["mDetails"] = convertToArray(theDetails);
	drillObj["mJobType"] = convertToArray(theJobType);
	drillObj["mDataVersions"] = convertToArray(theDataVersion);
	drillObj["mTestVersions"] = convertToArray(theTestVersion);
	//console.log("drilldown drillObj");
	//console.log(drillObj);
	var drillString = JSON.stringify(drillObj);
	//console.log(drillString);
	var result = "{}";
	$.ajax(
	{
		type: "GET",
		dataType: 'json',
		url: "../drilldown",
		cache: false,
		async: false,
		data:
		{
			"drill": drillString
		},
		success: function(theJson)
		{
			//console.log("drilldown np");
			//console.log(theJson);
			result = theJson;
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			//console.log("drilldown call" + " :" + textStatus + " and " + errorThrown);
			alert("drilldown call" + " :" + textStatus + " and " + errorThrown);
		}
	});
	return result;
}

function getExistanceNoPromise(theRequestedId, theTextFile)
{
	//console.log("start getExistanceNoPromise");
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
			//console.log("dsexistsnp call" + " :" + textStatus + " and " + errorThrown);
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
	//console.log("start bevFindDiagram");
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
	//console.log("start BEVAppView");
	//console.log("BEVAppView::BEVAppView ====================================================");
	//console.log("BEVAppView::BEVAppView ====================================================");
	//console.log("BEVAppView::BEVAppView window.location.href=" + window.location.href);
	//console.log("BEVAppView::BEVAppView ====================================================");
	//console.log("BEVAppView::BEVAppView ====================================================");
	//console.log("BEVAppView::BEVAppView id=" + new URL(window.location.href).searchParams.get("id"));
	var self = this;
	jsBEVAppView = this;
	//self.type = "deferred";
	// set for first load, to allow 
	var firstLoad = true;
	// used for prettifying initial load
	self.makeGuiVisible = ko.observable(false);
	// used for ZIP archive file buttons
	self.usezip = ko.observable(theUseZip);
	self.zipFile = ko.observable(null);
	// selected/requested ID/index prefix for data
	self.requestedId = ko.observable(undefined);
	// get default value of use simple from URL
	var url = new URL(window.location.href);
	var tmpSimple = url.searchParams.get("useSimple");
	if ("true" === tmpSimple)
	{
		tmpSimple = true;
	} else
	{
		tmpSimple = false;
	}
	self.viewUseSimpleSearch = ko.observable(tmpSimple);
	// Notify always, since we use setting simgple mode to true to reset dropdown contents,
	// which requires being able to do that from simple mode
	self.viewUseSimpleSearch.extend({ notify: 'always' });
	var viewUseSimpleSearchOld = self.viewUseSimpleSearch.peek();
	self.viewUseSimpleSearch.subscribe(function(theNewValue)
	{
		//console.log("self.viewUseSimpleSearch.subscribe theNewValue = " + theNewValue);
		//console.log("self.viewUseSimpleSearch.subscribe viewUseSimpleSearchOld = " + viewUseSimpleSearchOld);
		if (viewUseSimpleSearchOld !== theNewValue)
		{
			if (false===theNewValue)
			{
				//console.log("self.viewUseSimpleSearch.subscribe displayAllButPickerColumn");
				window.parent.setUseSimpleModeFlag(false);
				$( "#dbtabs" ).tabs({ active: 1 });
				displayAllButPickerColumn();
			}
			else
			{
				//console.log("self.viewUseSimpleSearch.subscribe hideAllButPickerColumn");
				window.parent.setUseSimpleModeFlag(true);
				$( "#dbtabs" ).tabs({ active: 0 });
				hideAllButPickerColumn();
			}
			viewUseSimpleSearchOld = theNewValue;
		}
	});
	if (false===tmpSimple)
	{
		$( "#dbtabs" ).tabs({ active: 1 });
		displayAllButPickerColumn();
	}
	else
	{
		//console.log("BEVAppView top level hideAllButPickerColumn");
		$( "#dbtabs" ).tabs({ active: 0 });
		hideAllButPickerColumn();
	}
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
	//console.log("initialize algorithmSelected");
	self.algorithmSelected = ko.observable(undefined);
	self.algorithmSelected.subscribe(function(theNewValue)
	{
		//console.log("algorithmSelected changed");
		//console.log(theNewValue);
		// no longer used -- keep functionality if needed later
		self.isPngDiagram(false);
	});
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
		//console.log("self.algorithmOptions = ko.computed");
		let val = undefined;
		if (notUN(self.jsonIndex()))
		{
			//console.log("self.algorithmOptions = with index");
			//console.log(self.jsonIndex().mbatch.dropdown_entries);
			val = self.jsonIndex().mbatch.dropdown_entries;
		}
		return val;
	});
	self.algorithmOptions.subscribe(function(theNewValue)
	{
		// set to PCA+ as default, if available
		if (notUN(theNewValue))
		{
			var getAlg = requestedJson.mAlg;
			//console.log("BEVAppView self.algorithmOptions.subscribe getAlg = " + getAlg);
			if (!notUN(getAlg))
			{
				getAlg = "PCA+";
				//console.log("BEVAppView self.algorithmOptions.subscribe change to PCA+ = " + getAlg);
			}
			var set = false;
			theNewValue.forEach(function(theOpt)
			{
				if (getAlg===theOpt.entry_label)
				{
					// need valueAllowUnset: true to allow setting default value before options are properly bound
					// since subscribe hits too soon when values are being rendered in HTML,
					// and setting the selected one here gets rejected otherwise
					//console.log("BEVAppView self.algorithmOptions.subscribe getAlg = " + theOpt.entry_label);
					//console.log(theOpt);
					self.algorithmSelected(theOpt);
					// timing issue - the if after the forEach does not recognize this value has been set
					set = true;
				}
			});
			if (!set)
			{
				//console.log("BEVAppView self.algorithmOptions.subscribe set default theNewValue[0] = " + theNewValue[0]);
				self.algorithmSelected(theNewValue[0]);
			}
		};
	});
	//console.log("self.algorithmSelected = ");
	//console.log(self.algorithmSelected());
	//console.log("self.algorithmOptions = ");
	//console.log(self.algorithmOptions());
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
	//
	self.listOfBatchTypes = ko.observableArray([]);
	
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	self.availableSourcesSelected = ko.observable("");
	self.availableProgramSelected = ko.observable("");
	self.availableProjectsSelected = ko.observable("");
	self.availableCategoriesSelected = ko.observable("");
	self.availablePlatformsSelected = ko.observable("");
	self.availableDataSelected = ko.observable("");
	self.availableDetailsSelected = ko.observable("");
	self.availableJobTypeSelected = ko.observable("");
	self.availableDataVersionsSelected = ko.observable("");
	self.availableTestVersionsSelected = ko.observable("");

	self.availableDrillDatasets = ko.observableArray([]);
	self.selectedDrillDataset = ko.computed(function () 
	{
		var value = null;
		if (1===self.availableDrillDatasets().length)
		{
			displayAllButPickerColumn();
			value = self.availableDrillDatasets()[0];
			//console.log("selectedDrillDataset");
			//console.log(value);
			self.requestedId(value[1]);
			if (!firstLoad)
			{
				//console.log("selectedDrillDataset call redoQueryLoadComplete");
				window.parent.redoQueryLoadComplete();
			}
			$( "#dbtabs" ).tabs({ active: 1 });
		}
		return value;
	});
	
	self.simpleModeData = ko.computed(function () 
	{
		//console.log("start compute simpleModeData");
		var value = getDrilldownNoPromise(
				self.availableSourcesSelected(),
				self.availableProgramSelected(),
				self.availableProjectsSelected(),
				self.availableCategoriesSelected(),
				self.availablePlatformsSelected(),
				self.availableDataSelected(),
				self.availableDetailsSelected(),
				self.availableJobTypeSelected(),
				self.availableDataVersionsSelected(),
				self.availableTestVersionsSelected()
		);
		//console.log("simpleModeData value");
		//console.log(value);
		if(notUN(value.data))
		{
			self.availableDrillDatasets(value.data);
		}
		else
		{
			value = null;
		}
		return value;
	}, self).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 500}});
	
	self.availableSources = ko.computed(function () 
	{
		var value = self.simpleModeData();
		if(notUN(value))
		{
			value = value.availableSources;
			if(!notUN(value))
			{
				value = null;
			}
		}
		else
		{
			value = null;
		}
		if (notUN(value))
		{
			if (""===self.availableSourcesSelected())
			{
				if (1===value.length)
				{
					self.availableSourcesSelected(value[0]);
				}
			}
		}
		return value;
	});
	
	self.availableProgram = ko.computed(function () 
	{
		var value = self.simpleModeData();
		if(notUN(value))
		{
			value = value.availableProgram;
			if(!notUN(value))
			{
				value = null;
			}
		}
		else
		{
			value = null;
		}
		if (notUN(value))
		{
			if (""===self.availableProgramSelected())
			{
				if (1===value.length)
				{
					self.availableProgramSelected(value[0]);
				}
			}
		}
		return value;
	});
	
	self.availableProjects = ko.computed(function () 
	{
		var value = self.simpleModeData();
		if(notUN(value))
		{
			value = value.availableProjects;
			if(!notUN(value))
			{
				value = null;
			}
		}
		else
		{
			value = null;
		}
		if (notUN(value))
		{
			if (""===self.availableProjectsSelected())
			{
				if (1===value.length)
				{
					self.availableProjectsSelected(value[0]);
				}
			}
		}
		return value;
	});
	
	self.availableCategories = ko.computed(function () 
	{
		var value = self.simpleModeData();
		if(notUN(value))
		{
			value = value.availableCategories;
			if(!notUN(value))
			{
				value = null;
			}
		}
		else
		{
			value = null;
		}
		if (notUN(value))
		{
			if (""===self.availableCategoriesSelected())
			{
				if (1===value.length)
				{
					self.availableCategoriesSelected(value[0]);
				}
			}
		}
		return value;
	});
	
	self.availablePlatforms = ko.computed(function () 
	{
		var value = self.simpleModeData();
		if(notUN(value))
		{
			value = value.availablePlatforms;
			if(!notUN(value))
			{
				value = null;
			}
		}
		else
		{
			value = null;
		}
		if (notUN(value))
		{
			if (""===self.availablePlatformsSelected())
			{
				if (1===value.length)
				{
					self.availablePlatformsSelected(value[0]);
				}
			}
		}
		return value;
	});
	
	self.availableData = ko.computed(function () 
	{
		var value = self.simpleModeData();
		if(notUN(value))
		{
			value = value.availableData;
			if(!notUN(value))
			{
				value = null;
			}
		}
		else
		{
			value = null;
		}
		if (notUN(value))
		{
			if (""===self.availableDataSelected())
			{
				if (1===value.length)
				{
					self.availableDataSelected(value[0]);
				}
			}
		}
		return value;
	});
	
	self.availableDetails = ko.computed(function () 
	{
		var value = self.simpleModeData();
		if(notUN(value))
		{
			value = value.availableDetails;
			if(!notUN(value))
			{
				value = null;
			}
		}
		else
		{
			value = null;
		}
		if (notUN(value))
		{
			if (""===self.availableDetailsSelected())
			{
				if (1===value.length)
				{
					self.availableDetailsSelected(value[0]);
				}
			}
		}
		return value;
	});
	
	self.availableJobType = ko.computed(function () 
	{
		var value = self.simpleModeData();
		if(notUN(value))
		{
			value = value.availableJobType;
			if(!notUN(value))
			{
				value = null;
			}
		}
		else
		{
			value = null;
		}
		if (notUN(value))
		{
			if (""===self.availableJobTypeSelected())
			{
				if (1===value.length)
				{
					self.availableJobTypeSelected(value[0]);
				}
			}
		}
		return value;
	});
	
	self.availableDataVersions = ko.computed(function () 
	{
		var value = self.simpleModeData();
		if(notUN(value))
		{
			value = value.availableDataVersions;
			if(!notUN(value))
			{
				value = null;
			}
		}
		else
		{
			value = null;
		}
		if (notUN(value))
		{
			if (""===self.availableDataVersionsSelected())
			{
				if (1===value.length)
				{
					self.availableDataVersionsSelected(value[0]);
				}
			}
		}
		return value;
	});
	
	self.availableTestVersions = ko.computed(function () 
	{
		var value = self.simpleModeData();
		if(notUN(value))
		{
			value = value.availableTestVersions;
			if(!notUN(value))
			{
				value = null;
			}
		}
		else
		{
			value = null;
		}
		if (notUN(value))
		{
			if (""===self.availableTestVersionsSelected())
			{
				if (1===value.length)
				{
					self.availableTestVersionsSelected(value[0]);
				}
			}
		}
		return value;
	});
	
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	//console.log("handle displaying diagrams and processing URL");
	try
	{
		var requestedJson = globalDataAccess.getIndexAndId();
		//console.log("requestedJson");
		//console.log(requestedJson);
		if(notUN(requestedJson))
		{
			if(notUN(requestedJson.ssource))
			{
				self.availableSourcesSelected(requestedJson.ssource);
			}
			if(notUN(requestedJson.sprogram))
			{
				self.availableProgramSelected(requestedJson.sprogram);
			}
			if(notUN(requestedJson.sproject))
			{
				self.availableProjectsSelected(requestedJson.sproject);
			}
			if(notUN(requestedJson.scategory))
			{
				self.availableCategoriesSelected(requestedJson.scategory);
			}
			if(notUN(requestedJson.splatform))
			{
				self.availablePlatformsSelected(requestedJson.splatform);
			}
			if(notUN(requestedJson.sdata))
			{
				self.availableDataSelected(requestedJson.sdata);
			}
			if(notUN(requestedJson.sdetails))
			{
				self.availableDetailsSelected(requestedJson.sdetails);
			}
			if(notUN(requestedJson.sjobtype))
			{
				self.availableJobTypeSelected(requestedJson.sjobtype);
			}
			if(notUN(requestedJson.sdataversion))
			{
				self.availableDataVersionsSelected(requestedJson.sdataversion);
			}
			if(notUN(requestedJson.stestversion))
			{
				self.availableTestVersionsSelected(requestedJson.stestversion);
			}
			if(notUN(requestedJson.mID))
			{
				self.requestedId(requestedJson.mID);
				//console.log("set viewUseSimpleSearch to " + requestedJson.useSimple);
				self.viewUseSimpleSearch(requestedJson.useSimple);
				// handles URL containing link to specific dataset and diagram
				//console.log("BEVAppView requestedJson.mID = " + requestedJson.mID);
				globalDataAccess.loadIndexAndId(self.requestedId).then((theIndexJson) =>
				{
					//console.log("start loadIndexAndId");
					//console.log("BEVAppView requestedJson");
					//console.log(requestedJson);
					theIndexJson = modifyIndexJson(theIndexJson);
					self.jsonIndex(theIndexJson);
					if(notUN(requestedJson.mAlg))
					{
						var getAlg = requestedJson.mAlg;
						if (!notUN(getAlg))
						{
							getAlg = "PCA+";
						}
						self.algorithmOptions().forEach(function(theOpt)
						{
							//console.log("BEVAppView theOpt = " + theOpt.entry_label);
							if (getAlg===theOpt.entry_label)
							{
								//console.log("BEVAppView select algorithm " + theOpt.entry_label);
								//console.log(theOpt);
								self.algorithmSelected(theOpt);
								self.algorithmSelected.valueHasMutated();
								//console.log("BEVAppView post set " + theOpt.entry_label);
								//console.log(theOpt);
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
					firstLoad = false;
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
			else
			{
				self.makeGuiVisible(true);
				firstLoad = false;
			}
		}
	}
	catch(exp)
	{
		console.log("BEVAppView catch");
		console.log(exp);
		alert("Error loading diagram");
	}
	
	// selected diagram
	self.selectedDiagram = ko.computed(function () 
	{
		//console.log("start selectedDiagram");
		var selected = self.level4Selected();
		//console.log("selectedDiagram 4 = ");
		//console.log(selected);
		if(!notUN(selected))
		{
			selected = self.level3Selected();
			//console.log("selectedDiagram 3 = ");
			//console.log(selected);
			if(!notUN(selected))
			{
				selected = self.level2Selected();
				//console.log("selectedDiagram 2 = ");
				//console.log(selected);
				if(!notUN(selected))
				{
					selected = self.level1Selected();
					//console.log("selectedDiagram 1 = ");
					//console.log(selected);
					if(!notUN(selected))
					{
						selected = self.algorithmSelected();
						//console.log("selectedDiagram a = ");
						//console.log(selected);
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
		//console.log("selectedDiagram computed");
		//console.log(self.requestedId());
		//console.log(selected);
		//console.log("call handleNewDiagram");
		globalDiagramControl.handleNewDiagram(self.requestedId(), selected);
		return selected;
	}, self).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 500}});

	self.makeGuiVisible(true);

	self.getViewSearchFromPath = function(theId, thePath)
	{
		//console.log("start getViewSearchFromPath");
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

	self.humanIdentifier = ko.computed(function ()
	{
		//console.log("start humanIdentifier");
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
					"Results Version : " + self.indexTestVersion() + " | " +
					"Job Id : " + self.indexJobId() + " | " +
					"Notice : " + self.indexNotice();
		return val;
	}, self).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 500}});

	self.humanIdentifier.subscribe(function (theValue)
	{
		sendGAEvent('action', 'mobevent-view-results', theValue);
	}, this);
} // END model view
