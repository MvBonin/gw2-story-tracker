<script lang="ts">
	import type { StoryProgress } from '$lib/utils/storyProgress';
	import type { Character } from '$lib/api/gw2';
	import { getStoryStatus } from '$lib/utils/storyStatus';
	import { getProfessionIcon } from '$lib/utils/professionIcons';

	interface Props {
		storyProgress: StoryProgress;
		allCharacters?: string[];
		characterDetails?: Map<string, Character>;
	}

	let { storyProgress, allCharacters = [], characterDetails = new Map() }: Props = $props();
	let statusInfo = $state<Awaited<ReturnType<typeof getStoryStatus>> | null>(null);

	// Lade Status asynchron
	$effect(() => {
		getStoryStatus(storyProgress, allCharacters).then((info) => {
			statusInfo = info;
		});
	});
</script>

<div class="flex items-start gap-4 py-2.5 px-3 hover:bg-base-200/30 rounded transition-colors">
	<!-- Index (order) -->
	<div class="text-sm opacity-50 min-w-[2rem] text-right pt-0.5">
		{storyProgress.story.order}.
	</div>
	
	<!-- Chapter Title & Characters -->
	<div class="flex-1 min-w-0">
		<div class="font-medium text-base-content">{storyProgress.story.name}</div>
		{#if storyProgress.completedBy.length > 0}
			<div class="text-sm opacity-60 mt-1 flex items-center gap-1.5 flex-wrap">
				{#each storyProgress.completedBy as characterName, index}
					{@const character = characterDetails.get(characterName)}
					{@const professionIcon = character ? getProfessionIcon(character.profession) : null}
					<span class="inline-flex items-center gap-1">
						{#if professionIcon}
							<img
								src={professionIcon}
								alt={character?.profession || ''}
								class="w-4 h-4 inline-block"
								title={character?.profession || characterName}
							/>
						{/if}
						<span>{characterName}</span>
					</span>
					{#if index < storyProgress.completedBy.length - 1}
						<span class="opacity-40">·</span>
					{/if}
				{/each}
			</div>
		{/if}
		{#if statusInfo?.message}
			<div class="text-xs opacity-50 mt-1 italic">
				{statusInfo.message}
			</div>
		{/if}
	</div>
	
	<!-- Status Badge -->
	<div class="ml-auto flex-shrink-0 pt-0.5">
		{#if statusInfo}
			<span class="badge badge-sm {statusInfo.badgeClass}">
				{statusInfo.label}
			</span>
		{:else}
			<span class="badge badge-ghost badge-sm">Loading...</span>
		{/if}
	</div>
</div>

