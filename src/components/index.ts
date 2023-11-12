import { ComponentObject } from '../lib/discord/types'
import GetBadgesComponent from './getBadges'

const Components = [GetBadgesComponent]
const ComponentMap: Record<string, ComponentObject> = {}

for (const component of Components) {
	ComponentMap[component.name] = component
}

export default ComponentMap
