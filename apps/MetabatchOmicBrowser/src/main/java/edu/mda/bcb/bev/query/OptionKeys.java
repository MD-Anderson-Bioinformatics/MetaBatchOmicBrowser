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

import java.util.TreeSet;

/**
 *
 * @author Tod-Casasent
 */
public class OptionKeys
{
	public TreeSet<String> mFiles;
	public TreeSet<String> mSource;
	public TreeSet<String> mVariant;
	public TreeSet<String> mProject;
	public TreeSet<String> mSubproject;
	public TreeSet<String> mCategory;
	public TreeSet<String> mPlatform;
	public TreeSet<String> mData;
	public TreeSet<String> mAlgorithm;
	public TreeSet<String> mDetail;
	public TreeSet<String> mVersion;
	// optional
	public TreeSet<String> mOverallDSCpvalue;
	
	public OptionKeys()
	{
		mFiles = new TreeSet<>();
		mSource = new TreeSet<>();
		mVariant = new TreeSet<>();
		mProject = new TreeSet<>();
		mSubproject = new TreeSet<>();
		mCategory = new TreeSet<>();
		mPlatform = new TreeSet<>();
		mData = new TreeSet<>();
		mAlgorithm = new TreeSet<>();
		mDetail = new TreeSet<>();
		mVersion = new TreeSet<>();
		// optional
		mOverallDSCpvalue = new TreeSet<>();
	}
	
	public void compile(TreeSet<Dataset> theDS)
	{
		for (Dataset ds : theDS)
		{
			mFiles.addAll(ds.mFiles);
			mSource.add(ds.mSource);
			mVariant.add(ds.mVariant);
			mProject.add(ds.mProject);
			mSubproject.add(ds.mSubproject);
			mCategory.add(ds.mCategory);
			mPlatform.add(ds.mPlatform);
			mData.add(ds.mData);
			mAlgorithm.add(ds.mAlgorithm);
			mDetail.add(ds.mDetail);
			mVersion.add(ds.mVersion);
			// optional
			mOverallDSCpvalue.add(ds.mOverallDSCpvalue);
		}
	}
}
