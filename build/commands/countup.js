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
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    cmd: "countup",
    execute: (message) => __awaiter(void 0, void 0, void 0, function* () {
        yield message.reply('カウントアップ開始！');
        return { count: 0 };
    }),
    app: (message, data) => __awaiter(void 0, void 0, void 0, function* () {
        if (message.content == "stop") { //stopと入力されたらコマンド終了
            message.reply('カウントアップ終了！');
            return;
        }
        data.count++;
        yield message.reply(`カウント: ${data.count}`);
        return data;
    }),
};
