import { ModuleWithProviders, NgModule } from '@angular/core';
import { PaginableTableConfig } from './interfaces/paginable-table-config';
import { paginableCoreProviders } from './paginable.providers';
// import { PaginableTableComponent } from './components/paginable-table/paginable-table.component';
// import { HubPaginableTableHeaderDirective } from './directives/paginable-table-header.directive';
// import { HubPaginableTableRowDirective } from './directives/paginable-table-row.directive';
// import { HubPaginableTableCellDirective } from './directives/paginable-table-cell.directive';
// import { PaginableTableLoadingDirective } from './directives/paginable-table-loading.directive';
// import { PaginableTableErrorDirective } from './directives/paginable-table-error.directive';
// import { HubPaginableTableExpandingRowDirective } from './directives/paginable-table-expanding-row.directive';
// import { HubPaginableTableFilterDirective } from './directives/paginable-table-filter.directive';

/**
 * Backward-compatibility module for the paginable components.
 *
 * @deprecated Every component in this package is standalone. Import the ones you use
 * directly (`imports: [HubTableComponent]`) and register `providePaginable()` in your
 * application providers instead of `HubUITableModule.forRoot()`. The module declares and
 * exports nothing, so importing it only pulls in the providers. It will be removed in
 * `23.0.0`, the release that moves this family to Angular 23.
 */
@NgModule({
	imports: [
		// PaginableTableComponent,
		// HubPaginableTableHeaderDirective,
		// HubPaginableTableRowDirective,
		// HubPaginableTableCellDirective,
		// PaginableTableLoadingDirective,
		// PaginableTableErrorDirective,
		// HubPaginableTableExpandingRowDirective,
		// HubPaginableTableFilterDirective
	],
	exports: [
		// PaginableTableComponent,
		// HubPaginableTableHeaderDirective,
		// HubPaginableTableRowDirective,
		// HubPaginableTableCellDirective,
		// PaginableTableLoadingDirective,
		// PaginableTableErrorDirective,
		// HubPaginableTableExpandingRowDirective,
		// HubPaginableTableFilterDirective
	],
	providers: []
})
export class HubUITableModule {
	static forRoot(config?: PaginableTableConfig): ModuleWithProviders<HubUITableModule> {
		return {
			ngModule: HubUITableModule,
			providers: paginableCoreProviders(config)
		};
	}
}
