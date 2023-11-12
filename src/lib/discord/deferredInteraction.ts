import { RESTPostAPIInteractionFollowupJSONBody, Routes } from 'discord-api-types/v10'
import { CommandObject, CommandResult, CommandSpecialResult } from './types'
import { Env } from '../../Env'
import fetchDiscordApi from './fetchDiscordApi'

async function sendFollowupMessage(
	msg: RESTPostAPIInteractionFollowupJSONBody,
	interactionToken: string,
	env: Env
) {
	await fetchDiscordApi(Routes.webhook(env.DISCORD_APP_ID, interactionToken), env, 'POST', msg)
}

type CommandResultNoDefer = Exclude<CommandResult, CommandSpecialResult>

export default function deferredInteraction(
	f: (
		...args: Parameters<CommandObject['handler']>
	) => CommandResultNoDefer | Promise<CommandResultNoDefer>
) {
	const wrapper: CommandObject['handler'] = (interaction, env, ctx) => {
		const result = f(interaction, env, ctx)
		if (result instanceof Promise) {
			const deferredPromise = result
				.then<RESTPostAPIInteractionFollowupJSONBody>(async msg => {
					if (typeof msg === 'string') {
						return {
							content: msg,
						}
					}
					return msg
				})
				.catch<RESTPostAPIInteractionFollowupJSONBody>(async err => {
					console.error(err)
					return {
						content: 'An error occured when running the command.',
					}
				})
				.then(async msg => {
					await sendFollowupMessage(msg, interaction.token, env)
				})
			ctx.waitUntil(deferredPromise)
			return CommandSpecialResult.Deferred
		}
		return result
	}
	return wrapper
}
