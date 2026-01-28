import type { StoryProgress } from './storyProgress';

export type StoryStatus = 'completed' | 'partial' | 'undetectable' | 'future';

export interface StoryStatusInfo {
	status: StoryStatus;
	label: string;
	badgeClass: string;
	message?: string; // Für spezielle Nachrichten
}

// VOE Season ID: "5F35F25C-AE33-4D92-A061-227CE54FA5DC"
const VOE_SEASON_ID = '5F35F25C-AE33-4D92-A061-227CE54FA5DC';

// HoT Episode 15: "Bitter Harvest" - Story ID 27
const HOT_EPISODE_15_STORY_ID = 27;

/**
 * Prüft ob eine Story zu VOE gehört
 */
export function isVOEStory(seasonId: string): boolean {
	return seasonId === VOE_SEASON_ID;
}

/**
 * Prüft ob eine Story nicht pro-Character detektierbar ist
 */
export function isStoryUndetectable(storyId: number): boolean {
	return storyId === HOT_EPISODE_15_STORY_ID;
}

/**
 * Erstellt ein reverse Mapping von Story ID zu Quest IDs
 */
export async function getStoryToQuestMap(): Promise<Map<number, number[]>> {
	const { getQuestToStoryMap } = await import('$lib/api/questMapping');
	const questToStory = await getQuestToStoryMap();
	
	const storyToQuests = new Map<number, number[]>();
	
	for (const [questId, storyId] of questToStory.entries()) {
		if (!storyToQuests.has(storyId)) {
			storyToQuests.set(storyId, []);
		}
		storyToQuests.get(storyId)!.push(questId);
	}
	
	return storyToQuests;
}

/**
 * Prüft ob eine Story Quests hat
 */
export async function hasStoryQuests(storyId: number): Promise<boolean> {
	const storyToQuests = await getStoryToQuestMap();
	const questIds = storyToQuests.get(storyId);
	return questIds !== undefined && questIds.length > 0;
}

/**
 * Bestimmt den Status einer Story basierend auf Completion und Metadaten
 */
export async function getStoryStatus(
	storyProgress: StoryProgress,
	allCharacters: string[] = []
): Promise<StoryStatusInfo> {
	const storyId = storyProgress.story.id;
	const seasonId = storyProgress.story.seasonId;
	const completedCount = storyProgress.completedBy.length;
	const totalCharacters = allCharacters.length || 1;
	
	// Wenn mindestens ein Charakter die Story abgeschlossen hat, ist sie detektierbar/verfügbar
	// Zeige dann "Done" statt "undetectable" oder "not yet available"
	if (completedCount > 0) {
		return {
			status: 'completed',
			label: 'Done',
			badgeClass: 'badge-success'
		};
	}
	
	// Nur wenn keine Completion gefunden wurde, prüfe spezielle Fälle:
	
	// HoT Episode 15 (Story ID 27: "Bitter Harvest")
	if (isStoryUndetectable(storyId)) {
		return {
			status: 'undetectable',
			label: 'Undetectable',
			badgeClass: 'badge-outline badge-warning',
			message: '⚠ Completion not detectable per character (ArenaNet does not expose quest completion for this episode)'
		};
	}
	
	// Prüfe ob Story Quests hat
	const hasQuests = await hasStoryQuests(storyId);
	
	// VOE Stories ohne Quests
	if (isVOEStory(seasonId) && !hasQuests) {
		return {
			status: 'future',
			label: 'Not yet available',
			badgeClass: 'badge-outline badge-secondary',
			message: '⏳ Not yet available (API: no story quests released)'
		};
	}
	
	// Stories ohne Quests (allgemein)
	if (!hasQuests) {
		return {
			status: 'future',
			label: 'Not yet available',
			badgeClass: 'badge-outline badge-secondary',
			message: '⏳ Not yet available'
		};
	}
	
	// Wenn keine Completion und keine speziellen Fälle: "Not completed"
	return {
		status: 'partial',
		label: 'Not completed',
		badgeClass: 'badge-ghost'
	};
}

