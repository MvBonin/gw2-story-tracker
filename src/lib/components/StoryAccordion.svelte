<script lang="ts">
	import type { StoryProgress } from '$lib/utils/storyProgress';
	import type { Season } from '$lib/api/stories';
	import type { Character } from '$lib/api/gw2';
	import type { PersonalStoryPhaseProgress } from '$lib/utils/personalStoryProgress';
	import { getSeasonBadgeLabel, getSeasonMasteryIcon } from '$lib/utils/seasonLabels';
	import { PERSONAL_STORY_SEASON_ID, PERSONAL_STORY_PHASES } from '$lib/utils/personalStoryPhases';
	import { isStoryUndetectable } from '$lib/utils/storyStatus';
	import { loadPersonalStoryPhase, ensurePersonalStoryDataLoaded } from '$lib/utils/personalStoryLoader';
	import StoryItem from './StoryItem.svelte';
	import PersonalStoryPhase from './PersonalStoryPhase.svelte';

	interface Props {
		storyProgress: StoryProgress[];
		seasons: Season[];
		allCharacters?: string[];
		characterDetails?: Map<string, Character>;
		characterQuests: Map<string, number[]>;
	}

	let { storyProgress, seasons, allCharacters = [], characterDetails = new Map(), characterQuests }: Props = $props();

	// State für geladene Personal Story Phasen
	let loadedPhases = $state<Map<number, PersonalStoryPhaseProgress>>(new Map());
	let loadingPhases = $state<Set<number>>(new Set());
	let allPhasesLoaded = $state(false);

	// Lade alle Phasen beim ersten Aufklappen der Personal Story Season
	async function ensureAllPhasesLoaded() {
		if (allPhasesLoaded) return;

		loadingPhases.add(-1); // Flag für "alle Phasen werden geladen"
		try {
			const phases = await ensurePersonalStoryDataLoaded(characterQuests);
			const phaseMap = new Map<number, PersonalStoryPhaseProgress>();
			for (const phase of phases) {
				phaseMap.set(phase.phaseLevel, phase);
			}
			loadedPhases = phaseMap;
			allPhasesLoaded = true;
		} finally {
			loadingPhases.delete(-1);
		}
	}

	// Lade eine spezifische Phase
	async function loadPhase(phaseLevel: number) {
		if (loadedPhases.has(phaseLevel)) return;

		loadingPhases.add(phaseLevel);
		try {
			// Stelle sicher, dass alle Phasen geladen sind (einmalig)
			if (!allPhasesLoaded) {
				await ensureAllPhasesLoaded();
			} else {
				// Falls die Phase noch nicht im Cache ist, lade sie einzeln
				const phase = await loadPersonalStoryPhase(phaseLevel, characterQuests);
				if (phase) {
					loadedPhases.set(phaseLevel, phase);
				}
			}
		} finally {
			loadingPhases.delete(phaseLevel);
		}
	}

	// Phasen-Level sortiert
	const phaseLevels = Object.keys(PERSONAL_STORY_PHASES)
		.map(Number)
		.sort((a, b) => a - b);

	// Erstelle Map von Season-ID zu Season für schnellen Zugriff (reaktiv)
	const seasonMap = $derived(new Map((seasons || []).map((s) => [s.id, s])));

	// Gruppiere Stories nach Season-ID (reaktiv)
	const groupedBySeason = $derived.by(() => {
		const map = new Map<string, StoryProgress[]>();
		for (const sp of storyProgress || []) {
			const seasonId = sp.story?.seasonId;
			if (seasonId) {
				if (!map.has(seasonId)) {
					map.set(seasonId, []);
				}
				map.get(seasonId)!.push(sp);
			}
		}
		return map;
	});

	// Sortiere Seasons nach order (reaktiv)
	const sortedSeasons = $derived.by(() => {
		return Array.from(groupedBySeason.keys())
			.map((seasonId) => {
				const season = seasonMap.get(seasonId);
				if (season) {
					return season;
				}
				// Fallback: Erstelle ein temporäres Season-Objekt für unbekannte Seasons
				return {
					id: seasonId,
					name: `Unknown Season (${seasonId.substring(0, 8)}...)`,
					order: 9999,
					stories: []
				} as Season;
			})
			.sort((a, b) => a.order - b.order);
	});
</script>

<div class="space-y-3">
	{#if sortedSeasons.length === 0}
		<div class="alert alert-info">
			<span>No stories found. Please reload the page.</span>
		</div>
	{:else}
		{#each sortedSeasons as season (season.id)}
			{@const isPersonalStory = season.id === PERSONAL_STORY_SEASON_ID}
			{@const seasonProgress = groupedBySeason.get(season.id) || []}
			{@const sortedSeasonProgress = seasonProgress.sort((a, b) => a.story.order - b.story.order)}
			{@const badgeLabel = getSeasonBadgeLabel(season)}
			{@const masteryIcon = getSeasonMasteryIcon(season.id)}
			
			{@const totalQuests = isPersonalStory && allPhasesLoaded 
				? Array.from(loadedPhases.values()).reduce((sum, phase) => sum + phase.quests.length, 0) 
				: 0}
			{@const completedQuests = isPersonalStory && allPhasesLoaded
				? Array.from(loadedPhases.values()).reduce((sum, phase) => sum + phase.quests.filter(q => q.completedBy.length > 0).length, 0)
				: 0}
			
			{@const completedCount = !isPersonalStory ? sortedSeasonProgress.filter((sp) => sp.completedBy.length > 0).length : 0}
			{@const totalCount = !isPersonalStory 
				? sortedSeasonProgress.filter((sp) => !isStoryUndetectable(sp.story.id)).length 
				: 0}
			{@const isComplete = isPersonalStory 
				? (completedQuests === totalQuests && totalQuests > 0)
				: (completedCount === totalCount && totalCount > 0)}

			{#if (isPersonalStory && phaseLevels.length > 0) || (!isPersonalStory && sortedSeasonProgress.length > 0)}
				<div class="collapse collapse-arrow bg-base-200/50 shadow-sm rounded-lg">
					<input 
						type="checkbox" 
						onchange={(e) => {
							if (e.currentTarget.checked && isPersonalStory && !allPhasesLoaded) {
								ensureAllPhasesLoaded();
							}
						}}
					/>
					<div class="collapse-title text-lg font-medium">
						<div class="flex items-center justify-between gap-4 w-full">
							<div class="flex items-center gap-3 flex-1 min-w-0">
								<!-- Mastery Icon -->
								{#if masteryIcon}
									<img
										src={masteryIcon}
										alt="Mastery"
										class="w-5 h-5 flex-shrink-0"
										title={season.name}
									/>
								{/if}
								
								<!-- Season Badge (gold, pill-shaped) -->
								<span class="badge badge-primary badge-lg rounded-full px-3 py-1.5 flex-shrink-0 w-24">
									{badgeLabel}
								</span>
								
								<!-- Season Name -->
								<span class="truncate">
									{season.name}
								</span>
							</div>
							
							<!-- Progress -->
							<span class="text-sm {isComplete ? 'text-success' : 'opacity-60'} flex-shrink-0">
								{#if isPersonalStory}
									{#if allPhasesLoaded}
										{completedQuests} / {totalQuests} completed
									{:else}
										{phaseLevels.length} phases
									{/if}
								{:else}
									{completedCount} / {totalCount} completed
								{/if}
							</span>
						</div>
					</div>
					<div class="collapse-content">
						{#if isPersonalStory}
							<div class="pt-2 pb-2 px-1 space-y-2">
								{#each phaseLevels as phaseLevel}
									{@const phase = loadedPhases.get(phaseLevel)}
									{@const isLoading = loadingPhases.has(phaseLevel) || loadingPhases.has(-1)}
									{@const phaseName = PERSONAL_STORY_PHASES[phaseLevel] || `Level ${phaseLevel}`}
									
									<div class="collapse collapse-arrow bg-base-100/30 rounded-lg">
										<input 
											type="checkbox" 
											onchange={(e) => {
												if (e.currentTarget.checked && !phase && !isLoading) {
													loadPhase(phaseLevel);
												}
											}}
										/>
										<div class="collapse-title text-base font-medium py-2">
											Level {phaseLevel}: {phaseName}
										</div>
										<div class="collapse-content">
											{#if isLoading}
												<div class="py-4 px-2 flex items-center justify-center gap-2">
													<span class="loading loading-spinner loading-sm"></span>
													<span class="text-sm opacity-60">Loading quests...</span>
												</div>
											{:else if phase}
												<PersonalStoryPhase {phase} {characterDetails} />
											{:else}
												<div class="py-2 px-2 text-sm opacity-50 italic">
													Click to load quests
												</div>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="pt-2 pb-2 px-1 space-y-0.5">
								{#each sortedSeasonProgress as sp (sp.story.id)}
									<StoryItem storyProgress={sp} {allCharacters} {characterDetails} />
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		{/each}
	{/if}
</div>

