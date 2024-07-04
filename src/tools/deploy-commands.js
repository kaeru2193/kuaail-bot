const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('node:fs');
const path = require('path');

dotenv.config()

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {throw Error("envが正しく指定されていません。")}

const commandsPath = path.join(__dirname, '../build/commands')

const commands = []
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(path.join(commandsPath, `./${file}`))
	commands.push(command.data.toJSON())
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
	try {
		console.log(`${commands.length} 個のアプリケーションコマンドを登録します。`)

		const data = await rest.put(
			Routes.applicationCommands(CLIENT_ID),
			{ body: commands },
		);

		console.log(`${data.length} 個のアプリケーションコマンドを登録しました。`)
	} catch (error) {
		console.error(error)
	}
})();
