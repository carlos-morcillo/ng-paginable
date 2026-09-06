import { PaginationState } from './pagination-state';

/**
 * A signal-based resource, described by its shape rather than imported.
 *
 * `resource()` landed in Angular 19 and `httpResource()` in 20, while this package still
 * declares `@angular/core >= 18`: importing `ResourceRef` would raise that floor for every
 * consumer, which is a breaking change in exchange for a convenience. Structural typing costs
 * nothing — Angular's own `ResourceRef`, an `httpResource()` and any hand-rolled object with
 * the same three signals all satisfy it — and it is the route the actions adapter between
 * paginable and buttons already takes.
 *
 * @template T The type of the records the resource yields.
 */
export interface HubPaginableResource<T = any> {
	/** The collection, in either shape `[data]` accepts: a plain array or a paginated object. */
	value: () => Array<T> | PaginationState<T> | null | undefined;

	/** Whether a request is in flight. Drives the component's loading state. */
	isLoading: () => boolean;

	/** The failure the last request produced, if any. Drives the component's error state. */
	error: () => unknown;
}
