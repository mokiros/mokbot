import { ApplicationCommandOptionType } from 'discord-api-types/v10'
import { CommandObject } from '../lib/discord/types'
import { StatusError } from 'itty-router'
import getInteractionOption from '../lib/discord/getInteractionOption'
import { GuildConfiguration } from '../lib/config'

const GuildConfigurationNames: string[] = ['bloxlink_api_key']
const SecretConfigurationNames: string[] = ['bloxlink_api_key']
const KeyOption = {
	name: 'key',
	description: 'Configuration key',
	type: ApplicationCommandOptionType.String,
	required: true,
	choices: GuildConfigurationNames.map(key => ({
		name: key,
		value: key,
	})),
} as const

function getConfiguration(config: GuildConfiguration, key: string) {
	if (!GuildConfigurationNames.includes(key)) {
		throw `Invalid configuration key ${key}`
	}
	const value = config[key]
	let displayValue =
		typeof value === 'string'
			? SecretConfigurationNames.includes(key)
				? '<secret>'
				: value
			: 'null'
	displayValue = displayValue.replace('\\', '\\\\').replace('`', '`')
	return {
		value: value ?? null,
		displayValue: displayValue,
	}
}

const ConfigCommand: CommandObject = {
	params: {
		name: 'config',
		description: 'Get or set configuration values for the guild',
		default_member_permissions: '0',
		dm_permission: false,
		options: [
			{
				name: 'get',
				description: 'Get a configuration value for the guild',
				type: ApplicationCommandOptionType.Subcommand,
				options: [KeyOption],
			},
			{
				name: 'set',
				description: 'Set a configuration value for the guild',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					KeyOption,
					{
						name: 'value',
						description: 'Configuration value',
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
			{
				name: 'delete',
				description: 'Deletel a configuration value for the guild',
				type: ApplicationCommandOptionType.Subcommand,
				options: [KeyOption],
			},
		],
	},
	handler: async (interaction, env) => {
		const data = interaction.data
		const subcommand = data.options?.[0]
		if (
			!subcommand ||
			subcommand.type !== ApplicationCommandOptionType.Subcommand ||
			!subcommand.options
		) {
			throw new StatusError(400, { error: 'Invalid subcommand' })
		}
		const guildid = interaction.guild_id
		if (!guildid) {
			throw new StatusError(400, { error: 'Invalid guild' })
		}
		const config = (await env.GuildConfigs.get<GuildConfiguration>(guildid, 'json')) ?? {}
		switch (subcommand.name) {
			case 'get': {
				const key = getInteractionOption(subcommand.options, 'key')
				const value = getConfiguration(config, key)
				if (value.value === null) {
					return `Configuration value for \`${key}\` does not exist.`
				}
				return `Configuration value for \`${key}\`: \`${value.displayValue}\``
			}
			case 'set': {
				const key = getInteractionOption(subcommand.options, 'key')
				const value = getInteractionOption(subcommand.options, 'value')
				const oldValue = getConfiguration(config, key)
				config[key] = value
				await env.GuildConfigs.put(guildid, JSON.stringify(config))
				const newValue = getConfiguration(config, key)
				if (oldValue.value === null) {
					return `Configuration value \`${key}\` set to: \`${newValue.displayValue}\``
				}
				return `Changed configuration value \`${key}\` from \`${oldValue.displayValue}\` to \`${newValue.displayValue}\``
			}
			case 'delete': {
				const key = getInteractionOption(subcommand.options, 'key')
				const value = getConfiguration(config, key)
				if (value.value === null) {
					return `Configuration value for \`${key}\` does not exist.`
				}
				delete config[key]
				await env.GuildConfigs.put(guildid, JSON.stringify(config))
				return `Successfully deleted configuration value \`${key}\``
			}
		}
		throw new StatusError(400, { error: 'Invalid command' })
	},
}

export default ConfigCommand
