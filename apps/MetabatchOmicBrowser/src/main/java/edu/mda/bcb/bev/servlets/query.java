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
package edu.mda.bcb.bev.servlets;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import edu.mda.bcb.bev.indexes.DscEntry;
import edu.mda.bcb.bev.indexes.KwdEntry;
import edu.mda.bcb.bev.indexes.ResultEntry;
import edu.mda.bcb.bev.query.Query;
import edu.mda.bcb.bev.startup.LoadIndexFiles;
import edu.mda.bcb.bev.util.ScanCheck;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 *
 * @author Tod-Casasent
 */
@WebServlet(name = "query", urlPatterns =
{
	"/query"
})
public class query extends HttpServlet
{

	protected void populateForSelections(TreeSet<String> theTree, ArrayList<String> theList, Set<String> theKeys, int theOptionCount)
	{
		if ((theList.size() > 0) && (theOptionCount < 2))
		{
			theTree.addAll(theKeys);
		}
	}

	protected void handleKWDFilter(HttpServletRequest request, HttpServletResponse response) throws IOException
	{
		boolean isAdvanced = false;
		String json = request.getParameter("search");
		GsonBuilder builder = new GsonBuilder();
		builder.setPrettyPrinting();
		Gson gson = builder.create();
		if (null == json)
		{
			json = "{}";
		}
		this.log("query=" + json);
		TreeSet<KwdEntry> filtered = query.getFilteredKwd(json);
		if (null != filtered)
		{
			this.log("Query handleKWDFilter count = " + filtered.size());
		}
		// HashMap<String, TreeSet<String>> availableJson = ResultIndex.availableJson(filtered);
		HashMap<String, TreeSet<String>> availableJson = LoadIndexFiles.M_KWD_INDEX.availableJson();
		try (PrintWriter out = response.getWriter())
		{
			if (null != filtered)
			{
				out.println("{");
				out.print("\"headers\": ");
				if (filtered.size() < 1)
				{
					out.print("[ ]");
				}
				else
				{
					out.print(filtered.first().getJsonHeaders(isAdvanced));
				}
				out.println(",");
				out.print("\"data\": ");
				out.println("[");
				if (filtered.size() < 1)
				{
					out.print(" ");
				}
				else
				{
					boolean first = true;
					for (KwdEntry re : filtered)
					{
						if (true == first)
						{
							first = false;
						}
						else
						{
							out.println(",");
						}
						out.print(re.getJson(gson, null, isAdvanced));
					}
					out.println("");
				}
				out.println("]");
				for (Map.Entry<String, TreeSet<String>> entry : availableJson.entrySet())
				{
					out.println(",");
					out.print("\"" + entry.getKey() + "\": ");
					out.print(gson.toJson(entry.getValue()));
				}
				out.println("");
				out.println("}");
			}
			else
			{
				this.log("query - no indexes yet");
			}
		}
	}

	protected void handleAdvancedFilter(HttpServletRequest request, HttpServletResponse response) throws IOException
	{
		boolean isAdvanced = true;
		String json = request.getParameter("search");
		GsonBuilder builder = new GsonBuilder();
		builder.setPrettyPrinting();
		Gson gson = builder.create();
		if (null == json)
		{
			json = "{}";
		}
		this.log("query=" + json);
		TreeSet<ResultEntry> filtered = query.getFilteredAdvanced(json);
		if (null != filtered)
		{
			this.log("Query handleAdvancedFilter count = " + filtered.size());
		}
		// HashMap<String, TreeSet<String>> availableJson = ResultIndex.availableJson(filtered);
		HashMap<String, TreeSet<String>> availableJson = LoadIndexFiles.M_RESULT_INDEX.availableJson();
		try (PrintWriter out = response.getWriter())
		{
			if (null != filtered)
			{
				out.println("{");
				out.print("\"headers\": ");
				if (filtered.size() < 1)
				{
					out.print("[ ]");
				}
				else
				{
					out.print(filtered.first().getJsonHeaders(isAdvanced));
				}
				out.println(",");
				out.print("\"data\": ");
				out.println("[");
				if (filtered.size() < 1)
				{
					out.print(" ");
				}
				else
				{
					boolean first = true;
					for (ResultEntry re : filtered)
					{
						if (true == first)
						{
							first = false;
						}
						else
						{
							out.println(",");
						}
						out.print(re.getJson(gson, null, isAdvanced));
					}
					out.println("");
				}
				out.println("]");
				for (Map.Entry<String, TreeSet<String>> entry : availableJson.entrySet())
				{
					out.println(",");
					out.print("\"" + entry.getKey() + "\": ");
					out.print(gson.toJson(entry.getValue()));
				}
				out.println("");
				out.println("}");
			}
			else
			{
				this.log("query - no indexes yet");
			}
		}
	}

	protected void handleDataFilter(HttpServletRequest request, HttpServletResponse response) throws IOException
	{
		boolean isAdvanced = false;
		String json = request.getParameter("search");
		GsonBuilder builder = new GsonBuilder();
		builder.setPrettyPrinting();
		Gson gson = builder.create();
		if (null == json)
		{
			json = "{}";
		}
		this.log("query=" + json);
		TreeSet<ResultEntry> filtered = query.getFilteredData(json);
		if (null != filtered)
		{
			this.log("Query handleAdvancedFilter count = " + filtered.size());
		}
		// HashMap<String, TreeSet<String>> availableJson = ResultIndex.availableJson(filtered);
		HashMap<String, TreeSet<String>> availableJson = LoadIndexFiles.M_RESULT_INDEX.availableJson();
		try (PrintWriter out = response.getWriter())
		{
			if (null != filtered)
			{
				out.println("{");
				out.print("\"headers\": ");
				if (filtered.size() < 1)
				{
					out.print("[ ]");
				}
				else
				{
					out.print(filtered.first().getJsonHeaders(isAdvanced));
				}
				out.println(",");
				out.print("\"data\": ");
				out.println("[");
				if (filtered.size() < 1)
				{
					out.print(" ");
				}
				else
				{
					boolean first = true;
					for (ResultEntry re : filtered)
					{
						if (true == first)
						{
							first = false;
						}
						else
						{
							out.println(",");
						}
						out.print(re.getJson(gson, null, isAdvanced));
					}
					out.println("");
				}
				out.println("]");
				for (Map.Entry<String, TreeSet<String>> entry : availableJson.entrySet())
				{
					out.println(",");
					out.print("\"" + entry.getKey() + "\": ");
					out.print(gson.toJson(entry.getValue()));
				}
				out.println("");
				out.println("}");
			}
			else
			{
				this.log("query - no indexes yet");
			}
		}
	}

	protected void handleDscFilter(HttpServletRequest request, HttpServletResponse response) throws IOException
	{
		boolean isAdvanced = false;
		String json = request.getParameter("search");
		GsonBuilder builder = new GsonBuilder();
		builder.setPrettyPrinting();
		Gson gson = builder.create();
		if (null == json)
		{
			json = "{}";
		}
		this.log("query=" + json);
		TreeSet<DscEntry> filtered = query.getFilteredDsc(json);
		if (null != filtered)
		{
			this.log("Query handleAdvancedFilter count = " + filtered.size());
		}
		// HashMap<String, TreeSet<String>> availableJson = ResultIndex.availableJson(filtered);
		HashMap<String, TreeSet<String>> availableJson = LoadIndexFiles.M_DSC_INDEX.availableJson();
		try (PrintWriter out = response.getWriter())
		{
			if (null != filtered)
			{
				out.println("{");
				out.print("\"headers\": ");
				if (filtered.size() < 1)
				{
					out.print("[ ]");
				}
				else
				{
					out.print(filtered.first().getJsonHeaders(isAdvanced));
				}
				out.println(",");
				out.print("\"data\": ");
				out.println("[");
				if (filtered.size() < 1)
				{
					out.print(" ");
				}
				else
				{
					boolean first = true;
					for (DscEntry re : filtered)
					{
						if (true == first)
						{
							first = false;
						}
						else
						{
							out.println(",");
						}
						out.print(re.getJson(gson, null, isAdvanced));
					}
					out.println("");
				}
				out.println("]");
				for (Map.Entry<String, TreeSet<String>> entry : availableJson.entrySet())
				{
					out.println(",");
					out.print("\"" + entry.getKey() + "\": ");
					out.print(gson.toJson(entry.getValue()));
				}
				out.println("");
				out.println("}");
			}
			else
			{
				this.log("query - no indexes yet");
			}
		}
	}

	/**
	 * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
	 * methods.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	protected void processRequest(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException
	{
		try
		{
			ScanCheck.checkForSecurity(request);
			long start = System.currentTimeMillis();
			response.setContentType("application/json;charset=UTF-8");
			String show = request.getParameter("show");
			ScanCheck.checkForMetaCharacters(show);
			{
				GsonBuilder builder = new GsonBuilder();
				builder.setPrettyPrinting();
				Gson gson = builder.create();
				gson.fromJson(request.getParameter("search"), Object.class);
			}
			if ("advanced".equals(show))
			{
				log("query::processRequest handleAdvancedFilter");
				handleAdvancedFilter(request, response);
			}
			else
			{
				if ("kwd".equals(show))
				{
					log("query::processRequest handleKWDFilter");
					handleKWDFilter(request, response);
				}
				else
				{
					if ("dsc".equals(show))
					{
						log("query::processRequest handleDSCFilter");
						handleDscFilter(request, response);
					}
					else
					{
						log("query::processRequest handleMatrix");
						handleDataFilter(request, response);
					}
				}
			}
			long finish = System.currentTimeMillis();
			this.log("query time = " + ((finish - start) / 1000.00) + " seconds");
		}
		catch (Exception exp)
		{
			log("query::processRequest failed", exp);
			response.setStatus(400);
			response.sendError(400);
		}
	}

	/////////////////////////////////
	////
	//// Methods for Advanced Filter
	////
	/////////////////////////////////

	static public TreeSet<KwdEntry> getFilteredKwd(String theJSON)
	{
		Query queryInst = new Gson().fromJson(theJSON, Query.class);
		// TODO: do actual filtering here
		TreeSet<KwdEntry> filtered = LoadIndexFiles.M_KWD_INDEX.filter(
				queryInst.mDataVersions, queryInst.mTestVersions,
				queryInst.mSources, queryInst.mProgram,
				queryInst.mProjects, queryInst.mCategories,
				queryInst.mPlatforms, queryInst.mData,
				queryInst.mDetails, queryInst.mJobType, 
				queryInst.mAnalysisPath,
				queryInst.mCutoffFlag, queryInst.mBatchesCalledFlag);
		return filtered;
	}

	static public TreeSet<ResultEntry> getFilteredAdvanced(String theJSON)
	{
		Query queryInst = new Gson().fromJson(theJSON, Query.class);
		// TODO: do actual filtering here
		TreeSet<ResultEntry> filtered = LoadIndexFiles.M_RESULT_INDEX.filter(queryInst.mDataVersions, queryInst.mTestVersions,
				queryInst.mSources, queryInst.mProgram,
				queryInst.mProjects, queryInst.mCategories,
				queryInst.mPlatforms, queryInst.mData,
				queryInst.mDetails, queryInst.mJobType,
				queryInst.GTE_samples_matrix, queryInst.LTE_samples_matrix, queryInst.isNaN_samples_matrix,
				queryInst.GTE_samples_mutations, queryInst.LTE_samples_mutations, queryInst.isNaN_samples_mutations,
				queryInst.GTE_features_matrix, queryInst.LTE_features_matrix, queryInst.isNaN_features_matrix,
				queryInst.GTE_features_mutations, queryInst.LTE_features_mutations, queryInst.isNaN_features_mutations,
				queryInst.GTE_unknown_batches, queryInst.LTE_unknown_batches, queryInst.isNaN_unknown_batches,
				queryInst.GTE_batch_unique_cnt, queryInst.LTE_batch_unique_cnt, queryInst.isNaN_batch_unique_cnt,
				queryInst.GTE_correlated_batch_types, queryInst.LTE_correlated_batch_types, queryInst.isNaN_correlated_batch_types,
				queryInst.GTE_batch_type_count, queryInst.LTE_batch_type_count, queryInst.isNaN_batch_type_count);
		return filtered;
	}

	static public TreeSet<ResultEntry> getFilteredData(String theJSON)
	{
		Query queryInst = new Gson().fromJson(theJSON, Query.class);
		// TODO: do actual filtering here
		TreeSet<ResultEntry> filtered = LoadIndexFiles.M_RESULT_INDEX.filter(queryInst.mDataVersions, queryInst.mTestVersions,
				queryInst.mSources, queryInst.mProgram,
				queryInst.mProjects, queryInst.mCategories,
				queryInst.mPlatforms, queryInst.mData,
				queryInst.mDetails, queryInst.mJobType,
				null, null, false,
				null, null, false,
				null, null, false,
				null, null, false,
				null, null, false,
				null, null, false,
				null, null, false,
				null, null, false);
		return filtered;
	}

	static public TreeSet<DscEntry> getFilteredDsc(String theJSON)
	{
		Query queryInst = new Gson().fromJson(theJSON, Query.class);
		// TODO: do actual filtering here
		TreeSet<DscEntry> filtered = LoadIndexFiles.M_DSC_INDEX.filter(queryInst.mDataVersions, queryInst.mTestVersions,
				queryInst.mSources, queryInst.mProgram,
				queryInst.mProjects, queryInst.mCategories,
				queryInst.mPlatforms, queryInst.mData,
				queryInst.mDetails, queryInst.mJobType,
				queryInst.mAnalysisPath, queryInst.mOverallDSCpvalue, 
				queryInst.mOverallDSCmax, queryInst.mOverallDSCmin);
		return filtered;
	}

	
	
	// <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
	/**
	 * Handles the HTTP <code>GET</code> method.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException
	{
		processRequest(request, response);
	}

	/**
	 * Handles the HTTP <code>POST</code> method.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException
	{
		processRequest(request, response);
	}

	/**
	 * Returns a short description of the servlet.
	 *
	 * @return a String containing servlet description
	 */
	@Override
	public String getServletInfo()
	{
		return "Short description";
	}// </editor-fold>

}
