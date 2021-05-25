// Rong Yao ryao@mdanderson.org
// revised from Nianxiang Zhang's R code
// function () read in a tab deliminated data file with sample identifier and subsequent covariates; a list of covariates user interested
// the output is a function of taking two parameters 1) a covariate 2) an id of that covariate, it returns a color index in the color lookup table. 
// basic steps for the algorithm:
// 1. find a covariate with the max numbers of catergory value as reference covariate; each value in the reference covariate assign a color index, and this is the minimum number of colors needed;
// 2. construct a count hash table for each covariate and reference covariate (only store the non-zero count entries,) hash table key is unique string represented combination of reference-covariate, value is an object has four attributes: referenceID, covariatesID, count, colorIndex ;
// 3. for each individual count hash table, for the entries have the same value in reference covariate, keep the max count entry, and mark the other entries with the same value in reference covariate as undefined;
// 4. followed output of 3, for the entries have the same value in a covariate, keep the max count entry, and mark the other entries with the same value in covariate as undefined;
// 5. followed output of 4, if any value in the covariate does not have a defined entry in the hash table (those marked by undefined in the previous steps), assign a new color index for it, new color index is an index greater than minimum number of colors;
// 6. construct result array, indexed by covariates, value is an array of covariate value associates with colorIndex
	
function matchColors(data,  covariateslist){

    var results  = new Array();  // for final color index lookup results
    createColorLookup(data);
    return getColorIndex;
    
    function createColorLookup(data) {
        var variates = new Array();  // covariates

        //data is an array of object, each object {sample=" ", Batch=" " ...}
        var first = data[0];
        for (var field in first) {   //field equivalent to header
            //Intersect the covariateslist and field (except for first field "Sample")	       
            if (field != "Sample" && $.inArray(field, covariateslist) !=-1 ) {
                variates[field] = new Array();
                for (var i=0; i<data.length; i++){
                    var obj = data[i];
                    var fieldContents = obj[field];
                    variates[field].push(fieldContents);
                }
            }		
        }

        //algorithm step 1: get the unique values for each variates
        var uni_variates = new Array();
        for (var field in variates) {
            uni_variates[field] = uniqueArr(variates[field]);
        }
				
        //find the uni_variates[field] with max number of variables as reference
        var maxlen = 0;
        var maxField = "";
        for (var field in variates){			
            maxlen=Math.max(maxlen, uni_variates[field].length);
            //get the first field has this maxlen
            if (uni_variates[field].length == maxlen) {
                maxField = field;
            }
        }
        //console.log ("use " + maxField+" as reference variates"+ " it has length " + maxlen);
				
        //reference variate array and sorted
        var refVariat = uni_variates[maxField].sort();
        var globalColorIndex;   //this used in step5
        //console.log ("minimum color index needed = " + globalColorIndex);
		/*		
        for (var field in uni_variates) {
        	console.log ("field =" + field + "unique value has length : "+uni_variates[field].length);
        }
		*/		
        //loop through each variates
        for ( var field in uni_variates) {
            globalColorIndex = refVariat.length; 
            //
            //algorithm step 2: create count hash table for reference and variates, record count for reference-variates
	    //console.log("crossTableCount() "+variates[maxField]+" vs "+variates[field])		
            var myh = crossTableCount(variates[maxField], variates[field]);
            var datahash = new Array();
            var k = keys(myh).sort();
	    //console.log("after crosstable ...")
            //console.log(myh)
                  
            //construct the datahash table for this reference and variates, value is an object with four attributes 
            //reference value, variates value, count and index, index corresponding to unique reference index (or color index)
            for (var i=0; i< k.length; i++) {
                var key = k[i];
                //console.log("check key : key="+key);
                var myObj = new Object();
                var help = key.split("_");
					
                myObj[maxField] = help[0];
                myObj[field]    = help[1];
                myObj["count"]  = myh[key];
                var refIndex    = jQuery.inArray(help[0], refVariat);
                myObj["index"]  = refIndex+1;
                //console.log ("ref="+myObj[maxField]+" field="+myObj[field]+" count="+myObj["count"]+" index="+myObj["index"]);
                datahash.push(myObj);
            }
	    //console.log("end of step 2..")
            //console.log(datahash);
           
            //algorithm step 3: keep the max count entry for entries with same reference value 
            for (var i =0; i< datahash.length; i++){
                if (datahash[i] != undefined) {
                    var ref = datahash[i][maxField];
                    fieldCompareByCount (ref, i, maxField, datahash);
                }
            }
            //console.log("end of step3 ..")
            //console.log(datahash);
          
          
            //algorithm step 4: keep the max count entry for entries with same variate value 
            for (var i =0; i< datahash.length; i++){			    
                if (datahash[i] != undefined) {
                    var variat = datahash[i][field];
                    fieldCompareByCount (variat, i, field, datahash);
                }					
            }
	    //console.log("end of step4 ....")
            //console.log(datahash);
           
            //algorithm step 5: if a variate value is no longer in datahash filtered by the above two 'keep' steps, add a new object to datahash with a new color assigned 			
            for ( var a =0; a< uni_variates[field].length; a++ ){
                var find =0;
                var value = uni_variates[field][a];
                //console.log("value------{"+value+"}");
                for (var i =0; i< datahash.length; i++){
                    if (datahash[i] != undefined) {
                        var existValue = datahash[i][field];
                        //console.log("existValue------{"+existValue+"}");
                        if (value === existValue) {
                            find = 1;
                            break;
                        }
                    }
                }
                if (find ==0 ) {
                    //console.log("Not find covariate value: "+ value);
                    //add new object to datahash with a new color assigned
                    var myObj = new Object();
                    myObj[field] = value;
                    myObj["index"] = globalColorIndex+1;
                    globalColorIndex++;
                    datahash.push(myObj);
                }		
            }
            //console.log("display "+maxField+" vs "+field+":");
	    //console.log("end of step5 ....")
            //console.log(datahash);
            
            //algorithm step 6
            var myDataArr = new Array();
            for (var i =0; i< datahash.length; i++){
                if (datahash[i] != undefined) {
                    var data = datahash[i][field];
                    var colorIndex = datahash[i]["index"]; 
                    //console.log(field+"="+data+" color index = "+colorIndex);
                    myDataArr[data] = colorIndex;
                }
            }
            //console.log(myDataArr);
            results[field] = myDataArr;
        } 
				
        //console.log("====final result====");
        //console.log(results);
        //test cases
        //var variate = "Sample";
        //var variate = "PlateId";
        //var id = "TCGA-02-0015-01A-01R-0299-03";
        //var id = "0281";
        //console.log (results[variate][id])
        
    }; //end of createColorLookup
    
	//precondition: both covariate and id are defined
    function getColorIndex (covariate, id){
            if (results[covariate])
                return (results[covariate][id]);
            else
                return (undefined);
    }
    //helper functions starts here ...
    function include(arr,obj) {
        return (arr.indexOf(obj) != -1);
    } 
			
    function keys(obj) {     
        var keys = [];      
        for(var key in obj) {         
            if(obj.hasOwnProperty(key))             
            {             
                keys.push(key);        
            }     
        }      
        return keys; 
    }  
			
    function uniqueArr(arr) {
        var o = {}, i, l = arr.length, r = [];
        for(i=0; i<l;i+=1) {
            o[arr[i]] = arr[i];
        }
        for(i in o) {
            r.push(o[i]);
        }
        return r;
    };
		    
    //myHash:  a hash table for this reference and variates, value is an object with four attributes :reference value, variates value, count and index,
    //str:   a reference value or a variate value in myHash which is searched for duplicates
    //index: an index in myHash
    //field: an attribute for the object stored 
    function fieldCompareByCount(str, index, field, myHash){
			 
        var maxCount = myHash[index]["count"];         // count for the input arguments
			
        //myHash is pre-sorted by its key, so only compare the entries after it
        for (var i = index+1; i < myHash.length; i++){   
					
            if (myHash[i] != undefined) {
                //console.log("i="+i+"==== "+ myHash[i][field]);
                if (myHash[i][field] == str) {           // find duplicated str value
                    var count = myHash[i]["count"];
		   			
                    //current entry has a larger or equal count than its count in subsequent entry, mark subsequent entry undefined 
                    if (count < maxCount || count == maxCount ) {  
                     
                        myHash[i] = undefined;	
                    }
                    //else mark the current entry undefined
                    else {	
                       
                        myHash[index] = undefined;
                        maxCount = count;
                        index = i;
                    }
                }
            }
        }
    }
			
    //arr1 is reference array, arr2 is variates array, they have same length, 
    //return a hashtable, key is unique combination of ref and variates, value is the counts 
    function crossTableCount(arr1, arr2) {
        var h= new Array(); 
        var len = arr1.length;
		
        for (var i=0; i <len; i++){
            var refData = arr1[i];
            var varData = arr2[i];
            var key = refData+"_"+varData;
            //console.log ("key="+key+" h[key] ="+h[key]);
            if (h[key] == undefined){
                h[key] = 1;
            }
            else {
                h[key]= h[key]+1;	
            }					
        }
        //console.log (keys(h).sort());
        return h;
    }
  
};