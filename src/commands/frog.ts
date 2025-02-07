import { Message } from "discord.js";

module.exports = {
	cmd: "frog",
	help: "`!k frog`\nbotがかえるのなきまねをします。",
	execute: async (message: Message) => {
		await message.reply('**分分 (gùalgùal) ！**')
	},
}