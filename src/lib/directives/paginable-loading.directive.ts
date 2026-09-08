import { Directive, TemplateRef } from '@angular/core';

/**
 * Captures a projected template used to render the loading state of paginable
 * components. Shared by both the table and the list so consumers can provide a
 * consistent loading indicator regardless of the concrete UI element.
 */
@Directive({
	selector: '[loadingTpt], [paginableLoading], [paginableTableLoading]',
	standalone: true
})
export class HubPaginableLoadingDirective {
	/** Stores the projected template instance so host components can render it on demand. */
	constructor(public template: TemplateRef<any>) {}
}

/**
 * Backward-compatible export kept for integrations that still import the
 * table-prefixed name.
 */
export { HubPaginableLoadingDirective as PaginableTableLoadingDirective };
