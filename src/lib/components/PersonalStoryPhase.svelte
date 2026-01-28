<script lang="ts">
	import type { PersonalStoryPhaseProgress } from '$lib/utils/personalStoryProgress';
	import type { Character } from '$lib/api/gw2';
	import { getProfessionIcon } from '$lib/utils/professionIcons';

	interface Props {
		phase: PersonalStoryPhaseProgress;
		characterDetails: Map<string, Character>;
	}

	let { phase, characterDetails }: Props = $props();
</script>

<div class="py-2 px-3">
	<!-- Phase Header -->
	<div class="font-semibold text-base-content mb-2">
		Level {phase.phaseLevel}: {phase.phaseName}
	</div>
	
	<!-- Quests in dieser Phase -->
	<div class="space-y-1.5 ml-4">
		{#each phase.quests as quest}
			<div class="flex items-start gap-3 py-1.5 px-2 hover:bg-base-200/30 rounded transition-colors">
				<!-- Quest Name -->
				<div class="flex-1 min-w-0">
					<div class="font-medium text-sm text-base-content">{quest.questName}</div>
					{#if quest.completedBy.length > 0}
						<div class="text-xs opacity-60 mt-1 flex items-center gap-1.5 flex-wrap">
							{#each quest.completedBy as characterName, index}
								{@const character = characterDetails.get(characterName)}
								{@const professionIcon = character ? getProfessionIcon(character.profession) : null}
								<span class="inline-flex items-center gap-1">
									{#if professionIcon}
										<img
											src={professionIcon}
											alt={character?.profession || ''}
											class="w-3.5 h-3.5 inline-block"
											title={character?.profession || characterName}
										/>
									{/if}
									<span>{characterName}</span>
								</span>
								{#if index < quest.completedBy.length - 1}
									<span class="opacity-40">·</span>
								{/if}
							{/each}
						</div>
					{:else}
						<div class="text-xs opacity-50 mt-1 italic">Not completed</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

