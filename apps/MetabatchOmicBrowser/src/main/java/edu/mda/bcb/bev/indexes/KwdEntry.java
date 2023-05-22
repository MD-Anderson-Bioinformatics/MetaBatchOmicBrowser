/*
 *  Copyright (c) 2011-2022 University of Texas MD Anderson Cancer Center
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

/**
 *
 * @author Tod_Casasent
 */
public class KwdEntry extends EntryMixin
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
	public String analysis_path = "";		// select on contents
	public String NegLog10PValue = "";		// select on contents
	public String NegLog10Cutoff = "";		// select on contents
	public String BatchesCalled = "";		// select on contents (pipe delimited)
	public String job_type = "";

	public KwdEntry()
	{
		//
	}

	public void populate(ArrayList<String> theHeaders, String[] theRow)
	{
		// PathResults	PathData	ID	Source	Program	Project	Category	Platform	Data	Details	DataVersion	TestVersion
		// AnalysisPath	NegLog10PValue	NegLog10Cutoff	BatchesCalled
		path_data = theRow[theHeaders.indexOf("PathResults")];
		path_results = theRow[theHeaders.indexOf("PathData")];
		id = theRow[theHeaders.indexOf("ID")];
		source = theRow[theHeaders.indexOf("Source")];
		program = theRow[theHeaders.indexOf("Program")];
		project = theRow[theHeaders.indexOf("Project")];
		category = theRow[theHeaders.indexOf("Category")];
		platform = theRow[theHeaders.indexOf("Platform")];
		data = theRow[theHeaders.indexOf("Data")];
		details = theRow[theHeaders.indexOf("Details")];
		data_version = theRow[theHeaders.indexOf("DataVersion")];
		test_version = theRow[theHeaders.indexOf("TestVersion")];
		analysis_path = theRow[theHeaders.indexOf("AnalysisPath")];
		NegLog10PValue = theRow[theHeaders.indexOf("NegLog10PValue")];
		NegLog10Cutoff = theRow[theHeaders.indexOf("NegLog10Cutoff")];
		BatchesCalled = theRow[theHeaders.indexOf("BatchesCalled")];
		//
		job_type = theRow[theHeaders.indexOf("job_type")];
	}

	protected boolean filter_strings(String theValue, ArrayList<String> theValues)
	{
		boolean passes = false;
		if ((theValues.isEmpty()) || (theValues.contains(theValue)))
		{
			passes = true;
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

	public boolean filter_analysis_path(ArrayList<String> theValues)
	{
		return filter_strings(this.analysis_path, theValues);
	}

	public boolean filter_cutoff(boolean theFlag)
	{
		return theFlag ? (Float.valueOf(this.NegLog10PValue) >= Float.valueOf(this.NegLog10Cutoff)) : true;
	}

	public boolean filter_batchescalled(boolean theFlag)
	{
		return theFlag ? (!this.BatchesCalled.equals("")) : true;
	}

	@Override
	public String getJsonHeaders(boolean theIncludeAdvancedFlag)
	{
		String headers
				= "["
				+ "\n { \"title\": \"Actions\", \"render\": \"tableActionOptions\"  },"
				+ "\n { \"title\": \"ID\", \"visible\": false  },"
				+ "\n { \"title\": \"Source\" },"
				+ "\n { \"title\": \"Study ID\" },"
				+ "\n { \"title\": \"Analysis ID\" },"
				+ "\n { \"title\": \"Category\" },"
				+ "\n { \"title\": \"Platform\" },"
				+ "\n { \"title\": \"Study Title\" },"
				+ "\n { \"title\": \"Details\" },"
				+ "\n { \"title\": \"Data Version\" },"
				+ "\n { \"title\": \"Test Version\" },"
				+ "\n { \"title\": \"DataSet Type\" },"
				+ "\n { \"title\": \"Analysis Path\" },"
				+ "\n { \"title\": \"Negative Log 10 P-Value\" },"
				+ "\n { \"title\": \"Batches Called\" },"
				+ "\n { \"title\": \"Negative Log 10 Cutoff\" }"
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
				+ "\tData Version"
				+ "\tTest Version"
				+ "\tDataSet Type"
				+ "\tAnalysis Path"
				+ "\tNegative Log 10 P-Value"
				+ "\tBatches Called"
				+ "\tNegative Log 10 Cutoff";
		return headers;
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
		String downloadResultsUrl = theDownloadBase + "dszipresults?id=" + id;
		String newId = this.id;
		if ((null != this.analysis_path) && (!"".equals(this.analysis_path)))
		{
			newId = newId + "-" + this.analysis_path;
		}
		String viewResultsUrl = theDownloadBase
				+ ((null == theJsonQuery) ? ("view/?") : ("?default=" + URLEncoder.encode(theJsonQuery, StandardCharsets.UTF_8.name()) + "&"))
				+ "id=" + newId + Indexes.convertAnalysisPathToLink(this.analysis_path);
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
		list.add(this.data_version);
		list.add(this.test_version);
		list.add(this.job_type);
		list.add(this.analysis_path);
		list.add(this.NegLog10PValue);
		list.add(this.BatchesCalled);
		list.add(this.NegLog10Cutoff);
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
		return "";
	}

	@Override
	public String getAnalysisPath()
	{
		return this.analysis_path;
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
		return this.NegLog10PValue;
	}

	@Override
	public String getNegLog10Cutoff()
	{
		return this.NegLog10Cutoff;
	}

	@Override
	public String getBatchesCalled()
	{
		return this.BatchesCalled;
	}

	@Override
	public String getJobType()
	{
		return this.job_type;
	}
}
