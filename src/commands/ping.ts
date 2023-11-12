import type { CommandObject } from '../lib/discord/types'

const PingCommand: CommandObject = {
	params: {
		name: 'ping',
		description: 'ping',
	},
	handler: () => {
		return 'Pong!'
	},
}

export default PingCommand
