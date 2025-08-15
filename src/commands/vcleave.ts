import { Message } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

module.exports = {
    cmd: "vcleave",
    help: "`!k vcleave`\nbotがVCを退出します。",
    execute: async (message: Message) => {
        if (!message.guildId) {
            await message.reply('ここはサーバーではありません。')
            return
        }
        const connection = getVoiceConnection(message.guildId)
        if (!connection) {
            await message.reply('botはVCに接続していません。')
            return
        }
        connection.destroy()
        await message.reply('VCを退出しました。')
    },
}