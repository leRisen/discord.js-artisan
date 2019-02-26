<p align="center"><img src="https://nodei.co/npm/discord.js-artisan.png?downloads=true&stars=true" alt="NPM info"/></p>

# Discord Artisan
*this add-in that allows you to delete, save messages with files from the dialogue/channels in the Discord.*

## Table Of Contents
- [Install](#install)
- [Example](#example)
- [Commands](#commands)
- [Available options](#available-options)

### Install

- `npm install discord.js-artisan` <> `yarn add discord.js-artisan`

### Example

```js
const discord = require('discord.js')
const artisan = require('discord.js-artisan')

const client = new discord.Client()

artisan.start(client)
client.login('YOUR_USER_TOKEN_HERE').catch(console.error)
```

### Commands

- `cl`: deleting your messages
- `du`: save all messages with files

### Available options

| Type | Name | Description | Default
| --- | --- | --- | --- |
| String | pathToSave | Path where dumper files will be stored | folder "dump" in work directory |
| Boolean | saveEmbeds | Whether to save embeds | false |
| Boolean | saveAttachments | Whether to save attachments | true |
| String | clearCommand | Command to call Cleaner | cl |
| String | dumpCommand | Command to call Dumper | du |

> These options need to be placed in the object and passed at `artisan.start(client, { options })`
