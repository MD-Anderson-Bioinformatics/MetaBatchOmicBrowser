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

import java.util.ArrayList;

/**
 *
 * @author Tod-Casasent
 */
public class Query
{
	public ArrayList<String> mFiles;
	public ArrayList<String> mSources;
	public ArrayList<String> mProgram;
	public ArrayList<String> mProjects;
	public ArrayList<String> mCategories;
	public ArrayList<String> mPlatforms;
	public ArrayList<String> mData;
	public ArrayList<String> mDetails;
	public ArrayList<String> mDataVersions;
	public ArrayList<String> mTestVersions;
	public ArrayList<String> mJobType;
	// optional
	public ArrayList<String> mAnalysisPath;
	// optional DSC
	public Double mOverallDSCmin;
	public Double mOverallDSCmax;
	public ArrayList<String> mOverallDSCpvalue;
	// optional KWD
	public boolean mCutoffFlag;
	public boolean mBatchesCalledFlag;
	// optional advanced
	// use Integer instead of int, so non-existant values come through as null instead of 0
	public Integer GTE_samples_matrix;
	public Integer LTE_samples_matrix;
	public boolean isNaN_samples_matrix;
	public Integer GTE_samples_mutations;
	public Integer LTE_samples_mutations;
	public boolean isNaN_samples_mutations;
	public Integer GTE_features_matrix;
	public Integer LTE_features_matrix;
	public boolean isNaN_features_matrix;
	public Integer GTE_features_mutations;
	public Integer LTE_features_mutations;
	public boolean isNaN_features_mutations;
	public Integer GTE_unknown_batches;
	public Integer LTE_unknown_batches;
	public boolean isNaN_unknown_batches;
	public Integer GTE_batch_unique_cnt;
	public Integer LTE_batch_unique_cnt;
	public boolean isNaN_batch_unique_cnt;
	public Integer GTE_correlated_batch_types;
	public Integer LTE_correlated_batch_types;
	public boolean isNaN_correlated_batch_types;
	public Integer GTE_batch_type_count;
	public Integer LTE_batch_type_count;
	public boolean isNaN_batch_type_count;


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
		if ((null!=this.mProgram)&&(this.mProgram.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mProjects)&&(this.mProjects.size()>0))
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
		if ((null!=this.mDetails)&&(this.mDetails.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mDataVersions)&&(this.mDataVersions.size()>0))
		{
			cnt = cnt + 1;
		}
		if ((null!=this.mTestVersions)&&(this.mTestVersions.size()>0))
		{
			cnt = cnt + 1;
		}
		return cnt;
	}
	
//	public Result process(Indexes theIndexes, ServletContext theSC)
//	{
//		return theIndexes.query(this, theSC);
//	}
}
