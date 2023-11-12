import { InteractionResponseType } from 'discord-api-types/v10'
import { ComponentObject } from '../lib/discord/types'
import { getBadgesButton } from '../lib/badges'
import { StatusError } from 'itty-router'

const GetBadgesComponent: ComponentObject = {
	name: 'getbadges',
	handler: async (args, interaction, env) => {
		const direction = args[0]
		const id = args[1]
		if ((direction !== 'next' && direction !== 'prev') || !id) {
			throw new StatusError(400, { error: 'Invalid button arguments' })
		}
		const body = await getBadgesButton(env, direction, id)
		return {
			type: InteractionResponseType.UpdateMessage,
			data: body,
		}
	},
}

export default GetBadgesComponent
