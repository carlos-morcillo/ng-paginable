import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { SelectionTypes } from '../../enums/selection-types';
import { HubPaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { HubTableComponent } from './table.component';

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

interface Employee {
	id: number;
	name: string;
	/** Deliberately not a column: the point is matching on something the table does not show. */
	code: string;
}

const PROVIDERS = [
	{ provide: HubTranslationService, useClass: MockHubTranslationService },
	{ provide: HubPaginableService, useClass: MockPaginableService },
	{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
];

const EMPLOYEES: Employee[] = [
	{ id: 1, name: 'Ada', code: 'X-7' },
	{ id: 2, name: 'Grace', code: 'Y-9' }
];

/**
 * `searchFn` decides what "matches" means. The default scans the searchable columns, so a term
 * that only appears in a field no column shows finds nothing — which is exactly the case a
 * consumer reaches for the predicate to solve.
 */
@Component({
	standalone: true,
	imports: [HubTableComponent],
	template: ` <hub-table [headers]="headers" [data]="rows" [searchTerm]="term()" [searchFn]="searchFn()" /> `
})
class SearchHost {
	readonly headers = [{ title: 'Name', property: 'name' }];
	readonly rows = EMPLOYEES;
	readonly term = signal('');
	readonly searchFn = signal<((item: Employee, term: string) => boolean) | undefined>(undefined);
}

/**
 * `compareFn` decides when two selection values are the same record. The default serializes both
 * to JSON, so a stored value that carries only the identifier never matches the row it stands for.
 */
@Component({
	standalone: true,
	imports: [HubTableComponent, FormsModule],
	template: `
		<hub-table
			[headers]="headers"
			[data]="rows"
			[selectable]="selectable"
			[compareFn]="compareFn()"
			[(ngModel)]="selection"
		/>
	`
})
class CompareHost {
	readonly headers = [{ title: 'Name', property: 'name' }];
	readonly rows = EMPLOYEES;
	readonly selectable = SelectionTypes.Multiple;
	readonly compareFn = signal<((a: Employee, b: Employee) => boolean) | undefined>(undefined);
	selection: Array<Partial<Employee>> = [{ id: 1 }];
}

describe('table searchFn', () => {
	let fixture: ComponentFixture<SearchHost>;
	let host: SearchHost;

	const names = () =>
		[...fixture.nativeElement.querySelectorAll('tr.hub-table__body-row')].map((row: HTMLElement) =>
			(row.textContent ?? '').trim()
		);

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SearchHost, BrowserAnimationsModule],
			providers: PROVIDERS
		}).compileComponents();
		fixture = TestBed.createComponent(SearchHost);
		host = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('scans the searchable columns when no predicate is given', () => {
		host.term.set('ada');
		fixture.detectChanges();

		expect(names()).toEqual(['Ada']);
	});

	it('matches on a field no column shows once a predicate is given', () => {
		host.searchFn.set((employee, term) => employee.code.toLowerCase().includes(term));
		host.term.set('y-9');
		fixture.detectChanges();

		expect(names()).toEqual(['Grace']);
	});

	it('hands the predicate the term already trimmed and lowercased, as hub-list does', () => {
		const seen: string[] = [];
		host.searchFn.set((_, term) => {
			seen.push(term);
			return true;
		});
		host.term.set('  ADA  ');
		fixture.detectChanges();

		expect(seen).toContain('ada');
	});

	it('lets the predicate answer for the whole row, so an unmatched term empties the table', () => {
		host.searchFn.set((employee, term) => employee.code.toLowerCase().includes(term));
		host.term.set('ada');
		fixture.detectChanges();

		expect(names()).toEqual([]);
	});
});

describe('table compareFn', () => {
	let fixture: ComponentFixture<CompareHost>;
	let host: CompareHost;

	const rowAt = (index: number) =>
		[...fixture.nativeElement.querySelectorAll('tr.hub-table__body-row')][index] as HTMLElement;

	const isMarked = (index: number) => rowAt(index).classList.contains('hub-table__body-row--selected');

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CompareHost, BrowserAnimationsModule],
			providers: PROVIDERS
		}).compileComponents();
		fixture = TestBed.createComponent(CompareHost);
		host = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('leaves a partial stored value unmatched when no comparator is given', async () => {
		await fixture.whenStable();
		fixture.detectChanges();

		expect(isMarked(0)).toBe(false);
	});

	it('marks the row the stored value stands for once a comparator is given', async () => {
		host.compareFn.set((a, b) => a.id === b.id);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		expect(isMarked(0)).toBe(true);
		expect(isMarked(1)).toBe(false);
	});

	it('unticks through the comparator too, so a click removes the stored value', async () => {
		host.compareFn.set((a, b) => a.id === b.id);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		const checkbox = rowAt(0).querySelector('.hub-table__cell--select input') as HTMLInputElement;
		checkbox.click();
		fixture.detectChanges();

		expect(isMarked(0)).toBe(false);
		expect(host.selection).toEqual([]);
	});
});
