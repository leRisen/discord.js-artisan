const fs = require('fs-extra')
const axios = require('axios')

exports.sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
exports.download = async (url, file) => {
  return fs.ensureFile(file)
    .then(() => {
      return axios({
        url,
        method: 'GET',
        responseType: 'stream'
      })
        .then(response => {
          const writer = fs.createWriteStream(file)
          response.data.pipe(writer)

          return new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
          })
        })
    })
}

exports.writeToFile = async (file, data) => {
  return fs.ensureFile(file)
    .then(() => fs.appendFile(file, data))
}
