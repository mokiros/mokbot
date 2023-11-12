import {
	APIInteractionResponseCallbackData,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIChatInputApplicationCommandInteraction,
	APIMessageComponentInteraction,
	APIInteractionResponseUpdateMessage,
	APIInteractionResponseDeferredMessageUpdate,
} from 'discord-api-types/v10'
import { Env } from '../../Env'

export const enum CommandSpecialResult {
	Deferred,
}
export type CommandResult = APIInteractionResponseCallbackData | string | CommandSpecialResult

export interface CommandObject {
	params: RESTPostAPIChatInputApplicationCommandsJSONBody
	ephemeral?: boolean
	handler: (
		interaction: APIChatInputApplicationCommandInteraction,
		env: Env,
		ctx: ExecutionContext
	) => Promise<CommandResult> | CommandResult
}

export type ComponentResult =
	| APIInteractionResponseUpdateMessage
	| APIInteractionResponseDeferredMessageUpdate

export interface ComponentObject {
	name: string
	handler: (
		args: string[],
		interaction: APIMessageComponentInteraction,
		env: Env,
		ctx: ExecutionContext
	) => Promise<ComponentResult> | ComponentResult
}
