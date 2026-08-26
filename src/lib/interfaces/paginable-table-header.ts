import { Observable } from 'rxjs';
import { PaginableTableDropdown } from './paginable-table-dropdown';
import { PaginableActionButton } from './paginable-action-button';

/**
 * Represents the configuration for a table header column in a paginable table.
 * This interface defines all the properties and behaviors that can be applied to a table column.
 *
 * @template T - The type of data objects displayed in the table
 *
 * @example
 * ```typescript
 * const headers: PaginableTableHeader[] = [
 *   {
 *     property: 'name',
 *     title: 'User Name',
 *     sortable: true,
 *     align: 'start',
 *     filter: { type: 'text', mode: 'row' }
 *   },
 *   {
 *     property: 'actions',
 *     title: 'Actions',
 *     onlyButtons: true,
 *     sticky: 'end',
 *     buttons: [
 *       { icon: 'edit', handler: (row) => editUser(row) },
 *       { icon: 'delete', handler: (row) => deleteUser(row) }
 *     ]
 *   }
 * ];
 * ```
 */
export interface PaginableTableHeader {
	/**
	 * The display title for the column header.
	 * Can be a static string or an Observable for dynamic/translated titles.
	 * If not provided, the property name will be used as the title.
	 *
	 * @example
	 * ```typescript
	 * // Static title
	 * title: 'User Name'
	 *
	 * // Dynamic title with translation
	 * title: this.translateService.get('user.name')
	 * ```
	 */
	title?: string | Observable<string>;

	/**
	 * The property name from the data object that this column represents.
	 * This is used to extract the value from each row's data object.
	 * Required for all columns except button-only columns.
	 *
	 * @example
	 * ```typescript
	 * // For a user object { id: 1, name: 'John', email: 'john@example.com' }
	 * property: 'name' // Will display 'John'
	 * property: 'email' // Will display 'john@example.com'
	 * ```
	 */
	property: string;

	/**
	 * Icon to display in the column header.
	 * Can be a string (CSS class) or an Icon object for more control.
	 *
	 * @example
	 * ```typescript
	 * // Simple FontAwesome icon
	 * icon: 'fa-user'
	 *
	 * // Material icon with configuration
	 * icon: { type: 'material', value: 'person' }
	 * ```
	 */
	icon?: string | Icon;

	/**
	 * Text alignment for the column content (header and cells).
	 *
	 * @default 'start'
	 *
	 * @example
	 * ```typescript
	 * align: 'start'  // Left alignment
	 * align: 'center' // Center alignment  
	 * align: 'end'    // Right alignment
	 * ```
	 */
	align?: 'start' | 'end' | 'center';

	/**
	 * Whether the column can be sorted by clicking the header.
	 * When enabled, displays sort indicators and handles click events.
	 *
	 * @default false
	 *
	 * @example
	 * ```typescript
	 * sortable: true // Enable sorting for this column
	 * ```
	 */
	sortable?: boolean;

	/**
	 * Text wrapping behavior for the column content.
	 * Controls how long text is handled within the column cells.
	 *
	 * @default 'wrap'
	 *
	 * @example
	 * ```typescript
	 * wrapping: 'wrap'   // Allow text to wrap to multiple lines
	 * wrapping: 'nowrap' // Keep text on single line with ellipsis
	 * ```
	 */
	wrapping?: 'wrap' | 'nowrap';

	/**
	 * Makes the column sticky (fixed position) during horizontal scrolling.
	 * Useful for keeping important columns like actions or identifiers visible.
	 *
	 * @example
	 * ```typescript
	 * sticky: 'start' // Stick to left side (e.g., for ID column)
	 * sticky: 'end'   // Stick to right side (e.g., for action buttons)
	 * ```
	 */
	sticky?: 'start' | 'end';

	/**
	 * Array of action buttons or dropdowns to display in this column.
	 * Each button can have its own handler, icon, and visibility logic.
	 * When buttons are present, the column typically shows buttons instead of data.
	 *
	 * @example
	 * ```typescript
	 * buttons: [
	 *   {
	 *     icon: 'edit',
	 *     title: 'Edit',
	 *     handler: (row) => this.editItem(row),
	 *     hidden: (row) => !row.data.canEdit
	 *   },
	 *   {
	 *     title: 'More Actions',
	 *     buttons: [
	 *       { title: 'Archive', handler: (row) => this.archive(row) },
	 *       { title: 'Delete', handler: (row) => this.delete(row) }
	 *     ]
	 *   }
	 * ]
	 * ```
	 */
	buttons?: Array<PaginableActionButton | PaginableTableDropdown>;

	/**
	 * Filter configuration for the column.
	 * Enables filtering capabilities with various input types and display modes.
	 *
	 * @example
	 * ```typescript
	 * // Text filter displayed in row
	 * filter: { type: 'text', mode: 'row', placeholder: 'Search names...' }
	 *
	 * // Dropdown filter in menu
	 * filter: {
	 *   type: 'dropdown',
	 *   mode: 'menu',
	 *   options: ['Active', 'Inactive'],
	 *   placeholder: 'Select status'
	 * }
	 *
	 * // Date range filter
	 * filter: { type: 'date-range', mode: 'row' }
	 * ```
	 */
	filter?: InputFilter | DropdownFilter | BooleanFilter;

	/**
	 * Indicates that this column contains only buttons and no data.
	 * When true, optimizes the column layout for button display.
	 *
	 * @default false
	 *
	 * @example
	 * ```typescript
	 * {
	 *   property: 'actions',
	 *   onlyButtons: true,
	 *   buttons: [{ icon: 'edit', handler: editHandler }]
	 * }
	 * ```
	 */
	onlyButtons?: boolean;

	/**
	 * Controls the visibility of the table header column.
	 * When true, the entire column (header and all cells) will be hidden.
	 * When false or undefined, the column will be visible.
	 *
	 * Supports multiple types for maximum flexibility:
	 * - **Static boolean**: Simple show/hide based on a fixed value
	 * - **Synchronous function**: Dynamic visibility based on current state
	 * - **Promise**: Asynchronous visibility determination (e.g., from API calls)
	 * - **Observable**: Reactive visibility that responds to state changes
	 *
	 * @example
	 * ```typescript
	 * // Static visibility
	 * hidden: false
	 *
	 * // Dynamic visibility based on user permissions
	 * hidden: () => !this.hasPermission('view.email')
	 *
	 * // Async visibility from API
	 * hidden: () => this.checkColumnVisibility('email')
	 *
	 * // Reactive visibility with state management
	 * hidden: () => this.configService.getColumnVisibility('email')
	 * ```
	 */
	hidden?: boolean | (() => boolean) | (() => Promise<boolean>) | (() => Observable<boolean>);
}

/**
 * Represents the configuration for a text/numeric/date input filter used in a paginable table header.
 * This interface is used for simple input controls like text fields, number inputs, and date pickers.
 *
 * @example
 * ```typescript
 * // Text filter in row mode
 * const nameFilter: InputFilter = {
 *   type: 'text',
 *   mode: 'row',
 *   placeholder: 'Search by name...'
 * };
 *
 * // Number range filter in menu mode
 * const priceFilter: InputFilter = {
 *   type: 'number-range',
 *   mode: 'menu',
 *   key: 'price_range',
 *   placeholder: 'Enter price range'
 * };
 * ```
 */
interface InputFilter {
	/**
	 * Specifies where the filter input should be displayed.
	 * - 'row': Filter appears directly under the column header in a dedicated filter row
	 * - 'menu': Filter appears in a dropdown menu accessible via a filter button
	 *
	 * @default 'row'
	 */
	mode?: 'row' | 'menu';

	/**
	 * The type of input control to render.
	 * Must be one of the values defined in MenuFilterInputType enum.
	 * Determines the UI component and validation behavior.
	 */
	type: `${MenuFilterInputType}`;

	/**
	 * Optional key to identify this filter in the filters object.
	 * If not provided, the column's property name will be used.
	 * Useful when you need a different key than the column property.
	 *
	 * @example
	 * ```typescript
	 * // Column property is 'user.name' but filter key is 'name'
	 * key: 'name'
	 * ```
	 */
	key?: string;

	/**
	 * Placeholder text to display in the input when it's empty.
	 * Provides users with hints about what to enter or how to use the filter.
	 *
	 * @example
	 * ```typescript
	 * placeholder: 'Enter name to search...'
	 * placeholder: 'Select date range'
	 * ```
	 */
	placeholder?: string;
}

/**
 * Enum representing the available input types for menu filters.
 * These types define how the user can input data for filtering.
 */
export enum MenuFilterInputType {
	/**
	 * A simple text input (e.g., string, keyword).
	 */
	Text = 'text',

	/**
	 * A single numeric input (e.g., quantity, price).
	 */
	Number = 'number',

	/**
	 * A range input for numbers (e.g., min and max values).
	 */
	NumberRange = 'number-range',

	/**
	 * A single date input (e.g., created at, due date).
	 */
	Date = 'date',

	/**
	 * A range input for dates (e.g., from - to).
	 */
	DateRange = 'date-range',

	/**
	 * A boolean input for true/false filters
	 */
	Boolean = 'boolean'
}

/**
 * Represents the configuration for a dropdown/select filter used in a paginable table header.
 * This interface is used for filters that present a list of predefined options for the user to choose from.
 * Supports both static options and dynamic options loaded from APIs or observables.
 *
 * @example
 * ```typescript
 * // Simple dropdown with static options
 * const statusFilter: DropdownFilter = {
 *   type: 'dropdown',
 *   mode: 'row',
 *   options: ['Active', 'Inactive', 'Pending'],
 *   placeholder: 'Select status...'
 * };
 *
 * // Advanced dropdown with object options
 * const categoryFilter: DropdownFilter = {
 *   type: 'dropdown',
 *   mode: 'menu',
 *   options: this.categoryService.getCategories(),
 *   bindLabel: 'name',
 *   bindValue: 'id',
 *   placeholder: 'Choose category...'
 * };
 * ```
 */
interface DropdownFilter {
	/**
	 * The filter type identifier. Must be 'dropdown' for this filter type.
	 */
	type: 'dropdown';

	/**
	 * Specifies where the filter dropdown should be displayed.
	 * - 'row': Filter appears directly under the column header in a dedicated filter row
	 * - 'menu': Filter appears in a dropdown menu accessible via a filter button
	 *
	 * @default 'row'
	 */
	mode?: 'row' | 'menu';

	/**
	 * Optional key to identify this filter in the filters object.
	 * If not provided, the column's property name will be used.
	 * Useful when you need a different key than the column property.
	 */
	key?: string;

	/**
	 * The options to display in the dropdown.
	 * Can be:
	 * - Static array of values
	 * - Promise that resolves to an array (for async loading)
	 * - Observable that emits arrays (for reactive data)
	 *
	 * @example
	 * ```typescript
	 * // Static options
	 * options: ['Option 1', 'Option 2', 'Option 3']
	 *
	 * // Object options
	 * options: [
	 *   { id: 1, name: 'Active' },
	 *   { id: 2, name: 'Inactive' }
	 * ]
	 *
	 * // Async options
	 * options: this.http.get('/api/options')
	 * ```
	 */
	options: any[] | Promise<any[]> | Observable<any[]>;

	/**
	 * Placeholder text to display when no option is selected.
	 * Provides users with guidance on what the dropdown is for.
	 *
	 * @example
	 * ```typescript
	 * placeholder: 'Select status...'
	 * placeholder: 'Choose category'
	 * ```
	 */
	placeholder?: string;

	/**
	 * The property name to use as the display label when options are objects.
	 * If not specified, the entire object will be displayed (usually not desired).
	 *
	 * @example
	 * ```typescript
	 * // For options: [{ id: 1, name: 'Active' }, { id: 2, name: 'Inactive' }]
	 * bindLabel: 'name' // Will display 'Active', 'Inactive'
	 * ```
	 */
	bindLabel?: string;

	/**
	 * The property name to use as the actual value when options are objects.
	 * This is what gets stored in the filter value when an option is selected.
	 * If not specified, the entire object will be used as the value.
	 *
	 * @example
	 * ```typescript
	 * // For options: [{ id: 1, name: 'Active' }, { id: 2, name: 'Inactive' }]
	 * bindValue: 'id' // Will store 1 or 2 as the filter value
	 * ```
	 */
	bindValue?: string;
}

/**
 * Represents the configuration for a boolean filter used in a paginable table header.
 * This interface is used for filters that present true/false or yes/no choices to the user.
 * Typically rendered as a dropdown with customizable labels for the boolean states.
 *
 * @example
 * ```typescript
 * // Simple boolean filter
 * const activeFilter: BooleanFilter = {
 *   type: 'boolean',
 *   mode: 'row',
 *   placeholder: 'Select status...'
 * };
 *
 * // Custom boolean filter with labels
 * const verifiedFilter: BooleanFilter = {
 *   type: 'boolean',
 *   mode: 'menu',
 *   trueLabel: 'Verified',
 *   falseLabel: 'Not Verified',
 *   placeholder: 'Verification status'
 * };
 * ```
 */
interface BooleanFilter {
	/**
	 * The filter type identifier. Must be 'boolean' for this filter type.
	 */
	type: 'boolean';

	/**
	 * Specifies where the filter should be displayed.
	 * - 'row': Filter appears directly under the column header in a dedicated filter row
	 * - 'menu': Filter appears in a dropdown menu accessible via a filter button
	 *
	 * @default 'row'
	 */
	mode?: 'row' | 'menu';

	/**
	 * Optional key to identify this filter in the filters object.
	 * If not provided, the column's property name will be used.
	 * Useful when you need a different key than the column property.
	 */
	key?: string;

	/**
	 * Placeholder text to display when no option is selected.
	 * Provides users with guidance on what the filter represents.
	 *
	 * @example
	 * ```typescript
	 * placeholder: 'Select status...'
	 * placeholder: 'Active/Inactive'
	 * ```
	 */
	placeholder?: string;

	/**
	 * Custom label to display for the 'true' option in the dropdown.
	 * If not provided, a default 'True' label will be used.
	 *
	 * @example
	 * ```typescript
	 * trueLabel: 'Active'
	 * trueLabel: 'Verified'
	 * trueLabel: 'Published'
	 * ```
	 */
	trueLabel?: string;

	/**
	 * Custom label to display for the 'false' option in the dropdown.
	 * If not provided, a default 'False' label will be used.
	 *
	 * @example
	 * ```typescript
	 * falseLabel: 'Inactive'
	 * falseLabel: 'Not Verified'
	 * falseLabel: 'Draft'
	 * ```
	 */
	falseLabel?: string;
}

/**
 * Represents the configuration for an icon used in table headers or buttons.
 * This interface provides a standardized way to specify icons from different icon libraries
 * with support for variants and customization.
 *
 * @example
 * ```typescript
 * // FontAwesome icon
 * const editIcon: Icon = {
 *   type: 'font-awesome',
 *   value: 'edit'
 * };
 *
 * // Material icon with variant
 * const userIcon: Icon = {
 *   type: 'material',
 *   variant: 'outlined',
 *   value: 'person'
 * };
 *
 * // Bootstrap icon
 * const deleteIcon: Icon = {
 *   type: 'bootstrap',
 *   value: 'trash'
 * };
 * ```
 */
export interface Icon {
	/**
	 * The icon library/framework to use for rendering the icon.
	 * Determines which icon system and CSS classes will be applied.
	 *
	 * - 'font-awesome': FontAwesome icons (fa-* classes)
	 * - 'material': Material Design icons
	 * - 'bootstrap': Bootstrap icons (bi-* classes)
	 */
	type: 'font-awesome' | 'material' | 'bootstrap';

	/**
	 * Optional variant or style modifier for the icon.
	 * The meaning and available options depend on the icon type:
	 *
	 * - FontAwesome: 'solid', 'regular', 'light', 'brands', etc.
	 * - Material: 'filled', 'outlined', 'rounded', 'sharp', 'two-tone'
	 * - Bootstrap: Usually not used, but could specify weight or style
	 *
	 * @example
	 * ```typescript
	 * // FontAwesome variants
	 * variant: 'solid'   // fa-solid fa-user
	 * variant: 'regular' // fa-regular fa-user
	 *
	 * // Material variants
	 * variant: 'outlined' // material-icons-outlined
	 * variant: 'filled'   // material-icons (default)
	 * ```
	 */
	variant?: string;

	/**
	 * The specific icon identifier/name within the chosen icon library.
	 * This should be the icon name without any prefixes or suffixes
	 * that are handled by the type and variant properties.
	 *
	 * @example
	 * ```typescript
	 * // FontAwesome
	 * value: 'user'      // Becomes: fa-user
	 * value: 'edit'      // Becomes: fa-edit
	 *
	 * // Material
	 * value: 'person'    // Becomes: person (in material-icons font)
	 * value: 'edit'      // Becomes: edit
	 *
	 * // Bootstrap
	 * value: 'person'    // Becomes: bi-person
	 * value: 'pencil'    // Becomes: bi-pencil
	 * ```
	 */
	value: string;
}
