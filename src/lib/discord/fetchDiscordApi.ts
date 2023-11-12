import { RouteBases } from 'discord-api-types/v10'
import { Env } from '../../Env'

export default async function fetchDiscordApi<T extends object>(
	url: string,
	env: Env,
	method: 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE',
	body?: object
) {
	const result = await fetch(`${RouteBases.api}${url}`, {
		method,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bot ${env.DISCORD_BOT_TOKEN}`,
		},
		body: body ? JSON.stringify(body) : undefined,
	})
	const json = await result.json()
	return json as T
}
