from user_code import * 
import pytest

def test_permutation_single_element():
    assert permutation([1]) == [[1]]

def test_permutation_two_elements():
    assert permutation([1, 2]) == [[1, 2], [2, 1]]

def test_permutation_three_elements():
    assert permutation([1, 2, 3]) == [
        [1, 2, 3], [1, 3, 2],
        [2, 1, 3], [2, 3, 1],
        [3, 1, 2], [3, 2, 1]
    ]

def test_permutation_empty_list():
    assert permutation([]) == [[]]