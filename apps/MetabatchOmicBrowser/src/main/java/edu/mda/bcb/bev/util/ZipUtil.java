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

package edu.mda.bcb.bev.util;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Base64;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.compress.utils.IOUtils;

/**
 *
 * @author Tod-Casasent
 */
public class ZipUtil
{
	static public boolean existsFile(String theZip, String theFile, HttpServlet theServlet) throws IOException
	{
		if (theFile.startsWith("/"))
		{
			theFile = theFile.substring(1);
		}
		if (theFile.startsWith("\\"))
		{
			theFile = theFile.substring(1);
		}
		boolean exists = false;
		theServlet.log("existsFile theZip=" + theZip);
		theServlet.log("existsFile theFile=" + theFile);
		try(ZipFile zf = new ZipFile(new File(theZip)))
		{
			Enumeration<? extends ZipEntry> entries = zf.entries();
			while(entries.hasMoreElements())
			{
				ZipEntry entry = entries.nextElement();
				String entryName = entry.getName();
				if (entryName.startsWith("/"))
				{
					entryName = entryName.substring(1);
				}
				if (entryName.startsWith("\\"))
				{
					entryName = entryName.substring(1);
				}
				if (entryName.equals(theFile))
				{
					theServlet.log("existsFile found=" + entry.getName());
					exists = true;
				}
			}
		}
		return exists;
	}
	
	static public void streamFile(String theZip, String theFile, HttpServletResponse theResponse, HttpServlet theServlet, String theContentType) throws IOException
	{
		if (theFile.startsWith("/"))
		{
			theFile = theFile.substring(1);
		}
		if (theFile.startsWith("\\"))
		{
			theFile = theFile.substring(1);
		}
		theServlet.log("streamFile theZip=" + theZip);
		theServlet.log("streamFile theFile=" + theFile);
		try(ZipFile zf = new ZipFile(new File(theZip)))
		{
			Enumeration<? extends ZipEntry> entries = zf.entries();
			while(entries.hasMoreElements())
			{
				ZipEntry entry = entries.nextElement();
				String entryName = entry.getName();
				if (entryName.startsWith("/"))
				{
					entryName = entryName.substring(1);
				}
				if (entryName.startsWith("\\"))
				{
					entryName = entryName.substring(1);
				}
				if (entryName.equals(theFile))
				{
					try(InputStream is = zf.getInputStream(entry))
					{
						theResponse.setContentType(theContentType);
						try (ServletOutputStream out = theResponse.getOutputStream())
						{
							IOUtils.copy(is, out);
						}
					}
					return;
				}
			}
		}
		throw new IOException(theFile + " not found");
	}
	
	public static String imgToBase64String(BufferedImage img, final String formatName)
	{
		final ByteArrayOutputStream os = new ByteArrayOutputStream();
		try
		{
			ImageIO.write(img, formatName, os);
			return Base64.getEncoder().encodeToString(os.toByteArray());
		}
		catch (final IOException ioe)
		{
			throw new UncheckedIOException(ioe);
		}
	}
	
	static public void streamImageB64(String theZip, String theFile, HttpServletResponse theResponse, HttpServlet theServlet, String theContentType) throws IOException
	{
		if (theFile.startsWith("/"))
		{
			theFile = theFile.substring(1);
		}
		if (theFile.startsWith("\\"))
		{
			theFile = theFile.substring(1);
		}
		theServlet.log("streamImageB64 theZip=" + theZip);
		theServlet.log("streamImageB64 theFile=" + theFile);
		try(ZipFile zf = new ZipFile(new File(theZip)))
		{
			Enumeration<? extends ZipEntry> entries = zf.entries();
			while(entries.hasMoreElements())
			{
				ZipEntry entry = entries.nextElement();
				String entryName = entry.getName();
				if (entryName.startsWith("/"))
				{
					entryName = entryName.substring(1);
				}
				if (entryName.startsWith("\\"))
				{
					entryName = entryName.substring(1);
				}
				if (entryName.equals(theFile))
				{
/*
					theServlet.log("matched");
					try(InputStream is = zf.getInputStream(entry))
					{
						theResponse.setContentType(theContentType);
						try (ServletOutputStream out = theResponse.getOutputStream())
						{
							try (Base64OutputStream newOut = new Base64OutputStream(out))
							{
								IOUtils.copy(is, newOut);
								newOut.flush();
								out.flush();
								newOut.close();
								out.close();
							}
						}
					}
					theServlet.log("post matched");
*/

					theServlet.log("matched");
					BufferedImage image = null;
					try(InputStream is = zf.getInputStream(entry))
					{
						image = ImageIO.read(is);
					}
					String b64 = imgToBase64String(image, "png");
					theResponse.setContentType(theContentType);
					try (ServletOutputStream out = theResponse.getOutputStream())
					{
						out.write(b64.getBytes());
						out.flush();
						out.close();
					}
					theServlet.log("post matched");
					return;
				}
			}
		}
		throw new IOException(theFile + " not found");
	}
}
