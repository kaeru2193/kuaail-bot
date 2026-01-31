import fs from "fs"

export const getDict = () => {
    const dict: any[] = JSON.parse(fs.readFileSync("./assets/data/phun-dict.json", "utf-8")).data
    return dict
}

export const convertPron = (text: string) => {
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

export const voices = ["", "+Henrique", "+Annie", "+f4"]