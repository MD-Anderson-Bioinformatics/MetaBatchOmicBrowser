/* global d3  */

ScrollBar.uniqueSuffix = 1;	// effectively global.  Not a closure.  CDW

//theCallback, theZoomOutCallback, theZoomInCallback, theZoomResetCallback, 
function ScrollBar(theParentG, theGlobalXLoc, theBoxplotPixels, theHeight)
{
	var mThis = function() {};
	var mBoxplotPixels = theBoxplotPixels;
	var mParentG = theParentG;
	var mGlobalX = theGlobalXLoc;
	

	var mWidthWithButtons = 0;
	var mWidthNoButtons = 0;
	var mHeight = theHeight;
	var mDragButtonWidth = 0;
	var mZoomButtonWidth = 15;
	
	var mBackgroundRect = null;
	var mDragRect = null;
	var mZoomOutButton = null;
	var mZoomResetButton = null;
	var mZoomInButton = null;
	var mScrollLeftButton = null;
	var mScrollRightButton = null;
	
	var mScrollButtonInterval = null;

	// Ensure elements have unique IDs even across tabs
	var mySuffix = (ScrollBar.uniqueSuffix++).toString(),
		zoomOutImageId = 'ScrollBar-myZoomOutImage-' + mySuffix,
		zoomResetImageId = 'ScrollBar-myZoomResetImage-' + mySuffix,
		zoomInImageId = 'ScrollBar-myZoomInImage-' + mySuffix,
		scrollLeftImageId = 'ScrollBar-myScrollLeftImage-' + mySuffix,
		scrollRightImageId = 'ScrollBar-myScrollRightImage-' + mySuffix;

/*
	var mCallback = theCallback;
	var mZoomOutCallback = theZoomOutCallback;
	var mZoomResetCallback = theZoomResetCallback;
	var mZoomInCallback = theZoomInCallback;
*/
	// TODO:BEV: function d3AddUpdateId is duplicated in boxplot_outer.js and scrollbar.js
	function d3AddUpdateId(theFromElement, theSelectId, theAppend)
	{
		// data([]) is used  to bind an existing or create a new element, allowing the same code for updating or creating
		var myElement = theFromElement.selectAll("#" + theSelectId).data([1]);
		// this adds the element if it does not exist
		myElement.enter().append(theAppend);
		myElement.attr("id", theSelectId);
		return myElement;
	}
	
	function dragRectXCoord()
	{
		// skip left scroll button
		var result = mZoomButtonWidth + ((mWidthNoButtons-mDragButtonWidth) * mBoxplotPixels.mScrollPercentage);
		return result;
	}

	mThis.render = function ()
	{
		//console.log("scrollbar render started");
		mWidthWithButtons = mBoxplotPixels.mViewWidth;
		// Three zoom buttons, two scroll buttons
		mWidthNoButtons = mWidthWithButtons - mZoomButtonWidth - mZoomButtonWidth - mZoomButtonWidth - mZoomButtonWidth - mZoomButtonWidth;
		mDragButtonWidth = mWidthNoButtons * (mBoxplotPixels.mViewWidth / mBoxplotPixels.mCanvasWidth);
		if (null===mBackgroundRect)
		{
			mBackgroundRect = d3AddUpdateId(mParentG, "ScrollbarBackgroundRect", "rect");
			// skip left scroll button
			mBackgroundRect.attr("x", mZoomButtonWidth+1);
			mDragRect = d3AddUpdateId(mParentG, "ScrollbarDragRect-" + mySuffix, "rect");
			//
			var myZoomOutImage = d3AddUpdateId(mParentG, zoomOutImageId, "filter");
			myZoomOutImage.attr("x", "0")
				.attr("y", "0")
				.attr("width", "100%")
				.attr("height", "100%");
			var outImage = d3AddUpdateId(myZoomOutImage, "outImage", "feImage");
			// : is there to fix an issue in D3 on Safari where the "xlink" is dropped from "xlink:href"
			// The extra colon is dropped (and safely ignored in other browsers)
			outImage.attr("xlink:xlink:href", "GraphAPI/BP/mag_minus.png");
			//
			var myZoomResetImage = d3AddUpdateId(mParentG, zoomResetImageId, "filter");
			myZoomResetImage.attr("x", "0")
				.attr("y", "0")
				.attr("width", "100%")
				.attr("height", "100%");
			var resetImage = d3AddUpdateId(myZoomResetImage, "resetImage", "feImage");
			// : is there to fix an issue in D3 on Safari where the "xlink" is dropped from "xlink:href"
			// The extra colon is dropped (and safely ignored in other browsers)
			resetImage.attr("xlink:xlink:href", "GraphAPI/BP/mag_equal.png");
			//
			var myZoomInImage = d3AddUpdateId(mParentG, zoomInImageId, "filter");
			myZoomInImage.attr("x", "0")
				.attr("y", "0")
				.attr("width", "100%")
				.attr("height", "100%");
			var inImage = d3AddUpdateId(myZoomInImage, "inImage", "feImage");
			// : is there to fix an issue in D3 on Safari where the "xlink" is dropped from "xlink:href"
			// The extra colon is dropped (and safely ignored in other browsers)
			inImage.attr("xlink:xlink:href", "GraphAPI/BP/mag_plus.png");
			//
			var myScrollLeftImage = d3AddUpdateId(mParentG, scrollLeftImageId, "filter");
			myScrollLeftImage.attr("x", "0")
				.attr("y", "0")
				.attr("width", "100%")
				.attr("height", "100%");
			var leftImage = d3AddUpdateId(myScrollLeftImage, "leftImage", "feImage");
			// : is there to fix an issue in D3 on Safari where the "xlink" is dropped from "xlink:href"
			// The extra colon is dropped (and safely ignored in other browsers)
			leftImage.attr("xlink:xlink:href", "GraphAPI/BP/left.png");
			//
			var myScrollRightImage = d3AddUpdateId(mParentG, scrollRightImageId, "filter");
			myScrollRightImage.attr("x", "0")
				.attr("y", "0")
				.attr("width", "100%")
				.attr("height", "100%");
			var rightImage = d3AddUpdateId(myScrollRightImage, "rightImage", "feImage");
			// : is there to fix an issue in D3 on Safari where the "xlink" is dropped from "xlink:href"
			// The extra colon is dropped (and safely ignored in other browsers)
			rightImage.attr("xlink:xlink:href", "GraphAPI/BP/right.png");
			//
			mZoomOutButton = d3AddUpdateId(mParentG, "ZoomOutButton", "rect");
			mZoomOutButton.attr("filter", "url(#" + zoomOutImageId + ")");
			mZoomResetButton = d3AddUpdateId(mParentG, "ZoomResetButton", "rect");
			mZoomResetButton.attr("filter", "url(#" + zoomResetImageId + ")");
			mZoomInButton = d3AddUpdateId(mParentG, "ZoomInButton", "rect");
			mZoomInButton.attr("filter", "url(#" + zoomInImageId + ")");
			mScrollLeftButton = d3AddUpdateId(mParentG, "ScrollLeftButton", "rect");
			mScrollLeftButton.attr("filter", "url(#" + scrollLeftImageId + ")");
			mScrollRightButton = d3AddUpdateId(mParentG, "ScrollRightButton", "rect");
			mScrollRightButton.attr("filter", "url(#" + scrollRightImageId + ")");
		}
		mScrollLeftButton.attr("class", "ScrollLeftButton")
				.attr("x", 0)
				.attr("width", mZoomButtonWidth)
				.attr("height", mHeight)
				.on("click", function (arg1, arg2, arg3)
				{
					mBoxplotPixels.changeScroll(mBoxplotPixels.mScrollPercentage-0.01);
				})
				.on("mousedown", function (arg1, arg2, arg3)
				{
					//console.log("left mousedown");
					mBoxplotPixels.changeScroll(mBoxplotPixels.mScrollPercentage-0.01);
					mScrollButtonInterval = setInterval(function()
					{
						mBoxplotPixels.changeScroll(mBoxplotPixels.mScrollPercentage-0.01);
					}, 50);
				})
				.on("mouseup", function (arg1, arg2, arg3)
				{
					//console.log("left mouseup");
					clearInterval(mScrollButtonInterval);
				})
				.on("mouseout", function (arg1, arg2, arg3)
				{
					//console.log("left mouseout");
					clearInterval(mScrollButtonInterval);
				});
		mScrollRightButton.attr("class", "ScrollRightButton")
				// skip left scroll button
				.attr("x", mWidthNoButtons+mZoomButtonWidth)
				.attr("width", mZoomButtonWidth)
				.attr("height", mHeight)
				.on("click", function (arg1, arg2, arg3)
				{
					mBoxplotPixels.changeScroll(mBoxplotPixels.mScrollPercentage+0.01);
				})
				.on("mousedown", function (arg1, arg2, arg3)
				{
					//console.log("right mousedown");
					mBoxplotPixels.changeScroll(mBoxplotPixels.mScrollPercentage+0.01);
					mScrollButtonInterval = setInterval(function()
					{
						mBoxplotPixels.changeScroll(mBoxplotPixels.mScrollPercentage+0.01);
					}, 50);
				})
				.on("mouseup", function (arg1, arg2, arg3)
				{
					//console.log("right mouseup");
					clearInterval(mScrollButtonInterval);
				})
				.on("mouseout", function (arg1, arg2, arg3)
				{
					//console.log("right mouseout");
					clearInterval(mScrollButtonInterval);
				});
		
		mZoomOutButton.attr("class", "ZoomOutButton")
				// skip left and right scroll button
				.attr("x", mWidthNoButtons+mZoomButtonWidth+mZoomButtonWidth)
				.attr("width", mZoomButtonWidth)
				.attr("height", mHeight)
				.on("click", function (arg1, arg2, arg3)
				{
					// zoom = zoom - 1
					mBoxplotPixels.changeZoom(mBoxplotPixels.mCurrentZoom-1);
					//console.log("mZoomOutButton");
					//mZoomOutCallback();
				});
		mZoomResetButton.attr("class", "ZoomResetButton")
				// skip left and right scroll button and previous zoom button(s)
				.attr("x", mWidthNoButtons+mZoomButtonWidth+mZoomButtonWidth+mZoomButtonWidth)
				.attr("width", mZoomButtonWidth)
				.attr("height", mHeight)
				.on("click", function (arg1, arg2, arg3)
				{
					// zoom = 1
					mBoxplotPixels.changeZoom(1);
					//console.log("mZoomResetButton");
					//mZoomResetCallback();
				});
		mZoomInButton.attr("class", "ZoomInButton")
				// skip left and right scroll button and previous zoom button(s)
				.attr("x", mWidthNoButtons+mZoomButtonWidth+mZoomButtonWidth+mZoomButtonWidth+mZoomButtonWidth)
				.attr("width", mZoomButtonWidth)
				.attr("height", mHeight)
				.on("click", function (arg1, arg2, arg3)
				{
					// zoom = zoom + 1
					mBoxplotPixels.changeZoom(mBoxplotPixels.mCurrentZoom+1);
					//console.log("mZoomInButton");
					//mZoomInCallback();
				});
		mBackgroundRect.attr("class", "ScrollbarBackgroundRect")
				.attr("width", mWidthNoButtons-1)
				.attr("height", mHeight)
				.on("click", function (arg1, arg2, arg3)
				{
					var currentLoc = ((mWidthNoButtons-mDragButtonWidth)*mBoxplotPixels.mScrollPercentage);
					var clickLoc = d3.event.pageX - mGlobalX;
					//console.log("ScrollbarBackgroundRect currentLoc=" + currentLoc);
					//console.log("ScrollbarBackgroundRect clickLoc=" + clickLoc);
					var percent = 0;
					if (clickLoc>currentLoc)
					{
						percent = (clickLoc-mDragButtonWidth)/(mWidthNoButtons-mDragButtonWidth);
					}
					else
					{
						percent = clickLoc/(mWidthNoButtons-mDragButtonWidth);
					}
					if (percent>1.0)
					{
						percent = 1.0;
					}
					else if (percent<0.0)
					{
						percent = 0.0;
					}
					mBoxplotPixels.changeScroll(percent);
				});

		mDragRect.attr("class", "ScrollbarDragRect")
				.attr("x", dragRectXCoord()+1)
				.attr("width", mDragButtonWidth-1)
				.attr("height", mHeight)
				.call(d3.behavior.drag()
						.on("drag", function (d, i, foo)
						{
							//console.log("mScrollbarDragRect drag");
							//console.log("ScrollbarDragRect d3.event.dx = " + change);
							var change = Number(d3.event.dx);
							//console.log("ScrollbarDragRect change = " + change);
							var recalc = ((mWidthNoButtons-mDragButtonWidth)*mBoxplotPixels.mScrollPercentage) + change;
							recalc = recalc / (mWidthNoButtons-mDragButtonWidth);
							//console.log("ScrollbarDragRect recalc = " + recalc);
							mBoxplotPixels.changeScroll(recalc);
						}));
		//console.log("scrollbar render done");
	};

	return mThis;
}
