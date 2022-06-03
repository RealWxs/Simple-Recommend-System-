from django import db
from loguru import logger
from ThompsonSamping import thompsonSampling
from flask import Flask, request, session, make_response
import json
from parseGenres import decode_map
from userObj import UserObj
from db import DAO
import random
from config import config
import requests as req
import numpy as np
import pickle
from jsonEncoder import NpEncoder


app = Flask('svr')
dao = DAO()
app.secret_key = '1919810'
logger.add('logfile_2022_5_16.log')
users = {}
usersRec = {}
with open('mat.pkl', 'rb') as f:
    mat: np.ndarray = pickle.load(f)


@app.route('/login', methods=['POST'])
def login():
    logger.debug('--------------login enter-------------')
    if request.method == 'POST':
        user = request.get_json().get('username')
        passwd = request.get_json().get('password')
        status, id = dao.authenticate(user, passwd)
        logger.info('login status:{}, userId:{}'.format(str(status), str(id)))
        if status:
            session[user] = id
            exist, userObj = UserObj.fetch(id)
            timer = users.get(id)
            if timer is not None:
                logger.info('cancle flush task for userId:{}'.format(id))
                timer.cancel()
            if exist:
                users[id] = userObj
                logger.info(
                    'load userObj from redis cache for userId:{}'.format(id))
            else:
                users[id] = UserObj(
                    {
                        # userDict
                        'userId': id,
                        'userName': user,
                        'userCtrDetail': [],
                        'userSaveDetail': set(),
                        'userUnsaveDetail': set(),
                        'userRateDetail': {},
                        'userBanditDetail': dao.queryBandits(id),
                        'userFavs': dao.queryFavs(id),
                        'rateBuffer': {}

                    }
                )
                logger.info(
                    'cache expired, query and set userObj for userId:{}'.format(id))
            resp = make_response(json.dumps({'status': 'success'}))
            resp.set_cookie('currentUser', user)
            logger.debug('-------------login exit--------------')
            return resp
        else:
            logger.info('login failed for authentication err')
            logger.debug('-------------login exit--------------')
            return json.dumps({'status': 'failed'})
    else:
        logger.debug('-------------login exit--------------')
        return json.dumps({'status': 'failed'})


@app.route('/logout', methods=['POST'])
def logout():
    if request.method == 'POST':
        logger.debug('-----------logout enter------------')
        user = request.cookies.get('currentUser')
        if user is None:
            logger.info('illeagal logout, there is no cookie!')
            return
        logger.info('start cleaning and caching for userName:{}'.format(user))
        # del users[session[user]]
        UserObj.cache(users[session[user]])
        logger.info('userObj cached in redis for userName{}, expires in {}s'.format(
            user, config.get('expire_time')))
        timer = dao.getFlushTimer(
            dao, users[session[user]], config.get('expire_time'))
        users[session[user]] = timer
        timer.start()
        logger.info(
            'start flush task counting down, flush will performed 0.5h later for userName:{}'.format(user))
        del session[user]
        resp = make_response()
        resp.delete_cookie('currentUser')
        print("user:{} has logged out".format(user))
        logger.debug('------------logout exit--------------')
        return resp


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        logger.debug('---------register enter---------')
        data = request.get_json()
        user = data.get('username')
        password = data.get('password')
        gender = data.get('gender')
        if gender == 'male':
            gender = 1
        elif gender == 'female':
            gender = 2
        else:
            gender = 3
        age = data.get('age')
        print(user, password, gender, age)
        status = dao.register(user, password, gender, age)
        logger.info('regiseration status for userName{} is {}'.format(
            user, str(status)))
        if status:
            logger.debug('-------------exit register----------')
            return json.dumps({'status': 'success'})
        else:
            logger.debug('-------------exit register----------')
            return json.dumps({'status': 'failed'})


@app.route('/fetchFavs', methods=["POST"])
def fetchFavs():
    user = request.cookies.get('currentUser')
    userId = session.get(user)
    favs = users[userId].userDict['userFavs']
    res = [ [mid,favs[mid][0],favs[mid][1]]for mid in favs.keys()]

    return json.dumps(res)


@app.route('/movieDetail', methods=["POST"])
def movieDetail():
    logger.debug('------------enter movieDetail--------------')
    myMovieId = request.get_json().get('myMovieId')
    logger.info('query details for myMovieId:{}'.format(myMovieId))
    res = dao.queryDetail(myMovieId)
    logger.debug('------------exit movieDetail---------------')
    return json.dumps(res)


@app.route('/fav_status', methods=['POST'])
def favStatus():
    userName = request.cookies.get('currentUser')
    userId = session.get(userName)
    in_fav = False
    if userId is not None:
        myMovieId = request.get_json().get('myMovieId')
        in_fav = myMovieId in users[userId].userDict['userFavs'].keys()
    return json.dumps({'fav_status': in_fav})


@app.route('/changeFavStatus', methods=['POST'])
def changeFavStatus():
    logger.debug('----------enter changeFavStatus----------')
    userName = request.cookies.get('currentUser')
    userId = session.get(userName)
    if userId is None:
        logger.info('user is not logged in')
        logger.debug('----------exit changeFavStatus----------')
        return 'not login'

    else:
        data = request.get_json()
        doSave = data.get('doSave')
        userObj = users[userId]
        userDict = userObj.userDict
        myMovieId = data.get('myMovieId')
        if doSave:
            logger.info('userId:{} do save'.format(userId))
            userDict['userFavs'][myMovieId] = ''

            userDict['userUnsaveDetail'].discard(myMovieId)
            userDict['userSaveDetail'].add(myMovieId)
        else:
            logger.info('userId:{} undo save'.format(userId))
            del userDict['userFavs'][myMovieId]
            userDict['userSaveDetail'].discard(myMovieId)
            userDict['userUnsaveDetail'].add(myMovieId)
        logger.debug('----------exit changeFavStatus----------')
        return 'success'


@app.route('/explore_next', methods=["POST"])
def exploreNext():
    logger.debug('---------enter explore_next-------------')
    userId = session.get(request.cookies.get('currentUser'))
    if userId is None:
        print('random')
        logger.info('not loggin, so return an arbitary result')
        logger.debug('---------exit explore_next-------------')
        return json.dumps({'myMovieId': random.randint(0, 9723)})
    else:
        logger.info('userId:{} logged,run Thompson Samping'.format(userId))
        report = request.get_json()
        lastCtr = report.get('lastCtr')
        gid = report.get('genreId')
        userBanditDetail = users[userId].userDict.get('userBanditDetail')
        if lastCtr:
            logger.info('last sample is positive, update bandits')
            userBanditDetail[gid][0] += 1
            print('Last one is Positive Sample')
        else:
            logger.info('last sample is of genuine negative, update bandits')
            userBanditDetail[gid][1] += 1
            print('Last one is Negative Sample')
        genreId = thompsonSampling(userBanditDetail)
        genre = decode_map[genreId]
        logger.info('roll bandits and select an genre:{}'.format(genre))
        recMovieId = dao.sample_in_Genre(genre)
        print('mcmc sampling in beta destribution')
        logger.info(
            'sample from the given genre,myMovieId is{}'.format(recMovieId))
        logger.debug('---------exit explore_next-------------')
        return json.dumps({'myMovieId': recMovieId, 'genreId': genreId})


@app.route('/explore_random')
def exploreRandom():
    return json.dumps({'myMovieId': random.randint(0, 9723)})


@app.route('/inc_ctr', methods=['POST'])
def increaseCTR():
    logger.debug('---------enter increaseCTR----------')
    userId = session.get(request.cookies.get('currentUser'))
    if userId is None:
        logger.info('no valid cookie,return...')
        logger.debug('------exit increase CTR----------')
        return 'no valid cookies'
    else:
        myMovieId = request.get_json().get('myMovieId')
        logger.info('increase the CTR of myMovieId:{}'.format(myMovieId))
        if myMovieId is not None:
            users[userId].userDict['userCtrDetail'].append(myMovieId)
            print('handleIncCTR,myMovieId is {}'.format(
                request.get_json().get('myMovieId')))
    logger.debug('------exit increase CTR----------')
    return 'ok'


@app.route('/rate', methods=['POST'])
def rate():
    logger.debug('--------enter rate-----------')
    user = request.cookies.get('currentUser')
    userId = session.get(user)
    if userId is None:
        logger.info('no valid cookies')
        logger.debug('----------exit rate---------')
        return 'no valid cookies'
    else:
        data = request.get_json()
        myMovieId = data.get('myMovieId')
        rating = data.get('rating')
        userDict = users[userId].userDict
        if rating == 0:
            logger.info('user:{} undo rate on movieId:{}'.format(
                userId, myMovieId))
            if userDict['userRateDetail'].get(myMovieId) is not None:
                del userDict['userRateDetail'][myMovieId]
            logger.info('buffer undo action')
            userDict['rateBuffer'][myMovieId] = -1
        else:
            logger.info('user:{} do rate on movieId:{} for a score of {}'.format(
                userId, myMovieId, rating))
            userDict['userRateDetail'][myMovieId] = rating
        logger.debug('---------exit rate----------')
        return 'success'


@app.route('/rate_status', methods=['POST'])
def rateStatus():
    logger.debug('---------enter rate_status----------')
    user = request.cookies.get('currentUser')
    userId = session.get(user)
    if userId is None:
        logger.info('no valid cookie')
        logger.debug('-----------exit rate_status----------')
        return json.dumps({'rating': -1})
    else:
        myMovieId = request.get_json().get('myMovieId')
        userDict = users[userId].userDict
        rating = rating = userDict['rateBuffer'].get(myMovieId)
        if rating is None:
            userDict['userRateDetail'].get(myMovieId)
        if rating is None:
            logger.info('no rate info of userId{},myMovieId{} in buffer'.format(
                userId, myMovieId))
            logger.info('query rating info from database')
            exist, result = dao.queryRating(userId, myMovieId)
            if not exist:
                logger.info('userId:{} have not rated on movieId:{}'.format(
                    userId, myMovieId))
                logger.debug('-----------exit rate_status----------')
                return json.dumps({'rating': -1})
            else:
                logger.info('query ok, user{} has rated movieId:{} on score:{}'.format(
                    userId, myMovieId, result))
                userDict['rateBuffer'][myMovieId] = result
                logger.info('caching the rate in buffer successful')
                logger.debug('-----------exit rate_status----------')
                return json.dumps({'rating': result})
        else:
            logger.info('find rating info in buffer,user{} has rated movieId:{} on score:{}'.format(
                userId, myMovieId, rating))
            return json.dumps({'rating': rating})


@app.route('/search', methods=['POST'])
def search():
    wd = request.get_json().get('wd')
    status, pop_res = UserObj.getPop()
    if not status:
        pop_res = dao.queryPop(10)
        UserObj.setPop(pop_res)
    q_res = handleSearch(wd)
    user = request.cookies.get('currentUser')
    userId = session.get(user)
    if userId is None:
        return json.dumps({'q_res': q_res, 'pop_res': pop_res},cls=NpEncoder)
    else:

        rec_res = handleRec(userId)
        return json.dumps({'q_res': q_res, 'pop_res': pop_res[:5], 'rec_res': rec_res},cls=NpEncoder)


def handleSearch(wd):
    q_res = req.get(
        'http://localhost:8080/LucServer_war_exploded/Search?wd={}'.format(wd))
    return json.loads(q_res.text)


def handleRec(userId):
    rec_res = usersRec.get(userId)
    if rec_res is None:
        rec_res = list(mat[userId].argsort()[:5])
        usersRec[userId] = rec_res

    return dao.queryBatchInfo(rec_res)


if __name__ == '__main__':
    logger.debug('--------start UserObj service--------')
    UserObj.init()
    logger.debug('---------start flask server----------')
    app.run("localhost", 12000)
