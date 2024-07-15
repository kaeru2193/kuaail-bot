"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const command_1 = require("./lib/command");
dotenv_1.default.config();
const TOKEN = process.env.TOKEN;
const prefix = "!k";
let dataStorage = {}; //データ保存用
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.MessageContent] });
client.once(discord_js_1.Events.ClientReady, c => {
    console.log(`${c.user.tag}でログインしました。`);
});
client.login(TOKEN);
client.on(discord_js_1.Events.MessageCreate, async (message) => {
    if (message.author.bot)
        return; //bot自身の発言を無視
    if (message.content.startsWith(";"))
        return; //;で始まる内容はコメントであるため無視
    if (message.system)
        return; //システムメッセージを無視
    const channelID = getID(message); //送信されたチャンネルを取得
    if (dataStorage.hasOwnProperty(channelID)) { //アプリ起動中の場合、bot宛でなくとも反応
        const data = await (0, command_1.app)(message, dataStorage[channelID]); //実行と同時に返り値も取得: [コマンド名, 保存用データ] の形式
        if (data) {
            dataStorage[channelID] = { status: data[0], data: data[1] }; //コマンド用データを保存
        }
        else { //返り値なし、つまりコマンド終了
            delete dataStorage[channelID]; //コマンド用データを削除
        }
        console.log(dataStorage);
        return;
    }
    if (!message.content.startsWith(prefix))
        return; //bot宛でなければ無視
    const data = await (0, command_1.command)(message); //実行と同時に返り値も取得: [コマンド名, 保存用データ] の形式
    if (data) {
        dataStorage[channelID] = { status: data[0], data: data[1] }; //コマンド用データを保存
    }
    console.log(dataStorage);
});
const getID = (message) => {
    return `${message.guildId}/${message.channelId}`;
};
