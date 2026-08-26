import { PaginableTableConfig } from '../interfaces/paginable-table-config';

// SSR-safe: `navigator` does not exist under Node, and this module runs at import time.
export const DEFAULT_LANGUAGE = typeof navigator !== 'undefined' ? (navigator.language.split('-').at(0) ?? 'en') : 'en';
export const DEFAULT_PAGINABLE_CONFIG: PaginableTableConfig = {
	theme: null,
	mapping: {
		currentPage: 'currentPage',
		lastPage: 'lastPage',
		data: 'data',
		total: 'total'
	},
	views: {
		key: 'paginable-table_view_'
	},
	language: DEFAULT_LANGUAGE,
	// Left empty on purpose: each component keeps its own per-input default
	// (e.g. table `paginate` = true, list `paginate` = false). Consumers override
	// only what they need via `providePaginable({ defaults: { ... } })`.
	defaults: {}
};
