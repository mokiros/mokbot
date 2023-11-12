import { UserResponse } from './types'

export default async function getRobloxUser(userid: number) {
	const url = `https://users.roblox.com/v1/users/${userid}`
	const response = await fetch(url)
	const data = (await response.json()) as UserResponse
	return data
}
