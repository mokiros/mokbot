import { StatusError } from 'itty-router'
import { RobloxApiResponseWithCursor, RobloxBadge } from './types'

export default async function getUniverseBadges(
	universeid: number,
	limit: string,
	cursor?: string
) {
	const url = `https://badges.roblox.com/v1/universes/${universeid}/badges?limit=${limit}&sortOrder=Asc${
		cursor ? `&cursor=${cursor}` : ''
	}`
	const response = await fetch(url)
	const data = (await response.json()) as RobloxApiResponseWithCursor<RobloxBadge>
	if (data.errors) {
		for (const error of data.errors) {
			console.error(error)
			throw new StatusError(500, { error: 'Roblox API error' })
		}
	}
	const badges = data.data
	return {
		badges: badges,
		next: data.nextPageCursor,
		previous: data.previousPageCursor,
	}
}
