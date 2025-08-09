def permutation(sequence):
    if len(sequence) == 1:
        return [sequence]
    result = []
    for i in range(len(sequence)):
        for perm in permutation(sequence[:i] + sequence[i + 1 :]):
            result.append([sequence[i]] + perm)
    return result
