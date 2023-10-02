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
import edu.mda.bcb.bev.indexes.Indexes;
import edu.mda.bcb.bev.indexes.KwdEntry;
import edu.mda.bcb.bev.indexes.ResultEntry;
import edu.mda.bcb.bev.util.ScanCheck;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Calendar;
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
@WebServlet(name = "manifest", urlPatterns =
{
	"/manifest"
})
public class manifest extends HttpServlet
{

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
			response.setContentType("application/text;charset=UTF-8");
			Calendar calendar = Calendar.getInstance();
			SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy_MM_dd_HHmm");
			response.setHeader("Content-Disposition", "attachment; filename=\"manifest-" + dateFormat.format(calendar.getTime()) + ".tsv\"");
			String json = request.getParameter("search");
			GsonBuilder builder = new GsonBuilder();
			builder.setPrettyPrinting();
			Gson gson = builder.create();
			if (null==json)
			{
				json = "{}";
			}
			gson.fromJson(json, Object.class);
			// this.log("manifest=" + json);
			String show = request.getParameter("show");
			ScanCheck.checkForMetaCharacters(show);
			try (PrintWriter out = response.getWriter())
			{
				boolean gotResults = false;
				// ADV-FILTER handle show=advanced
				if ("advanced".equals(show))
				{
					boolean isAdvanced = true;
					TreeSet<ResultEntry> filtered = query.getFilteredAdvanced(json);
					if (filtered.size()>0)
					{
						out.println(filtered.first().getHeaders(isAdvanced));
						for (ResultEntry re : filtered)
						{
							out.println(re.toString(null, json, isAdvanced));
						}
					}
					else
					{
						out.println("No entries");
					}
				}
				else
				{
					boolean isAdvanced = false;
					Indexes myIndexes = null;
					if ("dsc".equals(show))
					{
						TreeSet<DscEntry> filtered = query.getFilteredDsc(json);
						if (filtered.size()>0)
						{
							out.println(filtered.first().getHeaders(isAdvanced));
							for (DscEntry re : filtered)
							{
								out.println(re.toString(null, json, isAdvanced));
							}
						}
						else
						{
							out.println("No entries");
						}
					}
					else if ("kwd".equals(show))
					{
						TreeSet<KwdEntry> filtered = query.getFilteredKwd(json);
						if (filtered.size()>0)
						{
							out.println(filtered.first().getHeaders(isAdvanced));
							for (KwdEntry re : filtered)
							{
								out.println(re.toString(null, json, isAdvanced));
							}
						}
						else
						{
							out.println("No entries");
						}
					}
					else 
					{
						TreeSet<ResultEntry> filtered = query.getFilteredData(json);
						if (filtered.size()>0)
						{
							out.println(filtered.first().getHeaders(isAdvanced));
							for (ResultEntry re : filtered)
							{
								out.println(re.toString(null, json, isAdvanced));
							}
						}
						else
						{
							out.println("No entries");
						}
					}
				}
				if (false==gotResults)
				{
					this.log("query - no indexes yet");
				}
			}
		}
		catch (Exception exp)
		{
			log("manifest::processRequest failed", exp);
			response.setStatus(400);
			response.sendError(400);
		}
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
