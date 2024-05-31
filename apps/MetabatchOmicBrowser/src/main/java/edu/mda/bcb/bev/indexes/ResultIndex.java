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

import edu.mda.bcb.bev.startup.LoadIndexFiles;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.TreeSet;
import jakarta.servlet.ServletContext;

/**
 *
 * @author dqs_tcga_service
 */
public class ResultIndex implements IndexMixin<ResultEntry>
{
	private TreeSet<ResultEntry> mResultEntries = null;

	public ResultIndex()
	{
		mResultEntries = new TreeSet<>();
	}

	@Override
	public TreeSet<ResultEntry> getEntries()
	{
		return mResultEntries;
	}
	
	synchronized public void loadIndex(String theIndexFile, ServletContext theSC) throws IOException
	{
		theSC.log("ResultIndex::loadIndex theIndexFile=" + theIndexFile);
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
					ResultEntry re = new ResultEntry();
					re.populate(headersIndex, splitted);
					mResultEntries.add(re);
				}
				line = br.readLine();
			}
		}
	}

	static public File findNewestFile(File theDir, String thePrefix)
	{
		File newest = null;
		TreeSet<File> fileList = new TreeSet<>();
		File[] tmp = theDir.listFiles();
		if (null != tmp)
		{
			for (File nf : tmp)
			{
				if (nf.isFile())
				{
					if (nf.getName().startsWith(thePrefix))
					{
						fileList.add(nf);
					}
				}
			}
			newest = fileList.descendingSet().first();
		}
		return newest;
	}

	static public void filterHashMapTreeSetForJson(HashMap<String, TreeSet<String>> theHashmap,
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

	static public void drilldownHashMapTreeSetForJson(HashMap<String, TreeSet<String>> theHashmap,
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
	
	// static public HashMap<String, TreeSet<String>> availableFilterJson(TreeSet<ResultEntry> theResults)
	synchronized public HashMap<String, TreeSet<String>> availableFilterJson()
	{
		HashMap<String, TreeSet<String>> hm = new HashMap<>();
		//for(ResultEntry re: theResults)
		for (ResultEntry re : mResultEntries)
		{
			filterHashMapTreeSetForJson(hm, "availableDataVersions", re.data_version);
			filterHashMapTreeSetForJson(hm, "availableTestVersions", re.test_version);
			filterHashMapTreeSetForJson(hm, "availableSources", re.source);
			filterHashMapTreeSetForJson(hm, "availableProgram", re.program);
			filterHashMapTreeSetForJson(hm, "availableProjects", re.project);
			filterHashMapTreeSetForJson(hm, "availableCategories", re.category);
			filterHashMapTreeSetForJson(hm, "availablePlatforms", re.platform);
			filterHashMapTreeSetForJson(hm, "availableData", re.data);
			filterHashMapTreeSetForJson(hm, "availableDetails", re.details);
			filterHashMapTreeSetForJson(hm, "availableJobType", re.job_type);
		}
		return hm;
	}

	// static public HashMap<String, TreeSet<String>> availableFilterJson(TreeSet<ResultEntry> theResults)
	synchronized public HashMap<String, TreeSet<String>> availableDrilldownJson()
	{
		HashMap<String, TreeSet<String>> hm = new HashMap<>();
		//for(ResultEntry re: theResults)
		for (ResultEntry re : mResultEntries)
		{
			drilldownHashMapTreeSetForJson(hm, "availableSources", re.source);
			drilldownHashMapTreeSetForJson(hm, "availableProgram", re.program);
			drilldownHashMapTreeSetForJson(hm, "availableProjects", re.project);
			drilldownHashMapTreeSetForJson(hm, "availableCategories", re.category);
			drilldownHashMapTreeSetForJson(hm, "availablePlatforms", re.platform);
			drilldownHashMapTreeSetForJson(hm, "availableData", re.data);
			drilldownHashMapTreeSetForJson(hm, "availableDetails", re.details);
			drilldownHashMapTreeSetForJson(hm, "availableJobType", re.job_type);
			drilldownHashMapTreeSetForJson(hm, "availableDataVersions", re.data_version);
			drilldownHashMapTreeSetForJson(hm, "availableTestVersions", re.test_version);
		}
		return hm;
	}

	synchronized public TreeSet<ResultEntry> filter(
			ArrayList<String> theValues_data_version, ArrayList<String> theValues_test_version, 
			ArrayList<String> theValues_source, ArrayList<String> theValues_program,
			ArrayList<String> theValues_project, ArrayList<String> theValues_category,
			ArrayList<String> theValues_platform, ArrayList<String> theValues_data,
			ArrayList<String> theValues_details, ArrayList<String> theValues_jobtype,
			Integer theGTE_samples_matrix, Integer theLTE_samples_matrix, boolean isNaN_samples_matrix,
			Integer theGTE_samples_mutations, Integer theLTE_samples_mutations, boolean isNaN_samples_mutations,
			Integer theGTE_features_matrix, Integer theLTE_features_matrix, boolean isNaN_features_matrix,
			Integer theGTE_features_mutations, Integer theLTE_features_mutations, boolean isNaN_features_mutations,
			Integer theGTE_unknown_batches, Integer theLTE_unknown_batches, boolean isNaN_unknown_batches,
			Integer theGTE_batch_unique_cnt, Integer theLTE_batch_unique_cnt, boolean isNaN_batch_unique_cnt,
			Integer theGTE_correlated_batch_types, Integer theLTE_correlated_batch_types, boolean isNaN_correlated_batch_types,
			Integer theGTE_batch_type_count, Integer theLTE_batch_type_count, boolean isNaN_batch_type_count)
	{
		TreeSet<ResultEntry> filtered = new TreeSet<>();
		// Note: mResultEntries is private, but is usable within this static function
		for (ResultEntry re : LoadIndexFiles.M_RESULT_INDEX.mResultEntries)
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
					&& re.filter_samples_matrix(theGTE_samples_matrix, theLTE_samples_matrix, isNaN_samples_matrix)
					&& re.filter_samples_mutations(theGTE_samples_mutations, theLTE_samples_mutations, isNaN_samples_mutations)
					&& re.filter_features_matrix(theGTE_features_matrix, theLTE_features_matrix, isNaN_features_matrix)
					&& re.filter_features_mutations(theGTE_features_mutations, theLTE_features_mutations, isNaN_features_mutations)
					&& re.filter_unknown_batches(theGTE_unknown_batches, theLTE_unknown_batches, isNaN_unknown_batches)
					&& re.filter_batch_unique_cnt(theGTE_batch_unique_cnt, theLTE_batch_unique_cnt, isNaN_batch_unique_cnt)
					&& re.filter_correlated_batch_types(theGTE_correlated_batch_types, theLTE_correlated_batch_types, isNaN_correlated_batch_types)
					&& re.filter_batch_type_count(theGTE_batch_type_count, theLTE_batch_type_count, isNaN_batch_type_count))
			{
				filtered.add(re);
			}
		}
		return filtered;
	}

	synchronized public TreeSet<ResultEntry> drilldown(
			ArrayList<String> theValues_source, ArrayList<String> theValues_program,
			ArrayList<String> theValues_project, ArrayList<String> theValues_category,
			ArrayList<String> theValues_platform, ArrayList<String> theValues_data,
			ArrayList<String> theValues_details, ArrayList<String> theValues_jobtype,
			ArrayList<String> theValues_data_version, ArrayList<String> theValues_test_version)
	{
		TreeSet<ResultEntry> filtered = new TreeSet<>();
		// Note: mResultEntries is private, but is usable within this static function
		for (ResultEntry re : LoadIndexFiles.M_RESULT_INDEX.mResultEntries)
		{
			if (re.filter_source(theValues_source)
					&& re.filter_program(theValues_program)
					&& re.filter_project(theValues_project)
					&& re.filter_category(theValues_category)
					&& re.filter_platform(theValues_platform)
					&& re.filter_data(theValues_data)
					&& re.filter_details(theValues_details)
					&& re.filter_jobtype(theValues_jobtype)
					&& re.filter_data_version(theValues_data_version)
					&& re.filter_test_version(theValues_test_version))
			{
				filtered.add(re);
			}
		}
		return filtered;
	}
}
