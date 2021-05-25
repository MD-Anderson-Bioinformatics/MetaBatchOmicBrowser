/* */
function Pixels(theGlobalWidth, theGlobalHeight,
				theViewWidthFunction, theViewHeightFunction, 
				theResizeFunction, theZoomFunction, theScrollFunction, theNonSvgHeight)
{
	var myPixels = this;
	// Global screen size (how big is the overall diagram)
	myPixels.mDivWidth = Number(theGlobalWidth);
	myPixels.mDivHeight = Number(theGlobalHeight);
	myPixels.mNonSvgHeight = Number(theNonSvgHeight);
	// SVG size (how big is the overall diagram, not counting exterior controls)
	myPixels.mSvgWidth = Number(myPixels.mDivWidth);
	myPixels.mSvgHeight = Number(myPixels.mDivHeight-myPixels.mNonSvgHeight);
	// View size (how big is the area of the canvas which we can see)
	myPixels.mViewWidthFunction = theViewWidthFunction;
	myPixels.mViewHeightFunction = theViewHeightFunction;
	myPixels.mViewWidth = myPixels.mViewWidthFunction(myPixels.mSvgWidth);
	myPixels.mViewHeight = myPixels.mViewHeightFunction(myPixels.mSvgHeight);
	// Zoom level (how big is the mCanvasWidth compared to mOriginalCanvasWidth)
	myPixels.mCurrentZoom = 1;
	// Canvas size -- based on view size and zoom (how big is the area where the boxplots are drawn)
	myPixels.mCanvasWidth = myPixels.mViewWidth*myPixels.mCurrentZoom;
	myPixels.mCanvasHeight = myPixels.mViewHeight;
	// current scroll percent location 0.0-1.0
	myPixels.mScrollPercentage = 0;
	// functions to implement changes
	myPixels.mResizeFunction = theResizeFunction;
	myPixels.mZoomFunction = theZoomFunction;
	myPixels.mScrollFunction = theScrollFunction;
	
	myPixels.changeZoom = function(theNewZoom)
	{
		theNewZoom = Number(theNewZoom);
		//console.log("change zoom theNewZoom=" + theNewZoom);
		if((myPixels.mCurrentZoom!==theNewZoom)&&(theNewZoom>=1))
		{
			//console.log("change zoom do");
			myPixels.mCurrentZoom = theNewZoom;
			myPixels.mCanvasWidth = myPixels.mViewWidth*myPixels.mCurrentZoom;
			if (null!==myPixels.mZoomFunction)
			{
				myPixels.mZoomFunction();
				myPixels.mScrollFunction();
			}
		}
		else
		{
			//console.log("change zoom NOT");
		}
	};
	
	myPixels.changeSize = function(theGlobalWidth, theGlobalHeight)
	{
		//console.log("boxplot_pixels::changeSizeInternal 1 " + theGlobalWidth + " and " + theGlobalHeight);
		theGlobalWidth = Number(theGlobalWidth);
		theGlobalHeight = Number(theGlobalHeight);
		//console.log("boxplot_pixels::changeSizeInternal 2 " + theGlobalWidth + " and " + theGlobalHeight);
		if ((myPixels.mDivWidth!==theGlobalWidth) ||
			(myPixels.mDivHeight!==theGlobalHeight))
		{
			myPixels.mDivWidth = theGlobalWidth;
			myPixels.mDivHeight = theGlobalHeight;
			myPixels.mSvgWidth = myPixels.mDivWidth;
			myPixels.mSvgHeight = myPixels.mDivHeight-myPixels.mNonSvgHeight;
			myPixels.mViewWidth = myPixels.mViewWidthFunction(myPixels.mSvgWidth);
			myPixels.mViewHeight = myPixels.mViewHeightFunction(myPixels.mSvgHeight);
			myPixels.mCanvasWidth = myPixels.mViewWidth*myPixels.mCurrentZoom;
			myPixels.mCanvasHeight = myPixels.mViewHeight;
			if (null!==myPixels.mResizeFunction)
			{
				myPixels.mResizeFunction();
			}
		}
	};
	
	myPixels.changeScroll = function(theNewScrollPercentage)
	{
		theNewScrollPercentage = Number(theNewScrollPercentage);
		if ((myPixels.mScrollPercentage!==theNewScrollPercentage)&&
			(theNewScrollPercentage>=0)&&
			(theNewScrollPercentage<=1.0))
		{
			//console.log("changeScroll theNewScrollPercentage=" + theNewScrollPercentage);
			myPixels.mScrollPercentage = theNewScrollPercentage;
			if (null!==myPixels.mScrollFunction)
			{
				myPixels.mScrollFunction();
			}
		}
	};
	
	return(myPixels);
}
