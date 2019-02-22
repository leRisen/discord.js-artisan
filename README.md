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

const client = new discord.Client()
const artisan = require('discord.js-artisan')

artisan.start(client)
client.login('YOUR_USER_TOKEN_HERE').catch(console.error)
```

### Commands

- `cl`: deleting your messages
- `du`: save all messages with files

> These commands need to be entered in the dialogue/channel.

### Available options

| Type | Name | Default
| --- | --- | --- |
| String | clearCommand | cl |
| String | dumpCommand | du |

> These options need to be placed in the object and passed at `artisan.start(client, { options })`
