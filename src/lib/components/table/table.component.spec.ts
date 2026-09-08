import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';

import { PaginableTableHeader } from '../../interfaces/paginable-table-header';
import { TableRow } from '../../interfaces/table-row';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { HubPaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { HubTableComponent } from './table.component';

// Mock services
class MockHubTranslationService {
	private translationSource = new Subject<any>();
	translationObserver = this.translationSource.asObservable();

	getTranslation(key: string) {
		const translations: Record<string, string> = {
			LOADING: 'loading',
			SEARCH: 'search',
			NO_RESULTS_FOUND: 'No results found',
			SHOWING_X_OF_Y_ROWS: 'Showing {{amount}} of {{total}} rows'
		};
		return translations[key] || key;
	}

	setTranslations() {}
	initialize() {}
}

class MockPaginableService {
	config = {
		language: 'en',
		mapping: {}
	};

	get mapping() {
		return this.config.mapping;
	}

	initialize() {}
}

describe('HubTableComponent', () => {
	let component: HubTableComponent;
	let fixture: ComponentFixture<HubTableComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubTableComponent, BrowserAnimationsModule],
			providers: [
				{
					provide: HubTranslationService,
					useClass: MockHubTranslationService
				},
				{
					provide: HubPaginableService,
					useClass: MockPaginableService
				},
				{
					provide: PaginableConfigService,
					useValue: {
						language: 'en',
						mapping: {}
					}
				}
			]
		}).compileComponents();

		fixture = TestBed.createComponent(HubTableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	describe('Component Creation and Basic Functionality', () => {
		it('should create', () => {
			expect(component).toBeTruthy();
		});

		it('should have default values', () => {
			expect(component.value).toEqual([]);
			expect(component.allRowsSelected).toBe(false);
			expect(component.disabled).toBe(false);
			expect(component.filterLoading).toBe(false);
		});

		it('should generate unique id', () => {
			const id = component.id();
			expect(id).toBeTruthy();
			expect(typeof id).toBe('string');
			expect(id.length).toBe(16);
		});

		it('should apply rtl host class when options.rtl is enabled', () => {
			fixture.componentRef.setInput('options', {
				cursor: 'default',
				hoverableRows: false,
				striped: null,
				variant: null,
				rtl: true
			});
			fixture.detectChanges();

			expect(fixture.nativeElement.classList.contains('hub-table--rtl')).toBe(true);
		});

		it('should render search button before input when rtl is enabled', () => {
			fixture.componentRef.setInput('options', {
				cursor: 'default',
				hoverableRows: false,
				striped: null,
				variant: null,
				rtl: true
			});
			fixture.componentRef.setInput('searchable', true);
			fixture.detectChanges();

			const searchElement = fixture.nativeElement.querySelector('.hub-table__search') as HTMLElement;
			expect(searchElement).toBeTruthy();
			expect(searchElement.firstElementChild?.classList.contains('hub-table__search-button')).toBe(true);
		});
	});

	describe('Colour accent normalization', () => {
		it('should map a semantic variant name to its ds accent token with a raw fallback', () => {
			fixture.componentRef.setInput('options', {
				cursor: 'default',
				hoverableRows: false,
				striped: null,
				variant: 'primary'
			});
			fixture.detectChanges();

			expect(fixture.nativeElement.style.getPropertyValue('--hub-table-accent')).toBe(
				'var(--hub-sys-color-primary, primary)'
			);
		});

		it('should pass a literal accent colour through unchanged', () => {
			fixture.componentRef.setInput('options', {
				cursor: 'default',
				hoverableRows: false,
				striped: null,
				variant: '#ff0000'
			});
			fixture.detectChanges();

			expect(fixture.nativeElement.style.getPropertyValue('--hub-table-accent')).toBe('#ff0000');
		});
	});

	describe('Sticky header ([stickyHeader]) — external scroll container', () => {
		it('should NOT set the sticky-header host class by default', () => {
			expect(fixture.nativeElement.classList.contains('hub-table--sticky-header')).toBe(false);
		});

		it('should set the hub-table--sticky-header host class when [stickyHeader] is enabled', () => {
			// The class is what releases the container scroll context
			// (`--hub-table-container-overflow: visible`) and pins the thead, so a sticky
			// header works inside a consumer's OWN `max-height` + `overflow:auto` box.
			fixture.componentRef.setInput('stickyHeader', true);
			fixture.detectChanges();

			expect(fixture.nativeElement.classList.contains('hub-table--sticky-header')).toBe(true);
		});

		it('should coerce a string "true" (attribute usage) to the sticky-header class', () => {
			fixture.componentRef.setInput('stickyHeader', '' as unknown as boolean);
			fixture.detectChanges();

			// booleanAttribute: presence (empty string) means enabled.
			expect(fixture.nativeElement.classList.contains('hub-table--sticky-header')).toBe(true);
		});
	});

	describe('Selected row via [rowClass] — master-detail (HUBUI-006b)', () => {
		it('should land the public hub-table__row--selected class on the matching <tr>', () => {
			// A consumer marks the active row from its OWN state via [rowClass]; the class
			// reuses the built-in --hub-table-selected-* tint (no repaint, no !important).
			fixture.componentRef.setInput('headers', [
				{ property: 'id', title: 'ID' },
				{ property: 'name', title: 'Name' }
			] as Array<PaginableTableHeader>);
			fixture.componentRef.setInput('data', [
				{ id: 1, name: 'Ada', active: false },
				{ id: 2, name: 'Alan', active: true }
			]);
			fixture.componentRef.setInput('rowClass', (row: { active?: boolean }) =>
				row.active ? 'hub-table__row--selected' : ''
			);
			fixture.detectChanges();

			const rows = fixture.nativeElement.querySelectorAll('tr.hub-table__body-row') as NodeListOf<HTMLElement>;
			expect(rows.length).toBe(2);
			expect(rows[0].classList.contains('hub-table__row--selected')).toBe(false);
			expect(rows[1].classList.contains('hub-table__row--selected')).toBe(true);
		});
	});

	describe('Headers Configuration', () => {
		it('should handle string headers', () => {
			component.headers.set(['name', 'email', 'age']);
			const fixedHeaders = component.fixedHeaders();

			expect(fixedHeaders.length).toBe(3);
			expect(fixedHeaders[0]).toEqual({
				title: 'name',
				property: 'name'
			});
		});

		it('should handle object headers', () => {
			const headers: PaginableTableHeader[] = [
				{ title: 'Name', property: 'name', sortable: true },
				{ title: 'Email', property: 'email', sortable: false }
			];
			component.headers.set(headers);
			const fixedHeaders = component.fixedHeaders();

			expect(fixedHeaders).toEqual(headers);
		});

		it('should configure button-only headers correctly', () => {
			const headers: PaginableTableHeader[] = [
				{
					property: '',
					buttons: [{ label: 'Edit', handler: () => {} }]
				}
			];
			component.headers.set(headers);
			const fixedHeaders = component.fixedHeaders();

			expect(fixedHeaders[0].onlyButtons).toBe(true);
			expect(fixedHeaders[0].align).toBe('end');
			expect(fixedHeaders[0].wrapping).toBe('nowrap');
		});

		it('should count headers correctly', () => {
			component.headers.set(['name', 'email']);
			expect(component.headersCount()).toBe(2);
		});
	});

	describe('Data Handling and Transformation', () => {
		it('should transform array data into table rows', () => {
			const testData = [
				{ id: 1, name: 'John' },
				{ id: 2, name: 'Jane' }
			];
			const transformedRows = testData.map((item) => component.transformIntoRow(item));

			expect(transformedRows.length).toBe(2);
			expect(transformedRows[0].data).toEqual({ id: 1, name: 'John' });
			expect(transformedRows[0].selected).toBe(false);
			expect(transformedRows[0].collapsed).toBe(true);
		});

		it('should handle empty data', () => {
			const emptyData: any[] = [];
			const transformedRows = emptyData.map((item) => component.transformIntoRow(item));
			expect(transformedRows).toEqual([]);
		});
	});

	describe('Pagination Logic', () => {
		it('should calculate number of pages correctly', () => {
			component.perPage.set(10);
			component.totalItems.set(25);
			expect(component.numberOfPages()).toBe(3);
		});

		it('should return null when pagination data is missing', () => {
			component.perPage.set(null);
			component.totalItems.set(25);
			expect(component.numberOfPages()).toBeNull();
		});

		it('should render the initial per-page value in the selector', async () => {
			component.page.set(1);
			component.perPage.set(50);
			component.totalItems.set(100);
			fixture.detectChanges();
			// Allow the NgModel value accessor to apply the selected option.
			await fixture.whenStable();
			fixture.detectChanges();

			const select = fixture.nativeElement.querySelector('.hub-paginator__select') as HTMLSelectElement;
			expect(select).toBeTruthy();
			expect(select.selectedOptions[0]?.textContent?.trim()).toBe('50');
		});

		it('renders the "showing X of Y" line while paginationInfo stays enabled', () => {
			component.page.set(1);
			component.perPage.set(10);
			component.totalItems.set(25);
			fixture.detectChanges();

			expect(fixture.nativeElement.querySelector('.hub-table__bottom-bar-info')).toBeTruthy();
		});

		it('hides the "showing X of Y" line when paginationInfo is false', () => {
			component.page.set(1);
			component.perPage.set(10);
			component.totalItems.set(25);
			fixture.componentRef.setInput('paginationInfo', false);
			fixture.detectChanges();

			expect(fixture.nativeElement.querySelector('.hub-table__bottom-bar-info')).toBeNull();
		});
	});

	describe('Filtering System', () => {
		it('should identify headers with filters', () => {
			const headers: PaginableTableHeader[] = [
				{ title: 'Name', property: 'name', filter: { type: 'text' } },
				{
					title: 'Age',
					property: 'age',
					filter: { type: 'number-range' }
				},
				{ title: 'Email', property: 'email' }
			];
			component.headers.set(headers);

			const headerFilters = component.headerFilters();
			expect(headerFilters.length).toBe(2);
		});

		it('should detect inline column filters', () => {
			const headers: PaginableTableHeader[] = [{ title: 'Name', property: 'name', filter: { type: 'text' } }];
			component.headers.set(headers);

			expect(component.hasColumnFilters()).toBe(true);
		});

		it('should not detect menu-only filters as inline', () => {
			const headers: PaginableTableHeader[] = [
				{
					title: 'Name',
					property: 'name',
					filter: { type: 'text', mode: 'menu' }
				}
			];
			component.headers.set(headers);

			expect(component.hasColumnFilters()).toBe(false);
		});

		it('should clear filters', () => {
			// First add controls to the FormGroup using FormControl constructor
			component.filtersFG.addControl('name', new FormControl(''));
			component.filtersFG.addControl('age', new FormControl(''));

			component.filtersFG.patchValue({ name: 'John', age: 25 });
			expect(component.filtersFG.value.name).toBe('John');
			expect(component.filtersFG.value.age).toBe(25);

			component.clearFilters();
			// After reset(), form controls return to null (default Angular behavior)
			expect(component.filtersFG.value.name).toBeNull();
			expect(component.filtersFG.value.age).toBeNull();
		});
	});

	describe('Sorting Functionality', () => {
		it('should sort by column', () => {
			const header: PaginableTableHeader = {
				title: 'Name',
				property: 'name',
				sortable: true
			};

			component.sort(header);
			expect(component.ordination()?.property).toBe('name');
			expect(component.ordination()?.direction).toBe('ASC');
		});

		it('should toggle sort direction', () => {
			const header: PaginableTableHeader = {
				title: 'Name',
				property: 'name',
				sortable: true
			};

			component.ordination.set({ property: 'name', direction: 'ASC' });
			component.sort(header);
			expect(component.ordination()?.direction).toBe('DESC');

			component.sort(header);
			expect(component.ordination()?.direction).toBe('ASC');
		});

		it('should not sort non-sortable columns', () => {
			const header: PaginableTableHeader = {
				title: 'Name',
				property: 'name',
				sortable: false
			};

			const initialOrdination = component.ordination();
			component.sort(header);
			expect(component.ordination()).toBe(initialOrdination);
		});

		it('should return correct sort icon class', () => {
			const header: PaginableTableHeader = {
				title: 'Name',
				property: 'name',
				sortable: true
			};

			// No sort applied
			expect(component.getOrdenationClass(header)).toBe('hub-table__icon--sort');

			// ASC sort
			component.ordination.set({ property: 'name', direction: 'ASC' });
			expect(component.getOrdenationClass(header)).toBe('hub-table__icon--sort-up');

			// DESC sort
			component.ordination.set({ property: 'name', direction: 'DESC' });
			expect(component.getOrdenationClass(header)).toBe('hub-table__icon--sort-down');
		});
	});

	describe('Template System', () => {
		it('should retrieve header template', () => {
			const header: PaginableTableHeader = {
				title: 'Name',
				property: 'name'
			};
			const template = component.getHeaderTemplate(header);

			// In basic test setup, no templates are configured
			expect(template).toBeNull();
		});

		it('should retrieve cell template', () => {
			const header: PaginableTableHeader = {
				title: 'Name',
				property: 'name'
			};
			const template = component.getCellTemplate(header);

			expect(template).toBeNull();
		});

		it('should retrieve filter template', () => {
			const header: PaginableTableHeader = {
				title: 'Name',
				property: 'name'
			};
			const template = component.getFilterTemplate(header);

			expect(template).toBeNull();
		});
	});

	describe('Event Handling', () => {
		it('should handle row click events', () => {
			const mockEvent = new MouseEvent('click');
			const row: TableRow = {
				data: { id: 1, name: 'John' },
				selected: false,
				collapsed: true
			};

			// Test that onItemClick doesn't throw when no clickFn is set
			expect(() => component.onItemClick(mockEvent, row)).not.toThrow();
		});

		it('should not handle clicks when no click function is set', () => {
			const mockEvent = new MouseEvent('click');
			const row: TableRow = {
				data: { id: 1, name: 'John' },
				selected: false,
				collapsed: true
			};

			// Should not throw error
			expect(() => component.onItemClick(mockEvent, row)).not.toThrow();
		});

		it('should handle action button clicks', () => {
			const mockHandler = vi.fn().mockName('handler');
			const mockEvent = new MouseEvent('click');
			const button = { title: 'Edit', handler: mockHandler };
			const row: TableRow = {
				data: { id: 1, name: 'John' },
				selected: false,
				collapsed: true
			};

			vi.spyOn(mockEvent, 'stopPropagation').mockReturnValue(undefined);

			component.handleAction(mockEvent, button, row);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockHandler).toHaveBeenCalledWith(row);
		});

		it('should handle batch actions', () => {
			const mockHandler = vi.fn().mockName('handler');
			const button = { label: 'Delete', handler: mockHandler };

			component.value = [{ id: 1 }, { id: 2 }];
			component.handleBatchAction(button);

			expect(mockHandler).toHaveBeenCalledWith(component.value);
		});
	});

	describe('Expandable Rows', () => {
		it('should toggle row expansion', () => {
			const row: TableRow = {
				data: { id: 1, name: 'John' },
				selected: false,
				collapsed: true
			};

			component.toggleExpandedRow(row);
			expect(row.collapsed).toBe(false);

			component.toggleExpandedRow(row);
			expect(row.collapsed).toBe(true);
		});
	});

	describe('ControlValueAccessor Implementation', () => {
		it('should write value', () => {
			const value = [{ id: 1, name: 'John' }];
			component.writeValue(value);

			expect(component.value).toEqual(value);
		});

		it('should write single value as array', () => {
			const value = { id: 1, name: 'John' };
			component.writeValue(value);

			expect(component.value).toEqual([value]);
		});

		it('should handle null value', () => {
			component.writeValue(null);
			expect(component.value).toEqual([]);
		});

		it('should register onChange callback', () => {
			const callback = vi.fn().mockName('onChange');
			component.registerOnChange(callback);

			expect(component.onChange).toBe(callback);
		});

		it('should register onTouched callback', () => {
			const callback = vi.fn().mockName('onTouched');
			component.registerOnTouched(callback);

			expect(component.onTouch).toBe(callback);
		});

		it('should set disabled state', () => {
			component.setDisabledState(true);
			expect(component.disabled).toBe(true);

			component.setDisabledState(false);
			expect(component.disabled).toBe(false);
		});
	});

	describe('Utility Methods', () => {
		it('should check if array contains primitive values', () => {
			const items = [1, 2, 3];
			expect(component['_contains'](items, 2)).toBe(true);
			expect(component['_contains'](items, 4)).toBe(false);
		});

		it('should check if array contains objects', () => {
			const items = [
				{ id: 1, name: 'John' },
				{ id: 2, name: 'Jane' }
			];
			const needle = { id: 1, name: 'John' };

			expect(component['_contains'](items, needle)).toBe(true);
			expect(component['_contains'](items, { id: 3, name: 'Bob' })).toBe(false);
		});
	});

	describe('Performance and Memory Management', () => {
		it('should handle large datasets without performance issues', () => {
			const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
				id: i,
				name: `User ${i}`,
				email: `user${i}@example.com`
			}));

			const startTime = performance.now();
			const transformedRows = largeDataset.map((item) => component.transformIntoRow(item));
			fixture.detectChanges();
			const endTime = performance.now();

			// Should complete within reasonable time (less than 100ms)
			expect(endTime - startTime).toBeLessThan(100);
			expect(transformedRows.length).toBe(1000);
		});

		it('should properly cleanup when destroyed', () => {
			expect(fixture.componentRef).toBeTruthy();

			// Verify component exists before destroy
			expect(component).toBeTruthy();

			const destroySpy = vi.spyOn(fixture.componentRef, 'destroy');

			fixture.destroy();

			// Verify destroy was called
			expect(destroySpy).toHaveBeenCalled();
		});
	});

	/**
	 * Test suite for the rowClass functionality.
	 */
	describe('rowClass functionality', () => {
		/**
		 * Test case to verify that a string rowClass is applied correctly.
		 */
		it('should apply a string rowClass', () => {
			const row: TableRow = { data: { id: 1, name: 'John' }, selected: false, collapsed: true };
			fixture.componentRef.setInput('rowClass', 'my-class');
			const rowClass = component._getRowClass(row);
			expect(rowClass).toBe('my-class');
		});

		/**
		 * Test case to verify that a function rowClass is applied correctly.
		 */
		it('should apply a function rowClass', () => {
			const row: TableRow = { data: { id: 1, name: 'John' }, selected: false, collapsed: true };
			fixture.componentRef.setInput('rowClass', (item: any) => (item.id === 1 ? 'first-row' : 'other-row'));
			const rowClass = component._getRowClass(row);
			expect(rowClass).toBe('first-row');
		});

		/**
		 * Test case to verify that nothing happens if rowClass is not provided.
		 */
		it('should do nothing if rowClass is not provided', () => {
			const row: TableRow = { data: { id: 1, name: 'John' }, selected: false, collapsed: true };
			const rowClass = component._getRowClass(row);
			expect(rowClass).toBe('');
		});
	});

	/**
	 * Test suite for the automatic client-side pagination mode (array + paginate=true).
	 */
	describe('Client-side pagination mode', () => {
		const dataset = Array.from({ length: 25 }, (_, i) => ({
			id: i + 1,
			name: `User ${i + 1}`,
			age: 20 + (i % 5)
		}));

		beforeEach(() => {
			component.headers.set(['name', 'age']);
		});

		it('enters client mode with a plain array and paginate=true', () => {
			fixture.componentRef.setInput('data', dataset);
			component.perPage.set(10);
			fixture.detectChanges();

			expect(component.clientMode()).toBe(true);
			expect(component.clientFilteredRows().length).toBe(25);
			expect(component.displayedRows().length).toBe(10);
			expect(component.numberOfPages()).toBe(3);
			expect(component.page()).toBe(1);
		});

		it('slices the requested page from the array', () => {
			fixture.componentRef.setInput('data', dataset);
			component.perPage.set(10);
			fixture.detectChanges();

			component.page.set(2);
			expect(component.displayedRows().map((r) => r.data.id)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
		});

		it('searches in memory and recomputes the total', () => {
			fixture.componentRef.setInput('data', dataset);
			component.perPage.set(10);
			fixture.detectChanges();

			// 'User 1' matches 'User 1' and 'User 10'..'User 19' => 11 rows.
			component.searchTerm.set('User 1');
			expect(component.clientFilteredRows().length).toBe(11);
			expect(component.displayedRows().length).toBe(10);
			expect(component.numberOfPages()).toBe(2);
		});

		it('sorts the array in memory', () => {
			fixture.componentRef.setInput('data', dataset);
			component.perPage.set(30);
			fixture.detectChanges();

			component.ordination.set({ property: 'id', direction: 'DESC' });
			expect(component.displayedRows()[0].data.id).toBe(25);
		});

		it('renders the full array when paginate is false', () => {
			fixture.componentRef.setInput('data', dataset);
			fixture.componentRef.setInput('paginate', false);
			component.perPage.set(10);
			fixture.detectChanges();

			expect(component.clientMode()).toBe(false);
			expect(component.displayedRows().length).toBe(25);
		});

		it('stays in server mode when totalItems is provided', () => {
			const firstPage = dataset.slice(0, 10);
			fixture.componentRef.setInput('data', firstPage);
			component.totalItems.set(25);
			component.perPage.set(10);
			fixture.detectChanges();

			expect(component.clientMode()).toBe(false);
			expect(component.displayedRows().length).toBe(10);
			expect(component.numberOfPages()).toBe(3);
		});

		it('stays in server mode when given a PaginationState', () => {
			fixture.componentRef.setInput('data', {
				page: 2,
				perPage: 10,
				totalItems: 25,
				data: dataset.slice(10, 20)
			});
			fixture.detectChanges();

			expect(component.clientMode()).toBe(false);
			expect(component.page()).toBe(2);
			expect(component.totalItems()).toBe(25);
			expect(component.displayedRows().length).toBe(10);
		});
	});

	/**
	 * The wiring the directive's own spec cannot see: the row-action button must take its
	 * label from the table's tooltip directive rather than from a hardcoded attribute.
	 * With no adapter registered what comes out is still the native `title`, so nothing
	 * changes for an application that has not opted in — plus the accessible name a bare
	 * icon button never had.
	 */
	describe('Row-action tooltip', () => {
		it('routes the button tooltip through the table tooltip directive', () => {
			fixture.componentRef.setInput('headers', [
				{
					property: '',
					buttons: [{ icon: 'pencil', tooltip: 'Rectify the invoice', handler: () => {} }]
				}
			] as Array<PaginableTableHeader>);
			fixture.componentRef.setInput('data', [{ id: 1 }]);
			fixture.detectChanges();

			const button = fixture.nativeElement.querySelector('.hub-table__cell-btn') as HTMLElement;

			expect(button).toBeTruthy();
			expect(button.getAttribute('title')).toBe('Rectify the invoice');
			expect(button.getAttribute('aria-label')).toBe('Rectify the invoice');
		});
	});
});
