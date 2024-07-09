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
    cmd: "crossgame",
    execute: (message, args) => __awaiter(void 0, void 0, void 0, function* () {
        const [size, turns] = args.map(a => Number(a));
        if (isNaN(size) || isNaN(turns)) {
            yield message.reply('引数に数値を入力してください。');
            return;
        }
        else if (!Number.isInteger(size) || !Number.isInteger(turns)) {
            yield message.reply('引数に整数を入力してください。');
            return;
        }
        else if (size < 3 || size > 20 || turns < 1 || turns > 100) {
            yield message.reply('盤面サイズは3~20、ターン数は1~100で入力してください。');
            return;
        }
        const board = makeBoard(size, turns);
        yield message.reply(`ゲーム開始！\n${toBoardText(board)}`);
        const messages = yield message.channel.messages.fetch({ limit: 1 });
        return { board: board, msg: messages.get([...messages.keys()][0]) };
    }),
    app: (message, data) => __awaiter(void 0, void 0, void 0, function* () {
        if (message.content == "stop") { //stopと入力されたらコマンド終了
            yield message.reply('アプリを中断しました。');
            return;
        }
        const [row, col] = message.content.split(" ").map(a => Number(a));
        if (isNaN(row) || isNaN(col)) {
            yield message.reply('引数に数値を入力してください。');
            return data;
        }
        else if (!Number.isInteger(row) || !Number.isInteger(col)) {
            yield message.reply('引数に整数を入力してください。');
            return data;
        }
        const board = data.board;
        const res = turnCross(board, row - 1, col - 1);
        if (res == "rangeError") {
            yield message.reply('範囲内の数値を入力してください。');
            return data;
        }
        if (isClear(board)) {
            yield data.msg.edit(`クリア！おめでとう！\n${toBoardText(board)}`);
            return;
        }
        else {
            yield data.msg.edit(`盤面:\n${toBoardText(board)}`);
        }
        data.board = board;
        return data;
    }),
};
const makeBoard = (size, turns) => {
    const blankBoard = [...Array(size)].map(() => ([...Array(size)].map(() => 1)));
    console.log(blankBoard);
    for (let i = 0; i < turns; i++) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        console.log(row, col);
        turnCross(blankBoard, row, col);
    }
    return blankBoard;
};
const turnCross = (board, row, col) => {
    const boardSize = board.length;
    if (row <= 0 || row > boardSize || col <= 0 || col > boardSize) {
        return "rangeError";
    }
    turnPiece(board, row, col);
    turnPiece(board, row - 1, col);
    turnPiece(board, row + 1, col);
    turnPiece(board, row, col - 1);
    turnPiece(board, row, col + 1);
};
const turnPiece = (board, row, col) => {
    const boardSize = board.length;
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
        return;
    }
    board[row][col] *= -1;
};
const toBoardText = (board) => {
    return board.map(r => r.map(d => d == 1 ? ":black_circle:" : ":red_circle:").join("")).join("\n");
};
const isClear = (board) => {
    return board.every(r => (r.every(d => d == 1)));
};
