# Discord Artisan

[![Downloads](https://img.shields.io/npm/dt/discord.js-artisan.svg)](https://www.npmjs.com/package/discord.js-artisan)
[![Build status](https://travis-ci.org/leRisen/discord.js-artisan.svg)](https://travis-ci.org/leRisen/discord.js-artisan)

## About

Artisan is the add-in for [discord.js](https://github.com/discordjs/discord.js) which allows you to delete, save messages with files from the dialogue/channels.

## Install

- `npm install discord.js-artisan` <> `yarn add discord.js-artisan`

## Example

```js
const { Client } = require('discord.js')
const { Artisan } = require('discord.js-artisan')

const bot = new Client()
const artisan = new Artisan({
    pathToSave: 'YOUR_CUSTOM_PATH_HERE',
    saveEmbeds: true
})

bot
    .once('ready', () => console.log('Ready!'))
    .on('message', message => {
        const { id: messageId, author, client, channel, content: cmd } = message
        if (client.user.id !== author.id) return

        // messageId - ID before which there will be a search for messages

        if (cmd === 'dump') return artisan.dumper(channel, messageId)
        else if (cmd === 'clear') return artisan.cleaner(channel, messageId)        
    })
    .login('YOUR_USER_TOKEN_HERE').catch(console.error)
```

## Available options

| Type | Name | Description | Default
| --- | --- | --- | --- |
| String | pathToSave | Path where dumper files will be stored | folder "dump" in work directory |
| Boolean | saveEmbeds | Whether to save embeds | false |
| Boolean | saveAttachments | Whether to save attachments | true |

> These options need to be placed in the object and passed at `constuctor Artisan`
