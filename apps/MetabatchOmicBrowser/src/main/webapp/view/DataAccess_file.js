/* global JSZip */

class DataAccess_file
{
	constructor(theParent)
	{
		this.parent = theParent;
		this.fileZip = null;
	};
	
	isOnline()
	{
		return false;
	}

	setZipFile(theZipFile)
	{
		this.fileZip = theZipFile;
	}

	addImage(theRequestedId, theImagePath, theDisplayDivId)
	{
		//console.log("addImage START");
		var imgId = theDisplayDivId + "dynamicImg";
		$('#' + imgId).remove();
		var thisDA = this;
		if (notUN(thisDA.fileZip))
		{
			if (notUN(theImagePath))
			{
				// console.log("addImage theImagePath = '" + theImagePath + "'");
				// trim to remove first /
				if (theImagePath.startsWith("/"))
				{
					theImagePath = theImagePath.substr(1);
				}
				var fr = new FileReader();
				fr.onload = function ()
				{
					var data = fr.result;
					//var array = new Int8Array(data);
					JSZip.loadAsync(data).then(function(theZip)
					{
						//console.log("addImage Looking for " + theImagePath);
						theZip.file(theImagePath).async("base64").then(function(theImageData)
						{
							$('#' + theDisplayDivId).append('<div class="displayPngDiv plotChild"><img class="displayPngImg plotChild" id="' + imgId + '" src="" /></div>');
							$("#" + imgId).attr("src", "data:image/png;base64," + theImageData);
						});
					}, 
					function (e)
					{
						console.log("Error reading " + thisDA.fileZip.name + ": " + e.message);
						alert("Error reading " + thisDA.fileZip.name + ": " + e.message);
					});
				};
				fr.readAsArrayBuffer(thisDA.fileZip);
			}
		}
	};

	setIndexAndId()
	{
		return new Promise((resolve, reject) => 
		{
			resolve(null);
		});
	};
	
	loadLinks()
	{
		return new Promise((resolve, reject) => 
		{
			resolve(
			{
				"queryForm": "",
				"bevForm": "",
				"stdData": ""
			});
		});
	};

	loadIndexAndId()
	{
		// in loaded zip this.zip, get "index.json" as json, and set to theIndexJsonKO(theJson);
		var thisDA = this;
		if (notUN(thisDA.fileZip))
		{
			return new Promise((resolveTop, reject) => 
			{
				var fr = new FileReader();
				fr.onload = function ()
				{
					var data = fr.result;
					//var array = new Int8Array(data);
					JSZip.loadAsync(data).then(function(theZip)
					{
						//console.log("loadIndexAndId Looking for " + "index.json");
						theZip.file("index.json").async("uint8array").then(function(theArray)
						{
							resolveTop(JSON.parse(new TextDecoder().decode(theArray)));
						});
					}, 
					function (e)
					{
						console.log("Error reading " + thisDA.fileZip.name + ": " + e.message);
						alert("Error reading " + thisDA.fileZip.name + ": " + e.message);
					});
				};
				fr.readAsArrayBuffer(thisDA.fileZip);
			});
		}
	};
	
	getExistance(theRequestedId, theTextFile)
	{
		console.log("getExistance theTextFile='" + theTextFile + "'");
		// trim to remove first /
		if (theTextFile.startsWith("/"))
		{
			theTextFile = theTextFile.substr(1);
		}
		var thisDA = this;
		if (notUN(thisDA.fileZip))
		{
			return new Promise((resolveTop, reject) => 
			{
				var fr = new FileReader();
				fr.onload = function ()
				{
					var data = fr.result;
					//var array = new Int8Array(data);
					JSZip.loadAsync(data).then(function(theZip)
					{
						var myZippedFile = theZip.file(theTextFile);
						if (null===myZippedFile)
						{
							resolveTop("false");
						}
						else
						{
							resolveTop("true");
						}
					}, 
					function (e)
					{
						console.log("Error reading " + thisDA.fileZip.name + ": " + e.message);
						alert("Error reading " + thisDA.fileZip.name + ": " + e.message);
					});
				};
				//console.log("read");
				//console.log(thisDA.fileZip);
				fr.readAsArrayBuffer(thisDA.fileZip);
			});
		}
	};
	
	getDataFile(theRequestedId, theTextFile)
	{
		// console.log("getDataFile theTextFile='" + theTextFile + "'");
		if (notUN(theTextFile))
		{
			// trim to remove first /
			if (theTextFile.startsWith("/"))
			{
				theTextFile = theTextFile.substr(1);
			}
			var thisDA = this;
			if (notUN(thisDA.fileZip))
			{
				return new Promise((resolveTop, reject) => 
				{
					var fr = new FileReader();
					fr.onload = function ()
					{
						var data = fr.result;
						//var array = new Int8Array(data);
						JSZip.loadAsync(data).then(function(theZip)
						{
							var myZippedFile = theZip.file(theTextFile);
							if (null===myZippedFile)
							{
								resolveTop("");
							}
							else
							{
								myZippedFile.async("uint8array").then(function(theArray)
								{
									resolveTop(new TextDecoder().decode(theArray));
								});
							}
						}, 
						function (e)
						{
							console.log("Error reading " + thisDA.fileZip.name + ": " + e.message);
							alert("Error reading " + thisDA.fileZip.name + ": " + e.message);
						});
					};
					//console.log("read");
					//console.log(thisDA.fileZip);
					fr.readAsArrayBuffer(thisDA.fileZip);
				});
			}
		}
	};
	
	getDataBlobPromise(theRequestedId, theTextFile, theUrlBase)
	{
		// console.log("getDataBlobPromise theTextFile='" + theTextFile + "'");
		// trim to remove first /
		if (theTextFile.startsWith("/"))
		{
			theTextFile = theTextFile.substr(1);
		}
		var thisDA = this;
		if (notUN(thisDA.fileZip))
		{
			return new Promise((resolveTop, reject) => 
			{
				var fr = new FileReader();
				fr.onload = function ()
				{
					var data = fr.result;
					//var array = new Int8Array(data);
					JSZip.loadAsync(data).then(function(theZip)
					{
						//console.log("getDataBlobPromise Looking for " + theTextFile);
						theZip.file(theTextFile).async("blob").then(function(theBlob)
						{
							resolveTop(theBlob);
						});
					}, 
					function (e)
					{
						console.log("Error reading " + thisDA.fileZip.name + ": " + e.message);
						alert("Error reading " + thisDA.fileZip.name + ": " + e.message);
					});
				};
				fr.readAsArrayBuffer(thisDA.fileZip);
			});
		}
	};
}