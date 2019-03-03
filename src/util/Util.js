const fs = require('fs-extra')
const request = require('request')

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

const writeToFile = (file, data) =>
  fs.outputFile(file, data, {
    flag: 'a'
  })

const removeKeysFromObject = (obj, keys) => {
  let index
  let value
  let typeOf

  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      index = keys.indexOf(prop)
      value = obj[prop]
      typeOf = typeof value

      if (typeOf === 'string') {
        if (index > -1) {
          obj[prop] = undefined
        }
      } else if (value && typeOf === 'object') {
        if (index > -1) {
          obj[prop] = undefined
        } else {
          removeKeysFromObject(value, keys)
        }
      }
    }
  }

  return obj
}

module.exports = {
  sleep,
  download,
  writeToFile,
  removeKeysFromObject
}
