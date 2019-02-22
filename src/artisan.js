const logger = require('./logger')
const { resolve } = require('path')
const { sleep, download, writeToFile, asyncForEach } = require('./util/Util')

class Artisan {
  constructor () {
    this.MAX_LIMIT = 100
  }

  messageFilter ({ content, attachments }) {
    return content.length || attachments.size
  }

  sortByCreatedAt (a, b) {
    return (a.createdAt > b.createdAt) ? 1 : ((b.createdAt > a.createdAt) ? -1 : 0)
  }

  async getMessages (channel, messageId) {
    return channel.fetchMessages({ before: messageId, limit: this.MAX_LIMIT })
      .then(messages => {
        const messagesArray = messages.array()
        const lastMessage = messagesArray[messagesArray.length - 1]

        const filteredMessages =
          messagesArray
            .filter(this.messageFilter)
            .sort(this.sortByCreatedAt)

        logger.info(`Receiving ${this.MAX_LIMIT} messages after the message with id ${messageId}`)

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
        let count = 0

        await asyncForEach(filteredMessages, async message => {
          const { author, channel, content, createdAt, attachments } = message
          const channelId = channel.id

          const createdAtDate = new Date(createdAt)
          const date = createdAtDate.toLocaleDateString()

          if (content.length) {
            const time = createdAtDate.toLocaleTimeString()

            const file = resolve(__dirname, `../dump/${channelId}/${date}/messages.txt`)
            await writeToFile(file, `[${time}] ${author.tag}: ${content}\n`)
          }

          if (attachments.size) {
            const attachmentsArray = attachments.array()

            await asyncForEach(attachmentsArray, async attachment => {
              const { filename, proxyURL } = attachment

              const file = resolve(__dirname, `../dump/${channelId}/${date}/files/${filename}`)
              await download(proxyURL, file)
            })
          }

          count += 1
        })

        if (count > 0) {
          totalCount += count
          logger.info(`Currently saved ${totalCount} message(-s) ${place}`)
        }

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
        let count = 0

        await asyncForEach(filteredMessages, async message => {
          const { deletable } = message

          if (deletable) {
            await message.delete()

            count += 1
            await sleep(2e3)
          }
        })

        if (count > 0) {
          totalCount += count
          logger.info(`Currently deleted ${totalCount} message(-s) ${place}`)
        }

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
