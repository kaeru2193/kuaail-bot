import { Message } from "discord.js";
import { joinVoiceChannel, VoiceConnectionStatus, entersState, createAudioResource, StreamType, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, VoiceConnection, AudioPlayer } from "@discordjs/voice";
import fs from "fs"
import { execSync } from "child_process";
import { convertPron, voices } from "../lib/funcs";
import { longMemory } from "../lib/types";

interface State {
    player: AudioPlayer
    queue: {
        text: string
        author: string
    }[]
    isPlaying: boolean //ループが動いているか
}

module.exports = {
    cmd: "tts",
    help: "`!k tts`\nbotがVCのテキストを読み上げます。",
    execute: async (message: Message): Promise<State|undefined> => {
        if (!message.guild || !message.guildId) {
            await message.reply('ここはサーバーではありません。')
            return
        }
        if (!message.channel.isVoiceBased()) {
            await message.reply('ここはVCではありません。')
            return
        }

        const connection = joinVoiceChannel({ //VCへの接続を確立
            guildId: message.guildId,
            channelId: message.channelId,
            adapterCreator: message.guild?.voiceAdapterCreator,
            selfMute: false
        })
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Stop,
            },
        })

        await entersState(connection, VoiceConnectionStatus.Ready, 1000 * 10) //VCの接続待ち

        connection.subscribe(player) //再生しているものをVCに流す

        message.reply("VCに接続しました。")

        return {
            player: player,
            queue: [],
            isPlaying: false
        }
    },
    app: async (message: Message, data: State): Promise<State|undefined> => {
        if (message.content.startsWith("!getvoice")) {
            getVoice(message)
            return data
        }
        if (message.content.startsWith("!setvoice")) {
            setVoice(message)
            return data
        }
        
        const player = data.player

        data.queue.push({text: message.content, author: message.author.id}) //キューに投入

        if (data.isPlaying) { return data } //既にループが動いていれば、追加するだけ

        data.isPlaying = true

        while (data.queue.length > 0) {
            const message = data.queue.shift()
            if (!message) { continue }

            const fileName = `tts_${Date.now() % 10000}.wav` //一意なファイル名で管理
            const filePath = `./tmp/${fileName}`

            try {
                const phoneme = convertPron(message.text.slice(0, 150))

                const longMemory: longMemory = JSON.parse(fs.readFileSync("./longMemory.json", "utf-8"))

                let voiceType = Math.floor(Math.random() * 4)
                let speed = 120 + Math.floor(Math.random() * 110)
                let pitch = 20 + Math.floor(Math.random() * 60)

                const voiceSetting = longMemory.ttsVoice.find(e => e.userID == message.author)
                if (voiceSetting) {
                    voiceType = voiceSetting.voiceType
                    speed = voiceSetting.speed
                    pitch = voiceSetting.pitch
                } else {
                    longMemory.ttsVoice.push({
                        userID: message.author,
                        voiceType,
                        speed,
                        pitch
                    })

                    fs.writeFileSync("./longMemory.json", JSON.stringify(longMemory))
                }

                const stdout = execSync(`espeak-ng -v phn${voices[voiceType]} "${phoneme}" -s ${speed} -p ${pitch} -w ${filePath}`) //音声を生成

                const resource = createAudioResource(filePath, { //音源を準備
                    inputType: StreamType.Arbitrary,
                })

                player.play(resource) //音源を再生開始

                await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1) //音源の再生終了待ち
            } catch (e) {
                throw Error("tts:処理でエラーが発生しました: " + e)
            } finally {
                await new Promise( (resolve) => { //削除まで1秒待つ（ファイルロック回避）
                    setTimeout(resolve, 1000)
                })

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath) //ファイルを削除
                }
            }
        }

        data.isPlaying = false

        return data
    }
}

const getVoice = (message: Message) => {
    const longMemory: longMemory = JSON.parse(fs.readFileSync("./longMemory.json", "utf-8"))

    const voiceSetting = longMemory.ttsVoice.find(e => e.userID == message.author.id)

    if (!voiceSetting) {
        message.reply("ボイス設定がありません。ボイス設定は最初の読み上げ時に自動で設定されます。")
        return
    }

    message.reply(`**${message.author.username}のボイス設定**
声の種別: **${voiceSetting.voiceType + 1}** (1~4)
声の高さ: **${voiceSetting.pitch}** (20~80)
話す速さ: **${voiceSetting.speed}** (120~230)`)
}

const setVoice = (message: Message) => {
    const params = message.content.split(" ").slice(1, 4).map(p => Math.floor(Number(p)))
    if (params.some(p => isNaN(p)) || params.length < 3) {
        message.reply("3つの引数を数値で入力してください。")
        return
    }
    if (params[0] < 1 || 4 < params[0]) {
        message.reply("声の種別は1～4のいずれかを指定してください。")
        return
    }

    const voiceType = params[0] - 1
    const pitch = params[1] >= 20
        ? params[1] <= 80
            ? params[1]
            : 80
        : 20
    const speed = params[2] >= 120
        ? params[2] <= 230
            ? params[2]
            : 230
        : 120

    const longMemory: longMemory = JSON.parse(fs.readFileSync("./longMemory.json", "utf-8"))

    const voiceIdx = longMemory.ttsVoice.findIndex(e => e.userID == message.author.id)

    if (voiceIdx >= 0) {
        longMemory.ttsVoice[voiceIdx].voiceType = voiceType
        longMemory.ttsVoice[voiceIdx].speed = speed
        longMemory.ttsVoice[voiceIdx].pitch = pitch
    } else {
        longMemory.ttsVoice.push({
            userID: message.author.id,
            voiceType,
            speed,
            pitch
        })
    }

    fs.writeFileSync("./longMemory.json", JSON.stringify(longMemory))

    message.reply(`**${message.author.username}のボイス設定を更新しました**
声の種別: ${voiceType + 1}
声の高さ: ${pitch}
話す速さ: ${speed}`)
}