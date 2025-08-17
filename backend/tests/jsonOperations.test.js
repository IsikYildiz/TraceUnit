import { expect, test } from 'vitest'
const jsonOperations = require('../jsonOperations.js')

test('create settings.json', () => {
    expect(jsonOperations.createSettingsJson()).toBe("Succesfully created settings file")
})

test('Settings.json exists', () => {
    expect(jsonOperations.createSettingsJson()).toBe("Settings file already exists")
})

test('Succesfully set a setting', () => {
    expect(jsonOperations.setSettings("ollamaModel","gpt")).toBe("Başarılı")
})

test('Wrong choice while setting', () => {
    expect(jsonOperations.setSettings("wrong","gpt")).toBe("Hatalı seçim")
})

test('Trying to set undefined value', () => {
    const wrong = undefined;
    expect(jsonOperations.setSettings("ollamaModel",wrong)).toBe(undefined)
})

test('Wrong choice while getting', () => {
    expect(jsonOperations.getSettings("wrong")).toBe("Hatalı seçim")
})

test('Succesfully get a setting', () => {
    expect(jsonOperations.getSettings("ollamaModel")).toBe("gpt")
})


