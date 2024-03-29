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

import edu.mda.bcb.bev.startup.LoadIndexFiles;
import edu.mda.bcb.bev.util.ScanCheck;
import edu.mda.bcb.bev.util.ZipUtil;
import java.io.File;
import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 *
 * @author Tod-Casasent
 */
@WebServlet(name = "dsbtypes", urlPatterns =
{
	"/dsbtypes"
})
public class dsbtypes extends HttpServlet
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
			this.log("dsbtypes: get json index");
			String id = request.getParameter("id");
			ScanCheck.checkForMetaCharacters(id);
			File zipPath = LoadIndexFiles.M_PATH_LOOKUP.getResultsPath(id);
			this.log("dsbtypes: zipPath = " + zipPath.getAbsolutePath());
			String indexFile = "BatchData.tsv";
			if (false == ZipUtil.parseFirstLine(zipPath.getAbsolutePath(), indexFile, response, this, "application/json;charset=UTF-8"))
			{
				response.setContentType("application/json;charset=UTF-8");
				//theResponse.setHeader("Content-Length", Long.toString(entry.getSize()));
				//theResponse.setContentLengthLong(json.getSize());
				// supposedly prevents chunking
				response.setHeader("Connection", "close");
				response.setHeader("Transfer-Encoding", "gzip");
				try (ServletOutputStream out = response.getOutputStream())
				{
					out.println("[ \"No Batch Info Found\" ]");
				}

			}
			this.log("dsbtypes: true after streamFile");
		}
		catch (Exception exp)
		{
			log("dsbtypes::processRequest failed", exp);
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
