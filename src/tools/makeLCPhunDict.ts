import fs from "fs"
import path from "path"

const dictData = fs.readFileSync(path.join(__dirname, '../../assets/data/phun-dict.json'), "utf-8")
const exampleData = fs.readFileSync(path.join(__dirname, '../../assets/data/phun-example.json'), "utf-8")
const dict: any[] = JSON.parse(dictData).data
const example: any[] = JSON.parse(exampleData)

const charaToCode = (chara: string) => {
    const marksPhun = "、。！？「」〈〉（）―"
    const marksCode = ",.!?“”‹›()–"

    if (marksPhun.includes(chara)) { return marksCode[marksPhun.indexOf(chara)] } //記号を置換

    const base15 = "0123456789abcde"
    const letters = "akisutenomjlwry"

    const charaEntry = dict.find(e => e.word == chara)
    const id = Number(charaEntry.num)
    const converted = ((id * 1234) % (15 ** 3)).toString(15)
    const digits = ("000" + converted).slice(-3).split("").map(l => base15.indexOf(l))
    const checkDigit = digits.reduce((a, b) => a + b) % 15

    return [...digits, checkDigit].map(d => letters[d]).join("")
}

const wordToCode = (word: string) => {
    if (!dict.find(e => e.word == word)) {return word} //辞書になければ返却
    return word.split("").map((c: string) => charaToCode(c)).join(" ")
}

const result = dict.map(e => {
    const word = wordToCode(e.word)

    const mean = e.mean.map((p: any) => {
        return p.explanation.map((t: any) => {
            const trans: string = t.translate
            const meaning: string = t.meaning
            const transConv = trans.replace(
                /\[(.*?)\]/g,
                (_, match: string) => `[${match.split(" ").map(w => wordToCode(w)).join(" ")}]` //格組を変換
            )
            const meanConv = meaning
                ? meaning.replace(/\[(.*?)\]/g, (_, match) => `[${wordToCode(match)}]`)
                : ""
            return `《${p.type}》${transConv}${meanConv ? `｜${meanConv}` : ""}`
        }).join("")
    }).join("")

    const append = e.append.map((p: any) => {
        return p.explanation.map((t: any) =>
            `〈${p.type}〉${t.translate}`
        ).join("")
    }).join("")

    return `【${word}】 ${mean}${append}`
}).join("\n")

const exampleResult = example.map(e => {
    const words: string[] = e.words
    const codeSentence = words.join("").split("").filter(c => c != " ").map(c => charaToCode(c)).join(" ")
    return `${codeSentence} / ${e.ja}`
}).join("\n")

fs.writeFileSync(path.join(__dirname, '../../assets/resources/dict.txt'), result)
fs.writeFileSync(path.join(__dirname, '../../assets/resources/examples.txt'), exampleResult)