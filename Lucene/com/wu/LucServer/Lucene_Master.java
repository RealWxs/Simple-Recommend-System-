package com.wu.LucServer;

import com.alibaba.fastjson.JSON;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.*;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.wltea.analyzer.lucene.IKAnalyzer;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Random;

public class Lucene_Master
{

    public static final int maxHits = 10;
    public static final String indexDir = "/Users/wu/Desktop/index";
    public static IndexReader indexReader;
    public static IndexSearcher searcher;
    public static Analyzer analyzer;
    public static Random random;
    static
    {
        Directory directory = null;
        try
        {
            directory = FSDirectory.open(Paths.get(indexDir));
            indexReader = DirectoryReader.open(directory);
        } catch (IOException e)
        {
            e.printStackTrace();
        }

        searcher = new IndexSearcher(indexReader);
        analyzer = new IKAnalyzer(true);
        random = new Random();
    }

    public static ArrayList<Message> generalSearch(String q) throws IOException
    {
        FuzzyQuery fuzzyQuery = new FuzzyQuery(new Term("indexed", q));
        TopDocs fuzzyDocs = searcher.search(fuzzyQuery, maxHits);
        ScoreDoc[] hits = fuzzyDocs.scoreDocs;
        ArrayList<Message> res = new ArrayList<>();

        for (ScoreDoc hit : hits)
        {
            int docId = hit.doc;
            Document d = searcher.doc(docId);
            res.add(new Message(d.get("myMovieId"),d.get("title"),d.get("genres")));
        }

        return res;
    }
    public static Message recommend(String q) throws IOException
    {
        FuzzyQuery query = new FuzzyQuery(new Term("tags", q));
        TopDocs topDocs = searcher.search(query, 5);
        ScoreDoc[] hits = topDocs.scoreDocs;
        Document d = searcher.doc(hits[random.nextInt(hits.length)].doc);

        return null;
    }

    public static void main(String[] args) throws IOException
    {
        System.out.println(generalSearch("happy").get(0).getGenres());
    }
}
