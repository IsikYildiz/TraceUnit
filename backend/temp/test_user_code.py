from user_code import * 
import pytest

def test_permutation_empty_sequence():
    assert permutation([]) == [[]]

def test_permutation_single_element():
    assert permutation([1]) == [[1]]

def test_permutation_two_elements():
    assert sorted(permutation([1, 2])) == sorted([[1, 2], [2, 1]])

def test_permutation_three_elements():
    result = permutation([1, 2, 3])
    expected = [
        [1, 2, 3], [1, 3, 2],
        [2, 1, 3], [2, 3, 1],
        [3, 1, 2], [3, 2, 1]
    ]
    assert sorted(result) == sorted(expected)

def test_permutation_with_repeated_elements():
    result = permutation([1, 1, 2])
    expected = [
        [1, 1, 2], [1, 2, 1],
        [2, 1, 1]
    ]
    assert sorted(result) == sorted(expected)