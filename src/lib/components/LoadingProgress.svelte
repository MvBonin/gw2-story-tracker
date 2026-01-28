<script lang="ts">
	import { loadingProgressStore } from '$lib/stores/loadingProgress';

	let progress = $state({
		currentStep: null,
		steps: [],
		overallProgress: 0
	});

	loadingProgressStore.subscribe((value) => {
		progress = value;
	});
</script>

<div class="w-full">
	<div class="mb-4">
		<div class="flex justify-between items-center mb-2">
			<span class="text-sm font-medium">Progress</span>
			<span class="text-sm opacity-60">{Math.round(progress.overallProgress)}%</span>
		</div>
		<progress
			class="progress progress-primary w-full"
			value={progress.overallProgress}
			max="100"
		></progress>
	</div>

	<div class="space-y-2">
		{#each progress.steps as step (step.id)}
			<div class="flex items-center gap-3">
				{#if step.status === 'completed'}
					<svg
						class="w-5 h-5 text-success"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						></path>
					</svg>
				{:else if step.status === 'loading'}
					<span class="loading loading-spinner loading-sm text-primary"></span>
				{:else if step.status === 'error'}
					<svg
						class="w-5 h-5 text-error"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				{:else}
					<div class="w-5 h-5 rounded-full border-2 border-base-content opacity-20"></div>
				{/if}
				<span
					class="text-sm {step.status === 'pending' ? 'opacity-60' : ''} {step.status === 'loading' ? 'text-primary' : ''} {step.status === 'completed' ? 'text-success' : ''} {step.status === 'error' ? 'text-error' : ''}"
				>
					{step.label}
				</span>
			</div>
		{/each}
	</div>
</div>

