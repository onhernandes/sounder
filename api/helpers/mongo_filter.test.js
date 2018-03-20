/* eslint-env jest */
const mongoFilter = require('./mongo_filter')

test('mongo_filter return a clean object without custom filtering', () => {
  let toBeCleaned = {
    _id: 'aisydfgyu43712t6gy',
    __v: 5,
    tries: 10,
    title: 'Test'
  }

  let cleaned = {
    _id: 'aisydfgyu43712t6gy',
    title: 'Test'
  }

  expect(mongoFilter(toBeCleaned)).toEqual(cleaned)
})

test('mongo_filter return a clean object with custom filtering', () => {
  let toBeCleaned = {
    _id: 'aisydfgyu43712t6gy',
    __v: 5,
    tries: 10,
    title: 'Test'
  }

  let cleaned = {
    title: 'Test'
  }

  expect(mongoFilter(toBeCleaned, ['_id'])).toEqual(cleaned)
})

test('mongo_filter return a clean object from array without custom filtering', () => {
  let toBeCleaned = {
    _id: 'aisydfgyu43712t6gy',
    __v: 5,
    tries: 10,
    title: 'Test'
  }

  toBeCleaned = [toBeCleaned, toBeCleaned]

  let cleaned = {
    _id: 'aisydfgyu43712t6gy',
    title: 'Test'
  }

  cleaned = [cleaned, cleaned]

  expect(mongoFilter(toBeCleaned)).toEqual(expect.arrayContaining(cleaned))
})

test('mongo_filter return a clean object from array with custom filtering', () => {
  let toBeCleaned = {
    _id: 'aisydfgyu43712t6gy',
    __v: 5,
    tries: 10,
    title: 'Test'
  }

  toBeCleaned = [toBeCleaned, toBeCleaned]

  let cleaned = {
    title: 'Test'
  }

  cleaned = [cleaned, cleaned]

  expect(mongoFilter(toBeCleaned, ['_id'])).toEqual(expect.arrayContaining(cleaned))
})
