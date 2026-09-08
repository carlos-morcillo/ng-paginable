import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { MenuFilterOperators, StringMatchModes } from '../../interfaces/column-filter-event';
import { PaginableTableHeader } from '../../interfaces/paginable-table-header';
import { HubPaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { HubTableComponent } from './table.component';

/**
 * The column filter panel — `filter.mode: 'menu'` — is the half of filtering nothing on the
 * documentation site ever drew, so the only evidence it still worked was the client-data service
 * specs, which test the rule engine and never the column that opens it.
 *
 * These read the header cell instead: whether the column offers a trigger at all, whether the
 * trigger says how many rules are narrowing the collection, and whether a menu-shaped value
 * actually removes rows. That is what an example on the site is about to claim.
 */
class MockHubTranslationService {
	translationObserver = new Subject<unknown>().asObservable();
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
	{ property: 'name', title: 'Product', filter: { type: 'text', mode: 'menu' } },
	{ property: 'category', title: 'Category', filter: { type: 'text' } }
];

const PRODUCTS = [
	{ id: 1, name: 'Laptop', category: 'Electronics' },
	{ id: 2, name: 'Desk Lamp', category: 'Office' },
	{ id: 3, name: 'Lamp Shade', category: 'Office' }
];

describe('table column filter panel', () => {
	let fixture: ComponentFixture<HubTableComponent>;

	/** Header cell of a column, by the `data-col` the template stamps on it. */
	function headerCell(property: string): HTMLElement {
		return fixture.nativeElement.querySelector(`.hub-table__header-cell[data-col="${property}"]`);
	}

	/** Names of the products currently drawn in the body. */
	function renderedNames(): string[] {
		return [...fixture.nativeElement.querySelectorAll('tbody tr')].map((row) =>
			((row as HTMLElement).querySelector('td:nth-child(2)')?.textContent ?? '').trim()
		);
	}

	/** Lets the `filters` effect land its `patchValue`, which it schedules 16ms out. */
	async function settle(): Promise<void> {
		fixture.detectChanges();
		await new Promise((resolve) => setTimeout(resolve, 32));
		fixture.detectChanges();
	}

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
		fixture.componentRef.setInput('headers', HEADERS);
		fixture.componentRef.setInput('data', PRODUCTS);
		fixture.componentRef.setInput('paginate', true);
		fixture.detectChanges();
	});

	it('offers the panel trigger on the menu column and nowhere else', () => {
		expect(headerCell('name').querySelector('.hub-table__filter-dropdown')).toBeTruthy();
		expect(headerCell('category').querySelector('.hub-table__filter-dropdown')).toBeNull();
		expect(headerCell('id').querySelector('.hub-table__filter-dropdown')).toBeNull();
	});

	it('keeps the menu column out of the inline filter row', () => {
		const cell = fixture.nativeElement.querySelector('.hub-table__filter-cell[data-col="name"]') as HTMLElement;

		expect(cell?.children.length ?? 0).toBe(0);
	});

	it('narrows the collection with a menu-shaped value', async () => {
		fixture.componentRef.setInput('filters', {
			name: {
				operator: MenuFilterOperators.And,
				rules: [{ value: 'lamp', matchMode: StringMatchModes.Contains }]
			}
		});
		await settle();

		expect(renderedNames()).toEqual(['Desk Lamp', 'Lamp Shade']);
	});

	it('says on the trigger how many rules are narrowing the column', async () => {
		fixture.componentRef.setInput('filters', {
			name: {
				operator: MenuFilterOperators.Or,
				rules: [
					{ value: 'lamp', matchMode: StringMatchModes.Contains },
					{ value: 'laptop', matchMode: StringMatchModes.Contains }
				]
			}
		});
		await settle();

		const trigger = headerCell('name').querySelector('.hub-table__filter-button') as HTMLElement;

		expect(trigger.classList.contains('hub-table__filter-button--active')).toBe(true);
		expect(trigger.querySelector('.hub-table__filter-count')?.textContent?.trim()).toBe('2');
	});

	it('leaves the trigger quiet while no rule is set', () => {
		const trigger = headerCell('name').querySelector('.hub-table__filter-button') as HTMLElement;

		expect(trigger.classList.contains('hub-table__filter-button--active')).toBe(false);
		expect(trigger.querySelector('.hub-table__filter-count')).toBeNull();
	});
});
