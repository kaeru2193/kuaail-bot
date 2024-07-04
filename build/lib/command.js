"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.command = void 0;
const fs_1 = __importDefault(require("fs"));
const commandData = JSON.parse(fs_1.default.readFileSync("build/index.json", 'utf8'));
const command = async (message) => {
    const [cmd, ...args] = message.content.split(" ").slice(1); //スペースで区切り、bot呼び出し部分は切り落とし
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
        internalError(message);
        return;
    }
};
exports.command = command;
const app = async (message, previousData) => {
    const cmdArr = commandData.filter((c) => c.cmd == previousData.status);
    if (cmdArr.length <= 0) { //指定されたコマンドが存在しない場合（ありえないはずなのでエラー）
        internalError(message);
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
        appInternalError(message);
        return;
    }
};
exports.app = app;
const notExistCommand = async (message) => {
    await message.reply('存在しないコマンドです。');
};
const internalError = async (message) => {
    await message.reply('内部エラーです。必要な場合は管理者にお問い合わせください。');
};
const appInternalError = async (message) => {
    await message.reply('内部エラーが発生したため、アプリを終了します。必要な場合は管理者にお問い合わせください。');
};
