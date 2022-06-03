package com.wu.LucServer;

import com.alibaba.fastjson.JSON;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/Recommend")
public class Recommend extends HttpServlet
{
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        HttpServletRequest req = request;
        String[] val = req.getParameterValues("wd");
        String q = val[0];
        response.setCharacterEncoding("UTF-8");
        String contentType = "text/plain";

        response.setContentType(contentType);
        String jsonstr = JSON.toJSONString(Lucene_Master.recommend(q));
        response.getWriter().println(jsonstr);
    }
}
