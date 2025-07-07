# app/utils/validators.py
import json

def deep_equal(a, b):
    if type(a) != type(b):
        return False

    if isinstance(a, list):
        if len(a) != len(b):
            return False

        # Order matters in lists
        return all(deep_equal(x, y) for x, y in zip(a, b))

    if isinstance(a, tuple):
        if len(a) != len(b):
            return False
        return all(deep_equal(x, y) for x, y in zip(a, b))

    if isinstance(a, dict):
        if a.keys() != b.keys():
            return False
        return all(deep_equal(a[k], b[k]) for k in a)

    if isinstance(a, set):
        return a == b

    return a == b
