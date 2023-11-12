import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10'
import { ComponentObject } from '../lib/discord/types'
import { getBadgesButton } from '../lib/badges'

const GetBadgesComponent: ComponentObject = {
	name: 'getbadges',
	handler: async (args, interaction, env) => {
		const direction = args[0]
		const caller = args[1]
		const id = args[2]
		if ((direction !== 'next' && direction !== 'prev') || !caller || !id) {
			return {
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: 'Internal error: Invalid button arguments.',
					flags: MessageFlags.Ephemeral,
				},
			}
		}
		const userid = interaction.user?.id || interaction.member?.user.id
		if (userid !== caller) {
			return {
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: 'You cannot interact with this message.',
					flags: MessageFlags.Ephemeral,
				},
			}
		}
		const body = await getBadgesButton(env, userid, direction, id)
		return {
			type: InteractionResponseType.UpdateMessage,
			data: body,
		}
	},
}

export default GetBadgesComponent
