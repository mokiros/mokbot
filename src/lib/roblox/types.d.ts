export interface UniverseIdResponse {
	universeId: number | null
}

export interface UserResponse {
	id: number
	name: string
	displayName: string
	description: string
	created: string
	isBanned: boolean
	externalAppDisplayName: string | null
	hasVerifiedBadge: boolean
}

export type RobloxApiResponse<Data = unknown> = {
	errors?: string[]
	data: Data[]
}

export interface RobloxApiResponseWithCursor<Data = unknown> extends RobloxApiResponse<Data> {
	previousPageCursor: string | null
	nextPageCursor: string | null
}

export interface RobloxBadge {
	awardedDate?: string
	id: number
	name: string
	description: string
	displayName: string
	displayDescription: string
	enabled: boolean
	iconImageId: number
	displayIconImageId: number
	created: string
	updated: string
	statistics: {
		pastDayAwardedCount: number
		awardedCount: number
		winRatePercentage: number
	}
	awardingUniverse: {
		id: number
		name: string
		rootPlaceId: number
	}
}

export interface AwardedRobloxBadge {
	badgeId: number
	awardedDate: string
}
