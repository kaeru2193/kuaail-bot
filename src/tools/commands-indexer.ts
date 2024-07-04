import fs from "fs"
import path from "path"

const commandsPath = path.join(__dirname, '../commands')

const commands: any[] = []
const commandFiles = fs.readdirSync(commandsPath).filter((file: any) => file.endsWith('.js'))

for (const file of commandFiles) {
    const commandFilePath = path.join(commandsPath, `./${file}`)
	const command = require(commandFilePath)
	commands.push({
        cmd: command.cmd,
        path: commandFilePath
    })
}

fs.writeFileSync(path.join(__dirname, '../index.json'), JSON.stringify(commands, null, 2))