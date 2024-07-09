"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.command = void 0;
const fs_1 = __importDefault(require("fs"));
const commandData = JSON.parse(fs_1.default.readFileSync("build/index.json", 'utf8'));
const command = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const [cmd, ...args] = message.content.split(" ").slice(1); //スペースで区切り、bot呼び出し部分は切り落とし
    const cmdArr = commandData.filter((c) => c.cmd == cmd);
    if (cmdArr.length <= 0) { //指定されたコマンドが存在しない場合
        notExistCommand(message);
        return;
    }
    const cmdModule = require(cmdArr[0].path);
    try {
        const data = yield cmdModule.execute(message, args); //実行と同時に返り値を取得
        if (data) {
            return [cmd, data]; //コマンド名(ステータス用)とデータを上申
        }
    }
    catch (error) {
        internalError(message);
        return;
    }
});
exports.command = command;
const app = (message, previousData) => __awaiter(void 0, void 0, void 0, function* () {
    const cmdArr = commandData.filter((c) => c.cmd == previousData.status);
    if (cmdArr.length <= 0) { //指定されたコマンドが存在しない場合（ありえないはずなのでエラー）
        internalError(message);
        return;
    }
    const cmdModule = require(cmdArr[0].path);
    try {
        const data = yield cmdModule.app(message, previousData.data); //実行と同時に返り値を取得
        if (data) {
            return [previousData.status, data]; //コマンド名とデータを上申
        }
    }
    catch (error) {
        appInternalError(message);
        return;
    }
});
exports.app = app;
const notExistCommand = (message) => __awaiter(void 0, void 0, void 0, function* () {
    yield message.reply('存在しないコマンドです。');
});
const internalError = (message) => __awaiter(void 0, void 0, void 0, function* () {
    yield message.reply('内部エラーです。必要な場合は管理者にお問い合わせください。');
});
const appInternalError = (message) => __awaiter(void 0, void 0, void 0, function* () {
    yield message.reply('内部エラーが発生したため、アプリを終了します。必要な場合は管理者にお問い合わせください。');
});
