import { GatewayIntentBits, Client, Events, Collection, Message } from 'discord.js'
import dotenv from 'dotenv'
import { command, app } from './lib/command'

dotenv.config()

const TOKEN = process.env.TOKEN
const prefix = "!k"

let dataStorage: any = {} //データ保存用

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once(Events.ClientReady, c => {
	console.log(`${c.user.tag}でログインしました。`);
});

client.login(TOKEN);

client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return //bot自身の発言を無視
	if (message.content.startsWith(";")) return //;で始まる内容はコメントであるため無視
	if (message.system) return //システムメッセージを無視
	
	const channelID = getID(message) //送信されたチャンネルを取得

	if (dataStorage.hasOwnProperty(channelID)) { //アプリ起動中の場合、bot宛でなくとも反応
		const data = await app(message, dataStorage[channelID]) //実行と同時に返り値も取得: [コマンド名, 保存用データ] の形式
		if (data) {
			dataStorage[channelID] = {status: data[0], data: data[1]} //コマンド用データを保存
		} else { //返り値なし、つまりコマンド終了
			delete dataStorage[channelID] //コマンド用データを削除
		}
		return
	}

    if (!message.content.startsWith(prefix)) return //bot宛でなければ無視

	const data = await command(message) //実行と同時に返り値も取得: [コマンド名, 保存用データ] の形式
	if (data) {
		dataStorage[channelID] = {status: data[0], data: data[1]} //コマンド用データを保存
	}
})

const getID = (message: Message) => {
	return `${message.guildId}/${message.channelId}`
}