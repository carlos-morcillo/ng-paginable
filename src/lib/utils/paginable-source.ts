import { PaginationState } from '../interfaces/pagination-state';

/** A collection split into the records to render and the page metadata that came with them. */
export interface PaginableSource<T> {
	/** The records, whichever shape they arrived in. */
	items: Array<T>;

	/** The page, size and total the collection declared, or `null` when it was a plain array. */
	state: PaginationState<T> | null;
}

/**
 * Reads either accepted collection shape — a plain array or a {@link PaginationState} — into
 * the records to render plus the page metadata to publish.
 *
 * Shared by the `[data]` / `[items]` bindings and by `[resource]` so the two doors into a
 * component cannot come to disagree about what a paginated object means.
 *
 * @param value The collection as the consumer supplied it.
 * @returns The records and, for a paginated object, the state it carried.
 */
export function readPaginableSource<T>(value: Array<T> | PaginationState<T> | null | undefined): PaginableSource<T> {
	if (!value) {
		return { items: [], state: null };
	}

	if (Array.isArray(value)) {
		return { items: value, state: null };
	}

	return { items: (value.data as Array<T>) ?? [], state: value };
}
