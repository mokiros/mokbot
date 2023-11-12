import { StatusError } from 'itty-router'
import { RobloxApiResponse, AwardedRobloxBadge } from './types'

export default async function getBadgesAwardedToUser(userid: number, badges: number[]) {
	const url = `https://badges.roblox.com/v1/users/${userid}/badges/awarded-dates?badgeIds=${badges.join(
		','
	)}`
	const response = await fetch(url)
	const data = (await response.json()) as RobloxApiResponse<AwardedRobloxBadge>
	if (data.errors) {
		for (const error of data.errors) {
			console.error(error)
			throw new StatusError(500, { error: 'Roblox API error' })
		}
	}
	return data.data
}
