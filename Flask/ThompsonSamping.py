
from scipy.stats import beta
import random

import numpy as np

def gaussian(mu, sigma):
    def generator(x: float):
        return np.exp(-(x - mu) ** 2 / (sigma ** 2)) / (np.sqrt(2 * np.pi) * sigma)

    return generator



def MetropolisHasting(p, q, n,a,b):
    arr = []

    x_last = -1

    while x_last > 1 or x_last < 0:
        x_last = abs(random.normalvariate(0, 1))
    arr.append(x_last)

    for i in range(n - 1):
        x = -1
        while x > 1 or x < 0:
            x = abs(random.normalvariate(0, 1))
        ratio = min(1, (p(x, a=a, b=b) * q(x_last)) / (q(x) * p(x_last, a=a, b=b)))
        u = random.uniform(0, 1)
        if u <= ratio:
            arr.append(x)
            x_last = x
        else:
            arr.append(x_last)
    return arr[-1]


q = gaussian(0,1)
p = beta.pdf

def acc_rej(p, q):
    while True:
        x = 0
        while x > 4.5 or x < 0.2:
            x = abs(random.normalvariate(0, 2.5))
        ratio = p(x) / (6 * q(x))
        u = random.uniform(0, 1)
        if ratio >= u:
            return x


def thompsonSampling(bandits):
    res = []
    for bandit in bandits:
        res.append(MetropolisHasting(p,q,10,bandit[0],bandit[1]))
    return int(np.argmax(res))


if __name__ == "__main__":
    bandits = [[40,40] for i in range(18)]
    print(np.argmax(thompsonSampling(bandits)))