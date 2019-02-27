const fs = require('fs-extra')
const request = require('snekfetch')

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const download = (url, file) =>
  fs.ensureFile(file)
    .then(() => {
      const writer = fs.createWriteStream(file)
      request.get(url).pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })
    })

const writeToFile = (file, data) => fs.outputFile(file, data, {
  flag: 'a'
})

module.exports = {
  sleep,
  download,
  writeToFile
}
