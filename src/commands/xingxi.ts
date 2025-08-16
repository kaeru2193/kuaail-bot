import { Message } from "discord.js";
import { GoogleGenAI, createPartFromUri } from "@google/genai"
import fs from "fs"
import path from "path"

import dotenv from 'dotenv'

dotenv.config()
const GEMINI_KEY = process.env.GEMINI_KEY

const dayLimit = 10

const resourceParh = "./assets/resources"

const PROMPT = fs.readFileSync(path.join(resourceParh, "./xingxi-prompt.txt"), "utf-8")
const dictData = fs.readFileSync(path.join(__dirname, '../../assets/data/phun-dict.json'), "utf-8")
const dict: any[] = JSON.parse(dictData).data

const names: any[] = JSON.parse(fs.readFileSync(path.join(resourceParh, './code-names.json'), "utf-8")) //雰名一覧

const marksPhun = "、。！？「」〈〉（）―!?"
const marksCode = ",.!?“”‹›()–!?"

module.exports = {
    cmd: "xingxi",
    help: "`!k xingxi`\nbotと雰語で話そう！",
    execute: async (message: Message) => {
        await message.reply('穏永！')

        const genAI = new GoogleGenAI({ apiKey: GEMINI_KEY })
        const grammarFile = await genAI.files.upload({ file: path.join(resourceParh, "./grammar.pdf") })
        const dictFile = await genAI.files.upload({ file: path.join(resourceParh, "./dict.txt") })
        const exampleFile = await genAI.files.upload({ file: path.join(resourceParh, "./examples.txt") })

        return {
            history: [{
                role: 'model',
                parts: [{ text: "yyoe ntme!" }]
            }],
            ai: genAI,
            grammar: grammarFile,
            dict: dictFile,
            examples: exampleFile
        }
    },
    app: async (message: Message, data: any) => {
        if (!message.channel.isSendable()) { return } //こんな状況は想定してないので、アプリを終了しても問題ない

        const longMemory: any = JSON.parse(fs.readFileSync("./longMemory.json", "utf-8"))
        const usedLog: string[] = longMemory.xingxiUsed
        const logKey = message.author.id + "/" + new Date().toLocaleDateString() //idと日付の組み合わせ
        const usedTimes = usedLog.filter(l => l == logKey).length //今日の使用回数
        if (usedTimes >= dayLimit) {
            await message.reply("あなたは知りすぎた。また明日お試しください。")
            return data //そのまま返す
        }
        
        longMemory.xingxiUsed.push(logKey)
        fs.writeFileSync("./longMemory.json", JSON.stringify(longMemory))

        message.channel.sendTyping()

        const userName = names.find(n => n.id == message.author.id)
        const userContent = `${userName ?userName :"anonymous" + message.author.id.slice(-4)}: ${PhunToCode(message.content)}` //雰名がある場合はそれを、無ければidの下四桁を使って識別

        console.log(userContent)

        const res = await data.ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: PROMPT },
                        createPartFromUri(data.grammar.uri, data.grammar.mimeType),
                        createPartFromUri(data.dict.uri, data.dict.mimeType),
                        createPartFromUri(data.examples.uri, data.examples.mimeType)
                    ]
                },
                ...data.history.slice(-10),
                {
                    role: 'user',
                    parts: [{ text: userContent }]
                },
            ],
            config: {
                thinkingConfig: {
                    thinkingBudget: -1,
                },
            },
        })

        message.reply(CodeToPhun(res.text))

        data.history.push(
            {
                role: 'user',
                parts: [{ text: userContent }]
            },
            {
                role: 'model',
                parts: [{ text: res.text }]
            }
        )

        return data
	},
}

const PhunToCode = (text: string) => {
    return text.replace(/\s/g, "").split("").map(c => {
        if (c == "\n") { return "\n" } //改行はそのまま
        if (marksPhun.includes(c)) { return marksCode[marksPhun.indexOf(c)] } //記号を置換

        const base15 = "0123456789abcde"
        const letters = "akisutenomjlwry"

        const charaEntry = dict.find(e => e.word == c)
        if (!charaEntry) {return "■"} //存在しない文字は判読不能扱い

        const id = Number(charaEntry.num)
        const converted = ((id * 1234) % (15 ** 3)).toString(15)
        const digits = ("000" + converted).slice(-3).split("").map(l => base15.indexOf(l))
        const checkDigit = digits.reduce((a, b) => a + b) % 15

        return [...digits, checkDigit].map(d => letters[d]).join("")
    }).join(" ").replace(/■(\s■)*/g, "[判読不能]")
}

const CodeToPhun = (text: string) => {
    return text.replace(/([^a-z\s])/g, (_, match) => ` ${match} `).split(" ").filter(c => c).map(c => {
        if (c == "\n") { return "\n" } //改行はそのまま
        if (marksCode.includes(c)) { return marksPhun[marksCode.indexOf(c)] } //記号を置換

        const base15 = "0123456789abcde"
        const letters = "akisutenomjlwry"

        const digits = c.slice(0, 3).split("").map(l => letters.indexOf(l))
        if (digits.some(d => d < 0)) { return "■" }

        const encryptedID = parseInt(digits.map(d => base15[d]).join(""), 15)

        const id = (encryptedID * 1414) % (15 ** 3) //モジュラ逆数を使って余りから元の数を求める

        const charaEntry = dict.find(e => e.num == id)
        if (!charaEntry) {return "■"} //存在しない文字は判読不能扱い

        return charaEntry.word
    }).join("").replace(/■+/g, " [判読不能] ")
}