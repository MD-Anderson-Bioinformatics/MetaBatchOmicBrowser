// Copyright (c) 2011-2024 University of Texas MD Anderson Cancer Center
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// MD Anderson Cancer Center Bioinformatics on GitHub <https://github.com/MD-Anderson-Bioinformatics>
// MD Anderson Cancer Center Bioinformatics at MDA <https://www.mdanderson.org/research/departments-labs-institutes/departments-divisions/bioinformatics-and-computational-biology.html>

package edu.mda.bcb.bev.query;

import edu.mda.bcb.bev.indexes.EntryMixin;
import java.util.ArrayList;

/**
 *
 * @author Tod-Casasent
 */
public class Dataset implements Comparable<Dataset>
{
	public String mID;
	public ArrayList<String> mFiles;
	public EntryMixin mEntry;
	public String mOverallDSCpvalueRange;
	public boolean mHasData;
	public boolean mHasResults;
							
	public Dataset(String theNewId, ArrayList<String> theFiles, 
			String theOverallDSCpvalueRange, EntryMixin theEntry)
	{
		this.mHasData = true;
		if ((null==theEntry.getPathData())||("".equals(theEntry.getPathData())))
		{
			this.mHasData = false;
		}
		this.mHasResults = true;
		if ((null==theEntry.getPathResults())||("".equals(theEntry.getPathResults())))
		{
			this.mHasResults = false;
		}
		this.mID = theNewId;
		this.mFiles = theFiles;
		this.mOverallDSCpvalueRange = theOverallDSCpvalueRange;
		this.mEntry = theEntry;
	}

	@Override
	public int compareTo(Dataset o)
	{
		return this.mEntry.compareTo(o.mEntry);
	}
	
	static public boolean safeCompare(String theA, String theB)
	{
		boolean equals = false;
		if ((null==theA)&&(null==theB))
		{
			equals = true;
		}
		else if (null!=theA)
		{
			equals = theA.equals(theB);
		}
		return equals;
	}
	
	public boolean isSameExceptForVersion(Dataset theDS)
	{
		boolean same = false;
		if (0==this.mEntry.compareToExceptVersion(theDS.mEntry))
		{
			same = true;
		}
		return same;
	}
	
	////////////////////////////////////////////////////////////////////////////
	// dataset entry
	////////////////////////////////////////////////////////////////////////////
	
//	private String getFilesAsString()
//	{
//		String ret = null;
//		for (String file : mFiles)
//		{
//			if (null==ret)
//			{
//				ret = file;
//			}
//			else
//			{
//				ret = ret + "|" + file;
//			}
//		}
//		return ret;
//	}
	
//	private ArrayList<String> getStrings(String theDownloadBase, String theJsonQuery) throws UnsupportedEncodingException
//	{
//		return this.mEntry.getStrings(theDownloadBase, theJsonQuery);
//	}
//	
//	public String toString(String theDownloadBase, String theJsonQuery) throws UnsupportedEncodingException
//	{
//		String myString = null;
//		for (String val : getStrings(theDownloadBase, theJsonQuery))
//		{
//			if (null==myString)
//			{
//				myString = val;
//			}
//			else
//			{
//				myString = myString + "\t" + val;
//			}
//		}
//		return myString;
//	}
//
//	public String getJson(Gson theBuilder, String theDownloadBase) throws UnsupportedEncodingException
//	{
//		return theBuilder.toJson(getStrings(theDownloadBase, null));
//	}
}
