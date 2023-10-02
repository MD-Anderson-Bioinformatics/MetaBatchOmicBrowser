// Copyright (c) 2011-2022 University of Texas MD Anderson Cancer Center
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// MD Anderson Cancer Center Bioinformatics on GitHub <https://github.com/MD-Anderson-Bioinformatics>
// MD Anderson Cancer Center Bioinformatics at MDA <https://www.mdanderson.org/research/departments-labs-institutes/departments-divisions/bioinformatics-and-computational-biology.html>
package edu.mda.bcb.bev.indexes;

import edu.mda.bcb.bev.query.Dataset;
import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import jakarta.servlet.ServletContext;

/**
 *
 * @author Tod-Casasent
 */
public class Indexes
{
	private IndexMixin mIndex = null;
	private TreeMap<String, Dataset> mIdToDataset = null;
	private TreeSet<String> mNewestIds = null;
	private TreeMap<String, String> mIdToDataPath = null;
	private TreeMap<String, String> mIdToResultsPath = null;
	private TreeMap<String, ArrayList<String>> mFileToIDs = null;
	private TreeMap<String, ArrayList<String>> mSourceToIDs = null;
	private TreeMap<String, ArrayList<String>> mProgramToIDs = null;
	private TreeMap<String, ArrayList<String>> mProjectToIDs = null;
	private TreeMap<String, ArrayList<String>> mCategoryToIDs = null;
	private TreeMap<String, ArrayList<String>> mPlatformToIDs = null;
	private TreeMap<String, ArrayList<String>> mDataToIDs = null;
	private TreeMap<String, ArrayList<String>> mDetailToIDs = null;
	private TreeMap<String, ArrayList<String>> mDataVersionToIDs = null;
	private TreeMap<String, ArrayList<String>> mTestVersionToIDs = null;
	private TreeMap<String, ArrayList<String>> mJobtypeToIDs = null;
	// Overall-DSC	Overall-DSC-pvalue
	private TreeMap<String, ArrayList<String>> mOverallDSCpvalueToIDs = null;
	// no index path
	private String mNoIndexPath = null;

	public Indexes(IndexMixin theIndex)
	{
		mIndex = theIndex;
		mIdToDataset = new TreeMap<>();
		mNewestIds = new TreeSet<>();
		mIdToDataPath = new TreeMap<>();
		mIdToResultsPath = new TreeMap<>();
		mFileToIDs = new TreeMap<>();
		mSourceToIDs = new TreeMap<>();
		mProgramToIDs = new TreeMap<>();
		mProjectToIDs = new TreeMap<>();
		mCategoryToIDs = new TreeMap<>();
		mPlatformToIDs = new TreeMap<>();
		mDataToIDs = new TreeMap<>();
		mDetailToIDs = new TreeMap<>();
		mDataVersionToIDs = new TreeMap<>();
		mTestVersionToIDs = new TreeMap<>();
		mOverallDSCpvalueToIDs = new TreeMap<>();
		mJobtypeToIDs = new TreeMap<>();
	}
	
	private String cleanId(String theId)
	{
		long count = theId.chars().filter(ch -> ch == '~').count();
		if (count>2)
		{
			theId = theId.substring(0,theId.lastIndexOf("~"));
		}
		return theId;
	}

	synchronized public File getDataPath(String theId)
	{
		File result = null;
		if (null!=mNoIndexPath)
		{
			result = new File(mNoIndexPath, cleanId(theId) + "-data.zip");
		}
		else
		{
			result = new File(mIdToDataPath.get(cleanId(theId)));
		}
		return result;
	}

	synchronized public File getResultsPath(String theId)
	{
		File result = null;
		if (null!=mNoIndexPath)
		{
			result = new File(mNoIndexPath, cleanId(theId) + "-results.zip");
		}
		else
		{
			result = new File(mIdToResultsPath.get(cleanId(theId)));
		}
		return result;
	}

	public String roundToThreeDigits(String theString)
	{
		String retStr = theString;
		try
		{
			double myDbl = Double.parseDouble(theString);
			DecimalFormat df = new DecimalFormat("0.000");
			df.setRoundingMode(RoundingMode.HALF_UP);
			retStr = df.format(myDbl);
		}
		catch (Exception ignore)
		{
			// ignore errors, and keep original string
			retStr = theString;
		}
		return retStr;
	}
	
	public void noIndex(String thePath)
	{
		// M_BEI_DATA_DIR
		mNoIndexPath = thePath;
	}

	synchronized public void loadIndex(ServletContext theSC) throws IOException, Exception
	{
		TreeSet<Dataset> datasets = new TreeSet<>();
		TreeSet<EntryMixin> ts = mIndex.getEntries();
		for (EntryMixin entry : ts.descendingSet())
		{
			// required values
			String newId = populateId(entry);
			//theSC.log("Indexes::loadFromFiles newId " + newId);
			ArrayList<String> files = populateSplittedMap(newId, entry, mFileToIDs, "\\|");
			// last three nulls in populateMap are used for converting strings (not currently used)
			populateMap(newId, entry.getSource(), mSourceToIDs, null, null, null);
			populateMap(newId, entry.getProgram(), mProgramToIDs, null, null, null);
			populateMap(newId, entry.getProject(), mProjectToIDs, null, null, null);
			populateMap(newId, entry.getCategory(), mCategoryToIDs, null, null, null);
			populateMap(newId, entry.getPlatform(), mPlatformToIDs, null, null, null);
			populateMap(newId, entry.getData(), mDataToIDs, null, null, null);
			populateMap(newId, entry.getDetails(), mDetailToIDs, null, null, null);
			populateMap(newId, entry.getDataVersion(), mDataVersionToIDs, null, null, null);
			populateMap(newId, entry.getTestVersion(), mTestVersionToIDs, null, null, null);
			populateMap(newId, entry.getJobType(), mJobtypeToIDs, null, null, null);
			// optional values
			String overallDSCpvalue_range = convertToDSCpvalueRange(entry.getOverallDSCpvalue_Orig());
			if (null != overallDSCpvalue_range)
			{
				addToPopulateMapForDSCpvalue(newId, overallDSCpvalue_range, mOverallDSCpvalueToIDs);
			}
			// make dataset
			long dsSize1 = datasets.size();
			Dataset ds = new Dataset(newId, files, overallDSCpvalue_range, entry);
			datasets.add(ds);
			long dsSize2 = datasets.size();
			if (dsSize2 <= dsSize1)
			{
				System.err.println("Size did not increase");
			}
		}
		// copy datasets to lists
		Dataset oldDs = null;
		for (Dataset newDs : datasets)
		{
			mIdToDataset.put(newDs.mID, newDs);
			if ((null != oldDs) && (false == newDs.isSameExceptForVersion(oldDs)))
			{
				mNewestIds.add(oldDs.mID);
			}
			oldDs = newDs;
		}
		if (null != oldDs)
		{
			mNewestIds.add(oldDs.mID);
		}
	}

	protected String convertToDSC_min(String theOrig)
	{
		// DSC Value
		// NA
		// Unknown
		// >0.900
		// >0.800
		// >0.700
		// ...
		// >0.100
		// >0.000
		String newValue = null;
		if (null != theOrig)
		{
			float val = Float.valueOf(theOrig);
			if (val > 0.900)
			{
				newValue = "0.900";
			}
			else
			{
				if (val > 0.800)
				{
					newValue = "0.800";
				}
				else
				{
					if (val > 0.700)
					{
						newValue = "0.700";
					}
					else
					{
						if (val > 0.600)
						{
							newValue = "0.600";
						}
						else
						{
							if (val > 0.500)
							{
								newValue = "0.500";
							}
							else
							{
								if (val > 0.400)
								{
									newValue = "0.400";
								}
								else
								{
									if (val > 0.300)
									{
										newValue = "0.300";
									}
									else
									{
										if (val > 0.200)
										{
											newValue = "0.200";
										}
										else
										{
											if (val > 0.100)
											{
												newValue = "0.100";
											}
											else
											{
												if (val > 0.000)
												{
													newValue = "0.000";
												}
												else
												{
													newValue = "Unknown";
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return newValue;
	}

	protected String convertToDSCpvalueRange(String theOrig)
	{
		// P-Value
		// NA
		// Unknown
		// <1.0000
		// <0.5000
		// <0.1000
		// <0.0500
		// <0.0100
		// <0.0050
		// <0.0010
		// <0.0005
		String newValue = null;
		if ((null != theOrig)&&(!"".equals(theOrig)))
		{
			if ("<0.0005".equals(theOrig))
			{
				newValue = "<0.0005";
			}
			else
			{
				float val = Float.valueOf(theOrig);
				if (val < 0.0005)
				{
					newValue = "<0.0005";
				}
				else
				{
					if (val < 0.0010)
					{
						newValue = "<0.0010";
					}
					else
					{
						if (val < 0.0050)
						{
							newValue = "<0.0050";
						}
						else
						{
							if (val < 0.0100)
							{
								newValue = "<0.0100";
							}
							else
							{
								if (val < 0.0500)
								{
									newValue = "<0.0500";
								}
								else
								{
									if (val < 0.1000)
									{
										newValue = "<0.1000";
									}
									else
									{
										if (val < 0.5000)
										{
											newValue = "<0.5000";
										}
										else
										{
											newValue = "Unknown";
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return newValue;
	}

	protected String populateId(EntryMixin theEntry) throws Exception
	{
		String dataPath = theEntry.getPathData();
		String resultsPath = theEntry.getPathResults();
		String id = theEntry.getId();
		String analysisPath = theEntry.getAnalysisPath();
		if ((null != analysisPath)&&(!"".equals(analysisPath)))
		{
			id = id + "-" + analysisPath;
		}
		mIdToDataPath.put(id, dataPath);
		// String replaceData = mIdToDataPath.put(id, dataPath);
		// This is no longer an error, as different runs on same data will give same path
		// if (null != replaceData)
		// {
		// 	throw new Exception("populateId found duplicate data path value for id=" + id);
		// }
		mIdToResultsPath.put(id, resultsPath);
		// String replaceResults = mIdToResultsPath.put(id, resultsPath);
		// This is no longer an error, as different runs on same data will give same path
		// if (null != replaceResults)
		// {
		// 	throw new Exception("populateId found duplicate results path value for id=" + id);
		// }
		return id;
	}

	protected void addToPopulateMapDSCmin(String theNewId, String theValue, TreeMap<String, ArrayList<String>> theMap)
	{
		if ("0.000".equals(theValue))
		{
			addToPopulateMap(theNewId, "0.000", theMap);
		}
		else
		{
			if ("0.100".equals(theValue))
			{
				addToPopulateMap(theNewId, "0.000", theMap);
				addToPopulateMap(theNewId, "0.100", theMap);
			}
			else
			{
				if ("0.200".equals(theValue))
				{
					addToPopulateMap(theNewId, "0.000", theMap);
					addToPopulateMap(theNewId, "0.100", theMap);
					addToPopulateMap(theNewId, "0.200", theMap);
				}
				else
				{
					if ("0.300".equals(theValue))
					{
						addToPopulateMap(theNewId, "0.000", theMap);
						addToPopulateMap(theNewId, "0.100", theMap);
						addToPopulateMap(theNewId, "0.200", theMap);
						addToPopulateMap(theNewId, "0.300", theMap);
					}
					else
					{
						if ("0.400".equals(theValue))
						{
							addToPopulateMap(theNewId, "0.000", theMap);
							addToPopulateMap(theNewId, "0.100", theMap);
							addToPopulateMap(theNewId, "0.200", theMap);
							addToPopulateMap(theNewId, "0.300", theMap);
							addToPopulateMap(theNewId, "0.400", theMap);
						}
						else
						{
							if ("0.500".equals(theValue))
							{
								addToPopulateMap(theNewId, "0.000", theMap);
								addToPopulateMap(theNewId, "0.100", theMap);
								addToPopulateMap(theNewId, "0.200", theMap);
								addToPopulateMap(theNewId, "0.300", theMap);
								addToPopulateMap(theNewId, "0.400", theMap);
								addToPopulateMap(theNewId, "0.500", theMap);
							}
							else
							{
								if ("0.600".equals(theValue))
								{
									addToPopulateMap(theNewId, "0.000", theMap);
									addToPopulateMap(theNewId, "0.100", theMap);
									addToPopulateMap(theNewId, "0.200", theMap);
									addToPopulateMap(theNewId, "0.300", theMap);
									addToPopulateMap(theNewId, "0.400", theMap);
									addToPopulateMap(theNewId, "0.500", theMap);
									addToPopulateMap(theNewId, "0.600", theMap);
								}
								else
								{
									if ("0.700".equals(theValue))
									{
										addToPopulateMap(theNewId, "0.000", theMap);
										addToPopulateMap(theNewId, "0.100", theMap);
										addToPopulateMap(theNewId, "0.200", theMap);
										addToPopulateMap(theNewId, "0.300", theMap);
										addToPopulateMap(theNewId, "0.400", theMap);
										addToPopulateMap(theNewId, "0.500", theMap);
										addToPopulateMap(theNewId, "0.600", theMap);
										addToPopulateMap(theNewId, "0.700", theMap);
									}
									else
									{
										if ("0.800".equals(theValue))
										{
											addToPopulateMap(theNewId, "0.000", theMap);
											addToPopulateMap(theNewId, "0.100", theMap);
											addToPopulateMap(theNewId, "0.200", theMap);
											addToPopulateMap(theNewId, "0.300", theMap);
											addToPopulateMap(theNewId, "0.400", theMap);
											addToPopulateMap(theNewId, "0.500", theMap);
											addToPopulateMap(theNewId, "0.600", theMap);
											addToPopulateMap(theNewId, "0.700", theMap);
											addToPopulateMap(theNewId, "0.800", theMap);
										}
										else
										{
											if ("0.900".equals(theValue))
											{
												addToPopulateMap(theNewId, "0.000", theMap);
												addToPopulateMap(theNewId, "0.100", theMap);
												addToPopulateMap(theNewId, "0.200", theMap);
												addToPopulateMap(theNewId, "0.300", theMap);
												addToPopulateMap(theNewId, "0.400", theMap);
												addToPopulateMap(theNewId, "0.500", theMap);
												addToPopulateMap(theNewId, "0.600", theMap);
												addToPopulateMap(theNewId, "0.700", theMap);
												addToPopulateMap(theNewId, "0.800", theMap);
												addToPopulateMap(theNewId, "0.900", theMap);
											}
											else
											{
												addToPopulateMap(theNewId, theValue, theMap);
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	protected void addToPopulateMapDSCmax(String theNewId, String theValue, TreeMap<String, ArrayList<String>> theMap)
	{
		if ("0.100".equals(theValue))
		{
			addToPopulateMap(theNewId, "0.100", theMap);
			addToPopulateMap(theNewId, "0.200", theMap);
			addToPopulateMap(theNewId, "0.300", theMap);
			addToPopulateMap(theNewId, "0.400", theMap);
			addToPopulateMap(theNewId, "0.500", theMap);
			addToPopulateMap(theNewId, "0.600", theMap);
			addToPopulateMap(theNewId, "0.700", theMap);
			addToPopulateMap(theNewId, "0.800", theMap);
			addToPopulateMap(theNewId, "0.900", theMap);
			addToPopulateMap(theNewId, "1.000", theMap);
		}
		else
		{
			if ("0.200".equals(theValue))
			{
				addToPopulateMap(theNewId, "0.200", theMap);
				addToPopulateMap(theNewId, "0.300", theMap);
				addToPopulateMap(theNewId, "0.400", theMap);
				addToPopulateMap(theNewId, "0.500", theMap);
				addToPopulateMap(theNewId, "0.600", theMap);
				addToPopulateMap(theNewId, "0.700", theMap);
				addToPopulateMap(theNewId, "0.800", theMap);
				addToPopulateMap(theNewId, "0.900", theMap);
				addToPopulateMap(theNewId, "1.000", theMap);
			}
			else
			{
				if ("0.300".equals(theValue))
				{
					addToPopulateMap(theNewId, "0.300", theMap);
					addToPopulateMap(theNewId, "0.400", theMap);
					addToPopulateMap(theNewId, "0.500", theMap);
					addToPopulateMap(theNewId, "0.600", theMap);
					addToPopulateMap(theNewId, "0.700", theMap);
					addToPopulateMap(theNewId, "0.800", theMap);
					addToPopulateMap(theNewId, "0.900", theMap);
					addToPopulateMap(theNewId, "1.000", theMap);
				}
				else
				{
					if ("0.400".equals(theValue))
					{
						addToPopulateMap(theNewId, "0.400", theMap);
						addToPopulateMap(theNewId, "0.500", theMap);
						addToPopulateMap(theNewId, "0.600", theMap);
						addToPopulateMap(theNewId, "0.700", theMap);
						addToPopulateMap(theNewId, "0.800", theMap);
						addToPopulateMap(theNewId, "0.900", theMap);
						addToPopulateMap(theNewId, "1.000", theMap);
					}
					else
					{
						if ("0.500".equals(theValue))
						{
							addToPopulateMap(theNewId, "0.500", theMap);
							addToPopulateMap(theNewId, "0.600", theMap);
							addToPopulateMap(theNewId, "0.700", theMap);
							addToPopulateMap(theNewId, "0.800", theMap);
							addToPopulateMap(theNewId, "0.900", theMap);
							addToPopulateMap(theNewId, "1.000", theMap);
						}
						else
						{
							if ("0.600".equals(theValue))
							{
								addToPopulateMap(theNewId, "0.600", theMap);
								addToPopulateMap(theNewId, "0.700", theMap);
								addToPopulateMap(theNewId, "0.800", theMap);
								addToPopulateMap(theNewId, "0.900", theMap);
								addToPopulateMap(theNewId, "1.000", theMap);
							}
							else
							{
								if ("0.700".equals(theValue))
								{
									addToPopulateMap(theNewId, "0.700", theMap);
									addToPopulateMap(theNewId, "0.800", theMap);
									addToPopulateMap(theNewId, "0.900", theMap);
									addToPopulateMap(theNewId, "1.000", theMap);
								}
								else
								{
									if ("0.800".equals(theValue))
									{
										addToPopulateMap(theNewId, "0.800", theMap);
										addToPopulateMap(theNewId, "0.900", theMap);
										addToPopulateMap(theNewId, "1.000", theMap);
									}
									else
									{
										if ("0.900".equals(theValue))
										{
											addToPopulateMap(theNewId, "0.900", theMap);
											addToPopulateMap(theNewId, "1.000", theMap);
										}
										else
										{
											if ("1.000".equals(theValue))
											{
												addToPopulateMap(theNewId, "1.000", theMap);
											}
											else
											{
												addToPopulateMap(theNewId, theValue, theMap);
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	protected void addToPopulateMapForDSCpvalue(String theNewId, String theValue, TreeMap<String, ArrayList<String>> theMap)
	{
		if ("<0.0005".equals(theValue))
		{
			addToPopulateMap(theNewId, "<1.0000", theMap);
			addToPopulateMap(theNewId, "<0.5000", theMap);
			addToPopulateMap(theNewId, "<0.1000", theMap);
			addToPopulateMap(theNewId, "<0.0500", theMap);
			addToPopulateMap(theNewId, "<0.0100", theMap);
			addToPopulateMap(theNewId, "<0.0050", theMap);
			addToPopulateMap(theNewId, "<0.0010", theMap);
			addToPopulateMap(theNewId, "<0.0005", theMap);
		}
		else
		{
			if ("<0.0010".equals(theValue))
			{
				addToPopulateMap(theNewId, "<1.0000", theMap);
				addToPopulateMap(theNewId, "<0.5000", theMap);
				addToPopulateMap(theNewId, "<0.1000", theMap);
				addToPopulateMap(theNewId, "<0.0500", theMap);
				addToPopulateMap(theNewId, "<0.0100", theMap);
				addToPopulateMap(theNewId, "<0.0050", theMap);
				addToPopulateMap(theNewId, "<0.0010", theMap);
			}
			else
			{
				if ("<0.0050".equals(theValue))
				{
					addToPopulateMap(theNewId, "<1.0000", theMap);
					addToPopulateMap(theNewId, "<0.5000", theMap);
					addToPopulateMap(theNewId, "<0.1000", theMap);
					addToPopulateMap(theNewId, "<0.0500", theMap);
					addToPopulateMap(theNewId, "<0.0100", theMap);
					addToPopulateMap(theNewId, "<0.0050", theMap);
				}
				else
				{
					if ("<0.0100".equals(theValue))
					{
						addToPopulateMap(theNewId, "<1.0000", theMap);
						addToPopulateMap(theNewId, "<0.5000", theMap);
						addToPopulateMap(theNewId, "<0.1000", theMap);
						addToPopulateMap(theNewId, "<0.0500", theMap);
						addToPopulateMap(theNewId, "<0.0100", theMap);
					}
					else
					{
						if ("<0.0500".equals(theValue))
						{
							addToPopulateMap(theNewId, "<1.0000", theMap);
							addToPopulateMap(theNewId, "<0.5000", theMap);
							addToPopulateMap(theNewId, "<0.1000", theMap);
							addToPopulateMap(theNewId, "<0.0500", theMap);
						}
						else
						{
							if ("<0.1000".equals(theValue))
							{
								addToPopulateMap(theNewId, "<1.0000", theMap);
								addToPopulateMap(theNewId, "<0.5000", theMap);
								addToPopulateMap(theNewId, "<0.1000", theMap);
							}
							else
							{
								if ("<0.5000".equals(theValue))
								{
									addToPopulateMap(theNewId, "<1.0000", theMap);
									addToPopulateMap(theNewId, "<0.5000", theMap);
								}
								else
								{
									if ("<1.0000".equals(theValue))
									{
										addToPopulateMap(theNewId, "<1.0000", theMap);
									}
									else
									{
										addToPopulateMap(theNewId, theValue, theMap);
									}
								}
							}
						}
					}
				}
			}
		}
	}

	protected void addToPopulateMap(String theNewId, String theKey, TreeMap<String, ArrayList<String>> theMap)
	{
		ArrayList<String> myList = theMap.get(theKey);
		if (null == myList)
		{
			myList = new ArrayList<>();
		}
		myList.add(theNewId);
		theMap.put(theKey, myList);
	}

	protected String populateMap(String theNewId, String theValue,
			TreeMap<String, ArrayList<String>> theMap, String theLineIndex,
			TreeMap<String, String> theNewValue, TreeMap<String, String> theValueToValue)
	{
		// last three arguments in populateMap are used for converting strings (not currently used)
		String myValue = theValue;
		if ((null != theLineIndex) && (null != theNewValue))
		{
			String newVal = theNewValue.get(theLineIndex);
			if (null != newVal)
			{
				myValue = newVal;
			}
		}
		if (null != theValueToValue)
		{
			String newVal = theValueToValue.get(myValue);
			if (null != newVal)
			{
				myValue = newVal;
			}
		}
		//// Comment out, so we can search for items without a value
		//if (!"".equals(myValue))
		//{
		addToPopulateMap(theNewId, myValue, theMap);
		//}
		return myValue;
	}

	protected ArrayList<String> populateSplittedMap(String theNewId, EntryMixin theEntry, 
			TreeMap<String, ArrayList<String>> theMap, String theTokenizer)
	{
		String files = theEntry.getFiles();
		String[] splitted = files.split(theTokenizer, -1);
		ArrayList<String> dsVal = new ArrayList<>();
		for (String myValue : splitted)
		{
			dsVal.add(myValue);
			ArrayList<String> myList = theMap.get(myValue);
			if (null == myList)
			{
				myList = new ArrayList<>();
			}
			myList.add(theNewId);
			theMap.put(myValue, myList);
		}
		return dsVal;
	}

	synchronized public Dataset getDataset(String theId)
	{
		Dataset result = null;
		if (null!=mIdToDataset)
		{
			result = mIdToDataset.get(theId);
		}
		return result;
	}

	synchronized public Collection<Dataset> getDatasets()
	{
		return mIdToDataset.values();
	}

	synchronized public TreeSet<String> getNewestIds()
	{
		return mNewestIds;
	}

	synchronized public Set<String> getIds()
	{
		// use data, since everything should have data, 
		// but not everything has results
		return mIdToDataPath.keySet();
	}

	synchronized public Set<String> getKeysFiles()
	{
		return mFileToIDs.keySet();
	}

	synchronized public Set<String> getKeysSource()
	{
		return mSourceToIDs.keySet();
	}

	synchronized public Set<String> getKeysProgram()
	{
		return mProgramToIDs.keySet();
	}

	synchronized public Set<String> getKeysProject()
	{
		return mProjectToIDs.keySet();
	}

	synchronized public Set<String> getKeysCategory()
	{
		return mCategoryToIDs.keySet();
	}

	synchronized public Set<String> getKeysPlatform()
	{
		return mPlatformToIDs.keySet();
	}

	synchronized public Set<String> getKeysData()
	{
		return mDataToIDs.keySet();
	}

	synchronized public Set<String> getKeysDetail()
	{
		return mDetailToIDs.keySet();
	}

	synchronized public Set<String> getKeysDataVersion()
	{
		return mDataVersionToIDs.keySet();
	}

	synchronized public Set<String> getKeysTestVersion()
	{
		return mTestVersionToIDs.keySet();
	}
	
	synchronized public Set<String> getKeysOverallDSCpvalue()
	{
		return mOverallDSCpvalueToIDs.keySet();
	}

	protected TreeSet<String> internalQueryOverallDsc(TreeSet<String> theIds, Double theOverallDSCmin, Double theOverallDSCmax)
	{
		TreeSet<String> idList = new TreeSet<>();
		for (String id : theIds)
		{
			Dataset ds = mIdToDataset.get(id);
			boolean maxNotNull = null != theOverallDSCmax;
			boolean minNotNull = null != theOverallDSCmin;
			boolean maxOK = true;
			boolean minOK = true;
			if (maxNotNull)
			{
				maxOK = ds.mEntry.getOverallDSC_Dbl() <= theOverallDSCmax;
			}
			if (minNotNull)
			{
				minOK = ds.mEntry.getOverallDSC_Dbl() >= theOverallDSCmin;
			}
			if (maxOK && minOK)
			{
				idList.add(id);
			}
		}
		return idList;
	}

	protected TreeSet<String> internalQuery(ArrayList<String> theValues, TreeMap<String, ArrayList<String>> theValueToIds)
	{
		TreeSet<String> idList = null;
		// idList is empty if no filter selected. is passed to combineQueryResults
		// empty idList means do not filter the available ids in combineQueryResults
		if ((null != theValues) && (theValues.size() > 0))
		{
			idList = new TreeSet<>();
			for (String val : theValues)
			{
				ArrayList<String> ids = theValueToIds.get(val);
				if (null != ids)
				{
					idList.addAll(ids);
				}
			}
		}
		return idList;
	}

	protected TreeSet<Dataset> getIdsToDatasets(TreeSet<String> theDataSetIds, TreeMap<String, Dataset> theIdToDataset, ServletContext theSC)
	{
		TreeSet<Dataset> dss = new TreeSet<>();
		for (String id : theDataSetIds)
		{
			Dataset ds = theIdToDataset.get(id);
			if (null != ds)
			{
				// skip empty line
				dss.add(ds);
			}
			else
			{
				if (null != theSC)
				{
					theSC.log("Indexes::getIdsToDatasets No match for " + id + ", which is data only. This is OK.");
				}
				else
				{
					System.out.println("Indexes::getIdsToDatasets No match for " + id + ", which is data only. This is OK.");
				}
			}
		}
		return dss;
	}
	
	static public String convertAnalysisPathToLink(String theAnalysisPath) throws UnsupportedEncodingException
	{
		String splitted [] = theAnalysisPath.split("/", -1);
		// &alg=Kruskal-Wallis/Dunn's Test&lvl1=example&lvl2=DATA_2022-07-27&lvl3=TEST_2022_12_28_1300
		// skip 0, as it is empty due to leading /
		//////////////////////////////////////////////
		// INDEX 1 alg conversions
		// Discrete Kruskal-Wallis/Dunn's Test
		// PCA PCA+
		//////////////////////////////////////////////
		// INDEX 2-5 lvl1-lvl4 no conversions
		//////////////////////////////////////////////
		String newURLsearch = "";
		if ("Discrete".equals(splitted[1]))
		{
			newURLsearch = newURLsearch + "&alg=" + URLEncoder.encode("Kruskal-Wallis/Dunn's Test", StandardCharsets.UTF_8.name());
		}
		else if ("PCA".equals(splitted[1]))
		{
			newURLsearch = newURLsearch + "&alg=" + URLEncoder.encode("PCA+", StandardCharsets.UTF_8.name());
		}
		else
		{
			// shouldn't happen yet, but might in the future
			newURLsearch = newURLsearch + "&alg=" + URLEncoder.encode(splitted[1], StandardCharsets.UTF_8.name());
		}
		if (splitted.length>2)
		{
			newURLsearch = newURLsearch + "&lvl1=" + URLEncoder.encode(splitted[2], StandardCharsets.UTF_8.name());
			if (splitted.length>3)
			{
				newURLsearch = newURLsearch + "&lvl2=" + URLEncoder.encode(splitted[3], StandardCharsets.UTF_8.name());
				if (splitted.length>4)
				{
					newURLsearch = newURLsearch + "&lvl3=" + URLEncoder.encode(splitted[4], StandardCharsets.UTF_8.name());
					if (splitted.length>5)
					{
						newURLsearch = newURLsearch + "&lvl4=" + URLEncoder.encode(splitted[5], StandardCharsets.UTF_8.name());
					}
				}
			}
		}
		return newURLsearch;
	}

//	protected void processKeyQueryResults(TreeSet<String> theKeys, TreeSet<String> theSkip, TreeSet<String> theColumnValues)
//	{
//		if (theSkip != theKeys)
//		{
//			theKeys.retainAll(theColumnValues);
//		}
//	}
//
//	protected boolean combineQueryResults(TreeSet<String> theIds, Result theResult,
//			TreeSet<String> theSkip, TreeSet<String> theNewIds, TreeMap<String, Dataset> theIdToDataset, ServletContext theSC)
//	{
//		boolean skippedEmptyResult = false;
//		// the new ids is null when the tested filter performed no filtering (that is, no filtering criteria were given)
//		if (null == theNewIds)
//		{
//			skippedEmptyResult = false;
//		}
//		else
//		{
//			if (!theNewIds.isEmpty())
//			{
//				theIds.retainAll(theNewIds);
//				// for each set of keys (other than the skip set) narrow based on this search
//				// use theNewIds, since we want this populated based on one query option only at a time
//				TreeSet<Dataset> datasets = getIdsToDatasets(theNewIds, theIdToDataset, theSC);
//				//
//				TreeSet<String> columnValues = new TreeSet<>();
//				for (Dataset ds : datasets)
//				{
//					columnValues.add(ds.mEntry.getData());
//				}
//				processKeyQueryResults(theResult.mOptions.mData, theSkip, columnValues);
//				columnValues.clear();
//				for (Dataset ds : datasets)
//				{
//					columnValues.add(ds.mEntry.getDetails());
//				}
//				processKeyQueryResults(theResult.mOptions.mDetail, theSkip, columnValues);
//				columnValues.clear();
//				for (Dataset ds : datasets)
//				{
//					columnValues.addAll(ds.mFiles);
//				}
//				processKeyQueryResults(theResult.mOptions.mFiles, theSkip, columnValues);
//				if (true == this.mIsDSC)
//				{
//					columnValues.clear();
//					for (Dataset ds : datasets)
//					{
//						columnValues.add(ds.mOverallDSCpvalueRange);
//					}
//					processKeyQueryResults(theResult.mOptions.mOverallDSCpvalue, theSkip, columnValues);
//				}
//				columnValues.clear();
//				for (Dataset ds : datasets)
//				{
//					columnValues.add(ds.mEntry.getPlatform());
//				}
//				processKeyQueryResults(theResult.mOptions.mPlatform, theSkip, columnValues);
//				columnValues.clear();
//				for (Dataset ds : datasets)
//				{
//					columnValues.add(ds.mEntry.getProgram());
//				};
//				processKeyQueryResults(theResult.mOptions.mProgram, theSkip, columnValues);
//				columnValues.clear();
//				for (Dataset ds : datasets)
//				{
//					columnValues.add(ds.mEntry.getProject());
//				};
//				processKeyQueryResults(theResult.mOptions.mProject, theSkip, columnValues);
//				columnValues.clear();
//				for (Dataset ds : datasets)
//				{
//					columnValues.add(ds.mEntry.getSource());
//				};
//				processKeyQueryResults(theResult.mOptions.mSource, theSkip, columnValues);
//				columnValues.clear();
//				for (Dataset ds : datasets)
//				{
//					columnValues.add(ds.mEntry.getCategory());
//				};
//				processKeyQueryResults(theResult.mOptions.mCategory, theSkip, columnValues);
//				columnValues.clear();
//				for (Dataset ds : datasets)
//				{
//					columnValues.add(ds.mEntry.getDataVersion());
//				};
//				processKeyQueryResults(theResult.mOptions.mDataVersion, theSkip, columnValues);
//				columnValues.clear();
//				for (Dataset ds : datasets)
//				{
//					columnValues.add(ds.mEntry.getTestVersion());
//				};
//				processKeyQueryResults(theResult.mOptions.mTestVersion, theSkip, columnValues);
//				columnValues.clear();
//			}
//			else
//			{
//				skippedEmptyResult = true;
//			}
//		}
//		return skippedEmptyResult;
//	}
//
//	synchronized public Result query(Query theQuery, ServletContext theSC)
//	{
//		boolean skippedEmptyResult = false;
//		Result result = new Result();
//		result.init(this);
//		////////////////////////////////////////////////////////////////////////
//		TreeSet<String> dataSetIds = new TreeSet<>();
//		// if version is empty, keep newest of each dataset, otherwise process as normal
//		if (((null != theQuery.mDataVersions) && (theQuery.mDataVersions.size() > 0)) ||
//				((null != theQuery.mTestVersions) && (theQuery.mTestVersions.size() > 0)))
//		{
//			dataSetIds.addAll(this.mIdToDataset.keySet());
//		}
//		else
//		{
//			dataSetIds.addAll(mNewestIds);
//		}
//		combineQueryResults(dataSetIds, result, result.mOptions.mFiles, internalQuery(theQuery.mFiles, this.mFileToIDs), this.mIdToDataset, theSC);
//		skippedEmptyResult = skippedEmptyResult || combineQueryResults(dataSetIds, result, result.mOptions.mSource, internalQuery(theQuery.mSources, this.mSourceToIDs), this.mIdToDataset, theSC);
//		skippedEmptyResult = skippedEmptyResult || combineQueryResults(dataSetIds, result, result.mOptions.mProgram, internalQuery(theQuery.mPrograms, this.mProgramToIDs), this.mIdToDataset, theSC);
//		skippedEmptyResult = skippedEmptyResult || combineQueryResults(dataSetIds, result, result.mOptions.mProject, internalQuery(theQuery.mProjects, this.mProjectToIDs), this.mIdToDataset, theSC);
//		skippedEmptyResult = skippedEmptyResult || combineQueryResults(dataSetIds, result, result.mOptions.mCategory, internalQuery(theQuery.mCategories, this.mCategoryToIDs), this.mIdToDataset, theSC);
//		skippedEmptyResult = skippedEmptyResult || combineQueryResults(dataSetIds, result, result.mOptions.mPlatform, internalQuery(theQuery.mPlatforms, this.mPlatformToIDs), this.mIdToDataset, theSC);
//		skippedEmptyResult = skippedEmptyResult || combineQueryResults(dataSetIds, result, result.mOptions.mData, internalQuery(theQuery.mData, this.mDataToIDs), this.mIdToDataset, theSC);
//		skippedEmptyResult = skippedEmptyResult || combineQueryResults(dataSetIds, result, result.mOptions.mDetail, internalQuery(theQuery.mDetails, this.mDetailToIDs), this.mIdToDataset, theSC);
//		skippedEmptyResult = skippedEmptyResult || combineQueryResults(dataSetIds, result, result.mOptions.mDataVersion, internalQuery(theQuery.mDataVersions, this.mDataVersionToIDs), this.mIdToDataset, theSC);
//		skippedEmptyResult = skippedEmptyResult || combineQueryResults(dataSetIds, result, result.mOptions.mTestVersion, internalQuery(theQuery.mTestVersions, this.mTestVersionToIDs), this.mIdToDataset, theSC);
//		// optional
//		if (true == this.mIsDSC)
//		{
//			skippedEmptyResult = skippedEmptyResult || combineQueryResults(dataSetIds, result, result.mOptions.mOverallDSCpvalue, internalQuery(theQuery.mOverallDSCpvalue, this.mOverallDSCpvalueToIDs), this.mIdToDataset, theSC);
//			theSC.log("Skipped due to mOverallDSCpvalue");
//			// for overall DSC min and max, use ids =, since it can actually remove all available datasets from consideration
//			dataSetIds = internalQueryOverallDsc(dataSetIds, theQuery.mOverallDSCmin, theQuery.mOverallDSCmax);
//		}
//		// get data
//		result.mDatasets.clear();
//		for (String id : dataSetIds)
//		{
//			result.mDatasets.add(mIdToDataset.get(id));
//		}
//		result.mSkippedEmptyResult = skippedEmptyResult;
//		return result;
//	}
}
