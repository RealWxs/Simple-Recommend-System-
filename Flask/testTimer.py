from threading import Timer


def task(i,j,k):
    print("i={},j={},k={}".format(i,j,k))

if __name__ == '__main__':
    a = {1,2,3,4,5}
    a.add(9)
    a.add(3)
    print(a)
    a.difference_update({1})
    a.discard(90)
    print(a)

    