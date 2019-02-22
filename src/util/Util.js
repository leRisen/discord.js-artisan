const fs = require('fs-extra')
const axios = require('axios')

exports.sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
exports.download = async (url, path) => {
  return fs.ensureFile(path)
    .then(() => {
      return axios({
        url,
        method: 'GET',
        responseType: 'stream'
      })
        .then(response => {
          const writer = fs.createWriteStream(path)
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

exports.asyncForEach = async (array, callback) => {
  for (let i = 0; i < array.length; i++) {
    await callback(array[i], i, array)
  }
}
