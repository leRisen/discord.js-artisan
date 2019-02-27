const fs = require('fs-extra')
const axios = require('axios')

exports.sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
exports.download = (url, file) => {
  const options = {
    url,
    method: 'GET',
    responseType: 'stream'
  }

  const promises = [
    fs.ensureFile(file),
    axios(options)
  ]

  return Promise.all(promises.map(promise => promise.catch(e => e)))
    .then(response => {
      const writer = fs.createWriteStream(file)
      response.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })
    })
}

exports.writeToFile = (file, data) => {
  const promises = [
    fs.ensureFile(file),
    fs.appendFile(file, data)
  ]

  return Promise.all(promises.map(promise => promise.catch(e => e)))
}
