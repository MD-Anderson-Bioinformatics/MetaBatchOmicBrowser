/* global appview, ko */

////////////////////////////////////////////////////////////////
//// GUI utility function to disable input during long running processes
////////////////////////////////////////////////////////////////

disableInput = function ()
{
	//console.log("DAPIAppView::disableInput");
	if (notUN(window.frameElement))
	{
		//console.log("DAPIAppView::disableInput window.parent.disableInput");
		window.parent.disableInput();
	} else
	{
		//console.log("DAPIAppView::disableInput local");
		$(":input, a, button, tbody tr").prop("disabled", true);
	}
};

enableInput = function ()
{
	//console.log("DAPIAppView::enableInput");
	if (notUN(window.frameElement))
	{
		//console.log("DAPIAppView::enableInput window.parent.enableInput");
		window.parent.enableInput();
	} else
	{
		//console.log("DAPIAppView::enableInput local");
		$(":input, a, button, tbody tr").prop("disabled", false);
	}
};

////////////////////////////////////////////////////////////////
//// 
////////////////////////////////////////////////////////////////

initializeTooltips = function ()
{
	var tooltipsImg = document.querySelectorAll('*[id^="tooltipImage_"]');
	var tooltipsCont = document.querySelectorAll('*[id^="tooltipContent_"]');
	for (i = 0; i < tooltipsImg.length; i++)
	{
		//link tooltipImg to tooltipCont by shared value of the respective data attributes
		tippy('#' + tooltipsImg[i].id, {html: '#' + tooltipsCont[i].id, interactive: true, trigger: 'click'});
	}
};

activateTooltip = function (theImageId, theContentId)
{
	tippy('#' + theImageId, {html: '#' + theContentId, interactive: true, trigger: 'click'});
};

notUN = function (theValue)
{
	return ((undefined !== theValue) && (null !== theValue));
};

getUrlpath = function()
{
	return window.location.origin + "/" + window.location.pathname.split("/")[1];
};

// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel()
{
	console.log("DAPIAppView::AppViewModel window.location.href=" + window.location.href);
	//console.log("MQA AppViewModel starting");
	var self = this;
	self.type = "deferred";

	// used to mark currently displayed dataset
	self.viewedDatasetId = ko.observable(null);
	self.viewedDatasetDscid = ko.observable(null);

	//console.log("MQA AppViewModel URL");
	var url = new URL(window.location.href);

	// ADV-FILTER handle show=advanced
	var tmpUrlShowParam = url.searchParams.get("show");
	self.urlShowParam = ko.observable("");
	if ("dsc" === tmpUrlShowParam)
	{
		self.urlShowParam("dsc");
	} else if ("kwd" === tmpUrlShowParam)
	{
		self.urlShowParam("kwd");
	} else if ("advanced" === tmpUrlShowParam)
	{
		self.urlShowParam("advanced");
	} else
	{
		self.urlShowParam("matrix");
	}

	// precess query in URL
	var defaultQueryJSON = url.searchParams.get("default");
	//console.log("defaultQueryJSON=");
	//console.log(defaultQueryJSON);
	var defaultUrlPageLength = url.searchParams.get("pageLength");
	self.defaultPageLength = ko.observable(defaultUrlPageLength);
	self.defaultQuery = ko.observable("");
	if (null !== defaultQueryJSON)
	{
		self.defaultQuery(JSON.parse(defaultQueryJSON));
	}

	//console.log("MQA AppViewModel View");
	self.makeGuiVisible = ko.observable(false); //.extend({ deferred: true });
	self.firstLoad = ko.observable(true);
	// use array to track populating by calls to server, add these to keep populated until others are added
	self.doneLoading = ko.observableArray(["DSC-min", "DSC-max"]);

	self.populateMinMax = function (theSelected, theEntered, theQuery, theLoadMarker)
	{
		if (notUN(theQuery))
		{
			theSelected(theQuery);
			theEntered(theQuery);
		} else
		{
			theSelected("");
			theEntered("");
		}
		self.doneLoading.remove(theLoadMarker);
	};

	function getQueryDefault(theAttribute)
	{
		var result = null;
		if ("" !== self.defaultQuery())
		{
			result = self.defaultQuery()[theAttribute];
		}
		return result;
	}

	////////////////////////////////////////////////////////////////
	//// advanced filter options
	////////////////////////////////////////////////////////////////
	// ADV-FILTER add support for URL and Default variables
	self.optionsPipelineStatus = ko.observableArray();
	self.selectedPipelineStatus = ko.observableArray();
	self.classPipelineStatus = ko.observable("availSelPaddedDiv divSelectedLess");
	self.urlPipelineStatus = getQueryDefault("pipeline_status");
	self.defaultPipelineStatus = [];

	self.optionsDataFormat = ko.observableArray();
	self.selectedDataFormat = ko.observableArray();
	self.classDataFormat = ko.observable("availSelPaddedDiv divSelectedLess");
	self.urlDataFormat = getQueryDefault("data_format");
	self.defaultDataFormat = [];

	self.optionsPca = ko.observableArray();
	self.selectedPca = ko.observableArray();
	self.classPca = ko.observable("availSelPaddedDiv divSelectedLess");
	self.urlPca = getQueryDefault("pca");
	self.defaultPca = [];

	self.optionsBoxplot = ko.observableArray();
	self.selectedBoxplot = ko.observableArray();
	self.classBoxplot = ko.observable("availSelPaddedDiv divSelectedLess");
	self.urlBoxplot = getQueryDefault("boxplot");
	self.defaultBoxplot = [];

	self.optionsCdp = ko.observableArray();
	self.selectedCdp = ko.observableArray();
	self.classCdp = ko.observable("availSelPaddedDiv divSelectedLess");
	self.urlCdp = getQueryDefault("cdp");
	self.defaultCdp = [];

	self.optionsHierClust = ko.observableArray();
	self.selectedHierClust = ko.observableArray();
	self.classHierClust = ko.observable("availSelPaddedDiv divSelectedLess");
	self.urlHierClust = getQueryDefault("h_c");
	self.defaultHierClust = [];

	self.optionsDsc = ko.observableArray();
	self.selectedDsc = ko.observableArray();
	self.classDsc = ko.observable("availSelPaddedDiv divSelectedLess");
	self.urlDsc = getQueryDefault("dsc");
	self.defaultDsc = [];

	self.optionsDiscrete = ko.observableArray();
	self.selectedDiscrete = ko.observableArray();
	self.classDiscrete = ko.observable("availSelPaddedDiv divSelectedLess");
	self.urlDiscrete = getQueryDefault("discrete");
	self.defaultDiscrete = [];

	self.optionsNgchm = ko.observableArray();
	self.selectedNgchm = ko.observableArray();
	self.classNgchm = ko.observable("availSelPaddedDiv divSelectedLess");
	self.urlNgchm = getQueryDefault("ngchm");
	self.defaultNgchm = [];

	self.optionsSuperClust = ko.observableArray();
	self.selectedSuperClust = ko.observableArray();
	self.classSuperClust = ko.observable("availSelPaddedDiv divSelectedLess");
	self.urlSuperClust = getQueryDefault("superclust");
	self.defaultSuperClust = [];

	self.optionsUmap = ko.observableArray();
	self.selectedUmap = ko.observableArray();
	self.classUmap = ko.observable("availSelPaddedDiv divSelectedLess");
	self.urlUmap = getQueryDefault("umap");
	self.defaultUmap = [];

	self.enteredGteSamplesMatrix = ko.observable();
	self.selectedGteSamplesMatrix = ko.observable();
	self.enteredLteSamplesMatrix = ko.observable();
	self.selectedLteSamplesMatrix = ko.observable();
	self.selectedNanSamplesMatrix = ko.observable(false);
	self.urlGteSamplesMatrix = getQueryDefault("GTE_samples_matrix");
	self.defaultGteSamplesMatrix = "";
	self.urlLteSamplesMatrix = getQueryDefault("LTE_samples_matrix");
	self.defaultLteSamplesMatrix = "";
	self.urlNanSamplesMatrix = getQueryDefault("isNaN_samples_matrix");
	self.defaultNanSamplesMatrix = false;

	self.enteredGteSamplesMutations = ko.observable();
	self.selectedGteSamplesMutations = ko.observable();
	self.enteredLteSamplesMutations = ko.observable();
	self.selectedLteSamplesMutations = ko.observable();
	self.selectedNanSamplesMutations = ko.observable(false);
	self.urlGteSamplesMutations = getQueryDefault("GTE_samples_mutations");
	self.defaultGteSamplesMutations = "";
	self.urlLteSamplesMutations = getQueryDefault("LTE_samples_mutations");
	self.defaultLteSamplesMutations = "";
	self.urlNanSamplesMutations = getQueryDefault("isNaN_samples_mutations");
	self.defaultNanSamplesMutations = false;

	self.enteredGteFeaturesMatrix = ko.observable();
	self.selectedGteFeaturesMatrix = ko.observable();
	self.enteredLteFeaturesMatrix = ko.observable();
	self.selectedLteFeaturesMatrix = ko.observable();
	self.selectedNanFeaturesMatrix = ko.observable(false);
	self.urlGteFeaturesMatrix = getQueryDefault("GTE_features_matrix");
	self.defaultGteFeaturesMatrix = "";
	self.urlLteFeaturesMatrix = getQueryDefault("LTE_features_matrix");
	self.defaultLteFeaturesMatrix = "";
	self.urlNanFeaturesMatrix = getQueryDefault("isNaN_features_matrix");
	self.defaultNanFeaturesMatrix = false;

	self.enteredGteFeaturesMutations = ko.observable();
	self.selectedGteFeaturesMutations = ko.observable();
	self.enteredLteFeaturesMutations = ko.observable();
	self.selectedLteFeaturesMutations = ko.observable();
	self.selectedNanFeaturesMutations = ko.observable(false);
	self.urlGteFeaturesMutations = getQueryDefault("GTE_features_mutations");
	self.defaultGteFeaturesMutations = "";
	self.urlLteFeaturesMutations = getQueryDefault("LTE_features_mutations");
	self.defaultLteFeaturesMutations = "";
	self.urlNanFeaturesMutations = getQueryDefault("isNaN_features_mutations");
	self.defaultNanFeaturesMutations = false;

	self.enteredGteUnknownBatches = ko.observable();
	self.selectedGteUnknownBatches = ko.observable();
	self.enteredLteUnknownBatches = ko.observable();
	self.selectedLteUnknownBatches = ko.observable();
	self.selectedNanUnknownBatches = ko.observable(false);
	self.urlGteUnknownBatches = getQueryDefault("GTE_unknown_batches");
	self.defaultGteUnknownBatches = "";
	self.urlLteUnknownBatches = getQueryDefault("LTE_unknown_batches");
	self.defaultLteUnknownBatches = "";
	self.urlNanUnknownBatches = getQueryDefault("isNaN_unknown_batches");
	self.defaultNanUnknownBatches = false;

	self.enteredGteUniqueBatchCount = ko.observable();
	self.selectedGteUniqueBatchCount = ko.observable();
	self.enteredLteUniqueBatchCount = ko.observable();
	self.selectedLteUniqueBatchCount = ko.observable();
	self.selectedNanUniqueBatchCount = ko.observable(false);
	self.urlGteUniqueBatchCount = getQueryDefault("GTE_batch_unique_cnt");
	self.defaultGteUniqueBatchCount = "";
	self.urlLteUniqueBatchCount = getQueryDefault("LTE_batch_unique_cnt");
	self.defaultLteUniqueBatchCount = "";
	self.urlNanUniqueBatchCount = getQueryDefault("isNaN_batch_unique_cnt");
	self.defaultNanUniqueBatchCount = false;

	self.enteredGteCorrelatedBatchTypes = ko.observable();
	self.selectedGteCorrelatedBatchTypes = ko.observable();
	self.enteredLteCorrelatedBatchTypes = ko.observable();
	self.selectedLteCorrelatedBatchTypes = ko.observable();
	self.selectedNanCorrelatedBatchTypes = ko.observable(false);
	self.urlGteCorrelatedBatchTypes = getQueryDefault("GTE_correlated_batch_types");
	self.defaultGteCorrelatedBatchTypes = "";
	self.urlLteCorrelatedBatchTypes = getQueryDefault("LTE_correlated_batch_types");
	self.defaultLteCorrelatedBatchTypes = "";
	self.urlNanCorrelatedBatchTypes = getQueryDefault("isNaN_correlated_batch_types");
	self.defaultNanCorrelatedBatchTypes = false;

	self.enteredGteBatchTypeCount = ko.observable();
	self.selectedGteBatchTypeCount = ko.observable();
	self.enteredLteBatchTypeCount = ko.observable();
	self.selectedLteBatchTypeCount = ko.observable();
	self.selectedNanBatchTypeCount = ko.observable(false);
	self.urlGteBatchTypeCount = getQueryDefault("GTE_batch_type_count");
	self.defaultGteBatchTypeCount = "";
	self.urlLteBatchTypeCount = getQueryDefault("LTE_batch_type_count");
	self.defaultLteBatchTypeCount = "";
	self.urlNanBatchTypeCount = getQueryDefault("isNaN_batch_type_count");
	self.defaultNanBatchTypeCount = false;

	////////////////////////////////////////////////////////////////
	//// source
	////////////////////////////////////////////////////////////////
	self.optionsSources = ko.observableArray();
	self.selectedSources = ko.observableArray();
	self.urlSources = getQueryDefault("mSources");
	self.defaultSources = [];
	self.classSources = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// program
	////////////////////////////////////////////////////////////////
	self.optionsProgram = ko.observableArray();
	self.selectedProgram = ko.observableArray();
	self.urlProgram = getQueryDefault("mProgram");
	self.defaultProgram = [];
	self.classProgram = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// project
	////////////////////////////////////////////////////////////////
	self.optionsProjects = ko.observableArray();
	self.selectedProjects = ko.observableArray();
	self.urlProjects = getQueryDefault("mProjects");
	self.defaultProjects = [];
	self.classProjects = ko.observable("availSelPaddedDiv divSelectedLess");

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
	//// detail
	////////////////////////////////////////////////////////////////
	self.optionsDetails = ko.observableArray();
	self.selectedDetails = ko.observableArray();
	self.urlDetails = getQueryDefault("mDetails");
	self.defaultDetails = [];
	self.classDetails = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// data version
	////////////////////////////////////////////////////////////////
	self.optionsDataVersions = ko.observableArray();
	self.selectedDataVersions = ko.observableArray();
	self.urlDataVersions = getQueryDefault("mDataVersions");
	self.defaultDataVersions = [];
	self.classDataVersions = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// test version
	////////////////////////////////////////////////////////////////
	self.optionsTestVersions = ko.observableArray();
	self.selectedTestVersions = ko.observableArray();
	self.urlTestVersions = getQueryDefault("mTestVersions");
	self.defaultTestVersions = [];
	self.classTestVersions = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// jobtype
	////////////////////////////////////////////////////////////////
	self.optionsJobType = ko.observableArray();
	self.selectedJobType = ko.observableArray();
	self.urlJobType = getQueryDefault("mJobType");
	self.defaultJobType = [];
	self.classJobType = ko.observable("availSelPaddedDiv divSelectedLess");
	
	////
	//// DSC and Advanced
	////

	////////////////////////////////////////////////////////////////
	//// test version
	////////////////////////////////////////////////////////////////
	self.optionsAnalysisPath = ko.observableArray();
	self.selectedAnalysisPath = ko.observableArray();
	self.urlAnalysisPath = getQueryDefault("mAnalysisPath");
	self.defaultAnalysisPath = [];
	self.classAnalysisPath = ko.observable("availSelPaddedDiv divSelectedLess");

	////
	//// KWD
	////

	////////////////////////////////////////////////////////////////
	//// NegLog10PValue
	////////////////////////////////////////////////////////////////
	self.optionsNegLog10PValue = ko.observableArray();
	self.selectedNegLog10PValue = ko.observableArray();
	self.urlNegLog10PValue = getQueryDefault("mNegLog10PValue");
	self.defaultNegLog10PValue = [];
	self.classNegLog10PValue = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// NegLog10Cutoff
	////////////////////////////////////////////////////////////////
	self.optionsNegLog10Cutoff = ko.observableArray();
	self.selectedNegLog10Cutoff = ko.observableArray();
	self.urlNegLog10Cutoff = getQueryDefault("mNegLog10Cutoff");
	self.defaultNegLog10Cutoff = [];
	self.classNegLog10Cutoff = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// BatchesCalled
	////////////////////////////////////////////////////////////////
	self.optionsBatchesCalled = ko.observableArray();
	self.selectedBatchesCalled = ko.observableArray();
	self.urlBatchesCalled = getQueryDefault("mBatchesCalled");
	self.defaultBatchesCalled = [];
	self.classBatchesCalled = ko.observable("availSelPaddedDiv divSelectedLess");

	////
	//// DSC
	//// DSC

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
	//// overall dsc p-value
	////////////////////////////////////////////////////////////////
	self.optionsOverallDSCpvalue = ko.observableArray();
	self.selectedOverallDSCpvalue = ko.observableArray();
	self.urlOverallDSCpvalue = getQueryDefault("mOverallDSCpvalue");
	self.classOverallDSCpvalue = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// overall dsc
	////////////////////////////////////////////////////////////////
	self.optionsOverallDSC = ko.observableArray();
	self.selectedOverallDSC = ko.observableArray();
	self.urlOverallDSC = getQueryDefault("mOverallDSC");
	self.classOverallDSC = ko.observable("availSelPaddedDiv divSelectedLess");

	////////////////////////////////////////////////////////////////
	//// kwd flags
	////////////////////////////////////////////////////////////////
	self.selectedCutoffFlag = ko.observable(false);
	self.urlCutoffFlag = getQueryDefault("mCutoffFlag");
	self.defaultCutoffFlag = false;

	self.selectedBatchesCalledFlag = ko.observable(false);
	self.urlBatchesCalledFlag = getQueryDefault("mBatchesCalledFlag");
	self.defaultBatchesCalledFlag = false;

	////////////////////////////////////////////////////////////////
	//// functions
	////////////////////////////////////////////////////////////////

	self.updateObsArray = function (theObsArray, theUpdatedArray, theSelectedObsArray)
	{
		if (notUN(theUpdatedArray))
		{
			// find values not in ObsArray, and add them to Obs
			// OK to use for each, since updated options does not change
			theUpdatedArray.forEach(function (theVal, theIndex)
			{
				if (theObsArray.indexOf(theVal) < 0)
				{
					// theValue not in Obs
					// add to Obs
					theObsArray.push(theVal);
				}
			});
			// find values not in theUpdatedOptions, and remove them from Obs
			theObsArray.remove(function (theVal)
			{
				return theUpdatedArray.indexOf(theVal) < 0;
			});
			// sort the ObsArray
			theObsArray.sort(function (theLt, theRt)
			{
				// <0 theLt sorts before theRt
				// =0 theLt identical to theRt
				// >0 theLt sorts after theRt
				var compare = 0;
				var indexLt = theSelectedObsArray.indexOf(theLt) > -1;
				var indexRt = theSelectedObsArray.indexOf(theRt) > -1;
				if ((true === indexLt) && (false === indexRt))
				{
					compare = -1;
				} else if ((false === indexLt) && (true === indexRt))
				{
					compare = 1;
				} else if (theLt < theRt)
				{
					compare = -1;
				} else if (theLt > theRt)
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
	self.jsonQueryString = ko.computed(function ()
	{
		//console.log("jsonQueryString");
		var jqString = "";
		// ADV-FILTER handle show=advanced
		if ('advanced' === self.urlShowParam())
		{
			// TODO: ADV-FILTER populate only with needed, or query URL is too long
			var jsonObj = {};
			jsonObj = setJsonObjectFromObservableArray(self.selectedSources, jsonObj, "mSources");
			jsonObj = setJsonObjectFromObservableArray(self.selectedProgram, jsonObj, "mProgram");
			jsonObj = setJsonObjectFromObservableArray(self.selectedProjects, jsonObj, "mProjects");
			jsonObj = setJsonObjectFromObservableArray(self.selectedCategories, jsonObj, "mCategories");
			jsonObj = setJsonObjectFromObservableArray(self.selectedPlatforms, jsonObj, "mPlatforms");
			jsonObj = setJsonObjectFromObservableArray(self.selectedData, jsonObj, "mData");
			jsonObj = setJsonObjectFromObservableArray(self.selectedDetails, jsonObj, "mDetails");
			jsonObj = setJsonObjectFromObservableArray(self.selectedDataVersions, jsonObj, "mDataVersions");
			jsonObj = setJsonObjectFromObservableArray(self.selectedTestVersions, jsonObj, "mTestVersions");
			jsonObj = setJsonObjectFromObservableArray(self.selectedPipelineStatus, jsonObj, "pipeline_status");
			jsonObj = setJsonObjectFromObservableArray(self.selectedDataFormat, jsonObj, "data_format");
			jsonObj = setJsonObjectFromObservableArray(self.selectedPca, jsonObj, "pca");
			jsonObj = setJsonObjectFromObservableArray(self.selectedBoxplot, jsonObj, "boxplot");
			jsonObj = setJsonObjectFromObservableArray(self.selectedCdp, jsonObj, "cdp");
			jsonObj = setJsonObjectFromObservableArray(self.selectedHierClust, jsonObj, "h_c");
			jsonObj = setJsonObjectFromObservableArray(self.selectedDsc, jsonObj, "dsc");
			jsonObj = setJsonObjectFromObservableArray(self.selectedDiscrete, jsonObj, "discrete");
			jsonObj = setJsonObjectFromObservableArray(self.selectedNgchm, jsonObj, "ngchm");
			jsonObj = setJsonObjectFromObservableArray(self.selectedSuperClust, jsonObj, "superclust");
			jsonObj = setJsonObjectFromObservableArray(self.selectedUmap, jsonObj, "umap");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteSamplesMatrix, jsonObj, "GTE_samples_matrix");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteSamplesMatrix, jsonObj, "LTE_samples_matrix");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanSamplesMatrix, jsonObj, "isNaN_samples_matrix");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteSamplesMutations, jsonObj, "GTE_samples_mutations");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteSamplesMutations, jsonObj, "LTE_samples_mutations");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanSamplesMutations, jsonObj, "isNaN_samples_mutations");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteFeaturesMatrix, jsonObj, "GTE_features_matrix");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteFeaturesMatrix, jsonObj, "LTE_features_matrix");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanFeaturesMatrix, jsonObj, "isNaN_features_matrix");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteFeaturesMutations, jsonObj, "GTE_features_mutations");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteFeaturesMutations, jsonObj, "LTE_features_mutations");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanFeaturesMutations, jsonObj, "isNaN_features_mutations");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteUnknownBatches, jsonObj, "GTE_unknown_batches");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteUnknownBatches, jsonObj, "LTE_unknown_batches");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanUnknownBatches, jsonObj, "isNaN_unknown_batches");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteUniqueBatchCount, jsonObj, "GTE_batch_unique_cnt");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteUniqueBatchCount, jsonObj, "LTE_batch_unique_cnt");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanUniqueBatchCount, jsonObj, "isNaN_batch_unique_cnt");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteCorrelatedBatchTypes, jsonObj, "GTE_correlated_batch_types");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteCorrelatedBatchTypes, jsonObj, "LTE_correlated_batch_types");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanCorrelatedBatchTypes, jsonObj, "isNaN_correlated_batch_types");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteBatchTypeCount, jsonObj, "GTE_batch_type_count");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteBatchTypeCount, jsonObj, "LTE_batch_type_count");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanBatchTypeCount, jsonObj, "isNaN_batch_type_count");
			jqString = JSON.stringify(jsonObj);
		} else if ('dsc' === self.urlShowParam())
		{
			jqString = JSON.stringify(
					{
						mSources: getJsonFromObservableArray(self.selectedSources),
						mProgram: getJsonFromObservableArray(self.selectedProgram),
						mProjects: getJsonFromObservableArray(self.selectedProjects),
						mCategories: getJsonFromObservableArray(self.selectedCategories),
						mPlatforms: getJsonFromObservableArray(self.selectedPlatforms),
						mData: getJsonFromObservableArray(self.selectedData),
						mDetails: getJsonFromObservableArray(self.selectedDetails),
						mDataVersions: getJsonFromObservableArray(self.selectedDataVersions),
						mTestVersions: getJsonFromObservableArray(self.selectedTestVersions),
						mJobType: getJsonFromObservableArray(self.selectedJobType),
						mAnalysisPath: getJsonFromObservableArray(self.selectedAnalysisPath),
						mOverallDSCmin: getJsonFromObservableDouble(self.selectedOverallDSCmin),
						mOverallDSCmax: getJsonFromObservableDouble(self.selectedOverallDSCmax),
						mOverallDSCpvalue: getJsonFromObservableArray(self.selectedOverallDSCpvalue)
					});
		} else if ('kwd' === self.urlShowParam())
		{
			jqString = JSON.stringify(
					{
						mSources: getJsonFromObservableArray(self.selectedSources),
						mProgram: getJsonFromObservableArray(self.selectedProgram),
						mProjects: getJsonFromObservableArray(self.selectedProjects),
						mCategories: getJsonFromObservableArray(self.selectedCategories),
						mPlatforms: getJsonFromObservableArray(self.selectedPlatforms),
						mData: getJsonFromObservableArray(self.selectedData),
						mDetails: getJsonFromObservableArray(self.selectedDetails),
						mDataVersions: getJsonFromObservableArray(self.selectedDataVersions),
						mTestVersions: getJsonFromObservableArray(self.selectedTestVersions),
						mJobType: getJsonFromObservableArray(self.selectedJobType),
						mAnalysisPath: getJsonFromObservableArray(self.selectedAnalysisPath),
						mCutoffFlag: getJsonFromObservableBool(self.selectedCutoffFlag),
						mBatchesCalledFlag: getJsonFromObservableBool(self.selectedBatchesCalledFlag)
					});
		} else
		{
			jqString = JSON.stringify(
					{
						mSources: getJsonFromObservableArray(self.selectedSources),
						mProgram: getJsonFromObservableArray(self.selectedProgram),
						mProjects: getJsonFromObservableArray(self.selectedProjects),
						mCategories: getJsonFromObservableArray(self.selectedCategories),
						mPlatforms: getJsonFromObservableArray(self.selectedPlatforms),
						mData: getJsonFromObservableArray(self.selectedData),
						mDetails: getJsonFromObservableArray(self.selectedDetails),
						mDataVersions: getJsonFromObservableArray(self.selectedDataVersions),
						mTestVersions: getJsonFromObservableArray(self.selectedTestVersions),
						mJobType: getJsonFromObservableArray(self.selectedJobType)
					});
		}
		return jqString;
	}, self).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 250, notify: 'always'}});
	self.jsonQueryString.subscribe(function (theNewValue)
	{
		if (theNewValue.length >= 900)
		{
			alert("Too many criteria selected - resulting URL is too long and may not function properly. Please select fewer criteria.");
		}
	});

	self.populatedOnlyQueryString = ko.computed(function ()
	{
		//console.log("populatedOnlyQueryString");
		var jqString = "";
		if ('advanced' === self.urlShowParam())
		{
			// ADV-FILTER populate only with needed
			var jsonObj = {};
			jsonObj = setJsonObjectFromObservableArray(self.selectedSources, jsonObj, "mSources");
			jsonObj = setJsonObjectFromObservableArray(self.selectedProgram, jsonObj, "mProgram");
			jsonObj = setJsonObjectFromObservableArray(self.selectedProjects, jsonObj, "mProjects");
			jsonObj = setJsonObjectFromObservableArray(self.selectedCategories, jsonObj, "mCategories");
			jsonObj = setJsonObjectFromObservableArray(self.selectedPlatforms, jsonObj, "mPlatforms");
			jsonObj = setJsonObjectFromObservableArray(self.selectedData, jsonObj, "mData");
			jsonObj = setJsonObjectFromObservableArray(self.selectedDetails, jsonObj, "mDetails");
			jsonObj = setJsonObjectFromObservableArray(self.selectedPipelineStatus, jsonObj, "pipeline_status");
			jsonObj = setJsonObjectFromObservableArray(self.selectedDataFormat, jsonObj, "data_format");
			jsonObj = setJsonObjectFromObservableArray(self.selectedPca, jsonObj, "pca");
			jsonObj = setJsonObjectFromObservableArray(self.selectedBoxplot, jsonObj, "boxplot");
			jsonObj = setJsonObjectFromObservableArray(self.selectedCdp, jsonObj, "cdp");
			jsonObj = setJsonObjectFromObservableArray(self.selectedHierClust, jsonObj, "h_c");
			jsonObj = setJsonObjectFromObservableArray(self.selectedDsc, jsonObj, "dsc");
			jsonObj = setJsonObjectFromObservableArray(self.selectedDiscrete, jsonObj, "discrete");
			jsonObj = setJsonObjectFromObservableArray(self.selectedNgchm, jsonObj, "ngchm");
			jsonObj = setJsonObjectFromObservableArray(self.selectedSuperClust, jsonObj, "superclust");
			jsonObj = setJsonObjectFromObservableArray(self.selectedUmap, jsonObj, "umap");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteSamplesMatrix, jsonObj, "GTE_samples_matrix");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteSamplesMatrix, jsonObj, "LTE_samples_matrix");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanSamplesMatrix, jsonObj, "isNaN_samples_matrix");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteSamplesMutations, jsonObj, "GTE_samples_mutations");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteSamplesMutations, jsonObj, "LTE_samples_mutations");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanSamplesMutations, jsonObj, "isNaN_samples_mutations");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteFeaturesMatrix, jsonObj, "GTE_features_matrix");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteFeaturesMatrix, jsonObj, "LTE_features_matrix");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanFeaturesMatrix, jsonObj, "isNaN_features_matrix");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteFeaturesMutations, jsonObj, "GTE_features_mutations");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteFeaturesMutations, jsonObj, "LTE_features_mutations");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanFeaturesMutations, jsonObj, "isNaN_features_mutations");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteUnknownBatches, jsonObj, "GTE_unknown_batches");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteUnknownBatches, jsonObj, "LTE_unknown_batches");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanUnknownBatches, jsonObj, "isNaN_unknown_batches");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteUniqueBatchCount, jsonObj, "GTE_batch_unique_cnt");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteUniqueBatchCount, jsonObj, "LTE_batch_unique_cnt");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanUniqueBatchCount, jsonObj, "isNaN_batch_unique_cnt");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteCorrelatedBatchTypes, jsonObj, "GTE_correlated_batch_types");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteCorrelatedBatchTypes, jsonObj, "LTE_correlated_batch_types");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanCorrelatedBatchTypes, jsonObj, "isNaN_correlated_batch_types");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedGteBatchTypeCount, jsonObj, "GTE_batch_type_count");
			jsonObj = setJsonObjectFromObservableDouble(self.selectedLteBatchTypeCount, jsonObj, "LTE_batch_type_count");
			jsonObj = setJsonObjectFromObservableBool(self.selectedNanBatchTypeCount, jsonObj, "isNaN_batch_type_count");
			jqString = JSON.stringify(jsonObj);
			jqString = jqString.replaceAll("\"", "");
		} else if ('dsc' === self.urlShowParam())
		{
			jqString = 
					((0 === self.selectedSources().length) ? "" : ("mSources:[" + getJsonFromObservableArray(self.selectedSources) + "], ")) +
					((0 === self.selectedProgram().length) ? "" : ("mProgram:[" + getJsonFromObservableArray(self.selectedProgram) + "], ")) +
					((0 === self.selectedProjects().length) ? "" : ("mProjects:[" + getJsonFromObservableArray(self.selectedProjects) + "], ")) +
					((0 === self.selectedCategories().length) ? "" : ("mCategories:[" + getJsonFromObservableArray(self.selectedCategories) + "], ")) +
					((0 === self.selectedPlatforms().length) ? "" : ("mPlatforms:[" + getJsonFromObservableArray(self.selectedPlatforms) + "], ")) +
					((0 === self.selectedData().length) ? "" : ("mData:[" + getJsonFromObservableArray(self.selectedData) + "], ")) +
					((0 === self.selectedDetails().length) ? "" : ("mDetails:[" + getJsonFromObservableArray(self.selectedDetails) + "], ")) +
					((0 === self.selectedDataVersions().length) ? "" : ("mDataVersions:[" + getJsonFromObservableArray(self.selectedDataVersions) + "], ")) +
					((0 === self.selectedTestVersions().length) ? "" : ("mTestVersions:[" + getJsonFromObservableArray(self.selectedTestVersions) + "], ")) +
					((0 === self.selectedJobType().length) ? "" : ("mJobType:[" + getJsonFromObservableArray(self.selectedJobType) + "], ")) +
					((0 === self.selectedOverallDSCmin().length) ? "" : ("mOverallDSCmin:[" + getJsonFromObservableArray(self.selectedOverallDSCmin) + "], ")) +
					((0 === self.selectedOverallDSCmax().length) ? "" : ("mOverallDSCmax:[" + getJsonFromObservableArray(self.selectedOverallDSCmax) + "], ")) +
					((0 === self.selectedOverallDSCpvalue().length) ? "" : ("mOverallDSCpvalue:[" + getJsonFromObservableArray(self.selectedOverallDSCpvalue) + "], "));
		} else if ('kwd' === self.urlShowParam())
		{
			jqString = 
					((0 === self.selectedSources().length) ? "" : ("mSources:[" + getJsonFromObservableArray(self.selectedSources) + "], ")) +
					((0 === self.selectedProgram().length) ? "" : ("mProgram:[" + getJsonFromObservableArray(self.selectedProgram) + "], ")) +
					((0 === self.selectedProjects().length) ? "" : ("mProjects:[" + getJsonFromObservableArray(self.selectedProjects) + "], ")) +
					((0 === self.selectedCategories().length) ? "" : ("mCategories:[" + getJsonFromObservableArray(self.selectedCategories) + "], ")) +
					((0 === self.selectedPlatforms().length) ? "" : ("mPlatforms:[" + getJsonFromObservableArray(self.selectedPlatforms) + "], ")) +
					((0 === self.selectedData().length) ? "" : ("mData:[" + getJsonFromObservableArray(self.selectedData) + "], ")) +
					((0 === self.selectedDetails().length) ? "" : ("mDetails:[" + getJsonFromObservableArray(self.selectedDetails) + "], ")) +
					((0 === self.selectedDataVersions().length) ? "" : ("mDataVersions:[" + getJsonFromObservableArray(self.selectedDataVersions) + "], ")) +
					((0 === self.selectedTestVersions().length) ? "" : ("mTestVersions:[" + getJsonFromObservableArray(self.selectedTestVersions) + "], ")) +
					((0 === self.selectedJobType().length) ? "" : ("mJobType:[" + getJsonFromObservableArray(self.selectedJobType) + "], ")) +
					((false === self.selectedCutoffFlag()) ? "" : ("mCutoffFlag:true, ")) +
					((false === self.selectedBatchesCalledFlag()) ? "" : ("mBatchesCalledFlag:true, "));
		} else
		{
			jqString = 
					((0 === self.selectedSources().length) ? "" : ("mSources:[" + getJsonFromObservableArray(self.selectedSources) + "], ")) +
					((0 === self.selectedProgram().length) ? "" : ("mProgram:[" + getJsonFromObservableArray(self.selectedProgram) + "], ")) +
					((0 === self.selectedProjects().length) ? "" : ("mProjects:[" + getJsonFromObservableArray(self.selectedProjects) + "], ")) +
					((0 === self.selectedCategories().length) ? "" : ("mCategories:[" + getJsonFromObservableArray(self.selectedCategories) + "], ")) +
					((0 === self.selectedPlatforms().length) ? "" : ("mPlatforms:[" + getJsonFromObservableArray(self.selectedPlatforms) + "], ")) +
					((0 === self.selectedData().length) ? "" : ("mData:[" + getJsonFromObservableArray(self.selectedData) + "], ")) +
					((0 === self.selectedDetails().length) ? "" : ("mDetails:[" + getJsonFromObservableArray(self.selectedDetails) + "], ")) +
					((0 === self.selectedDataVersions().length) ? "" : ("mDataVersions:[" + getJsonFromObservableArray(self.selectedDataVersions) + "], ")) +
					((0 === self.selectedTestVersions().length) ? "" : ("mTestVersions:[" + getJsonFromObservableArray(self.selectedTestVersions) + "], ")) +
					((0 === self.selectedJobType().length) ? "" : ("mJobType:[" + getJsonFromObservableArray(self.selectedJobType) + "], "));
		}
		if (jqString.endsWith(", "))
		{
			jqString = jqString.slice(0, -2);
		}
		return jqString;
	}, self).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 250, notify: 'always'}});
	self.populatedOnlyQueryString.subscribe(function (theNewValue)
	{
		if (theNewValue.length >= 900)
		{
			alert("Too many criteria selected - resulting URL is too long and may not function properly. Please select fewer criteria.");
		}
	});

	////////////////////////////////////////////////////////////////
	//// query string to object
	////////////////////////////////////////////////////////////////

	function setJsonObjectFromObservableArray(theObsArray, theObj, theAttribute)
	{
		var value = theObsArray();
		if (notUN(value))
		{
			var result = [];
			if (0 !== value.length)
			{
				result = ko.toJS(value);
				theObj[theAttribute] = result;
			}
		}
		return theObj;
	}

	function setJsonObjectFromObservableDouble(theObsDouble, theObj, theAttribute)
	{
		var value = theObsDouble();
		if ((notUN(value)) && ("" !== value))
		{
			theObj[theAttribute] = value;
		}
		return theObj;
	}

	function setJsonObjectFromObservableBool(theObsBool, theObj, theAttribute)
	{
		var value = theObsBool();
		if ((notUN(value)) && (true === value))
		{
			theObj[theAttribute] = value;
		}
		return theObj;
	}


	////////////////////////////////////////////////////////////////
	//// query results
	////////////////////////////////////////////////////////////////

	function getJsonFromObservableArray(theObsArray)
	{
		var value = theObsArray();
		var result = [];
		if (notUN(value))
		{
			if (0 === value.length)
			{
				result = [];
			} else
			{
				result = ko.toJS(value);
			}
		}
		return result;
	}


	function getOriginalOrder(theLength)
	{
		var indexes = Array.from(Array(theLength)).map((e, i) => i);
		return indexes;
	}

	function getNewOrder(theLength)
	{
		var indexes = Array.from(Array(theLength)).map((e, i) => i);
		indexes = indexes.map((e, i) => i - 3);
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
		} else if ("" === value)
		{
			value = null;
		}
		return value;
	}

	function getJsonFromObservableBool(theObsBool)
	{
		var value = theObsBool();
		if (!notUN(value))
		{
			value = false;
		} else if (true === value)
		{
			value = true;
		}
		return value;
	}

	self.queryResultLength = ko.observable("");
	self.populateQueryResults = ko.computed(function ()
	{
		//console.log("populateQueryResults triggered");
		// jsonQueryString, the primary driver behind this firing, needs to be
		// outside the if statement, or it doesn't trigger a recompute.
		// Any failure to fire issues, add similar outside-the-if variables.
		var jqsObj = self.jsonQueryString;
		var jqs = jqsObj();
		//console.log("populateQueryResults jqs=" + jqs);
		var gui = self.makeGuiVisible();
		var loadLen = self.doneLoading().length;
		var first = self.firstLoad();
		//console.log("gui=" + gui);
		//console.log("loadLen=" + loadLen);
		//console.log("first=" + first);
		// prevent double calls when setting default values
		if (((gui) && (loadLen < 1)) ||
				(true === first))
		{
			var url = new URL(window.location.href);
			//console.log("populateQueryResults calling");
			var loadDefaults = self.firstLoad();
			self.firstLoad(false);
			var date = new Date();
			var start = date.getTime();
			disableInput();
			$.ajax(
					{
						type: "GET",
						dataType: 'json',
						async: true,
						url: "../query",
						cache: false,
						data:
								{
									search: jqs,
									show: self.urlShowParam()
								},
						success: function (theJson)
						{
							//console.log("populateQueryResults success");
							//console.log("query" + " :" + JSON.stringify(theJson));
							date = new Date();
							var finish = date.getTime();
							console.log("Time for query: " + ((finish - start) / 1000.0) + " seconds");
							self.queryResultLength(theJson.data.length);
							GlobalHeaders = theJson.headers;
							if (theJson.skippedEmptyResult)
							{
								alert("One or more search criteria resulted in no results, so those criteria were ignored. If you searched for a dataset or result by ID, it was not found. The search results may be more general than you expected.");
							}
							for (var i = 0; i < theJson.headers.length; i++)
							{
								var obj = theJson.headers[i];
								// TODO:BEV: is this needed? render is set in Dataset.java
								if (obj.title === "Actions")
								{
									obj.render = tableActionOptions;
								}
							}
							// set list of available criterias
							self.updateObsArray(self.optionsSources, theJson.availableSources, self.selectedSources);
							self.updateObsArray(self.optionsProgram, theJson.availableProgram, self.selectedProgram);
							self.updateObsArray(self.optionsProjects, theJson.availableProjects, self.selectedProjects);
							self.updateObsArray(self.optionsCategories, theJson.availableCategories, self.selectedCategories);
							self.updateObsArray(self.optionsPlatforms, theJson.availablePlatforms, self.selectedPlatforms);
							self.updateObsArray(self.optionsData, theJson.availableData, self.selectedData);
							self.updateObsArray(self.optionsDetails, theJson.availableDetails, self.selectedDetails);
							self.updateObsArray(self.optionsDataVersions, theJson.availableDataVersions, self.selectedDataVersions);
							self.updateObsArray(self.optionsTestVersions, theJson.availableTestVersions, self.selectedTestVersions);
							self.updateObsArray(self.optionsJobType, theJson.availableJobType, self.selectedJobType);
							// DSC and Advanced values
							self.updateObsArray(self.optionsAnalysisPath, theJson.availableAnalysisPath, self.selectedAnalysisPath);
							// DSC values
							self.updateObsArray(self.optionsOverallDSCpvalue, theJson.availableOverallDSCpvalue, self.selectedOverallDSCpvalue);
							self.updateObsArray(self.optionsOverallDSC, theJson.availableOverallDSC, self.selectedOverallDSC);
							// Advanced values
							self.updateObsArray(self.optionsAnalysisPath, theJson.availableAnalysisPath, self.selectedAnalysisPath);
							self.updateObsArray(self.optionsNegLog10PValue, theJson.availableNegLog10PValue, self.selectedNegLog10PValue);
							self.updateObsArray(self.optionsNegLog10Cutoff, theJson.availableNegLog10Cutoff, self.selectedNegLog10Cutoff);
							self.updateObsArray(self.optionsBatchesCalled, theJson.availableBatchesCalled, self.selectedBatchesCalled);
							//
							if (true === loadDefaults)
							{
								// can set, since only done to initialize
								// Sources
								if (notUN(self.urlSources))
								{
									self.selectedSources(self.urlSources);
								} else if (self.defaultSources.length > 0)
								{
									self.selectedSources(self.defaultSources);
								}
								// Program
								if (notUN(self.urlProgram))
								{
									self.selectedProgram(self.urlProgram);
								} else if (self.defaultProgram.length > 0)
								{
									self.selectedProgram(self.defaultProgram);
								}
								// Projects
								if (notUN(self.urlProjects))
								{
									self.selectedProjects(self.urlProjects);
								} else if (self.defaultProjects.length > 0)
								{
									self.selectedProjects(self.defaultProjects);
								}
								// Categories
								if (notUN(self.urlCategories))
								{
									self.selectedCategories(self.urlCategories);
								} else if (self.defaultCategories.length > 0)
								{
									self.selectedCategories(self.defaultCategories);
								}
								// Platforms
								if (notUN(self.urlPlatforms))
								{
									self.selectedPlatforms(self.urlPlatforms);
								} else if (self.defaultPlatforms.length > 0)
								{
									self.selectedPlatforms(self.defaultPlatforms);
								}
								// Platforms
								if (notUN(self.urlPlatforms))
								{
									self.selectedPlatforms(self.urlPlatforms);
								} else if (self.defaultPlatforms.length > 0)
								{
									self.selectedPlatforms(self.defaultPlatforms);
								}
								// Data
								if (notUN(self.urlData))
								{
									self.selectedData(self.urlData);
								} else if (self.defaultData.length > 0)
								{
									self.selectedData(self.defaultData);
								}
								// Details
								if (notUN(self.urlDetails))
								{
									self.selectedDetails(self.urlDetails);
								} else if (self.defaultDetails.length > 0)
								{
									self.selectedDetails(self.defaultDetails);
								}
								// Data
								if (notUN(self.urlData))
								{
									self.selectedData(self.urlData);
								} else if (self.defaultData.length > 0)
								{
									self.selectedData(self.defaultData);
								}
								// Data Versions
								if (notUN(self.urlDataVersions))
								{
									self.selectedDataVersions(self.urlDataVersions);
								} else if (self.defaultDataVersions.length > 0)
								{
									self.selectedDataVersions(self.defaultDataVersions);
								}
								// Test Versions
								if (notUN(self.urlTestVersions))
								{
									self.selectedTestVersions(self.urlTestVersions);
								} else if (self.defaultTestVersions.length > 0)
								{
									self.selectedTestVersions(self.defaultTestVersions);
								}
								// OverallDSCpvalue
								if (notUN(self.urlOverallDSCpvalue))
								{
									self.selectedOverallDSCpvalue(self.urlOverallDSCpvalue);
								}
								// also do min/max dsc settings
								self.populateMinMax(self.selectedOverallDSCmin, self.enteredOverallDSCmin, self.urlOverallDSCmin, "DSC-min");
								self.populateMinMax(self.selectedOverallDSCmax, self.enteredOverallDSCmax, self.urlOverallDSCmax, "DSC-max");
								// TODO: ADV-FILTER add defaults for advanced filter options
								if (notUN(self.urlPipelineStatus))
								{
									self.selectedPipelineStatus(self.urlPipelineStatus);
								} else
								{
									self.selectedPipelineStatus(self.defaultPipelineStatus);
								}
								if (notUN(self.urlDataFormat))
								{
									self.selectedDataFormat(self.urlDataFormat);
								} else
								{
									self.selectedDataFormat(self.defaultDataFormat);
								}
								if (notUN(self.urlPca))
								{
									self.selectedPca(self.urlPca);
								} else
								{
									self.selectedPca(self.defaultPca);
								}
								if (notUN(self.urlBoxplot))
								{
									self.selectedBoxplot(self.urlBoxplot);
								} else
								{
									self.selectedBoxplot(self.defaultBoxplot);
								}
								if (notUN(self.urlCdp))
								{
									self.selectedCdp(self.urlCdp);
								} else
								{
									self.selectedCdp(self.defaultCdp);
								}
								if (notUN(self.urlHierClust))
								{
									self.selectedHierClust(self.urlHierClust);
								} else
								{
									self.selectedHierClust(self.defaultHierClust);
								}
								if (notUN(self.urlDsc))
								{
									self.selectedDsc(self.urlDsc);
								} else
								{
									self.selectedDsc(self.defaultDsc);
								}
								if (notUN(self.urlDiscrete))
								{
									self.selectedDiscrete(self.urlDiscrete);
								} else
								{
									self.selectedDiscrete(self.defaultDiscrete);
								}
								if (notUN(self.urlNgchm))
								{
									self.selectedNgchm(self.urlNgchm);
								} else
								{
									self.selectedNgchm(self.defaultNgchm);
								}
								if (notUN(self.urlSuperClust))
								{
									self.selectedSuperClust(self.urlSuperClust);
								} else
								{
									self.selectedSuperClust(self.defaultSuperClust);
								}
								if (notUN(self.urlUmap))
								{
									self.selectedUmap(self.urlUmap);
								} else
								{
									self.selectedUmap(self.defaultUmap);
								}
								if (notUN(self.urlGteSamplesMatrix))
								{
									self.selectedGteSamplesMatrix(self.urlGteSamplesMatrix);
								} else
								{
									self.selectedGteSamplesMatrix(self.defaultGteSamplesMatrix);
								}
								self.enteredGteSamplesMatrix(self.selectedGteSamplesMatrix());
								if (notUN(self.urlLteSamplesMatrix))
								{
									self.selectedLteSamplesMatrix(self.urlLteSamplesMatrix);
								} else
								{
									self.selectedLteSamplesMatrix(self.defaultLteSamplesMatrix);
								}
								self.enteredLteSamplesMatrix(self.selectedLteSamplesMatrix());
								if (notUN(self.urlNanSamplesMatrix))
								{
									self.selectedNanSamplesMatrix(self.urlNanSamplesMatrix);
								} else
								{
									self.selectedNanSamplesMatrix(self.defaultNanSamplesMatrix);
								}
								if (notUN(self.urlGteFeaturesMatrix))
								{
									self.selectedGteFeaturesMatrix(self.urlGteFeaturesMatrix);
								} else
								{
									self.selectedGteFeaturesMatrix(self.defaultGteFeaturesMatrix);
								}
								self.enteredGteFeaturesMatrix(self.selectedGteFeaturesMatrix());
								if (notUN(self.urlLteFeaturesMatrix))
								{
									self.selectedLteFeaturesMatrix(self.urlLteFeaturesMatrix);
								} else
								{
									self.selectedLteFeaturesMatrix(self.defaultLteFeaturesMatrix);
								}
								self.enteredLteFeaturesMatrix(self.selectedLteFeaturesMatrix());
								if (notUN(self.urlNanFeaturesMatrix))
								{
									self.selectedNanFeaturesMatrix(self.urlNanFeaturesMatrix);
								} else
								{
									self.selectedNanFeaturesMatrix(self.defaultNanFeaturesMatrix);
								}
								if (notUN(self.urlGteFeaturesMutations))
								{
									self.selectedGteFeaturesMutations(self.urlGteFeaturesMutations);
								} else
								{
									self.selectedGteFeaturesMutations(self.defaultGteFeaturesMutations);
								}
								self.enteredGteFeaturesMutations(self.selectedGteFeaturesMutations());
								if (notUN(self.urlLteFeaturesMutations))
								{
									self.selectedLteFeaturesMutations(self.urlLteFeaturesMutations);
								} else
								{
									self.selectedLteFeaturesMutations(self.defaultLteFeaturesMutations);
								}
								self.enteredLteFeaturesMutations(self.selectedLteFeaturesMutations());
								if (notUN(self.urlNanFeaturesMutations))
								{
									self.selectedNanFeaturesMutations(self.urlNanFeaturesMutations);
								} else
								{
									self.selectedNanFeaturesMutations(self.defaultNanFeaturesMutations);
								}
								if (notUN(self.urlGteUnknownBatches))
								{
									self.selectedGteUnknownBatches(self.urlGteUnknownBatches);
								} else
								{
									self.selectedGteUnknownBatches(self.defaultGteUnknownBatches);
								}
								self.enteredGteUnknownBatches(self.selectedGteUnknownBatches());
								if (notUN(self.urlLteUnknownBatches))
								{
									self.selectedLteUnknownBatches(self.urlLteUnknownBatches);
								} else
								{
									self.selectedLteUnknownBatches(self.defaultLteUnknownBatches);
								}
								self.enteredLteUnknownBatches(self.selectedLteUnknownBatches());
								if (notUN(self.urlNanUnknownBatches))
								{
									self.selectedNanUnknownBatches(self.urlNanUnknownBatches);
								} else
								{
									self.selectedNanUnknownBatches(self.defaultNanUnknownBatches);
								}
								if (notUN(self.urlGteUniqueBatchCount))
								{
									self.selectedGteUniqueBatchCount(self.urlGteUniqueBatchCount);
								} else
								{
									self.selectedGteUniqueBatchCount(self.defaultGteUniqueBatchCount);
								}
								self.enteredGteUniqueBatchCount(self.selectedGteUniqueBatchCount());
								if (notUN(self.urlLteUniqueBatchCount))
								{
									self.selectedLteUniqueBatchCount(self.urlLteUniqueBatchCount);
								} else
								{
									self.selectedLteUniqueBatchCount(self.defaultLteUniqueBatchCount);
								}
								self.enteredLteUniqueBatchCount(self.selectedLteUniqueBatchCount());
								if (notUN(self.urlNanUniqueBatchCount))
								{
									self.selectedNanUniqueBatchCount(self.urlNanUniqueBatchCount);
								} else
								{
									self.selectedNanUniqueBatchCount(self.defaultNanUniqueBatchCount);
								}
								if (notUN(self.urlGteCorrelatedBatchTypes))
								{
									self.selectedGteCorrelatedBatchTypes(self.urlGteCorrelatedBatchTypes);
								} else
								{
									self.selectedGteCorrelatedBatchTypes(self.defaultGteCorrelatedBatchTypes);
								}
								self.enteredGteCorrelatedBatchTypes(self.selectedGteCorrelatedBatchTypes());
								if (notUN(self.urlLteCorrelatedBatchTypes))
								{
									self.selectedLteCorrelatedBatchTypes(self.urlLteCorrelatedBatchTypes);
								} else
								{
									self.selectedLteCorrelatedBatchTypes(self.defaultLteCorrelatedBatchTypes);
								}
								self.enteredLteCorrelatedBatchTypes(self.selectedLteCorrelatedBatchTypes());
								if (notUN(self.urlNanCorrelatedBatchTypes))
								{
									self.selectedNanCorrelatedBatchTypes(self.urlNanCorrelatedBatchTypes);
								} else
								{
									self.selectedNanCorrelatedBatchTypes(self.defaultNanCorrelatedBatchTypes);
								}
								if (notUN(self.urlGteBatchTypeCount))
								{
									self.selectedGteBatchTypeCount(self.urlGteBatchTypeCount);
								} else
								{
									self.selectedGteBatchTypeCount(self.defaultGteBatchTypeCount);
								}
								self.enteredGteBatchTypeCount(self.selectedGteBatchTypeCount());
								if (notUN(self.urlLteBatchTypeCount))
								{
									self.selectedLteBatchTypeCount(self.urlLteBatchTypeCount);
								} else
								{
									self.selectedLteBatchTypeCount(self.defaultLteBatchTypeCount);
								}
								self.enteredLteBatchTypeCount(self.selectedLteBatchTypeCount());
								if (notUN(self.urlNanBatchTypeCount))
								{
									self.selectedNanBatchTypeCount(self.urlNanBatchTypeCount);
								} else
								{
									self.selectedNanBatchTypeCount(self.defaultNanBatchTypeCount);
								}
							}
							// destroy: true eleminates the old datatable object
							// order: start with 1, since 0 (ID) is present but hidden
							if (0 === theJson.headers.length)
							{
								//console.log("clear datatable");
								alert("No results to display");
							} else if (true === first)
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
											rowId: (function (x)
											{
												return x[1];
											}),
											destroy: true,
											data: theJson.data,
											columns: theJson.headers,
											// NOTE CHANGING ORDER OF HEADERs/DATA will CHANGE INDEXES
											// Actions 0
											// ID 1
											// Source 2
											// Program 3
											// Project 4
											// Category 5
											// Data 6
											// Details 7
											// Data Version 8
											// Test Version 9
											order: [[2, 'asc'], [3, 'asc'], [4, 'asc'], [5, 'asc'], 
												[6, 'asc'], [7, 'asc'], [8, 'asc'], [10, 'asc'], [9, 'asc']],
											info: false, // hide paging info at bottom of screen
											deferRender: true, // requiref for most other options to work
											paging: false, // no paging, hide page selection at top and bottom
											scrollCollapse: true, // if small enough to fix screen, no scroll
											scrollX: true, // left-right scroll required to keep lined up
											fixedHeader: false, // keep header row on screen set to false, since scroll resize does this too
											scrollResize: true, // resize scroll area to fit screen
											scrollY: 100, // value is needed, but ignored due to scrollResize:true
											lengthChange: false
										});
								$('#resultsTable').on('click', 'tbody tr td:not(:first-child)', function (theEvent)
								{
									var rowId = theEvent.currentTarget.parentElement.id;
									var dataRows = $('#resultsTable').DataTable().rows().data();
									var matched = null;
									for (var index = 0; (index < dataRows.length) && (null === matched); index++)
									{
										if (rowId === dataRows[index][1])
										{
											matched = dataRows[index];
											console.log("DAPIAppView matched=" + matched);
										}
									}
									if (null !== matched)
									{
										var splitted = matched[0].split(" | ");
										if ("" !== splitted[2])
										{
											// TODO: look up current algorithm
											window.open(getUrlpath() + splitted[2] + "&alg=PCA%2B", 'viewIframe');
										}
									}
								});
							} else
							{
								//console.log("refresh datatable");
								$('#resultsTable').DataTable().clear();
								$('#resultsTable').DataTable().rows.add(theJson.data).draw();
							}
							//console.log("DAPIAppView::populateQueryResults call setSelectedDatasetQuery");
							//console.log("DAPIAppView::populateQueryResults theId=" + self.viewedDatasetId());
							setSelectedDatasetQuery(self.viewedDatasetId());
							//console.log("DAPIAppView::populateQueryResults call enableInput");
							enableInput();
						},
						error: function (jqXHR, textStatus, errorThrown)
						{
							//console.log("populateQueryResults error");
							console.log("query" + " :" + textStatus + " and " + errorThrown);
							alert("query" + " :" + textStatus + " and " + errorThrown);
							enableInput();
						}
					});
		}
	}, self).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 500, notify: 'always'}});

	self.checkForValue = function (theQueryEntry, theValue)
	{
		var result = false;
		if (theValue === theQueryEntry.mIndexSource)
		{
			result = true;
		}
		return result;
	};

	self.checkStartsValue = function (theQueryEntry, theValue)
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
	window.location.href = '../manifest?show=' + appview.urlShowParam() +
			'&search=' + encodeURIComponent(appview.jsonQueryString());
}

function urlParamsJson()
{
	// ADV-FILTER params
	let urlParams = {};
	if ('dsc' === appview.urlShowParam())
	{
		urlParams["show"] = "dsc";
	} else if ('kwd' === appview.urlShowParam())
	{
		urlParams["show"] = "kwd";
	} else if ('advanced' === appview.urlShowParam())
	{
		urlParams["show"] = "advanced";
	} else
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
	if ('dsc' === appview.urlShowParam())
	{
		show = "show=dsc&";
	} else if ('kwd' === appview.urlShowParam())
	{
		show = "show=kwd&";
	} else if ('advanced' === appview.urlShowParam())
	{
		show = "show=advanced&";
	}
	var pageLength = $('#resultsTable').DataTable().page.len();
	var url = window.location.origin + window.location.pathname + "?" + "pageLength=" + pageLength + "&" + show + "default=" + encodeURIComponent(text);
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
	} else
	{
		alert("Must be a positive number with 3 or fewer significant digits");
	}
}

var GlobalHeaders = null;

function humanIdFromRow(theRow)
{
	var id = "";
	for (let i = 3; i < theRow.length; i++)
	{
		id = id + GlobalHeaders[i].title + " : " + theRow[i] + " | ";
	}
	return encodeURIComponent(id);
}

function tableActionOptions(data, type, row, meta)
{
	var retVal = "";
	if ("" !== data)
	{
		var splitted = data.split(" | ");
		if ("" !== splitted[2])
		{
			retVal += '<button type="button" class="sdb-control-button" onclick="window.open(\'' + getUrlpath() + splitted[2] + '\', \'viewIframe\');" title="View Analysis in Viewer">' +
					'<i class="fas fa-tv" style="color: green;"> </i></button>';
		}
		if ("" !== splitted[0])
		{
			retVal += '<button type="button" class="sdb-control-button" onclick="sendGAEvent(\'action\', \'download-data\', \'Zip=' + humanIdFromRow(row) + '\'); location.href=\'' + getUrlpath() + splitted[0] + '\';" title="Download Data Archive">' +
					'<i class="fas fa-download" style="color: blue;"> </i></button>';
		}
		if ("" !== splitted[1])
		{
			retVal += '<button type="button" class="sdb-control-button" onclick="sendGAEvent(\'action\', \'download-results\', \'Zip=' + humanIdFromRow(row) + '\'); location.href=\'' + getUrlpath() + splitted[1] + '\';" title="Download Results Archive">' +
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
	appview.selectedProgram.removeAll();
	appview.selectedProjects.removeAll();
	appview.selectedCategories.removeAll();
	appview.selectedPlatforms.removeAll();
	appview.selectedData.removeAll();
	appview.selectedDetails.removeAll();
	appview.selectedDataVersions.removeAll();
	appview.selectedTestVersions.removeAll();
	// ADV-FILTER clear advanced values
	appview.selectedPipelineStatus.removeAll();
	appview.selectedDataFormat.removeAll();
	appview.selectedPca.removeAll();
	appview.selectedBoxplot.removeAll();
	appview.selectedCdp.removeAll();
	appview.selectedHierClust.removeAll();
	appview.selectedDsc.removeAll();
	appview.selectedDiscrete.removeAll();
	appview.selectedNgchm.removeAll();
	appview.selectedSuperClust.removeAll();
	appview.selectedUmap.removeAll();

	appview.enteredGteSamplesMatrix('');
	appview.selectedGteSamplesMatrix('');
	appview.enteredLteSamplesMatrix('');
	appview.selectedLteSamplesMatrix('');
	appview.selectedNanSamplesMatrix(false);

	appview.enteredGteSamplesMutations('');
	appview.selectedGteSamplesMutations('');
	appview.enteredLteSamplesMutations('');
	appview.selectedLteSamplesMutations('');
	appview.selectedNanSamplesMutations(false);

	appview.enteredGteFeaturesMatrix('');
	appview.selectedGteFeaturesMatrix('');
	appview.enteredLteFeaturesMatrix('');
	appview.selectedLteFeaturesMatrix('');
	appview.selectedNanFeaturesMatrix(false);

	appview.enteredGteFeaturesMutations('');
	appview.selectedGteFeaturesMutations('');
	appview.enteredLteFeaturesMutations('');
	appview.selectedLteFeaturesMutations('');
	appview.selectedNanFeaturesMutations(false);

	appview.enteredGteUnknownBatches('');
	appview.selectedGteUnknownBatches('');
	appview.enteredLteUnknownBatches('');
	appview.selectedLteUnknownBatches('');
	appview.selectedNanUnknownBatches(false);

	appview.enteredGteUniqueBatchCount('');
	appview.selectedGteUniqueBatchCount('');
	appview.enteredLteUniqueBatchCount('');
	appview.selectedLteUniqueBatchCount('');
	appview.selectedNanUniqueBatchCount(false);

	appview.enteredGteCorrelatedBatchTypes('');
	appview.selectedGteCorrelatedBatchTypes('');
	appview.enteredLteCorrelatedBatchTypes('');
	appview.selectedLteCorrelatedBatchTypes('');
	appview.selectedNanCorrelatedBatchTypes(false);

	appview.enteredGteBatchTypeCount('');
	appview.selectedGteBatchTypeCount('');
	appview.enteredLteBatchTypeCount('');
	appview.selectedLteBatchTypeCount('');
	appview.selectedNanBatchTypeCount(false);
}
