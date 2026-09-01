import { Observable } from 'rxjs';
import { PaginableActionButton } from './paginable-action-button';
import { TableRow } from './table-row';

/**
 * Represents a dropdown menu containing multiple action buttons.
 * Used for grouping related actions in a collapsible menu within table rows.
 */
export interface PaginableTableDropdown {
	/**
	 * Title text displayed on the dropdown toggle button.
	 * Can be a static string or an Observable for dynamic/translated content.
	 */
	title?: string | Observable<string>;

	/**
	 * Tooltip text displayed on hover over the dropdown toggle.
	 * Can be a static string or an Observable for dynamic/translated content.
	 */
	tooltip?: string | Observable<string>;

	/**
	 * Icon class or identifier to display in the dropdown toggle.
	 */
	icon?: string;

	/**
	 * Visual color identifier for the dropdown button (e.g., 'primary', 'warn').
	 */
	color?: string;

	/**
	 * Array of action buttons contained within the dropdown menu.
	 */
	buttons: ReadonlyArray<PaginableActionButton>;

	/**
	 * Position of the dropdown menu relative to the toggle button.
	 */
	position?: 'left' | 'right' | 'start' | 'end' | null;

	/**
	 * Visual fill style of the dropdown button.
	 */
	fill?: 'clear' | 'outline' | null;

	/**
	 * Whether the menu exists on this row at all.
	 *
	 * Same shape as a single action's, because it is the same question: a row that offers
	 * none of the menu's actions should not be given a trigger that opens onto nothing.
	 */
	hidden?: boolean | ((row: TableRow) => boolean);

	/**
	 * Whether the menu is drawn and refused on this row.
	 *
	 * Distinct from hiding it: a menu that is there and greyed says the actions exist and
	 * are not available now, which an absence cannot say.
	 */
	disabled?: boolean | ((row: TableRow) => boolean);
}
