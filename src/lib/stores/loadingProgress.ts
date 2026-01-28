import { writable } from 'svelte/store';

export interface LoadingStep {
	id: string;
	label: string;
	status: 'pending' | 'loading' | 'completed' | 'error';
	current?: number;
	total?: number;
}

export interface LoadingProgress {
	currentStep: string | null;
	steps: LoadingStep[];
	overallProgress: number; // 0-100
}

const initialSteps: LoadingStep[] = [
	{ id: 'characters', label: 'Loading character list...', status: 'pending' },
	{ id: 'achievements', label: 'Loading character quests...', status: 'pending' },
	{ id: 'stories', label: 'Loading story details...', status: 'pending' },
	{ id: 'mapping', label: 'Mapping story progress...', status: 'pending' }
];

function createLoadingProgressStore() {
	const { subscribe, set, update } = writable<LoadingProgress>({
		currentStep: null,
		steps: initialSteps,
		overallProgress: 0
	});

	return {
		subscribe,
		start: () => {
			set({
				currentStep: null,
				steps: initialSteps.map((step) => ({ ...step, status: 'pending' as const })),
				overallProgress: 0
			});
		},
		setStepLoading: (stepId: string) => {
			update((state) => {
				const steps = state.steps.map((step) =>
					step.id === stepId ? { ...step, status: 'loading' as const } : step
				);
				const currentStepIndex = steps.findIndex((s) => s.id === stepId);
				const progress = (currentStepIndex / steps.length) * 100;

				return {
					currentStep: stepId,
					steps,
					overallProgress: progress
				};
			});
		},
		setStepCompleted: (stepId: string) => {
			update((state) => {
				const steps = state.steps.map((step) =>
					step.id === stepId ? { ...step, status: 'completed' as const } : step
				);
				const completedCount = steps.filter((s) => s.status === 'completed').length;
				const progress = (completedCount / steps.length) * 100;

				return {
					currentStep: null,
					steps,
					overallProgress: progress
				};
			});
		},
		setStepError: (stepId: string) => {
			update((state) => {
				const steps = state.steps.map((step) =>
					step.id === stepId ? { ...step, status: 'error' as const } : step
				);

				return {
					currentStep: null,
					steps,
					overallProgress: state.overallProgress
				};
			});
		},
		setStepProgress: (stepId: string, current: number, total: number) => {
			update((state) => {
				const steps = state.steps.map((step) =>
					step.id === stepId
						? { ...step, status: 'loading' as const, current, total }
						: step
				);
				const currentStepIndex = steps.findIndex((s) => s.id === stepId);
				
				// Berechne Progress basierend auf Step-Position und innerhalb des Steps
				const stepProgress = total > 0 ? (current / total) * 100 : 0;
				const stepWeight = 1 / steps.length;
				const baseProgress = (currentStepIndex / steps.length) * 100;
				const stepContribution = stepProgress * stepWeight;
				const overallProgress = baseProgress + stepContribution;

				return {
					currentStep: stepId,
					steps,
					overallProgress: Math.min(100, overallProgress)
				};
			});
		},
		reset: () => {
			set({
				currentStep: null,
				steps: initialSteps,
				overallProgress: 0
			});
		}
	};
}

export const loadingProgressStore = createLoadingProgressStore();

