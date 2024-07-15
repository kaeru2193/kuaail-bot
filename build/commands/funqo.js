"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const canvas_1 = require("canvas");
const fs_1 = __importDefault(require("fs"));
module.exports = {
    cmd: "funqo",
    help: "`!k frog`\nbotがかえるのなきまねをします。",
    execute: async (message, args) => {
        if (!args[0]) {
            await message.reply("書記する文字列を指定してください。");
            return;
        }
        const text = args[0];
        //registerFont('./assets/fonts/Phun-Sans.ttf', { family: 'PhunSans Sans-Rounded' });
        const width = text.length * 50 + 50;
        const scale = width <= 1000 ? 1 : 1000 / width;
        const canvas = (0, canvas_1.createCanvas)(width * scale, 100 * scale);
        const ctx = canvas.getContext('2d');
        //背景色
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        ctx.font = `${Math.floor(50 * scale)}px "PhunSans Sans-Rounded"`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(args[0], canvas.width / 2, canvas.height / 2);
        const buffer = canvas.toBuffer("image/png");
        fs_1.default.writeFileSync("./img/funqo_img.png", buffer, {});
        await message.reply({ files: ["./img/funqo_img.png"] });
    },
};
