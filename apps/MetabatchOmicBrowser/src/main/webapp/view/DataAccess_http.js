class DataAccess_http
{
	constructor(theParent)
	{
		this.parent = theParent;
	};
	
	isOnline()
	{
		return true;
	}

	addImage(theRequestedId, theImagePath, theDisplayDivId)
	{
		if (""===theImagePath)
		{
			console.log("No image path " + theRequestedId);
		}
		else
		{
			var imgId = theDisplayDivId + "dynamicImg";
			//console.log("imgId=" + imgId);
			$('#' + imgId).remove();
			if (notUN(theImagePath))
			{
				$.ajax(
				{
					type: "GET",
					dataType: 'text',
					url: "../dsimage",
					cache: false,
					data:
					{
						id: theRequestedId,
						image: theImagePath
					},
					success: function (theImageData)
					{
						$('#' + theDisplayDivId).append('<div class="displayPngDiv plotChild"><img class="displayPngImg plotChild" id="' + imgId + '" src="" /></div>');
						$("#" + imgId).attr("src", "data:image/png;base64," + theImageData);
					},
					error: function (jqXHR, textStatus, errorThrown)
					{
						console.log("dsimage" + " :" + textStatus + " and " + errorThrown);
						alert("dsimage" + " :" + textStatus + " and " + errorThrown);
					}
				});
			}
		}
	};

	setIndexAndId()
	{
		var url = new URL(window.location.href);
		var tmpId = url.searchParams.get("id");
		//console.log("setIndexAndId tmpId=" + tmpId);
		if (null === tmpId)
		{
			console.log("setIndexAndId No ID Found");
			return new Promise((resolve, reject) => 
			{
				resolve(
				{
					"mID": null,
					"mAlg": null,
					"mLvl1": null,
					"mLvl2": null,
					"mLvl3": null,
					"mLvl4": null,
					"hideDB": null,
					"hideLP": null
				});
			});
			/* return new Promise((resolve, reject) => 
			{
				$.ajax(
				{
					type: "GET",
					dataType: 'json',
					url: "../defaults",
					cache: false,
					success: function (theJson)
					{
						resolve(theJson);
					},
					error: function (jqXHR, textStatus, errorThrown)
					{
						console.log("defaults" + " :" + textStatus + " and " + errorThrown);
						alert("defaults" + " :" + textStatus + " and " + errorThrown);
					}
				});
			}); */
		}
		else
		{
			return new Promise((resolve, reject) => 
			{
				let alg = url.searchParams.get("alg");
				let lvl1 = url.searchParams.get("lvl1");
				let lvl2 = url.searchParams.get("lvl2");
				let lvl3 = url.searchParams.get("lvl3");
				let lvl4 = url.searchParams.get("lvl4");
				let hideDB = url.searchParams.get("hideDB");
				//console.log("hideDB 1=" + hideDB);
				if ("true"===hideDB)
				{
					hideDB = true;
				}
				else
				{
					hideDB = false;
				}
				//console.log("hideDB 2=" + hideDB);
				let hideLP = url.searchParams.get("hideLP");
				//console.log("hideLP 1=" + hideLP);
				if ("true"===hideLP)
				{
					hideLP = true;
				}
				else
				{
					hideLP = false;
				}
				//console.log("hideLP 2=" + hideLP);
				resolve(
				{
					"mID": tmpId,
					"mAlg": alg,
					"mLvl1": lvl1,
					"mLvl2": lvl2,
					"mLvl3": lvl3,
					"mLvl4": lvl4,
					"hideDB": hideDB,
					"hideLP": hideLP
				});
			});
		}
	};
	
	loadLinks()
	{
		return $.ajax(
		{
			type: "GET",
			dataType: 'json',
			url: "../urls",
			cache: false,
			error: function (jqXHR, textStatus, errorThrown)
			{
				console.log("urls" + " :" + textStatus + " and " + errorThrown);
				alert("urls" + " :" + textStatus + " and " + errorThrown);
			}
		});
	};
	
	loadListOfBatchTypes(theRequestedIdKO)
	{
		//console.log("loadIndexAndId = " + theRequestedIdKO());
		return $.ajax(
		{
			type: "GET",
			dataType: 'json',
			url: "../dsbtypes",
			cache: false,
			data:
			{
				id: theRequestedIdKO()
			},
			error: function (jqXHR, textStatus, errorThrown)
			{
				console.log("dsbtypes" + " :" + textStatus + " and " + errorThrown);
				alert("dsbtypes" + " :" + textStatus + " and " + errorThrown);
			}
		});
	};

	loadIndexAndId(theRequestedIdKO)
	{
		//console.log("loadIndexAndId = " + theRequestedIdKO());
		return $.ajax(
		{
			type: "GET",
			dataType: 'json',
			url: "../dsindex",
			cache: false,
			data:
			{
				id: theRequestedIdKO()
			},
			error: function (jqXHR, textStatus, errorThrown)
			{
				console.log("dsindex" + " :" + textStatus + " and " + errorThrown);
				alert("dsindex" + " :" + textStatus + " and " + errorThrown);
			}
		});
	};
	
	getExistance(theRequestedId, theTextFile)
	{
		const ajax = $.ajax(
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
			}
		});
		ajax.fail(function (jqXHR, textStatus)
		{
			console.log("dsexists" + " :" + textStatus);
			alert("dsexists" + " :" + textStatus);
		});
		return ajax;
	};
	
	getDataFile(theRequestedId, theTextFile)
	{
		const ajax = $.ajax(
		{
			type: "GET",
			dataType: 'text',
			url: "../dstext",
			cache: false,
			data:
			{
				id: theRequestedId,
				text: theTextFile
			}
		});
		ajax.fail(function (jqXHR, textStatus)
		{
			console.log("dstext" + " :" + textStatus);
			alert("dstext" + " :" + textStatus);
		});
		return ajax;
	};
	
	getDataBlobPromise(theRequestedId, theTextFile, theUrlBase)
	{
		return new Promise((resolve, reject) => 
		{
			var url = theUrlBase + "/dsblob?" 
					+ "id=" + theRequestedId + "&" + "text=" + theTextFile;
			var xhr = new XMLHttpRequest();
			xhr.open("GET", url);
			xhr.responseType = "blob";
			xhr.onload = () => 
			{
				if (xhr.readyState===4 && xhr.status===200) 
				{
					var e = new Blob([xhr.response], 
					{
						type: "application/zip"
					});
					resolve(e);
				}
			};
			xhr.onerror = () => 
			{
				reject(xhr);
			};
			xhr.send();
		});
	};
}