import { UniverseIdResponse } from './types'

export default async function getUniverseIdFromPlaceId(placeid: number): Promise<number | null> {
	const url = `https://apis.roblox.com/universes/v1/places/${placeid}/universe`
	const response = await fetch(url)
	const data = (await response.json()) as UniverseIdResponse
	return data.universeId
}
