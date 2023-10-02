/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package edu.mda.bcb.bev.indexes;

import com.google.gson.Gson;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;

/**
 *
 * @author dqs_tcga_service
 */
abstract public class EntryMixin implements Comparable<EntryMixin>
{
	// common values
	abstract public String getId();
	abstract public String getPathResults();
	abstract public String getPathData();
	abstract public String getSource();
	abstract public String getProgram();
	abstract public String getProject();
	abstract public String getCategory();
	abstract public String getPlatform();
	abstract public String getData();
	abstract public String getDetails();
	abstract public String getDataVersion();
	abstract public String getTestVersion();
	// job typ
	abstract public String getJobType();
	// results only
	abstract public String getFiles();
	// DSC values
	abstract public String getAnalysisPath();
	abstract public String getOverallDSCpvalue();
	abstract public String getOverallDSCpvalue_Orig();
	abstract public Double getOverallDSC_Dbl();
	abstract public String getOverallDSC_Orig();
	// KWD values	
	abstract public String getNegLog10PValue();
	abstract public String getNegLog10Cutoff();
	abstract public String getBatchesCalled();

	abstract public String getJsonHeaders(boolean theIncludeAdvancedFlag);
	abstract public String getHeaders(boolean theIncludeAdvancedFlag);
	abstract public String getJson(Gson theBuilder, String theDownloadBase, boolean theIncludeAdvancedFlag) throws UnsupportedEncodingException;
	abstract public ArrayList<String> getStrings(String theDownloadBase, String theJsonQuery, boolean theIncludeAdvancedFlag) throws UnsupportedEncodingException;
	
	static public int safeCompareTo(String theA, String theB)
	{
		int comp = 0;
		if ((null==theA)&&(null==theB))
		{
			comp = 0;
		}
		else if (null!=theA)
		{
			comp = theA.compareTo(theB);
		}
		return comp;
	}
	
	@Override
	public int compareTo(EntryMixin theOtherEntry)
	{
		int comp = safeCompareTo(this.getSource(), theOtherEntry.getSource());
		if (0==comp)
		{
			comp = safeCompareTo(this.getProgram(), theOtherEntry.getProgram());
			if (0==comp)
			{
				comp = safeCompareTo(this.getProject(), theOtherEntry.getProject());
				if (0==comp)
				{
					comp = safeCompareTo(this.getCategory(), theOtherEntry.getCategory());
					if (0==comp)
					{
						comp = safeCompareTo(this.getPlatform(), theOtherEntry.getPlatform());
						if (0==comp)
						{
							comp = safeCompareTo(this.getData(), theOtherEntry.getData());
							if (0==comp)
							{
								comp = safeCompareTo(this.getDetails(), theOtherEntry.getDetails());
								if (0==comp)
								{
									comp = safeCompareTo(this.getDataVersion(), theOtherEntry.getDataVersion());
									if (0==comp)
									{
										comp = safeCompareTo(this.getTestVersion(), theOtherEntry.getTestVersion());
										if (0==comp)
										{
											comp = safeCompareTo(this.getAnalysisPath(), theOtherEntry.getAnalysisPath());
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return comp;
	}
	
	public int compareToExceptVersion(EntryMixin theOtherEntry)
	{
		int comp = safeCompareTo(this.getSource(), theOtherEntry.getSource());
		if (0==comp)
		{
			comp = safeCompareTo(this.getProgram(), theOtherEntry.getProgram());
			if (0==comp)
			{
				comp = safeCompareTo(this.getProject(), theOtherEntry.getProject());
				if (0==comp)
				{
					comp = safeCompareTo(this.getCategory(), theOtherEntry.getCategory());
					if (0==comp)
					{
						comp = safeCompareTo(this.getPlatform(), theOtherEntry.getPlatform());
						if (0==comp)
						{
							comp = safeCompareTo(this.getData(), theOtherEntry.getData());
							if (0==comp)
							{
								comp = safeCompareTo(this.getDetails(), theOtherEntry.getDetails());
								if (0==comp)
								{
									comp = safeCompareTo(this.getAnalysisPath(), theOtherEntry.getAnalysisPath());
								}
							}
						}
					}
				}
			}
		}
		return comp;
	}
}
