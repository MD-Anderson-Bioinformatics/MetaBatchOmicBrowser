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

/* global d3, d3plus */

function BarPlot(theModel, thePlotDivObj, theLegendDivObj, theParams)
{
	var mThis = this;
	mThis.mModel = theModel;
	mThis.mPlotDivObj = thePlotDivObj;
	mThis.mLegendDivObj = theLegendDivObj;
	mThis.mD3PlusTitle = null;
	mThis.mParams = theParams;
	mThis.mChart = null;
	// used for calculations
	mThis.mXscaleLinear = d3.scaleLinear().domain([0, 20]);

	_toggleLabels = function ()
	{
		const hideLabelP = $('input[name="BarDisableLabels"]').prop('checked');
		//console.log("_toggleLabels hideLabelP = '" + hideLabelP + "'");
		// BarPlottingG -> text
		d3.select('#BarPlottingG')
				.selectAll('text')
				.style('display', function (d, i)
				{
					// turn labels off
					var display = "none";
					if (false === hideLabelP)
					{
						// turn labels on
						display = "block";
					}
					// need this to make text labels black
					return display;
				});
	};

	// setup callback for toggling labels
	d3.select('input#BarDisableLabels').on('change', function (theData, theIndex)
	{
		//console.log("BarDisableLabels");
		_toggleLabels();
	});

	mThis.version = function ()
	{
		return "BEA_VERSION_TIMESTAMP";
	};
	console.log("BEA BarDiagram: " + mThis.version());

	mThis.addTitle = function (theTitle, theWidth, theHeight)
	{
		const data = [{text: theTitle}];
		//d3.select("#BarPlottingTitle").text(theTitle);
		new d3plus.TextBox()
				.select("#BarPlottingTitle")
				.data(data)
				.fontSize(10)
				.textAnchor("middle")
				.width(theWidth-20)
				.height(theHeight)
				.x(10)
				.render();
	};

	function customizePlot()
	{
		d3.selectAll('.bar-pvalue')
				.each(function (theData, theIndex)
				{
					//console.log("customizePlot this");
					//console.log(this);
					// mouse highlighting
					d3.select(this).on("mouseover", function ()
					{
						//console.log("customize add bar-pvalue");
						addHighlighting('bar-pvalue');
					});
					d3.select(this).on("mouseout", function ()
					{
						//console.log("customize remove bar-pvalue");
						removeHighlighting('bar-pvalue');
					});
				});
		d3.selectAll('.bar-cutoff')
				.each(function (theData, theIndex)
				{
					//console.log("customizePlot this");
					//console.log(this);
					// mouse highlighting
					d3.select(this).on("mouseover", function ()
					{
						//console.log("customize add bar-cutoff");
						addHighlighting('bar-cutoff');
					});
					d3.select(this).on("mouseout", function ()
					{
						//console.log("customize remove bar-cutoff");
						removeHighlighting('bar-cutoff');
					});
				});
	}

	makePlot();
	function makePlot()
	{
		var bbox = mThis.mPlotDivObj.getBoundingClientRect();
		// subtract 30 so there is padding for labels on axis
		var width = bbox.width - 30;
		mThis.mXscaleLinear.range([ 0, width]);
		var height = bbox.height - 90; // substract 90 for title
		mThis.addTitle(mThis.mModel.getTitle(), width, 90);
		// TODO: plot diagram here
		// mThis.mChart = bar.BarDiagram({textFill: "#000000", symmetricalTextCentre: textFlag}).width(width).height(height);
		var cutoff = mThis.mModel.getCutoff();
		var pvalue = mThis.mModel.getPvalue();
		var version = mThis.mModel.getVersion();
		var batches = mThis.mModel.getBatches();
		var myG = d3.select('#BarPlottingG');
		myG.selectAll("*").remove();
		// TODO var datumV = myG.datum(edata);
		//console.log("makePlot pvalue=" + pvalue);
		var barFullRect = myG.append("svg:rect")
				.attr("id", "bar-full")
				.attr("x", function() { return(mThis.mXscaleLinear(0)); } )
				.attr("y", 0 )
				.attr("width", function() { return(mThis.mXscaleLinear(20)); } )
				.attr("height", 20)
				.attr("fill", "#AAAAAA");
		myG.append("g")
				.attr("transform", "translate(0,25)")
				.call(d3.axisBottom(mThis.mXscaleLinear));
		myG.append("svg:rect")
				.attr("id", "bar-pvalue")
				.classed("bar-pvalue", true)
				.attr("x", function() { return(mThis.mXscaleLinear(0)); } )
				.attr("y", 0 )
				.attr("width", function() { return(mThis.mXscaleLinear(pvalue)); } )
				.attr("height", 20)
				.attr("fill", "#0000FF")
				.append("title").text("Neg. Log10 P-value is " + pvalue);
		myG.append("svg:line")
				.attr("id", "bar-cutoff")
				.classed("bar-cutoff", true)
				.attr("x1", function() { return(mThis.mXscaleLinear(cutoff)); } )
				.attr("x2", function() { return(mThis.mXscaleLinear(cutoff)); } )
				.attr("y1", -5)
				.attr("y2", 25)
				.attr("stroke-width", "5")
				.style("stroke", "#00FF00")
				.append("title").text("Cutoff is " + cutoff);
		if (notUN(batches))
		{
			myG.append("svg:text")
					.attr("class", "legendtext")
					.attr("x", 20)
					.attr("y", 70)
					.text("Batches identified as source of batch effect: " + batches);
		}
		else
		{
			myG.append("svg:text")
					.attr("class", "legendtext")
					.attr("x", 20)
					.attr("y", 70)
					.text("No batches identified as source of batch effect");
		}
		//console.log("Set bar plotting label");
		const labeldata = [{text: "Blue bar represents negative log 10 of the p-value calculated from the Kruskal-Wallis test. Any called batches are from Dunn's Test. Green marker represents the negative log 10 of p-value for significance. If the blue bar goes past the green marker, this suggests the presence of significant batch effects."}];
		new d3plus.TextBox()
				.select("#BarPlottingLabel")
				.data(labeldata)
				.fontSize(10)
				.textAnchor("middle")
				.x(10)
				.y(95)
				.width(width-20)
				.height(120)
				.render();
		customizePlot();
	}

	function notUN(theValue)
	{
		return ((undefined !== theValue) && (null !== theValue));
	}

	function addHighlighting(theClassname)
	{
		//console.log("addHighlighting " + theClassname);
		d3.selectAll(("." + theClassname)).classed("SelectedBatch", true);
		// use this, because VED is in iframe
		window.parent.globalDiagramControl.addHighlighting(theClassname);
	}

	function removeHighlighting(theClassname)
	{
		//console.log("removeHighlighting " + theClassname);
		d3.selectAll(("." + theClassname)).classed("SelectedBatch", false);
		// use this, because VED is in iframe
		window.parent.globalDiagramControl.removeHighlighting(theClassname);
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
						if (notUN(theData.finder))
						{
							d3.select(this).classed(theData.finder, true);
							d3.select(this).on("mouseover", function()
							{
								//console.log("legend add " + theData.finder);
								if (notUN(theData.finder))
								{
									addHighlighting(theData.finder);
								}
							});
							d3.select(this).on("mouseout", function()
							{
								//console.log("legend remove " + theData.finder);
								if (notUN(theData.finder))
								{
									removeHighlighting(theData.finder);
								}
							});
						}
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
				if (sheets[cur].href.endsWith(cssName))
				{
					return sheets[cur];
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

	function _getSVGContent()
	{
		return _makeHeader() + mThis.mPlotDivObj.firstChild.parentNode.innerHTML + _makeFooter();
	}

	function _getLegendSVGContent()
	{
		//console.log(mBoxplotOuter.getSvgLegend());
		return _makeHeader() + mThis.mLegendDivObj.firstChild.parentNode.innerHTML + _makeFooter();
	}

	// TODO:BEV: convert to class to fix hack of using plot for "class"
	function plot()
	{}
	plot.resizePlot = _resizePlot;
	// no zoom yet plot.resetScale = _resetScale;
	plot.makeLegend = _makeLegend;
	plot.getSVGContent = _getSVGContent;
	plot.getLegendSVGContent = _getLegendSVGContent;
	return plot;
} // function (class) BarPlot

BarPlot.BasicModel = function (theTitle, theCutoff, thePvalue, theBatches, theVersion, theLegend)
{
	function model()
	{}
	// copy these instead of returning direct refs? ###
	model.getTitle = function ()
	{
		return theTitle;
	};
	model.getCutoff = function ()
	{
		return theCutoff;
	};
	model.getPvalue = function ()
	{
		return thePvalue;
	};
	model.getVersion = function ()
	{
		return theVersion;
	};
	model.getBatches = function ()
	{
		return theBatches;
	};
	model.getLegend = function ()
	{
		return theLegend;
	};

	return model;
};


BarPlot.DefaultParams = function ()
{
	return {
		showDetailFunc: null
	};
};
