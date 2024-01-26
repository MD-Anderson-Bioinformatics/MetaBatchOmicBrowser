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

/* global d3, venn, d3plus */

function VennPlot(theModel, thePlotDivObj, theLegendDivObj, theParams)
{
	var mThis = this;
	mThis.mModel = theModel;
	mThis.mPlotDivObj = thePlotDivObj;
	mThis.mLegendDivObj = theLegendDivObj;
	mThis.mD3PlusTitle = null;
	mThis.mParams = theParams;
	mThis.mEuler = false;
	mThis.mVennZero = false;
	mThis.mVennSans = true;
	mThis.mChart = null;

	_toggleLabels = function()
	{
		const hideLabelP = $('input[name="VennDisableLabels"]').prop('checked');
		//console.log("_toggleLabels hideLabelP = '" + hideLabelP + "'");
		// VennPlottingG -> text
		d3.select('#VennPlottingG')
				.selectAll('text')
					.style('display', function (d, i)
					{
						// turn labels off
						var display = "none";
						if (false===hideLabelP)
						{
							// turn labels on
							display = "block";
						}
						// need this to make text labels black
						return display;
					});
	};
	
	_useEuler = function()
	{
		mThis.mEuler = true;
		mThis.mVennZero = false;
		mThis.mVennSans = false;
		if (notUN(mThis.mChart))
		{
			$("#VennPlottingTitle").empty();
			$("#VennPlottingG").empty();
			makePlot();
			$(mThis.mLegendDivObj).empty();
			_makeLegend();
		}
	};
	
	_useVennZero = function()
	{
		mThis.mEuler = false;
		mThis.mVennZero = true;
		mThis.mVennSans = false;
		if (notUN(mThis.mChart))
		{
			$("#VennPlottingTitle").empty();
			$("#VennPlottingG").empty();
			makePlot();
			$(mThis.mLegendDivObj).empty();
			_makeLegend();
		}
	};
	
	_useVennSans = function()
	{
		mThis.mEuler = false;
		mThis.mVennZero = false;
		mThis.mVennSans = true;
		if (notUN(mThis.mChart))
		{
			$("#VennPlottingTitle").empty();
			$("#VennPlottingG").empty();
			makePlot();
			$(mThis.mLegendDivObj).empty();
			_makeLegend();
		}
	};
	
	// setup callback for toggling labels
	d3.select('input#VennDisableLabels').on('change', function (theData, theIndex)
	{
		//console.log("VennDisableLabels");
		_toggleLabels();
	});
	
	// setup callback for changing plot
	d3.select('#VennControlDiv_Radio').selectAll('input').on('change', function ()
	{
		const selected = $('input[name="ev_plot_type"]:checked').val();
		//console.log("selected = '" + selected + "'");
		if ("venn-w-z" === selected)
		{
			mThis._useVennZero();
		}
		else if ("venn-san" === selected)
		{
			mThis._useVennSans();
		}
		else
		{
			mThis._useEuler();
		}
		_toggleLabels();
	});
	
	mThis.version = function()
	{
		return "BEA_VERSION_TIMESTAMP";
	};
	console.log("BEA VennDiagram: " + mThis.version());
	
	mThis.addTitle = function(theTitle, theWidth, theHeight)
	{
		const data = [ { text: theTitle } ];
		//d3.select("#VennPlottingTitle").text(theTitle);
		new d3plus.TextBox()
			.select("#VennPlottingTitle")
			.data(data)
			.fontSize(10)
			.textAnchor("middle")
			.width(theWidth)
			.height(theHeight)
			.x(10)
			.render();
	};
	
	function customizePlot()
	{
		const tooltip = d3.select('body').append('div').attr('class', 'venntooltip');
		// set class for g elements
		d3.selectAll('.venn-area')
				.each(function(theData, theIndex)
				{
					//console.log("selectAll");
					//console.log(theData);
					//console.log(theIndex);
					// set classed
					d3.select(this).classed(theData.finder, true);
					// add tooltip as title element
					// this adds the element if it does not exist
					let ttext = "Unknown";
					if (notUN(theData.superset))
					{
						ttext = theData.superset;
					}
					else if (notUN(theData.legend))
					{
						ttext = theData.legend;
					}
					let idpart = d3.select(this).attr("data-venn-sets");
					var myElement = d3.select(this).selectAll("#" + "Title_" + idpart).data([1]);
					// this adds the element if it does not exist
					// setting text needs to be here, before attr, or enter is closed.
					myElement.enter().append("title").text(ttext);
					myElement.attr("id", "VennTitle_" + idpart);
					// mouse highlighting
					d3.select(this).on("mouseover", function()
					{
						//console.log("diagram mouseover tick ");
						//console.log(theData);
						addHighlighting(theData.finder);
					});
					d3.select(this).on("mouseout", function()
					{
						//console.log("diagram mouseout tick ");
						//console.log(theData);
						removeHighlighting(theData.finder);
					});
				});
		// set text color
		d3.selectAll('text')
				.style('fill', function (d, i)
				{
					// need this to make text labels black
					return "#000000";
				});
		// set zoom callback
		var topG = d3.select('#VennMouseG');
		let zoomVenn = d3.zoom()
				.on("zoom", function()
				{
					// setup callback for reset zoom by scroll button
					// topG.call(zoomVenn) and myG.attr must be different see
					//https://stackoverflow.com/questions/10988445/d3-behavior-zoom-jitters-shakes-jumps-and-bounces-when-dragging
					var myG = d3.select('#VennPlottingG');
					myG.attr("transform", d3.event.transform);
				});
		topG.call(zoomVenn);
		// reset zoom from double click
		topG.on("dblclick.zoom", function() 
		{
			// set transition to same selection as handler
			// otherwise transform is not fully reset
			var topG = d3.select('#VennMouseG');
			// translate(0,30) is because there is an initial translate on the G to move display away from title
			topG.transition().duration(750).call(zoomVenn.transform, d3.zoomIdentity.translate(0,30));
		});
		// reset zoom from button
		var myG = d3.select('#VennPlottingG');
		var mySvg = myG.select('svg');
		$('#VennResetZoomButton').on('click', function(event, ui) 
		{
			// set transition to same selection as handler
			// otherwise transform is not fully reset
			var topG = d3.select('#VennMouseG');
			// translate(0,30) is because there is an initial translate on the G to move display away from title
			topG.transition().duration(750).call(zoomVenn.transform, d3.zoomIdentity.translate(0,30));
		});
	}

	makePlot();
	function makePlot()
	{
		var bbox = mThis.mPlotDivObj.getBoundingClientRect();
		var width = bbox.width;
		var height = bbox.height - 90; // substract 90 for title
		mThis.addTitle(mThis.mModel.getTitle(), width, 90);
		// colors not needed here. "color" is read from vdata by venn.js
		let textFlag = true;
		if (mThis.mVennSans)
		{
			textFlag = false;
		}
		//console.log("textFlag = " + textFlag);
		mThis.mChart = venn.VennDiagram({ textFill: "#000000", symmetricalTextCentre: textFlag }).width(width).height(height);
		var edata = mThis.mModel.getEulerData();
		var vdataZero = mThis.mModel.getVennDataWithZero();
		var vdataSans = mThis.mModel.getVennDataNoZero();
		var myG = d3.select('#VennPlottingG');
		var datumV = null;
		if (mThis.mEuler)
		{
			//console.log("Euler");
			//console.log(edata);
			datumV = myG.datum(edata);
		}
		else if (mThis.mVennZero)
		{
			//console.log("mVennZero");
			//console.log(vdataZero);
			datumV = myG.datum(vdataZero);
		}
		else if (mThis.mVennSans)
		{
			//console.log("mVennSans");
			//console.log(vdataSans);
			datumV = myG.datum(vdataSans);
		}
		//console.log(datumV);
		datumV.call(mThis.mChart);
		customizePlot();
	}
	
	function notUN(theValue)
	{
		return ((undefined!==theValue)&&(null!==theValue));
	};

	function addHighlighting(theClassname)
	{
		//console.log("addHighlighting " + theClassname);
		d3.selectAll(("."+theClassname)).classed("SelectedBatch", true);
		// use this, because VED is in iframe
		window.parent.globalDiagramControl.addHighlighting(theClassname);
	}

	function removeHighlighting(theClassname)
	{
		//console.log("removeHighlighting " + theClassname);
		d3.selectAll(("."+theClassname)).classed("SelectedBatch", false);
		// use this, because VED is in iframe
		window.parent.globalDiagramControl.removeHighlighting(theClassname);
	}

	function isPlottedP(theClassname)
	{
		let result = false;
		let domo = d3.select(("."+theClassname));
		if (notUN(domo))
		{
			let node = domo.node();
			if (notUN(node))
			{
				let fc = node.firstChild;
				if(notUN(fc))
				{
					let bb = fc.getBBox();
					if (notUN(bb))
					{
						let w = bb.width;
						if (w>0)
						{
							result = true;
						}
					}
				}
			}
		}
		return result;
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
					.attr("height", ((legendData.length+1)*20+20));

			//console.log("legendGentry selectAll");
			// theLegendData label and color
			var legendGentry = legendSvg.selectAll("g.legenditem").data(legendData);
			//console.log("legendGentry append");
			legendGentry.enter().append("svg:g")
					.attr("class", "legenditem")
					.attr("transform", function(d, i)
					{
						//console.log("legendGentry transform");
						return "translate(10," + (((i) * 20)+5) + ")";
					})
					.each(function (theData, theIndex)
					{
						//console.log("legendGentry each");
						//console.log(theData);
						//console.log(theIndex);
						// entries
						//d3.select(this).attr("x", (theIndex * boxWidth));
						let isPlotted = isPlottedP(theData.finder);
						//console.log(isPlotted);
						d3.select(this).classed(theData.finder, true);
						d3.select(this).on("mouseover", function()
						{
							//console.log("mouseover tick ");
							//console.log(theData);
							addHighlighting(theData.finder);
						});
						d3.select(this).on("mouseout", function()
						{
							//console.log("mouseout tick ");
							//console.log(theData);
							removeHighlighting(theData.finder);
						});
						if ("NA" !== theData.color)
						{
							//console.log("color=" + theData.color);
							d3.select(this).append("svg:rect")
								.attr("class", "legendsymbolTransparent")
								.attr("x", 0)
								.attr("y", 0)
								.attr("width", 10)
								.attr("height", 10)
								.style("fill", function (d, i)
								{
									return theData.color;
								});
							d3.select(this).append("title")
									.attr("class", "ved-tooltip")
									.text("Plotted in color shown");
						}
						else
						{
							if(isPlotted)
							{
								//console.log("draw plotted circle");
								d3.select(this).append("svg:circle")
									.attr("class", "legendsymbol")
									.attr("cx", 5)
									.attr("cy", 5)
									.attr("r", 5)
									.style("fill", "gray");
								d3.select(this).append("title")
									.attr("class", "ved-tooltip")
									.text("Plotted in mixture of other colors");
							}
							else
							{
								//console.log("draw NOT plotted circle");
								d3.select(this).append("svg:circle")
									.attr("class", "legendsymbol")
									.attr("cx", 5)
									.attr("cy", 5)
									.attr("r", 5)
									.style("fill", "white");
								d3.select(this).append("svg:line")
									.attr("class", "legendsymbol")
									.attr("x0", 0)
									.attr("y0", 20)
									.attr("x1", 10)
									.attr("y1", 10)
									.style("stroke", "black");
								d3.select(this).append("title")
									.attr("class", "ved-tooltip")
									.text("Not plotted");
							}
						}
						d3.select(this).append("svg:text")
							.attr("class", "legendtext")
							.attr("x", 20)
							.attr("y", 9)
							.text(function (d, i)
							{
								//console.log("legendtext");
								return theData.legend;
							});
					});
			//console.log("legendGentry exit");
			legendGentry.exit().remove();
		}
	}

	function _resizePlot(theWidth, theHeight)
	{
		venn.VennDiagram().width(theWidth).height(theHeight);
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
		var	rules = getCssAsText('venn.css');
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
	function plot () {}
	plot.resizePlot = _resizePlot;
	// no zoom yet plot.resetScale = _resetScale;
	plot.makeLegend = _makeLegend;
	plot.getSVGContent = _getSVGContent;
	plot.getLegendSVGContent = _getLegendSVGContent;
	plot.useEuler = _useEuler;
	plot.useVennZero = _useVennZero;
	plot.useVennSans = _useVennSans;
	return plot;
} // function (class) VennPlot

VennPlot.BasicModel = function (theTitle, theEulerData, theVersion, theBatches, theLegend, theVennWithZero, theVennNoZero)
{
	function model () {}
		// copy these instead of returning direct refs? ###
	model.getTitle = function () { return theTitle; };
	model.getEulerData = function () { return theEulerData; };
	model.getVennDataWithZero = function () { return theVennWithZero; };
	model.getVennDataNoZero = function () { return theVennNoZero; };
	model.getVersion = function () { return theVersion; };
	model.getBatches = function () { return theBatches; };
	model.getLegend = function () { return theLegend; };

	return model;
};


VennPlot.DefaultParams = function ()
{
	return {
		showDetailFunc : null
	};
};
