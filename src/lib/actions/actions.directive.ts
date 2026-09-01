import { Directive, OnDestroy, afterNextRender, effect, inject, input, ViewContainerRef } from '@angular/core';
import { Observable, Subscription, combineLatest, isObservable, map, of } from 'rxjs';
import { TableRowEvent } from '../interfaces';
import { PaginableActionButton } from '../interfaces/paginable-action-button';
import { PaginableTableDropdown } from '../interfaces/paginable-table-dropdown';
import { TableRow } from '../interfaces/table-row';
import { HUB_PAGINABLE_ACTIONS } from './actions.token';
import { HubPaginableAction, HubPaginableActionItem, HubPaginableActionsHandle } from './actions.types';

/** What a header declares in its `buttons`: single actions, menus, or both. */
type DeclaredAction = PaginableActionButton | PaginableTableDropdown;

/**
 * Draws one row's actions through the optional {@link HUB_PAGINABLE_ACTIONS} adapter.
 *
 * Place it on an `<ng-container>` inside the branch that runs only when an adapter is
 * present; the deprecated built-in markup stays in the `@else` branch. Everything the
 * adapter receives is already resolved against this row — hidden actions are gone,
 * disabled ones are plain booleans, Observable labels are strings — so an adapter never
 * has to know that a consumer may write a predicate, or a translation stream, where a
 * plain value would do.
 */
@Directive({
	selector: '[hubPaginableActions]'
})
export class HubPaginableActionsDirective<T = any> implements OnDestroy {
	/** The header's declarations, exactly as the consumer wrote them. */
	readonly actions = input.required<ReadonlyArray<DeclaredAction>>({
		alias: 'hubPaginableActions'
	});

	/** The row these actions act on. */
	readonly row = input<TableRowEvent<T>>();

	private readonly vcr = inject(ViewContainerRef);
	private readonly adapter = inject(HUB_PAGINABLE_ACTIONS, { optional: true });

	private handle: HubPaginableActionsHandle | null = null;
	private watching: Subscription | null = null;
	private rendered = false;

	constructor() {
		afterNextRender(() => {
			this.rendered = true;
			this.watch();
		});

		effect(() => {
			// Touch both, so a new row or a new declaration rebuilds the description.
			this.actions();
			this.row();
			if (this.rendered) {
				this.watch();
			}
		});
	}

	ngOnDestroy(): void {
		this.watching?.unsubscribe();
		this.handle?.destroy();
		this.handle = null;
	}

	/**
	 * Describes the cell and redraws it whenever any part of the description answers.
	 *
	 * Flags and labels may both be Observables — a predicate returning a stream, a title
	 * carrying a translation — so the cell is composed rather than read: each action
	 * becomes an Observable of its own resolved shape, and the cell is what they say
	 * together. The alternative, reading a flat list by index, breaks the first time an
	 * action gains a field.
	 */
	private watch(): void {
		if (!this.adapter) {
			return;
		}

		this.watching?.unsubscribe();

		const declared = this.actions() ?? [];
		const row = this.row();

		if (!declared.length) {
			this.push([]);
			return;
		}

		this.watching = combineLatest(declared.map((action) => this.describeAction(action, row))).subscribe((described) =>
			this.push(described.filter(isDrawn))
		);
	}

	/** One declaration, resolved for this row, or `null` when it is hidden here. */
	private describeAction(action: DeclaredAction, row: TableRowEvent<T> | undefined): Observable<HubPaginableAction | null> {
		const items = (action as PaginableTableDropdown).buttons ?? [];

		return items.length
			? this.describeMenu(action as PaginableTableDropdown, items, row)
			: this.describeButton(action as PaginableActionButton, row).pipe(
					map((item) => (item ? { kind: 'button' as const, ...item } : null))
				);
	}

	private describeMenu(
		menu: PaginableTableDropdown,
		items: ReadonlyArray<PaginableActionButton>,
		row: TableRowEvent<T> | undefined
	): Observable<HubPaginableAction | null> {
		return combineLatest({
			hidden: this.flag(menu.hidden, row),
			disabled: this.flag(menu.disabled, row),
			label: this.text(menu.title),
			tooltip: this.text(menu.tooltip),
			items: combineLatest(items.map((item) => this.describeButton(item, row)))
		}).pipe(
			map(({ hidden, disabled, label, tooltip, items: described }) =>
				hidden
					? null
					: {
							kind: 'menu' as const,
							icon: menu.icon,
							label,
							tooltip: tooltip ?? label,
							color: menu.color,
							placement: opensTowards(menu.position),
							disabled,
							items: described.filter(isDrawn)
						}
			)
		);
	}

	/** One action, resolved, or `null` when this row does not offer it. */
	private describeButton(
		action: PaginableActionButton,
		row: TableRowEvent<T> | undefined
	): Observable<HubPaginableActionItem | null> {
		return combineLatest({
			hidden: this.flag(action.hidden, row),
			disabled: this.flag(action.disabled, row),
			label: this.text(action.label),
			title: this.text(action.title),
			tooltip: this.text(action.tooltip)
		}).pipe(
			map(({ hidden, disabled, label, title, tooltip }) =>
				hidden
					? null
					: {
							icon: typeof action.icon === 'string' ? action.icon : undefined,
							label: label ?? title,
							tooltip: tooltip ?? title ?? label,
							variant: action.variant,
							color: action.color,
							disabled,
							onSelect: () => {
								if (disabled || !row) {
									return;
								}
								(action.handler as ((event: TableRowEvent<T>) => void) | undefined)?.(row);
							}
						}
			)
		);
	}

	/** Creates the actions on the first description and updates them thereafter. */
	private push(actions: HubPaginableAction[]): void {
		const config = { actions };

		if (this.handle) {
			this.handle.update(config);
			return;
		}

		this.handle = this.adapter!.create(this.vcr, config);
	}

	/** A boolean-or-predicate flag, always as an Observable. */
	private flag(
		value: PaginableActionButton['hidden'] | PaginableActionButton['disabled'],
		row: TableRowEvent<T> | undefined
	): Observable<boolean> {
		if (typeof value === 'function') {
			if (!row) {
				return of(false);
			}
			const answer = (value as (row: TableRow<T>) => boolean | Observable<boolean>)(row);
			return isObservable(answer) ? answer : of(!!answer);
		}
		return of(!!value);
	}

	/** Text a consumer may have declared as a string or as a stream. */
	private text(value: string | Observable<string> | undefined): Observable<string | undefined> {
		if (isObservable(value)) {
			return value;
		}
		return of(value);
	}
}

/** Narrows away the actions this row does not offer. */
function isDrawn<TAction>(action: TAction | null): action is TAction {
	return action !== null;
}

/**
 * The table says which edge a menu hangs from; the adapter vocabulary says which corner.
 *
 * Both spellings of each side are accepted because both have been in the public type
 * since before this, and a consumer writing `left` did not write a bug.
 */
function opensTowards(position: PaginableTableDropdown['position']): 'bottom-start' | 'bottom-end' {
	return position === 'start' || position === 'left' ? 'bottom-start' : 'bottom-end';
}
