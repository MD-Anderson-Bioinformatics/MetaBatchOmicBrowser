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

/* global d3, d3plus, Plotly */

// theVolcanoData.values [ {feature, fold_change, trans_pvalue, pvalue}, ... ]
function drawVolcano(theFCValues, theTPValues, theFeatures,
					foldChangeCut, pvalueCut, theTitle, thePlotDiv,
					theWidth, theHeight)
{
	let plotdiv = thePlotDiv;
	
	// list of foldChange values
	let xvals = theFCValues;
	// list of -log10 pvalues
	let yvals = theTPValues;
	// list of feature ids
	let names = theFeatures;
	let colors = [];
	let classes = [];
	xvals.forEach((xval, index) => {
		if (xval > foldChangeCut && yvals[index] > pvalueCut)
		{
			// upregulated and significant
			colors.push("#ff3300");
			classes.push("up-sig");
		}
		else if (xval < -1 * foldChangeCut && yvals[index] > pvalueCut)
		{
			// downregulated and significant
			colors.push("#0066ff");
			classes.push("down-sig");
		}
		else if (yvals[index] > pvalueCut)
		{
			// significant only
			colors.push("#9900FF");
			classes.push("sig-only");
		}
		else
		{
			// standard
			colors.push("#cccccc");
			classes.push("standard");
		}
	});
	// doesn't seem to be a way to add classes to the markers
	var trace1 = {
		x: xvals,
		y: yvals,
		mode: 'markers',
		type: 'scatter',
		text: names,
		textposition: 'top center',
		textfont: {
			family: 'Raleway, sans-serif'
		},
		marker: {
			size: 8,
			color: colors
		}
	};
	var data = [trace1];
	var maxX = xvals.reduce((a, b) => Math.max(a, b), 0);
	var minX = xvals.reduce((a, b) => Math.min(a, b), 0);
	var foldchangeMax = Math.max(Math.abs(minX), Math.max(maxX));
	var maxY = yvals.reduce((a, b) => Math.max(a, b), 0)+0.2;
	var minY = yvals.reduce((a, b) => Math.min(a, b), 0)-0.2;
	//	height: theHeight,
	var layout = {
		dragmode: 'pan',
		margin: {
			t: 10
		},
		width: theWidth,
		height: theHeight,
		shapes: [{
				type: 'line',
				xref: 'paper',
				x0: 0,
				y0: pvalueCut,
				x1: 1,
				y1: pvalueCut,
				line: {
					color: '#005500',
					width: 2,
					dash: 'dot'
				}
			}, {
				type: 'line',
				yref: 'paper',
				x0: foldChangeCut,
				y0: 0,
				x1: foldChangeCut,
				y1: 1,
				line: {
					color: '#00FF00',
					width: 2,
					dash: 'dot'
				}
			}, {
				type: 'line',
				yref: 'paper',
				x0: -1 * foldChangeCut,
				y0: 0,
				x1: -1 * foldChangeCut,
				y1: 1,
				line: {
					color: '#00FF00',
					width: 2,
					dash: 'dot'
				}
			}],
		xaxis: {
			title: {
				text: "log<sub>2</sub>(Fold Change)",
				font: {
					size: 18
				}
			},
			range: [foldchangeMax]
		},
		yaxis: {
			title: {
				text: "-log<sub>10</sub>(p-value)",
				font: {
					size: 18
				}
			},
			range: [minY, maxY]
		}
	};
	// HANDLE NEW TITLE HERE
	// height from volcano index.html
	const dataText = [{text: theTitle}];
	new d3plus.TextBox()
			.select("#VolcanoPlottingTitle")
			.data(dataText)
			.fontSize(10)
			.textAnchor("middle")
			.width(theWidth)
			.height(90)
			.x(10)
			.render();
	// let mypromise = Plotly.newPlot(plotdiv, data, layout, {scrollZoom: true, displayModeBar: false});
	// let newPlot = await mypromise;
	let newPlot = Plotly.newPlot(plotdiv, data, layout, {scrollZoom: true, displayModeBar: false});
	return newPlot;
}

function VolcanoPlot(theModel, thePlotDivObj, theLegendDivObj, theParams)
{
	var mThis = this;
	mThis.mModel = theModel;
	mThis.mPlotlyDiv = null;
	mThis.mPlotDivObj = thePlotDivObj;
	mThis.mLegendDivObj = theLegendDivObj;
	mThis.mD3PlusTitle = null;
	mThis.mParams = theParams;
	mThis.mInternalPlot = null;
	// used for calculations
	mThis.mXscaleLinear = d3.scaleLinear().domain([0, 20]);

	mThis.version = function ()
	{
		return "BEA_VERSION_TIMESTAMP";
	};
	console.log("BEA VolcanoDiagram: " + mThis.version());

	function customizePlot()
	{
		$('#VolcanoResetZoomButton').on('click', function(event, ui) 
		{
			mThis.mInternalPlot.resetScale();
		});
	}

	makePlot();
	function makePlot()
	{
		var bbox = mThis.mPlotDivObj.getBoundingClientRect();
		// subtract 30 so there is padding for labels on axis
		var width = bbox.width - 30;
		mThis.mXscaleLinear.range([ 0, width]);
		var height = bbox.height; // do not substract 90 for title - different box
		let myG = document.getElementById("VolcanoPlottingG");
		myG.innerHTML = null;
		// myG is a div, not a G.
		// Do not use d3 select to get div - will throw a r.getAttribute is not method error.
		// var myG = d3.select('#VolcanoPlottingG');
		// myG.selectAll("*").remove();

		mThis.mPlotlyDiv = drawVolcano(mThis.mModel.getFoldChangeValues(), 
									   mThis.mModel.getTransPvalues(), 
									   mThis.mModel.getFeatures(),
									   mThis.mModel.getFoldChangeCut(),
									   mThis.mModel.getTransPvalueCut(),
									   mThis.mModel.getTitle(), 
									   myG, width, height);
		customizePlot();
	}

	function notUN(theValue)
	{
		return ((undefined !== theValue) && (null !== theValue));
	}

	function addHighlighting(theClassname)
	{
		// not useful here - no reasonable plotly support
		//console.log("addHighlighting " + theClassname);
		//d3.selectAll(("." + theClassname)).classed("SelectedBatch", true);
		// use this, because VED is in iframe
		//window.parent.globalDiagramControl.addHighlighting(theClassname);
	}

	function removeHighlighting(theClassname)
	{
		// not useful here - no reasonable plotly support
		//console.log("removeHighlighting " + theClassname);
		//d3.selectAll(("." + theClassname)).classed("SelectedBatch", false);
		// use this, because VED is in iframe
		//window.parent.globalDiagramControl.removeHighlighting(theClassname);
	}

	_makeLegend();
	function _makeLegend()
	{
		var legendDiv = mThis.mLegendDivObj;
		if (notUN(legendDiv))
		{
			var legendData = mThis.mModel.getLegend();

			var legendSvg = d3.select(legendDiv)
					.append("svg:svg")
					.attr("class", "batchlegend")
					.attr("height", ((legendData.length + 1) * 20 + 20));

			//console.log("legendGentry selectAll");
			// theLegendData label and color
			var legendGentry = legendSvg.selectAll("g.legenditem").data(legendData);
			//console.log("legendGentry append");
			legendGentry.enter().append("svg:g")
					.attr("class", "legenditem")
					.attr("transform", function (d, i)
					{
						//console.log("legendGentry transform");
						return "translate(10," + (((i) * 20) + 5) + ")";
					})
					.each(function (theData, theIndex)
					{
						if (notUN(theData.color))
						{
							d3.select(this).append("svg:rect")
								.attr("class", "legendsymbol")
								.attr("x", 0)
								.attr("y", 0)
								.attr("width", 10)
								.attr("height", 10)
								.style("fill", theData.color);
						}
						d3.select(this).append("svg:text")
								.attr("class", "legendtext")
								.attr("x", 20)
								.attr("y", 9)
								.text(theData.legend);
						//  bar-pvalue bar-cutoff
						// no way to tie this to diagram, so skip
						//if (notUN(theData.finder))
						//{
							//d3.select(this).classed(theData.finder, true);
							//d3.select(this).on("mouseover", function()
							//{
							//	//console.log("legend add " + theData.finder);
							//	if (notUN(theData.finder))
							//	{
							//		addHighlighting(theData.finder);
							//	}
							//});
							//d3.select(this).on("mouseout", function()
							//{
							//	//console.log("legend remove " + theData.finder);
							//	if (notUN(theData.finder))
							//	{
							//		removeHighlighting(theData.finder);
							//	}
							//});
						//}
					});
			//console.log("legendGentry exit");
			legendGentry.exit().remove();
		}
	}

	function _resizePlot(theWidth, theHeight)
	{
		makePlot();
	}

	// Next 2 functions could go in a utilities module
	function findCSS(cssName)
	{
		var sheets = window.document.styleSheets;
		for (var cur in sheets)
		{
			if (sheets.hasOwnProperty(cur))
			{
				if (notUN(sheets[cur].href))
				{
					if (sheets[cur].href.endsWith(cssName))
					{
						return sheets[cur];
					}
				}
			}
		}
		return null;
	}

	function getCssAsText(cssName)
	{
		var result = "";
		var sheet = findCSS(cssName);
		if (sheet !== null)
		{
			var rulesList = sheet.rules;	// a CSSRuleList
			for (var ruleKey in rulesList)
			{
				if (rulesList.hasOwnProperty(ruleKey))
				{
					var rule = rulesList[ruleKey].cssText;
					result += rule + '\n';
				}
			}
		}
		return result;
	}

	function getCssAsText(cssName)
	{
		var result = "";
		var sheet = findCSS(cssName);
		if (sheet !== null)
		{
			var rulesList = sheet.rules;	// a CSSRuleList
			for (var ruleKey in rulesList)
			{
				if (rulesList.hasOwnProperty(ruleKey))
				{
					var rule = rulesList[ruleKey].cssText;
					result += rule + '\n';
				}
			}
		}
		return result;
	}

	// Provides the header necessary for browser to display SVG tags as an image
	// Find a more principled way of handling stylesheet settings
	function _makeHeader()
	{
		// Package the image itself
		var header = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n';
		// Embedded stylesheet settings
		var rules = getCssAsText('bar.css');
		rules = '<![CDATA[\n' + rules + ']]>';
		rules = '<style type="text/css">' + rules + '</style>';
		rules = '<defs>' + rules + '</defs>\n';
		header += rules;
		return header;
	}

	function _makeFooter()
	{
		return '</svg>';			// To match the SVG opening tag in the header
	}

	function _getAsyncSVGContent(theCallbackFunction, theMyThis)
	{
		// let myG = document.getElementById("VolcanoPlottingG");
		let myG = 'VolcanoPlottingG';
		// let myG = mThis.mPlotlyDiv;
		var header = _makeHeader();
		var footer = _makeFooter();
		console.log("Before Call Plotly.toImage");
		Plotly.toImage(myG, {format: 'svg'}).then((theURL) =>
		{
			console.log("svg then");
			let svg = decodeURIComponent(theURL.split(',')[1]);
			console.log("svg=" + svg);
			theCallbackFunction(header + svg + footer, theMyThis);
		});
		console.log("After Call Plotly.toImage");
	}

	function _getLegendSVGContent()
	{
		//console.log(mBoxplotOuter.getSvgLegend());
		return _makeHeader() + mThis.mLegendDivObj.firstChild.parentNode.innerHTML + _makeFooter();
	}

	function _resetScale()
	{
		// TODO: not good way to _resetScale
		makePlot();
	}
	
	// TODO:BEV: convert to class to fix hack of using plot for "class"
	function plot()
	{}
	plot.resizePlot = _resizePlot;
	plot.resetScale = _resetScale;
	plot.makeLegend = _makeLegend;
	plot.getAsyncSVGContent = _getAsyncSVGContent;
	plot.getLegendSVGContent = _getLegendSVGContent;
	mThis.mInternalPlot = plot;
	return plot;
} // function (class) VolcanoPlot

VolcanoPlot.BasicModel = function(theTitle, theFoldChangeCut, theTransPvalueCut,
								  theFoldChangeValues, theTransPvalues, theFeatures,
								  theVersion, theLegend, thePvalueCut)
{
	function model()
	{}
	// copy these instead of returning direct refs? ###
	model.getTitle = function ()
	{
		return theTitle;
	};
	model.getFoldChangeCut = function ()
	{
		return theFoldChangeCut;
	};
	model.getPvalueCut = function ()
	{
		return thePvalueCut;
	};
	model.getTransPvalueCut = function ()
	{
		return theTransPvalueCut;
	};
	model.getFoldChangeValues = function ()
	{
		return theFoldChangeValues;
	};
	model.getTransPvalues = function ()
	{
		return theTransPvalues;
	};
	model.getFeatures = function ()
	{
		return theFeatures;
	};
	model.getVersion = function ()
	{
		return theVersion;
	};
	model.getLegend = function ()
	{
		return theLegend;
	};

	return model;
};


VolcanoPlot.DefaultParams = function ()
{
	return {
	};
};
