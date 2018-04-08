let mongoose = require('mongoose')
let {MongoMemoryServer} = require('mongodb-memory-server')

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000 * 5

let mongoServer
const opts = { useMongoClient: true } // remove this option if you use mongoose 5 and above

beforeAll(async () => {
  mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getConnectionString()
  await mongoose.connect(mongoUri, opts, (err) => {
    if (err) console.error(err)
  })
})

afterAll(() => {
  mongoose.disconnect()
  mongoServer.stop()
})

describe('...', () => {
  it('...', async () => {
    const User = mongoose.model('User', new mongoose.Schema({ name: String }))
    const cnt = await User.count()
    expect(cnt).toEqual(0)
  })
})
