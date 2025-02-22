import { Message } from "discord.js";
import { createCanvas, registerFont } from 'canvas';
import fs from "fs"
import path from "path"

const fonts = [
    {
        name: "psans",
        path: "PhunSans.ttf"
    },
    {
        name: "pdot",
        path: "PhunDot.ttf"
    },
    {
        name: "tuofaqo",
        path: "TuoFaQo.ttf"
    },
]

module.exports = {
	cmd: "funqo",
	help: "`!k funqo <文字列> (<フォント>)`\n入力された文字列を雰字フォントで書記します。フォントには`psans`（ゴシック体）、`pdot`（ドット書体）、`tuofaqo`（桜筆書体）を指定可能です。デフォルト値は`psans`です。",
	execute: async (message: Message, args: string[]) => {
		if (!args[0]) {
            await message.reply("書記する文字列を指定してください。")
            return
        }
        if (args[0].length > 30) {
            await message.reply("文字列が長すぎます。30字以内で指定して下さい。")
            return
        }

        let fontData = fonts[0]
        if (args[1]) { //フォント指定がある時
            const searchFont = fonts.find(f => f.name == args[1])
            if (!searchFont) {
                await message.reply("フォント名が無効です。")
                return
            }
            fontData = searchFont
        }

        const text = args[0]

        registerFont(path.join(__dirname, `../../assets/fonts/${fontData.path}`), { family: fontData.name });

        const width = text.length * 50 + 50
        const scale = width <= 1000? 1: 1000 / width //幅が1000pxを超えたら、1000pxに収まるように全体を縮小する

        const canvas = createCanvas(width * scale, 100 * scale)

        const ctx = canvas.getContext('2d')

        //背景色
        ctx.beginPath();
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#000000'
        ctx.font = `${Math.floor(50 * scale)}px "${fontData.name}"`;
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(args[0], canvas.width / 2, canvas.height / 2);

        const buffer: any = canvas.toBuffer("image/png")
        fs.writeFileSync("./img/funqo_img.png", buffer, {})

        await message.reply({ files: ["./img/funqo_img.png"] })
	},
}