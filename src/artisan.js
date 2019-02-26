const logger = require('./logger')
const { join } = require('path')
const CircularJSON = require('circular-json')
const { download, writeToFile } = require('./util/Util')

const MAX_LIMIT = 100

class Artisan {
  constructor (options) {
    this.pathToSave = (options && options.pathToSave) || './dump'
    this.saveEmbeds = (options && options.saveEmbeds) || false
    this.saveAttachments = (options && options.saveAttachments) || true
  }

  messageFilter ({ embeds, content, attachments }) {
    return embeds.length || content.length || attachments.size
  }

  sortByCreatedAt (a, b) {
    return (a.createdAt > b.createdAt) ? 1 : ((b.createdAt > a.createdAt) ? -1 : 0)
  }

  getMessages (channel, messageId) {
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

  async dumper (channel, messageId, total = {
    embeds: 0,
    messages: 0,
    attachments: 0
  }) {
    try {
      const place = this.getPlaceUsingChannel(channel)
      const { lastMessageId, filteredMessages } = await this.getMessages(channel, messageId)

      if (filteredMessages.length) {
        const jobs = []
        const sortedMessages = filteredMessages.sort(this.sortByCreatedAt)

        sortedMessages.forEach(message => {
          const { author, channel, embeds, content, createdAt, attachments } = message
          const channelId = channel.id

          const createdAtDate = new Date(createdAt)

          const date = createdAtDate.toLocaleDateString()
          const time = createdAtDate.toLocaleTimeString()

          const path = join(this.pathToSave, `${channelId}/${date}`)

          const messageFormat = `[${time}] ${author.tag}`
          const messageHistoryFile = join(path, 'messages.txt')

          if (content.length) {
            jobs.push(writeToFile(messageHistoryFile, `${messageFormat}: ${content}\n`))

            total.messages += 1
          }

          if (embeds.length && this.saveEmbeds) {
            embeds.forEach((embed, n) => {
              delete embed.message

              const name = `embed_${n + 1}.json`
              const object = CircularJSON.stringify(embed, null, 4)
              const embedFile = join(path, name)

              jobs.push(
                writeToFile(embedFile, object),
                writeToFile(messageHistoryFile, `${messageFormat}: ${name}\n`)
              )
            })

            total.embeds += embeds.length
          }

          if (attachments.size && this.saveAttachments) {
            const attachmentsArray = attachments.array()

            attachmentsArray.forEach(attachment => {
              const { id, proxyURL, filename } = attachment

              const name = `${id}_${filename}`
              const attachmentFile = join(path, `files/${name}`)

              jobs.push(
                download(proxyURL, attachmentFile),
                writeToFile(messageHistoryFile, `${messageFormat}: ${name}\n`)
              )
            })

            total.attachments += attachmentsArray.length
          }
        })

        await Promise.all(jobs.map(j => j.catch(e => e)))
        logger.info(`Currently saved ${JSON.stringify(total)} ${place}`)

        return this.dumper(channel, lastMessageId, total)
      } else {
        logger.info(`${JSON.stringify(total)} has been saved ${place}`)
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
