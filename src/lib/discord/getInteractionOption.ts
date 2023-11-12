import {
	APIApplicationCommandInteractionDataOption,
	ApplicationCommandOptionType,
} from 'discord-api-types/v10'

function getInteractionOption(
	options: APIApplicationCommandInteractionDataOption[],
	name: string,
	type?: ApplicationCommandOptionType.String,
	optional?: boolean
): string
function getInteractionOption(
	options: APIApplicationCommandInteractionDataOption[],
	name: string,
	type: ApplicationCommandOptionType.Boolean,
	optional?: boolean
): boolean
function getInteractionOption(
	options: APIApplicationCommandInteractionDataOption[],
	name: string,
	type: ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number,
	optional?: boolean
): number
function getInteractionOption(
	options: APIApplicationCommandInteractionDataOption[],
	name: string,
	type:
		| ApplicationCommandOptionType.String
		| ApplicationCommandOptionType.Boolean
		| ApplicationCommandOptionType.Integer
		| ApplicationCommandOptionType.Number = ApplicationCommandOptionType.String,
	optional?: boolean
) {
	for (const option of options) {
		if (option.name === name) {
			if (option.type !== type) {
				throw `Option ${name} has invalid type: Expected ${type}, got ${option.type}`
			}
			return option.value
		}
	}
	if (optional) {
		return null
	}
	throw `Could not find option ${name}`
}

export default getInteractionOption
