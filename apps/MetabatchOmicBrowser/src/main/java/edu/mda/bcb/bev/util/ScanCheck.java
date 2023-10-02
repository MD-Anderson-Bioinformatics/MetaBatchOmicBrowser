/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package edu.mda.bcb.bev.util;

import java.util.Enumeration;
import jakarta.servlet.http.HttpServletRequest;

/**
 *
 * @author dqs_tcga_service
 */
public class ScanCheck
{
	static public void checkForSecurity(HttpServletRequest theRequest) throws Exception
	{
		Enumeration<String> attributes = theRequest.getAttributeNames();
		ScanCheck.checkEnum(attributes, "Illegal Attribute Found");
		Enumeration<String> parameters = theRequest.getParameterNames();
		ScanCheck.checkEnum(parameters, "Illegal Parameter Found");
		Enumeration<String> headers = theRequest.getHeaderNames();
		ScanCheck.checkEnum(headers, "Illegal Header Found");
		ScanCheck.checkForMetaCharacters(theRequest.getParameter("_"));
	}
	
	static public void checkForMetaCharacters(String theValue) throws Exception
	{
		if (null!=theValue)
		{
			// & | ! = ~= >= <= * ( )
			if (theValue.contains("&"))
			{
				throw new Exception("Illegal Meta Characters (1)");
			}
			else if (theValue.contains("!"))
			{
				throw new Exception("Illegal Meta Characters (2)");
			}
			else if (theValue.contains("="))
			{
				throw new Exception("Illegal Meta Characters (3)");
			}
			else if (theValue.contains("~="))
			{
				throw new Exception("Illegal Meta Characters (4)");
			}
			else if (theValue.contains(">="))
			{
				throw new Exception("Illegal Meta Characters (5)");
			}
			else if (theValue.contains("<="))
			{
				throw new Exception("Illegal Meta Characters (6)");
			}
			else if (theValue.contains("*"))
			{
				throw new Exception("Illegal Meta Characters (7)");
			}
		}
	}
	
	static public void checkForBoolean(String theValue) throws Exception
	{
		// null, NULL, or bool
		if ((!"null".equalsIgnoreCase(theValue)) && (!"TRUE".equalsIgnoreCase(theValue)) && (!"FALSE".equalsIgnoreCase(theValue)))
		{
			throw new Exception("Illegal Boolean Value");
		}
	}
	
	static public void checkForYesNo(String theValue) throws Exception
	{
		// null, NULL, or bool
		if ((!"null".equalsIgnoreCase(theValue)) && (!"YES".equalsIgnoreCase(theValue)) && (!"NO".equalsIgnoreCase(theValue)))
		{
			throw new Exception("Illegal Yes-No Value");
		}
	}

	static public void checkForInt(String theValue) throws Exception
	{
		// null, NULL, or int
		if (!"null".equalsIgnoreCase(theValue))
		{
			try
			{
				Integer.parseInt(theValue);
			}
			catch (Exception e)
			{
				throw new Exception("Illegal Integer Value");
			}
		}
	}

	static public void checkForFloat(String theValue) throws Exception
	{
		// null, NULL, or float
		if (!"null".equalsIgnoreCase(theValue))
		{
			try
			{
				Float.parseFloat(theValue);
			}
			catch (Exception e)
			{
				throw new Exception("Illegal Float Value");
			}
		}
	}
	
	static public void checkEnum(Enumeration<String> theEnum, String theError) throws Exception
	{
		while (theEnum.hasMoreElements())
		{
			String val = theEnum.nextElement();
			if ( ("X-HTTP-METHOD".equalsIgnoreCase(val)) || 
				 ("X-HTTP-Method-Override".equalsIgnoreCase(val)) || 
				 ("X-METHOD-OVERRIDE".equalsIgnoreCase(val)) || 
				 ("_method".equalsIgnoreCase(val)) )
			{
				throw new Exception(theError);
			}
		}
	}
}
