import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord-api-types/v10'
import type { CommandObject } from '../lib/discord/types'
import getInteractionOption from '../lib/discord/getInteractionOption'
import { getUniverseIdFromPlaceId } from '../lib/roblox'
import { StatusError } from 'itty-router'
import { GuildConfiguration } from '../lib/config'
import { getRobloxUserFromDiscordUser } from '../lib/bloxlink'
import getRobloxUser from '../lib/roblox/getRobloxUser'
import deferredInteraction from '../lib/discord/deferredInteraction'
import { getBadgesNew } from '../lib/badges'

const GetBadgesCommand: CommandObject = {
	params: {
		name: 'getbadges',
		description: 'Check awarded badges for a specific place',
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: 'placeid',
				description: 'ID of the place to get badges from',
				required: true,
				type: ApplicationCommandOptionType.Integer,
				min_value: 1,
				max_value: 2 ** 40,
			},
			{
				name: 'userid',
				description: 'Roblox player ID',
				required: false,
				type: ApplicationCommandOptionType.Integer,
				min_value: 1,
				max_value: 2 ** 40,
			},
		],
	},
	ephemeral: false,
	handler: deferredInteraction(async (interaction, env) => {
		const options = interaction.data.options
		if (!options) {
			throw new StatusError(400, { error: 'Invalid options' })
		}
		const placeid = getInteractionOption(options, 'placeid', ApplicationCommandOptionType.Integer)
		let userid = getInteractionOption(options, 'userid', ApplicationCommandOptionType.Integer, true)
		if (!userid) {
			const guildid = interaction.guild_id
			const discordUserid = guildid ? interaction.member?.user.id : interaction.user?.id
			if (!discordUserid) {
				return 'Unable to retrieve your Discord user id'
			}
			const cachedUserid = await env.RobloxPlayerCache.get(discordUserid)
			if (cachedUserid) {
				userid = Number(cachedUserid)
				if (!isFinite(userid)) {
					await env.RobloxPlayerCache.delete(discordUserid)
					throw 'Cached userid is invalid'
				}
			} else {
				if (!guildid) {
					return 'Unable to retrieve your Roblox user id; manually paste your Robolx user id in the "userid" param'
				}
				const config = await env.GuildConfigs.get<GuildConfiguration>(guildid, 'json')
				const bloxlinkApiKey = config?.bloxlink_api_key
				if (!bloxlinkApiKey) {
					return (
						'No userid specified, attempting to fetch player from Bloxlink...' +
						'\nBloxlink API key not found in guild configuration.' +
						"\nIf you're a server administrator, run `/config set bloxlink_api_key <key>`." +
						"\nIf you're a regular member, ask your local server administrator to do it."
					)
				}
				userid = await getRobloxUserFromDiscordUser(bloxlinkApiKey, guildid, discordUserid)
				await env.RobloxPlayerCache.put(discordUserid, String(userid))
			}
		}
		const playerInfo = await getRobloxUser(userid)
		const universeId = await getUniverseIdFromPlaceId(placeid)
		if (!universeId) {
			return 'Unable to retrieve universe ID from place ID'
		}
		return await getBadgesNew(env, universeId, playerInfo)
	}),
}

export default GetBadgesCommand
