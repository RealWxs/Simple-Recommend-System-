
import pymysql
import json
from threading import Timer
from config import config
from loguru import logger


def get_connection():
    conn = pymysql.connect(host="127.0.0.1",
                           user="root",
                           password=config.get('mysql_password'),
                           port=config.get('mysql_port'),
                           database="movielens",
                           charset='utf8')
    return conn


def flushTask(self, userObj):
    cursor = self.db_conn.cursor()
    userDict = userObj.userDict
    userId = userDict['userId']
    userCtrDetail = userDict['userCtrDetail']
    userSaveDetail = userDict['userSaveDetail']
    userUnsaveDetail = userDict['userUnsaveDetail']
    userRateDetail = userDict['userRateDetail']
    userBanditDetail = userDict['userBanditDetail']
    logger.success('flush data got successfully')
    # fulsh CTR
    if len(userCtrDetail) != 0:
        logger.info('flushing CTRs')
        cursor.executemany(
            'insert into userLog values(1,{},%s,-1,null)'.format(userId), userCtrDetail)
    logger.info('flushing CTR successful')
    # flush Save
    if len(userSaveDetail) != 0:
        logger.info('flushing Saves')
        cursor.executemany(
            'insert into userLog values(2,{},%s,-1,null)'.format(userId), userSaveDetail)
        cursor.executemany(
            'insert into userFavs values(%s,{})'.format(userId), userSaveDetail)
        cursor.executemany('delete from userFavs where userId={} and myMovieId=%s'.format(
            userId), userUnsaveDetail)
    logger.info('flushing Save successful')

    # flush Rating
    if len(userRateDetail) != 0:
        logger.info('flushing Ratingss')
        sql1 = 'insert into userLog values(3,{},%s,%s,null)'.format(userId)
        sql2 = 'insert into ratingLogs values({},%s,%s)'.format(userId)
        sql3 = 'insert into userRates values({},%s,%s)'.format(userId)
        for myMovieID in userRateDetail.keys():
            cursor.execute(sql1, (myMovieID, userRateDetail[myMovieID]))
            cursor.execute(sql2, (myMovieID, userRateDetail[myMovieID]))
            cursor.execute(sql3, (myMovieID, userRateDetail[myMovieID]))
    logger.info('flushing Ratings successful')
    # flush Bandit

    for i in range(len(userBanditDetail)):
        userBanditDetail[i] = str(
            userBanditDetail[i][0])+","+str(userBanditDetail[i][1])
    userBanditDetail = "|".join(userBanditDetail)
    cursor.execute('update Bandits set banditDetail=%s where userId={}'.format(
        userId), userBanditDetail)
    logger.info('flushing Bandit successful')

    # commit
    self.db_conn.commit()

# # UserObj:
# #         self.id = userId
# #         self.name = userName
# #         self.ctrDetail = []
# #         self.saveDetail = []
# #         self.rateDetail = {}
# #         self.bandit = banditVec


# class UserDao:
#     @staticmethod
#     def getUserObj(userId, conn):
#         return json.loads(conn.get(userId))

#     def updateUserObj(userObj, conn):
#         conn.set(userObj['id'], json.dumps(userObj))

#     @staticmethod
#     def updateSaves(movieId, userId, add, conn):
#         userObj = UserDao.getUserObj(userId, conn)
#         if add:
#             userObj['saveDetail'].append(movieId)
#         else:
#             userObj['saveDetail'].remove(movieId)
#         UserDao.updateUserObj(userObj, conn)

#     @staticmethod
#     def incCTR(movieId, userId, conn):
#         userObj = UserDao.getUserObj(userId, conn)
#         userObj['ctrDetail'].append(movieId)
#         UserDao.updateUserObj(userObj, conn)

#     @staticmethod
#     def updateRates(movieId, userId, rate, conn):
#         userObj = UserDao.getUserObj(userId, conn)
#         if rate != 0:
#             userObj['rateDetail'][movieId] = rate
#         else:
#             del (userObj['rateDetail'][movieId])
#         UserDao.updateUserObj(userObj, conn)

#     @staticmethod
#     def userLogin(userId, userName, conn, conn_db):

#         if config.get('bandit_strategy') == 'Thompson':
#             cursor = conn_db.cursor()
#             cursor.execute("select * from Thompson where userId=%s", userId)
#             bandit = cursor.fetchone()
#             if bandit is None:
#                 cursor.execute(
#                     "insert into Thompson(userID) values(%s)", userId)
#                 cursor.execute(
#                     "select * from Thompson where userId=%s", userId)
#                 bandit = cursor.fetchone()

#         userObj = {
#             'id': userId,
#             'name': userName,
#             'ctrDetail': [],
#             'saveDetail': [],
#             'rateDetail': {},
#             'bandit': bandit
#         }
#         conn.set(userId, json.dumps(userObj))

#     def userLogout(userId, conn):
#         conn.remove(userId)

# MovieObj:
#         self.ctr = 0
#         self.rate_total = 0
#         self.rate_count = 0
#         self.saves = 0


# class MovieDao:
#     @staticmethod
#     def getMovieObj(myMovieId, conn):
#         return json.loads(conn.get(myMovieId))

#     @staticmethod
#     def updateMovieObj(MovieObj, conn):
#         conn.set(MovieObj.id, MovieObj)

#     def incCTR(myMovieId, conn):
#         movieObj = MovieDao.getMovieObj(myMovieId, conn)
#         movieObj['ctr'] += 1
#         MovieDao.updateMovieObj(movieObj, conn)

#     def updateSaves(myMovieId, add, conn):
#         movieObj = MovieDao.getMovieObj(myMovieId, conn)
#         if add:
#             movieObj['saves'] += 1
#         else:
#             movieObj['saves'] -= 1
#         MovieDao.updateMovieObj(movieObj, conn)

#     def updateRates(myMovieId, newRate, oldRate, conn):
#         movieObj = MovieDao.getMovieObj(myMovieId, conn)
#         # set value
#         if oldRate == 0:
#             movieObj['rate_total'] += newRate
#             movieObj['rate_count'] += 1
#         # cancle rating
#         else:
#             movieObj['rate_total'] -= oldRate
#             movieObj['rate_count'] -= 1
#         MovieDao.updateMovieObj(movieObj, conn)


class DAO:
    def __init__(self) -> None:
        self.db_conn = get_connection()

    def authenticate(self, userName, userPassWd):
        sql = "select userPassWord,userId from users where userName=%s"
        cursor = self.db_conn.cursor()
        cursor.execute(sql, userName)
        res = cursor.fetchone()
        print(res)
        print(userPassWd)
        if res is not None and res[0] == userPassWd:
            return True, res[1]
        else:
            return False, -1

    def register(self, userName, userPassWd, gender, year):
        sql = 'select userName from users where userName=%s'
        cursor = self.db_conn.cursor()
        cursor.execute(sql, userName)
        if cursor.fetchone() is None:
            cursor.execute('insert into users values(null,%s,%s,%s,%s)',
                           (userName, userPassWd, gender, year))
            self.db_conn.commit()
            return True
        else:
            return False

    # def flush_user(self, userId):
    #     userObj = UserDao.getUserObj(userId, self.redis_conn)
    #     if userObj is None:
    #         return
    #     cursor = self.db_conn.cursor()

    #     if len(userObj.ctrDetail) != 0:
    #         sql_proto = 'insert into userLog values({},{},%s,{})'
    #         sql = sql_proto.format(1, userObj.id, 0)
    #         cursor.executemany(sql, userObj.ctrDetail)
    #     if len(userObj.saveDetail) != 0:
    #         sql = sql_proto.format(2, userObj.id, 0)
    #         cursor.executemany(sql, userObj.saveDetail)

    #     if len(userObj.rateDetail.keys() != 0):
    #         sql = sql_proto.format(3, userObj.id, "%s")
    #         data = [(k, userObj.rateDetail[k])
    #                 for k in userObj.rateDetail.keys()]
    #         cursor.executemany(sql, data)
    #     if config.get('bandit_strategy') == 'Thonpson':
    #         cursor.execute(
    #             'update Thompson set action_a=%s,action_b=%s,animation_a=%s,animation_b=%s,children_a=%s,children_b=%s,comedy_a=%s,comedy_b=%s,crime_a=%s,crime_b=%s,fantasy_a=%s,fantasy_b=%s,filmNoir_a=%s,filmNoir_b=%s,horror_a=%s,horror_b=%s,musical_a=%s,musical_b=%s,mystery_a=%s,mystery_b=%s,romance_a=%s,romance_b=%s')

        # self.db_conn.commit()

    def close(self):
        self.db_conn.commit()
        self.db_conn.close()

    def queryFavs(self, userId, page, needCount):
        sql = 'select mM.myMovieId,title from userFavs join myMovies mM on userFavs.myMovieId = mM.myMovieId where userId=%s limit %s,10'
        cursor = self.db_conn.cursor()
        cursor.execute(sql, (userId, page))
        res = cursor.fetchall()
        if needCount:
            cursor.execute(
                "select count(*) from userFavs where userId=%s", userId)
            count = cursor.fetchone()[0]
        length = len(res)

        return {"total": length, "info": res}

    def queryDetail(self, myMovieId):
        sql = 'select imdbId,vid,description from myVid where myMovieId = %s'
        cursor = self.db_conn.cursor()
        cursor.execute(sql, myMovieId)
        imdbId, vid, desc = cursor.fetchone()
        sql = 'select title,genres from myMovies where myMovieId = %s'
        cursor.execute(sql, myMovieId)
        title, genres = cursor.fetchone()
        sql = 'select avg_rating,rates from movieRatings where myMovieId = %s'
        cursor.execute(sql, myMovieId)
        avg_rating, rates = cursor.fetchone()
        return {
            'imdbId': imdbId,
            'vid': vid,
            'desc': desc.decode('utf-8'),
            'title': title,
            'genres': genres.split('|'),
            'avg_rating': float(avg_rating),
            'rates': rates
        }

    def queryFavs(self, userId):
        logger.debug('-----------enter queryFavs----------')
        cursor = self.db_conn.cursor()
        logger.info('querying fav items')
        cursor.execute('''
                    select mM.myMovieId,title,genres from myMovies mM join (
                    select myMovieId from userFavs where userId=%s
                        ) uF on mM.myMovieId=uF.myMovieId;''', userId)
        res_tuple = cursor.fetchall()
        res = {}
        logger.info('building lookup table')
        for item in res_tuple:
            res[item[0]] = [item[1], item[2]]
        print(res)
        logger.debug('-----------exit queryFavs----------')
        
        return res

    def sample_in_Genre(self, genre):
        sql = "SELECT t1.myMovieId FROM myMovies AS t1  JOIN (SELECT ROUND(RAND()*(SELECT MAX(myMovieId)FROM myMovies)) AS id) AS t2 WHERE  t1.genres like '%%%s%%' and t1.myMovieId>=t2.id ORDER BY t1.myMovieId LIMIT 1;" % genre
        cursor = self.db_conn.cursor()

        cursor.execute(sql)

        return cursor.fetchone()[0]

    def queryBandits(self, userId):
        logger.debug('--------enter queryBandits----------')
        sql = 'select banditDetail from bandits where userId=%s'
        cursor = self.db_conn.cursor()
        cursor.execute(sql, userId)
        res = cursor.fetchone()
        if res is None:
            userBanditDetail = [['10', '10'] for _ in range(18)]
            temp = [','.join(item) for item in userBanditDetail]
            cursor.execute('insert into bandits values(%s,%s)',
                           (userId, '|'.join(temp)))
            self.db_conn.commit()
            print('user:{} bandit detail not in db, do initiating'.format(userId))
            for i in range(len(userBanditDetail)):
                userBanditDetail[i][0] = int(userBanditDetail[i][0])
                userBanditDetail[i][1] = int(userBanditDetail[i][1])
            logger.info(
                'userId:{} bandit detail not in db, do initiating'.format(userId))
            logger.debug('----------exit queryBandits---------')

            return userBanditDetail
        else:
            temp = res[0].decode('utf-8').split('|')
            userBanditDetail = [item.split(',') for item in temp]
            for i in range(len(userBanditDetail)):
                userBanditDetail[i][0] = int(userBanditDetail[i][0])
                userBanditDetail[i][1] = int(userBanditDetail[i][1])
            print('query and process bandit detail')
            logger.info(
                'query and process bandit detail of userId:{}'.format(userId))
            logger.debug('----------exit queryBandits---------')
            return userBanditDetail

    @staticmethod
    def getFlushTimer(dao, userObj, timeout):
        timer = Timer(timeout, flushTask, (dao, userObj))
        return timer

    def queryGenres(self, myMovieId):
        cursor = self.db_conn.cursor()
        cursor.execute(
            'select genres from myMovies where myMovieId=%s', myMovieId)
        return cursor.fetchone()[0]

    def queryRating(self, userId, myMovieId):
        cursor = self.db_conn.cursor()
        cursor.execute(
            'select rating from userRates where userId=%s and myMovieId=%s', (userId, myMovieId))
        res = cursor.fetchone()
        if res is None:
            return False, res
        else:
            return True, float(res[0])

    def queryPop(self, l=5):
        cursor = self.db_conn.cursor()
        cursor.execute(
            'select mM.movieId,title,genres from pop join myMovies mM on pop.myMovieId = mM.myMovieId limit %s', l)
        return cursor.fetchall()

    def queryBatchInfo(self, myMovieIdList: list):
        cursor = self.db_conn.cursor()
        res = []
        for mid in myMovieIdList:
            cursor.execute(
                'select title,genres from myMovies where myMovieId = %s', mid)
            one = cursor.fetchone()
            unit = [mid]
            unit.extend(one)
            res.append(unit)
        return res


if __name__ == "__main__":
    dao = DAO()
    print(dao.queryBatchInfo([3, 4, 5, 7]))

    dao.close()
