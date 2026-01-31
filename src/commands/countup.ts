import { Message } from "discord.js";

interface State {
    count: number
}

module.exports = {
	cmd: "countup",
    help: "`!k countup`\nbotによる数え上げを開始します。メッセージを送信する度にカウントが増えます。",
	execute: async (message: Message): Promise<State|undefined> => {
		await message.reply('カウントアップ開始！')
        return {count: 0}
	},
    app: async (message: Message, data: State): Promise<State|undefined> => {
        data.count++
		await message.reply(`カウント: ${data.count}`)
        return data
	},
}