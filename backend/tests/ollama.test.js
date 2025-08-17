import { expect, test } from 'vitest'
const ollama = require('../ollama.js')
const code = `def permutation(sequence: list[int | str | float]) -> list[list[int | str | float]]:
    if len(sequence) == 1:
        return [sequence]
    result: list[list[int | str | float]] = []
    for i in range(len(sequence)):
        for perm in permutation(sequence[:i] + sequence[i + 1 :]):
            result.append([sequence[i]] + perm)
    return result`
;

test('return same', async () =>{
    const response = await ollama.fixCodeMistakes(code)
    expect(response).toBe("same")
})

test('return unknown', async () =>{
    const response = await ollama.fixCodeMistakes("")
    expect(response).toBe("unknown")
})

test('return fixed code', async () =>{
    // Ollama modeli yeterince iyi olmadığı için burada yine "same" döndürüyor
    const wrongCode = `def permutation(sequence: list[int | str | float]) -> list[list[int | str | float]]:
    if len(sequence) == 2:
        return [sequence]
    result: list[list[int | str | float]] = []
    for i in range(len(sequence)):
        for perm in permutation(sequence[:i] + sequence[i + 1 :]):
            result.append([sequence[i]] + perm)
    return result`
    const response = await ollama.fixCodeMistakes(wrongCode)
    expect(response).toContain("1")
})

test('find programming language', async () =>{
    const response = await ollama.detectProgrammingLanguage(code)
    expect(response).toBe("Python")
})

test('cant write tests', async () =>{
    const response = await ollama.writeTests("")
    expect(response).toBe("unknown")
})