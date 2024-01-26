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

package edu.mda.bcb.bev.util;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Date;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

// This clas is run pre-build to generate a stand-alone HTML file

public class BEV_AppGenerator
{

	// Encode an image file into its Base 64 string representation
	private static String encodeFileToBase64Binary(String image) throws Exception
	{
		String encodedfile = null;
		File file = new File(image);
		try (FileInputStream fileInputStreamReader = new FileInputStream(file))
		{
			byte[] bytes = new byte[(int) file.length()];
			fileInputStreamReader.read(bytes);
			encodedfile = "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes);
		}
		return encodedfile;
	}

	// Read a CSS file and convert to a String
	public static String styleToString(String webDir, String cssFile) throws Exception
	{
		StringBuffer strBuff = new StringBuffer();
		BufferedReader br = new BufferedReader(new FileReader(webDir + "/" + cssFile));
		System.out.println("BEV_AppGenerator::styleToString webDir=" + webDir);
		System.out.println("BEV_AppGenerator::styleToString cssFile=" + cssFile);
		Path pathSubPath = Paths.get(cssFile).getParent();
		String subPath = "";
		if(null!=pathSubPath)
		{
			subPath = pathSubPath.toString() + "/";
		}
		System.out.println("BEV_AppGenerator::styleToString subPath='" + subPath +"'");

		// Regex for CSS based image requests. Ex: 'background-image: url(images/imageFile.png)'
		// Will extract contents between parens and quotes. Ex: images/imageFile.png
		Pattern imgUrlRegex = Pattern.compile("url\\([',\"](images[^\\)]+)[',\"]\\)", Pattern.CASE_INSENSITIVE);
		Matcher match;

		// Loop through BufferedReader and write lines to strBuff. Convert image references to base64 encoded strings.
		String line = br.readLine();
		while (line != null)
		{
			String toks[] = line.split("\\s+");
			for (int i = 0; i < toks.length; i++)
			{
				match = imgUrlRegex.matcher(toks[i]);
				if (match.find())
				{
					// Replace "background-image: url('/images/foo/bar.png');" with base64 encoded string
					String image = match.group(1);
					System.out.println("BEV_AppGenerator::styleToString image=" + image);
					image = encodeFileToBase64Binary(webDir + "/" + subPath + image);
					image = "url(" + image + ");";
					toks[i] = image;
				}
				strBuff.append(toks[i].replace("\"", "\\\"") + " ");
			}
			line = br.readLine();
		}
		br.close();
		return strBuff.toString();
	}

	// Read a JS file and convert it to String. Replace image tag source references with base64 encoded strings
	public static String jsToString(String webDir, String jsFile) throws Exception
	{
		StringBuffer strBuff = new StringBuffer();
		BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(webDir + '/' + jsFile), "UTF8"));

		// Regex for img.src in javscript. Ex: var img = document.createElement("img"); img.src "images/imageFile.png";
		// If matched, first group wil be the image String path. Ex. images/imageFile.png
		Pattern imgSrcRegex = Pattern.compile(".src\\s{0,}=\\s{0,}[',\"](images[a-zA-Z0-9_,\\/, .]{0,})[',\"]");

		// Regex for boxplot images refferences. Ex. d3Selection.attr("xlink:xlink:href", "/path/to/img.png")
		// If matched, first group will be the image String path. Ex. /path/to/img.png
		Pattern boxplotRegex = Pattern.compile(".\\s{0,}attr\\s{0,}\\(\\s{0,}[',\"]xlink:xlink:href[',\"]\\s{0,},\\s{0,}[',\"]([a-zA-Z0-9_,\\/,.]{0,})[',\"]");

		// Loop through BufferedReader and write lines to strBuff. Convert image references to base64 encoded strings.
		String line = br.readLine();
		while (line != null)
		{
			Matcher matchSrc = imgSrcRegex.matcher(line);
			Matcher matchBoxplot = boxplotRegex.matcher(line);
			// If a Matcher was matched, get the matched instance
			Matcher match = matchSrc.find() ? matchSrc : (matchBoxplot.find() ? matchBoxplot : null);
			if (match != null)
			{
				// Replace the string path with a base64 encoded string
				String imagePath = match.group(1);
				String imageString = encodeFileToBase64Binary(webDir + '/' + imagePath);
				String lineReplaced = new StringBuilder(line).replace(match.start(1), match.end(1), imageString).toString();
				strBuff.append(lineReplaced);
				strBuff.append("\n");
			}
			else
			{
				strBuff.append(line);
				strBuff.append("\n");
			}
			line = br.readLine();
		}
		return strBuff.toString();
	}

	// Return a token from a string and a pattern
	public static String extractTokenFromString(String line, String pattern, String delimiter) throws Exception
	{
		String result = "";
		String[] toks = line.split(delimiter);
		for (String tok : toks)
		{
			// Possibly do more general pattern matching approach
			if (tok.contains(pattern))
			{
				result = tok;
				break;
			}
		}
		if (result.equals(""))
		{
			throw new Exception("Did not match the pattern passed");
		}
		return result;
	}

	// Overloaded defualt setting
	public static String extractTokenFromString(String line, String pattern) throws Exception
	{
		// Default delimiter of space
		return extractTokenFromString(line, pattern, "\\s+");
	}

	// Read index.html and output a single "compiled" HTML file containing all javascript, css, images, and html.
	public static void main(String[] args)
	{
		System.out.println("BEGIN BEV_AppGenerator  " + new Date());
		try
		{
			if (args.length < 2)
			{
				System.out.println("Usage: BEV_AppGenerator <web directory> <output file>");
				System.exit(1);
			}
			// BufferedReader and BufferWriter for Main loop
			System.out.println("BEV_AppGenerator compress index.html at " +args[0]);
			System.out.println("BEV_AppGenerator write to " + args[1]);
			BufferedReader br = new BufferedReader(new FileReader(args[0] + "/" + "index.html"));
			BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(args[1]), "UTF8"));

			// Loop through index.html and "compile" all source files to the HTML output file.
			String line = br.readLine();
			while (line != null)
			{
				if (line.contains("type=\"text/javascript\"") && (line.contains("src=")))
				{
					// Recognized Javascript file; convert to string and write to "compiled" output
					String jsFile = extractTokenFromString(line, "src=");
					jsFile = jsFile.replace("src=", "").replaceAll("\"", "");
					jsFile = jsFile.replaceFirst("\\?v=.*$", "");
					System.out.println("BEV_AppGenerator jsFile=" + jsFile);
					System.out.flush();
					String jsString = jsToString(args[0], jsFile);
					bw.write("<script data-src=" + jsFile + ">\n");
					bw.write(jsString);
					bw.write("</script>\n");
				}
				else if (line.contains("rel=\"stylesheet"))
				{
					// Recognized CSS file; convert to string and write to "compiled" output
					String cssFile = extractTokenFromString(line, "href=");
					cssFile = cssFile.replace("href=", "").replaceAll("\"", "");
					cssFile = cssFile.replaceFirst("\\?v=.*$", "");
					// replace ?v= to end of string with nothing
					System.out.println("BEV_AppGenerator cssFile=" + cssFile);
					System.out.flush();
					bw.write("<style data-href=" + cssFile + " type='text/css'>");
					bw.write(styleToString(args[0], cssFile));
					bw.write("</style>\n");
				}
				else if (line.contains("<img"))
				{
					// Recognized image tag; convert to string and write to "compiled" output
					String imageFile = extractTokenFromString(line, "src=");
					imageFile = imageFile.replace("src=", "").replace("\"", "");
					System.out.println("BEV_AppGenerator imageFile=" + imageFile);
					System.out.flush();
					String encodedImage = encodeFileToBase64Binary(args[0] + "/" + imageFile);
					String htmlString = "<img src=\"" + encodedImage + "\" />";
					bw.write(htmlString + "\n");
				}
				else
				{
					//This is standard HTML, write and continue
					bw.write(line + "\n");
				}
				line = br.readLine();
			}
			bw.close();
			System.out.println("END BEV_AppGenerator " + new Date());
			System.out.flush();

			System.out.println("BEV_AppGenerator output at " + args[1]);
		}
		catch (Exception e)
		{
			System.out.println("Error BEV_AppGenerator " + e.getMessage());
			System.out.flush();
			e.printStackTrace(System.err);
		}
	}

}
