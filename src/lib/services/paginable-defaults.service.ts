import { inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { ResolvedStateDefault } from '../interfaces/paginable-state';
import { NormalizedStateDefault, normalizeStateDefault } from '../utils';
import { HubPaginableService } from './paginable.service';

/** The three paginable states that accept a default component. */
type StateKey = 'loading' | 'error' | 'noResults';

/**
 * Resolves the application-wide default state components declared in config and
 * exposes them as signals. Eager components are available immediately; lazy
 * loaders are resolved by {@link preload}, which the provider wires into an app
 * initializer so chunks are fetched at startup rather than mid-render.
 */
@Injectable({ providedIn: 'root' })
export class HubPaginableDefaultsService {
	#paginable = inject(HubPaginableService);

	#signals: Record<StateKey, WritableSignal<ResolvedStateDefault | null>> = {
		loading: signal(null),
		error: signal(null),
		noResults: signal(null)
	};

	/** Normalized descriptors kept around so {@link preload} can resolve loaders. */
	#normalized: Record<StateKey, NormalizedStateDefault | null>;

	/** Resolved default component for the loading state, or null when unset. */
	readonly loading: Signal<ResolvedStateDefault | null> = this.#signals.loading.asReadonly();
	/** Resolved default component for the error state, or null when unset. */
	readonly error: Signal<ResolvedStateDefault | null> = this.#signals.error.asReadonly();
	/** Resolved default component for the no-results state, or null when unset. */
	readonly noResults: Signal<ResolvedStateDefault | null> = this.#signals.noResults.asReadonly();

	constructor() {
		const states = this.#paginable.config.states ?? {};
		this.#normalized = {
			loading: normalizeStateDefault(states.loading),
			error: normalizeStateDefault(states.error),
			noResults: normalizeStateDefault(states.noResults)
		};

		// Eager components need no async resolution — publish them right away.
		for (const key of Object.keys(this.#normalized) as StateKey[]) {
			const normalized = this.#normalized[key];
			if (normalized?.component) {
				this.#signals[key].set({ component: normalized.component, inputs: normalized.inputs });
			}
		}
	}

	/**
	 * Resolves every lazy default-state loader and publishes the resulting
	 * component into its signal. Safe to call multiple times; already-resolved or
	 * eager states are skipped.
	 */
	async preload(): Promise<void> {
		const pending = (Object.keys(this.#normalized) as StateKey[]).map(async (key) => {
			const normalized = this.#normalized[key];
			if (!normalized?.loader || this.#signals[key]()) {
				return;
			}
			const component = await normalized.loader();
			this.#signals[key].set({ component, inputs: normalized.inputs });
		});
		await Promise.all(pending);
	}
}
