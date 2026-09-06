import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	DestroyRef,
	ElementRef,
	OnChanges,
	SimpleChanges,
	TemplateRef,
	booleanAttribute,
	computed,
	contentChild,
	effect,
	inject,
	input,
	linkedSignal,
	model,
	output,
	signal,
	untracked
} from '@angular/core';
import {
	AbstractControl,
	FormArray,
	FormBuilder,
	FormControl,
	FormsModule,
	NG_VALUE_ACCESSOR,
	ReactiveFormsModule
} from '@angular/forms';
import {
	generateUniqueId,
	getValue,
	HUB_TRANSLATION_PREFIX,
	resolveHubAccent,
	TranslatePipe,
	UcfirstPipe
} from 'ng-hub-ui-utils';
import { HubListDragPlaceholderDirective } from '../../../directives/list-drag-placeholder.directive';
import { HubListDragPreviewDirective } from '../../../directives/list-drag-preview.directive';
import { PaginableErrorDirective } from '../../../directives/paginable-error.directive';
import { PaginableListItemDirective } from '../../../directives/paginable-list-item.directive';
import { PaginableLoadingDirective } from '../../../directives/paginable-loading.directive';
import { PaginableNoResultsDirective } from '../../../directives/paginable-no-results.directive';
import { SelectionTypes } from '../../../enums/selection-types';
import { ListClickEvent } from '../../../interfaces/item-click-event';
import { ListSortEvent } from '../../../interfaces/list-sort-event';
import { PaginableActionButton } from '../../../interfaces/paginable-action-button';
import { PaginableTableDropdown } from '../../../interfaces/paginable-table-dropdown';
import { PaginableStateDefault } from '../../../interfaces/paginable-state';
import { PaginableTableOptions } from '../../../interfaces/paginable-table-options';
import { HubPaginableResource } from '../../../interfaces/paginable-resource';
import { readPaginableSource } from '../../../utils/paginable-source';
import { DragPointerMode, DragTarget, HubListDragService } from '../../../services/hub-list-drag.service';
import { PaginableDefaultsService } from '../../../services/paginable-defaults.service';
import { PaginableService } from '../../../services/paginable.service';
import { PaginableStateOutlet } from '../../state-outlet/paginable-state-outlet.component';
import {
	computeTargetIndex,
	containsNode,
	ListDragContainerRef,
	moveControlInFormArray,
	moveItemInArray,
	resolveDropPosition,
	toAbsoluteIndex,
	transferArrayItem,
	transferControlBetweenFormArrays
} from '../../../utils/list-drag.utils';
import { createPointerDragSession, PointerDragSession } from '../../../utils/list-pointer-drag';
import { PaginatorComponent } from '../../paginator/paginator.component';

/**
 * Internal state held while reordering an item by keyboard.
 */
interface KeyboardDragState {
	/** Container the grabbed item lives in. */
	container: ListDragContainerRef;
	/** Current absolute index of the grabbed item. */
	index: number;
	/** Absolute index the item had when it was grabbed. */
	originalIndex: number;
	/** The grabbed item. */
	item: any;
}

/** The options every list starts from, folded back in on every `options` assignment. */
const DEFAULT_LIST_OPTIONS: PaginableTableOptions = {
	display: 'list',
	rtl: false,
	cursor: 'default',
	hoverableRows: false,
	striped: null,
	variant: null,
	searchable: false,
	collapsed: true
};

@Component({
	selector: 'hub-list, hub-ui-list, hub-paginable-list',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './list.component.html',
	styleUrl: './list.component.scss',
	host: {
		class: 'hub-list',
		'[class.hub-list--rtl]': 'isRtl()',
		'[class.hub-list--flush]': 'flush()',
		'[attr.data-variant]': 'options().variant ?? null',
		'[style.--hub-list-accent]': 'accentVar()',
		'[attr.data-hub-drag-owner]': '_listId'
	},
	providers: [
		{ provide: HUB_TRANSLATION_PREFIX, useValue: 'HUBUI.PAGINABLE' },
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: ListComponent,
			multi: true
		}
	],
	imports: [
		ReactiveFormsModule,
		FormsModule,
		PaginatorComponent,
		TranslatePipe,
		UcfirstPipe,
		NgTemplateOutlet,
		NgClass,
		PaginableStateOutlet
	],
	standalone: true
})
/**
 * A component for displaying a paginable and selectable list of items.
 *
 * @export
 * @class ListComponent
 * @template T The type of data for each item in the list.
 */
export class ListComponent<T = any> implements OnChanges {
	#fb = inject(FormBuilder);
	#cdr = inject(ChangeDetectorRef);
	#host = inject(ElementRef);
	#destroyRef = inject(DestroyRef);

	/**
	 * Coordinator backing drag-and-drop reordering and cross-list transfers. Exposed to the
	 * template so it can read the active drag (e.g. for the placeholder context).
	 */
	protected readonly dragService = inject(HubListDragService);

	/** Stable identifier of this list instance, reflected as `data-hub-drag-owner` on the host. */
	readonly _listId = generateUniqueId(12);

	/** Resolved application-wide default state components. */
	readonly defaults = inject(PaginableDefaultsService);

	/** Application-wide paginable configuration (holds the input defaults). */
	readonly #config = inject(PaginableService);

	/** Resolved default input values from {@link providePaginable}. */
	get #defaults() {
		return this.#config.config.defaults ?? {};
	}

	/** Loading state indicator for the list. Consumer-driven. */
	readonly loading = model<boolean>(false);

	/**
	 * Error state holder. When set to a truthy value the list renders its error
	 * state. Consumer-driven, mirroring {@link loading}.
	 */
	readonly error = model<unknown | null>(null);

	/** Per-instance default component for the loading state. */
	readonly loadingComponent = input<PaginableStateDefault | null>(null);
	/** Per-instance default component for the error state. */
	readonly errorComponent = input<PaginableStateDefault | null>(null);
	/** Per-instance default component for the no-results state. */
	readonly noResultsComponent = input<PaginableStateDefault | null>(null);

	/**
	 * Draw the list flush: no border, radius or surface per row, a rule between them instead.
	 *
	 * The default is a stack of cards, which is right for a collection standing on a page. It
	 * is wrong for a list of choices inside a dialog or a panel, where a bordered box per row
	 * reads as a region of its own rather than as one list to pick from.
	 *
	 * An input rather than something a consumer can reach with CSS, because the tokens that
	 * would do it are declared on `:root, :host` — and the host is the element a consumer puts
	 * a class on, so their assignment ties on specificity and loses on source order, silently.
	 * Setting `--hub-list-divider-*` alone changes nothing until this is on.
	 *
	 * Applies to the cards display too: flush cards are a grid with no chrome.
	 */
	readonly flush = input(false, { transform: booleanAttribute });

	/**
	 * The term the list is filtered by, when `options.searchable` is on.
	 *
	 * A `model` like the table's, so a consumer can drive the search from outside — restore
	 * it from a URL, clear it from a button — as well as read what was typed. The box the
	 * component renders writes here when the search is submitted.
	 *
	 * The box used to be drawn and wired to a `filter()` whose body was entirely commented
	 * out: a control the API offered and the component ignored.
	 */
	readonly searchTerm = model<string>('');

	/**
	 * How an item is matched, when the default is not what you mean by "matches".
	 *
	 * The default reads `bindLabel` and falls back to the whole item stringified, which is
	 * right for a list of names and wrong for anything whose identity is spread across
	 * fields. The term arrives trimmed and lowercased, and the table honours the same
	 * contract — with one difference the hierarchy forces here: the predicate answers for a
	 * single item, and a group survives whenever any of its descendants does.
	 */
	readonly searchFn = input<((item: T, term: string) => boolean) | null>(null);

	readonly bindValue = input<string>();
	readonly bindLabel = input<string>('label');
	readonly bindChildren = input<string>('children');

	readonly selectable = input<SelectionTypes | boolean | null, SelectionTypes | boolean | null>(null, {
		transform: (value) => {
			if (value === true) {
				return SelectionTypes.Single;
			}
			if (value === false || value == null) {
				return null;
			}
			return value;
		}
	});

	readonly paginate = input<boolean>(this.#defaults.paginate ?? false);
	readonly page = model<number>(1);
	readonly perPage = model<number>(this.#defaults.perPage ?? 10);
	readonly perPageOptions = input<Array<number>>(this.#defaults.perPageOptions ?? [10, 20, 50]);
	readonly totalItems = model<number>(0);

	/**
	 * Enables drag-and-drop reordering of the list items (native HTML5 drag-and-drop, with a
	 * Pointer Events fallback for touch devices).
	 */
	readonly sortable = input<boolean>(false);

	/**
	 * Shared drag group. Lists with the same non-null group can exchange items via
	 * cross-list transfers. When `null` (default), only in-list reordering is allowed.
	 */
	readonly dragGroup = input<string | null>(null);

	/**
	 * Predicate marking an item as non-draggable. Disabled items cannot be picked up.
	 */
	readonly sortDisabled = input<(item: T) => boolean>(() => false);

	/**
	 * Enables keyboard reordering on the focusable row: `Space`/`Enter` to pick up and drop,
	 * arrow keys to move, `Escape` to cancel. Opt-in for accessibility.
	 */
	readonly keyboardSortable = input<boolean>(false);

	/**
	 * Draws a vertical connector between consecutive items — a timeline / pipeline look.
	 * Opt-in and default-off; applies to the list (column) display only, not cards. Style
	 * it through the `--hub-list-connector-*` variables.
	 */
	readonly connected = input<boolean>(false);

	/**
	 * Emitted by the destination list after a drag-and-drop reorder or cross-list transfer.
	 */
	readonly sorted = output<ListSortEvent<T>>();

	readonly numberOfPages = computed(() => {
		const perPage = this.perPage();
		const totalItems = this.totalItems() || this.#filteredItems().length;

		if (perPage && totalItems) {
			return Math.ceil(totalItems / perPage);
		}
		return 1;
	});

	readonly multipleSelectable = computed(() => this.selectable() === SelectionTypes.Multiple);

	/**
	 * Whether the list picks exactly one row, which renders a radio rather than a checkbox.
	 *
	 * `selectable` has enumerated `single` since it shipped — its own transform even turns a
	 * bare `true` into it — but nothing read the value, so writing it bought a pointer cursor
	 * and silence. "Choose one of these" is the ordinary shape (a room, a plan, a payment
	 * method), and every consumer that needed it had to build the row control by hand.
	 */
	readonly singleSelectable = computed(() => this.selectable() === SelectionTypes.Single);

	/**
	 * Name shared by the radios of THIS list, and by no other.
	 *
	 * A radio group is scoped by name across the whole document, so two lists rendered on one
	 * page would silently fight over a single selection if they shared one.
	 */
	readonly radioGroupName = `hub-list-selection-${generateUniqueId(8)}`;

	/**
	 * Visual and behavioural options.
	 *
	 * The transform folds the defaults back in on every write, so a consumer passing only
	 * `{ display: 'cards' }` still gets `collapsed: true` — and, unlike the setter this
	 * replaced, a key dropped from a later assignment stops applying instead of lingering.
	 */
	readonly options = input<PaginableTableOptions, PaginableTableOptions>(DEFAULT_LIST_OPTIONS, {
		transform: (value: PaginableTableOptions): PaginableTableOptions => ({
			...DEFAULT_LIST_OPTIONS,
			...(value ?? {})
		})
	});

	/**
	 * Returns whether right-to-left mode is enabled.
	 *
	 * @returns `true` when RTL mode is active for the list.
	 */
	isRtl(): boolean {
		return this.options().rtl === true;
	}

	/**
	 * Resolves the list's accent slot from `options.variant`, accepting ANY colour.
	 *
	 * A bareword (semantic name, registered accent or CSS named colour) resolves to
	 * the matching `--hub-sys-color-*` ds token with the raw word as fallback, while a
	 * literal `#hex` / `rgb()` / `oklch()` / `var()` is passed through unchanged. The
	 * value is bound to the single `--hub-list-accent` slot (the SCSS derives the
	 * `-emphasis` / `-subtle` / `-on` family from it); `null` (no variant) defers to
	 * the SCSS default and the built-in `[data-variant]` class rules.
	 *
	 * @returns The `--hub-list-accent` value, or `null` when no variant is set.
	 */
	accentVar(): string | null {
		return resolveHubAccent(this.options().variant);
	}

	/**
	 * Returns whether the root list should render using card layout.
	 *
	 * @returns `true` when the configured display mode is `cards`.
	 */
	isCardsDisplay(): boolean {
		return this.options().display === 'cards';
	}

	/** Hierarchical list data. */
	readonly items = input<any, any>([], { transform: (value: any) => value ?? [] });

	/**
	 * A signal-based resource — `resource()`, `httpResource()` or anything shaped like one —
	 * bound whole, so the collection, the loading state and the failure arrive together
	 * instead of as three bindings a consumer has to keep in step.
	 *
	 * Its value is read the way the table reads `[data]`: an array becomes the items, a
	 * `PaginationState` becomes the items plus page, size and total. `isLoading()` feeds
	 * {@link loading} and `error()` feeds {@link error}.
	 *
	 * Bound alongside `[items]`, **the resource wins**. And **paging does not reload it** — the
	 * list never calls `reload()`, so whoever owns the request keeps owning it.
	 *
	 * Typed structurally rather than as `ResourceRef`, which arrived in Angular 19 while this
	 * package supports 18: see {@link HubPaginableResource}.
	 */
	readonly resource = input<HubPaginableResource<T> | null>(null);

	/** Items published by the bound `[resource]`, or `null` while none is bound. */
	readonly #resourceItems = signal<Array<any> | null>(null);

	/** The collection the list works from: the resource's when one is bound, `[items]` otherwise. */
	readonly #sourceItems = computed<any>(() => this.#resourceItems() ?? this.items());

	/**
	 * Mirrors the bound resource into the list: its value becomes the items, its `isLoading()`
	 * the loading state and its `error()` the error state.
	 *
	 * It rebuilds the form itself because `ngOnChanges` — which is what `[items]` rebuilds
	 * through — never fires for a value that arrives inside a signal. The rebuild reads the
	 * collection it just published, so it runs untracked: tracking those reads would make the
	 * effect depend on its own writes.
	 *
	 * The failure is read before the value, and the value only when there is none: a failed
	 * resource has nothing to hand over and says so by rethrowing from `value()`. Reading the
	 * value first threw out of this effect, so the error state the input exists to drive was
	 * never set. The items of the last good load are left alone — a refresh that fails should
	 * not cost the reader the list they were looking at.
	 */
	resourceEffect = effect(() => {
		const resource = this.resource();

		if (!resource) {
			this.#resourceItems.set(null);
			return;
		}

		const failure = resource.error() ?? null;

		if (!failure) {
			const { items, state } = readPaginableSource<any>(resource.value());

			// A slot the collection left empty is not a statement about it: the list's own page,
			// size and total stay as they were rather than being reset to a default nobody chose.
			if (state?.page != null) {
				this.page.set(state.page);
			}
			if (state?.perPage != null) {
				this.perPage.set(state.perPage);
			}
			if (state?.totalItems != null) {
				this.totalItems.set(state.totalItems);
			}

			// Only a new collection is worth a rebuild. The effect also wakes when the resource
			// merely starts or stops loading, and throwing the form away then would collapse the
			// groups the reader had opened for nothing.
			const previous = untracked(() => this.#resourceItems());
			this.#resourceItems.set(items);

			if (previous !== items) {
				untracked(() => this.#rebuildFromItems());
			}
		}

		this.loading.set(resource.isLoading());
		this.error.set(failure);
	});

	/**
	 * The collection actually rendered: the items in force, plus the reorders drag applies to
	 * them.
	 *
	 * A drag moves an element inside the consumer's own array, which changes no reference and
	 * so repaints nothing. Republishing the collection here is what makes the move visible,
	 * and it cannot be done on the input itself — hence a linked signal rather than a field
	 * the old setter could reassign.
	 */
	protected readonly renderedItems = linkedSignal<any>(() => this.#sourceItems());

	/**
	 * Rebuilds the form the moment `items` or `options` change, which is the timing the
	 * accessor inputs used to give: the list is painted from `form.controls`, so deferring
	 * this to an effect would leave the first frame empty.
	 */
	ngOnChanges(changes: SimpleChanges): void {
		if (changes['items']) {
			this.#rebuildFromItems();
			return;
		}
		if (changes['options']) {
			// `collapsed` is a control of every group, so a new value has to reach the form.
			this.buildForm(this.form, this.renderedItems());
		}
	}

	/** Throws the form away, builds it from the current items and puts the selection back. */
	#rebuildFromItems(): void {
		// What the user had chosen, before the form that holds it is thrown away.
		const chosen = this.value;

		this.form.clear();
		this.buildForm(this.form, this.renderedItems());

		if (this.isDisabled) {
			this.form.disable({ emitEvent: false });
		}

		// Rebuilding is not the user changing their mind, so this paints and says nothing.
		//
		// The value written into the control is kept whole, and the form is given only the
		// part of it that is on offer. Recomputing the value from what survived looked
		// right and was not: `items` shrinking can mean "those are gone" or it can mean
		// "this is page two", and **this component cannot tell the difference** — only the
		// consumer, who did the paging or the filtering, can. Pruning on its behalf turned
		// a read into a silent edit, and publishing it through the CVA told the consumer
		// the user had cleared something they never touched. Angular's own `<select>` takes
		// the same position: an option disappearing does not clear the model.
		this.applySelectionFromValue(this.form.controls, this.#asArray(chosen));
	}

	/** The selection as a list, whichever shape the mode publishes it in. */
	#asArray(value: any): Array<any> {
		return Array.isArray(value) ? value : value == null ? [] : [value];
	}

	/**
	 * A function that is called when an item in the list is clicked.
	 * @type {() => (event: ListClickEvent<T>) => void | Promise<void>}
	 * @memberof ListComponent
	 */
	readonly clickFn = input<(event: ListClickEvent<T>) => void | Promise<void>>(() => {});

	/**
	 * A string or function to apply a class to each row of the list.
	 * If a string is provided, it is used as the class for all rows.
	 * If a function is provided, it is called with the item data and should return a string representing the class.
	 * @type {(string | ((item: T) => string))}
	 * @memberof ListComponent
	 */
	readonly rowClass = input<string | ((item: T) => string)>();

	form: FormArray = this.#fb.array([]);

	value: Array<any> = [];

	// NOTE: Templates

	readonly itemTpt = contentChild(PaginableListItemDirective, { read: TemplateRef });

	/**
	 * Custom template rendered when the list has no visible items to display.
	 */
	readonly noResultsTpt = contentChild(PaginableNoResultsDirective, { read: TemplateRef });

	/** Custom template rendered while the list is loading. */
	readonly loadingTpt = contentChild(PaginableLoadingDirective, { read: TemplateRef });

	/** Custom template rendered when the list is in an error state. */
	readonly errorTpt = contentChild(PaginableErrorDirective, { read: TemplateRef });

	/**
	 * Custom template for the drop placeholder shown while dragging.
	 */
	readonly placeholderTpt = contentChild(HubListDragPlaceholderDirective, { read: TemplateRef });

	/**
	 * Custom template for the drag preview (ghost) that follows the pointer.
	 */
	readonly previewTpt = contentChild(HubListDragPreviewDirective, { read: TemplateRef });

	// NOTE: Otros
	isDisabled: boolean = false;

	onChange: any = () => {};
	onTouch: any = () => {};

	// NOTE: Filters

	searchFG = this.#fb.control('');

	// NOTE: Drag & drop internal state

	/** Per-container registry keyed by container key, used by Pointer Events hit-testing. */
	readonly #containers = new Map<string, ListDragContainerRef>();
	/** Active Pointer Events session (touch fallback), or `null`. */
	#pointerSession: PointerDragSession | null = null;
	/** Cleans up the native custom drag image, or `null`. */
	#dragImageCleanup: (() => void) | null = null;
	/**
	 * The row whose most recent `pointerdown` landed on a valid drag-start zone. Native
	 * `dragstart.target` is the draggable `<li>` (not the pressed descendant), so the handle
	 * gate is resolved on `pointerdown` and consulted here.
	 */
	#dragStartLi: HTMLElement | null = null;
	/** Active keyboard reorder state, or `null`. */
	#keyboardDrag: KeyboardDragState | null = null;
	/** Screen-reader announcement (translation key + params) for keyboard reordering. */
	readonly #announcement = signal<{ key: string; params?: Record<string, unknown> } | null>(null);
	/** Read-only announcement signal for the template `aria-live` region. */
	readonly announcement = this.#announcement.asReadonly();

	constructor() {
		this.dragService.register({
			ownerId: this._listId,
			group: () => this.dragGroup(),
			refresh: () => this.#refreshSelf(),
			commit: () => this.#commitDrop(),
			resolveTarget: (element, clientX, clientY) => this.resolveTarget(element, clientX, clientY)
		});
		this.#destroyRef.onDestroy(() => {
			this.#pointerSession?.destroy();
			this.dragService.unregister(this._listId);
		});
	}

	// NOTE: Batch actions

	/**
	 * Collection of actions for items
	 *
	 * @type {PaginableTableRowAction[]}
	 * @memberof PaginableTableComponent
	 */
	readonly batchActions = input<
		Array<PaginableTableDropdown | PaginableActionButton>,
		Array<PaginableTableDropdown | PaginableActionButton>
	>([], {
		transform: (value: Array<PaginableTableDropdown | PaginableActionButton>) =>
			(value ?? []).map((action) =>
				(action as PaginableTableDropdown).buttons
					? { fill: null, position: 'start', color: 'light', ...action }
					: action
			)
	});

	// NOTE: Control access value

	writeValue(value: Array<T> | T | null = []): void {
		// Single mode is written with a bare value because that is what it emits; the internal
		// bookkeeping stays a list either way, so nothing below has to know which mode it is in.
		this.value = Array.isArray(value) ? [...value] : value == null ? [] : [value as T];
		this.applySelectionFromValue(this.form.controls, this.value);

		// The form calls this from outside our own change detection, and the single-mode radio
		// is a plain `[checked]` binding rather than a `formControlName` — which writes to the
		// DOM itself and so never needed this. Without the mark, patching the control from the
		// consumer's form moves the selection and repaints nothing.
		this.#cdr.markForCheck();
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouch = fn;
	}

	setDisabledState?(isDisabled: boolean): void {
		this.isDisabled = isDisabled;

		// Through the form, not through a `[disabled]` binding: the checkbox is a reactive
		// control, and Angular ignores that binding on one (it warns and carries on, so the
		// box stayed live). Disabling the array reaches every `selected` inside it, however
		// deep, and the radio — which is not a reactive control — reads the flag directly.
		isDisabled ? this.form.disable({ emitEvent: false }) : this.form.enable({ emitEvent: false });

		this.#cdr.markForCheck();
	}

	/**
	 * Handles the action to be executed in a batch
	 *
	 * @param {Event} event
	 * @memberof PaginableTableComponent
	 */
	handleBatchAction(event: any) {
		const handler = event.handler as ((items: ReadonlyArray<T>) => void) | undefined;
		handler?.(this.value);
	}

	/**
	 * Returns normalized CSS classes for list batch action buttons.
	 * Ensures a default BEM class is present when no list-specific class is provided.
	 *
	 * @param action Batch action button definition.
	 * @returns List of CSS class names to bind in template.
	 */
	getBatchActionClassList(action: PaginableActionButton): Array<string> {
		const normalized = this.normalizeClassList(action.classlist);
		if (!normalized.some((item) => item.startsWith('hub-list__'))) {
			return ['hub-list__batch-action-btn--default', ...normalized];
		}
		return normalized;
	}

	buildForm(form: FormArray, items: ReadonlyArray<any>) {
		form.clear();
		for (const index in items) {
			if (Object.prototype.hasOwnProperty.call(items, index)) {
				const item = items[index];

				const group = this.#fb.group({
					selected: [false],
					collapsed: [this.options().collapsed],
					data: [item],
					children: this.#fb.array([])
				});

				group.patchValue(item);

				if (item[this.bindChildren()]?.length) {
					this.buildForm(group.get('children') as FormArray, item[this.bindChildren()]);
					// newItem['children'] = this.buildValue(children);
				}
				form.push(group);
			}
		}
	}

	/**
	 * Returns the visible controls for the current page in root level.
	 * Nested controls are intentionally not paginated.
	 */
	getVisibleControls(controls: ReadonlyArray<AbstractControl>, isRoot: boolean): ReadonlyArray<AbstractControl> {
		if (!isRoot) {
			return controls;
		}

		const kept = controls.filter((control) => this.#matches((control as any).get('data')?.value));

		if (!this.paginate()) {
			return kept;
		}

		const { start, end } = this.getSliceRange(kept.length);
		return kept.slice(start, end);
	}

	/**
	 * Returns the visible items for the current page in root level.
	 * Nested items are intentionally not paginated.
	 */
	getVisibleItems(items: ReadonlyArray<any>, isRoot: boolean): ReadonlyArray<any> {
		if (!isRoot) {
			return items;
		}

		// The same predicate the controls are filtered by, in the same order, so the two
		// collections the template walks in parallel keep the same indices.
		const kept = items.filter((item) => this.#matches(item));

		if (!this.paginate()) {
			return kept;
		}

		const { start, end } = this.getSliceRange(kept.length);
		return kept.slice(start, end);
	}

	/**
	 * Whether an item survives the current search.
	 *
	 * A group survives when any of its descendants does: hiding a building because its name
	 * does not contain the term would hide the room that does.
	 */
	#matches(item: any): boolean {
		const term = (this.searchTerm() ?? '').trim().toLowerCase();

		if (!term || !this.options().searchable) {
			return true;
		}

		const searchFn = this.searchFn();

		if (searchFn) {
			return searchFn(item as T, term) || (item?.[this.bindChildren()] ?? []).some((child: any) => this.#matches(child));
		}

		const label = this.bindLabel() ? getValue(item, this.bindLabel()) : item;
		const haystack = (label ?? item) == null ? '' : String(label ?? JSON.stringify(item));

		return (
			haystack.toLowerCase().includes(term) ||
			(item?.[this.bindChildren()] ?? []).some((child: any) => this.#matches(child))
		);
	}

	/**
	 * A row was ticked: carry the answer down if it has children, then publish.
	 *
	 * A group's checkbox used to select the group and nothing else, so its own value entered
	 * the array beside its children's — and a heading is not a datum. Ticking a building
	 * meant "the building", which nobody can book. It now means what it looks like it means:
	 * everything under it.
	 */
	onGroupSelectionChange(group: AbstractControl): void {
		if (this.isDisabled) {
			return;
		}

		const children = (group.get('children') as FormArray | null)?.controls ?? [];

		if (children.length) {
			this.#setSubtree(children, !!group.get('selected')?.value);
		}

		this.onSelectionChange();
	}

	/** Tick or untick every row under this one, however deep. */
	#setSubtree(controls: ReadonlyArray<AbstractControl>, selected: boolean): void {
		for (const control of controls) {
			control.get('selected')?.setValue(selected, { emitEvent: false });

			const children = (control.get('children') as FormArray | null)?.controls ?? [];

			if (children.length) {
				this.#setSubtree(children, selected);
			}
		}
	}

	/**
	 * Whether a group holds some of its children but not all.
	 *
	 * The third state a checkbox has and a boolean does not. Without it, a building with one
	 * room chosen looks exactly like a building with none.
	 */
	isPartiallySelected(group: AbstractControl): boolean {
		const children = (group.get('children') as FormArray | null)?.controls ?? [];

		if (!children.length) {
			return false;
		}

		const leaves = this.#leavesOf(children);
		const chosen = leaves.filter((leaf) => !!leaf.get('selected')?.value).length;

		return chosen > 0 && chosen < leaves.length;
	}

	/** Every row under this one that has no children of its own. */
	#leavesOf(controls: ReadonlyArray<AbstractControl>): AbstractControl[] {
		const leaves: AbstractControl[] = [];

		for (const control of controls) {
			const children = (control.get('children') as FormArray | null)?.controls ?? [];
			children.length ? leaves.push(...this.#leavesOf(children)) : leaves.push(control);
		}

		return leaves;
	}

	/**
	 * Handles item selection changes and propagates selected values through ControlValueAccessor.
	 */
	onSelectionChange(): void {
		if (this.isDisabled) {
			return;
		}

		this.value = this.collectSelectedValues(this.form.controls);

		// Single answers with the value, not with a list of one. `hub-select` reads the same
		// way, and a consumer asking "which one" should not have to reach for `[0]` and then
		// tell an empty array apart from a missing answer.
		this.onChange(this.singleSelectable() ? (this.value[0] ?? null) : this.value);
		this.onTouch();
	}

	/**
	 * Selects one row, releasing whatever was selected before.
	 *
	 * The clearing is what makes it single, and it runs over the whole tree rather than over
	 * the visible page: a selection the reader paged away from is still a selection.
	 *
	 * @param group - Form group backing the row that was picked.
	 */
	onSingleSelect(group: AbstractControl): void {
		if (this.isDisabled) {
			return;
		}

		const value = this.resolveValue(group.get('data')?.value);

		this.applySelectionFromValue(this.form.controls, [value]);
		this.onSelectionChange();
	}

	/**
	 * Names a selection control for a screen reader.
	 *
	 * The row's own content is the visible label, but it is projected through a template the
	 * list cannot see into, so it cannot be pointed at with `aria-labelledby`.
	 *
	 * @param data - The row's underlying item.
	 */
	resolveSelectionLabel(data: any): string | null {
		const label = getValue(data, this.bindLabel());
		return label == null ? null : String(label);
	}

	/**
	 * Handles per-page changes and resets pagination to the first page.
	 */
	onPerPageChange(event: Event | number): void {
		const normalizedValue = typeof event === 'number' ? event : Number((event.target as HTMLSelectElement | null)?.value);

		if (!Number.isFinite(normalizedValue) || normalizedValue <= 0) {
			return;
		}

		this.perPage.set(normalizedValue);
		this.page.set(1);
	}

	buildValue(items: ReadonlyArray<T>): Array<T & { collapsed: boolean }> {
		const value: Array<T & { collapsed: boolean }> = [];
		for (const item of items) {
			const { children, ...newItem } = item as any;
			if (children?.length) {
				newItem['children'] = this.buildValue(children);
			}
			value.push({
				...newItem,
				collapsed: true
			});
		}
		return value;
	}

	toggleCollapsed(control: FormControl) {
		control.patchValue(!control.value);
	}

	/**
	 * Emits a structured click event for the clicked list item, including metadata and state.
	 *
	 * This method is typically called when an item in the list is clicked. It extracts contextual
	 * information such as depth, index, selection state, and expansion state, then passes it to
	 * the user-defined `clickFn` callback.
	 *
	 * If a `bindLabel` is configured, the emitted `value` will be derived from that property;
	 * otherwise, the full item will be passed as `value`.
	 *
	 * @param item - The list item object, including `selected` and `collapsed` state.
	 * @param depth - The nesting depth of the item within a tree structure (0 = root level).
	 * @param index - The position of the item in the current visible list or page.
	 * @param event - The native `MouseEvent` that triggered the click.
	 *
	 * @remarks
	 * If the `clickFn` callback is not defined, the method exits early and no event is emitted.
	 */
	onItemClick({ collapsed, selected, data, children }: any, depth: number, index: number, event: MouseEvent) {
		const clickFn = this.clickFn();
		if (!clickFn) {
			return;
		}

		// `data` is the row. What used to travel here was the form group wrapping it —
		// `{selected, collapsed, data, children}` — while `ListClickEvent<T>` promised `T`,
		// so a consumer reading `event.item.<field>` by the types got `undefined`: no error,
		// no warning, every guard silently false. The wrapper's other halves already have
		// fields of their own on the event, so nothing is lost by handing over the row.
		const bindLabel = this.bindLabel();
		clickFn({
			depth,
			index,
			selected,
			collapsed,
			// The label, as `bindLabel` names it. It read the wrapper before, so it was
			// `undefined` for every consumer who had not set `bindLabel` to `'data'`.
			value: bindLabel ? getValue(data, bindLabel) : data,
			item: data as T,
			children: (children ?? []).map((child: any) => child?.data),
			mouseEvent: event
		});
	}

	onPageClicked(page: number) {
		// if (!this.data) {
		// 	return;
		// }
		// this.data.currentPage = page;
		// this.triggerTheParamChanges();
	}

	/**
	 * Run the search the box holds.
	 *
	 * Its body was entirely commented out, so the box the component rendered filtered
	 * nothing: submitting did no work and reported none. It publishes the term now and
	 * returns to the first page, because staying on page four of a list that just became
	 * three rows long shows an empty list, which reads as "nothing matched".
	 */
	filter(): void {
		this.searchTerm.set(this.searchFG?.value ?? '');
		this.page.set(1);
	}

	/**
	 * Returns the total amount of items considering explicit totalItems or local items length.
	 */
	getEffectiveTotalItems(): number {
		return this.totalItems() || this.#filteredItems().length;
	}

	/** The root items the current search leaves, which is what the paging counts. */
	#filteredItems(): ReadonlyArray<any> {
		return (this.renderedItems() ?? []).filter((item: any) => this.#matches(item));
	}

	private getSliceRange(total: number): { start: number; end: number } {
		const perPage = Math.max(1, this.perPage() || total || 1);
		const page = Math.max(1, this.page() || 1);
		const start = (page - 1) * perPage;
		const end = start + perPage;
		return { start, end };
	}

	/**
	 * Returns the absolute index of the first item rendered on the current root page.
	 *
	 * @returns The slice start offset (0 when pagination is disabled).
	 */
	getRootSliceStart(): number {
		return this.paginate() ? this.getSliceRange(this.renderedItems().length).start : 0;
	}

	/**
	 * Returns a stable tracking key for list rendering.
	 *
	 * @param item Current rendered item.
	 * @param index Positional fallback when no stable key exists.
	 * @returns Tracking key used by Angular control flow.
	 */
	protected getTrackKey(item: any, index: number): string | number {
		if (!item) {
			return index;
		}

		const bindValue = this.bindValue();
		if (bindValue) {
			const resolved = getValue(item, bindValue);
			if (resolved != null) {
				return resolved;
			}
		}

		if (item.id != null) {
			return item.id;
		}

		return index;
	}

	// NOTE: Drag & drop

	/**
	 * Maps a rendered (slice-relative) index to its absolute index in the underlying
	 * collection, accounting for root pagination.
	 *
	 * @param visibleIndex Index within the rendered slice.
	 * @param isRoot Whether the row belongs to the paginated root collection.
	 * @returns The absolute index.
	 */
	protected absoluteIndex(visibleIndex: number, isRoot: boolean): number {
		return isRoot ? toAbsoluteIndex(visibleIndex, this.getRootSliceStart()) : visibleIndex;
	}

	/**
	 * Builds (and registers, for Pointer Events hit-testing) the drag container reference for
	 * a rendered collection.
	 *
	 * @param controlsForm The full `FormArray` backing the collection.
	 * @param itemsFull The full data array backing the collection.
	 * @param parentItem The parent item owning the collection, or `null` for the root.
	 * @param depth Nesting depth.
	 * @returns The container reference.
	 */
	protected makeContainerRef(
		controlsForm: FormArray,
		itemsFull: any[],
		parentItem: any,
		depth: number
	): ListDragContainerRef {
		const key = depth === 0 ? `${this._listId}:root` : `${this._listId}:${depth}:${this.getTrackKey(parentItem, depth)}`;
		const ref: ListDragContainerRef = {
			key,
			ownerId: this._listId,
			group: this.dragGroup(),
			items: itemsFull ?? [],
			form: controlsForm,
			parentItem: parentItem ?? null,
			depth
		};
		this.#containers.set(key, ref);
		return ref;
	}

	/**
	 * Returns whether reordering is enabled for a row.
	 *
	 * @param item The row item.
	 * @returns `true` when the row can be dragged.
	 */
	protected isDragEnabled(item: any): boolean {
		return this.sortable() && !this.isRowDisabled(item);
	}

	/**
	 * Returns whether a row is explicitly non-draggable via `sortDisabled`.
	 *
	 * @param item The row item.
	 * @returns `true` when the row is disabled for dragging.
	 */
	protected isRowDisabled(item: any): boolean {
		const fn = this.sortDisabled();
		return typeof fn === 'function' ? !!fn(item) : false;
	}

	/**
	 * Returns whether a row is currently being dragged (native/pointer/keyboard).
	 *
	 * @param item The row item.
	 * @returns `true` when the row is the active drag item.
	 */
	protected isRowDragging(item: any): boolean {
		return this.dragService.active()?.item === item || this.#keyboardDrag?.item === item;
	}

	/**
	 * Returns the absolute placeholder gap index for a container, or `null` when no
	 * placeholder should render in it.
	 *
	 * @param controlsForm The collection's `FormArray`.
	 * @returns The gap index, or `null`.
	 */
	#placeholderGap(controlsForm: FormArray): number | null {
		const target = this.dragService.target();
		if (!target || (target.container as ListDragContainerRef).form !== controlsForm) {
			return null;
		}
		if (target.atEnd) {
			return target.container.items.length;
		}
		return target.position === 'after' ? target.index + 1 : target.index;
	}

	/**
	 * Returns whether the placeholder should render before the row at the given absolute index.
	 *
	 * @param controlsForm The collection's `FormArray`.
	 * @param absoluteIndex Absolute index of the row.
	 * @returns `true` when a placeholder belongs before the row.
	 */
	protected showPlaceholderBefore(controlsForm: FormArray, absoluteIndex: number): boolean {
		return this.#placeholderGap(controlsForm) === absoluteIndex;
	}

	/**
	 * Returns whether the placeholder should render after the last visible row of a container.
	 *
	 * @param controlsForm The collection's `FormArray`.
	 * @param isRoot Whether the collection is the paginated root.
	 * @param visibleCount Number of rendered rows.
	 * @returns `true` when a placeholder belongs at the end.
	 */
	protected showPlaceholderAtEnd(controlsForm: FormArray, isRoot: boolean, visibleCount: number): boolean {
		const gap = this.#placeholderGap(controlsForm);
		if (gap === null) {
			return false;
		}
		const endIndex = isRoot ? this.getRootSliceStart() + visibleCount : visibleCount;
		return gap === endIndex;
	}

	/**
	 * Determines whether a drag may start from the given pointer/drag event, honouring drag
	 * handles declared in the item template.
	 *
	 * @param event The triggering event.
	 * @param li The row element.
	 * @returns `true` when the gesture may start a drag.
	 */
	#canStartDrag(event: Event, li: HTMLElement): boolean {
		const handles = Array.from(li.querySelectorAll('.hub-list__drag-handle')).filter(
			(handle) => handle.closest('.hub-list__item') === li
		);
		if (!handles.length) {
			return true;
		}
		const targetHandle = (event.target as HTMLElement).closest('.hub-list__drag-handle');
		return !!targetHandle && targetHandle.closest('.hub-list__item') === li;
	}

	/**
	 * Returns whether an event originated on an interactive control (checkbox, button, link…).
	 *
	 * @param event The triggering event.
	 * @returns `true` when the target is interactive.
	 */
	#isInteractiveTarget(event: Event): boolean {
		return !!(event.target as HTMLElement).closest('input, button, a, select, textarea');
	}

	/**
	 * Returns whether an event belongs to the given row rather than to one of its descendant
	 * rows in a nested list. Drag/pointer/keyboard events bubble through ancestor `<li>`s, and
	 * each `<li>` carries the same handlers; this keeps only the innermost row acting.
	 *
	 * @param event The triggering event.
	 * @param li The row element the handler is bound to.
	 * @returns `true` when the event's closest item is exactly this row.
	 */
	#isEventForRow(event: Event, li: HTMLElement): boolean {
		return (event.target as HTMLElement).closest('.hub-list__item') === li;
	}

	/**
	 * Records the start of a drag in the coordinator.
	 *
	 * @param container Source container.
	 * @param index Absolute source index.
	 * @param item The dragged item.
	 * @param mode Transport driving the gesture.
	 */
	#beginDrag(container: ListDragContainerRef, index: number, item: any, mode: DragPointerMode): void {
		this.dragService.begin({
			sourceId: this._listId,
			sourceGroup: this.dragGroup(),
			item,
			sourceContainer: container,
			sourceIndex: index,
			pointerMode: mode
		});
	}

	/**
	 * Returns whether dropping into the given container is forbidden (own subtree cycle or a
	 * group mismatch).
	 *
	 * @param container Candidate destination container.
	 * @returns `true` when the drop must be rejected.
	 */
	#forbidsDrop(container: ListDragContainerRef): boolean {
		const active = this.dragService.active();
		if (!active) {
			return true;
		}
		return containsNode(active.item, container.parentItem, this.bindChildren());
	}

	/**
	 * Native HTML5 `dragstart` handler.
	 *
	 * @param event Drag event.
	 * @param container Source container.
	 * @param absoluteIndex Absolute source index.
	 * @param item Dragged item.
	 */
	onDragStart(event: DragEvent, container: ListDragContainerRef, absoluteIndex: number, item: any): void {
		const li = event.currentTarget as HTMLElement;
		// In nested lists the event bubbles through ancestor items; only the source item acts.
		if (!this.#isEventForRow(event, li)) {
			return;
		}
		// `dragstart.target` is the draggable `<li>`, never the pressed descendant, so the
		// handle gate is evaluated on `pointerdown` (see `onPointerDown`) and consulted here.
		if (!this.sortable() || this.isRowDisabled(item) || this.#dragStartLi !== li) {
			event.preventDefault();
			return;
		}
		this.#dragStartLi = null;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('application/x-hub-list', this._listId);
		}
		this.#beginDrag(container, absoluteIndex, item, 'native');
		this.#applyNativeDragImage(event, item);
		this.#cdr.markForCheck();
	}

	/**
	 * Native HTML5 `dragover`/`dragenter` handler. Computes and publishes the drop target.
	 *
	 * @param event Drag event.
	 * @param container Hovered container.
	 * @param absoluteIndex Absolute index of the hovered row.
	 */
	onDragOver(event: DragEvent, container: ListDragContainerRef, absoluteIndex: number): void {
		if (!this.dragService.isDragging()) {
			return;
		}
		const li = event.currentTarget as HTMLElement;
		// In nested lists the event bubbles through ancestor items; only the innermost hovered
		// item must compute the target (otherwise an ancestor would clobber it).
		if (!this.#isEventForRow(event, li)) {
			return;
		}
		if (!this.dragService.canDrop(this._listId) || this.#forbidsDrop(container)) {
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = 'none';
			}
			return;
		}
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
		const rect = li.getBoundingClientRect();
		const isCards = container.depth === 0 && this.isCardsDisplay();
		const position = resolveDropPosition(event.clientX, event.clientY, rect, isCards ? 'grid' : 'vertical', this.isRtl());
		this.dragService.setTarget({ ownerId: this._listId, container, index: absoluteIndex, position, atEnd: false });
	}

	/**
	 * Native HTML5 `dragover` handler on the collection element. Handles the empty-collection
	 * case so an empty list (e.g. in a group) is still a valid drop target.
	 *
	 * @param event Drag event.
	 * @param container Hovered container.
	 */
	onContainerDragOver(event: DragEvent, container: ListDragContainerRef): void {
		if (!this.dragService.isDragging()) {
			return;
		}
		if (!this.dragService.canDrop(this._listId) || this.#forbidsDrop(container)) {
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = 'none';
			}
			return;
		}
		// Allow dropping anywhere over the collection — including the gaps and the placeholder
		// slot (the placeholder is `pointer-events: none`, so its hovers reach this `<ul>`).
		// This is what lets a drop "stay" when released on the prospective slot.
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
		if (container.items.length === 0) {
			// Empty collection: no items to hover, so target the start.
			this.dragService.setTarget({ ownerId: this._listId, container, index: 0, position: 'before', atEnd: true });
		}
		// Non-empty: keep the precise target set by the most recent item-level `dragover`.
	}

	/**
	 * Native HTML5 `drop` handler on a row.
	 *
	 * @param event Drag event.
	 */
	onDrop(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
		this.#commitDrop();
	}

	/**
	 * Native HTML5 `drop` handler on the collection element (empty-collection case).
	 *
	 * @param event Drag event.
	 */
	onContainerDrop(event: DragEvent): void {
		event.preventDefault();
		this.#commitDrop();
	}

	/**
	 * Native HTML5 `dragend` handler. Restores state and removes the custom drag image.
	 */
	onDragEnd(): void {
		this.#dragImageCleanup?.();
		this.#dragImageCleanup = null;
		this.dragService.end();
		this.#cdr.markForCheck();
	}

	/**
	 * Pointer Events `pointerdown` handler — the touch/pen drag fallback. Mouse pointers are
	 * ignored so native drag-and-drop drives the desktop experience.
	 *
	 * @param event Pointer event.
	 * @param container Source container.
	 * @param absoluteIndex Absolute source index.
	 * @param item Dragged item.
	 */
	onPointerDown(event: PointerEvent, container: ListDragContainerRef, absoluteIndex: number, item: any): void {
		const li = event.currentTarget as HTMLElement;
		// In nested lists the event bubbles through ancestor items; only the innermost pressed
		// item arms, so an ancestor never overwrites `#dragStartLi`.
		if (!this.#isEventForRow(event, li)) {
			return;
		}
		if (!this.sortable() || this.isRowDisabled(item)) {
			this.#dragStartLi = null;
			return;
		}
		const onHandle = !!(event.target as HTMLElement).closest('.hub-list__drag-handle');
		// `pointerdown` sees the real pressed element, so the handle/interactive gate is resolved
		// here and remembered for the upcoming native `dragstart` (whose target is the `<li>`).
		const allowed = (!this.#isInteractiveTarget(event) || onHandle) && this.#canStartDrag(event, li);
		this.#dragStartLi = allowed ? li : null;
		if (event.pointerType === 'mouse') {
			// Desktop pointers use the native HTML5 drag-and-drop path.
			return;
		}
		if (!allowed) {
			return;
		}
		this.#pointerSession = createPointerDragSession({
			startEvent: event,
			sourceEl: li,
			ghostFactory: () => this.#buildPointerGhost(li, item),
			onStart: () => {
				this.#beginDrag(container, absoluteIndex, item, 'pointer');
				this.#cdr.markForCheck();
			},
			onMove: (x, y) => this.#onPointerMove(x, y),
			onDrop: (x, y) => this.#onPointerDrop(x, y),
			onCancel: () => {
				this.dragService.end();
				this.#cdr.markForCheck();
			},
			onEnd: () => {
				this.#pointerSession = null;
				this.#cdr.markForCheck();
			}
		});
	}

	/**
	 * Updates the drop target while a Pointer Events drag is moving.
	 *
	 * @param clientX Pointer X.
	 * @param clientY Pointer Y.
	 */
	#onPointerMove(clientX: number, clientY: number): void {
		const active = this.dragService.active();
		if (!active) {
			return;
		}
		const target = this.dragService.resolveTargetAt(clientX, clientY);
		if (target && !containsNode(active.item, target.container.parentItem, this.bindChildren())) {
			this.dragService.setTarget(target);
		} else {
			this.dragService.setTarget(null);
		}
		this.#cdr.markForCheck();
	}

	/**
	 * Commits a Pointer Events drop by delegating to the destination list.
	 *
	 * @param clientX Pointer X.
	 * @param clientY Pointer Y.
	 */
	#onPointerDrop(clientX: number, clientY: number): void {
		this.#onPointerMove(clientX, clientY);
		const target = this.dragService.target();
		if (target) {
			this.dragService.requestCommit(target.ownerId);
		} else {
			this.dragService.end();
		}
		this.#cdr.markForCheck();
	}

	/**
	 * Builds the floating ghost element for the Pointer Events fallback.
	 *
	 * @param li The row element.
	 * @param item The dragged item.
	 * @returns The ghost element.
	 */
	#buildPointerGhost(li: HTMLElement, item: any): HTMLElement {
		const template = this.previewTpt();
		let ghost: HTMLElement;
		if (template) {
			const view = template.createEmbeddedView({ item });
			view.detectChanges();
			ghost = document.createElement('div');
			view.rootNodes.forEach((node: Node) => ghost.appendChild(node));
		} else {
			ghost = li.cloneNode(true) as HTMLElement;
		}
		// The ghost is mounted on <body>, outside this component's emulated encapsulation,
		// so the design tokens are read from the source row and applied inline.
		const styles = getComputedStyle(li);
		ghost.style.opacity = styles.getPropertyValue('--hub-list-ghost-opacity').trim() || '0.85';
		ghost.style.boxShadow =
			styles.getPropertyValue('--hub-list-ghost-shadow').trim() || '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
		return ghost;
	}

	/**
	 * Renders the custom drag preview off-screen and assigns it as the native drag image.
	 *
	 * @param event Drag event.
	 * @param item The dragged item.
	 */
	#applyNativeDragImage(event: DragEvent, item: any): void {
		const template = this.previewTpt();
		if (!template || !event.dataTransfer || typeof event.dataTransfer.setDragImage !== 'function') {
			return;
		}
		const view = template.createEmbeddedView({ item });
		view.detectChanges();
		const node = view.rootNodes.find((candidate: Node) => candidate.nodeType === Node.ELEMENT_NODE) as
			HTMLElement | undefined;
		if (!node) {
			view.destroy();
			return;
		}
		const holder = document.createElement('div');
		holder.style.position = 'fixed';
		holder.style.top = '-9999px';
		holder.style.left = '-9999px';
		holder.appendChild(node);
		document.body.appendChild(holder);
		event.dataTransfer.setDragImage(node, 0, 0);
		this.#dragImageCleanup = () => {
			view.destroy();
			holder.remove();
		};
	}

	/**
	 * Resolves the drop target inside this list from a DOM element and pointer coordinates
	 * (used by the Pointer Events coordinator, including cross-list hovers).
	 *
	 * @param element Element under the pointer.
	 * @param clientX Pointer X.
	 * @param clientY Pointer Y.
	 * @returns The resolved target, or `null`.
	 */
	resolveTarget(element: HTMLElement, clientX: number, clientY: number): DragTarget | null {
		const ul = element.closest('.hub-list__items') as HTMLElement | null;
		const containerKey = ul?.getAttribute('data-hub-container-key');
		const container = containerKey ? this.#containers.get(containerKey) : null;
		if (!ul || !container || this.#forbidsDrop(container)) {
			return null;
		}
		const li = element.closest('.hub-list__item') as HTMLElement | null;
		if (!li || li.closest('.hub-list__items') !== ul || li.classList.contains('hub-list__item--empty')) {
			return { ownerId: this._listId, container, index: container.items.length, position: 'after', atEnd: true };
		}
		const indexAttr = li.getAttribute('data-hub-index');
		const index = indexAttr != null ? Number(indexAttr) : container.items.length;
		const rect = li.getBoundingClientRect();
		const isCards = container.depth === 0 && this.isCardsDisplay();
		const position = resolveDropPosition(clientX, clientY, rect, isCards ? 'grid' : 'vertical', this.isRtl());
		return { ownerId: this._listId, container, index, position, atEnd: false };
	}

	/**
	 * Commits the pending drop as the destination list: mutates the data array and the
	 * `FormArray` (in-list move or cross-list transfer), refreshes the affected views and
	 * emits the `sorted` event. Only the destination list performs the commit and emission.
	 */
	#commitDrop(): void {
		const active = this.dragService.active();
		const target = this.dragService.target();
		if (!active || !target || target.ownerId !== this._listId || !this.dragService.canDrop(this._listId)) {
			this.dragService.end();
			return;
		}
		const source = active.sourceContainer as ListDragContainerRef;
		const dest = target.container as ListDragContainerRef;
		if (this.#forbidsDrop(dest)) {
			this.dragService.end();
			return;
		}
		const sameContainer = source.form === dest.form;
		const fromIndex = active.sourceIndex;
		const item = source.items[fromIndex];
		if (item === undefined) {
			this.dragService.end();
			return;
		}
		const toIndex = target.atEnd
			? dest.items.length
			: computeTargetIndex(target.index, target.position === 'after', sameContainer, fromIndex);

		if (sameContainer) {
			moveItemInArray(dest.items, fromIndex, toIndex);
			moveControlInFormArray(dest.form, fromIndex, toIndex);
		} else {
			transferArrayItem(source.items, dest.items, fromIndex, toIndex);
			transferControlBetweenFormArrays(source.form, dest.form, fromIndex, toIndex);
		}

		const currentIndex = dest.items.indexOf(item);
		const event: ListSortEvent<T> = {
			previousIndex: fromIndex,
			currentIndex: currentIndex < 0 ? toIndex : currentIndex,
			item,
			items: [...dest.items],
			isTransfer: !sameContainer,
			previousGroup: active.sourceGroup,
			group: this.dragGroup(),
			previousItems: sameContainer ? undefined : [...source.items],
			depth: dest.depth,
			parentItem: dest.parentItem
		};

		this.#refreshSelf();
		if (!sameContainer) {
			this.dragService.refreshSource(active.sourceId);
		}
		this.dragService.end();
		this.sorted.emit(event);
	}

	/**
	 * Keyboard reorder handler bound to the focusable row.
	 *
	 * @param event Keyboard event.
	 * @param container The row's container.
	 * @param absoluteIndex Absolute index of the row.
	 * @param item The row item.
	 */
	onItemKeydown(event: KeyboardEvent, container: ListDragContainerRef, absoluteIndex: number, item: any): void {
		if (!this.keyboardSortable() || !this.sortable() || this.isRowDisabled(item)) {
			return;
		}
		// In nested lists the keydown bubbles through ancestor items; only the focused item acts.
		if (!this.#isEventForRow(event, event.currentTarget as HTMLElement)) {
			return;
		}
		const grab = this.#keyboardDrag;
		const key = event.key;

		if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
			event.preventDefault();
			if (!grab) {
				this.#keyboardDrag = { container, index: absoluteIndex, originalIndex: absoluteIndex, item };
				this.#announce('DRAG_PICKED_UP', { index: absoluteIndex + 1, total: container.items.length });
			} else {
				this.#announce('DRAG_DROPPED_AT', { index: grab.index + 1, total: grab.container.items.length });
				this.#emitKeyboardSorted(grab);
				this.#keyboardDrag = null;
			}
			this.#cdr.markForCheck();
			return;
		}

		if (!grab) {
			return;
		}

		if (key === 'Escape') {
			event.preventDefault();
			this.#cancelKeyboardDrag(grab);
			return;
		}

		const isCards = container.depth === 0 && this.isCardsDisplay();
		let delta = 0;
		if (key === 'ArrowUp' || (isCards && key === 'ArrowLeft')) {
			delta = -1;
		} else if (key === 'ArrowDown' || (isCards && key === 'ArrowRight')) {
			delta = 1;
		} else {
			return;
		}

		event.preventDefault();
		const from = grab.index;
		const to = Math.max(0, Math.min(grab.container.items.length - 1, from + delta));
		if (to === from) {
			return;
		}
		moveItemInArray(grab.container.items, from, to);
		moveControlInFormArray(grab.container.form, from, to);
		grab.index = to;
		this.#refreshSelf();
		this.#announce('DRAG_MOVED_TO', { index: to + 1, total: grab.container.items.length });
	}

	/**
	 * Emits the `sorted` event for a completed keyboard reorder.
	 *
	 * @param grab The keyboard drag state.
	 */
	#emitKeyboardSorted(grab: KeyboardDragState): void {
		const currentIndex = grab.container.items.indexOf(grab.item);
		this.sorted.emit({
			previousIndex: grab.originalIndex,
			currentIndex: currentIndex < 0 ? grab.index : currentIndex,
			item: grab.item,
			items: [...grab.container.items],
			isTransfer: false,
			previousGroup: this.dragGroup(),
			group: this.dragGroup(),
			depth: grab.container.depth,
			parentItem: grab.container.parentItem
		});
	}

	/**
	 * Cancels an in-progress keyboard reorder, restoring the original position.
	 *
	 * @param grab The keyboard drag state.
	 */
	#cancelKeyboardDrag(grab: KeyboardDragState): void {
		if (grab.index !== grab.originalIndex) {
			moveItemInArray(grab.container.items, grab.index, grab.originalIndex);
			moveControlInFormArray(grab.container.form, grab.index, grab.originalIndex);
			this.#refreshSelf();
		}
		this.#announce('DRAG_CANCELLED');
		this.#keyboardDrag = null;
		this.#cdr.markForCheck();
	}

	/**
	 * Sets the screen-reader announcement.
	 *
	 * @param key Translation key.
	 * @param params Interpolation params.
	 */
	#announce(key: string, params?: Record<string, unknown>): void {
		this.#announcement.set({ key, params });
	}

	/**
	 * Re-renders this list after an in-place mutation of its data/form (drag reorder).
	 */
	#refreshSelf(): void {
		this.renderedItems.update((items: any) => (Array.isArray(items) ? [...items] : items));
		this.#cdr.markForCheck();
	}

	private collectSelectedValues(controls: ReadonlyArray<AbstractControl>): Array<any> {
		const selectedValues: Array<any> = [];

		for (const control of controls) {
			const group = control as any;
			const isSelected = !!group.get('selected')?.value;
			const data = group.get('data')?.value;
			const children = (group.get('children') as FormArray | null)?.controls ?? [];

			// A group's own tick is the state of its children, not a value of its own: a
			// building is a heading and nobody books it. Only leaves travel.
			if (isSelected && !children.length) {
				selectedValues.push(this.resolveValue(data));
			}

			if (children.length) {
				selectedValues.push(...this.collectSelectedValues(children));
			}
		}

		return selectedValues;
	}

	private applySelectionFromValue(controls: ReadonlyArray<AbstractControl>, selectedValues: ReadonlyArray<any>): void {
		for (const control of controls) {
			const group = control as any;
			const data = group.get('data')?.value;
			const value = this.resolveValue(data);
			const selected = selectedValues.some((selectedValue) => this.isEqual(selectedValue, value));

			group.get('selected')?.setValue(selected, { emitEvent: false });

			const children = (group.get('children') as FormArray | null)?.controls ?? [];
			if (children.length) {
				this.applySelectionFromValue(children, selectedValues);
			}
		}
	}

	private resolveValue(data: any): any {
		const bindValue = this.bindValue();
		return bindValue ? getValue(data, bindValue) : data;
	}

	private isEqual(a: any, b: any): boolean {
		if (a === b) {
			return true;
		}
		if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
			return JSON.stringify(a) === JSON.stringify(b);
		}
		return false;
	}

	/**
	 * Returns the class for a given row.
	 *
	 * @param {T} item The item for which to get the class.
	 * @returns {string} The class to apply to the row.
	 * @memberof ListComponent
	 */
	_getRowClass(item: T): string {
		const rowClass = this.rowClass();
		if (typeof rowClass === 'function') {
			return rowClass(item);
		} else if (typeof rowClass === 'string') {
			return rowClass;
		}
		return '';
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

export { ListComponent as PaginableListComponent };
