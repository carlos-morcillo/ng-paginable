import { Injectable, inject } from '@angular/core';
import {
	BooleanMatchModes,
	DateMatchModes,
	MatchModes,
	MenuFilterOperators,
	MenuFilterRule,
	MenuFilterValue,
	NullMatchModes,
	NumberMatchModes,
	StringMatchModes
} from '../interfaces/column-filter-event';
import { PaginableTableHeader } from '../interfaces/paginable-table-header';
import { PaginableTableOrdination } from '../interfaces/paginable-table-ordination';
import { TableRow } from '../interfaces/table-row';
import { PaginationService } from './pagination.service';

/**
 * In-memory data engine for the table's automatic client-side pagination mode.
 *
 * It receives the full set of {@link TableRow} objects the consumer passed to the
 * table and reproduces — without any backend round-trip — the same data pipeline
 * the table otherwise delegates to the parent component: global search, per-column
 * filtering (both inline "row" filters and the advanced "menu" rule engine) and
 * column sorting. Slicing into pages stays in the component, which owns `page` /
 * `perPage`.
 *
 * It operates on the original `TableRow` references (it never re-wraps the data),
 * so per-row UI state such as `selected` and `collapsed` is preserved across
 * filtering, sorting and page changes.
 *
 * @see PaginationService for the raw-item utility variant used in manual setups.
 */
@Injectable({
	providedIn: 'root'
})
export class TableClientDataService {
	/** Shared utility service reused for nested property access. */
	readonly #pagination = inject(PaginationService);

	/**
	 * Runs the full client-side pipeline (search → column filters → sort) over the
	 * given rows and returns the resulting, still-unpaged collection.
	 *
	 * @template T The row data type.
	 * @param rows The full set of wrapped rows to process.
	 * @param params Search term, searchable keys, header definitions, active filter
	 * values and the current ordination.
	 * @returns A new array of matching rows, sorted; the original array is not mutated.
	 */
	process<T>(
		rows: ReadonlyArray<TableRow<T>>,
		params: {
			searchTerm?: string | null;
			searchKeys?: ReadonlyArray<string>;
			headers?: ReadonlyArray<PaginableTableHeader>;
			filters?: Record<string, unknown> | null;
			ordination?: PaginableTableOrdination | null;
		}
	): Array<TableRow<T>> {
		let result = this.search(rows, params.searchTerm, params.searchKeys ?? []);
		result = this.applyColumnFilters(result, params.headers ?? [], params.filters ?? null);
		result = this.sort(result, params.ordination ?? null);
		return result;
	}

	/**
	 * Filters rows by a global, case-insensitive substring match against the value
	 * of every searchable key.
	 *
	 * @template T The row data type.
	 * @param rows The rows to search.
	 * @param term The search term; falsy/blank terms return the input untouched.
	 * @param keys The data properties to inspect for each row.
	 * @returns The matching rows.
	 */
	search<T>(
		rows: ReadonlyArray<TableRow<T>>,
		term: string | null | undefined,
		keys: ReadonlyArray<string>
	): Array<TableRow<T>> {
		const needle = (term ?? '').trim().toLowerCase();
		if (!needle || !keys.length) {
			return rows.concat();
		}
		return rows.filter((row) =>
			keys.some((key) => {
				const value = this.#pagination.get(row.data, key);
				return value !== null && value !== undefined && String(value).toLowerCase().includes(needle);
			})
		);
	}

	/**
	 * Applies every active per-column filter, keeping only rows that satisfy all of them.
	 *
	 * @template T The row data type.
	 * @param rows The rows to filter.
	 * @param headers The column definitions (only those with a `filter` are considered).
	 * @param filters The current filter values keyed by `filter.key` or `property`.
	 * @returns The matching rows.
	 */
	applyColumnFilters<T>(
		rows: ReadonlyArray<TableRow<T>>,
		headers: ReadonlyArray<PaginableTableHeader>,
		filters: Record<string, unknown> | null
	): Array<TableRow<T>> {
		if (!filters) {
			return rows.concat();
		}
		const active = headers
			.filter((header) => header.filter)
			.map((header) => ({ header, value: filters[header.filter!.key || header.property] }))
			.filter((entry) => this.#hasValue(entry.value));

		if (!active.length) {
			return rows.concat();
		}

		return rows.filter((row) => active.every(({ header, value }) => this.#matchHeader(row, header, value)));
	}

	/**
	 * Returns a sorted copy of the rows based on the current ordination.
	 *
	 * Mirrors {@link PaginationService.orderBy} but reads the sort key from `row.data`.
	 *
	 * @template T The row data type.
	 * @param rows The rows to sort.
	 * @param ordination The property and direction to sort by; falsy returns the input copy.
	 * @returns A new, sorted array.
	 */
	sort<T>(rows: ReadonlyArray<TableRow<T>>, ordination: PaginableTableOrdination | null): Array<TableRow<T>> {
		const copy = rows.concat();
		if (!ordination?.property) {
			return copy;
		}
		const { property, direction } = ordination;
		return copy.sort((rowB, rowA) => {
			const a = this.#pagination.get(rowA.data, property);
			const b = this.#pagination.get(rowB.data, property);
			if (direction === 'DESC') {
				return a > b ? 1 : b > a ? -1 : 0;
			}
			return a < b ? 1 : b < a ? -1 : 0;
		});
	}

	/**
	 * Evaluates a single column filter against a row.
	 *
	 * @param row The row under test.
	 * @param header The column definition holding the filter configuration.
	 * @param value The active filter value for that column.
	 * @returns `true` when the row passes the filter.
	 */
	#matchHeader<T>(row: TableRow<T>, header: PaginableTableHeader, value: unknown): boolean {
		const filter = header.filter!;
		const cell = this.#pagination.get(row.data, header.property);

		if (filter.mode === 'menu') {
			return this.#matchesMenu(cell, value as MenuFilterValue, filter.type);
		}

		switch (filter.type) {
			case 'dropdown':
				return String(cell) === String(value);
			case 'boolean':
				return this.#toBool(cell) === this.#toBool(value);
			case 'number-range':
				return this.#inNumberRange(cell, value as [unknown, unknown]);
			case 'date-range':
				return this.#inDateRange(cell, value as [unknown, unknown]);
			case 'number':
				return Number(cell) === Number(value);
			case 'date':
				return this.#toDay(cell) === this.#toDay(value);
			default:
				return String(cell ?? '')
					.toLowerCase()
					.includes(String(value).toLowerCase());
		}
	}

	/**
	 * Evaluates an advanced "menu" filter value (a set of rules combined with AND/OR).
	 *
	 * @param cell The row's cell value.
	 * @param value The menu filter value.
	 * @param type The filter input type, used to coerce comparisons.
	 * @returns `true` when the rules are satisfied for the configured operator.
	 */
	#matchesMenu(cell: unknown, value: MenuFilterValue, type: string): boolean {
		const rules = value?.rules ?? [];
		if (!rules.length) {
			return true;
		}
		const results = rules.map((rule) => this.#matchRule(cell, rule, type));
		return value.operator === MenuFilterOperators.Or ? results.some(Boolean) : results.every(Boolean);
	}

	/**
	 * Evaluates a single menu-filter rule against a cell value, honouring the rule's
	 * match mode and the column's filter type.
	 *
	 * @param cell The row's cell value.
	 * @param rule The rule (value + match mode) to evaluate.
	 * @param type The filter input type.
	 * @returns `true` when the rule matches.
	 */
	#matchRule(cell: unknown, rule: MenuFilterRule, type: string): boolean {
		const mode = rule.matchMode as MatchModes;

		if (mode === NullMatchModes.IsNull) {
			return this.#isEmpty(cell);
		}
		if (mode === NullMatchModes.IsNotNull) {
			return !this.#isEmpty(cell);
		}

		const ruleValue = rule.value;
		if (ruleValue === null || ruleValue === undefined) {
			return true;
		}

		switch (type) {
			case 'number':
			case 'number-range': {
				const a = Number(cell);
				const b = Number(ruleValue);
				switch (mode) {
					case NumberMatchModes.GreaterThan:
						return a > b;
					case NumberMatchModes.GreaterThanOrEqual:
						return a >= b;
					case NumberMatchModes.LessThan:
						return a < b;
					case NumberMatchModes.LessThanOrEqual:
						return a <= b;
					case NumberMatchModes.Equal:
						return a === b;
					case NumberMatchModes.NotEqual:
						return a !== b;
					default:
						return true;
				}
			}
			case 'date':
			case 'date-range': {
				const a = this.#toDay(cell);
				const b = this.#toDay(ruleValue);
				switch (mode) {
					case DateMatchModes.Equal:
						return a === b;
					case DateMatchModes.NotEqual:
						return a !== b;
					case DateMatchModes.Before:
						return a < b;
					case DateMatchModes.BeforeOrEqual:
						return a <= b;
					case DateMatchModes.After:
						return a > b;
					case DateMatchModes.AfterOrEqual:
						return a >= b;
					default:
						return true;
				}
			}
			case 'boolean': {
				const a = this.#toBool(cell);
				const b = this.#toBool(ruleValue);
				switch (mode) {
					case BooleanMatchModes.NotEqual:
						return a !== b;
					default:
						return a === b;
				}
			}
			default: {
				const a = String(cell ?? '').toLowerCase();
				const b = String(ruleValue).toLowerCase();
				switch (mode) {
					case StringMatchModes.StartsWith:
						return a.startsWith(b);
					case StringMatchModes.Contains:
						return a.includes(b);
					case StringMatchModes.NotContains:
						return !a.includes(b);
					case StringMatchModes.EndsWith:
						return a.endsWith(b);
					case StringMatchModes.Equal:
						return a === b;
					case StringMatchModes.NotEqual:
						return a !== b;
					default:
						return true;
				}
			}
		}
	}

	/**
	 * Tests whether a numeric cell value falls within an inclusive `[from, to]` range,
	 * ignoring `null`/blank bounds.
	 *
	 * @param cell The row's cell value.
	 * @param range The `[from, to]` tuple produced by the range input.
	 * @returns `true` when the value is within range.
	 */
	#inNumberRange(cell: unknown, range: [unknown, unknown]): boolean {
		const value = Number(cell);
		if (Number.isNaN(value)) {
			return false;
		}
		const [from, to] = range ?? [null, null];
		const low = this.#isEmpty(from) ? -Infinity : Number(from);
		const high = this.#isEmpty(to) ? Infinity : Number(to);
		return value >= low && value <= high;
	}

	/**
	 * Tests whether a date cell value falls within an inclusive `[from, to]` range,
	 * ignoring `null`/blank bounds.
	 *
	 * @param cell The row's cell value.
	 * @param range The `[from, to]` tuple produced by the range input.
	 * @returns `true` when the date is within range.
	 */
	#inDateRange(cell: unknown, range: [unknown, unknown]): boolean {
		const value = this.#toDay(cell);
		if (Number.isNaN(value)) {
			return false;
		}
		const [from, to] = range ?? [null, null];
		const low = this.#isEmpty(from) ? -Infinity : this.#toDay(from);
		const high = this.#isEmpty(to) ? Infinity : this.#toDay(to);
		return value >= low && value <= high;
	}

	/**
	 * Normalizes a value to its day-granular timestamp (midnight), or `NaN` when unparseable.
	 *
	 * @param value The value to convert.
	 * @returns The midnight timestamp in milliseconds, or `NaN`.
	 */
	#toDay(value: unknown): number {
		const date = new Date(value as string);
		const time = date.getTime();
		if (Number.isNaN(time)) {
			return NaN;
		}
		return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
	}

	/**
	 * Coerces a value to a boolean, understanding common string/number representations.
	 *
	 * @param value The value to coerce.
	 * @returns The boolean interpretation of the value.
	 */
	#toBool(value: unknown): boolean {
		if (typeof value === 'boolean') {
			return value;
		}
		if (value === 'true' || value === 1 || value === '1') {
			return true;
		}
		if (value === 'false' || value === 0 || value === '0') {
			return false;
		}
		return Boolean(value);
	}

	/**
	 * Returns whether a value is considered empty (`null`, `undefined` or empty string).
	 *
	 * @param value The value to test.
	 * @returns `true` when the value is empty.
	 */
	#isEmpty(value: unknown): boolean {
		return value === null || value === undefined || value === '';
	}

	/**
	 * Returns whether a filter value is "active" (worth filtering by). Handles plain
	 * values, range tuples and menu rule objects. `false` and `0` count as values.
	 *
	 * @param value The filter value to test.
	 * @returns `true` when the filter should be applied.
	 */
	#hasValue(value: unknown): boolean {
		if (this.#isEmpty(value)) {
			return false;
		}
		if (Array.isArray(value)) {
			return value.some((item) => !this.#isEmpty(item));
		}
		if (typeof value === 'object') {
			if ('rules' in (value as Record<string, unknown>)) {
				const rules = (value as MenuFilterValue).rules;
				return Array.isArray(rules) && rules.length > 0;
			}
			return Object.keys(value as Record<string, unknown>).length > 0;
		}
		return true;
	}
}
