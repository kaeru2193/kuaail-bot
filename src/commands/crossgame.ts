import { Message } from "discord.js";

const levels: any = { //難易度
    "easy": [6, 5],
    "normal": [8, 10],
    "hard": [8, 20],
    "taing": [8, 30]
}

module.exports = {
	cmd: "crossgame",
    help: "`!k crossgame <難易度>`\nボードゲーム「交返楽」を開始します。難易度はeasy, normal, hard, taingのいずれかから選択可能で、盤の全面を黒に揃えることでクリアとなります。\n`<行数> <列数>`の形式でひっくり返すコマを指定できます。また、行数と列数はともに1から、左上を起点に数えられます。複数手をまとめて`<行数1> <列数1> <行数2> <列数2>...`のように指定することも可能です。",
	execute: async (message: Message, args: string[]) => {
        const level = args[0]
        if (!Object.hasOwn(levels, level)) {
            await message.reply('難易度を正しく入力してください。')
            return
        }
        const param = levels[level]

        const board = makeBoard(param[0], param[1])
        await message.reply(`ゲーム開始！\n${toBoardText(board)}`)

        const messages = await message.channel.messages.fetch({ limit: 1 })
		
        return {board: board, msg: messages.get([...messages.keys()][0]), turns: 0}
	},
    app: async (message: Message, data: any) => {
        const moves = message.content.split(" ").map(a => Number(a))
        if (moves.some(m => isNaN(m))) {
            await message.reply('引数に数値を入力してください。')
            return data
        } else if (moves.some(m => !Number.isInteger(m))) {
            await message.reply('引数に整数を入力してください。')
            return data
        }

        const board = data.board
        let turns = data.turns

        for (let i = 1; i <= moves.length / 2; i++) {
            const res = turnCross(board, moves[i * 2 - 2] - 1, moves[i * 2 - 1] - 1)
            if (res == "rangeError") {
                await message.reply('範囲内の数値を入力してください。')
                return data
            }
            turns++
        }

        data.board = board
        data.turns = turns

        if (isClear(board)) {
            await data.msg.edit(`:tada: クリア！おめでとう！ :tada:\nクリア手数: ${turns}\n${toBoardText(board)}`)
            return
        } else {
            await data.msg.edit(`盤面:\n${toBoardText(board)}`)
        }
        
        return data
	},
}

const makeBoard = (size: number, turns: number) => {
    const blankBoard = [...Array(size)].map(() => (
        [...Array(size)].map(() => 1)
    ))

    const toCheck = [...Array(size ** 2)].map((_, idx) => idx) //1度返した場所の記録用として、連番の配列を作成

    for (let i = 0; i < turns; i++) {
        const remain = toCheck.filter(n => n >= 0) //まだ使われていない番号
        const num = remain[Math.floor(Math.random() * remain.length)] //残りからランダムに選択

        const row = Math.floor(num / size)
        const col = num % size

        toCheck[num] = -1 //使われた番号は-1で置き換え

        turnCross(blankBoard, row, col)
    }
    return blankBoard
}

const turnCross = (board: number[][], row: number, col: number) => {
    const boardSize = board.length
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
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