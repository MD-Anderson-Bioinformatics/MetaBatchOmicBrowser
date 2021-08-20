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

package edu.mda.bcb.bev.startup;

import edu.mda.bcb.bev.indexes.Indexes;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Properties;
import java.util.TreeMap;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

/**
 *
 * @author Tod-Casasent
 */
@WebListener
public class LoadIndexFiles implements ServletContextListener
{
	static public String M_VERSION = "BEV BEA_VERSION_TIMESTAMP";

	static public String M_BEV_DIA_INDEX_FILES = "/DAPI/INDEXES";
	static public String M_BEV_DSC_INDEX_FILES = "/DAPI/DSC_INDEXES";
	static public String M_CONFIG_PROP = "/DAPI/CONFIG/dapi.properties";
	static public String M_CONFIG_FILTER = "/DAPI/CONFIG/dapi-filter.tsv";
	static public String M_BEI_DATA_DIR = "/DAPI/DATA";

	static public Indexes M_BEV_DIA_INDEXES = null;
	static public Indexes M_BEV_DSC_INDEXES = null;
	static public BevUrl M_CONFIG_PROPERTIES = null;
	
	@Override
	public void contextInitialized(ServletContextEvent sce)
	{
		//ServletContextListener.super.contextInitialized(sce);
		sce.getServletContext().log("LoadIndexFiles::contextInitialized Version: " + M_VERSION);
		sce.getServletContext().log("LoadIndexFiles::contextInitialized Read diagram indexes from: " + M_BEV_DIA_INDEX_FILES);
		sce.getServletContext().log("LoadIndexFiles::contextInitialized Read DSC indexes from: " + M_BEV_DSC_INDEX_FILES);
		sce.getServletContext().log("LoadIndexFiles::contextInitialized Read config properties from: " + M_CONFIG_PROP);
		sce.getServletContext().log("LoadIndexFiles::contextInitialized Read config filter from: " + M_CONFIG_FILTER);
		
		////////////////////////////////////////////////////////////////////////
		// M_CONFIG_FILTER loading
		////////////////////////////////////////////////////////////////////////
		// maps for rewriting options for index files
		TreeMap<String, String> filterBaseToCategory = new TreeMap<>();
		TreeMap<String, String> filterBaseToPlatform = new TreeMap<>();
		TreeMap<String, String> filterBaseToDetails = new TreeMap<>();
		//
		TreeMap<String, String> filterSources = new TreeMap<>();
		TreeMap<String, String> filterDerivations = new TreeMap<>();
		try
		{
			if (new File(M_CONFIG_FILTER).exists())
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized read: " + M_CONFIG_FILTER);
				// Variant	Category	Platform	Details	Category-New	Platform-New	Details-New
				try (BufferedReader br = java.nio.file.Files.newBufferedReader(new File(M_CONFIG_FILTER).toPath(), Charset.availableCharsets().get("UTF-8")))
				{
					ArrayList<String> headersIndex = null;
					String line = br.readLine();
					while ((null!=line)&&(!"".equals(line)))
					{
						if (null==headersIndex)
						{
							headersIndex = new ArrayList<>();
							for (String hdr : line.split("\t", -1))
							{
								headersIndex.add(hdr);
							}
						}
						else
						{
							String [] splitted = line.split("\t", -1);
							if (headersIndex.indexOf("Derivations")>=0)
							{
								// Variants from real index is called Derivations here
								String valVariant = splitted[headersIndex.indexOf("Derivations")];
								String valCategory = splitted[headersIndex.indexOf("Category")];
								String valPlatform = splitted[headersIndex.indexOf("Platform")];
								String valDetails = splitted[headersIndex.indexOf("Details")];
								String valCategoryNew = splitted[headersIndex.indexOf("Category-New")];
								String valPlatformNew = splitted[headersIndex.indexOf("Platform-New")];
								String valDetailsNew = splitted[headersIndex.indexOf("Details-New")];
								String lineIndex = (valVariant + " " + valCategory + " " + valPlatform + " " + valDetails).toLowerCase();
								filterBaseToCategory.put(lineIndex, valCategoryNew);
								filterBaseToPlatform.put(lineIndex, valPlatformNew);
								filterBaseToDetails.put(lineIndex, valDetailsNew);
							}
							else if (headersIndex.indexOf("Sources-Orig")>=0)
							{
								String valSourceOrig = splitted[headersIndex.indexOf("Sources-Orig")];
								String valSourceNew = splitted[headersIndex.indexOf("Sources-New")];
								String valDerivationsOrig = splitted[headersIndex.indexOf("Derivations-Orig")];
								String valDerivationsNew = splitted[headersIndex.indexOf("Derivations-New")];
								if ((null!=valSourceOrig)&&(!"".equals(valSourceOrig)))
								{
									filterSources.put(valSourceOrig, valSourceNew);
								}
								if ((null!=valDerivationsOrig)&&(!"".equals(valDerivationsOrig)))
								{
									filterDerivations.put(valDerivationsOrig, valDerivationsNew);
								}
							}
						}
						line = br.readLine();
					}
				}
			}
			////////////////////////////////////////////////////////////////////////
			// Read diagram indexes from:  M_BEV_DIA_INDEX_FILES
			////////////////////////////////////////////////////////////////////////
			if (new File(M_BEV_DIA_INDEX_FILES).exists())
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized read M_BEV_DIA_INDEX_FILES: " + M_BEV_DIA_INDEX_FILES);
				Indexes myIndexes2 = Indexes.loadFromFiles(M_BEV_DIA_INDEX_FILES, sce.getServletContext(), 
						filterBaseToCategory, filterBaseToPlatform, filterBaseToDetails,
						filterSources, filterDerivations);
				M_BEV_DIA_INDEXES = myIndexes2;
			}
			else
			{
				M_BEV_DIA_INDEXES = new Indexes(true);
				sce.getServletContext().log("LoadIndexFiles::contextInitialized skip reading from non-existant M_BEV_DIA_INDEX_FILES: " + M_BEV_DIA_INDEX_FILES);
			}
			////////////////////////////////////////////////////////////////////////
			// Read DSC indexes from:  M_BEV_DSC_INDEX_FILES
			////////////////////////////////////////////////////////////////////////
			if (new File(M_BEV_DSC_INDEX_FILES).exists())
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized read M_BEV_DSC_INDEX_FILES: " + M_BEV_DSC_INDEX_FILES);
				Indexes myIndexes2 = Indexes.loadFromFiles(M_BEV_DSC_INDEX_FILES, sce.getServletContext(), 
						filterBaseToCategory, filterBaseToPlatform, filterBaseToDetails,
						filterSources, filterDerivations);
				M_BEV_DSC_INDEXES = myIndexes2;
			}
			else
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized skip reading from non-existant M_BEV_DSC_INDEX_FILES: " + M_BEV_DSC_INDEX_FILES);
			}
			////////////////////////////////////////////////////////////////////////
			// M_CONFIG_PROP
			////////////////////////////////////////////////////////////////////////
			File dapiProp = new File(M_CONFIG_PROP);
			if (dapiProp.exists())
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized read M_CONFIG_PROP: " + M_CONFIG_PROP);
				Properties props = new Properties();
				try (FileInputStream is = new FileInputStream(dapiProp))
				{
					props.loadFromXML(is);
					String mqaDefaultView = props.getProperty("DEFAULT_VIEW");
					String mqaDefaultQuery = props.getProperty("DEFAULT_QUERY");
					String mqaDefaultViewParams = props.getProperty("DEFAULT_VIEW_PARAMS");
					String mqaDefaultQueryParams = props.getProperty("DEFAULT_QUERY_PARAMS");
					M_CONFIG_PROPERTIES =  new BevUrl(mqaDefaultView, mqaDefaultQuery, mqaDefaultViewParams, mqaDefaultQueryParams);
				}
			}
			else
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized skip reading from non-existant M_CONFIG_PROP: " + M_CONFIG_PROP);
			}
		}
		catch(Exception exp)
		{
			sce.getServletContext().log("Error loading index files", exp);
		}
	}

	@Override
	public void contextDestroyed(ServletContextEvent sce)
	{
		//throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}
}
