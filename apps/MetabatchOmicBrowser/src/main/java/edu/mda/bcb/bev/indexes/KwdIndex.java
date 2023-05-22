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

import edu.mda.bcb.bev.startup.LoadIndexFiles;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.TreeSet;
import javax.servlet.ServletContext;

/**
 *
 * @author Tod_Casasent
 */
public class KwdIndex implements IndexMixin<KwdEntry>
{
	private TreeSet<KwdEntry> mKwdEntries = null;

	public KwdIndex()
	{
		mKwdEntries = new TreeSet<>();
	}

	@Override
	public TreeSet<KwdEntry> getEntries()
	{
		return mKwdEntries;
	}

	synchronized public void loadIndex(String theIndexFile, ServletContext theSC) throws IOException
	{
		// find newest ResultSets_*.tsv file (sort * is timestamp)
		theSC.log("ResultIndex::loadIndex indexFile=" + theIndexFile);
		// load index
		try (BufferedReader br = java.nio.file.Files.newBufferedReader(new File(theIndexFile).toPath(), Charset.availableCharsets().get("UTF-8")))
		{
			ArrayList<String> headersIndex = null;
			//long lineCount = 0;
			String line = br.readLine();
			while (null != line)
			{
				//theSC.log("ResultIndex::loadIndex lineCount=" + lineCount);
				//lineCount += 1;
				if (null == headersIndex)
				{
					//theSC.log("ResultIndex::loadIndex line=" + line);
					String[] splitted = line.split("\t", -1);
					headersIndex = new ArrayList<>();
					for (String hdr : splitted)
					{
						//theSC.log("ResultIndex::loadIndex headers[" + headersIndex.size() + "]=" + hdr);
						headersIndex.add(hdr);
					}
					theSC.log("ResultIndex::loadIndex headersIndex.size()=" + headersIndex.size());
				}
				else
				{
					//theSC.log("Indexes::loadFromFiles processing line " + counter);
					String[] splitted = line.split("\t", -1);
					// theSC.log("ResultIndex::loadIndex splitted.length=" + splitted.length);
					KwdEntry re = new KwdEntry();
					re.populate(headersIndex, splitted);
					mKwdEntries.add(re);
				}
				line = br.readLine();
			}
		}
	}

	static public void updateHashMapTreeSetForJson(HashMap<String, TreeSet<String>> theHashmap,
			String theKey, String theValue)
	{
		if ((null != theValue) && (!"".equals(theValue)))
		{
			TreeSet<String> ts = theHashmap.get(theKey);
			if (null == ts)
			{
				ts = new TreeSet<>();
			}
			ts.add(theValue);
			theHashmap.put(theKey, ts);
		}
	}

	// static public HashMap<String, TreeSet<String>> availableJson(TreeSet<KwdEntry> theResults)
	synchronized public HashMap<String, TreeSet<String>> availableJson()
	{
		HashMap<String, TreeSet<String>> hm = new HashMap<>();
		//for(KwdEntry re: theResults)
		for (KwdEntry re : mKwdEntries)
		{
			updateHashMapTreeSetForJson(hm, "availableDataVersions", re.data_version);
			updateHashMapTreeSetForJson(hm, "availableTestVersions", re.test_version);
			updateHashMapTreeSetForJson(hm, "availableSources", re.source);
			updateHashMapTreeSetForJson(hm, "availableProgram", re.program);
			updateHashMapTreeSetForJson(hm, "availableProjects", re.project);
			updateHashMapTreeSetForJson(hm, "availableCategories", re.category);
			updateHashMapTreeSetForJson(hm, "availablePlatforms", re.platform);
			updateHashMapTreeSetForJson(hm, "availableData", re.data);
			updateHashMapTreeSetForJson(hm, "availableDetails", re.details);
			updateHashMapTreeSetForJson(hm, "availableJobType", re.job_type);
			updateHashMapTreeSetForJson(hm, "availableAnalysisPath", re.analysis_path);
			updateHashMapTreeSetForJson(hm, "availableNegLog10PValue", re.NegLog10PValue);
			updateHashMapTreeSetForJson(hm, "availableNegLog10Cutoff", re.NegLog10Cutoff);
			updateHashMapTreeSetForJson(hm, "availableBatchesCalled", re.BatchesCalled);
		}
		return hm;
	}

	synchronized public TreeSet<KwdEntry> filter(
			ArrayList<String> theValues_data_version, ArrayList<String> theValues_test_version,
			ArrayList<String> theValues_source, ArrayList<String> theValues_program,
			ArrayList<String> theValues_project, ArrayList<String> theValues_category,
			ArrayList<String> theValues_platform, ArrayList<String> theValues_data,
			ArrayList<String> theValues_details, ArrayList<String> theValues_jobtype, 
			ArrayList<String> theValues_analysis_path,
			boolean theCutoffFlag, boolean theBatchesCalledFlag)
	{
		TreeSet<KwdEntry> filtered = new TreeSet<>();
		// Note: mKwdEntries is private, but is usable within this static function
		for (KwdEntry re : LoadIndexFiles.M_KWD_INDEX.mKwdEntries)
		{
			if (re.filter_data_version(theValues_data_version)
					&& re.filter_test_version(theValues_test_version)
					&& re.filter_source(theValues_source)
					&& re.filter_program(theValues_program)
					&& re.filter_project(theValues_project)
					&& re.filter_category(theValues_category)
					&& re.filter_platform(theValues_platform)
					&& re.filter_data(theValues_data)
					&& re.filter_details(theValues_details)
					&& re.filter_jobtype(theValues_jobtype)
					&& re.filter_analysis_path(theValues_analysis_path)
					&& re.filter_cutoff(theCutoffFlag)
					&& re.filter_batchescalled(theBatchesCalledFlag))
			{
				filtered.add(re);
			}
		}
		return filtered;
	}
}
