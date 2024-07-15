"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHelp = exports.app = exports.command = void 0;
const fs_1 = __importDefault(require("fs"));
const commandData = JSON.parse(fs_1.default.readFileSync("build/index.json", 'utf8'));
const command = async (message) => {
    console.log(message.content.replace(/\s+/g, " "));
    const [cmd, ...args] = message.content.replace(/\s+/g, " ").split(" ").slice(1); //複数スペースを削除してからスペースで区切り、bot呼び出し部分は切り落とし
    if (!cmd) { //呼びかけ単体
        await message.reply('こんにちは！***之機 (kua1ail2)***だよ！\n`!k help`でbotの説明を表示できます。');
        return;
    }
    const cmdArr = commandData.filter((c) => c.cmd == cmd);
    if (cmdArr.length <= 0) { //指定されたコマンドが存在しない場合
        notExistCommand(message);
        return;
    }
    const cmdModule = require(cmdArr[0].path);
    try {
        const data = await cmdModule.execute(message, args); //実行と同時に返り値を取得
        if (data) {
            return [cmd, data]; //コマンド名(ステータス用)とデータを上申
        }
    }
    catch (error) {
        internalError(message, error);
        return;
    }
};
exports.command = command;
const app = async (message, previousData) => {
    const cmdArr = commandData.filter((c) => c.cmd == previousData.status);
    if (cmdArr.length <= 0) { //指定されたコマンドが存在しない場合（ありえないはずなのでエラー）
        internalError(message, "指定されたコマンドが存在しません");
        return;
    }
    const cmdModule = require(cmdArr[0].path);
    try {
        const data = await cmdModule.app(message, previousData.data); //実行と同時に返り値を取得
        if (data) {
            return [previousData.status, data]; //コマンド名とデータを上申
        }
    }
    catch (error) {
        appInternalError(message, error);
        return;
    }
};
exports.app = app;
const getHelp = async () => {
    const helps = commandData.map(c => { return { cmd: c.cmd, help: c.help }; });
    return helps;
};
exports.getHelp = getHelp;
const notExistCommand = async (message) => {
    await message.reply('存在しないコマンドです。');
};
const internalError = async (message, e) => {
    await message.reply('内部エラーです。必要な場合は管理者にお問い合わせください。');
    console.log(e);
};
const appInternalError = async (message, e) => {
    await message.reply('内部エラーが発生したため、アプリを終了します。必要な場合は管理者にお問い合わせください。');
    console.log(e);
};
