/* */
/* global Promise, globalDiagramControl */

function BeaDsc(theTitle, thePlotDiv)
{
	var mThis = this;
	
	var mTitle = theTitle;
	var mPlotDiv = thePlotDiv;
	
	mThis.version = function ()
	{
		return "BEA_VERSION_TIMESTAMP";
	};

	console.log("BEA DSC: " + mThis.version());
	
	mThis.addTable = function (theData)
	{
		//console.log("BEA DSC addTable theData");
		//console.log(theData);
		// TODO:BEV: make more flexible, with headers other than "dataset" determined from attributes
		var html = "<table class=\"display compact mdaSmallText\" id=\"dscTable\" style=\"width:100%\">";
		html += "<thead><tr><th>dataset</th><th>Overall-DSC</th><th>Overall-DSC-pvalue</th><th>DSC(1,2)</th><th>DSC-pvalue(1,2)</th><th>DSC(1,3)</th><th>DSC-pvalue(1,3)</th><th>DSC(1,4)</th><th>DSC-pvalue(1,4)</th><th>DSC(2,3)</th><th>DSC-pvalue(2,3)</th><th>DSC(2,4)</th><th>DSC-pvalue(2,4)</th><th>DSC(3,4)</th><th>DSC-pvalue(3,4)</th></tr></thead>";
		html += "<tbody>";
		$.each(theData, function(theIndex, theValue)
		{
			var [alg, lvl1, lvl2, lvl3, lvl4] = globalDiagramControl.getEntries(theValue.dataset);
			html += "<tr><td>" + "<a href='' onclick='globalDiagramControl.selectDiagram(\"" + theValue.dataset + "\"); return false;'>" + alg + " " + lvl1 + " " + lvl2 + " " + lvl3 + " " + lvl4 + "</a>" + 
					"</td><td>" + Number(theValue["Overall-DSC"]).toPrecision(3) + 
					"</td><td>" + theValue["Overall-DSC-pvalue"] + 
					"</td><td>" + Number(theValue["DSC(1,2)"]).toPrecision(3) + 
					"</td><td>" + theValue["DSC-pvalue(1,2)"] + 
					"</td><td>" + Number(theValue["DSC(1,3)"]).toPrecision(3) + 
					"</td><td>" + theValue["DSC-pvalue(1,3)"] + 
					"</td><td>" + Number(theValue["DSC(1,4)"]).toPrecision(3) + 
					"</td><td>" + theValue["DSC-pvalue(1,4)"] + 
					"</td><td>" + Number(theValue["DSC(2,3)"]).toPrecision(3) + 
					"</td><td>" + theValue["DSC-pvalue(2,3)"] + 
					"</td><td>" + Number(theValue["DSC(2,4)"]).toPrecision(3) + 
					"</td><td>" + theValue["DSC-pvalue(2,4)"] + 
					"</td><td>" + Number(theValue["DSC(3,4)"]).toPrecision(3) + 
					"</td><td>" + theValue["DSC-pvalue(3,4)"] + 
					"</td></tr>";
		});
		html += "</tbody>";
		html += "</table>";
		mThis.mHtml = mThis.getHtml(theData);
		mPlotDiv.innerHTML = html;
	};
	
	mThis.getHtml = function (theData)
	{
		var html = "<html><body><table class=\"display compact mdaSmallText\" style=\"width:100%\">";
		html += "<thead><tr><th>dataset</th><th>Overall-DSC</th><th>Overall-DSC-pvalue</th><th>DSC(1,2)</th><th>DSC-pvalue(1,2)</th><th>DSC(1,3)</th><th>DSC-pvalue(1,3)</th><th>DSC(1,4)</th><th>DSC-pvalue(1,4)</th><th>DSC(2,3)</th><th>DSC-pvalue(2,3)</th><th>DSC(2,4)</th><th>DSC-pvalue(2,4)</th><th>DSC(3,4)</th><th>DSC-pvalue(3,4)</th></tr></thead>";
		html += "<tbody>";
		$.each(theData, function(theIndex, theValue)
		{
			var [alg, lvl1, lvl2, lvl3, lvl4] = globalDiagramControl.getEntries(theValue.dataset);
			html += "<tr><td>" + alg + " " + lvl1 + " " + lvl2 + " " + lvl3 + " " + lvl4 +
					"</td><td>" + Number(theValue["Overall-DSC"]).toPrecision(3) + 
					"</td><td>" + theValue["Overall-DSC-pvalue"] + 
					"</td><td>" + Number(theValue["DSC(1,2)"]).toPrecision(3) + 
					"</td><td>" + theValue["DSC-pvalue(1,2)"] + 
					"</td><td>" + Number(theValue["DSC(1,3)"]).toPrecision(3) + 
					"</td><td>" + theValue["DSC-pvalue(1,3)"] + 
					"</td><td>" + Number(theValue["DSC(1,4)"]).toPrecision(3) + 
					"</td><td>" + theValue["DSC-pvalue(1,4)"] + 
					"</td><td>" + Number(theValue["DSC(2,3)"]).toPrecision(3) + 
					"</td><td>" + theValue["DSC-pvalue(2,3)"] + 
					"</td><td>" + Number(theValue["DSC(2,4)"]).toPrecision(3) + 
					"</td><td>" + theValue["DSC-pvalue(2,4)"] + 
					"</td><td>" + Number(theValue["DSC(3,4)"]).toPrecision(3) + 
					"</td><td>" + theValue["DSC-pvalue(3,4)"] + 
					"</td></tr>";
		});
		html += "</tbody>";
		html += "</table></body></html>";
		return html;
	};
	
	return mThis;
}
