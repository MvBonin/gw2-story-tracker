import type { AccountAchievement } from './gw2';
import { cached } from '$lib/utils/cache';

const GW2_API_BASE = 'https://api.guildwars2.com/v2';

// Neue Interfaces für API-basierte Story-Verwaltung
export interface Story {
	id: number;
	name: string;
	seasonId: string;  // UUID statt season number
	order: number;     // Episode order innerhalb der Season
	level: number;
}

export interface Season {
	id: string;        // UUID
	name: string;      // z.B. "Living World Season 4"
	order: number;
	stories: number[]; // Story IDs in korrekter Reihenfolge
}

// Legacy Interface (wird später entfernt)
export interface LegacyStory {
	id: number;
	name: string;
	category: 'living_world' | 'personal_story' | 'expansion';
	episode?: number;
	season?: number;
}

/**
 * Holt Stories und Seasons parallel von der GW2 API
 */
export async function getStoriesAndSeasons(forceRefresh = false): Promise<{ stories: Story[]; seasons: Season[] }> {
	return cached(
		'stories_and_seasons',
		async () => {
			const [storiesRes, seasonsRes] = await Promise.all([
				fetch(`${GW2_API_BASE}/stories?ids=all`),
				fetch(`${GW2_API_BASE}/stories/seasons?ids=all`)
			]);

			if (!storiesRes.ok) {
				const errorText = await storiesRes.text();
				throw new Error(`Failed to fetch stories: ${storiesRes.status} ${errorText}`);
			}

			if (!seasonsRes.ok) {
				const errorText = await seasonsRes.text();
				throw new Error(`Failed to fetch seasons: ${seasonsRes.status} ${errorText}`);
			}

			const storiesRaw = await storiesRes.json();
			const seasonsRaw = await seasonsRes.json();

			if (!Array.isArray(storiesRaw)) {
				console.error('Stories ist kein Array:', storiesRaw);
				throw new Error(`Stories ist kein Array: ${typeof storiesRaw}`);
			}

			if (!Array.isArray(seasonsRaw)) {
				console.error('Seasons ist kein Array:', seasonsRaw);
				throw new Error(`Seasons ist kein Array: ${typeof seasonsRaw}`);
			}

			// Mappe API-Daten zu unserem Interface
			// API gibt "season" zurück, wir brauchen "seasonId"
			const stories: Story[] = storiesRaw.map((s: any) => {
				const mapped = {
					id: s.id,
					name: s.name,
					seasonId: s.season || '', // API gibt "season" als UUID zurück
					order: s.order || 0,
					level: s.level || 0
				};
				// Debug: Prüfe ob seasonId gesetzt ist
				if (!mapped.seasonId && s.season) {
					console.warn('Story ohne seasonId:', s);
				}
				return mapped;
			});

			const seasons: Season[] = seasonsRaw.map((s: any) => ({
				id: s.id,
				name: s.name,
				order: s.order || 0,
				stories: s.stories || []
			}));

			return { stories, seasons };
		},
		forceRefresh
	);
}

/**
 * Character-Story-Completion Interface
 */
export interface CharacterStoryProgress {
	character: string;
	completedStoryIds: Set<number>;
}

/**
 * Holt die abgeschlossenen Story-IDs für einen Charakter basierend auf seinen Quests
 */
export async function getCharacterCompletedStories(
	apiKey: string,
	character: string,
	questToStory: Map<number, number>
): Promise<Set<number>> {
	const { getCharacterQuests } = await import('./gw2');
	const questIds = await getCharacterQuests(apiKey, character);
	const completedStories = new Set<number>();

	for (const qid of questIds) {
		const storyId = questToStory.get(qid);
		if (storyId) completedStories.add(storyId);
	}

	return completedStories;
}

/**
 * Erstellt eine Account-weite Story-Completion-Matrix für alle Charaktere
 */
export async function getStoryCompletionMatrix(apiKey: string): Promise<CharacterStoryProgress[]> {
	const { getCharacters } = await import('./gw2');
	const { getQuestToStoryMap } = await import('./questMapping');

	const characters = await getCharacters(apiKey);
	const questToStory = await getQuestToStoryMap();

	const perCharacter: CharacterStoryProgress[] = [];

	for (const name of characters) {
		const completed = await getCharacterCompletedStories(apiKey, name, questToStory);
		perCharacter.push({
			character: name,
			completedStoryIds: completed
		});
	}

	return perCharacter;
}

// Legacy Interface (wird für Kompatibilität beibehalten, aber nicht mehr verwendet)
export interface LegacyStory {
	id: number;
	name: string;
	category: 'living_world' | 'personal_story' | 'expansion';
	episode?: number;
	season?: number;
}

// Legacy Types (werden für Kompatibilität beibehalten)
export type SeasonLabel = 'Personal Story' | 'LW1' | 'LW2' | 'LW3' | 'LW4' | 'IBS' | 'HOT' | 'POF' | 'EOD' | 'SOTO' | 'JW' | 'VOE';

/**
 * Prüft, ob ein Achievement abgeschlossen ist
 */
export function isAchievementCompleted(
	accountAchievements: AccountAchievement[],
	achievementId: number
): boolean {
	const achievement = accountAchievements.find((ach) => ach.id === achievementId);
	return achievement?.done === true || (achievement?.current !== undefined && achievement?.max !== undefined && achievement.current >= achievement.max);
}


