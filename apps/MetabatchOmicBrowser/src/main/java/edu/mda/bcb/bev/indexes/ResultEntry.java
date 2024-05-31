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
package edu.mda.bcb.bev.indexes;

import com.google.gson.Gson;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map.Entry;

/**
 *
 * @author dqs_tcga_service
 */
public class ResultEntry extends EntryMixin
{

	public String path_results = "";	// path to result zip
	public String path_data = "";		// path to data zip
	public String id = "";				// ZIP id
	public String source = "";			// GDC or MWB
	public String program = "";			// select on contents
	public String project = "";			// select on contents
	public String category = "";		// select on contents
	public String platform = "";		// select on contents
	public String data = "";			// select on contents (aka Adjusted-, Original, etc)
	public String details = "";			// select on contents
	public String data_version = "";	// select on contents
	public String test_version = "";	// select on contents
	public String files = "";	// select on contents
	public String job_type = "";	// select on contents
	// advanced options
	public Integer samples_matrix = -1;		// integer gt, lt, none (may be NaN)
	public Integer samples_mutations = -1;	// integer gt, lt, none (may be NaN)
	public Integer features_matrix = -1;	// integer gt, lt, none (may be NaN)
	public Integer features_mutations = -1;	// integer gt, lt, none (may be NaN)
	public HashMap<String, Integer> unknown_batches = new HashMap<>();		// "key: value", "key: value" - integer any gt, lt, none (may have no values)
	public HashMap<String, Integer> batch_unique_cnt = new HashMap<>();		// "key: value", "key: value" - integer any gt, lt, none (may have no values)
	public HashMap<String, Integer> correlated_batch_types = new HashMap<>();	// "key: value", "key: value" - integer any gt, lt, none (may have no values, zero to 100)
	public Integer batch_type_count = -1;	// integer gt, lt, none (may be 0)

	public ResultEntry()
	{
		//
	}

	public void populate(ArrayList<String> theHeaders, String[] theRow)
	{
		// general internal data
		path_results = theRow[theHeaders.indexOf("PathResults")];
		path_data = theRow[theHeaders.indexOf("PathData")];
		id = theRow[theHeaders.indexOf("ID")] + "~" + theRow[theHeaders.indexOf("DataVersion")] + "~" + theRow[theHeaders.indexOf("TestVersion")];
		// shared data
		// version source variant project subProject
		// category platform dataset_type algorithm details
		source = theRow[theHeaders.indexOf("Source")];
		program = theRow[theHeaders.indexOf("Program")];
		project = theRow[theHeaders.indexOf("Project")];
		category = theRow[theHeaders.indexOf("Category")];
		platform = theRow[theHeaders.indexOf("Platform")];
		data = theRow[theHeaders.indexOf("Data")];
		details = theRow[theHeaders.indexOf("Details")];
		//
		data_version = theRow[theHeaders.indexOf("DataVersion")];
		test_version = theRow[theHeaders.indexOf("TestVersion")];
		//
		job_type = theRow[theHeaders.indexOf("job_type")];
		//
		files = theRow[theHeaders.indexOf("Files")];
		// sample/feature/batch data
		// samples_matrix samples_mutations features_matrix features_mutations
		// unknown_batches batch_unique_cnt correlated_batch_types batch_type_count
		samples_matrix = convertToInteger(theRow[theHeaders.indexOf("samples_matrix")]);
		samples_mutations = convertToInteger(theRow[theHeaders.indexOf("samples_mutations")]);
		features_matrix = convertToInteger(theRow[theHeaders.indexOf("features_matrix")]);
		features_mutations = convertToInteger(theRow[theHeaders.indexOf("features_mutations")]);
		unknown_batches = convertToHashMap(theRow[theHeaders.indexOf("unknown_batches")]);
		batch_unique_cnt = convertToHashMap(theRow[theHeaders.indexOf("batch_unique_cnt")]);
		correlated_batch_types = convertToHashMap(theRow[theHeaders.indexOf("correlated_batch_types")]);
		batch_type_count = convertToInteger(theRow[theHeaders.indexOf("batch_type_count")]);
	}

	static public Integer convertToInteger(String theEntry)
	{
		Integer myInt = -1;
		try
		{
			myInt = Integer.parseInt(theEntry);
		}
		catch (Exception ignore)
		{
			// ignore, keep myInt as -1
			myInt = -1;
		}
		return myInt;
	}

	public HashMap<String, Integer> convertToHashMap(String theEntry)
	{
		HashMap<String, Integer> hashmap = new HashMap<>();
		if ((null != theEntry) && (!"".equals(theEntry)))
		{
			theEntry = theEntry.replace("\\", "");
			theEntry = theEntry.replace("\"", "");
			String[] splitted = theEntry.split(",", -1);
			for (String subEntry : splitted)
			{
				subEntry = subEntry.trim();
				String[] subSplitted = subEntry.split(":", -1);
				hashmap.put(subSplitted[0], convertToInteger(subSplitted[1]));
			}
		}
		return hashmap;
	}

	protected boolean filter_strings(String theValue, ArrayList<String> theValues)
	{
		boolean passes = false;
		if (null == theValues)
		{
			passes = true;
		}
		else
		{
			if ((theValues.isEmpty()) || (theValues.contains(theValue)))
			{
				passes = true;
			}
		}
		return passes;
	}

	public boolean filter_source(ArrayList<String> theValues)
	{
		return filter_strings(this.source, theValues);
	}

	public boolean filter_program(ArrayList<String> theValues)
	{
		return filter_strings(this.program, theValues);
	}

	public boolean filter_project(ArrayList<String> theValues)
	{
		return filter_strings(this.project, theValues);
	}

	public boolean filter_category(ArrayList<String> theValues)
	{
		return filter_strings(this.category, theValues);
	}

	public boolean filter_platform(ArrayList<String> theValues)
	{
		return filter_strings(this.platform, theValues);
	}

	public boolean filter_data(ArrayList<String> theValues)
	{
		return filter_strings(this.data, theValues);
	}

	public boolean filter_details(ArrayList<String> theValues)
	{
		return filter_strings(this.details, theValues);
	}

	public boolean filter_jobtype(ArrayList<String> theValues)
	{
		return filter_strings(this.job_type, theValues);
	}

	public boolean filter_data_version(ArrayList<String> theValues)
	{
		return filter_strings(this.data_version, theValues);
	}

	public boolean filter_test_version(ArrayList<String> theValues)
	{
		return filter_strings(this.test_version, theValues);
	}

	protected boolean filter_integer(int theInt, Integer theGTE, Integer theLTE, boolean isNaN)
	{
		boolean passes = false;
		if (isNaN)
		{
			if (theInt == -1)
			{
				passes = true;
			}
		}
		else
		{
			if ((null == theLTE) && (null == theGTE))
			{
				passes = true;
			}
			else
			{
				if (null != theGTE)
				{
					if (theInt >= theGTE)
					{
						passes = true;
					}
				}
				else
				{
					if (null != theLTE)
					{
						if (theInt <= theLTE)
						{
							passes = true;
						}
					}
					else
					{
						if ((theInt <= theLTE) && (theInt >= theGTE))
						{
							passes = true;
						}
					}
				}
			}
		}
		return passes;
	}

	public boolean filter_samples_matrix(Integer theGTE, Integer theLTE, boolean isNaN)
	{
		return filter_integer(this.samples_matrix, theGTE, theLTE, isNaN);
	}

	public boolean filter_samples_mutations(Integer theGTE, Integer theLTE, boolean isNaN)
	{
		return filter_integer(this.samples_mutations, theGTE, theLTE, isNaN);
	}

	public boolean filter_features_matrix(Integer theGTE, Integer theLTE, boolean isNaN)
	{
		return filter_integer(this.features_matrix, theGTE, theLTE, isNaN);
	}

	public boolean filter_features_mutations(Integer theGTE, Integer theLTE, boolean isNaN)
	{
		return filter_integer(this.features_mutations, theGTE, theLTE, isNaN);
	}

	protected boolean filter_int_list(Collection<Integer> theInts, Integer theGTE, Integer theLTE, boolean hasNone)
	{
		boolean passes = false;
		if ((hasNone) && (theInts.isEmpty()))
		{
			passes = true;
		}
		else
		{
			if ((!hasNone) && (null == theGTE) && (null == theLTE))
			{
				passes = true;
			}
			else
			{
				for (Integer myInt : theInts)
				{
					if (filter_integer(myInt, theGTE, theLTE, false))
					{
						passes = true;
					}
				}
			}
		}
		return passes;
	}

	public boolean filter_unknown_batches(Integer theGTE, Integer theLTE, boolean hasNone)
	{
		return filter_int_list(this.unknown_batches.values(), theGTE, theLTE, hasNone);
	}

	public boolean filter_batch_unique_cnt(Integer theGTE, Integer theLTE, boolean hasNone)
	{
		return filter_int_list(this.batch_unique_cnt.values(), theGTE, theLTE, hasNone);
	}

	public boolean filter_correlated_batch_types(Integer theGTE, Integer theLTE, boolean hasNone)
	{
		return filter_int_list(this.correlated_batch_types.values(), theGTE, theLTE, hasNone);
	}

	public boolean filter_batch_type_count(Integer theGTE, Integer theLTE, boolean isNaN)
	{
		return filter_integer(this.batch_type_count, theGTE, theLTE, isNaN);
	}

	@Override
	public String getJsonHeaders(boolean theIncludeAdvancedFlag)
	{
		String headers
				= "["
				+ "\n { \"title\": \"Actions\", \"render\": \"tableActionOptions\"  }"
				+ ",\n { \"title\": \"ID\", \"visible\": false  }"
				+ ",\n { \"title\": \"Source\" }"
				+ ",\n { \"title\": \"Study ID\" }"
				+ ",\n { \"title\": \"Analysis ID\" }"
				+ ",\n { \"title\": \"Category\" }"
				+ ",\n { \"title\": \"Platform\" }"
				+ ",\n { \"title\": \"Study Title\" }"
				+ ",\n { \"title\": \"Details\" }"
				+ ",\n { \"title\": \"DataSet Type\" }"
				+ ",\n { \"title\": \"Data Version\" }"
				+ ",\n { \"title\": \"Result Version\" }"
				+ (theIncludeAdvancedFlag
						? (",\n { \"title\": \"Samples Matrix Count\" }"
						+ ",\n { \"title\": \"Samples Mutations Count\" }"
						+ ",\n { \"title\": \"Features Matrix Count\" }"
						+ ",\n { \"title\": \"Features Mutations Count\" }"
						+ ",\n { \"title\": \"Unknown Batches\" }"
						+ ",\n { \"title\": \"Batch Unique Count\" }"
						+ ",\n { \"title\": \"Correlated Batch Types\" }"
						+ ",\n { \"title\": \"Batch Type Count\" }") : "")
				+ "\n]";
		return headers;
	}

	@Override
	public String getHeaders(boolean theIncludeAdvancedFlag)
	{
		String headers
				= "Actions"
				+ "\tID"
				+ "\tSource"
				+ "\tProgram"
				+ "\tProject"
				+ "\tCategory"
				+ "\tPlatform"
				+ "\tData"
				+ "\tDetails"
				+ "\tDataSet Type"
				+ "\tData Version"
				+ "\tResult Version"
				+ (theIncludeAdvancedFlag ? ("\tSamples Matrix Count"
						+ "\tSamples Mutations Count"
						+ "\tFeatures Matrix Count"
						+ "\tFeatures Mutations Count"
						+ "\tUnknown Batches"
						+ "\tBatch Unique Count"
						+ "\tCorrelated Batch Types"
						+ "\tBatch Type Count") : "");
		return headers;
	}

	private String getHashMapAsString(HashMap<String, Integer> theHashmap)
	{
		String ret = null;
		for (Entry<String, Integer> entry : theHashmap.entrySet())
		{
			if (null == ret)
			{
				ret = entry.getKey() + ":" + entry.getValue().toString();
			}
			else
			{
				ret = ret + ", " + entry.getKey() + ":" + entry.getValue().toString();
			}
		}
		return ret;
	}

	public String toString(String theDownloadBase, String theJsonQuery, boolean theIncludeAdvancedFlag) throws UnsupportedEncodingException
	{
		String myString = null;
		for (String val : getStrings(theDownloadBase, theJsonQuery, theIncludeAdvancedFlag))
		{
			if (null == myString)
			{
				myString = val;
			}
			else
			{
				myString = myString + "\t" + val;
			}
		}
		return myString;
	}

	@Override
	public ArrayList<String> getStrings(String theDownloadBase, String theJsonQuery, boolean theIncludeAdvancedFlag) throws UnsupportedEncodingException
	{
		if (null==theDownloadBase)
		{
			theDownloadBase = "/";
		}
		if (!theDownloadBase.endsWith("/"))
		{
			theDownloadBase = theDownloadBase + "/";
		}
		String downloadDataUrl = theDownloadBase + "dszipdata?id=" + id;
		String downloadResultsUrl = theDownloadBase + "dszipresults?id=" + id;;
		String newId = this.id;
		String viewResultsUrl = theDownloadBase
				+ ((null == theJsonQuery) ? 
							("view/?") : 
							("?default=" + URLEncoder.encode(theJsonQuery, StandardCharsets.UTF_8.name()) + "&"))
				+ ("id=" + newId + "&data=DATA_"+this.data_version + "&test=TEST_"+this.test_version);
		if ((null == this.path_data) || ("".equals(this.path_data)))
		{
			downloadDataUrl = "";
		}
		if ((null == this.path_results) || ("".equals(this.path_results)))
		{
			downloadResultsUrl = "";
			viewResultsUrl = "";
		}
		ArrayList<String> list = new ArrayList<>();
		list.add(downloadDataUrl + " | " + downloadResultsUrl + " | " + viewResultsUrl);
		list.add(newId);
		list.add(this.source);
		list.add(this.program);
		list.add(this.project);
		list.add(this.category);
		list.add(this.platform);
		list.add(this.data);
		list.add(this.details);
		list.add(this.job_type);
		list.add(this.data_version);
		list.add(this.test_version);
		if (theIncludeAdvancedFlag)
		{
			list.add(this.samples_matrix.toString());
			list.add(this.samples_mutations.toString());
			list.add(this.features_matrix.toString());
			list.add(this.features_mutations.toString());
			list.add(getHashMapAsString(this.unknown_batches));
			list.add(getHashMapAsString(this.batch_unique_cnt));
			list.add(getHashMapAsString(this.correlated_batch_types));
			list.add(this.batch_type_count.toString());
		}
		return list;
	}

	@Override
	public String getJson(Gson theBuilder, String theDownloadBase, boolean theIncludeAdvancedFlag) throws UnsupportedEncodingException
	{
		return theBuilder.toJson(getStrings(theDownloadBase, null, theIncludeAdvancedFlag));
	}

	@Override
	public String getId()
	{
		return this.id;
	}

	@Override
	public String getPathResults()
	{
		return this.path_results;
	}

	@Override
	public String getPathData()
	{
		return this.path_data;
	}

	@Override
	public String getSource()
	{
		return this.source;
	}

	@Override
	public String getProgram()
	{
		return this.program;
	}

	@Override
	public String getProject()
	{
		return this.project;
	}

	@Override
	public String getCategory()
	{
		return this.category;
	}

	@Override
	public String getPlatform()
	{
		return this.platform;
	}

	@Override
	public String getData()
	{
		return this.data;
	}

	@Override
	public String getDetails()
	{
		return this.details;
	}

	@Override
	public String getDataVersion()
	{
		return this.data_version;
	}

	@Override
	public String getTestVersion()
	{
		return this.test_version;
	}

	@Override
	public String getFiles()
	{
		return this.files;
	}

	@Override
	public String getAnalysisPath()
	{
		return "";
	}

	@Override
	public String getOverallDSCpvalue()
	{
		return "";
	}

	@Override
	public String getOverallDSCpvalue_Orig()
	{
		return "";
	}

	@Override
	public Double getOverallDSC_Dbl()
	{
		return null;
	}

	@Override
	public String getOverallDSC_Orig()
	{
		return "";
	}

	@Override
	public String getNegLog10PValue()
	{
		return "";
	}

	@Override
	public String getNegLog10Cutoff()
	{
		return "";
	}

	@Override
	public String getBatchesCalled()
	{
		return "";
	}

	@Override
	public String getJobType()
	{
		return this.job_type;
	}
}
