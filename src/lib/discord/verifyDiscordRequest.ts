import { verifyKey } from 'discord-interactions'
import { Env } from '../../Env'
import { APIInteraction } from 'discord-api-types/v10'
import { StatusError } from 'itty-router'

export default async function getDiscordInteraction(
	req: Request,
	env: Env
): Promise<APIInteraction> {
	const signature = req.headers.get('X-Signature-Ed25519')
	const timestamp = req.headers.get('X-Signature-Timestamp')
	if (!signature || !timestamp) {
		throw new StatusError(400, { error: 'Missing signature' })
	}
	const body = await req.text()
	const valid = verifyKey(body, signature, timestamp, env.DISCORD_APP_PUBLIC_KEY)
	if (!valid) {
		throw new StatusError(401, { error: 'Invalid signature' })
	}
	const interaction = JSON.parse(body)
	return interaction
}
