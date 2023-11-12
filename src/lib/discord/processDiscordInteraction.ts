import {
	APIChatInputApplicationCommandInteraction,
	APIInteraction,
	APIInteractionResponse,
	APIInteractionResponseChannelMessageWithSource,
	APIInteractionResponseDeferredChannelMessageWithSource,
	APIMessageComponentInteraction,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
	MessageFlags,
} from 'discord-api-types/v10'
import { StatusError } from 'itty-router'
import CommandMap from '../../commands'
import type { Env } from '../../Env'
import { CommandSpecialResult } from './types'
import ComponentMap from '../../components'

async function processApplicationCommandInteraction(
	interaction: APIChatInputApplicationCommandInteraction,
	env: Env,
	ctx: ExecutionContext
) {
	const command = CommandMap[interaction.data.name]
	if (!command) {
		throw new StatusError(400, { error: 'Command not found' })
	}
	const data = await command.handler(interaction, env, ctx)
	const ephemeral = command.ephemeral ?? true
	let response:
		| APIInteractionResponseChannelMessageWithSource
		| APIInteractionResponseDeferredChannelMessageWithSource
	if (data === CommandSpecialResult.Deferred) {
		response = {
			type: InteractionResponseType.DeferredChannelMessageWithSource,
			data: ephemeral
				? {
						flags: MessageFlags.Ephemeral,
				  }
				: undefined,
		}
	} else if (typeof data === 'string') {
		response = {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: data,
				flags: MessageFlags.Ephemeral,
			},
		}
	} else {
		response = {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: data,
		}
	}
	return response
}

async function processMessageComponent(
	interaction: APIMessageComponentInteraction,
	env: Env,
	ctx: ExecutionContext
) {
	const id = interaction.data.custom_id
	const args = id.split('/')
	const name = args.shift()
	const component = name && ComponentMap[name]
	if (!component) {
		throw new StatusError(400, { error: 'Invalid component id' })
	}
	const data = await component.handler(args, interaction, env, ctx)
	return data
}

export default async function processDiscordInteraction(
	interaction: APIInteraction,
	env: Env,
	ctx: ExecutionContext
): Promise<APIInteractionResponse> {
	switch (interaction.type) {
		case InteractionType.Ping: {
			return {
				type: InteractionResponseType.Pong,
			}
		}
		case InteractionType.ApplicationCommand: {
			switch (interaction.data.type) {
				case ApplicationCommandType.ChatInput: {
					return await processApplicationCommandInteraction(
						interaction as APIChatInputApplicationCommandInteraction,
						env,
						ctx
					)
				}
				default: {
					throw new StatusError(400, { error: 'Not implemented' })
				}
			}
		}
		case InteractionType.MessageComponent: {
			return await processMessageComponent(interaction, env, ctx)
		}
		default: {
			throw new StatusError(400, { error: 'Not implemented' })
		}
	}
}
