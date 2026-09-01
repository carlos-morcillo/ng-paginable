import { Observable } from 'rxjs';
import type { Icon } from './paginable-table-header';
import type { TableRowEvent } from './table-row-event';
import type { TableRow } from './table-row';

/**
 * Shared action button contract used by both table and list components.
 *
 * The same interface is used for:
 * - Row-level actions (handler receives `TableRowEvent<T>`)
 * - Batch actions (handler receives `ReadonlyArray<T>`)
 *
 * @template T Type of the row item model.
 */
export interface PaginableActionButton<T = any> {
	/**
	 * Optional title displayed as tooltip or fallback label.
	 */
	title?: string | Observable<string>;

	/**
	 * Optional visible label rendered inside the action button.
	 */
	label?: string | Observable<string>;

	/**
	 * Icon configuration for the action.
	 */
	icon?: string | Icon;

	/**
	 * Handler for row or batch execution contexts.
	 */
	handler?: ((event: TableRowEvent<T>) => void) | ((items: ReadonlyArray<T>) => void);

	/**
	 * Optional visibility rule for row context rendering.
	 */
	hidden?: boolean | ((row: TableRow<T>) => boolean);

	/**
	 * Whether the action is offered but refused for this row.
	 *
	 * The counterpart of `hidden`, and a different statement about the same button:
	 * `hidden` says the action does not exist here, `disabled` says it exists and cannot
	 * be taken right now. A cancelled payment is the second kind — editing it is a real
	 * action of that screen, it just has nothing left to act on — and without this a
	 * consumer had to choose between an action that vanishes and one that fails.
	 *
	 * Reaches the rendered `<button>`, so the browser refuses the click and announces the
	 * state; the tooltip still shows, which is where the reason belongs.
	 *
	 * Honoured on row actions only. A batch action is refused by having nothing selected,
	 * and the predicate here is handed a row — which a batch action, acting on a selection,
	 * does not have.
	 */
	disabled?: boolean | ((row: TableRow<T>) => boolean);

	/**
	 * Appearance of the button, from the same vocabulary `hubButton` uses.
	 *
	 * This table draws its own action buttons — plain `<button>` elements, not the
	 * primitive — and `hub-buttons` styles its appearance through `:host(...)` selectors,
	 * which match nothing on an element the primitive did not create. So a consumer who
	 * wanted a row action to look like the buttons beside it had no way to say so, and
	 * ended up rebuilding the tint by hand in its own stylesheet: two copies of one
	 * formula, free to drift the moment either side changes.
	 *
	 * `default` stays the default: it is the plain bordered button this table has always
	 * drawn, and every table already in use expects it. `soft` is what a consumer reaches
	 * for when the row actions should read as the tinted controls they usually are.
	 *
	 * @default 'default'
	 */
	variant?: 'default' | 'solid' | 'soft' | 'outline' | 'ghost';

	/**
	 * Accent of the button, from the design system's semantic roles.
	 *
	 * Ignored when `variant` is `default`, which has no accent — that is the plain
	 * bordered button, and giving it a colour would be giving it a variant.
	 *
	 * Left open with `(string & {})`, as the rest of the family does: the roles below are
	 * what the shipped tints cover and what autocomplete offers, but `color` has been an
	 * open string on the dropdown since before this, carrying values like `light` and
	 * `muted`. Closing it here would have made those a type error in code that works.
	 *
	 * @default 'neutral'
	 */
	color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | (string & {});

	/**
	 * Optional CSS class list for action button customization.
	 */
	classlist?: string[] | string;

	/**
	 * Tooltip text displayed on hover.
	 */
	tooltip?: string | Observable<string>;
}
