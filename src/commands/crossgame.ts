import { Message } from "discord.js";

module.exports = {
	cmd: "crossgame",
	execute: async (message: Message, args: string[]) => {
        const [size, turns] = args.map(a => Number(a))
        if (isNaN(size) || isNaN(turns)) {
            await message.reply('引数に数値を入力してください。')
            return
        } else if (!Number.isInteger(size) || !Number.isInteger(turns)) {
            await message.reply('引数に整数を入力してください。')
            return
        } else if (size < 3 || size > 20 || turns < 1 || turns > 100) {
            await message.reply('盤面サイズは3~20、ターン数は1~100で入力してください。')
            return
        }

        const board = makeBoard(size, turns)
        await message.reply(`ゲーム開始！\n${toBoardText(board)}`)

        const messages = await message.channel.messages.fetch({ limit: 1 })
		
        return {board: board, msg: messages.get([...messages.keys()][0])}
	},
    app: async (message: Message, data: any) => {
        if (message.content == "stop") { //stopと入力されたらコマンド終了
            await message.reply('アプリを中断しました。')
            return
        }

        const [row, col] = message.content.split(" ").map(a => Number(a))
        if (isNaN(row) || isNaN(col)) {
            await message.reply('引数に数値を入力してください。')
            return data
        } else if (!Number.isInteger(row) || !Number.isInteger(col)) {
            await message.reply('引数に整数を入力してください。')
            return data
        }

        const board = data.board

        const res = turnCross(board, row - 1, col - 1)
        if (res == "rangeError") {
            await message.reply('範囲内の数値を入力してください。')
            return data
        }

        if (isClear(board)) {
            await data.msg.edit(`クリア！おめでとう！\n${toBoardText(board)}`)
            return
        } else {
            await data.msg.edit(`盤面:\n${toBoardText(board)}`)
        }

        data.board = board
        return data
	},
}

const makeBoard = (size: number, turns: number) => {
    const blankBoard = [...Array(size)].map(() => (
        [...Array(size)].map(() => 1)
    ))
    console.log(blankBoard)
    for (let i = 0; i < turns; i++) {
        const row = Math.floor(Math.random() * size)
        const col = Math.floor(Math.random() * size)

        console.log(row, col)

        turnCross(blankBoard, row, col)
    }
    return blankBoard
}

const turnCross = (board: number[][], row: number, col: number) => {
    const boardSize = board.length
    if (row <= 0 || row > boardSize || col <= 0 || col > boardSize) {
        return "rangeError"
    }

    turnPiece(board, row, col)
    turnPiece(board, row - 1, col)
    turnPiece(board, row + 1, col)
    turnPiece(board, row, col - 1)
    turnPiece(board, row, col + 1)
}

const turnPiece = (board: number[][], row: number, col: number) => {
    const boardSize = board.length
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
        return
    }
    board[row][col] *= -1 
}

const toBoardText = (board: number[][]) => {
    return board.map(r => r.map(d => d == 1? ":black_circle:": ":red_circle:").join("")).join("\n")
}

const isClear = (board: number[][]) => {
    return board.every(r => (r.every(d => d == 1)))
}