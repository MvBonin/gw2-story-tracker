<!-- Skeleton Loader für Story List -->
<div class="space-y-6 animate-pulse">
	<div>
		<div class="h-6 w-32 bg-base-300 rounded mb-2"></div>
		<div class="space-y-2">
			{#each Array(3) as _}
				<div class="card bg-base-200 shadow-sm">
					<div class="card-body p-3">
						<div class="flex items-center justify-between">
							<div class="h-4 w-48 bg-base-300 rounded"></div>
							<div class="h-6 w-20 bg-base-300 rounded"></div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

