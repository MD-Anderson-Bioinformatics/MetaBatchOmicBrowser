// Copyright (c) 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021 University of Texas MD Anderson Cancer Center
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

import edu.mda.bcb.bev.indexes.Indexes;
import java.util.ArrayList;

/**
 *
 * @author Tod-Casasent
 */
public class Query
{
	public ArrayList<String> mFiles;
	public ArrayList<String> mSources;
	public ArrayList<String> mVariants;
	public ArrayList<String> mProjects;
	public ArrayList<String> mSubprojects;
	public ArrayList<String> mCategories;
	public ArrayList<String> mPlatforms;
	public ArrayList<String> mData;
	public ArrayList<String> mAlgorithms;
	public ArrayList<String> mDetails;
	public ArrayList<String> mVersions;
	// optional
	public Double mOverallDSCmin;
	public Double mOverallDSCmax;
	public ArrayList<String> mOverallDSCpvalue;

	public Query(ArrayList<String> theFiles, ArrayList<String> theSources, ArrayList<String> theVariants, 
			ArrayList<String> theProjects, ArrayList<String> theSubprojects, ArrayList<String> theCategories, 
			ArrayList<String> thePlatforms, ArrayList<String> theData, ArrayList<String> theAlgorithms, 
			ArrayList<String> theDetails, ArrayList<String> theVersions,
			Double theOverallDSCmin, Double theOverallDSCmax, ArrayList<String> theOverallDSCpvalue)
	{
		this.mFiles = theFiles;
		this.mSources = theSources;
		this.mVariants = theVariants;
		this.mProjects = theProjects;
		this.mSubprojects = theSubprojects;
		this.mCategories = theCategories;
		this.mPlatforms = thePlatforms;
		this.mData = theData;
		this.mAlgorithms = theAlgorithms;
		this.mDetails = theDetails;
		this.mVersions = theVersions;
		// optional
		this.mOverallDSCmin = theOverallDSCmin;
		this.mOverallDSCmax = theOverallDSCmax;
		this.mOverallDSCpvalue = theOverallDSCpvalue;
	}
	
	public int countOptions()
	{
		int cnt = 0;
		if ((null!=this.mFiles)&&(this.mFiles.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mSources)&&(this.mSources.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mVariants)&&(this.mVariants.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mProjects)&&(this.mProjects.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mSubprojects)&&(this.mSubprojects.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mCategories)&&(this.mCategories.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mPlatforms)&&(this.mPlatforms.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mData)&&(this.mData.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mAlgorithms)&&(this.mAlgorithms.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mDetails)&&(this.mDetails.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mVersions)&&(this.mVersions.size()>0))
		{
			cnt = cnt + 1;
		}
		return cnt;
	}
	
	public Result process(Indexes theIndexes)
	{
		return theIndexes.query(this);
	}
}
