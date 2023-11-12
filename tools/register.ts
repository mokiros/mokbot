import {
	RESTPutAPIApplicationCommandsJSONBody,
	RouteBases,
	Routes,
} from 'discord-api-types/rest/v10'
import { config } from 'dotenv'
import CommandMap from '../src/commands'
import { Snowflake } from 'discord-api-types/globals'

config({ path: '.dev.vars' })

function getEnvVariable(name: string): string {
	const variable = process.env[name]
	if (!variable) {
		throw new Error(`Missing environment variable: ${name}`)
	}
	return variable
}

async function registerCommands(cmds: RESTPutAPIApplicationCommandsJSONBody, guild?: Snowflake) {
	const applicationId = getEnvVariable('DISCORD_APP_ID')
	const token = getEnvVariable('DISCORD_BOT_TOKEN')
	let url = RouteBases.api
	if (guild) {
		url += Routes.applicationGuildCommands(applicationId, guild)
	} else {
		url += Routes.applicationCommands(applicationId)
	}
	const response = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bot ${token}`,
		},
		method: 'PUT',
		body: JSON.stringify(cmds),
	})
	return response
}

const arg_dev = process.argv.includes('--dev')
const arg_clear_commands = process.argv.includes('--clear-commands')

const cmds = arg_clear_commands ? [] : Object.values(CommandMap).map(v => v.params)
const response = await registerCommands(
	cmds,
	arg_dev ? getEnvVariable('DISCORD_DEV_SERVER_ID') : undefined
)

if (response.ok) {
	console.log('Registered all commands')
	const data = await response.json()
	console.log(JSON.stringify(data, null, 2))
} else {
	console.error('Error registering commands')
	let errorText = `Error registering commands \n ${response.url}: ${response.status} ${response.statusText}`
	try {
		const error = await response.text()
		if (error) {
			errorText = `${errorText} \n\n ${error}`
		}
	} catch (err) {
		console.error('Error reading body from request:', err)
	}
	console.error(errorText)
	process.exit(1)
}
