const { join } = require('path')
const { mkdirSync, existsSync } = require('fs')
const { format, transports, createLogger } = require('winston')
const { splat, printf, combine, colorize, timestamp } = format

const logDir = 'log'

if (!existsSync(logDir)) {
  mkdirSync(logDir)
}

const filename = join(logDir, 'results.log')

const errorStackTracerFormat = format(info => {
  if (info.meta && info.meta instanceof Error) {
    info.message = `${info.message}: ${info.meta.stack}`
  }

  return info
})

const logger = createLogger({
  level: 'debug',
  format: combine(
    splat(),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    errorStackTracerFormat(),
    printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      level: 'info',
      format: combine(
        colorize(),
        printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
    new transports.File({ filename })
  ]
})

module.exports = logger
