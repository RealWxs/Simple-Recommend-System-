package com.wu.LucServer;

import com.alibaba.fastjson.annotation.JSONField;

public class Message
{
    @JSONField(name="myMovieId")
    private final String myMovieId;

    public String getMyMovieId()
    {
        return myMovieId;
    }

    public String getTitle()
    {
        return title;
    }

    public String getGenres()
    {
        return genres;
    }

    @JSONField(name="title")
    private final String title;
    @JSONField(name="genres")
    private final String genres;

    public Message(String myMovieId, String title, String genres)
    {
        this.myMovieId = myMovieId;
        this.title = title.replace("\"","");
        this.genres = genres.replace("\"","");
    }


}
