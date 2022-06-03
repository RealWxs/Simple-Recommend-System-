package com.wu.LucServer;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;


import com.alibaba.fastjson.JSON;
import com.wu.LucServer.Message;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.*;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.*;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.wltea.analyzer.lucene.IKAnalyzer;
import org.apache.commons.lang3.StringUtils;




@WebServlet("/Search")
public class Search extends HttpServlet
{
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {

        String[] val = request.getParameterValues("wd");
        String q = val[0];
        System.out.println(q);
        response.setCharacterEncoding("UTF-8");
        String contentType = "text/plain";

        response.setContentType(contentType);
        String jsonstr = JSON.toJSONString(Lucene_Master.generalSearch(q));
        System.out.println(jsonstr);
        response.getWriter().println(jsonstr);

    }
}
