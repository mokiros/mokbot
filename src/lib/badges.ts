import {
	ComponentType,
	ButtonStyle,
	APIMessageActionRowComponent,
	RESTPostAPIWebhookWithTokenJSONBody,
	MessageFlags,
	Snowflake,
} from 'discord-api-types/v10'
import { Env } from '../Env'
import { getUniverseBadges, getBadgesAwardedToUser } from './roblox'
import { UserResponse } from './roblox/types'
import { StatusError } from 'itty-router'

type BadgeInfo = [id: number, name: string, awardedAt?: number]
type BadgeMap = BadgeInfo[]

interface CacheNode {
	readonly id: string
	readonly universeId: number
	readonly playerData: UserResponse
	readonly badges: BadgeMap
	previousCursor: string | null
	nextCursor: string | null
	previousNode: string | null
	nextNode: string | null
	count: number
	lastNodeCount?: number
}

async function getBadgeMap(env: Env, universeId: number, playerId: number, cursor?: string) {
	const badgeData = await getUniverseBadges(universeId, env.ROBLOX_BADGE_LIMIT, cursor)
	if (badgeData.badges.length === 0) {
		return null
	}
	const awardedBadges = await getBadgesAwardedToUser(
		playerId,
		badgeData.badges.map(v => v.id)
	)
	const awardMap = awardedBadges.reduce((map, award) => {
		map.set(award.badgeId, Math.floor(new Date(award.awardedDate).getTime() / 1000))
		return map
	}, new Map<number, number>())
	return {
		badges: badgeData.badges.map<[number, string, number | undefined]>(badge => [
			badge.id,
			badge.name,
			awardMap.get(badge.id),
		]),
		previous: badgeData.previous,
		next: badgeData.next,
	}
}

function generateBadgesMessage(
	node: CacheNode,
	caller: Snowflake
): RESTPostAPIWebhookWithTokenJSONBody {
	const player = node.playerData
	const plrname =
		player.displayName === player.name
			? '@' + player.name
			: `${player.displayName} (@${player.name})`
	const description = node.badges
		.map(badge => {
			let str = ' ' + badge[1]
			if (badge[2]) str = ':white_check_mark:' + str + ' ' + '<t:' + badge[2] + ':R>'
			else str = ':heavy_multiplication_x:' + str
			return str
		})
		.join('\n')
	let components: APIMessageActionRowComponent[] | undefined
	const next = node.nextCursor || node.nextNode
	const prev = node.previousCursor || node.previousNode
	if (next || prev) {
		components = [
			{
				type: ComponentType.Button,
				label: 'Previous',
				custom_id: `getbadges/prev/${caller}/${node.id}`,
				style: ButtonStyle.Primary,
				disabled: !prev,
			},
			{
				type: ComponentType.Button,
				label: 'Next',
				custom_id: `getbadges/next/${caller}/${node.id}`,
				style: ButtonStyle.Primary,
				disabled: !next,
			},
		]
	}
	return {
		embeds: [
			{
				title: `Badges for ${plrname}`,
				description: description,
				footer: {
					text: `Universe ID: ${node.universeId} | Page ${node.count + 1}/${
						node.lastNodeCount !== undefined ? node.lastNodeCount + 1 : '?'
					}`,
				},
			},
		],
		components: components
			? [
					{
						type: ComponentType.ActionRow,
						components,
					},
			  ]
			: [],
	}
}

async function saveNode(env: Env, node: CacheNode) {
	await env.RobloxPageCursors.put(node.id, JSON.stringify(node), {
		expirationTtl: Number(env.CACHE_NODE_EXPIRATION_SECONDS) || 86400,
	})
}

async function generateNode(env: Env, universeId: number, player: UserResponse, cursor?: string) {
	const badgeData = await getBadgeMap(env, universeId, player.id, cursor)
	if (!badgeData) {
		return null
	}
	const node: CacheNode = {
		id: crypto.randomUUID(),
		count: 0,
		universeId: universeId,
		playerData: player,
		badges: badgeData.badges,
		nextNode: null,
		nextCursor: badgeData.next,
		previousNode: null,
		previousCursor: badgeData.previous,
	}
	return node
}

export async function getBadgesButton(
	env: Env,
	caller: Snowflake,
	direction: 'prev' | 'next',
	nodeId: string
) {
	const cachedNode = await env.RobloxPageCursors.get(nodeId, 'text')
	if (!cachedNode) {
		throw new StatusError(500, { error: 'Cached node not found' })
	}
	const node = JSON.parse(cachedNode) as CacheNode
	let cursor, newNodeId
	if (direction === 'next') {
		cursor = node.nextCursor
		newNodeId = node.nextNode
	} else {
		cursor = node.previousCursor
		newNodeId = node.previousNode
	}
	let newNode: CacheNode | null | undefined
	if (newNodeId) {
		const nodeText = await env.RobloxPageCursors.get(newNodeId, 'text')
		if (nodeText) {
			newNode = JSON.parse(nodeText)
		}
	}
	if (!newNode) {
		if (!cursor) {
			throw new StatusError(500, {
				error: 'Attempted to create previous/next node at last possible node',
			})
		}
		newNode = await generateNode(env, node.universeId, node.playerData, cursor)
		if (newNode === null) {
			node.lastNodeCount = node.count
			node.nextCursor = null
			await saveNode(env, node)
			return generateBadgesMessage(node, caller)
		}
		if (direction === 'next') {
			node.nextNode = newNode.id
			newNode.previousNode = node.id
			newNode.count = node.count + 1
			if (!newNode.nextCursor) {
				newNode.lastNodeCount = newNode.count
				node.lastNodeCount = newNode.lastNodeCount
			}
		} else {
			node.previousNode = newNode.id
			newNode.nextNode = node.id
			newNode.count = node.count - 1
		}
		await saveNode(env, node)
		await saveNode(env, newNode)
	}
	if (node.lastNodeCount !== undefined && newNode.lastNodeCount === undefined) {
		newNode.lastNodeCount = node.lastNodeCount
		await saveNode(env, newNode)
	}
	return generateBadgesMessage(newNode, caller)
}

export async function getBadgesNew(
	env: Env,
	caller: Snowflake,
	universeId: number,
	player: UserResponse
) {
	const node = await generateNode(env, universeId, player)
	if (!node) {
		return {
			content: 'No badges found for this place',
			flags: MessageFlags.Ephemeral,
		}
	}
	await saveNode(env, node)
	return generateBadgesMessage(node, caller)
}
