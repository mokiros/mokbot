export interface Env {
	DISCORD_APP_ID: string
	DISCORD_APP_PUBLIC_KEY: string
	DISCORD_BOT_TOKEN: string
	ROBLOX_BADGE_LIMIT: string
	CACHE_NODE_EXPIRATION_SECONDS: string

	GuildConfigs: KVNamespace
	RobloxPlayerCache: KVNamespace
	RobloxPageCursors: KVNamespace
}
