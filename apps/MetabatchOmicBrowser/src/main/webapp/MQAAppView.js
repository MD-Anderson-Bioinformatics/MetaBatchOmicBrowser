/* 
 *  Copyright (c) 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021 University of Texas MD Anderson Cancer Center
 *  
 *  This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License, or (at your option) any later version.
 *  
 *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *  
 *  You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *  
 *  MD Anderson Cancer Center Bioinformatics on GitHub <https://github.com/MD-Anderson-Bioinformatics>
 *  MD Anderson Cancer Center Bioinformatics at MDA <https://www.mdanderson.org/research/departments-labs-institutes/departments-divisions/bioinformatics-and-computational-biology.html>
 
 */

/* global appview, ko */

////////////////////////////////////////////////////////////////
//// GUI utility function to disable input during long running processes
////////////////////////////////////////////////////////////////

disableInput = function()
{
	$(":input, a, button, tbody tr").prop("disabled",true);
	$("#viewIframe").contents().find(":input, a, button, tbody tr").prop("disabled",true);
	$("#queryIframe").contents().find(":input, a, button, tbody tr").prop("disabled",true);
};

enableInput = function()
{
	$(":input, a, button, tbody tr").prop("disabled",false);
	$("#viewIframe").contents().find(":input, a, button, tbody tr").prop("disabled",false);
	$("#queryIframe").contents().find(":input, a, button, tbody tr").prop("disabled",false);
};

/* ************************************************************************** */
/* Functions to call View or Query IFRAME functions */
/* ************************************************************************** */

function viewGetUrlParamsMQA()
{
	// id index alg lvl1 lvl2
	return document.getElementById('viewIframe').contentWindow.viewGetUrlParams();
}

function queryGetUrlParamsMQA()
{
	// show pageLength default
	return document.getElementById('queryIframe').contentWindow.queryGetUrlParams();
}

/* ************************************************************************** */
/* MQA Knockout AppViewModel */
/* ************************************************************************** */

notUN = function(theValue)
{
	return ((undefined!==theValue)&&(null!==theValue));
};

// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel()
{
	var self = this;
	self.type = "deferred";
	self.makeGuiVisible = ko.observable(false); //.extend({ deferred: true });
	self.viewUrl = ko.observable("loading.html");
	self.queryUrl = ko.observable("loading.html");
	// tracl when query iframe is done
	self.loadedQuery = ko.observable(false);
	
	self.viewIframeSrc = ko.computed(function()
	{
		var newUrl = self.viewUrl();
		if (!newUrl.endsWith("loading.html"))
		{
			newUrl = self.viewUrl() + "&stamp=" + jQuery.now();
		}
		return newUrl;
	});
	
	self.queryIframeSrc = ko.computed(function()
	{
		var newUrl = self.queryUrl();
		if (!newUrl.endsWith("loading.html"))
		{
			newUrl = self.queryUrl() + "&stamp=" + jQuery.now();
		}
		return newUrl;
	});
	
	////////////////////////////////////////////////////////////////
	//// urls for query form
	////////////////////////////////////////////////////////////////
	self.mqaDefaultView = ko.observable("");
	self.mqaDefaultQuery = ko.observable("");
	self.mqaDefaultViewParams = ko.observable("");
	self.mqaDefaultQueryParams = ko.observable("");
	// build URL components for bookmarked MQA link
	var url = new URL(window.location.href);
	self.mqaURLsearchValues = ko.observable(url.search);
	self.urlQuery = ko.observable(url.origin + url.pathname + "query/");
	self.urlView = ko.observable(url.origin + url.pathname + "view/");
	self.urlMqa = ko.observable(url.origin + url.pathname);
	$.ajax(
	{
		type: "GET",
		dataType: 'json',
		url: "urls",
		cache: false,
		async: false,
		success: function(theJson)
		{
			self.mqaDefaultView(theJson.mqaDefaultView);
			self.mqaDefaultQuery(theJson.mqaDefaultQuery);
			self.mqaDefaultViewParams(theJson.mqaDefaultViewParams);
			// do not set self.viewUrl here. Instead, set it after the query iframe loads
			//if (""===self.mqaURLsearchValues())
			//{ // self.mqaDefaultViewParams
			//	self.viewUrl("view/?" + theJson.mqaDefaultViewParams);
			//}
			//else
			//{
			//	self.viewUrl("view/" + self.mqaURLsearchValues());
			//}
			//console.log("view/?" + theJson.mqaDefaultViewParams);
			self.mqaDefaultQueryParams(theJson.mqaDefaultQueryParams);
			if (""===self.mqaURLsearchValues())
			{
				self.queryUrl("query/?" + theJson.mqaDefaultQueryParams);
			}
			else
			{
				self.queryUrl("query/" + self.mqaURLsearchValues());
			}
			//console.log("query/?" + theJson.mqaDefaultQueryParams);
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			console.log("urls call" + " :" + textStatus + " and " + errorThrown);
			alert("urls call" + " :" + textStatus + " and " + errorThrown);
		}
	});
} //End Appview Model

// do not make computed, as view and query iframe functions do not exist at first
function urlParams() 
{
	// id index alg lvl1 lvl2
	var viewJson = viewGetUrlParamsMQA();
	// show pageLength default
	var queryJson = queryGetUrlParamsMQA();
	return  "?show=" + encodeURIComponent(queryJson.show) +
			"&pageLength=" + encodeURIComponent(queryJson.pageLength) +
			"&default=" + encodeURIComponent(queryJson.default) +
			"&id=" + encodeURIComponent(viewJson.id) +
			"&index=" + encodeURIComponent(viewJson.index) +
			(notUN(viewJson.alg)?("&alg=" + encodeURIComponent(viewJson.alg)):"") +
			(notUN(viewJson.lvl1)?("&lvl1=" + encodeURIComponent(viewJson.lvl1)):"") +
			(notUN(viewJson.lvl2)?("&lvl2=" + encodeURIComponent(viewJson.lvl2)):"");
}
	
// do not make computed, as view and query iframe functions do not exist at first
function urlCurrent() 
{
	return window.location.origin + window.location.pathname + urlParams();
};

function copyURLString()
{
	// urlCurrent mqaCopyUrl
	// based on https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
	var copyText = document.getElementById("mqaCopyUrl");
	var url = urlCurrent();
	//text = text.replace(/\"/g, "\\\"");
	copyText.value = url;
	copyText.select();
	//For mobile devices
	copyText.setSelectionRange(0, 99999);
	document.execCommand("copy");
	copyText.blur();
}