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

package edu.mda.bcb.bev.servlets;

import edu.mda.bcb.bev.indexes.Indexes;
import edu.mda.bcb.bev.startup.LoadIndexFiles;
import edu.mda.bcb.bev.util.ZipUtil;
import java.io.File;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author Tod-Casasent
 */
@WebServlet(name = "dstext", urlPatterns =
{
	"/dstext"
})
public class dstext extends HttpServlet
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
			this.log("dstext: get json index");
			String id = request.getParameter("id");
			String text = request.getParameter("text");
			if (text.startsWith("/"))
			{
				text = text.substring(1);
			}
			this.log("dstext: id = " + id);
			this.log("dstext: text = " + text);
			Indexes myIndexes = LoadIndexFiles.M_BEV_DIA_INDEXES;
			File zipPath = myIndexes.getResultsPath(id);
			this.log("dstext: zipPath = " + zipPath.getAbsolutePath());
			this.log("dstext: call streamFile");
			ZipUtil.streamFile(zipPath.getAbsolutePath(), text, response, this, "application/text;charset=UTF-8");
			this.log("dstext: true after streamFile");
		}
		catch(Exception exp)
		{
			log("dstext::processRequest failed", exp);
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
