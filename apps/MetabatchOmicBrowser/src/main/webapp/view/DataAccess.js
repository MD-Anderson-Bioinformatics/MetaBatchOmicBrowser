class DataAccess
{
	constructor(theUseZip)
	{
		this.internalDataAccess = null;
		if (theUseZip)
		{
			console.log("do file based data access");
			this.internalDataAccess = new DataAccess_file(this);
		}
		else
		{
			console.log("do server based data access");
			this.internalDataAccess = new DataAccess_http(this);
		}
	};
	
	trimSlashPrefix(theString)
	{
		if ((notUN(theString)) && (''!==theString))
		{
			if (theString.startsWith("/"))
			{
				theString = theString.substr(1);
			}
		}
		return theString;
	};

	addText(theText, theDisplayDivId)
	{
		// use same id as addImage, so it gets replaced by image too
		var imgId = theDisplayDivId + "dynamicImg";
		$('#' + theDisplayDivId).append('<div class="displayPngDiv plotChild"><center class="plotChild" id="' + imgId + '">' + theText + '</center></div>');
	};

	addImage(theRequestedId, theImagePath, theDisplayDivId)
	{
		return this.internalDataAccess.addImage(theRequestedId, theImagePath, theDisplayDivId);
	};
	isOnline()
	{
		return this.internalDataAccess.isOnline();
	};
	getIndexAndId()
	{
		return this.internalDataAccess.getIndexAndId();
	};
	simpleSearchData()
	{
		return this.internalDataAccess.simpleSearchData();
	};
	loadIndexAndId(theRequestedIdKO)
	{
		return this.internalDataAccess.loadIndexAndId(theRequestedIdKO);
	};
	loadListOfBatchTypes(theRequestedIdKO)
	{
		return this.internalDataAccess.loadListOfBatchTypes(theRequestedIdKO);
	};
	getExistance(theRequestedId, theTextFile)
	{
		theTextFile = this.trimSlashPrefix(theTextFile);
		// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
		// return is sometimes JQuery, sometimes a Promise
		return this.internalDataAccess.getExistance(theRequestedId, theTextFile);
	};
	//getErrorLog(theRequestedId, theTextRegularFilePath)
	//{
	//	var textFilePath = theTextRegularFilePath.substr(0, theTextRegularFilePath.lastIndexOf("/")+1) + "error.log";
	//	// use .then, not .done, cause this is sometimes JQuery, sometimes a Promise
	//	var error = undefined;
	//	this.internalDataAccess.getDataFile(theRequestedId, textFilePath).then(function (theTextData)
	//	{
	//		error = theTextData;
	//	});
	//	return error;
	//};
	getDataFile(theRequestedId, theTextFile)
	{
		theTextFile = this.trimSlashPrefix(theTextFile);
		return this.internalDataAccess.getDataFile(theRequestedId, theTextFile);
	};
	getDataBlobPromise(theRequestedId, theTextFile, theUrlBase)
	{
		theTextFile = this.trimSlashPrefix(theTextFile);
		return this.internalDataAccess.getDataBlobPromise(theRequestedId, theTextFile, theUrlBase);
	};

	notUN(theValue)
	{
		return ((undefined !== theValue) && (null !== theValue));
	};
	
	setZipFile(theLocalZipFileObj, theRequestedId, theJsonIndex)
	{
		this.internalDataAccess.setZipFile(theLocalZipFileObj, theRequestedId, theJsonIndex);
	};
}