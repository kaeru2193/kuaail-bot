import { GatewayIntentBits, Client, Events, Collection, Message, Guild, ChannelType } from 'discord.js'
import { getVoiceConnection } from '@discordjs/voice'
import dotenv from 'dotenv'
import { command, app } from './lib/command'

dotenv.config()

const TOKEN = process.env.TOKEN
const prefix = process.env.prefix
const ALLOWED_GUILD = process.env.ALLOWED_GUILD?.split(" ")
const notAllowedMessage = "之機 (kua1ail2) は雰界創作のためのbotです。予期せぬ誤作動を防ぐため、このbotは雰界創作公式サーバー以外ではご利用になれません。ぜひ公式サーバーにお越しください。このサーバーからは自動的に退出します。👋"
const nobodyInVCMessage = "VCにメンバーが居なくなったので、VCから退出しました。"

if (!prefix) throw Error("接頭辞を設定してください。")
if (!ALLOWED_GUILD) throw Error("許可サーバーを設定してください。")

let dataStorage: any = {} //データ保存用

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });

client.once(Events.ClientReady, c => {
	console.log(`${c.user.tag}でログインしました。`);
	console.log(`参加サーバー数: ${client.guilds.cache.size}`)
});

client.login(TOKEN);

client.on(Events.GuildCreate, async (guild: Guild) => { //サーバーに新たに参加した時
	if (!ALLOWED_GUILD.includes(guild.id)) {
		if (guild.systemChannel) {
			await guild.systemChannel.send(notAllowedMessage)
		}
		await guild.leave()
	}
})

client.on(Events.MessageCreate, async (message: Message) => { //メッセージが送信された時
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
	if (message.content.split(" ")[0] != prefix) return //空白区切りで接頭辞が一致しない（接頭辞の後ろに空白がない）時も無視

	const data = await command(message) //実行と同時に返り値も取得: [コマンド名, 保存用データ] の形式
	if (data) {
		dataStorage[channelID] = {status: data[0], data: data[1]} //コマンド用データを保存
	}
})

const getID = (message: Message) => {
	return `${message.guildId}/${message.channelId}`
}

client.on(Events.VoiceStateUpdate, (oldState, newState) => { //VCの状態が変化した時
	const connection = getVoiceConnection(oldState.guild.id)
    if (!connection) { return } //botが当該サーバーのVCに入っていなければ無視

	const vcID = connection.joinConfig.channelId
	if (!vcID) { return }

	const vcChannel = client.channels.cache.get(vcID)
	if (!vcChannel) { return }
	if (!vcChannel.isVoiceBased()) { return } //VCでなければ無視

	if (vcChannel.members.filter(m => !m.user.bot).size <= 0) { //VCにbotを除いて誰も居ない場合
		connection.destroy()
		delete dataStorage[`${vcChannel.guildId}/${vcChannel.id}`] //アプリを強制終了

		vcChannel.send(nobodyInVCMessage)
	}
})