const logger = require('./logger')

const Artisan = require('./artisan')
const artisan = new Artisan()

exports.start = (client, options) => {
  const dumpCommand = (options && options.dumpCommand) || 'du'
  const clearCommand = (options && options.clearCommand) || 'cl'

  client
    .on('warn', logger.warn)
    .on('error', logger.error)
    .once('ready', () => logger.info('Discord Artisan succesfuly included!'))
    .on('message', message => {
      const { id: messageId, author, client, channel, content: cmd } = message
      if (client.user.id !== author.id) return

      if (cmd === dumpCommand) return artisan.dumper(channel, messageId)
      else if (cmd === clearCommand) return artisan.cleaner(channel, messageId)
    })
}
