<script lang="ts">
	import type { StoryProgress } from '$lib/utils/storyProgress';
	import type { Character } from '$lib/api/gw2';

	interface Props {
		storyProgress: StoryProgress[];
	}

	let { storyProgress }: Props = $props();

	// Profession Namen auf Deutsch
	const professionNames: Record<string, string> = {
		Guardian: 'Wächter',
		Warrior: 'Krieger',
		Engineer: 'Ingenieur',
		Ranger: 'Waldläufer',
		Thief: 'Dieb',
		Elementalist: 'Elementarmagier',
		Mesmer: 'Mesmer',
		Necromancer: 'Nekromant',
		Revenant: 'Wiedergänger'
	};

	function getProfessionName(profession: string): string {
		return professionNames[profession] || profession;
	}

	// Finde die aktuelle Story (für Highlighting)
	let selectedStoryId: number | null = null;
</script>

<div class="space-y-6">
	{#each storyProgress as { story, completedBy } (story.id)}
		<div
			class="card bg-base-200 shadow-sm transition-all hover:shadow-md"
			on:mouseenter={() => (selectedStoryId = story.id)}
			on:mouseleave={() => (selectedStoryId = null)}
		>
			<div class="card-body p-4">
				<h4 class="font-semibold mb-3">{story.name}</h4>

				{#if completedBy.length > 0}
					<div class="space-y-2">
						{#each completedBy as character (character.name)}
							<div class="flex items-center gap-3 p-2 bg-base-100 rounded-lg">
								<div class="avatar placeholder">
									<div class="bg-neutral text-neutral-content rounded-full w-10">
										<span class="text-xs">{character.name.charAt(0).toUpperCase()}</span>
									</div>
								</div>
								<div class="flex-1">
									<div class="font-medium">{character.name}</div>
									<div class="text-sm text-base-content/60 flex items-center gap-2">
										<span>Level {character.level}</span>
										<span>•</span>
										<span>{getProfessionName(character.profession)}</span>
										<span>•</span>
										<span>{character.race}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="alert alert-info">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="stroke-current shrink-0 h-6 w-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<span>Noch nicht abgeschlossen</span>
					</div>
				{/if}
			</div>
		</div>
	{/each}

	{#if storyProgress.length === 0}
		<div class="text-center text-base-content/60 py-8">
			<p>Keine Daten verfügbar.</p>
		</div>
	{/if}
</div>

