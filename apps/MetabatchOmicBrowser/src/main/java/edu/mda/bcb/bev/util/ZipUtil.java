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

package edu.mda.bcb.bev.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import javax.imageio.ImageIO;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletResponse;
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
		//long timeStart = System.currentTimeMillis();
		//theServlet.log("streamFile start = " + timeStart);
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
		//long timeOpen = System.currentTimeMillis();
		//theServlet.log("streamFile open zip = " + timeOpen);
		try(ZipFile zf = new ZipFile(new File(theZip)))
		{
			Enumeration<? extends ZipEntry> entries = zf.entries();
			//long timeIterate = System.currentTimeMillis();
			//theServlet.log("streamFile iterate zip = " + timeIterate);
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
					//try(InputStream is = new FileInputStream( new File("/code/development/All_ngchm.ngchm")))
					{
						theResponse.setContentType(theContentType);
						//theResponse.setHeader("Content-Length", Long.toString(entry.getSize()));
						theResponse.setContentLengthLong(entry.getSize());
						// supposedly prevents chunking
						theResponse.setHeader("Connection", "close");
						theResponse.setHeader("Transfer-Encoding", "gzip");
						try (ServletOutputStream out = theResponse.getOutputStream())
						{
							//long timeCopy1 = System.currentTimeMillis();
							//theServlet.log("streamFile start copy = " + timeCopy1);
							//theServlet.log("streamFile start to copy = " + (timeCopy1-timeStart));
							IOUtils.copy(is, out);
							//long timeCopy2 = System.currentTimeMillis();
							//theServlet.log("streamFile finish copy = " + timeCopy2);
							//theServlet.log("streamFile copy time = " + (timeCopy2-timeCopy1));
						}
					}
					//long timeDone = System.currentTimeMillis();
					//theServlet.log("streamFile copy done = " + timeDone);
					//theServlet.log("streamFile total time = " + (timeDone-timeStart));
					return;
				}
			}
		}
		throw new IOException(theFile + " not found");
	}
	
	static public boolean parseFirstLine(String theZip, String theFile, HttpServletResponse theResponse, HttpServlet theServlet, String theContentType) throws IOException
	{
		//long timeStart = System.currentTimeMillis();
		//theServlet.log("parseFirstLine start = " + timeStart);
		if (theFile.startsWith("/"))
		{
			theFile = theFile.substring(1);
		}
		if (theFile.startsWith("\\"))
		{
			theFile = theFile.substring(1);
		}
		theServlet.log("parseFirstLine theZip=" + theZip);
		theServlet.log("parseFirstLine theFile=" + theFile);
		//long timeOpen = System.currentTimeMillis();
		//theServlet.log("parseFirstLine open zip = " + timeOpen);
		try(ZipFile zf = new ZipFile(new File(theZip)))
		{
			Enumeration<? extends ZipEntry> entries = zf.entries();
			//long timeIterate = System.currentTimeMillis();
			//theServlet.log("parseFirstLine iterate zip = " + timeIterate);
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
					try(BufferedReader br = new BufferedReader(new InputStreamReader(zf.getInputStream(entry))))
					{
						String headers = br.readLine();
						String [] hdrsArray = headers.split("\t", -1);
						ArrayList<String> alStr = new ArrayList<>();
						for (int index=1;index<hdrsArray.length;index++)
						{
							alStr.add(hdrsArray[index]);
						}
						GsonBuilder builder = new GsonBuilder();
						builder.setPrettyPrinting();
						Gson gson = builder.create();
						String json = gson.toJson(alStr);
						//theServlet.log("parseFirstLine json = " + json);
						theResponse.setContentType(theContentType);
						//theResponse.setHeader("Content-Length", Long.toString(entry.getSize()));
						//theResponse.setContentLengthLong(json.getSize());
						// supposedly prevents chunking
						theResponse.setHeader("Connection", "close");
						theResponse.setHeader("Transfer-Encoding", "gzip");
						try (ServletOutputStream out = theResponse.getOutputStream())
						{
							out.println(json);
						}
					}
					//long timeDone = System.currentTimeMillis();
					//theServlet.log("parseFirstLine copy done = " + timeDone);
					//theServlet.log("parseFirstLine total time = " + (timeDone-timeStart));
					return true;
				}
			}
		}
		return false;
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
