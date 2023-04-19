const nano = require('nano')('https://replicate.npmjs.com')
const { Sequelize } = require('sequelize');

const postgresConn = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_URL}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
const sequelize = new Sequelize(postgresConn)
const db = nano.db.use('registry')

async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

function start() {
  let lastSequence = 0

  db.changesReader.start({
    includeDocs: false,
    since: lastSequence,
    batchSize: 10
  })
    .on('batch', (b) => {
      console.log('batch', b)
    }).on('seq', (s) => {
      lastSequence = s
    }).on('error', (e) => {
      console.error('error', e);
    })
}
testConnection().then(start)
