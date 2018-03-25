/* eslint-env jest */
const urlToFile = require('./url_to_file')

jest.mock('http')
jest.mock('https')
jest.mock('fs')

describe('urlToFile', () => {
  test('test', () => {
    expect.assertions(1)
    return urlToFile('').then(data => expect(data).toMatch(/^/))
  })
})
