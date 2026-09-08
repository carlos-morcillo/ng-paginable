import { AsyncPipe, NgClass } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	ElementRef,
	EmbeddedViewRef,
	TemplateRef,
	ViewContainerRef,
	inject,
	input,
	viewChild
} from '@angular/core';
import { Observable, isObservable, of } from 'rxjs';
import { resolveHubAccent, UnwrapAsyncPipe } from 'ng-hub-ui-utils';
import { TableRowEvent } from '../../interfaces';
import { TableRow } from '../../interfaces/table-row';
import { PaginableActionButton } from '../../interfaces/paginable-action-button';
import { PaginableTableDropdown } from '../../interfaces/paginable-table-dropdown';
import { HubPaginableIconComponent } from '../icon/icon.component';
import { HubTableTooltipDirective } from '../../table-tooltip';

/**
 * Component for displaying a dropdown menu within a paginable table row.
 *
 * @deprecated Since 22.16.0. Register an actions adapter with
 * `provideHubPaginableActions(hubActionsAdapter)` from `ng-hub-ui-buttons`; the table then
 * draws its menus with the design system's dropdown and this component is not used.
 *
 * It places its panel by hand on `document.body`, so it neither flips when it does not fit
 * nor follows a scrolling container; it closes on an outside click and on nothing else, so
 * Escape and the keyboard never reach it. Kept only so that upgrading breaks nobody.
 *
 * @export
 * @class HubPaginableTableDropdownComponent
 * @template T
 */
@Component({
	selector: 'hub-table-dropdown, paginable-table-dropdown',

	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [AsyncPipe, HubTableTooltipDirective, NgClass, HubPaginableIconComponent, UnwrapAsyncPipe],
	templateUrl: './paginable-table-dropdown.component.html',
	styleUrls: ['./paginable-table-dropdown.component.scss'],
	host: {
		'(document:click)': 'clickOut($event)'
	}
})
export class HubPaginableTableDropdownComponent<T = any> {
	#elementRef = inject(ElementRef);

	readonly dropdownTpt = viewChild.required<TemplateRef<any>>('dropdownTpt');

	private vcr = inject(ViewContainerRef);
	private embeddedView: EmbeddedViewRef<any> | null = null;
	private renderedElement: HTMLElement | null = null;

	/**
	 * The row data and event information associated with the dropdown.
	 *
	 * @type {(TableRowEvent<T> | undefined)}
	 * @memberof HubPaginableTableDropdownComponent
	 */
	readonly row = input<TableRowEvent<T>>();

	/**
	 * Configuration options for the dropdown menu, including buttons and styling.
	 *
	 * The defaults are folded in by the transform rather than read at each use site, so
	 * `options().position` answers even when the consumer only passed `buttons`.
	 *
	 * @type {PaginableTableDropdown}
	 * @memberof HubPaginableTableDropdownComponent
	 */
	readonly options = input<PaginableTableDropdown, PaginableTableDropdown>(
		{ buttons: [] },
		{
			transform: (value: PaginableTableDropdown): PaginableTableDropdown => ({
				position: 'end',
				fill: 'clear',
				// `neutral` and not `muted`: the design system has no `--hub-sys-color-muted`, so that
				// name resolved to an invalid declaration the browser dropped, leaving the trigger to
				// inherit the table's ink. `neutral` is the same grey and it is what the row actions use.
				color: 'neutral',
				...value
			})
		}
	);

	/**
	 * The element to append the dropdown to. Can be an HTMLElement, 'body', or null.
	 * Defaults to 'body'.
	 *
	 * @type {(HTMLElement | 'body' | null)}
	 * @memberof HubPaginableTableDropdownComponent
	 */
	readonly appendTo = input<HTMLElement | 'body' | null>('body');

	/**
	 * Whether the dropdown button is disabled.
	 *
	 * @type {boolean}
	 * @memberof HubPaginableTableDropdownComponent
	 */
	readonly disabled = input<boolean>(false);

	readonly buttonClass = computed(() => `hub-table-dropdown__toggle--${this.options().fill ?? 'clear'}`);

	/**
	 * Resolved accent for the trigger, bound to `style.color`.
	 *
	 * `color` is a free-form word, so it is resolved rather than enumerated: a class per
	 * built-in role would honour exactly those roles and leave a consumer's own name painting
	 * nothing, which is the trap the row-action buttons already climbed out of.
	 *
	 * @see resolveHubAccent
	 */
	readonly toggleColor = computed(() => resolveHubAccent(this.options().color ?? 'neutral'));

	shown: boolean = false;

	/**
	 * Checks if the clicked element is outside the component's native element and if the component is currently shown, and if so,
	 * it closes the component.
	 *
	 * @param event - Represents the event that triggered the clickOut function. It contains information about the event, such as
	 * the target element that was clicked.
	 */
	clickOut(event: MouseEvent) {
		if (!this.#elementRef.nativeElement.contains(event.target) && this.shown) {
			this.close();
		}
	}

	toggle() {
		if (this.shown) {
			this.close();
			return;
		}

		this.shown = true;

		const appendTo = this.appendTo();
		const target =
			appendTo === 'body' ? document.body : appendTo instanceof HTMLElement ? appendTo : this.#elementRef.nativeElement;

		// Crea la vista
		this.embeddedView = this.vcr.createEmbeddedView(this.dropdownTpt());
		this.embeddedView.detectChanges();

		const [element] = this.embeddedView.rootNodes as HTMLElement[];
		this.renderedElement = element;

		const button = this.#elementRef.nativeElement.querySelector('button');
		const rect = button.getBoundingClientRect();

		Object.assign(element.style, {
			position: 'absolute',
			zIndex: '1050',
			top: `${rect.bottom + window.scrollY}px`,
			left: `${rect.left + window.scrollX}px`
		});

		target.appendChild(element);
	}

	/**
	 * Sets the "shown" property to false.
	 */
	close() {
		this.shown = false;

		if (this.embeddedView) {
			this.embeddedView.destroy();
			this.embeddedView = null;
		}

		if (this.renderedElement && this.renderedElement.parentElement) {
			this.renderedElement.parentElement.removeChild(this.renderedElement);
			this.renderedElement = null;
		}
	}

	/**
	 * Whether this item is refused on the row the dropdown belongs to.
	 *
	 * Same shape as the cell's own buttons — boolean or predicate, always an Observable —
	 * because it is the same question about the same kind of action. Tucking an action
	 * into the menu cannot change what a consumer is allowed to say about it.
	 */
	isItemDisabled(action: PaginableActionButton<T>, row?: TableRowEvent<T>): Observable<boolean> {
		return this.resolveState(action.disabled, row);
	}

	/** Whether this item does not exist on this row at all. @see isItemDisabled */
	isItemHidden(action: PaginableActionButton<T>, row?: TableRowEvent<T>): Observable<boolean> {
		return this.resolveState(action.hidden, row);
	}

	/**
	 * Resolves a boolean-or-predicate item flag against the current row.
	 *
	 * A predicate with no row to ask about answers `false`: an action is refused because
	 * of what the row is, and with no row there is nothing to refuse it for.
	 */
	private resolveState(
		flag: PaginableActionButton<T>['hidden'] | PaginableActionButton<T>['disabled'],
		row?: TableRowEvent<T>
	): Observable<boolean> {
		if (typeof flag === 'function') {
			if (!row) {
				return of(false);
			}
			const result = (flag as (row: TableRow<T>) => boolean | Observable<boolean>)(row);
			return isObservable(result) ? result : of(!!result);
		}
		return of(!!flag);
	}

	/**
	 * Executes a dropdown action in row context when a handler is available.
	 *
	 * A disabled item never runs: the menu closes on click before the browser's own
	 * `disabled` has anything to say, so the refusal is enforced here too rather than
	 * relying on the attribute alone.
	 *
	 * @param action Action button configuration from dropdown options.
	 */
	executeDropdownAction(action: PaginableActionButton<T>): void {
		const row = this.row();
		const handler = action.handler as ((event: TableRowEvent<T>) => void) | undefined;
		if (!row || !handler) {
			return;
		}

		let refused = false;
		this.isItemDisabled(action, row)
			.subscribe((value) => (refused = value))
			.unsubscribe();

		if (refused) {
			return;
		}

		handler(row);
	}

	/**
	 * Returns normalized CSS classes for dropdown action items.
	 * Ensures a default BEM class is present when no dropdown-specific class is provided.
	 *
	 * @param action Dropdown action button definition.
	 * @returns List of CSS class names to bind in template.
	 */
	getDropdownItemClassList(action: PaginableActionButton<T>): Array<string> {
		const normalized = this.normalizeClassList(action.classlist);
		if (!normalized.some((item) => item.startsWith('hub-table-dropdown__'))) {
			return ['hub-table-dropdown__item--default', ...normalized];
		}
		return normalized;
	}

	/**
	 * Converts a class list input into a flat, deduplicated string array.
	 *
	 * @param classList Action `classlist` value.
	 * @returns Normalized class name array.
	 */
	private normalizeClassList(classList: string | Array<string> | undefined): Array<string> {
		const tokens = Array.isArray(classList) ? classList : typeof classList === 'string' ? classList.split(/\s+/) : [];
		return [...new Set(tokens.map((item) => item.trim()).filter(Boolean))];
	}
}
