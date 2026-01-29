/**
 * Personal Story Lazy Loader
 * Lädt Personal Story Quest-Daten on-demand beim Aufklappen einer Phase
 */

import type { Quest } from '$lib/api/gw2';
import type { Story } from '$lib/api/stories';
import { getAllQuestIds, getAllQuestDetails } from '$lib/api/gw2';
import { getQuestToStoryMap } from '$lib/api/questMapping';
import { getStoriesAndSeasons } from '$lib/api/stories';
import { PERSONAL_STORY_SEASON_ID } from './personalStoryPhases';
import { createPersonalStoryProgress, type PersonalStoryPhaseProgress } from './personalStoryProgress';

// Cache für geladene Personal Story Daten
let cachedPersonalStoryPhases: PersonalStoryPhaseProgress[] | null = null;
let cachedPersonalStoryStoryIds: Set<number> | null = null;
let isLoadingPersonalStory = false;

/**
 * Holt alle Personal Story Story-IDs aus der API
 */
export async function getPersonalStoryStoryIds(): Promise<Set<number>> {
	if (cachedPersonalStoryStoryIds) {
		return cachedPersonalStoryStoryIds;
	}

	const { stories } = await getStoriesAndSeasons();
	const personalStoryStoryIds = new Set<number>(
		stories.filter((s: Story) => s.seasonId === PERSONAL_STORY_SEASON_ID).map((s: Story) => s.id)
	);

	cachedPersonalStoryStoryIds = personalStoryStoryIds;
	return personalStoryStoryIds;
}

/**
 * Lädt alle Personal Story Quest-Daten (einmalig, dann gecached)
 */
export async function ensurePersonalStoryDataLoaded(
	characterQuests: Map<string, number[]>
): Promise<PersonalStoryPhaseProgress[]> {
	// Wenn bereits geladen, gib Cache zurück
	if (cachedPersonalStoryPhases) {
		return cachedPersonalStoryPhases;
	}

	// Wenn bereits am Laden, warte
	if (isLoadingPersonalStory) {
		// Warte bis Laden abgeschlossen ist
		while (isLoadingPersonalStory) {
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
		return cachedPersonalStoryPhases || [];
	}

	isLoadingPersonalStory = true;

	try {
		// 1. Hole Personal Story Story-IDs
		const personalStoryStoryIds = await getPersonalStoryStoryIds();

		// 2. Lade Quest-Daten
		const questToStory = await getQuestToStoryMap();
		const allQuestIds = await getAllQuestIds();
		const allQuestDetails = await getAllQuestDetails(allQuestIds);

		// 3. Filtere Personal Story Quests (alle Story-IDs, nicht nur 1)
		const personalStoryQuestDetails = allQuestDetails.filter((q: Quest) => {
			const storyId = questToStory.get(q.id);
			return storyId !== undefined && personalStoryStoryIds.has(storyId);
		});

		// 4. Erstelle Personal Story Progress
		const phases = createPersonalStoryProgress(
			characterQuests,
			personalStoryQuestDetails,
			questToStory,
			personalStoryStoryIds
		);

		cachedPersonalStoryPhases = phases;
		return phases;
	} finally {
		isLoadingPersonalStory = false;
	}
}

/**
 * Lädt eine spezifische Phase (oder alle, wenn noch nicht geladen)
 */
export async function loadPersonalStoryPhase(
	phaseLevel: number,
	characterQuests: Map<string, number[]>
): Promise<PersonalStoryPhaseProgress | null> {
	const allPhases = await ensurePersonalStoryDataLoaded(characterQuests);
	return allPhases.find((p) => p.phaseLevel === phaseLevel) || null;
}

/**
 * Setzt den Cache zurück (für Tests oder Refresh)
 */
export function clearPersonalStoryCache(): void {
	cachedPersonalStoryPhases = null;
	cachedPersonalStoryStoryIds = null;
	isLoadingPersonalStory = false;
}



