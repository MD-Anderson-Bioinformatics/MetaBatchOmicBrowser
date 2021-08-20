

function onDragColumnAB(event)
{
	//console.log("onDragColumnAB Type=" + event.type + " clientX=" + event.clientX);
	//console.log(event);
	// not sure about why I need this check, but last drag event has zeros for these values
	if ((0!==event.clientX)&&(0!==event.clientY))
	{
		const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		//console.log("onDragColumnAB vw = " + vw);
		let loc = event.clientX;
		// 30 as decent padding. Right side needs an extra 100 to prevent overscroll.
		if ((loc>30)&&(loc+130<vw))
		{
			let newVwPortionForA = (loc/vw)*100; // proportion from 0 to current drag location for column A
			let colA = getComputedStyle(document.documentElement).getPropertyValue('--column-A-width');
			let colB = getComputedStyle(document.documentElement).getPropertyValue('--column-B-width');
			colA = Number(colA.substring(0, colA.length - 1));
			colB = Number(colB.substring(0, colB.length - 1));
			let aDelta = newVwPortionForA - colA;
			let bDelta = - aDelta;
			colA = (colA + aDelta) + "%";
			colB = (colB + bDelta) + "%";
			document.documentElement.style.setProperty('--column-A-width', colA);
			document.documentElement.style.setProperty('--column-B-width', colB);
			// remove messy text selection
			document.getSelection().removeAllRanges();
			globalDiagramControl.resize();
		}
	}
}

function onDragColumnBC(event)
{
	//console.log("onDragColumnBC Type=" + event.type + " clientX=" + event.clientX);
	//console.log(event);
	// not sure about why I need this check, but last drag event has zeros for these values
	if ((0!==event.clientX)&&(0!==event.clientY))
	{
		const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		//console.log("onDragColumnBC vw = " + vw);
		let loc = event.clientX;
		// 30 as decent padding. Right side needs an extra 100 to prevent overscroll.
		if ((loc>130)&&(loc+130<vw))
		{
			let newVwPortionForC = ((vw-loc)/vw)*100; // proportion from (vw - current drag location) for column C
			let colB = getComputedStyle(document.documentElement).getPropertyValue('--column-B-width');
			let colC = getComputedStyle(document.documentElement).getPropertyValue('--column-C-width');
			colC = Number(colC.substring(0, colC.length - 1));
			colB = Number(colB.substring(0, colB.length - 1));
			let cDelta = newVwPortionForC - colC;
			let bDelta = - cDelta;
			colC = (colC + cDelta) + "%";
			colB = (colB + bDelta) + "%";
			document.documentElement.style.setProperty('--column-B-width', colB);
			document.documentElement.style.setProperty('--column-C-width', colC);
			// remove messy text selection
			document.getSelection().removeAllRanges();
			globalDiagramControl.resize();
		}
	}
}

function onDragRowAB(event)
{
	//console.log(event);
	//console.log("onDragRowAB Type=" + event.type + " clientX=" + event.clientX);
	// not sure about why I need this check, but last drag event has zeros for these values
	if ((0!==event.clientX)&&(0!==event.clientY))
	{
		const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		let loc = event.clientY;
		// 84 was chosen as close to 54 (header image height) plus 30 as decent padding
		if ((loc>84)&&(loc+84<vh))
		{
			let newVwPortionForB = ((vh-loc)/vh)*100; // proportion from (vh - current drag location) for row B
			let rowA = getComputedStyle(document.documentElement).getPropertyValue('--row-A-height');
			let rowB = getComputedStyle(document.documentElement).getPropertyValue('--row-B-height');
			//console.log("onDragRowAB rowA1=" + rowA);
			//console.log("onDragRowAB rowB1=" + rowB);
			rowA = Number(rowA.substring(0, rowA.length - 1));
			rowB = Number(rowB.substring(0, rowB.length - 1));
			//console.log("onDragRowAB rowA2=" + rowA);
			//console.log("onDragRowAB rowB2=" + rowB);
			let bDelta = newVwPortionForB - rowB;
			let aDelta = - bDelta;
			rowA = (rowA + aDelta) + "%";
			rowB = (rowB + bDelta) + "%";
			//console.log("onDragRowAB rowA3=" + rowA);
			//console.log("onDragRowAB rowB3=" + rowB);
			document.documentElement.style.setProperty('--row-A-height', rowA);
			document.documentElement.style.setProperty('--row-B-height', rowB);
			// remove messy text selection
			document.getSelection().removeAllRanges();
			globalDiagramControl.resize();
		}
	}
}

function onMouseUpColAB(theEvent)
{
	document.body.style.cursor = "auto";
	document.getElementById("BEV_Diagram").classList.remove("no-pointer-events");
	var iframe = document.getElementById('ngchmIframe');
	if (notUN(iframe))
	{
		iframe.classList.remove("no-pointer-events");
	}
	document.removeEventListener("mousemove", onDragColumnAB);
	document.removeEventListener("mouseup", onMouseUpColAB);
	document.getSelection().removeAllRanges();
}

function onMouseDownColAB(theEvent)
{
	document.body.style.cursor = "ew-resize";
	document.getElementById("BEV_Diagram").classList.add("no-pointer-events");
	var iframe = document.getElementById('ngchmIframe');
	if (notUN(iframe))
	{
		iframe.classList.add("no-pointer-events");
	}
	document.addEventListener("mousemove", onDragColumnAB);
	document.addEventListener("mouseup", onMouseUpColAB);
}

function onMouseUpColBC(theEvent)
{
	document.body.style.cursor = "auto";
	document.getElementById("BEV_Diagram").classList.remove("no-pointer-events");
	var iframe = document.getElementById('ngchmIframe');
	if (notUN(iframe))
	{
		iframe.classList.remove("no-pointer-events");
	}
	document.removeEventListener("mousemove", onDragColumnBC);
	document.removeEventListener("mouseup", onMouseUpColBC);
	document.getSelection().removeAllRanges();
}

function onMouseDownColBC(theEvent)
{
	document.body.style.cursor = "ew-resize";
	document.getElementById("BEV_Diagram").classList.add("no-pointer-events");
	var iframe = document.getElementById('ngchmIframe');
	if (notUN(iframe))
	{
		iframe.classList.add("no-pointer-events");
	}
	document.addEventListener("mousemove", onDragColumnBC);
	document.addEventListener("mouseup", onMouseUpColBC);
}

function onMouseUpRowAB(theEvent)
{
	document.body.style.cursor = "auto";
	document.getElementById("BEV_Diagram").classList.remove("no-pointer-events");
	var iframe = document.getElementById('ngchmIframe');
	if (notUN(iframe))
	{
		iframe.classList.remove("no-pointer-events");
	}
	document.removeEventListener("mousemove", onDragRowAB);
	document.removeEventListener("mouseup", onMouseUpRowAB);
	document.getSelection().removeAllRanges();
}

function onMouseDownRowAB(theEvent)
{
	//console.log("onMouseDownRowAB 1");
	document.body.style.cursor = "ns-resize";
	//console.log("onMouseDownRowAB 2");
	document.getElementById("BEV_Diagram").classList.add("no-pointer-events");
	//console.log("onMouseDownRowAB 3");
	var iframe = document.getElementById('ngchmIframe');
	//console.log("onMouseDownRowAB 4");
	if (notUN(iframe))
	{
		//console.log("onMouseDownRowAB 5");
		iframe.classList.add("no-pointer-events");
	}
	//console.log("onMouseDownRowAB 6");
	document.addEventListener("mousemove", onDragRowAB);
	//console.log("onMouseDownRowAB 7");
	document.addEventListener("mouseup", onMouseUpRowAB);
	//console.log("onMouseDownRowAB 8");
}

var globalOn_DB = false;
var globalDragABWidth_DB = 0;
var globalColumnAWidth_DB = 0;
var globalColumnBWidth_DB = 0;
var globalColumnCWidth_DB = 0;

function hideDataBrowser()
{
	// get current widths
	let drgAB = getComputedStyle(document.documentElement).getPropertyValue('--dragger-AB-size');
	let colA = getComputedStyle(document.documentElement).getPropertyValue('--column-A-width');
	let colB = getComputedStyle(document.documentElement).getPropertyValue('--column-B-width');
	let colC = getComputedStyle(document.documentElement).getPropertyValue('--column-C-width');
	// store current widths
	globalDragABWidth_DB = drgAB;
	globalColumnAWidth_DB = colA;
	globalColumnBWidth_DB = colB;
	globalColumnCWidth_DB = colC;
	// set values
	colA = Number(colA.substring(0, colA.length - 1));
	colB = Number(colB.substring(0, colB.length - 1));
	document.documentElement.style.setProperty('--dragger-AB-size', "0px");
	document.documentElement.style.setProperty('--column-A-width', "0px");
	document.documentElement.style.setProperty('--column-B-width', (colA + colB) + "%");
	// toggle the hide-databrowser class
	toggleClass(['id-a-b-drag-bar', 'BEV_DataBrowser', 'BEV_DataBrowserbutton'], 'hide-databrowser');
	globalOn_DB = true;
}

function displayDataBrowser()
{
	// get current values
	let colA = getComputedStyle(document.documentElement).getPropertyValue('--column-A-width');
	let colB = getComputedStyle(document.documentElement).getPropertyValue('--column-B-width');
	let colC = getComputedStyle(document.documentElement).getPropertyValue('--column-C-width');
	colA = Number(colA.substring(0, colA.length - 1));
	colB = Number(colB.substring(0, colB.length - 1));
	colC = Number(colC.substring(0, colC.length - 1));
	//console.log("displayDataBrowser a=" + colA + " b=" + colB + " c=" + colC);
	// calculate new size for column B, to support other stuff changing
	let oldA = Number(globalColumnAWidth_DB.substring(0, globalColumnAWidth_DB.length - 1));;
	let newColA = oldA;
	let newColB = 100 - oldA - colC;
	if (newColB < 10)
	{
		newColA = (100 - colC) / 2;
		newColB = (100 - colC) / 2;
	}
	//console.log("displayDataBrowser newA=" + newColA + " newB=" + newColB);
	// reset values
	document.documentElement.style.setProperty('--dragger-AB-size', globalDragABWidth_DB);
	document.documentElement.style.setProperty('--column-A-width', newColA + "%");
	document.documentElement.style.setProperty('--column-B-width', newColB + "%");
	// toggle the hide-databrowser class
	toggleClass(['id-a-b-drag-bar', 'BEV_DataBrowser', 'BEV_DataBrowserbutton'], 'hide-databrowser');
	globalOn_DB = false;
}

var globalOn_LP = false;
var globalDragBCWidth_LP = 0;
var globalColumnAWidth_LP = 0;
var globalColumnBWidth_LP = 0;
var globalColumnCWidth_LP = 0;

function hideLegPaneColumn()
{
	// get current widths
	let drgBC = getComputedStyle(document.documentElement).getPropertyValue('--dragger-BC-size');
	let colA = getComputedStyle(document.documentElement).getPropertyValue('--column-A-width');
	let colB = getComputedStyle(document.documentElement).getPropertyValue('--column-B-width');
	let colC = getComputedStyle(document.documentElement).getPropertyValue('--column-C-width');
	// store current widths
	globalDragBCWidth_LP = drgBC;
	globalColumnAWidth_LP = colA;
	globalColumnBWidth_LP = colB;
	globalColumnCWidth_LP = colC;
	// set values
	colB = Number(colB.substring(0, colB.length - 1));
	colC = Number(colC.substring(0, colC.length - 1));
	document.documentElement.style.setProperty('--dragger-BC-size', "0px");
	document.documentElement.style.setProperty('--column-B-width', (colB + colC) + "%");
	document.documentElement.style.setProperty('--column-C-width', "0px");
	// toggle the hide-databrowser class
	toggleClass(['id-b-c-drag-bar', 'BEV_LegPane', 'BEV_LegPaneButton'], 'hide-legpane');
	globalOn_LP = true;
}

function displayLegPaneColumn()
{
	// get current values
	let colA = getComputedStyle(document.documentElement).getPropertyValue('--column-A-width');
	let colB = getComputedStyle(document.documentElement).getPropertyValue('--column-B-width');
	let colC = getComputedStyle(document.documentElement).getPropertyValue('--column-C-width');
	colA = Number(colA.substring(0, colA.length - 1));
	colB = Number(colB.substring(0, colB.length - 1));
	colC = Number(colC.substring(0, colC.length - 1));
	//console.log("displayLegPaneColumn a=" + colA + " b=" + colB + " c=" + colC);
	// calculate new size for column C, to support other stuff changing
	let oldC = Number(globalColumnCWidth_LP.substring(0, globalColumnCWidth_LP.length - 1));
	let newColC = oldC;
	let newColB = 100 - newColC - colA;
	if (newColB < 10)
	{
		newColC = (100 - colA) / 2;
		newColB = (100 - colA) / 2;
	}
	//console.log("displayLegPaneColumn newB=" + newColB + " newC=" + newColC);
	// calculate new size for column B, in case 
	// reset values
	document.documentElement.style.setProperty('--dragger-BC-size', globalDragBCWidth_LP);
	document.documentElement.style.setProperty('--column-B-width', newColB + "%");
	document.documentElement.style.setProperty('--column-C-width', newColC + "%");
	// toggle the hide-databrowser class
	toggleClass(['id-b-c-drag-bar', 'BEV_LegPane', 'BEV_LegPaneButton'], 'hide-legpane');
	globalOn_LP = false;
}

var globalOn_Auto_DB = false;
var globalOn_Auto_LP = false;

function bodyResize()
{
	const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	//console.log("bodyResize vw = " + vw);
	//const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	if ((false===globalOn_Auto_DB)&&(false===globalOn_DB)&&(vw<800))
	{
		globalOn_Auto_DB = true;
		hideDataBrowser();
	}
	if ((false===globalOn_Auto_LP)&&(false===globalOn_LP)&&(vw<600))
	{
		globalOn_Auto_LP = true;
		hideLegPaneColumn();
	}
	if ((true===globalOn_Auto_DB)&&(true===globalOn_DB)&&(vw>800))
	{
		globalOn_Auto_DB = false;
		displayDataBrowser();
	}
	else if ((true===globalOn_Auto_DB)&&(false===globalOn_DB))
	{
		globalOn_Auto_DB = false;
	}
	if ((true===globalOn_Auto_LP)&&(true===globalOn_LP)&&(vw>600))
	{
		globalOn_Auto_LP = false;
		displayLegPaneColumn();
	}
	else if ((true===globalOn_Auto_LP)&&(false===globalOn_LP))
	{
		globalOn_Auto_LP = false;
	}
	globalDiagramControl.resize();
}