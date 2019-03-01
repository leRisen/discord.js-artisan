declare module 'discord.js-artisan' {
    import { Client, Message, DMChannel, TextChannel, GroupDMChannel } from 'discord.js'

    export class Artisan {
        constructor(options?: artisanOptions)

        public pathToSave: string
        public saveEmbeds: boolean
        public saveAttachments: boolean

        private messageFilter({}: Message): boolean
        private sortByCreatedAt(a: Message, b: Message): number

        public getMessages(channel: TextableChannel, messageId: number): object
        public getPlaceUsingChannel(channel: TextableChannel): string

        public dumper(channel: TextableChannel, messageId: number, total?: totalDumpDetails): any
        public cleaner(channel: TextableChannel, messageId: number, totalCount?: number): any
    }

    export interface artisanOptions {
        pathToSave?: string
        saveEmbeds?: boolean
        saveAttachments?: boolean
    }

    export interface totalDumpDetails {
        embeds: number
        messages: number
        attachments: number
    }

    export type TextableChannel = DMChannel | TextChannel | GroupDMChannel
}
