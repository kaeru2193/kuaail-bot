import { Message } from "discord.js"
import fs from "fs"
import path from "path"
import { getVoiceConnection } from "@discordjs/voice"

const commandData: any[] = JSON.parse(fs.readFileSync("build/index.json", 'utf8'))
const commandsPath = path.join(__dirname, '../commands')

export const command = async (message: Message) => { //初回呼びかけの処理
    const [cmd, ...args] = message.content.replace(/\s+/g, " ").split(" ").slice(1) //複数スペースを削除してからスペースで区切り、bot呼び出し部分は切り落とし

    if (!cmd) { //呼びかけ単体
        await message.reply('こんにちは！***之機 (kua1ail2)***だよ！\n`!k help`でbotの説明を表示できます。')
        return
    }
    
    const cmdArr = commandData.filter((c: any) => c.cmd == cmd)

    if (cmdArr.length <= 0) { //指定されたコマンドが存在しない場合
        notExistCommand(message)
        return
    }

    const cmdPath = path.join(commandsPath, `./${cmdArr[0].path}`)
    const cmdModule = require(cmdPath)

    try {
        const data = await cmdModule.execute(message, args) //実行と同時に返り値を取得

        if (data) {
            return [cmd, data] //コマンド名(ステータス用)とデータを上申
        }
    } catch (error) {
        internalError(message, error)
        return
    }
}

export const app = async (message: Message, previousData: any) => { //アプリ起動中の処理
    if (message.content == "stop") { //stopと入力されたらコマンド終了
        leaveVC(message)
        message.reply('アプリを中断しました。')
        return
    }
    
    const cmdArr = commandData.filter((c: any) => c.cmd == previousData.status)

    if (cmdArr.length <= 0) { //指定されたコマンドが存在しない場合（ありえないはずなのでエラー）
        internalError(message, "指定されたコマンドが存在しません")
        return
    }

    const cmdPath = path.join(commandsPath, `./${cmdArr[0].path}`)
    const cmdModule = require(cmdPath)
    
    try {
        const data = await cmdModule.app(message, previousData.data) //実行と同時に返り値を取得

        if (data) {
            return [previousData.status, data] //コマンド名とデータを上申
        }
    } catch (error) {
        appInternalError(message, error)
        return
    }
}

export const getHelp = async () => { //ヘルプを取得
    const helps = commandData.map(c => {return {cmd: c.cmd, help: c.help}})
    return helps
}

const notExistCommand = async (message: Message) => {
    await message.reply(':x: 存在しないコマンドです。')
}

const internalError = async (message: Message, e: any) => {
    await message.reply(':hot_face: 内部エラーです。必要な場合は管理者にお問い合わせください。')
    console.log(e)
    
    if (!message.guildId) { return }
    const connection = getVoiceConnection(message.guildId)
    if (connection) { connection.destroy() } //botがVCに入っていたら切断する
}

const appInternalError = async (message: Message, e: any) => {
    await message.reply(':hot_face: 内部エラーが発生したため、アプリを終了します。必要な場合は管理者にお問い合わせください。')
    console.log(e)
    
    leaveVC(message)
}

const leaveVC = async (message: Message) => {
    if (!message.guildId) { return }
    const connection = getVoiceConnection(message.guildId)
    if (connection) { connection.destroy() } //botがVCに入っていたら切断する
}