import { Message } from "discord.js";
import fs from "fs"
import { execSync } from "child_process";

const voices = ["", "+Henrique", "+Annie", "+f4"]

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

        if (phoneme.split(" ").length > 50) {
            await message.reply("文章が長すぎます。50音節以内で指定して下さい。")
            return
        }

        console.log(phoneme)

        const fileName = `kuowe_${Date.now() % 10000}.wav` //一意なファイル名で管理
        const stdout = execSync(`espeak-ng -v phn${voiceName} "${phoneme}" -w ./tmp/${fileName}`)

        await message.reply({ files: [`./tmp/${fileName}`] })

        fs.unlinkSync(`./tmp/${fileName}`)
    },
}

const getDict = () => {
    const dict: any[] = JSON.parse(fs.readFileSync("./assets/data/phun-dict.json", "utf-8")).data
    return dict
}

const convertPron = (text: string) => {
    const dict = getDict()
    const commas = "、," //読点相当

    const phoneme = text.split(/[。！？!?―「」.\n]/g) //句点相当
    .filter(sentence => sentence)
    .map(sentence => sentence
        .split("")
        .map(chara => {
            const entry = dict.find(e => e.word == chara)
            return entry
                ? entry.pron
                : commas.includes(chara)
                    ? ","
                    : ""
        })
        .filter(pron => pron).join(" ")
        .replace(" ,", ",") //カンマ前のスペースを消す
        .replace(/([snm(ng)])([123])\s(y?[aiueo])/g, (_, p1, p2, p3) => `${p1}${p2} ${p1}${p3}`) //母音の連音
        .replace(/l([123])\s(y?[aiueo])/g, (_, p1, p2) => `ll${p1} l${p2}`) //dark Lにはならない
        .replace(/s([123])\s([xqj])/g, (_, p1, p2) => `x${p1} ${p2}`) //x, q, jの連音
        .replace(/s([123])\sz/g, (_, p1) => `z${p1} z`) //zの連音
            + "."
    ).join(" ")

    return phoneme
}