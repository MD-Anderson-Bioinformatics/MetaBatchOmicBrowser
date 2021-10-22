/* global appview, ko */

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

initializeTooltips = function()
{
	var tooltipsImg = document.querySelectorAll('*[id^="tooltipImage_"]');
	var tooltipsCont = document.querySelectorAll('*[id^="tooltipContent_"]');
	for(i=0; i<tooltipsImg.length; i++)
	{
		//link tooltipImg to tooltipCont by shared value of the respective data attributes
		tippy('#'+tooltipsImg[i].id, {html: '#'+tooltipsCont[i].id, interactive: true, trigger: 'click' });
	}
};

activateTooltip = function(theImageId, theContentId)
{
	tippy('#'+theImageId, {html: '#'+theContentId, interactive: true, trigger: 'click' } );
};

notUN = function(theValue)
{
	return ((undefined!==theValue)&&(null!==theValue));
};

// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel()
{
	//console.log("MQA AppViewModel starting");
	var self = this;
	self.type = "deferred";
	
	// used to mark currently displayed dataset
	self.viewedDatasetId = ko.observable(null);
	self.viewedDatasetDscid = ko.observable(null);

	//console.log("MQA AppViewModel URL");
	var url = new URL(window.location.href);
	var defaultQueryJSON = url.searchParams.get("default");
	var defaultUrlPageLength = url.searchParams.get("pageLength");
	self.defaultPageLength = ko.observable(defaultUrlPageLength);
	self.defaultQuery = ko.observable("");
	if (null!==defaultQueryJSON)
	{
		self.defaultQuery(JSON.parse(defaultQueryJSON));
	}

	var urlShowParam = url.searchParams.get("show");
	self.urlShowParam = ko.observable("");
	if ("dsc"!==urlShowParam)
	{
		self.urlShowParam("matrix");
	}
	else
	{
		self.urlShowParam("dsc");
	}

	//console.log("MQA AppViewModel View");
	self.makeGuiVisible = ko.observable(false); //.extend({ deferred: true });
	self.firstLoad = ko.observable(true);
	// use array to track populating by calls to server, add these to keep populated until others are added
	self.doneLoading = ko.observableArray(["DSC-min", "DSC-max"]);

	self.populateMinMax = function(theSelected, theEntered, theQuery, theLoadMarker)
	{
		if(notUN(theQuery))
		{
			theSelected(theQuery);
			theEntered(theQuery);
		}
		else
		{
			theSelected("");
			theEntered("");
		}
		self.doneLoading.remove(theLoadMarker);
	};

	function getQueryDefault(theAttribute)
	{
		var result = null;
		if (""!==self.defaultQuery())
		{
			result = self.defaultQuery()[theAttribute];
		}
		return result;
	}

	////////////////////////////////////////////////////////////////
	//// files
	////////////////////////////////////////////////////////////////
	self.optionsFiles = ko.observableArray();
	self.selectedFiles = ko.observableArray();
	self.urlFiles = getQueryDefault("mFiles");
	self.defaultFiles = [];
	self.classFiles = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// source
	////////////////////////////////////////////////////////////////
	self.optionsSources = ko.observableArray();
	self.selectedSources = ko.observableArray();
	self.urlSources = getQueryDefault("mSources");
	self.defaultSources = [];
	self.classSources = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// variant
	////////////////////////////////////////////////////////////////
	self.optionsVariants = ko.observableArray();
	self.selectedVariants = ko.observableArray();
	self.urlVariants = getQueryDefault("mVariants");
	self.defaultVariants = [];
	self.classVariants = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// project
	////////////////////////////////////////////////////////////////
	self.optionsProjects = ko.observableArray();
	self.selectedProjects = ko.observableArray();
	self.urlProjects = getQueryDefault("mProjects");
	self.defaultProjects = [];
	self.classProjects = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// subproject
	////////////////////////////////////////////////////////////////
	self.optionsSubprojects = ko.observableArray();
	self.selectedSubprojects = ko.observableArray();
	self.urlSubprojects = getQueryDefault("mSubprojects");
	self.defaultSubprojects = [];
	self.classSubprojects = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// categories
	////////////////////////////////////////////////////////////////
	self.optionsCategories = ko.observableArray();
	self.selectedCategories = ko.observableArray();
	self.urlCategories = getQueryDefault("mCategories");
	self.defaultCategories = [];
	self.classCategories = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// platform
	////////////////////////////////////////////////////////////////
	self.optionsPlatforms = ko.observableArray();
	self.selectedPlatforms = ko.observableArray();
	self.urlPlatforms = getQueryDefault("mPlatforms");
	self.defaultPlatforms = [];
	self.classPlatforms = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// data
	////////////////////////////////////////////////////////////////
	self.optionsData = ko.observableArray();
	self.selectedData = ko.observableArray();
	self.urlData = getQueryDefault("mData");
	self.defaultData = [];
	self.classData = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// algorithm
	////////////////////////////////////////////////////////////////
	self.optionsAlgorithms = ko.observableArray();
	self.selectedAlgorithms = ko.observableArray();
	self.urlAlgorithms = getQueryDefault("mAlgorithms");
	self.defaultAlgorithms = [];
	self.classAlgorithms = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// detail
	////////////////////////////////////////////////////////////////
	self.optionsDetails = ko.observableArray();
	self.selectedDetails = ko.observableArray();
	self.urlDetails = getQueryDefault("mDetails");
	self.defaultDetails = [];
	self.classDetails = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// version
	////////////////////////////////////////////////////////////////
	self.optionsVersions = ko.observableArray();
	self.selectedVersions = ko.observableArray();
	self.urlVersions = getQueryDefault("mVersions");
	self.defaultVersions = [];
	self.classVersions = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// min
	////////////////////////////////////////////////////////////////
	self.selectedOverallDSCmin = ko.observable("");
	self.enteredOverallDSCmin = ko.observable("");
	self.urlOverallDSCmin = getQueryDefault("mOverallDSCmin");
 
	////////////////////////////////////////////////////////////////
	//// max
	////////////////////////////////////////////////////////////////
	self.selectedOverallDSCmax = ko.observable("");
	self.enteredOverallDSCmax = ko.observable("");
	self.urlOverallDSCmax = getQueryDefault("mOverallDSCmax");

	////////////////////////////////////////////////////////////////
	//// version
	////////////////////////////////////////////////////////////////
	self.optionsOverallDSCpvalue = ko.observableArray();
	self.selectedOverallDSCpvalue = ko.observableArray();
	self.urlOverallDSCpvalue = getQueryDefault("mOverallDSCpvalue");
	self.classOverallDSCpvalue = ko.observable("availSelPaddedDiv divSelectedLess");

	self.updateObsArray = function(theObsArray, theUpdatedArray, theSelectedObsArray)
	{
		if (notUN(theUpdatedArray))
		{
			// find values not in ObsArray, and add them to Obs
			// OK to use for each, since updated options does not change
			theUpdatedArray.forEach(function(theVal, theIndex)
			{
				if (theObsArray.indexOf(theVal)<0)
				{
					// theValue not in Obs
					// add to Obs
					theObsArray.push(theVal);
				}
			});
			// find values not in theUpdatedOptions, and remove them from Obs
			theObsArray.remove( function (theVal)
			{
				return theUpdatedArray.indexOf(theVal) < 0;
			} );
			// sort the ObsArray
			theObsArray.sort(function (theLt, theRt)
			{
				// <0 theLt sorts before theRt
				// =0 theLt identical to theRt
				// >0 theLt sorts after theRt
				var compare = 0;
				var indexLt = theSelectedObsArray.indexOf(theLt)>-1;
				var indexRt = theSelectedObsArray.indexOf(theRt)>-1;
				if ((true===indexLt)&&(false===indexRt))
				{
					compare = -1;
				}
				else if ((false===indexLt)&&(true===indexRt))
				{
					compare = 1;
				}
				else if (theLt<theRt)
				{
					compare = -1;
				}
				else if (theLt>theRt)
				{
					compare = 1;
				}
				return compare;
			});
		}
	};
	
	////////////////////////////////////////////////////////////////
	//// jsonQueryString
	////////////////////////////////////////////////////////////////
	self.jsonQueryString = ko.computed(function()
	{
		//console.log("jsonQueryString");
		var jqString = "";
		if ('dsc'===self.urlShowParam())
		{
			jqString = JSON.stringify(
						{
							mFiles:			getJsonFromObservableArray(self.selectedFiles),
							mSources:		getJsonFromObservableArray(self.selectedSources),
							mVariants:		getJsonFromObservableArray(self.selectedVariants),
							mProjects:		getJsonFromObservableArray(self.selectedProjects),
							mSubprojects:	getJsonFromObservableArray(self.selectedSubprojects),
							mCategories:	getJsonFromObservableArray(self.selectedCategories),
							mPlatforms:		getJsonFromObservableArray(self.selectedPlatforms),
							mData:			getJsonFromObservableArray(self.selectedData),
							mAlgorithms:	getJsonFromObservableArray(self.selectedAlgorithms),
							mDetails:		getJsonFromObservableArray(self.selectedDetails),
							mVersions:		getJsonFromObservableArray(self.selectedVersions),
							mOverallDSCmin:	getJsonFromObservableDouble(self.selectedOverallDSCmin),
							mOverallDSCmax:	getJsonFromObservableDouble(self.selectedOverallDSCmax),
							mOverallDSCpvalue:	getJsonFromObservableArray(self.selectedOverallDSCpvalue)
						});
		}
		else
		{
			jqString = JSON.stringify(
						{
							mFiles:			getJsonFromObservableArray(self.selectedFiles),
							mSources:		getJsonFromObservableArray(self.selectedSources),
							mVariants:		getJsonFromObservableArray(self.selectedVariants),
							mProjects:		getJsonFromObservableArray(self.selectedProjects),
							mSubprojects:	getJsonFromObservableArray(self.selectedSubprojects),
							mCategories:	getJsonFromObservableArray(self.selectedCategories),
							mPlatforms:		getJsonFromObservableArray(self.selectedPlatforms),
							mData:			getJsonFromObservableArray(self.selectedData),
							mAlgorithms:	getJsonFromObservableArray(self.selectedAlgorithms),
							mDetails:		getJsonFromObservableArray(self.selectedDetails),
							mVersions:		getJsonFromObservableArray(self.selectedVersions)
						});
		}
		return jqString;
	}, self).extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 250, notify: 'always' } });

	self.populatedOnlyQueryString = ko.computed(function()
	{
		//console.log("populatedOnlyQueryString");
		var jqString = "";
		if ('dsc'===self.urlShowParam())
		{
			jqString =	((0===self.selectedFiles().length)?"":("mFiles:["+getJsonFromObservableArray(self.selectedFiles) + "], ")) +
						((0===self.selectedSources().length)?"":("mSources:["+getJsonFromObservableArray(self.selectedSources) + "], ")) +
						((0===self.selectedVariants().length)?"":("mVariants:["+getJsonFromObservableArray(self.selectedVariants) + "], ")) +
						((0===self.selectedProjects().length)?"":("mProjects:["+getJsonFromObservableArray(self.selectedProjects) + "], ")) +
						((0===self.selectedSubprojects().length)?"":("mSubprojects:["+getJsonFromObservableArray(self.selectedSubprojects) + "], ")) +
						((0===self.selectedCategories().length)?"":("mCategories:["+getJsonFromObservableArray(self.selectedCategories) + "], ")) +
						((0===self.selectedPlatforms().length)?"":("mPlatforms:["+getJsonFromObservableArray(self.selectedPlatforms) + "], ")) +
						((0===self.selectedData().length)?"":("mData:["+getJsonFromObservableArray(self.selectedData) + "], ")) +
						((0===self.selectedAlgorithms().length)?"":("mAlgorithms:["+getJsonFromObservableArray(self.selectedAlgorithms) + "], ")) +
						((0===self.selectedDetails().length)?"":("mDetails:["+getJsonFromObservableArray(self.selectedDetails) + "], ")) +
						((0===self.selectedVersions().length)?"":("mVersions:["+getJsonFromObservableArray(self.selectedVersions) + "], ")) +
						((0===self.selectedOverallDSCmin().length)?"":("mOverallDSCmin:["+getJsonFromObservableArray(self.selectedOverallDSCmin) + "], ")) +
						((0===self.selectedOverallDSCmax().length)?"":("mOverallDSCmax:["+getJsonFromObservableArray(self.selectedOverallDSCmax) + "], ")) +
						((0===self.selectedOverallDSCpvalue().length)?"":("mOverallDSCpvalue:["+getJsonFromObservableArray(self.selectedOverallDSCpvalue) + "], "));
		}
		else
		{
			//console.log("getJsonFromObservableArray(self.selectedSubprojects)");
			//console.log(getJsonFromObservableArray(self.selectedSubprojects));
			//console.log("getJsonFromObservableArray(self.selectedFiles)");
			//console.log(getJsonFromObservableArray(self.selectedFiles));
			jqString =	((0===self.selectedFiles().length)?"":("mFiles:["+getJsonFromObservableArray(self.selectedFiles) + "], ")) +
						((0===self.selectedSources().length)?"":("mSources:["+getJsonFromObservableArray(self.selectedSources) + "], ")) +
						((0===self.selectedVariants().length)?"":("mVariants:["+getJsonFromObservableArray(self.selectedVariants) + "], ")) +
						((0===self.selectedProjects().length)?"":("mProjects:["+getJsonFromObservableArray(self.selectedProjects) + "], ")) +
						((0===self.selectedSubprojects().length)?"":("mSubprojects:["+getJsonFromObservableArray(self.selectedSubprojects) + "], ")) +
						((0===self.selectedCategories().length)?"":("mCategories:["+getJsonFromObservableArray(self.selectedCategories) + "], ")) +
						((0===self.selectedPlatforms().length)?"":("mPlatforms:["+getJsonFromObservableArray(self.selectedPlatforms) + "], ")) +
						((0===self.selectedData().length)?"":("mData:["+getJsonFromObservableArray(self.selectedData) + "], ")) +
						((0===self.selectedAlgorithms().length)?"":("mAlgorithms:["+getJsonFromObservableArray(self.selectedAlgorithms) + "], ")) +
						((0===self.selectedDetails().length)?"":("mDetails:["+getJsonFromObservableArray(self.selectedDetails) + "], ")) +
						((0===self.selectedVersions().length)?"":("mVersions:["+getJsonFromObservableArray(self.selectedVersions) + "], "));
		}
		if (jqString.endsWith(", "))
		{
			jqString = jqString.slice(0,-2);
		}
		return jqString;
	}, self).extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 250, notify: 'always' } });

	////////////////////////////////////////////////////////////////
	//// query results
	////////////////////////////////////////////////////////////////

	function getJsonFromObservableArray(theObsArray)
	{
		var value = theObsArray();
		var result = [];
		if (notUN(value))
		{
			if(0===value.length)
			{
				result = [ ];
			}
			else
			{
				result = ko.toJS(value);
			}
		}
		return result;
	}
	
	
	function getOriginalOrder(theLength)
	{
		var indexes = Array.from(Array(theLength)).map((e,i)=>i);
		return indexes;
	}
	
	function getNewOrder(theLength)
	{
		var indexes = Array.from(Array(theLength)).map((e,i)=>i);
		indexes = indexes.map((e,i)=>i-3);
		indexes[0] = theLength - 2;
		indexes[1] = theLength - 1;
		indexes[2] = theLength;
		return indexes;
	}

	function getJsonFromObservableDouble(theObsDouble)
	{
		var value = theObsDouble();
		if (!notUN(value))
		{
			value = null;
		}
		else if (""===value)
		{
			value = null;
		}
		return value;
	}

	self.queryResultLength = ko.observable("");
	self.populateQueryResults = ko.computed(function()
	{
		//console.log("populateQueryResults triggered");
		// jsonQueryString, the primary driver behind this firing, needs to be
		// outside the if statement, or it doesn't trigger a recompute.
		// Any failure to fire issues, add similar outside-the-if variables.
		var jqsObj = self.jsonQueryString;
		var jqs = jqsObj();
		var gui = self.makeGuiVisible();
		var loadLen = self.doneLoading().length;
		var first = self.firstLoad();
		//console.log("gui=" + gui);
		//console.log("loadLen=" + loadLen);
		//console.log("first=" + first);
		// prevent double calls when setting default values
		if ( ( (gui) && (loadLen < 1) ) ||
			 (true===first) )
		{
			var url = new URL(window.location.href);
			var mqaUrl = url.origin + url.pathname;
			// remove query/ from end of pathname
			mqaUrl = mqaUrl.slice(0, -6);
			//console.log("populateQueryResults calling");
			var loadDefaults = self.firstLoad();
			self.firstLoad(false);
			var date = new Date();
			var start = date.getTime();
			$.ajax(
			{
				type: "GET",
				dataType:'json',
				async:true,
				url: "../query",
				cache: false,
				data:
				{
					baseUrl: mqaUrl,
					search: jqs,
					show: self.urlShowParam()
				},
				success: function(theJson)
				{
					//console.log("populateQueryResults success");
					//console.log("query" + " :" + JSON.stringify(theJson));
					date = new Date();
					var finish = date.getTime();
					console.log("Time for query: " + ((finish-start)/1000.0) + " seconds");
					self.queryResultLength(theJson.data.length);
					for(var i = 0; i < theJson.headers.length; i++)
					{
						var obj = theJson.headers[i];
						// TODO: is this needed? render is set in Dataset.java
						if (obj.title==="Actions")
						{
							obj.render = tableActionOptions;
						}
					}
					// set list of available criterias
					self.updateObsArray(self.optionsFiles, theJson.availableFiles, self.selectedFiles);
					self.updateObsArray(self.optionsSources, theJson.availableSources, self.selectedSources);
					self.updateObsArray(self.optionsVariants, theJson.availableVariants, self.selectedVariants);
					self.updateObsArray(self.optionsProjects, theJson.availableProjects, self.selectedProjects);
					self.updateObsArray(self.optionsSubprojects, theJson.availableSubprojects, self.selectedSubprojects);
					self.updateObsArray(self.optionsCategories, theJson.availableCategories, self.selectedCategories);
					self.updateObsArray(self.optionsPlatforms, theJson.availablePlatforms, self.selectedPlatforms);
					self.updateObsArray(self.optionsData, theJson.availableData, self.selectedData);
					self.updateObsArray(self.optionsAlgorithms, theJson.availableAlgorithms, self.selectedAlgorithms);
					self.updateObsArray(self.optionsDetails, theJson.availableDetails, self.selectedDetails);
					self.updateObsArray(self.optionsVersions, theJson.availableVersions, self.selectedVersions);
					self.updateObsArray(self.optionsOverallDSCpvalue, theJson.availableOverallDSCpvalue, self.selectedOverallDSCpvalue);
					if (true===loadDefaults)
					{
						// TODO: load default values here 
						// can set, since only done to initialize
						// Files
						if (notUN(self.urlFiles))
						{
							self.selectedFiles(self.urlFiles);
						}
						else if (self.defaultFiles.length > 0)
						{
							self.selectedFiles(self.defaultFiles);
						}
						// Sources
						if (notUN(self.urlSources))
						{
							self.selectedSources(self.urlSources);
						}
						else if (self.defaultSources.length > 0)
						{
							self.selectedSources(self.defaultSources);
						}
						// Variants
						if (notUN(self.urlVariants))
						{
							self.selectedVariants(self.urlVariants);
						}
						else if (self.defaultVariants.length > 0)
						{
							self.selectedVariants(self.defaultVariants);
						}
						// Projects
						if (notUN(self.urlProjects))
						{
							self.selectedProjects(self.urlProjects);
						}
						else if (self.defaultProjects.length > 0)
						{
							self.selectedProjects(self.defaultProjects);
						}
						// Subprojects
						if (notUN(self.urlSubprojects))
						{
							self.selectedSubprojects(self.urlSubprojects);
						}
						else if (self.defaultSubprojects.length > 0)
						{
							self.selectedSubprojects(self.defaultSubprojects);
						}
						// Categories
						if (notUN(self.urlCategories))
						{
							self.selectedCategories(self.urlCategories);
						}
						else if (self.defaultCategories.length > 0)
						{
							self.selectedCategories(self.defaultCategories);
						}
						// Platforms
						if (notUN(self.urlPlatforms))
						{
							self.selectedPlatforms(self.urlPlatforms);
						}
						else if (self.defaultPlatforms.length > 0)
						{
							self.selectedPlatforms(self.defaultPlatforms);
						}
						// Platforms
						if (notUN(self.urlPlatforms))
						{
							self.selectedPlatforms(self.urlPlatforms);
						}
						else if (self.defaultPlatforms.length > 0)
						{
							self.selectedPlatforms(self.defaultPlatforms);
						}
						// Data
						if (notUN(self.urlData))
						{
							self.selectedData(self.urlData);
						}
						else if (self.defaultData.length > 0)
						{
							self.selectedData(self.defaultData);
						}
						// Algorithms
						if (notUN(self.urlAlgorithms))
						{
							self.selectedAlgorithms(self.urlAlgorithms);
						}
						else if (self.defaultAlgorithms.length > 0)
						{
							self.selectedAlgorithms(self.defaultAlgorithms);
						}
						// Details
						if (notUN(self.urlDetails))
						{
							self.selectedDetails(self.urlDetails);
						}
						else if (self.defaultDetails.length > 0)
						{
							self.selectedDetails(self.defaultDetails);
						}
						// Versions
						if (notUN(self.urlVersions))
						{
							self.selectedVersions(self.urlVersions);
						}
						else if (self.defaultVersions.length > 0)
						{
							self.selectedVersions(self.defaultVersions);
						}
						// OverallDSCpvalue
						if (notUN(self.urlOverallDSCpvalue))
						{
							self.selectedOverallDSCpvalue(self.urlOverallDSCpvalue);
						}
						// also do min/max dsc settings
						self.populateMinMax(self.selectedOverallDSCmin, self.enteredOverallDSCmin, self.urlOverallDSCmin, "DSC-min");
						self.populateMinMax(self.selectedOverallDSCmax, self.enteredOverallDSCmax, self.urlOverallDSCmax,"DSC-max");
					}
					
					// destroy: true eleminates the old datatable object
					// order: start with 1, since 0 (ID) is present but hidden
					if (0===theJson.headers.length)
					{
						//console.log("clear datatable");
						$('#resultsTable').DataTable().clear().draw();
					}
					else if (true===first)
					{
						//console.log("first datatable");
						// column 8 is first, since order of columns affects sort results
						//	destroy: true,
						// number of elements in table
						//BEA#325 var pgLen = self.defaultPageLength();
						//BEA#325 if (!notUN(pgLen))
						//BEA#325 {
						//BEA#325 	pgLen = 25;
						//BEA#325 }
						//console.log("headers length = " + theJson.headers.length);
						//console.log(theJson.headers);
						//{ fixedHeader: { header: true, footer: true } }
						//console.log(theJson.headers);
						$('#resultsTable').DataTable(
						{
							// NOTE CHANGING ORDER OF HEADERs/DATA will CHANGE INDEX 1
							rowId: (function (x) { return x[1]; }),
							destroy: true,
							data: theJson.data,
							columns: theJson.headers,
							// NOTE CHANGING ORDER OF HEADERs/DATA will CHANGE INDEXES
							order: [[ 8, 'asc' ], [ 10, 'asc' ], [ 1, 'asc' ], [ 2, 'asc' ], [ 3, 'asc' ], 
									[ 4, 'asc' ], [ 5, 'asc' ], [ 6, 'asc' ], [ 7, 'asc' ],  
									[ 9, 'asc' ]],
							info:			false,	// hide paging info at bottom of screen
							deferRender:    true,	// requiref for most other options to work
							paging:			false,	// no paging, hide page selection at top and bottom
							scrollCollapse: true,	// if small enough to fix screen, no scroll
							scrollX:		true,	// left-right scroll required to keep lined up
							fixedHeader:	false,	// keep header row on screen set to false, since scroll resize does this too
							scrollResize:	true,	// resize scroll area to fit screen
							scrollY:		100,	// value is needed, but ignored due to scrollResize:true
							lengthChange:	false
						} );
						$('#resultsTable').on('click', 'tbody tr td:not(:first-child)', function (theEvent)
						{
							var rowId = theEvent.currentTarget.parentElement.id;
							var dataRows = $('#resultsTable').DataTable().rows().data();
							var matched = null;
							for (var index=0; (index<dataRows.length)&&(null===matched); index++)
							{
								if (rowId===dataRows[index][1])
								{
									matched = dataRows[index];
								}
							}
							if (null!==matched)
							{
								var splitted = matched[0].split(" | ");
								if (""!==splitted[2])
								{
									window.open(splitted[2], 'viewIframe');
								}
							}
						});
					}
					else
					{
						//console.log("refresh datatable");
						$('#resultsTable').DataTable().clear();
						$('#resultsTable').DataTable().rows.add(theJson.data).draw();
					}
					setSelectedDatasetQuery(self.viewedDatasetId(), self.viewedDatasetDscid());
				},
				error: function(jqXHR, textStatus, errorThrown)
				{
					//console.log("populateQueryResults error");
					console.log("query" + " :" + textStatus + " and " + errorThrown);
					alert("query" + " :" + textStatus + " and " + errorThrown);
				}
			});
		}
	}, self);

	self.checkForValue = function(theQueryEntry, theValue)
	{
		var result = false;
		if (theValue===theQueryEntry.mIndexSource)
		{
			result = true;
		}
		return result;
	};

	self.checkStartsValue = function(theQueryEntry, theValue)
	{
		var result = false;
		if (theQueryEntry.mIndexSource.startsWith(theValue))
		{
			result = true;
		}
		return result;
	};
} //End Appview Model

function copyQueryString()
{
	// based on https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
	var copyText = document.getElementById("dapiCopyQuery");
	var text = appview.jsonQueryString();
	text = text.replace(/\"/g, "\\\"");
	//console.log(text);
	copyText.value = text;
	copyText.select();
	//For mobile devices
	copyText.setSelectionRange(0, 99999);
	document.execCommand("copy");
	copyText.blur();
}

function downloadManifest()
{
	window.location.href= '../manifest?baseURL='+ encodeURIComponent(window.parent.location.origin + window.parent.location.pathname) + 
			'&show=' + appview.urlShowParam() +
			'&search=' + encodeURIComponent(appview.jsonQueryString());
}

function urlParamsJson()
{
	let urlParams = { };
	if ('dsc'===appview.urlShowParam())
	{
		urlParams["show"] = "dsc";
	}
	else
	{
		urlParams["show"] = "matrix";
	}
	var pageLength = $('#resultsTable').DataTable().page.len();
	urlParams["pageLength"] = pageLength;
	var text = appview.jsonQueryString();
	urlParams["default"] = text;
	return urlParams;
}

function copyURLString()
{
	// based on https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
	var copyText = document.getElementById("dapiCopyURL");
	var text = appview.jsonQueryString();
	var show = "";
	if ('dsc'===appview.urlShowParam())
	{
		show = "show=dsc&";
	}
	var pageLength = $('#resultsTable').DataTable().page.len();
	var url = window.location.origin + window.location.pathname + "?"  + "pageLength=" + pageLength + "&" + show + "default=" + encodeURIComponent(text);
	//text = text.replace(/\"/g, "\\\"");
	copyText.value = url;
	copyText.select();
	//For mobile devices
	copyText.setSelectionRange(0, 99999);
	document.execCommand("copy");
	copyText.blur();
}

function updateEnteredSelected(theEntered, theSelected, theElementId)
{
	var input = document.getElementById(theElementId);
	if (input.checkValidity())
	{
		theSelected(theEntered());
	}
	else
	{
		alert("Must be a positive number with 3 or fewer significant digits");
	}
}

function tableActionOptions(data,type,row,meta)
{
	var retVal = "";
	if (""!==data)
	{
		var splitted = data.split(" | ");
		if (""!==splitted[2])
		{
			retVal += '<button type="button" class="sdb-control-button" onclick="window.open(\'' + splitted[2] + '\', \'viewIframe\');" title="View Analysis in Viewer">' +
					'<i class="fas fa-tv" style="color: green;"> </i></button>';
		}
		if (""!==splitted[0])
		{
			retVal += '<button type="button" class="sdb-control-button" onclick="location.href=\'' + splitted[0] + '\'" title="Download Data Archive">' +
					'<i class="fas fa-download" style="color: blue;"> </i></button>';
		}
		if (""!==splitted[1])
		{
			retVal += '<button type="button" class="sdb-control-button" onclick="location.href=\'' + splitted[1] + '\'" title="Download Results Archive">' +
					'<i class="fas fa-download" style="color: red;"> </i></button>';
		}
	}
	return retVal;
}

function clearSearch()
{
	appview.selectedOverallDSCpvalue.removeAll();
	document.getElementById("InputOverallDSCmin").value = "";
	document.getElementById("InputOverallDSCmax").value = "";
	appview.enteredOverallDSCmin('');
	appview.enteredOverallDSCmax('');
	appview.selectedSources.removeAll();
	appview.selectedVariants.removeAll();
	appview.selectedProjects.removeAll();
	appview.selectedSubprojects.removeAll();
	appview.selectedCategories.removeAll();
	appview.selectedDetails.removeAll();
	appview.selectedPlatforms.removeAll();
	appview.selectedData.removeAll();
	appview.selectedAlgorithms.removeAll();
	appview.selectedVersions.removeAll();
	appview.selectedFiles.removeAll();
}
