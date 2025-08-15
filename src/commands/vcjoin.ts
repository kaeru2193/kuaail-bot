import { Message } from "discord.js";
import { joinVoiceChannel, VoiceConnectionStatus, entersState, createAudioResource, StreamType, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior } from "@discordjs/voice";

module.exports = {
    cmd: "vcjoin",
    help: "`!k vcjoin`\nbotがVCに入ってサンプル音楽を再生します。",
    execute: async (message: Message) => {
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
        const resource = createAudioResource("./assets/sounds/sample.mp3", { //音源を準備
            inputType: StreamType.Arbitrary,
        })
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        })

        player.play(resource) //音源を再生開始
        await Promise.all([
            entersState(player, AudioPlayerStatus.AutoPaused, 1000 * 10), //音源の準備待ち
            entersState(connection, VoiceConnectionStatus.Ready, 1000 * 10) //VCの接続待ち
        ])

        await message.reply('再生開始！')

        connection.subscribe(player) //VCに再生しているものを流す
        await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1) //再生終了待ち

        await message.reply('音源の再生が終了しました。')
        connection.destroy() //VC接続を切る
    },
}