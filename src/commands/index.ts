import { CommandObject } from '../lib/discord/types'
import PingCommand from './ping'
import ConfigCommand from './config'
import GetBadgesCommand from './getBadges'

const Commands = [PingCommand, ConfigCommand, GetBadgesCommand]
const CommandMap: Record<string, CommandObject> = {}

for (const command of Commands) {
	CommandMap[command.params.name] = command
}

export default CommandMap
