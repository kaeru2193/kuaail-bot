import { Message } from "discord.js";
import fs from "fs"
import { getDict } from "../lib/funcs";

interface State {
    chara: {
        chara: string
        pron: string
        meaning: string
    }
    number: number
    score: number
}

module.exports = {
    cmd: "wefuyao",
    help: "`!k wefuyao`\n雰字の漢字転写から読みを答えるクイズを開始します。回答は数字式雰拼で入力してください。",
    execute: async (message: Message): Promise<State|undefined> => {
        const dict = getDict()

        const chara = selectChara(dict)
        await message.reply(`ゲーム開始！十問出題するよ！\n――――\n**第1問:** ${chara.chara}`)
        return {chara: chara, number: 1, score: 0}
    },
    app: async (message: Message, data: State): Promise<State|undefined> => {
        const dict = getDict()
        let content = ""

        const answer = message.content
        if (answer == data.chara.pron) {
            content += `## <:Tuo:1145960026805116979>:tada: 正解！ <:Tuo:1145960026805116979>:tada:`
            data.score++
        } else {
            content += `## <:Qon:1146634021334425630>:sob: 不正解… <:Qon:1146634021334425630>:sob:`
        }

        content += `\n${data.chara.chara}: **${data.chara.pron}**\n${data.chara.meaning}\n――――`

        if (data.number >= 10) {
            content += `\nゲーム終了！ 正解数: **${data.score}問**`
            await message.reply(content)
            return
        } else {
            data.number++
            const chara = selectChara(dict)
            content += `\n**第${data.number}問:** ${chara.chara}`
            data.chara = chara
            await message.reply(content)
            return data
        }
    },
}

const selectChara = (dict: any[]) => {
    const singleChara = dict.filter(w => w.word.length == 1)
    const selected = singleChara[Math.floor(Math.random() * singleChara.length)]

    const meaning = selected.mean.map((m: any) => {
        const translate = m.explanation.map((e: any) => e.translate).join("／")
        return `«${m.type}» ${translate}`
    }).join("\n")

    return {
        chara: selected.word,
        pron: selected.pron,
        meaning: meaning
    }
}