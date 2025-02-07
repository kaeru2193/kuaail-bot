import { Message } from "discord.js";
import { createCanvas, registerFont } from 'canvas';
import fs from "fs"

module.exports = {
	cmd: "funqo",
	help: "`!k funqo <文字列>`\n入力された文字列を雰字フォントで書記します。",
	execute: async (message: Message, args: string[]) => {
		if (!args[0]) {
            await message.reply("書記する文字列を指定してください。")
            return
        }

        const text = args[0]

        registerFont('./assets/fonts/Phun-Sans.ttf', { family: 'PhunSans' });

        const width = text.length * 50 + 50
        const scale = width <= 1000? 1: 1000 / width

        const canvas = createCanvas(width * scale, 100 * scale)

        const ctx = canvas.getContext('2d')

        //背景色
        ctx.beginPath();
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#000000'
        ctx.font = `${Math.floor(50 * scale)}px "PhunSans"`;
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(args[0], canvas.width / 2, canvas.height / 2);

        const buffer = canvas.toBuffer("image/png")
        fs.writeFileSync("./img/funqo_img.png", buffer, {})

        await message.reply({ files: ["./img/funqo_img.png"] })
	},
}