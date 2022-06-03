from db import get_connection
import pickle
import numpy as np

if __name__ == '__main__':
    conn = get_connection()
    cursor = conn.cursor()
    with open('mat.pkl', 'rb') as f:
        mat: np.ndarray = pickle.load(f)
    
    print(mat[12].argsort()[:5])

    conn.close()
