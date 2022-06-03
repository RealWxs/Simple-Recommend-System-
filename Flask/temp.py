import redis
from db import get_connection
import json

if __name__ == "__main__":
    conn_redis = redis.Redis('localhost', 6379)

    conn_db = get_connection()
    cursor = conn_db.cursor()
    
    # cursor.execute(
    #     'select myMovieId,title,genres,description from myMovies join imdbVids iV on myMovies.movieId = iV.movieId')
    # res = cursor.fetchone()
    # while res is not None:
    #     data = {
    #         'myMovieId': res[0],
    #         'indexed': res[1]+" ".join(res[2].split('|'))+res[3].decode('utf-8'),
    #         'title': res[1],
    #         'genres': res[2]
    #     }
    #     conn_redis.set(res[0], json.dumps(data))
    #     res = cursor.fetchone()
    # print('done')

    # conn_db.close()

    conn_redis.close()
