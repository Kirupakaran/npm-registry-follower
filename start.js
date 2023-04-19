const nano = require('nano')('https://replicate.npmjs.com')
const db = nano.db.use('registry')

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
