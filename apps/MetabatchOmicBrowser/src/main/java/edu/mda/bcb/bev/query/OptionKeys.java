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

import java.util.TreeSet;

/**
 *
 * @author Tod-Casasent
 */
public class OptionKeys
{
	public TreeSet<String> mFiles;
	public TreeSet<String> mSource;
	public TreeSet<String> mProgram;
	public TreeSet<String> mProject;
	public TreeSet<String> mCategory;
	public TreeSet<String> mPlatform;
	public TreeSet<String> mData;
	public TreeSet<String> mDetail;
	public TreeSet<String> mDataVersion;
	public TreeSet<String> mTestVersion;
	// optional
	public TreeSet<String> mOverallDSCpvalue;
	
	public OptionKeys()
	{
		mFiles = new TreeSet<>();
		mSource = new TreeSet<>();
		mProgram = new TreeSet<>();
		mProject = new TreeSet<>();
		mCategory = new TreeSet<>();
		mPlatform = new TreeSet<>();
		mData = new TreeSet<>();
		mDetail = new TreeSet<>();
		mDataVersion = new TreeSet<>();
		mTestVersion = new TreeSet<>();
		// optional
		mOverallDSCpvalue = new TreeSet<>();
	}
	
	public void compile(TreeSet<Dataset> theDS)
	{
		for (Dataset ds : theDS)
		{
			mFiles.addAll(ds.mFiles);
			mSource.add(ds.mEntry.getSource());
			mProgram.add(ds.mEntry.getProgram());
			mProject.add(ds.mEntry.getProject());
			mCategory.add(ds.mEntry.getCategory());
			mPlatform.add(ds.mEntry.getPlatform());
			mData.add(ds.mEntry.getData());
			mDetail.add(ds.mEntry.getDetails());
			mDataVersion.add(ds.mEntry.getDataVersion());
			mTestVersion.add(ds.mEntry.getTestVersion());
			// optional
			mOverallDSCpvalue.add(ds.mEntry.getOverallDSCpvalue());
		}
	}
}
