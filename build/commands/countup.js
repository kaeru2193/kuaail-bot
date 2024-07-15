"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    cmd: "countup",
    help: "`!k countup`\nbotによる数え上げを開始します。メッセージを送信する度にカウントが増えます。",
    execute: async (message) => {
        await message.reply('カウントアップ開始！');
        return { count: 0 };
    },
    app: async (message, data) => {
        if (message.content == "stop") { //stopと入力されたらコマンド終了
            message.reply('カウントアップ終了！');
            return;
        }
        data.count++;
        await message.reply(`カウント: ${data.count}`);
        return data;
    },
};
