import { Message } from "discord.js";
import fs from "fs"
import { execSync } from "child_process";
import { convertPron, voices } from "../lib/funcs";

module.exports = {
    cmd: "kuowe",
    help: "`!k kuowe <文章> (<ボイス>)`\n入力された文章を雰語ttsで読み上げます。ボイスは1～4の数字で指定可能です。デフォルト値は`1`です。",
    execute: async (message: Message, args: string[]) => {
        if (!args[0]) {
            await message.reply("読み上げる文章を指定してください。")
            return
        }

        let voiceName = voices[0]
        if (args[1]) { //ボイス指定がある時
            voiceName = voices[Number(args[1]) - 1]
            if (!voiceName) {
                await message.reply("ボイス指定が無効です。")
                return
            }
        }

        const phoneme = convertPron(args[0])

        if (phoneme.split(" ").length > 300) {
            await message.reply("文章が長すぎます。300音節以内で指定して下さい。")
            return
        }

        console.log(phoneme)

        const fileName = `kuowe_${Date.now() % 10000}.wav` //一意なファイル名で管理
        const stdout = execSync(`espeak-ng -v phn${voiceName} "${phoneme}" -w ./tmp/${fileName}`)

        await message.reply({ files: [`./tmp/${fileName}`] })

        fs.unlinkSync(`./tmp/${fileName}`) //ファイルを削除
    },
}