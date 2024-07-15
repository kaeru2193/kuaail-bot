"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const commandsPath = path_1.default.join(__dirname, '../commands');
const commands = [];
const commandFiles = fs_1.default.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
    const commandFilePath = path_1.default.join(commandsPath, `./${file}`);
    const command = require(commandFilePath);
    commands.push({
        cmd: command.cmd,
        help: command.help,
        path: commandFilePath
    });
}
fs_1.default.writeFileSync(path_1.default.join(__dirname, '../index.json'), JSON.stringify(commands, null, 2));
