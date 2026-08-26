import { Directive, TemplateRef } from '@angular/core';

/**
 * Captures a projected template used to render the "no results" state of paginable components.
 * The same directive is shared by both list and table components so consumers can provide
 * a consistent fallback template regardless of the concrete UI element.
 */
@Directive({
	selector:
		'[noResultsTpt], [paginableNoResults], [emptyStateTpt], [paginableEmptyState], [noDataTpt], [paginableTableNotFound]',
	standalone: true
})
export class PaginableNoResultsDirective {
	/**
	 * Stores the projected template instance so host components can render it on demand.
	 */
	constructor(public template: TemplateRef<any>) {}
}

/**
 * Backward-compatible export kept for existing integrations that still use previous names.
 */
export { PaginableNoResultsDirective as PaginableEmptyStateDirective };
export { PaginableNoResultsDirective as PaginableTableNotFoundDirective };
