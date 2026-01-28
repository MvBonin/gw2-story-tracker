<script lang="ts">
	import type { StoryProgress } from '$lib/utils/storyProgress';
	import type { Season } from '$lib/api/stories';
	import type { Character } from '$lib/api/gw2';
	import { getSeasonBadgeLabel, getSeasonMasteryIcon } from '$lib/utils/seasonLabels';
	import StoryItem from './StoryItem.svelte';

	interface Props {
		storyProgress: StoryProgress[];
		seasons: Season[];
		allCharacters?: string[];
		characterDetails?: Map<string, Character>;
	}

	let { storyProgress, seasons, allCharacters = [], characterDetails = new Map() }: Props = $props();

	// Erstelle Map von Season-ID zu Season für schnellen Zugriff
	const seasonMap = new Map((seasons || []).map((s) => [s.id, s]));

	// Gruppiere Stories nach Season-ID
	const groupedBySeason = new Map<string, StoryProgress[]>();
	
	for (const sp of storyProgress || []) {
		const seasonId = sp.story?.seasonId;
		if (seasonId) {
			if (!groupedBySeason.has(seasonId)) {
				groupedBySeason.set(seasonId, []);
			}
			groupedBySeason.get(seasonId)!.push(sp);
		}
	}

	// Sortiere Seasons nach order
	const sortedSeasons = Array.from(groupedBySeason.keys())
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
</script>

<div class="space-y-3">
	{#if sortedSeasons.length === 0}
		<div class="alert alert-info">
			<span>Keine Stories gefunden. Bitte lade die Seite neu.</span>
		</div>
	{:else}
		{#each sortedSeasons as season (season.id)}
			{@const seasonProgress = groupedBySeason.get(season.id) || []}
			{@const sortedSeasonProgress = seasonProgress.sort((a, b) => a.story.order - b.story.order)}
			{@const completedCount = sortedSeasonProgress.filter((sp) => sp.completedBy.length > 0).length}
			{@const totalCount = sortedSeasonProgress.length}
			{@const isComplete = completedCount === totalCount && totalCount > 0}
			{@const badgeLabel = getSeasonBadgeLabel(season)}
			{@const masteryIcon = getSeasonMasteryIcon(season.id)}

			{#if sortedSeasonProgress.length > 0}
				<div class="collapse collapse-arrow bg-base-200/50 shadow-sm rounded-lg">
					<input type="checkbox" />
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
								<span class="badge badge-primary badge-lg rounded-full px-3 py-1.5 flex-shrink-0">
									{badgeLabel}
								</span>
								
								<!-- Season Name -->
								<span class="truncate">
									{season.name}
								</span>
							</div>
							
							<!-- Progress -->
							<span class="text-sm {isComplete ? 'text-success' : 'opacity-60'} flex-shrink-0">
								{completedCount} / {totalCount} completed
							</span>
						</div>
					</div>
					<div class="collapse-content">
						<div class="pt-2 pb-2 px-1 space-y-0.5">
							{#each sortedSeasonProgress as sp (sp.story.id)}
								<StoryItem storyProgress={sp} {allCharacters} {characterDetails} />
							{/each}
						</div>
					</div>
				</div>
			{/if}
		{/each}
	{/if}
</div>

