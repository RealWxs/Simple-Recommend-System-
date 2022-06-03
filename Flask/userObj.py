from config import config
import json
import redis
import copy


class UserObj:
    count = 0
    conn = None

    @staticmethod
    def init():
        UserObj.conn = redis.Redis('localhost', 6379)

    @staticmethod
    def shutdown():
        UserObj.conn.close()

    @staticmethod
    def getPop():
        pop = UserObj.conn.get('pop')
        if pop is None:
            return False, pop
        else:
            return True, json.loads(pop)

    @staticmethod
    def setPop(pop: list):
        UserObj.conn.setex('pop',  config.get('pop_expire_time'),json.dumps(pop))

    @staticmethod
    def fetch(userId):
        userStr = UserObj.conn.get(userId)
        if userStr is None:
            return False, userStr
        else:
            userDict = json.loads(userStr)
            userObj.userDict['userSaveDetail'] = set(
                userObj.userDict['userSaveDetail'])
            userObj.userDict['userUnsaveDetail'] = set(
                userObj.userDict['userUnsaveDetail'])
            userObj = UserObj(userDict)
            return True, userObj

    @staticmethod
    def cache(userObj):
        userObj.userDict['rateBuffer'] = {}
        userObj.userDict['userSaveDetail'] = list(
            userObj.userDict['userSaveDetail'])
        userObj.userDict['userUnsaveDetail'] = list(
            userObj.userDict['userUnsaveDetail'])
        userStr = json.dumps(userObj.userDict)
        UserObj.conn.setex(
            userObj.userDict['userId'], config.get('expire_time'), userStr)
        print('ctx of user:{} cacheed,expire in {}s'.format(
            userObj.userDict.get('userName'), config.get('expire_time')))

    def __init__(self, userDict) -> None:
        # self.userId = userDict['userId']
        # self.userName = userDict['userName']
        # self.ctrDetail = userDict['ctrDetail']
        # self.saveDetail = userDict['saveDetail']
        # self.rateDetail = userDict['rateDetail']
        # self.banditDetail = userDict['banditDetail']
        self.userDict = userDict
