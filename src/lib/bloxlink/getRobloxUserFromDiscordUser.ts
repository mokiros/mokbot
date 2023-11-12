export default async function getRobloxUserFromDiscordUser(
	bloxlinkApiKey: string,
	guildid: string,
	userid: string
) {
	const url = `https://api.blox.link/v4/public/guilds/${guildid}/discord-to-roblox/${userid}`
	const response = await fetch(url, {
		headers: {
			Authorization: bloxlinkApiKey,
		},
	})
	const data = (await response.json()) as { robloxID: string; error?: string }
	if (data.error) {
		throw data.error
	}
	return Number(data.robloxID)
}
