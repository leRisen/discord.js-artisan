const logger = require('./logger')
const { join } = require('path')
const { download, writeToFile } = require('./util/Util')

const MAX_LIMIT = 100

class Artisan {
  constructor (options) {
    this.pathToSave = (options && options.pathToSave) || './dump'
  }

  messageFilter ({ content, attachments }) {
    return content.length || attachments.size
  }

  sortByCreatedAt (a, b) {
    return (a.createdAt > b.createdAt) ? 1 : ((b.createdAt > a.createdAt) ? -1 : 0)
  }

  async getMessages (channel, messageId) {
    return channel.fetchMessages({ before: messageId, limit: MAX_LIMIT })
      .then(messages => {
        const messagesArray = messages.array()
        const lastMessage = messagesArray[messagesArray.length - 1]

        const filteredMessages = messagesArray.filter(this.messageFilter)

        logger.info(`Receiving ${MAX_LIMIT} messages after the message with id ${messageId}`)

        return {
          lastMessageId: (lastMessage && lastMessage.id) || 0,
          filteredMessages
        }
      })
  }

  getPlaceUsingChannel (channel) {
    const { recipient, name } = channel
    return recipient ? `in dialogue (${recipient.username})` : `in channel (${name})`
  }

  async dumper (channel, messageId, totalCount = 0) {
    try {
      const place = this.getPlaceUsingChannel(channel)
      const { lastMessageId, filteredMessages } = await this.getMessages(channel, messageId)

      if (filteredMessages.length) {
        const jobs = []
        const sortedMessages = filteredMessages.sort(this.sortByCreatedAt)

        sortedMessages.forEach(message => {
          const { author, channel, content, createdAt, attachments } = message
          const channelId = channel.id

          const createdAtDate = new Date(createdAt)
          const date = createdAtDate.toLocaleDateString()

          if (content.length) {
            const time = createdAtDate.toLocaleTimeString()

            const file = join(this.pathToSave, `${channelId}/${date}`, 'messages.txt')
            jobs.push(writeToFile(file, `[${time}] ${author.tag}: ${content}\n`))
          }

          if (attachments.size) {
            const attachmentsArray = attachments.array()

            attachmentsArray.map(attachment => {
              const { proxyURL, filename } = attachment

              const file = join(this.pathToSave, `${channelId}/${date}/files`, filename)
              jobs.push(download(proxyURL, file))
            })
          }
        })

        await Promise.all(jobs.map(j => j.catch(e => e)))

        totalCount += filteredMessages.length
        logger.info(`Currently saved ${totalCount} message(-s) ${place}`)

        return this.dumper(channel, lastMessageId, totalCount)
      } else {
        logger.info(`All messages have been saved ${place}`)
      }
    } catch (err) {
      logger.error('Oops, there was an error in "Dumper"\n\t', new Error(err))
    }
  }

  async cleaner (channel, messageId, totalCount = 0) {
    try {
      const place = this.getPlaceUsingChannel(channel)
      const { lastMessageId, filteredMessages } = await this.getMessages(channel, messageId)

      if (filteredMessages.length) {
        const jobs = []

        filteredMessages.forEach(message => {
          if (message.deletable) {
            jobs.push(message.delete())
          }
        })

        if (jobs.length) await Promise.all(jobs.map(j => j.catch(e => e)))

        totalCount += jobs.length
        logger.info(`Currently deleted ${totalCount} message(-s) ${place}`)

        return this.cleaner(channel, lastMessageId, totalCount)
      } else {
        logger.info(`All your messages have been deleted ${place}`)
      }
    } catch (err) {
      logger.error('Oops, there was an error in "Cleaner"\n\t', new Error(err))
    }
  }
}

module.exports = Artisan
