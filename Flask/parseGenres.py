import pandas as pd
import numpy
from db import get_connection

_genres = ['Action',
          'Adventure',
          'Animation',
          "Children",
          'Comedy',
          'Crime',
          'Documentary',
          'Drama',
          'Fantasy',
          'Film-Noir',
          'Horror',
          'Musical',
          'Mystery',
          'Romance',
          'Sci-Fi',
          'Thriller',
          'War',
          'Western']
genre_map = {_genres[i]:i for i in range(len(_genres))}
decode_map = {genre_map[k]:k for k in genre_map.keys()}
length = len(_genres)

def encode_genres(genres:str):
    genres = genres.split("|")
    feature = 0
    for genre in genres:
        if genre_map.get(genre) is not None:
            feature += 10**(genre_map[genre])
    return feature

def decode_genres(feature:int):
    genres = []
    feature = str(feature)[-1::-1]
    for index in range(len(feature)):
        if feature[index] == '1':
            genres.append(decode_map[index])
    return genres
    




