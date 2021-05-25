

/* *************************** */
/* *************************** */
/* *** VERTICAL RESIZE FUNS ** */
/* *************************** */
/* *************************** */

function onDragRowABMQA(event)
{
	//console.log("onDragRowABMQA Type=" + event.type + " clientX=" + event.clientX);
	//console.log(event);
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
			rowA = Number(rowA.substring(0, rowA.length - 2));
			rowB = Number(rowB.substring(0, rowB.length - 2));
			let bDelta = newVwPortionForB - rowB;
			let aDelta = - bDelta;
			rowA = (rowA + aDelta) + "vh";
			rowB = (rowB + bDelta) + "vh";
			document.documentElement.style.setProperty('--row-A-height', rowA);
			document.documentElement.style.setProperty('--row-B-height', rowB);
			// remove messy text selection
			document.getSelection().removeAllRanges();
			document.getElementById('viewIframe').contentWindow.globalDiagramControl.resize();
		}
	}
}

function onMouseUpRowABMQA(theEvent)
{
	// dragging over iframes, so add pointer-events: none class to iframes
	// see https://stackoverflow.com/questions/5645485/detect-mousemove-when-over-an-iframe
	//console.log("onMouseUpRowABMQA");
	document.body.style.cursor = "auto";
	document.getElementById("viewIframe").classList.remove("no-pointer-events");
	document.getElementById("queryIframe").classList.remove("no-pointer-events");
	document.removeEventListener("mousemove", onDragRowABMQA);
	document.removeEventListener("mouseup", onMouseUpRowABMQA);
	document.getSelection().removeAllRanges();
}

function onMouseDownRowABMQA(theEvent)
{
	// dragging over iframes, so add pointer-events: none class to iframes
	// see https://stackoverflow.com/questions/5645485/detect-mousemove-when-over-an-iframe
	//console.log("onMouseDownRowABMQA");
	document.body.style.cursor = "ns-resize";
	document.getElementById("viewIframe").classList.add("no-pointer-events");
	document.getElementById("queryIframe").classList.add("no-pointer-events");
	document.addEventListener("mousemove", onDragRowABMQA);
	document.addEventListener("mouseup", onMouseUpRowABMQA);
}



/* *************************** */
/* *************************** */
/* *** HORIZONTAL RESIZE FUNS ** */
/* *************************** */
/* *************************** */

function onDragColABMQA(event)
{
	//console.log("onDragColABMQA Type=" + event.type + " clientX=" + event.clientX);
	//console.log(event);
	// not sure about why I need this check, but last drag event has zeros for these values
	if ((0!==event.clientX)&&(0!==event.clientY))
	{
		const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		//console.log("onDragColABMQA vw=" + vw);
		let loc = event.clientX;
		// 84 was chosen as close to 54 (header image height) plus 30 as decent padding
		if ((loc>400)&&(loc+400<vw))
		{
			let newVwPortionForB = ((vw-loc)/vw)*100; // proportion from (vh - current drag location) for row B
			let colA = getComputedStyle(document.documentElement).getPropertyValue('--col-A-width');
			let colB = getComputedStyle(document.documentElement).getPropertyValue('--col-B-width');
			colA = Number(colA.slice(0, -2));
			colB = Number(colB.slice(0, -2));
			let bDelta = newVwPortionForB - colB;
			let aDelta = - bDelta;
			colA = (colA + aDelta) + "vw";
			colB = (colB + bDelta) + "vw";
			//console.log("onDragColABMQA colA=" + colA);
			//console.log("onDragColABMQA colB=" + colB);
			document.documentElement.style.setProperty('--col-A-width', colA);
			document.documentElement.style.setProperty('--col-B-width', colB);
			// remove messy text selection
			document.getSelection().removeAllRanges();
			document.getElementById('viewIframe').contentWindow.globalDiagramControl.resize();
		}
	}
}

function onMouseUpColABMQA(theEvent)
{
	// dragging over iframes, so add pointer-events: none class to iframes
	// see https://stackoverflow.com/questions/5645485/detect-mousemove-when-over-an-iframe
	//console.log("onMouseUpColABMQA");
	document.body.style.cursor = "auto";
	document.getElementById("viewIframe").classList.remove("no-pointer-events");
	document.getElementById("queryIframe").classList.remove("no-pointer-events");
	document.removeEventListener("mousemove", onDragColABMQA);
	document.removeEventListener("mouseup", onMouseUpColABMQA);
	document.getSelection().removeAllRanges();
}

function onMouseDownColABMQA(theEvent)
{
	// dragging over iframes, so add pointer-events: none class to iframes
	// see https://stackoverflow.com/questions/5645485/detect-mousemove-when-over-an-iframe
	//console.log("onMouseDownColABMQA");
	document.body.style.cursor = "ew-resize";
	document.getElementById("viewIframe").classList.add("no-pointer-events");
	document.getElementById("queryIframe").classList.add("no-pointer-events");
	document.addEventListener("mousemove", onDragColABMQA);
	document.addEventListener("mouseup", onMouseUpColABMQA);
}
