import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, signal, TemplateRef } from '@angular/core';
import { PaginableStateContext, PaginableStateDefault, ResolvedStateDefault } from '../../interfaces/paginable-state';
import { normalizeStateDefault } from '../../utils';

/**
 * Renders a single paginable state (loading / error / no-results) by applying a
 * fixed precedence and picking the right rendering strategy:
 *
 * `template` (local directive) → `instanceDefault` (`@Input`) → `globalDefault`
 * (config) → `fallback` (built-in template).
 *
 * Local directive templates and the built-in fallback render through
 * `NgTemplateOutlet`; registered defaults render through `NgComponentOutlet`,
 * fed by the descriptor's optional input factory. Lazy instance defaults resolve
 * on demand and drop to the next precedence level while pending.
 */
@Component({
	selector: 'hub-state-outlet',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgTemplateOutlet, NgComponentOutlet],
	template: `
		@if (chosenTemplate(); as tpl) {
			<ng-container [ngTemplateOutlet]="tpl"></ng-container>
		} @else if (chosenComponent(); as def) {
			<ng-container [ngComponentOutlet]="def.component" [ngComponentOutletInputs]="resolvedInputs()"></ng-container>
		}
	`
})
export class HubPaginableStateOutlet {
	/** Content-projected directive template — highest precedence. */
	readonly template = input<TemplateRef<unknown> | null | undefined>(null);
	/** Per-instance default declared via `@Input` on the host component. */
	readonly instanceDefault = input<PaginableStateDefault | null>(null);
	/** Application-wide default resolved by `HubPaginableDefaultsService`. */
	readonly globalDefault = input<ResolvedStateDefault | null>(null);
	/** Built-in template rendered when nothing else is provided. */
	readonly fallback = input.required<TemplateRef<unknown>>();
	/** Runtime context handed to the chosen component's input factory. */
	readonly context = input<PaginableStateContext>({});

	/** Per-instance default once its (possibly lazy) component is resolved. */
	readonly #instanceResolved = signal<ResolvedStateDefault | null>(null);

	constructor() {
		effect(() => {
			const normalized = normalizeStateDefault(this.instanceDefault());
			if (!normalized) {
				this.#instanceResolved.set(null);
				return;
			}
			if (normalized.component) {
				this.#instanceResolved.set({ component: normalized.component, inputs: normalized.inputs });
				return;
			}
			// Lazy instance default: clear while the chunk loads, then publish.
			this.#instanceResolved.set(null);
			normalized.loader?.().then((component) => this.#instanceResolved.set({ component, inputs: normalized.inputs }));
		});
	}

	/** The chosen component default, or null when a template wins instead. */
	readonly chosenComponent = computed<ResolvedStateDefault | null>(() => {
		if (this.template()) {
			return null;
		}
		return this.#instanceResolved() ?? this.globalDefault();
	});

	/** The chosen template (local or fallback), or null when a component wins. */
	readonly chosenTemplate = computed<TemplateRef<unknown> | null>(() => {
		const local = this.template();
		if (local) {
			return local;
		}
		return this.chosenComponent() ? null : this.fallback();
	});

	/** `@Input` values for the chosen component, derived from the context. */
	readonly resolvedInputs = computed<Record<string, unknown>>(() => {
		const def = this.chosenComponent();
		return def?.inputs?.(this.context()) ?? {};
	});
}
