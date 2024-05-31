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

	getIndexAndId()
	{
		var url = new URL(window.location.href);
		var tmpId = url.searchParams.get("id");
		//console.log("getIndexAndId tmpId=" + tmpId);
		if (null === tmpId)
		{
			//console.log("getIndexAndId No ID Found");
			return {
				"mID": null,
				"mAlg": null,
				"mLvl1": null,
				"mLvl2": null,
				"mLvl3": null,
				"mLvl4": null,
				"mData": null,
				"mTest": null,
				"hideDB": null,
				"hideLP": null,
				"useSimple": null
			};

		} else
		{
			let alg = url.searchParams.get("alg");
			let lvl1 = url.searchParams.get("lvl1");
			let lvl2 = url.searchParams.get("lvl2");
			let lvl3 = url.searchParams.get("lvl3");
			let lvl4 = url.searchParams.get("lvl4");
			let hideDB = url.searchParams.get("hideDB");
			let useSimple = url.searchParams.get("useSimple");
			//console.log("hideDB 1=" + hideDB);
			if ("true" === useSimple)
			{
				useSimple = true;
			} else
			{
				useSimple = false;
			}
			if ("true" === hideDB)
			{
				hideDB = true;
			} else
			{
				hideDB = false;
			}
			//console.log("hideDB 2=" + hideDB);
			let hideLP = url.searchParams.get("hideLP");
			//console.log("hideLP 1=" + hideLP);
			if ("true" === hideLP)
			{
				hideLP = true;
			} else
			{
				hideLP = false;
			}
			//console.log("hideLP 2=" + hideLP);
			let ssource = url.searchParams.get("ssource");
			let sprogram = url.searchParams.get("sprogram");
			let sproject = url.searchParams.get("sproject");
			let scategory = url.searchParams.get("scategory");
			let splatform = url.searchParams.get("splatform");
			let sdata = url.searchParams.get("sdata");
			let sdetails = url.searchParams.get("sdetails");
			let sjobtype = url.searchParams.get("sjobtype");
			let sdataversion = url.searchParams.get("sdataversion");
			let stestversion = url.searchParams.get("stestversion");

			return {
				"mID": tmpId,
				"mAlg": alg,
				"mLvl1": lvl1,
				"mLvl2": lvl2,
				"mLvl3": lvl3,
				"mLvl4": lvl4,
				"hideDB": hideDB,
				"hideLP": hideLP,
				"useSimple": useSimple,
				"stestversion": stestversion,
				"sdataversion": sdataversion,
				"sjobtype": sjobtype,
				"sdetails": sdetails,
				"sdata": sdata,
				"splatform": splatform,
				"scategory": scategory,
				"sproject": sproject,
				"sprogram": sprogram,
				"ssource": ssource
			};
		}
	};
	
	simpleSearchData()
	{
		return $.ajax(
		{
			type: "GET",
			dataType: 'json',
			url: "../drilldown",
			cache: false,
			error: function (jqXHR, textStatus, errorThrown)
			{
				console.log("drilldown" + " :" + textStatus + " and " + errorThrown);
				alert("drilldown" + " :" + textStatus + " and " + errorThrown);
			}
		});
	};
	
	loadListOfBatchTypes(theRequestedIdKO)
	{
		var requested = theRequestedIdKO();
		//console.log("loadListOfBatchTypes = " + requested);
		//console.log(requested);
		//console.log("loadListOfBatchTypes notUN(theRequestedIdKO()) = " + notUN(requested));
		if (notUN(requested))
		{
			return $.ajax(
			{
				type: "GET",
				dataType: 'json',
				url: "../dsbtypes",
				cache: false,
				data:
				{
					id: requested
				},
				error: function (jqXHR, textStatus, errorThrown)
				{
					console.log("dsbtypes" + " :" + textStatus + " and " + errorThrown);
					alert("dsbtypes" + " :" + textStatus + " and " + errorThrown);
				}
			});
		}
		else
		{
			// gets called with undefined when clearing existing values...
			return undefined;
		}
	};

	loadIndexAndId(theRequestedIdKO)
	{
		var requested = theRequestedIdKO();
		//console.log("loadIndexAndId = " + requested);
		//console.log(requested);
		//console.log("loadIndexAndId notUN(theRequestedIdKO()) = " + notUN(requested));
		if (notUN(requested))
		{
			return $.ajax(
			{
				type: "GET",
				dataType: 'json',
				url: "../dsindex",
				cache: false,
				data:
				{
					id: requested
				},
				error: function (jqXHR, textStatus, errorThrown)
				{
					console.log("dsindex" + " :" + textStatus + " and " + errorThrown);
					alert("dsindex" + " :" + textStatus + " and " + errorThrown);
				}
			});
		}
		else
		{
			// gets called with undefined when clearing existing values...
			return undefined;
		}
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