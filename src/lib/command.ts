import { Message } from "discord.js"
import fs from "fs"

const commandData: any[] = JSON.parse(fs.readFileSync("build/index.json", 'utf8'))

export const command = async (message: Message) => { //初回呼びかけの処理
    const [cmd, ...args] = message.content.split(" ").slice(1) //スペースで区切り、bot呼び出し部分は切り落とし
    
    const cmdArr = commandData.filter((c: any) => c.cmd == cmd)

    if (cmdArr.length <= 0) { //指定されたコマンドが存在しない場合
        notExistCommand(message)
        return
    }

    const cmdModule = require(cmdArr[0].path)

    try {
        const data = await cmdModule.execute(message, args) //実行と同時に返り値を取得

        if (data) {
            return [cmd, data] //コマンド名(ステータス用)とデータを上申
        }
    } catch (error) {
        internalError(message)
        return
    }
}

export const app = async (message: Message, previousData: any) => { //アプリ起動中の処理
    const cmdArr = commandData.filter((c: any) => c.cmd == previousData.status)

    if (cmdArr.length <= 0) { //指定されたコマンドが存在しない場合（ありえないはずなのでエラー）
        internalError(message)
        return
    }

    const cmdModule = require(cmdArr[0].path)
    
    try {
        const data = await cmdModule.app(message, previousData.data) //実行と同時に返り値を取得

        if (data) {
            return [previousData.status, data] //コマンド名とデータを上申
        }
    } catch (error) {
        appInternalError(message)
        return
    }
}

const notExistCommand = async (message: Message) => {
    await message.reply('存在しないコマンドです。')
}

const internalError = async (message: Message) => {
    await message.reply('内部エラーです。必要な場合は管理者にお問い合わせください。')
}

const appInternalError = async (message: Message) => {
    await message.reply('内部エラーが発生したため、アプリを終了します。必要な場合は管理者にお問い合わせください。')
}