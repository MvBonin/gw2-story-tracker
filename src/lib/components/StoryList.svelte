<script lang="ts">
	import type { StoryProgress } from '$lib/utils/storyProgress';

	interface Props {
		storyProgress: StoryProgress[];
	}

	let { storyProgress }: Props = $props();

	// Gruppiere Stories nach Kategorie
	const personalStories = storyProgress.filter((sp) => sp.story.category === 'personal_story');
	const livingWorldStories = storyProgress.filter((sp) => sp.story.category === 'living_world');

	// Gruppiere Living World nach Season
	const livingWorldBySeason = livingWorldStories.reduce((acc, sp) => {
		const season = sp.story.season || 0;
		if (!acc[season]) {
			acc[season] = [];
		}
		acc[season].push(sp);
		return acc;
	}, {} as Record<number, StoryProgress[]>);
</script>

<div class="space-y-6">
	<!-- Personal Story -->
	{#if personalStories.length > 0}
		<div>
			<h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
				<span class="badge badge-primary">Personal Story</span>
			</h3>
			<div class="space-y-2">
				{#each personalStories as { story, completedBy } (story.id)}
					<div class="card bg-base-200 shadow-sm">
						<div class="card-body p-3">
							<div class="flex items-center justify-between">
								<span class="font-medium">{story.name}</span>
								{#if completedBy.length > 0}
									<span class="badge badge-success">Abgeschlossen</span>
								{:else}
									<span class="badge badge-ghost">Offen</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Living World Stories -->
	{#if Object.keys(livingWorldBySeason).length > 0}
		<div>
			<h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
				<span class="badge badge-secondary">Living World</span>
			</h3>
			{#each Object.entries(livingWorldBySeason) as [season, stories] (season)}
				<div class="mb-4">
					<h4 class="text-md font-medium mb-2 ml-2">Season {season}</h4>
					<div class="space-y-2">
						{#each stories as { story, completedBy } (story.id)}
							<div class="card bg-base-200 shadow-sm">
								<div class="card-body p-3">
									<div class="flex items-center justify-between">
										<div>
											<span class="font-medium">{story.name}</span>
											{#if story.episode}
												<span class="text-xs text-base-content/60 ml-2">Episode {story.episode}</span>
											{/if}
										</div>
										{#if completedBy.length > 0}
											<span class="badge badge-success">Abgeschlossen</span>
										{:else}
											<span class="badge badge-ghost">Offen</span>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if storyProgress.length === 0}
		<div class="text-center text-base-content/60 py-8">
			<p>Keine Stories gefunden.</p>
		</div>
	{/if}
</div>

