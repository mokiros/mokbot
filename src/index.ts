import { error, json, Router, text } from 'itty-router'
import { Env } from './Env'
import getDiscordInteraction from './lib/discord/verifyDiscordRequest'
import processDiscordInteraction from './lib/discord/processDiscordInteraction'

const router = Router<Request, [Env, ExecutionContext]>()

router
	.get('/', async (req, env) => {
		return text(env.DISCORD_APP_ID)
	})
	.post('/', async (req, env, ctx) => {
		const interaction = await getDiscordInteraction(req, env)
		const response = await processDiscordInteraction(interaction, env, ctx)
		return response
	})
	.all('*', () => error(404))

export default {
	fetch: (req, env, ctx) => router.handle(req, env, ctx).then(json).catch(error),
} satisfies ExportedHandler<Env>
