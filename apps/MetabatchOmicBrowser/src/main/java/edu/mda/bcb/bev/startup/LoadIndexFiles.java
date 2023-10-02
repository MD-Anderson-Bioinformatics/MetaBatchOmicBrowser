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
package edu.mda.bcb.bev.startup;

import edu.mda.bcb.bev.indexes.DscIndex;
import edu.mda.bcb.bev.indexes.Indexes;
import edu.mda.bcb.bev.indexes.KwdIndex;
import edu.mda.bcb.bev.indexes.ResultIndex;
import java.io.File;
import java.io.FileInputStream;
import java.util.Properties;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

/**
 *
 * @author Tod-Casasent
 */
@WebListener
public class LoadIndexFiles implements ServletContextListener
{

	static public String M_VERSION = "BEV BEA_VERSION_TIMESTAMP";
	// *mapped-dir* <- used for searching for hard-coded paths
	static public String M_BEV_DIA_INDEX_FILE = "/BEA/DAPI_MOB/INDEXES/data_index_mwb.tsv";
	static public String M_BEV_DSC_INDEX_FILE = "/BEA/DAPI_MOB/INDEXES/dsc_index_mwb.tsv";
	static public String M_BEV_KWD_INDEX_FILE = "/BEA/DAPI_MOB/INDEXES/kwd_index_mwb.tsv";
	static public String M_CONFIG_PROP = "/BEA/DAPI_MOB/CONFIG/dapi.properties";
	static public String M_BEI_DATA_DIR = "/BEA/DAPI_MOB/DATA";
	//TDC// static public String M_CONFIG_FILTER = "/DAPI/CONFIG/dapi-filter.tsv";

	static public Indexes M_PATH_LOOKUP = null;
	static public DefaultUrl M_CONFIG_PROPERTIES = null;
	static public ResultIndex M_RESULT_INDEX = null;
	static public KwdIndex M_KWD_INDEX = null;
	static public DscIndex M_DSC_INDEX = null;

	@Override
	public void contextInitialized(ServletContextEvent sce)
	{
		//ServletContextListener.super.contextInitialized(sce);
		sce.getServletContext().log("LoadIndexFiles::contextInitialized Version: " + M_VERSION);
		sce.getServletContext().log("LoadIndexFiles::contextInitialized Read diagram indexes from: " + M_BEV_DIA_INDEX_FILE);
		sce.getServletContext().log("LoadIndexFiles::contextInitialized Read DSC indexes from: " + M_BEV_DSC_INDEX_FILE);
		sce.getServletContext().log("LoadIndexFiles::contextInitialized Read KWD indexes from: " + M_BEV_KWD_INDEX_FILE);
		sce.getServletContext().log("LoadIndexFiles::contextInitialized Read config properties from: " + M_CONFIG_PROP);
		//TDC// sce.getServletContext().log("LoadIndexFiles::contextInitialized Read config filter from: " + M_CONFIG_FILTER);

		try
		{
			////////////////////////////////////////////////////////////////////////
			// Read diagram indexes from:  M_BEV_DIA_INDEX_FILES
			////////////////////////////////////////////////////////////////////////
			if (new File(M_BEV_DIA_INDEX_FILE).exists())
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized read M_BEV_DIA_INDEX_FILE: " + M_BEV_DIA_INDEX_FILE);
				M_RESULT_INDEX = new ResultIndex();
				M_RESULT_INDEX.loadIndex(M_BEV_DIA_INDEX_FILE, sce.getServletContext());
				M_PATH_LOOKUP = new Indexes(M_RESULT_INDEX);
				M_PATH_LOOKUP.loadIndex(sce.getServletContext());
			}
			else
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized skip reading from non-existant M_BEV_DIA_INDEX_FILE: " + M_BEV_DIA_INDEX_FILE);
				sce.getServletContext().log("LoadIndexFiles::contextInitialized use path " + M_BEI_DATA_DIR);
				M_PATH_LOOKUP = new Indexes(null);
				M_PATH_LOOKUP.noIndex(M_BEI_DATA_DIR);
			}
			////////////////////////////////////////////////////////////////////////
			// Read DSC indexes from:  M_BEV_DSC_INDEX_FILE
			////////////////////////////////////////////////////////////////////////
			if (new File(M_BEV_DSC_INDEX_FILE).exists())
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized read M_BEV_DSC_INDEX_FILE: " + M_BEV_DSC_INDEX_FILE);
				M_DSC_INDEX = new DscIndex();
				M_DSC_INDEX.loadIndex(M_BEV_DSC_INDEX_FILE, sce.getServletContext());
			}
			else
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized skip reading from non-existant M_BEV_DSC_INDEX_FILE: " + M_BEV_DSC_INDEX_FILE);
			}
			////////////////////////////////////////////////////////////////////////
			// Read KWD indexes from:  M_BEV_KWD_INDEX_FILES
			////////////////////////////////////////////////////////////////////////
			if (new File(M_BEV_KWD_INDEX_FILE).exists())
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized read M_BEV_KWD_INDEX_FILE: " + M_BEV_KWD_INDEX_FILE);
				M_KWD_INDEX = new KwdIndex();
				M_KWD_INDEX.loadIndex(M_BEV_KWD_INDEX_FILE, sce.getServletContext());
			}
			else
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized skip reading from non-existant M_BEV_KWD_INDEX_FILE: " + M_BEV_KWD_INDEX_FILE);
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
					String defaultView = props.getProperty("DEFAULT_VIEW");
					String defaultQuery = props.getProperty("DEFAULT_QUERY");
					String defaultViewParams = props.getProperty("DEFAULT_VIEW_PARAMS");
					String defaultQueryParams = props.getProperty("DEFAULT_QUERY_PARAMS");
					M_CONFIG_PROPERTIES = new DefaultUrl(defaultView, defaultQuery, defaultViewParams, defaultQueryParams);
				}
			}
			else
			{
				sce.getServletContext().log("LoadIndexFiles::contextInitialized skip reading from non-existant M_CONFIG_PROP: " + M_CONFIG_PROP);
			}
		}
		catch (Exception exp)
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
