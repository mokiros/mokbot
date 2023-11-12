import { RouteBases, Routes } from 'discord-api-types/rest/v10'
import { config } from 'dotenv'
import CommandMap from '../src/commands'
config({ path: '.dev.vars' })

const token = process.env.DISCORD_BOT_TOKEN
const applicationId = process.env.DISCORD_APP_ID

if (!token) {
	throw new Error('The DISCORD_TOKEN environment variable is required.')
}
if (!applicationId) {
	throw new Error('The DISCORD_APPLICATION_ID environment variable is required.')
}
fetch(`${RouteBases.api}${Routes.applicationGuildCommands(applicationId, '374639346596315137')}`, {
	headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bot ${token}`,
	},
	method: 'PUT',
	body: '[]',
})
const url = `${RouteBases.api}${Routes.applicationCommands(applicationId)}`
const body = JSON.stringify(Object.values(CommandMap).map(v => v.params))

const response = await fetch(url, {
	headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bot ${token}`,
	},
	method: 'PUT',
	body: body,
})

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
}
