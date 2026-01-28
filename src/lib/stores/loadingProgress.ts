import { writable } from 'svelte/store';

export interface LoadingStep {
	id: string;
	label: string;
	status: 'pending' | 'loading' | 'completed' | 'error';
}

export interface LoadingProgress {
	currentStep: string | null;
	steps: LoadingStep[];
	overallProgress: number; // 0-100
}

const initialSteps: LoadingStep[] = [
	{ id: 'characters', label: 'Lade Charakter-Liste...', status: 'pending' },
	{ id: 'achievements', label: 'Lade Account-Achievements...', status: 'pending' },
	{ id: 'stories', label: 'Lade Story-Details...', status: 'pending' },
	{ id: 'mapping', label: 'Mappe Story-Fortschritt...', status: 'pending' }
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

