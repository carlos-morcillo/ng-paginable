import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	TemplateRef,
	booleanAttribute,
	computed,
	contentChild,
	contentChildren,
	effect,
	forwardRef,
	inject,
	input,
	model,
	signal,
	viewChildren
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
	AbstractControl,
	FormGroup,
	FormsModule,
	NG_VALUE_ACCESSOR,
	ReactiveFormsModule,
	UntypedFormBuilder
} from '@angular/forms';
import {
	debouncedSignal,
	generateUniqueId,
	GetPipe,
	HUB_TRANSLATION_PREFIX,
	IsObservablePipe,
	resolveHubAccent,
	TranslatePipe,
	UcfirstPipe,
	UnwrapAsyncPipe
} from 'ng-hub-ui-utils';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged, isObservable, of } from 'rxjs';
import { TableBreakpoint } from '../../constants/breakpoints';
import { PaginableStateDefault } from '../../interfaces/paginable-state';
import { PaginableDefaultsService } from '../../services/paginable-defaults.service';
import { PaginableService } from '../../services/paginable.service';
import { TableClientDataService } from '../../services/table-client-data.service';
import { PaginableStateOutlet } from '../state-outlet/paginable-state-outlet.component';
import { PaginableNoResultsDirective } from '../../directives/paginable-no-results.directive';
import { PaginableTableCellDirective } from '../../directives/paginable-table-cell.directive';
import { PaginableErrorDirective } from '../../directives/paginable-error.directive';
import { PaginableTableExpandingRowDirective } from '../../directives/paginable-table-expanding-row.directive';
import { PaginableTableFilterDirective } from '../../directives/paginable-table-filter.directive';
import { PaginableTableHeaderDirective } from '../../directives/paginable-table-header.directive';
import { PaginableLoadingDirective } from '../../directives/paginable-loading.directive';
import { PaginableTableRowDirective } from '../../directives/paginable-table-row.directive';
import { HubStickyColumnsDirective } from '../../directives/paginable-sticky-columns.directive';
import { SelectionTypes } from '../../enums/selection-types';
import { PaginableActionButton, TableRowEvent } from '../../interfaces';
import { PaginableTableDropdown } from '../../interfaces/paginable-table-dropdown';
import { PaginableTableHeader } from '../../interfaces/paginable-table-header';
import { PaginableTableOptions } from '../../interfaces/paginable-table-options';
import { PaginableTableOrdination } from '../../interfaces/paginable-table-ordination';
import { PaginationState } from '../../interfaces/pagination-state';
import { HubPaginableResource } from '../../interfaces/paginable-resource';
import { TableRow } from '../../interfaces/table-row';
import { readPaginableSource } from '../../utils/paginable-source';
import { HUB_PAGINABLE_FORM_CONTROLS } from '../../form-controls/form-controls.token';
import { HubPaginableControlDirective } from '../../form-controls/form-controls.directive';
import { HubPaginableControlOption } from '../../form-controls/form-controls.types';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { HubIconComponent } from '../icon/icon.component';
import { MenuFilterComponent } from '../menu-filter/menu-filter.component';
import { PaginableTableDropdownComponent } from '../paginable-table-dropdown/paginable-table-dropdown.component';
import { HUB_PAGINABLE_ACTIONS } from '../../actions/actions.token';
import { HubPaginableActionsDirective } from '../../actions/actions.directive';
import { PaginableTableRangeInputComponent } from '../paginable-table-range-input/paginable-table-range-input.component';
import { PaginatorComponent } from '../paginator/paginator.component';
import { HubTableTooltipDirective } from '../../table-tooltip';

@Component({
	selector: 'hub-table, hub-ui-table',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './table.component.html',
	styleUrl: './table.component.scss',
	imports: [
		HubTableTooltipDirective,
		NgClass,
		NgTemplateOutlet,
		AsyncPipe,
		ReactiveFormsModule,
		FormsModule,
		TranslatePipe,
		UcfirstPipe,
		UnwrapAsyncPipe,
		IsObservablePipe,
		PaginableTableDropdownComponent,
		PaginatorComponent,
		DropdownComponent,
		MenuFilterComponent,
		HubIconComponent,
		PaginatorComponent,
		PaginableTableRangeInputComponent,
		AsyncPipe,
		GetPipe,
		PaginableStateOutlet,
		HubPaginableControlDirective,
		HubPaginableActionsDirective,
		HubStickyColumnsDirective
	],
	providers: [
		{ provide: HUB_TRANSLATION_PREFIX, useValue: 'HUBUI.PAGINABLE' },
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => TableComponent),
			multi: true
		}
	],
	host: {
		class: 'hub-table',
		'[class.hub-table--rtl]': 'isRtl()',
		'[class.hub-table--sticky-header]': 'stickyHeader()',
		'[class.hub-table--flush]': 'flush()',
		'[class.hub-table--flush-fields]': 'flushFields()',
		'[style.--hub-table-accent]': 'accentVar()'
	}
})
/**
 * A highly configurable and feature-rich table component for Angular applications.
 * Provides data visualization with pagination, sorting, filtering, and selection capabilities.
 *
 * Features:
 * - Pagination (local and remote)
 * - Column sorting with customizable sort functions
 * - Advanced filtering with column-specific filters
 * - Row selection (single and multiple)
 * - Expandable rows
 * - Custom templates for headers, cells, and special states
 * - Responsive design with configurable breakpoints
 * - Batch actions for selected rows
 * - Search functionality with debouncing
 * - Loading and error states
 * - Accessibility features
 *
 * @template T The type of data objects displayed in the table
 * @example
 * ```html
 * <hub-ui-table
 *   [headers]="headers"
 *   [data]="data()"
 *   [(page)]="page"
 *   [totalItems]="totalItems"
 *   [loading]="loading"
 *   [searchable]="true"
 *   [selectable]="true"
 *   [(searchTerm)]="searchTerm"
 *   [(ordination)]="ordination">
 * </hub-ui-table>
 * ```
 */
export class TableComponent<T = any> {
	/** Form builder service for creating reactive forms */
	#fb = inject(UntypedFormBuilder);

	/** Resolved application-wide default state components. */
	readonly defaults = inject(PaginableDefaultsService);

	/** In-memory data engine powering the automatic client-side pagination mode. */
	readonly #clientData = inject(TableClientDataService);

	/** Application-wide paginable configuration (holds the input defaults). */
	readonly #config = inject(PaginableService);

	/** Resolved default input values from {@link providePaginable}. */
	get #defaults() {
		return this.#config.config.defaults ?? {};
	}

	/**
	 * Tracks whether the latest `[data]` binding was a plain array (as opposed to a
	 * {@link PaginationState}).
	 */
	readonly #dataIsArray = signal<boolean>(false);

	/** The same question for `[resource]`, and `null` while no resource is bound. */
	readonly #resourceIsArray = signal<boolean | null>(null);

	/**
	 * Whether the collection currently rendered arrived as a plain array. Together with
	 * `paginate` and an unset `totalItems`, this drives the automatic client-side
	 * pagination mode. It follows whichever binding is in charge — `[resource]` when one
	 * is bound, `[data]` otherwise — so the two cannot leave the table in a mode neither
	 * of them asked for.
	 */
	readonly #sourceIsArray = computed<boolean>(() => this.#resourceIsArray() ?? this.#dataIsArray());

	/**
	 * Optional adapter that renders the table's primitive controls (search, page
	 * size…) with a richer component library. When absent (default), the table
	 * falls back to native `<input>` / `<select>`. Wire it with
	 * `provideHubPaginableFormControls(hubFormControlAdapter)`.
	 */
	protected readonly formControlsAdapter = inject(HUB_PAGINABLE_FORM_CONTROLS, { optional: true });

	/** Unique identifier for the table component instance */
	id = input(generateUniqueId(16));

	/**
	 * Name shared by the selection radios of THIS table, and by no other.
	 *
	 * A radio group is scoped by name across the whole document, so two single-selection tables
	 * on one page would silently fight over a single choice if they shared one.
	 */
	readonly radioGroupName = `hub-table-selection-${generateUniqueId(8)}`;

	/** Visual and behavioral options for the table */
	readonly options = input<PaginableTableOptions>({
		cursor: 'default',
		hoverableRows: false,
		striped: null,
		variant: null
	});

	/**
	 * Returns whether right-to-left mode is enabled.
	 *
	 * @returns `true` when RTL mode is active for the table.
	 */
	isRtl(): boolean {
		return this.options()?.rtl === true;
	}

	/**
	 * Resolves the table's accent slot from `options.variant`, accepting ANY colour.
	 *
	 * A bareword (semantic name, registered accent or CSS named colour) resolves to
	 * the matching `--hub-sys-color-*` ds token with the raw word as fallback, while a
	 * literal `#hex` / `rgb()` / `oklch()` / `var()` is passed through unchanged. The
	 * value is bound to the single `--hub-table-accent` slot (the SCSS derives the
	 * `-emphasis` / `-subtle` / `-on` family from it); `null` (no variant) defers to
	 * the SCSS default and the built-in `.hub-table__<variant>` class rules.
	 *
	 * @returns The `--hub-table-accent` value, or `null` when no variant is set.
	 */
	protected readonly accentVar = computed<string | null>(() => resolveHubAccent(this.options()?.variant));

	/**
	 * Collection of selected rows
	 *
	 * @type {Array<T>}
	 * @memberof PaginableTableComponent
	 */
	value: Array<T> = [];

	/**
	 * Set whether all page rows are selecteds
	 *
	 * @type {boolean}
	 * @memberof PaginableTableComponent
	 */
	allRowsSelected: boolean = false;

	/**
	 * Time to ouput the filter form value
	 *
	 * @type {number}
	 * @memberof PaginableTableComponent
	 */
	readonly debounce = input<number>(this.#defaults.debounce ?? 0);

	/** Column headers configuration. Can be strings for simple headers or PaginableTableHeader objects for advanced features */
	readonly headers = model<Array<PaginableTableHeader | string>>([]);

	/** Computed headers with normalized configuration and automatic button column handling */
	readonly fixedHeaders = computed(() => {
		const headers = this.headers();
		const fixedHeaders: Array<PaginableTableHeader> = headers.map((header) => {
			if (typeof header === 'string') {
				return {
					title: header,
					property: header
				};
			}
			return header;
		});

		// Parsing headers
		for (const header of fixedHeaders) {
			if (header.constructor.name === 'Object' && header.buttons && !header.property) {
				Object.assign(header, { wrapping: 'nowrap', onlyButtons: true, align: 'end' }, header);
			}
		}

		return fixedHeaders;
	});

	/** Computed total number of columns including selection and expansion columns */
	headersCount = computed(() => {
		let count = this.fixedHeaders().filter((header) => {
			if (typeof header.hidden === 'function') {
				const result = header.hidden();
				if (result instanceof Promise || isObservable(result)) {
					return false;
				}
				return !result;
			}
			return !header.hidden;
		}).length;
		if (this.selectable() || this.batchActions().length) {
			count++;
		}
		if (
			this.templateExpandingRows()?.length /* &&
			!this.lastColumnOnlyHasButtons */
		) {
			count++;
		}
		return count;
	});

	/**
	 * Colspan used by the full-width rows (loading / error / no-results state rows
	 * and the master-detail expanding row). A value larger than any realistic column
	 * count: the browser clamps `colspan` to the row's actual number of columns, so
	 * the cell always spans the whole table width without having to compute it.
	 */
	protected readonly fullColspan = 1000;

	/** Computed list of headers that have filter configurations */
	headerFilters = computed(() => this.fixedHeaders().filter((header) => header.filter));

	/**
	 * Rebuilds the filter form whenever the filterable columns change.
	 *
	 * It used to be a `setTimeout` fired from inside the `headerFilters` computed — a side effect
	 * in a memoised read, which also means it never runs again if nothing re-reads the computed.
	 */
	filterFGEffect = effect(() => {
		this.headerFilters();
		this.initializeFilterFG();
	});

	/** Model for filter values applied to the table columns */
	readonly filters = model<Record<string, {}> | null>({});

	/**
	 * Filter form
	 *
	 * @type {FormGroup}
	 * @memberof PaginableTableComponent
	 */
	filtersFG: FormGroup = new FormGroup({});

	/**
	 * The controls currently living in `filtersFG`, published as a signal.
	 *
	 * `addControl` is invisible to change detection: the group is a plain object, so a template
	 * that asks it for a control keeps the answer it got on the first render. The filter row is
	 * built from controls created *after* that render, so it kept the first answer — `null` — and
	 * stayed empty until some unrelated event happened to redraw the table. Reading the set from
	 * a signal is what makes the row appear when its controls do.
	 */
	readonly filterControls = signal<Record<string, AbstractControl>>({});

	/** Indicates if filters are currently being applied or processed */
	filterLoading: boolean = false;

	/** Effect that synchronizes external filter changes with the internal form */
	filterEffect = effect(() => {
		const filters = this.filters();

		// Le damos un poco de tiempo para
		setTimeout(() => {
			this.filtersFG.patchValue(filters ?? {}, { emitEvent: false });
			this.#filterFormWrites.update((count) => count + 1);
		}, 16);
	});

	/**
	 * Counts the writes the form receives with `emitEvent: false` — the way a consumer's
	 * `[filters]` reaches it. They are invisible to `valueChanges` by design, so without this
	 * the row would never learn that a filter arrived from outside.
	 */
	readonly #filterFormWrites = signal(0);

	/** Live value of the filter form: the other way a filter gets one, a person typing. */
	readonly #filterFormValue = toSignal(this.filtersFG.valueChanges);

	/**
	 * Which columns are currently narrowing the collection, keyed by control name.
	 *
	 * Derived from the form rather than from the `filters` model: the form is what the row is
	 * showing, and it holds the value the instant it is set, while the model is written a
	 * debounce later (and only when the table itself published the change).
	 */
	readonly activeFilters = computed<Record<string, boolean>>(() => {
		this.#filterFormValue();
		this.#filterFormWrites();

		return Object.fromEntries(
			Object.entries(this.filterControls()).map(([name, control]) => [name, this.isFilterActive(control.value)])
		);
	});

	/** Debounced signal for filter form changes to prevent excessive API calls */
	filtersChange = debouncedSignal(toSignal(this.filtersFG.valueChanges), this.debounce);

	/** Effect that handles filter form changes and updates the filters model */
	filtersFGChangeEffect = effect(() => {
		const filters = this.filtersChange();
		if (filters === undefined) return;

		if (this.setFilters) {
			this.filters.set(filters);
		}
		this.setFilters = true;
	});

	/** Computed boolean indicating if any column has inline filters (not menu filters) */
	hasColumnFilters = computed(() => {
		return this.headerFilters().some(({ filter }) => filter?.mode !== 'menu');
	});

	/**
	 * Table data input that accepts either raw data array or PaginationState object.
	 * Automatically transforms data into TableRow format and handles pagination state.
	 * When PaginationState is provided, automatically sets page, perPage, and totalItems.
	 */
	readonly rows = input<Array<TableRow<T>>, Array<T> | PaginationState | null | undefined>([], {
		alias: 'data',
		transform: (v: Array<T> | PaginationState | null | undefined): Array<TableRow<T>> => {
			this.#dataIsArray.set(Array.isArray(v));
			return this.#normalizeSource(v);
		}
	});

	/**
	 * A signal-based resource — `resource()`, `httpResource()` or anything shaped like one —
	 * bound whole, so the collection, the loading state and the failure arrive together
	 * instead of as three bindings a consumer has to keep in step.
	 *
	 * Its value is read exactly as `[data]` is: an array renders as rows, a
	 * {@link PaginationState} renders as rows plus page, size and total. `isLoading()` feeds
	 * {@link loading} and `error()` feeds {@link error}, so the states the table already draws
	 * need no extra wiring.
	 *
	 * Two things it deliberately does not do. Bound alongside `[data]`, **the resource wins**:
	 * one of them has to, and the resource is the more specific statement of intent. And
	 * **paging does not reload it** — the table never calls `reload()`, so whoever owns the
	 * request keeps owning it and refetches when they decide to, typically by paging a signal
	 * the resource's own loader reads.
	 *
	 * Typed structurally rather than as `ResourceRef`, which arrived in Angular 19 while this
	 * package supports 18: see {@link HubPaginableResource}.
	 */
	readonly resource = input<HubPaginableResource<T> | null>(null);

	/** Rows published by the bound `[resource]`, or `null` while none is bound. */
	readonly #resourceRows = signal<Array<TableRow<T>> | null>(null);

	/**
	 * Mirrors the bound resource into the table: its value becomes the rows, its `isLoading()`
	 * the loading state and its `error()` the error state.
	 *
	 * An effect rather than a computed because reading the resource has to *write* — the page
	 * metadata of a {@link PaginationState}, and the two state models — which a memoised read
	 * is not allowed to do.
	 *
	 * The failure is read before the value, and the value only when there is none: a failed
	 * resource has nothing to hand over and says so by rethrowing from `value()`. Reading the
	 * value first threw out of this effect, so the error state the input exists to drive was
	 * never set — the one case `[resource]` was added to make easy was the one it could not do.
	 * The rows of the last good load are left alone, because a refresh that fails should not
	 * cost the reader the table they were looking at; the error state is drawn over the body
	 * anyway.
	 */
	resourceEffect = effect(() => {
		const resource = this.resource();

		if (!resource) {
			this.#resourceIsArray.set(null);
			this.#resourceRows.set(null);
			return;
		}

		const failure = resource.error() ?? null;

		if (!failure) {
			const value = resource.value();
			this.#resourceIsArray.set(Array.isArray(value));
			this.#resourceRows.set(this.#normalizeSource(value));
		}

		this.loading.set(resource.isLoading());
		this.error.set(failure);
	});

	/**
	 * The rows the table works from: the resource's when one is bound, `[data]`'s otherwise.
	 */
	readonly sourceRows = computed<Array<TableRow<T>>>(() => this.#resourceRows() ?? this.rows());

	/**
	 * Turns either accepted collection shape into rows, publishing the page metadata a
	 * {@link PaginationState} carries.
	 *
	 * Shared by `[data]` and `[resource]` so a paginated object cannot come to mean one thing
	 * through one binding and something else through the other.
	 *
	 * @param value The collection as the consumer supplied it.
	 * @returns The rows to render.
	 */
	#normalizeSource(value: Array<T> | PaginationState | null | undefined): Array<TableRow<T>> {
		const { items, state } = readPaginableSource<T>(value as Array<T> | PaginationState<T> | null | undefined);

		if (state) {
			this.page.set(state.page);
			this.perPage.set(state.perPage);
			this.totalItems.set(state.totalItems);
		}

		return items.map((item) => this.transformIntoRow(item));
	}

	/** Effect that runs when the visible rows change to update selection state */
	rowsEffect = effect(() => {
		this.displayedRows();
		this.markSelected();
	});

	/** Internal flag to prevent filter feedback loops during initialization */
	setFilters: boolean = true;

	/**
	 * Transforms raw data item into TableRow format with default selection and expansion state.
	 *
	 * @param data The raw data item to transform
	 * @returns TableRow with default collapsed and unselected state
	 */
	transformIntoRow(data: T): TableRow<T> {
		return {
			selected: false,
			collapsed: true,
			data
		};
	}

	/** Available options for number of items per page */
	readonly perPageOptions = input<Array<number>>(this.#defaults.perPageOptions ?? [10, 20, 50, 100]);

	/** `perPageOptions` mapped to `{ value, label }` for the form-controls adapter. */
	protected readonly perPageControlOptions = computed<HubPaginableControlOption[]>(() =>
		this.perPageOptions().map((option) => ({ value: option, label: String(option) }))
	);
	/** Current page number (1-based) */
	readonly page = model<number | null>(null);
	/** Number of items to display per page */
	readonly perPage = model<number | null>(this.#defaults.perPage ?? 10);
	/** Total number of items available across all pages */
	readonly totalItems = model<number | null>(null);

	/**
	 * Computed total number of pages.
	 *
	 * In client mode it is derived from the filtered (pre-slice) row count; otherwise
	 * it uses the consumer-provided `totalItems` exactly as before.
	 */
	readonly numberOfPages = computed((): number | null => {
		const perPage = this.perPage();
		if (!perPage) {
			return null;
		}
		if (this.clientMode()) {
			return Math.ceil(this.clientFilteredRows().length / perPage);
		}
		if (this.totalItems()) {
			return Math.ceil(this.totalItems()! / perPage);
		}
		return null;
	});

	/** Current column sorting configuration */
	readonly ordination = model<PaginableTableOrdination>();

	/**
	 * Whether the table should paginate.
	 *
	 * When `true` (default) **and** `[data]` is a plain array **and** no `totalItems`
	 * is provided, the table enters automatic client-side mode: it searches, filters,
	 * sorts and slices the array in memory and computes the total itself
	 * ({@link clientMode}). Passing a {@link PaginationState} — or setting `totalItems`
	 * — keeps the table in server mode, rendering `[data]` as-is. Set `[paginate]="false"`
	 * to render a plain array in full without any pagination.
	 *
	 * @type {boolean}
	 * @memberof PaginableTableComponent
	 */
	readonly paginate = input<boolean>(this.#defaults.paginate ?? true);

	/**
	 * Whether the table is running in automatic client-side pagination mode.
	 *
	 * Active when pagination is enabled, the consumer passed a plain array and no
	 * `totalItems` was provided (which would otherwise signal a server-managed total).
	 */
	readonly clientMode = computed<boolean>(() => this.paginate() && this.#sourceIsArray() && this.totalItems() == null);

	/** Data properties scanned by the global search box in client mode. */
	readonly searchableKeys = computed<Array<string>>(() =>
		this.fixedHeaders()
			.filter((header) => header.property && !header.onlyButtons && !header.buttons)
			.map((header) => header.property)
	);

	/**
	 * Full set of rows after search, column filtering and sorting but **before**
	 * slicing into a page. Its length is the real total used to drive the paginator.
	 * In server mode it is just the rows the consumer supplied.
	 */
	readonly clientFilteredRows = computed<Array<TableRow<T>>>(() => {
		const rows = this.sourceRows();
		if (!this.clientMode()) {
			return rows;
		}
		return this.#clientData.process(rows, {
			searchTerm: this.searchTerm(),
			searchKeys: this.searchableKeys(),
			searchFn: this.searchFn() ?? null,
			headers: this.fixedHeaders(),
			filters: this.filters(),
			ordination: this.ordination() ?? null
		});
	});

	/**
	 * Rows actually rendered by the template. In client mode this is the current
	 * page's slice of {@link clientFilteredRows}; in server mode it is the rows the
	 * consumer supplied, untouched.
	 */
	readonly displayedRows = computed<Array<TableRow<T>>>(() => {
		if (!this.clientMode()) {
			return this.sourceRows();
		}
		const rows = this.clientFilteredRows();
		const perPage = this.perPage() || rows.length || 1;
		const page = Math.max(1, this.page() ?? 1);
		const start = (page - 1) * perPage;
		return rows.slice(start, start + perPage);
	});

	/** Fingerprint of the last client-mode query, used to detect search/filter/sort changes. */
	#lastQueryKey: string | null = null;

	/**
	 * Keeps the current page coherent in client mode: defaults to the first page,
	 * resets to it whenever the search, filters or ordination change, and clamps it
	 * to the available number of pages after the result set shrinks (e.g. when
	 * `perPage` grows).
	 */
	pageEffect = effect(() => {
		if (!this.clientMode()) {
			this.#lastQueryKey = null;
			return;
		}

		const key = JSON.stringify([this.searchTerm(), this.filters(), this.ordination() ?? null]);
		const pages = this.numberOfPages();
		const current = this.page();

		// Snap back to the first page when the query changed (skip the very first pass).
		if (this.#lastQueryKey !== null && this.#lastQueryKey !== key) {
			this.#lastQueryKey = key;
			if (current !== 1) {
				this.page.set(1);
			}
			return;
		}
		this.#lastQueryKey = key;

		if (current == null) {
			this.page.set(1);
			return;
		}
		if (pages != null && pages >= 1 && current > pages) {
			this.page.set(pages);
		}
	});

	/**
	 * If set, it will be the property returned in the selected event
	 *
	 * @type {string}
	 * @memberof PaginableTableComponent
	 */
	readonly bindValue = input<string>();

	/** Loading state indicator for the table */
	readonly loading = model<boolean>(false);

	/**
	 * Error state holder. When set to a truthy value the table renders its error
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
	 * Where the pagination bar is drawn: under the rows, above them, or in both places.
	 *
	 * The bar is a whole — paginator, page-size selector and row count — and every value moves
	 * all of it, so a long table can be paged from wherever the reader happens to be.
	 */
	readonly paginationPosition = input<'bottom' | 'top' | 'both'>(this.#defaults.paginationPosition ?? 'bottom');

	/**
	 * Whether there is a page to draw controls for. A table handed no page number is not
	 * paginated at all, so it gets no bar wherever {@link paginationPosition} points.
	 */
	protected readonly paginated = computed<boolean>(() => this.page() !== undefined && this.page() !== null);

	/** Whether to show pagination information (e.g., "Showing 1 to 10 of 100 entries") */
	readonly paginationInfo = input<boolean>(this.#defaults.paginationInfo ?? true);

	/** Whether action buttons should stick to viewport during scrolling */
	readonly stickyActions = input<boolean>(false);

	/**
	 * Pins the table header to the top while the body scrolls.
	 *
	 * When enabled the `thead` becomes `position: sticky; top: 0`, so the header stays
	 * visible when the table lives inside a fixed-height scroll container
	 * (`max-height` + `overflow: auto`). Unlike the `options.scrollable` path this does
	 * not require the built-in scroll frame — it works with any consumer-provided
	 * scroll parent. The sticky position itself is overridable via
	 * `--hub-table-head-position` and the offset via `--hub-table-head-sticky-top`.
	 */
	readonly stickyHeader = input(false, { transform: booleanAttribute });

	/**
	 * Draw the table flush: no outer border, no radius, no cell rules — only a hairline
	 * between rows.
	 *
	 * The default dresses a data grid, which is right for a browsable collection. A table of
	 * choices inside a dialog is not that: its borders read as a frame around a frame, and the
	 * dialog already drew one.
	 *
	 * An input rather than something a consumer reaches with CSS, for the same reason as the
	 * list's: the defaults sit on `:host`, which is the element a consumer would put a class
	 * on, so their assignment ties on specificity and loses on source order.
	 */
	readonly flush = input(false, { transform: booleanAttribute });

	/**
	 * Draw the form controls inside the cells as a spreadsheet does: no border, no surface of
	 * their own, the value sitting directly on the row.
	 *
	 * A field is boxed so it can be told apart from the page around it. A table cell already
	 * does that job — it has its own grid — so the box is drawn twice and the result reads as
	 * a form that fell into a table rather than as an editable table.
	 *
	 * What it does to attached content is deliberate and not the same for the two kinds:
	 * static `prepend`/`append` content loses its surface and reads as the plain text or icon
	 * it is, while a projected button stops being welded to its neighbours — it gets its
	 * corners back and a gap, because a run of actions in a cell is several things to press,
	 * not one strip.
	 *
	 * Implemented as a token assignment on the cells rather than as an input on each field:
	 * `ng-hub-ui-forms` declares its tokens at `:root` and never redeclares them on a component
	 * host, so an ancestor governs them by plain inheritance. That also means it reaches
	 * whatever a consumer projects into `cellTpt`, which an input per field never would.
	 */
	readonly flushFields = input(false, { transform: booleanAttribute });

	/** Actions that can be performed on multiple selected rows */
	readonly batchActions = input<
		Array<PaginableTableDropdown | PaginableActionButton>,
		Array<PaginableTableDropdown | PaginableActionButton>
	>([], {
		transform: (value: Array<PaginableTableDropdown | PaginableActionButton>) => {
			return value.map((item) => {
				if ((item as PaginableTableDropdown).buttons) {
					item = {
						fill: null,
						position: 'start',
						color: 'light',
						...item
					};
				}
				return item;
			});
		}
	});

	/** Whether rows can be selected by clicking on them */
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

	/**
	 * Set whether the selectable can be multiple
	 *
	 * @type {boolean}
	 * @memberof PaginableTableComponent
	 */
	readonly multiple = input<boolean>(false);

	readonly multipleSelectable = computed(() => {
		return this.selectable() === SelectionTypes.Multiple || this.multiple();
	});

	/**
	 * While a selection is under way, a click on a row marks it instead of opening it.
	 *
	 * Off by default, and deliberately so. On touch this is the standard gesture and the reason
	 * the input exists at all; on a pointer the dominant pattern is that a click keeps its
	 * meaning, and switching everybody over would break the consumers whose readers navigate
	 * while they pick rows.
	 *
	 * The mode carries no state of its own: it is on while at least one row is selected, so a
	 * reader enters it by ticking the first box and leaves it by unticking the last one, and a
	 * consumer has nothing to track.
	 *
	 * It adds nothing for the keyboard, and deliberately: the checkbox of each row is already a
	 * tab stop and already marks it, so the row click is a pointer shortcut for a path the
	 * keyboard has had all along. Giving the row a stop of its own would double the tab stops of
	 * a two-hundred-row table to reach something already reachable. The row does take focus when
	 * {@link clickFn} is set, because opening a record is an action the checkbox cannot perform.
	 */
	readonly selectWhileSelecting = input(false, { transform: booleanAttribute });

	/**
	 * Whether a click on a row currently means "mark this one" rather than "open it".
	 *
	 * @returns `true` when {@link selectWhileSelecting} is on and something is already selected.
	 */
	protected isSelecting(): boolean {
		return this.selectWhileSelecting() && this.value.length > 0;
	}

	/**
	 * Set whether the rows are selectable
	 *
	 * @type {boolean}
	 * @memberof PaginableTableComponent
	 */
	/** Whether the table includes a search input field */
	readonly searchable = input<boolean>(this.#defaults.searchable ?? true);

	/** Current search term for filtering table data */
	readonly searchTerm = model<string>('');

	/** Internal BehaviorSubject for debouncing search term changes */
	searchProxy$ = new BehaviorSubject<string>(this.searchTerm());

	/** Effect that handles debounced search term updates */
	searchTermEffect = effect(() => {
		const delay = this.debounce();

		const sub = this.searchProxy$.pipe(debounceTime(delay), distinctUntilChanged()).subscribe((value) => {
			this.searchTerm.set(value);
		});

		// Inicializar el proxy con el valor actual
		this.searchProxy$.next(this.searchTerm());

		return () => {
			return sub.unsubscribe();
		};
	});

	/**
	 * Empties the search box.
	 *
	 * Both the proxy and the term are written: the proxy so a keystroke still sitting in the
	 * debounce window cannot re-apply the term that was just cleared (and so `distinctUntilChanged`
	 * keeps agreeing with what the field shows), the model so the collection reloads at the click
	 * rather than a debounce later.
	 */
	clearSearch(): void {
		this.searchProxy$.next('');
		this.searchTerm.set('');
	}

	/**
	 * Decides whether a row matches the global search, when scanning the columns is not
	 * what you mean by "matches".
	 *
	 * The default reads every searchable column and keeps a row whose text contains the
	 * term, which is right for a grid of names and wrong for a record whose identity is
	 * spread across fields the table does not show. The predicate receives the row data
	 * and the term already trimmed and lowercased — the same contract as `hub-list`.
	 *
	 * Only consulted in {@link clientMode}: with a server-managed collection the term is
	 * handed to the consumer, who searches wherever the data lives.
	 */
	readonly searchFn = input<(item: T, term: string) => boolean>();

	/**
	 * Decides whether two selection values are the same record.
	 *
	 * The default compares objects by their JSON serialization, which makes two rows equal
	 * only when every field matches in the same order — so a row rebuilt by a reload, or one
	 * carrying a field the stored value does not, silently loses its tick. A comparator that
	 * reads the identifier settles it.
	 *
	 * It receives what the table stores in the selection: the row data, or the `bindValue`
	 * property when one is set.
	 */
	readonly compareFn = input<(a: T, b: T) => boolean>();

	/**
	 * On item click event emitter
	 *
	 * @memberof PaginableTableComponent
	 */
	readonly clickFn = input<(event: TableRowEvent<T>) => void | Promise<void>>();

	/**
	 * A string or function to apply a class to each row of the table.
	 * If a string is provided, it is used as the class for all rows.
	 * If a function is provided, it is called with the row data and should return a string representing the class.
	 *
	 * @type {(string | ((item: T) => string))}
	 * @memberof TableComponent
	 */
	readonly rowClass = input<string | ((item: T) => string)>();

	/** Responsive breakpoint configuration for table layout */
	readonly responsive = input<TableBreakpoint | null>(null);

	/** Computed CSS class for responsive table behavior */
	responsiveCSSClass = computed(() => {
		const response = this.responsive();
		if (response && Object.keys(TableBreakpoint).includes(response)) {
			return response === TableBreakpoint.ExtraSmall ? null : 'table-responsive-' + this.responsive;
		}
		return null;
	});

	/** Disabled state for the entire table component */
	disabled: boolean = false;

	/** Custom template for table rows */
	readonly templateRow = contentChild(PaginableTableRowDirective, {
		read: TemplateRef
	});
	/** Collection of custom header templates */
	readonly headerTpts = contentChildren(PaginableTableHeaderDirective);
	/** Collection of custom cell templates for specific columns */
	readonly templateCells = contentChildren(PaginableTableCellDirective);
	/** Template to display when the table has no rows to render. */
	readonly noResultsTpt = contentChild(PaginableNoResultsDirective, {
		read: TemplateRef
	});
	/** Template to display during loading state */
	readonly loadingTpt = contentChild(PaginableLoadingDirective, {
		read: TemplateRef
	});
	/** Template to display during error state */
	readonly errorTpt = contentChild(PaginableErrorDirective, {
		read: TemplateRef
	});
	/** Collection of templates for expandable row content */
	readonly templateExpandingRows = contentChildren(PaginableTableExpandingRowDirective);
	/** Collection of custom filter templates for specific columns */
	readonly filterTpts = contentChildren(PaginableTableFilterDirective);

	/** Collection of dropdown components used in the table */
	readonly dropdownComponents = viewChildren(DropdownComponent);

	/**
	 * Implements ControlValueAccessor.writeValue()
	 * Sets the selected value(s) from external form controls or ngModel
	 *
	 * @param value The value to set (can be single item or array)
	 */
	writeValue(value: any): void {
		if (value) {
			this.value = Array.isArray(value) ? value : [value];
		} else {
			this.value = [];
		}
		this.markSelected();
	}

	/** ControlValueAccessor callback for value changes */
	onChange = (_: any) => {};
	/** ControlValueAccessor callback for touch events */
	onTouch = () => {};

	/**
	 * Implements ControlValueAccessor.registerOnChange()
	 * Registers callback function for value changes
	 *
	 * @param fn The callback function to register
	 */
	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	/**
	 * Implements ControlValueAccessor.registerOnTouched()
	 * Registers callback function for touch events
	 *
	 * @param fn The callback function to register
	 */
	registerOnTouched(fn: any): void {
		this.onTouch = fn;
	}

	/**
	 * Implements ControlValueAccessor.setDisabledState()
	 * Sets the disabled state of the component
	 *
	 * @param isDisabled Whether the component should be disabled
	 */
	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}

	/**
	 * Handles click events by extracting specific properties and passing them to a callback function.
	 *
	 * @param  - The `onItemClick` function takes in the following parameters: collapsed, selected and item.
	 * @param {number} depth - The `depth` parameter in the `onItemClick` function represents the depth level of the item being
	 * clicked. It is a number that indicates how deep the item is nested within a hierarchical structure.
	 * @param {number} index - The `index` parameter in the `onItemClick` function represents the position of the item that was clicked
	 * within a list or array. It is a number that indicates the index of the clicked item.
	 *
	 * @returns If the `clickFn` property is not defined in the current context, the `onItemClick` function will return without
	 * executing any further code.
	 */
	/**
	 * Handles click events on table rows.
	 * Executes the provided clickFn callback with row details and event information.
	 *
	 * @param event The mouse event that triggered the click
	 * @param item The table row that was clicked
	 * @returns void if no click function is defined
	 */
	onItemClick(event: MouseEvent, item: TableRow) {
		// Under `selectWhileSelecting`, a selection already under way turns the row into a
		// checkbox: marking is what the reader means, and opening the record would throw away
		// everything they had picked so far.
		if (this.isSelecting()) {
			this.toggle(item as TableRow<T>);
			return;
		}

		const clickFn = this.clickFn();
		if (!clickFn) {
			return;
		}
		clickFn({ ...item, event });
	}

	/**
	 * Enter and Space on a focused row do what a click does.
	 *
	 * Only when the row itself has focus: a checkbox, an action button or a filter inside the row
	 * answers to those keys on its own, and the event bubbles, so acting on anything but the row
	 * would open the record every time somebody ticked its checkbox with the keyboard. Space is
	 * also the page-scroll key, hence the `preventDefault`.
	 */
	onItemKeydown(event: Event, item: TableRow): void {
		if ((!this.clickFn() && !this.isSelecting()) || event.target !== event.currentTarget) {
			return;
		}

		event.preventDefault();
		this.onItemClick(event as MouseEvent, item);
	}

	/**
	 * If paging is done on the server, a parameter change subscription is launched. Otherwise,
	 * get the data sorted according to the header passed by parameter.
	 *
	 * @param {PaginableTableHeader} header
	 * @returns {void}
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Handles column sorting by updating the ordination state.
	 * Toggles between ASC and DESC directions, or sets initial ASC direction.
	 * Only processes sortable headers.
	 *
	 * @param header The header configuration for the column to sort
	 * @returns void if header is not sortable
	 */
	sort(header: PaginableTableHeader): void {
		if (!header.sortable) {
			return;
		}
		if (!this.ordination() || this.ordination()?.property !== header.property) {
			this.ordination.set({
				property: header.property as any,
				direction: 'ASC'
			});
		} else {
			this.ordination.set({
				property: header.property,
				direction: this.ordination()?.direction === 'ASC' ? 'DESC' : 'ASC'
			});
		}
	}

	/**
	 * Get the ordination class
	 *
	 * @param {PaginableTableHeader} header
	 * @returns
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Determines the appropriate icon class for column sorting indicators.
	 * Returns different icons based on current sort state and direction.
	 *
	 * @param header The header configuration to check sort state for
	 * @returns BEM icon class name for sort icon
	 */
	getOrdenationClass(
		header: PaginableTableHeader
	): 'hub-table__icon--sort' | 'hub-table__icon--sort-up' | 'hub-table__icon--sort-down' {
		if (!this.ordination || this.ordination()?.property !== header.property) {
			return 'hub-table__icon--sort';
		}
		return this.ordination()?.direction.toUpperCase() === 'ASC' ? 'hub-table__icon--sort-up' : 'hub-table__icon--sort-down';
	}

	/**
	 * If it exists, returns the header cell template for the header passed by parameter
	 *
	 * @param {(PaginableTableHeader)} header
	 * @returns {TemplateRef<PaginableTableCellDirective>}
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Retrieves a custom header template for the specified column.
	 * Searches through headerTpts collection for a matching template directive.
	 *
	 * @param header The header configuration to find template for
	 * @returns The template reference if found, null otherwise
	 */
	getHeaderTemplate(header: PaginableTableHeader): TemplateRef<any> | null {
		const property = header instanceof String ? header : header.property;
		if (!property) {
			return null;
		}
		const directive = this.headerTpts().find((o) => {
			return o.header() === property;
		});
		return directive ? directive.template : null;
	}

	/**
	 * If it exists, returns the cell template for the header passed by parameter
	 *
	 * @param {(PaginableTableHeader)} header
	 * @returns {TemplateRef<PaginableTableCellDirective>}
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Retrieves a custom cell template for the specified column.
	 * Searches through templateCells collection for a matching template directive.
	 *
	 * @param header The header configuration to find cell template for
	 * @returns The template reference if found, null otherwise
	 */
	getCellTemplate(header: PaginableTableHeader): TemplateRef<any> | null {
		const property = header instanceof String ? header : header.property;
		if (!property) {
			return null;
		}
		const directive = this.templateCells().find((o) => {
			return o.header() === property;
		});
		return directive ? directive['template'] : null;
	}

	/**
	 * If it exists, returns the filter template for the header passed by parameter
	 *
	 * @param {(PaginableTableHeader)} header
	 * @returns {TemplateRef<PaginableTableCellDirective>}
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Retrieves a custom filter template for the specified column.
	 * Searches through filterTpts collection for a matching template directive.
	 *
	 * @param header The header configuration to find filter template for
	 * @returns The filter template reference if found, null otherwise
	 */
	getFilterTemplate(header: PaginableTableHeader): TemplateRef<PaginableTableFilterDirective> | null {
		const property = header instanceof String ? header : header.property;
		if (!property) {
			return null;
		}
		const directive = this.filterTpts().find((o) => o.header() === property);
		return directive ? directive.template : null;
	}

	/**
	 * Handles the action to execute
	 *
	 * @param {Function} handler
	 * @param {*} row
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Handles action button clicks within table rows.
	 * Prevents event bubbling and executes the provided handler function.
	 *
	 * @param event The click event to stop propagation for
	 * @param handler The action handler function to execute
	 * @param row The table row context for the action
	 */
	handleAction(event: Event, button: PaginableActionButton, row: TableRow) {
		event.stopPropagation();
		const handler = button.handler as ((row: TableRow) => void) | undefined;
		handler?.(row);
	}

	/**
	 * Handles the action to be executed in a batch
	 *
	 * @param {PaginableActionButton} button
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Handles batch action execution on selected rows.
	 * Executes the button's handler function with currently selected values.
	 *
	 * @param button The batch action button configuration with handler
	 */
	handleBatchAction(button: PaginableActionButton) {
		const handler = button.handler as ((items: ReadonlyArray<T>) => void) | undefined;
		handler?.(this.value);
	}

	/**
	 * Returns normalized CSS classes for toolbar batch action buttons.
	 * Ensures a default BEM class is always present when no explicit variant class is provided.
	 *
	 * @param button Batch action button definition.
	 * @returns List of CSS class names to bind in template.
	 */
	getBatchActionClassList(button: PaginableActionButton): Array<string> {
		return this.withDefaultActionClass(button.classlist, 'hub-table__batch-actions-btn--default');
	}

	/**
	 * Returns normalized CSS classes for row action buttons.
	 * Ensures a default BEM class is always present when no explicit variant class is provided.
	 *
	 * @param button Row action button definition.
	 * @returns List of CSS class names to bind in template.
	 */
	/**
	 * The accent an action button paints with, resolved the way the rest of the family does.
	 *
	 * Through `resolveHubAccent` rather than a class per colour. `PaginableActionButton.color`
	 * is typed `… | (string & {})` — it accepts any string on purpose, so a consumer can name
	 * a role of their own — and a stylesheet that enumerates the seven built-in names honours
	 * exactly those seven. Everything else got a class matching no rule, left the custom
	 * property unset, and broke the `color-mix` into a button with no accent at all: no error,
	 * no warning, and a typed API quietly telling a lie.
	 *
	 * The helper covers the general case: a bare word becomes `var(--hub-sys-color-<word>,
	 * <word>)`, so both the system's roles and a consumer's own resolve, and anything that is
	 * already a colour — a hex, an `rgb()` — passes through untouched. It is also what this
	 * very component uses for its own variant two hundred lines up; the row actions were the
	 * exception, not the rule.
	 *
	 * @param button - The action being drawn.
	 * @returns A CSS colour value, or `null` when the variant has no accent to paint.
	 */
	actionAccent(button: PaginableActionButton): string | null {
		// `default` is the plain bordered button: colouring it would be giving it a variant by
		// the back door, exactly as the class list below refuses to.
		if ((button.variant ?? 'default') === 'default') {
			return null;
		}

		return resolveHubAccent(button.color ?? 'neutral');
	}

	getRowActionClassList(button: PaginableActionButton): Array<string> {
		const variant = button.variant ?? 'default';
		const classes = [`hub-table__cell-btn--${variant}`];

		if (button.classlist) {
			classes.push(...(Array.isArray(button.classlist) ? button.classlist : [button.classlist]));
		}

		return classes;
	}

	/**
	 * Determines if a row button should be hidden based on its configuration.
	 * Handles both function and boolean hidden properties, returning Observable for consistency.
	 *
	 * @param button The button configuration to check visibility for
	 * @param row The table row context
	 * @returns Observable<boolean> indicating if button should be hidden
	 * @todo Implement this logic for all columns, not just buttons
	 */
	isHidden(button: PaginableActionButton, row: TableRow): Observable<boolean> {
		if (typeof button.hidden === 'function') {
			const result = button.hidden(row);
			return isObservable(result) ? (result as Observable<boolean>) : of(result);
		}
		return of(!!button.hidden);
	}

	/**
	 * Determines if a row button is offered but refused for this row.
	 *
	 * Shaped exactly like {@link isHidden} — boolean or predicate, always an Observable —
	 * because the two answer the same question about the same button and a consumer
	 * declaring both should not have to write them differently.
	 *
	 * @param button The button configuration to check
	 * @param row The table row context
	 * @returns Observable<boolean> indicating if the button should be disabled
	 */
	isDisabled(button: PaginableActionButton, row: TableRow): Observable<boolean> {
		if (typeof button.disabled === 'function') {
			const result = button.disabled(row);
			return isObservable(result) ? (result as Observable<boolean>) : of(result);
		}
		return of(!!button.disabled);
	}

	/**
	 * Whether a component library is wired to draw the row actions.
	 *
	 * Read once and held, because it decides which branch of the cell template runs and
	 * that answer cannot change while the application is alive. When nothing is wired the
	 * table falls back to its own deprecated markup.
	 */
	protected readonly hasActionsAdapter = !!inject(HUB_PAGINABLE_ACTIONS, {
		optional: true
	});

	/**
	 * Determines if a header column should be hidden based on its configuration.
	 * Handles boolean values, synchronous functions, and asynchronous functions (Promise/Observable).
	 *
	 * @param header The header configuration to check visibility for
	 * @returns Observable<boolean> indicating if column should be hidden
	 */
	isColumnHidden(header: PaginableTableHeader): Observable<boolean> {
		if (typeof header.hidden === 'function') {
			const result = header.hidden();
			if (isObservable(result)) {
				return result as Observable<boolean>;
			}
			if (result instanceof Promise) {
				return new Observable((subscriber) => {
					result
						.then((value) => {
							subscriber.next(value);
							subscriber.complete();
						})
						.catch((error) => {
							subscriber.error(error);
						});
				});
			}
			return of(result);
		}
		return of(!!header.hidden);
	}

	/**
	 * Expand or unexpand an expanding row
	 *
	 * @param {TableRow} item
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Toggles the expanded/collapsed state of a table row.
	 * Used for rows that have expandable content.
	 *
	 * @param item The table row to toggle expansion state for
	 */
	toggleExpandedRow(item: TableRow) {
		item.collapsed = !item.collapsed;
	}

	/**
	 * Select or unselect all page items
	 *
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Toggles selection state for all visible rows on the current page.
	 * Updates both individual row selection and the allRowsSelected flag.
	 * Respects the bindValue configuration for complex object selection.
	 */
	toggleAll() {
		this.allRowsSelected = !this.allRowsSelected;
		const rows = this.displayedRows();
		if (!rows) {
			return;
		}
		for (const row of rows) {
			const bindValue = this.bindValue();
			const needle = bindValue ? (row.data as Record<string, any>)[bindValue] : row.data;
			const index = this.#indexOfValue(needle);
			if (index > -1 && !this.allRowsSelected) {
				this.value.splice(index, 1);
			} else if (index === -1 && this.allRowsSelected) {
				this.value.push(needle);
			}
			row.selected = this.allRowsSelected;
		}
		this.emitValue();
	}

	/**
	 * Select or unselect a row
	 *
	 * @param {*} row
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Toggles selection state for a single table row.
	 * Handles both single and multiple selection modes.
	 * Updates the internal value array and emits changes via ControlValueAccessor.
	 *
	 * @param row The table row to toggle selection for
	 */
	toggle(row: TableRow<T>) {
		const rows = this.displayedRows();
		if (!rows) {
			return;
		}

		const bindValue = this.bindValue();
		const needle = bindValue ? (row.data as Record<string, any>)[bindValue] : row.data;

		const index = this.#indexOfValue(needle);
		if (index > -1) {
			this.value.splice(index, 1);
			row.selected = false;
		} else {
			this.value.push(needle);
			row.selected = true;
		}

		if (!this.multipleSelectable()) {
			this.value = row.selected ? [needle] : [];
			rows.forEach((o) => {
				const needle = bindValue ? (o.data as Record<string, any>)[bindValue] : o.data;
				o.selected = this.#indexOfValue(needle) > -1;
			});
		} else {
			this.allRowsSelected = rows.every((o) => o.selected);
		}

		this.emitValue();
	}

	/**
	 * Select or deselect a row if it exists in the collection of selected items
	 *
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Updates the selection state of all rows based on the current value array.
	 * Called when the rows data changes or when external value changes occur.
	 * Respects the bindValue configuration for object property matching.
	 */
	markSelected() {
		const rows = this.displayedRows();
		if (!rows?.length) {
			return;
		}

		const bindValue = this.bindValue();

		rows.forEach((row) => {
			const data: any = row.data as any;
			const needle = bindValue ? data[bindValue] : (data as any);
			row.selected = this._contains(this.value as any, needle as any);
		});
		this.allRowsSelected = rows.every((o) => o.selected);
	}

	/**
	 * Emits the current selection value through the ControlValueAccessor interface.
	 * Handles both single and multiple selection modes appropriately.
	 */
	emitValue() {
		this.onChange(this.multipleSelectable() ? this.value : this.value[0]);
	}

	/**
	 * Check if a needle exists in a list
	 *
	 * @private
	 * @param {T[]} items
	 * @param {*} needle
	 * @return {*}  {boolean}
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Checks if a needle value exists within an items array.
	 * Handles both primitive and object comparisons using JSON serialization for objects.
	 *
	 * @param items The array to search within
	 * @param needle The value to search for
	 * @returns true if needle is found in items, false otherwise
	 * @todo Move this utility function to a shared utils file
	 */
	private _contains(items: T[], needle: T): boolean {
		const compareFn = this.compareFn();
		if (compareFn) {
			return items.some((item) => compareFn(item, needle));
		}
		if (typeof needle === 'object' && needle !== null) {
			return items.some((o) => JSON.stringify(o) === JSON.stringify(needle));
		}
		return items.indexOf(needle) > -1;
	}

	/**
	 * Position of a selection value inside the current selection.
	 *
	 * Without a `compareFn` this is `indexOf`, which the toggles have always used — note
	 * that it is reference equality for objects, stricter than the serialization
	 * {@link _contains} falls back to. The two defaults are left as they were; a
	 * `compareFn` settles both at once.
	 *
	 * @param needle The value the row contributes to the selection.
	 * @returns Its index, or `-1`.
	 */
	#indexOfValue(needle: unknown): number {
		const compareFn = this.compareFn();
		if (compareFn) {
			return this.value.findIndex((item) => compareFn(item, needle as T));
		}
		return this.value.indexOf(needle as T);
	}

	/**
	 * Initializes the filters form group by creating form controls for each header filter.
	 * Maps header filters to form controls using either the filter key or property name as the control name.
	 * The initial value for each control is set to null.
	 */
	/**
	 * Initializes the filters form group by creating form controls for each header filter.
	 * Maps header filters to form controls using either the filter key or property name as the control name.
	 * The initial value for each control is set to null.
	 */
	initializeFilterFG() {
		Object.keys(this.filtersFG.controls).forEach((controlName) => {
			this.filtersFG.removeControl(controlName);
		});

		for (const { filter = null, property } of this.headerFilters()) {
			this.filtersFG.addControl(filter?.key || property, this.#fb.control(null));
		}

		this.filterControls.set({ ...this.filtersFG.controls });
		// NOTE: Evitamos que al saltar el cambio de filtros del formulario, se restablezcan los filtros.
		this.setFilters = false;
	}

	/**
	 * Clean the advanced filter form
	 *
	 * @memberof PaginableTableComponent
	 */
	/**
	 * Resets all filter form controls to their initial state.
	 * Clears all applied filters and returns the table to unfiltered state.
	 */
	clearFilters(): void {
		this.filtersFG.reset();
	}

	/**
	 * Whether an inline column filter is currently narrowing the collection, which the
	 * filter row shows as a state on the cell.
	 *
	 * A range control holds a two-slot array that stays an array once the field has been
	 * touched, so emptiness has to be read slot by slot: `[null, null]` is a range nobody
	 * has set, not a range of nothing.
	 *
	 * @param value Current value of the filter's form control
	 * @returns `true` when the filter holds a value that narrows the collection
	 */
	isFilterActive(value: unknown): boolean {
		const isSet = (slot: unknown) => slot !== null && slot !== undefined && slot !== '';

		return Array.isArray(value) ? value.some(isSet) : isSet(value);
	}

	/**
	 * Closes all other dropdowns except the one with the specified id.
	 *
	 * @param {id} - The `onDropdownFilterOpened` function takes an object parameter `id`.
	 */
	/**
	 * Handles dropdown filter opening by closing all other dropdowns.
	 * Ensures only one dropdown filter is open at a time for better UX.
	 *
	 * @param id The unique identifier of the dropdown that was opened
	 */
	onDropdownFilterOpened({ id }: { id: string }) {
		this.dropdownComponents()?.forEach((dropdown) => {
			if (dropdown.id() !== id && dropdown.isOpened()) {
				dropdown.closeDropdown();
			}
		});
	}

	/**
	 * Returns the class for a given row.
	 *
	 * @param {TableRow<T>} row The row for which to get the class.
	 * @returns {string} The class to apply to the row.
	 * @memberof TableComponent
	 */
	_getRowClass(row: TableRow<T>): string {
		const rowClass = this.rowClass();
		if (typeof rowClass === 'function') {
			return rowClass(row.data);
		} else if (typeof rowClass === 'string') {
			return rowClass;
		}
		return '';
	}

	/**
	 * Ensures the action button has a default BEM class when no custom BEM variant is provided.
	 *
	 * @param classList Raw `classlist` value from action configuration.
	 * @param defaultClass Default BEM class name for library styling.
	 * @returns Normalized class list with deduplicated entries.
	 */
	private withDefaultActionClass(classList: string | Array<string> | undefined, defaultClass: string): Array<string> {
		const normalized = this.normalizeClassList(classList);
		if (!normalized.some((item) => item.startsWith('hub-table__'))) {
			return [defaultClass, ...normalized];
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
