def permutation(sequence: list[int | str | float]) -> list[list[int | str | float]]:
    if len(sequence) == 1:
        return [sequence]
    result: list[list[int | str | float]] = []
    for i in range(len(sequence)):
        for perm in permutation(sequence[:i] + sequence[i + 1 :]):
            result.append([sequence[i]] + perm)
    return result
