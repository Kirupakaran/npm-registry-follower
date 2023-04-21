const nano = require('nano')('https://replicate.npmjs.com')
const { Sequelize } = require('sequelize')
const axios = require('axios')

const postgresConn = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_URL}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`

const sequelize = new Sequelize(postgresConn, { logging: console.log })

const Package = require('./models/package')(sequelize)
const Sequence = require('./models/followersequence')(sequelize)

const db = nano.db.use('registry')
let seq

async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    throw error
  }
}

async function start() {
  let lastSequence = 0

  const seqRows = await Sequence.findAll()
  if (seqRows.length > 0) {
    seq = seqRows[0]
    lastSequence = seq.sequence
  } else {
    seq = await Sequence.create({ sequence: 0 })
  }

  db.changesReader.start({
    includeDocs: false,
    since: lastSequence,
    batchSize: 10
  })
    .on('batch', async (b) => {
      const packages = await Promise.all(b.map(async (doc) => {
        try {
          const response = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(doc.id)}`)
          const { data } = response
          return {
            name: data.name,
            readme: data.readme
          }
        } catch (err) {
          if (err.response && err.response.status === 404) {
            console.log('package not found', doc.id)
            return {}
          }
          console.error('error fetching package', err)
          return {
            name: doc.id,
            readme: null
          }
        }
      }))

      await Package.bulkCreate(packages)
    }).on('seq', async (s) => {
      lastSequence = s
      seq.sequence = s
      await seq.save()
    }).on('error', (e) => {
      console.error('error', e);
    })
}
testConnection().then(start).catch((e) => {
  seq.sequence = lastSequence
  logger.error('exiting on failure',e)
  process.exit(1)
})

process.on('exit', () => {
  return sequelize.close()
})
