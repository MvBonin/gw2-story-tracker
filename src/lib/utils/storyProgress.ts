import type { Story } from '$lib/api/stories';

export interface StoryProgress {
	story: Story;
	completedBy: string[]; // Nur Character-Namen, nicht vollständige Character-Objekte
}

/**
 * Mappt Story-Fortschritt zu Charakteren basierend auf Character-spezifischen Quests
 * 
 * Verwendet die neuen API-basierten Funktionen:
 * - getStoriesAndSeasons() für Story-Metadaten
 * - getQuestToStoryMap() für Quest-zu-Story-Mapping
 */
export async function mapStoryProgress(
	apiKey: string,
	characterQuests: Map<string, number[]>,
	forceRefresh = false
): Promise<StoryProgress[]> {
	try {
		const { getStoriesAndSeasons } = await import('$lib/api/stories');
		const { getQuestToStoryMap } = await import('$lib/api/questMapping');

		const { stories } = await getStoriesAndSeasons(forceRefresh);
		const questToStory = await getQuestToStoryMap(forceRefresh);

		if (!stories || !Array.isArray(stories)) {
			console.error('Stories ist kein Array:', stories);
			throw new Error('Ungültige Stories-Daten von der API');
		}

		if (!questToStory || !(questToStory instanceof Map)) {
			console.error('QuestToStory ist keine Map:', questToStory);
			throw new Error('Ungültiges Quest-zu-Story-Mapping');
		}

		// Erstelle Character -> Completed Story IDs Map
		const characterCompletedStories = new Map<string, Set<number>>();

		for (const [characterName, questIds] of characterQuests.entries()) {
			const completedStoryIds = new Set<number>();
			for (const questId of questIds) {
				const storyId = questToStory.get(questId);
				if (storyId) completedStoryIds.add(storyId);
			}
			characterCompletedStories.set(characterName, completedStoryIds);
		}

		// Mappe Stories zu Charakteren
		const storyProgress: StoryProgress[] = stories.map((story: Story) => {
			const completedBy: string[] = [];
			for (const [characterName, completedStoryIds] of characterCompletedStories.entries()) {
				if (completedStoryIds.has(story.id)) {
					completedBy.push(characterName);
				}
			}
			return { story, completedBy };
		});

		return storyProgress;
	} catch (error) {
		console.error('Fehler in mapStoryProgress:', error);
		throw error;
	}
}


