/* 
 *  Copyright (c) 2011-2024 University of Texas MD Anderson Cancer Center
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
	//console.log("MQAAppView::AppViewModel window.location.href=" + window.location.href);
	var self = this;
	//self.type = "deferred";
	self.makeGuiVisible = ko.observable(false); //.extend({ deferred: true });
	//
	let url = new URL(window.location.href);
	//console.log("Top AppView");
	let simple = url.searchParams.get("useSimple");
	//console.log("Top AppView simple = " + simple);
	let urlSimple = true; 
	if ("false" === simple)
	{
		urlSimple = false;
	}
	self.useSimpleMode = ko.observable(urlSimple);
	// Notify always, since we use setting simgple mode to true to reset dropdown contents,
	// which requires being able to do that from simple mode
	self.useSimpleMode.extend({ notify: 'always' });
	var simpleModeFlagOldValue = self.useSimpleMode.peek();
	self.useSimpleMode.subscribe(function(theNewValue)
	{
		//console.log("self.useSimpleMode.subscribe theNewValue = " + theNewValue);
		//console.log("self.useSimpleMode.subscribe simpleModeFlagOldValue = " + simpleModeFlagOldValue);
		if (simpleModeFlagOldValue !== theNewValue)
		{
			if (false===theNewValue)
			{
				//console.log("self.useSimpleMode.subscribe restoreSliderMqa");
				restoreSliderMqa();
			}
			else
			{
				//console.log("self.useSimpleMode.subscribe minimizeSliderMqa");
				minimizeSliderMqa(true);
			}
			simpleModeFlagOldValue = theNewValue;
		}
	});
	self.viewUrl = ko.observable("loading.html");
	self.queryUrl = ko.observable("loading.html");
	// tracl when query iframe is done
	self.loadedQuery = ko.observable(false);
	
	self.viewIframeSrc = ko.computed(function()
	{
		//console.log("viewIframeSrc being called");
		//console.log("viewIframeSrc self.viewUrl() = " + self.viewUrl());
		var newUrl = self.viewUrl();
		if (!newUrl.endsWith("loading.html"))
		{
			var add = "&";
			if (newUrl.endsWith("/"))
			{
				add = "?";
			}
			if (false===self.useSimpleMode())
			{
				newUrl = newUrl + add + "useSimple=false&stamp=" + jQuery.now();
				//console.log("viewIframeSrc advanced mode = " + newUrl);
			}
			else
			{
				newUrl = newUrl + add + "useSimple=true&stamp=" + jQuery.now();
				//console.log("viewIframeSrc simple mode = " + newUrl);
			}
		}
		return newUrl;
	});
	
	self.queryIframeSrc = ko.computed(function()
	{
		//console.log("queryIframeSrc being called");
		var newUrl = self.queryUrl();
		//console.log("queryIframeSrc self.queryUrl() = " + self.queryUrl());
		if (!newUrl.endsWith("loading.html"))
		{
			newUrl = newUrl + "&stamp=" + jQuery.now();
		}
		//console.log("queryIframeSrc = " + newUrl);
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
	//console.log("MQAAppView url=" + url);
	//console.log("MQAAppView id=" + url.searchParams.get("id"));
	//console.log("MQAAppView url.search=" + url.search);
	// remove ? and useSimple from url.search path
	let tempSrch = url.search;
	if (tempSrch.startsWith("?"))
	{
		tempSrch = tempSrch.slice(1);
	}
	tempSrch = tempSrch.replace("useSimple=true", "");
	tempSrch = tempSrch.replace("useSimple=false", "");
	if (tempSrch.startsWith("&"))
	{
		tempSrch = tempSrch.slice(1);
	}
	//console.log("tempSrch = '" + tempSrch + "'");
	self.mqaURLsearchValues = ko.observable(tempSrch);
	self.urlQuery = ko.observable(url.origin + url.pathname + "query/");
	self.urlView = ko.observable(url.origin + url.pathname + "view/");
	self.urlMqa = ko.observable(url.origin + url.pathname);
	//
	$.ajax(
	{
		type: "GET",
		dataType: 'json',
		url: "urls",
		cache: false,
		async: false,
		success: function(theJson)
		{
			//console.log("MQAAppView urls success");
			self.mqaDefaultView(theJson.mqaDefaultView);
			self.mqaDefaultQuery(theJson.mqaDefaultQuery);
			self.mqaDefaultViewParams(theJson.mqaDefaultViewParams);
			self.mqaDefaultQueryParams(theJson.mqaDefaultQueryParams);
			if (""===self.mqaURLsearchValues())
			{
				//console.log("**** 1 MQAAppView urls call");
				//console.log("theJson.mqaDefaultQueryParams = " + theJson.mqaDefaultQueryParams);
				self.queryUrl("query/?" + theJson.mqaDefaultQueryParams);
			}
			else
			{
				//console.log("**** 2 MQAAppView urls call");
				//console.log("self.mqaURLsearchValues = " + self.mqaURLsearchValues());
				self.queryUrl("query/?" + self.mqaURLsearchValues());
			}
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			console.log("urls call" + " :" + textStatus + " and " + errorThrown);
			alert("urls call" + " :" + textStatus + " and " + errorThrown);
		}
	});
} //End Appview Model
