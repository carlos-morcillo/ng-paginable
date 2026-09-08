import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { PaginableTableHeader } from '../../interfaces/paginable-table-header';
import { HubPaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { HubTableComponent } from './table.component';

/**
 * The column-filter row, and the two questions it has to answer at a glance: which columns
 * offer a filter, and which of them are currently narrowing the collection.
 *
 * The first was answered by nothing at all. The controls were built after the render that drew
 * the row — `FormGroup.addControl` is invisible to change detection — so the row kept the empty
 * cells it was first drawn with until some unrelated event happened to redraw the table. Where
 * they did appear, they wore `.form-control`, a Bootstrap name that resolves to nothing in a
 * product that does not ship Bootstrap.
 */
class MockHubTranslationService {
	translationObserver = new Subject<any>().asObservable();
	getTranslation(key: string) {
		return key;
	}
	setTranslations() {}
	initialize() {}
}

class MockPaginableService {
	config = { language: 'en', mapping: {} };
	get mapping() {
		return this.config.mapping;
	}
	initialize() {}
}

const HEADERS: Array<PaginableTableHeader> = [
	{ property: 'id', title: 'ID' },
	{ property: 'name', title: 'Name', filter: { type: 'text' } },
	{ property: 'price', title: 'Price', filter: { type: 'number-range' } },
	{ property: 'category', title: 'Category', filter: { type: 'dropdown', options: [] } }
];

describe('table column-filter row', () => {
	let fixture: ComponentFixture<HubTableComponent>;
	let component: HubTableComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubTableComponent, BrowserAnimationsModule],
			providers: [
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: HubPaginableService, useClass: MockPaginableService },
				{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(HubTableComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('headers', HEADERS);
		fixture.componentRef.setInput('data', [{ id: 1, name: 'Laptop', price: 1200, category: 'Electronics' }]);
		fixture.detectChanges();
	});

	/**
	 * The regression that made the row useless: the controls exist, but the cells that read
	 * them were drawn before they did and never asked again.
	 */
	it('draws a control for every filterable column on the first render', () => {
		const controls = fixture.nativeElement.querySelectorAll('.hub-table__filter-cell .hub-table__filter-control');
		const ranges = fixture.nativeElement.querySelectorAll('.hub-table__filter-cell hub-table-range-input');

		expect(controls.length + ranges.length).toBe(3);
	});

	it('leaves the cell of a column without a filter empty', () => {
		const cell = fixture.nativeElement.querySelector('.hub-table__filter-cell[data-col="id"]') as HTMLElement;

		expect(cell).toBeTruthy();
		expect(cell.children.length).toBe(0);
	});

	/** The names the library draws with are its own; Bootstrap's resolve to nothing here. */
	it('dresses the controls in the library vocabulary, not Bootstrap class names', () => {
		const row = fixture.nativeElement.querySelector('.hub-table__filter-row') as HTMLElement;

		expect(row.querySelector('.form-control')).toBeNull();
		expect(row.querySelector('.form-select')).toBeNull();
		expect(row.querySelector('select.hub-table__filter-control--select')).toBeTruthy();
	});

	/**
	 * A filter handed down `[filters]` is patched into the form without an event — the row has
	 * to learn about it anyway, or the state only ever appears for filters typed by hand.
	 */
	it('marks the cell of a filter that is narrowing the collection', async () => {
		fixture.componentRef.setInput('filters', { name: 'Laptop' });
		fixture.detectChanges();
		await new Promise((resolve) => setTimeout(resolve, 32));
		fixture.detectChanges();

		const filtered = fixture.nativeElement.querySelector('.hub-table__filter-cell[data-col="name"]') as HTMLElement;
		const untouched = fixture.nativeElement.querySelector('.hub-table__filter-cell[data-col="price"]') as HTMLElement;

		expect(filtered.classList.contains('hub-table__filter-cell--active')).toBe(true);
		expect(untouched.classList.contains('hub-table__filter-cell--active')).toBe(false);
	});

	/**
	 * A range keeps a two-slot array once the field has been touched, so emptiness has to be
	 * read slot by slot or a cleared range would go on claiming to filter something.
	 */
	it('reads an emptied range as no filter at all', () => {
		expect(component.isFilterActive([null, null])).toBe(false);
		expect(component.isFilterActive([10, null])).toBe(true);
		expect(component.isFilterActive('')).toBe(false);
		expect(component.isFilterActive(0)).toBe(true);
		expect(component.isFilterActive(false)).toBe(true);
	});
});

describe('table search box', () => {
	let fixture: ComponentFixture<HubTableComponent>;
	let component: HubTableComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubTableComponent, BrowserAnimationsModule],
			providers: [
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: HubPaginableService, useClass: MockPaginableService },
				{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(HubTableComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('searchable', true);
		fixture.detectChanges();
	});

	it('offers nothing to clear while the box is empty', () => {
		expect(fixture.nativeElement.querySelector('.hub-table__search-clear')).toBeNull();
	});

	it('offers the clear affordance once the box holds a term', () => {
		component.searchProxy$.next('Laptop');
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('.hub-table__search-clear')).toBeTruthy();
	});

	/**
	 * Both the proxy and the model are emptied: the proxy so a keystroke still inside the
	 * debounce window cannot re-apply the term that was just cleared, the model so the
	 * collection reloads at the click rather than a debounce later.
	 */
	it('empties the term and the pending keystroke when clicked', () => {
		component.searchProxy$.next('Laptop');
		fixture.detectChanges();

		(fixture.nativeElement.querySelector('.hub-table__search-clear') as HTMLElement).click();
		fixture.detectChanges();

		expect(component.searchTerm()).toBe('');
		expect(component.searchProxy$.value).toBe('');
		expect(fixture.nativeElement.querySelector('.hub-table__search-clear')).toBeNull();
	});
});
