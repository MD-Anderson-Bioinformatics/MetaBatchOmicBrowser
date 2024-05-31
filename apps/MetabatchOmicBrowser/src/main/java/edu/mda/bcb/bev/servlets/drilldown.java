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
package edu.mda.bcb.bev.servlets;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import edu.mda.bcb.bev.indexes.ResultEntry;
import edu.mda.bcb.bev.indexes.ResultIndex;
import edu.mda.bcb.bev.query.Query;
import edu.mda.bcb.bev.startup.LoadIndexFiles;
import static edu.mda.bcb.bev.startup.LoadIndexFiles.M_RESULT_INDEX;
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
@WebServlet(name = "drilldown", urlPatterns =
{
	"/drilldown"
})
public class drilldown extends HttpServlet
{

	protected void populateForSelections(TreeSet<String> theTree, ArrayList<String> theList, Set<String> theKeys, int theOptionCount)
	{
		if ((theList.size() > 0) && (theOptionCount < 2))
		{
			theTree.addAll(theKeys);
		}
	}

	protected void handleDrillFilter(HttpServletRequest request, HttpServletResponse response) throws IOException
	{
		boolean isAdvanced = false;
		String json = request.getParameter("drill");
		GsonBuilder builder = new GsonBuilder();
		builder.setPrettyPrinting();
		Gson gson = builder.create();
		if (null == json)
		{
			json = "{}";
		}
		this.log("drilldown json=" + json);
		TreeSet<ResultEntry> filtered = drilldown.getFilteredDrilldown(json);
		if (null != filtered)
		{
			this.log("drilldown handleDrillFilter count = " + filtered.size());
		}
		// HashMap<String, TreeSet<String>> availableFilterJson = ResultIndex.availableFilterJson(filtered);
		HashMap<String, TreeSet<String>> availableJson = availableDrilldownJson(filtered, json);
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
				this.log("drilldown - no indexes yet");
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
			if (null!=LoadIndexFiles.M_RESULT_INDEX)
			{
				GsonBuilder builder = new GsonBuilder();
				builder.setPrettyPrinting();
				Gson gson = builder.create();
				gson.fromJson(request.getParameter("drill"), Object.class);
				log("drilldown::processRequest handleDrillFilter");
				handleDrillFilter(request, response);
			}
			else
			{
				log("drilldown::processRequest indicate nothing to load");
				try (PrintWriter out = response.getWriter())
				{
					out.print("{}");
				}
			}
			long finish = System.currentTimeMillis();
			this.log("drilldown time = " + ((finish - start) / 1000.00) + " seconds");
		}
		catch (Exception exp)
		{
			log("drilldown::processRequest failed", exp);
			response.setStatus(400);
			response.sendError(400);
		}
	}

	static public TreeSet<ResultEntry> getFilteredDrilldown(String theJSON)
	{
		Query queryInst = new Gson().fromJson(theJSON, Query.class);
		// TODO: do actual filtering here
		TreeSet<ResultEntry> drilled = LoadIndexFiles.M_RESULT_INDEX.drilldown(
				queryInst.mSources, queryInst.mProgram,
				queryInst.mProjects, queryInst.mCategories,
				queryInst.mPlatforms, queryInst.mData,
				queryInst.mDetails, queryInst.mJobType,
				queryInst.mDataVersions, queryInst.mTestVersions);
		return drilled;
	}
	
	// static public HashMap<String, TreeSet<String>> availableFilterJson(TreeSet<ResultEntry> theResults)
	static public HashMap<String, TreeSet<String>> availableDrilldownJson(TreeSet<ResultEntry> theFilteredEntries,
			String theJSON)
	{
		Query queryInst = new Gson().fromJson(theJSON, Query.class);
		queryInst.setNullToEmpty();
		HashMap<String, TreeSet<String>> hm = new HashMap<>();
		// populated query options into available
		// should only be one value, so get(0) should be valid
		if ((null!=queryInst.mSources) && (!queryInst.mSources.isEmpty()))
		{
			ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableSources", queryInst.mSources.get(0));
		}
		if ((null!=queryInst.mProgram) && (!queryInst.mProgram.isEmpty()))
		{
			ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableProgram", queryInst.mProgram.get(0));
		}
		if ((null!=queryInst.mProjects) && (!queryInst.mProjects.isEmpty()))
		{
			ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableProjects", queryInst.mProjects.get(0));
		}
		if ((null!=queryInst.mCategories) && (!queryInst.mCategories.isEmpty()))
		{
			ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableCategories", queryInst.mCategories.get(0));
		}
		if ((null!=queryInst.mPlatforms) && (!queryInst.mPlatforms.isEmpty()))
		{
			ResultIndex.drilldownHashMapTreeSetForJson(hm, "availablePlatforms", queryInst.mPlatforms.get(0));
		}
		if ((null!=queryInst.mData) && (!queryInst.mData.isEmpty()))
		{
			ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableData", queryInst.mData.get(0));
		}
		if ((null!=queryInst.mDetails) && (!queryInst.mDetails.isEmpty()))
		{
			ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableDetails", queryInst.mDetails.get(0));
		}
		if ((null!=queryInst.mJobType) && (!queryInst.mJobType.isEmpty()))
		{
			ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableJobType", queryInst.mJobType.get(0));
		}
		if ((null!=queryInst.mDataVersions) && (!queryInst.mDataVersions.isEmpty()))
		{
			ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableDataVersions", queryInst.mDataVersions.get(0));
		}
		if ((null!=queryInst.mTestVersions) && (!queryInst.mTestVersions.isEmpty()))
		{
			ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableTestVersions", queryInst.mTestVersions.get(0));
		}
		//for(ResultEntry re: theResults)
		for (ResultEntry re : theFilteredEntries)
		{
			// populate first search parameter that is not populated in the JSON query
			if (queryInst.mSources.isEmpty())
			{
				ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableSources", re.source);
			}
			else if (queryInst.mProgram.isEmpty())
			{
				ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableProgram", re.program);
			}
			else if (queryInst.mProjects.isEmpty())
			{
				ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableProjects", re.project);
			}
			else if (queryInst.mCategories.isEmpty())
			{
				ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableCategories", re.category);
			}
			else if (queryInst.mPlatforms.isEmpty())
			{
				ResultIndex.drilldownHashMapTreeSetForJson(hm, "availablePlatforms", re.platform);
			}
			else if (queryInst.mData.isEmpty())
			{
				ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableData", re.data);
			}
			else if (queryInst.mDetails.isEmpty())
			{
				ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableDetails", re.details);
			}
			else if (queryInst.mJobType.isEmpty())
			{
				ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableJobType", re.job_type);
			}
			else if (queryInst.mDataVersions.isEmpty())
			{
				ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableDataVersions", re.data_version);
			}
			else if (queryInst.mTestVersions.isEmpty())
			{
				ResultIndex.drilldownHashMapTreeSetForJson(hm, "availableTestVersions", re.test_version);
			}
		}
		return hm;
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
