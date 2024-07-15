import { Message } from "discord.js";
import { getHelp } from "../lib/command";

const helpHead = 
`# 之機の使い方
***之機 (kua1ail2)***は、かえる (kaeru2193) によって開発されているbotです。
## コマンドとアプリ
botのコマンドを実行するには、\`!k <コマンド名> (<引数>...)\`の形でメッセージを送信する必要があります。
また、コマンドの中には一度実行しただけで終了するものと、手動で終了させるまで応答し続ける「アプリ」があります。アプリの起動中には上述の形に沿う必要はなく、基本的にチャンネル内のメッセージ全てに応答します。
アプリを終了する場合は\`stop\`を入力します。また、先頭に\`;\`を付けることでbotに無視されます。
## コマンド一覧`

module.exports = {
	cmd: "help",
    help: "`!k help (<コマンド>)`\nこのコマンドです。botの機能について説明します。特定のコマンドについてのみの説明も可能です。",
	execute: async (message: Message, args: string[]) => {
        const helpData: any[] = await getHelp()
        if (!args[0]) { //引数なし（すべてを表示）
            const helpText: string = helpData.reduce((prev, now) => {
                const entry = `\n### ${now.cmd}\n${now.help}`
                return prev + entry
            }, "")
    
            await message.reply(helpHead + helpText)
        } else { //指定
            const searchCmd = args[0]
            const result = helpData.filter(c => c.cmd == searchCmd)
            if (result.length <= 0) { //存在しない
                await message.reply("指定されたコマンドが存在していないため、ヘルプを表示することが出来ません。")
            } else {
                const desc = `\n## ${result[0].cmd}\n${result[0].help}`
                await message.reply(desc)
            }
        }
	},
}