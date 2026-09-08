import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

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

/**
 * Selecting rows and opening a row are two intentions that share one surface. The checkbox
 * itself always stopped the row click, but the cell around it did not, and a native checkbox
 * is a fraction of the cell it sits in — so a pointer that missed by a few pixels ran the
 * consumer's `clickFn`, which commonly navigates, and the selection built up so far was gone.
 */
@Component({
	standalone: true,
	imports: [HubTableComponent],
	template: ` <hub-table [headers]="headers" [data]="rows" [selectable]="true" [multiple]="true" [clickFn]="open" /> `
})
class Host {
	readonly headers = [{ title: 'Name', property: 'name' }];
	readonly rows = [
		{ id: 1, name: 'Ada' },
		{ id: 2, name: 'Grace' }
	];
	readonly opened = signal(0);
	readonly open = () => this.opened.update((n) => n + 1);
}

/**
 * Single selection with a checkbox is a control that lies: a checkbox says the rows are
 * independent, and then picking a second one releases the first. The list in this same package
 * has always drawn a radio here; the table had not caught up.
 */
@Component({
	standalone: true,
	imports: [HubTableComponent, FormsModule],
	template: ` <hub-table [headers]="headers" [data]="rows" [selectable]="true" [(ngModel)]="picked" /> `
})
class SingleHost {
	readonly headers = [{ title: 'Name', property: 'name' }];
	readonly rows = [
		{ id: 1, name: 'Ada' },
		{ id: 2, name: 'Grace' }
	];
	picked: any = null;
}

describe('table selection cell', () => {
	let fixture: ComponentFixture<Host>;

	const cell = () => fixture.nativeElement.querySelector('.hub-table__cell--select') as HTMLElement;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [Host, BrowserAnimationsModule],
			providers: [
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: HubPaginableService, useClass: MockPaginableService },
				{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
			]
		}).compileComponents();
		fixture = TestBed.createComponent(Host);
		fixture.detectChanges();
	});

	it('does not open the row when the click lands in the cell but misses the checkbox', () => {
		expect(cell()).toBeTruthy();

		cell().click();

		expect(fixture.componentInstance.opened()).toBe(0);
	});

	it('still opens the row from an ordinary cell', () => {
		const other = fixture.nativeElement.querySelector('.hub-table__cell:not(.hub-table__cell--select)') as HTMLElement;

		other.click();

		expect(fixture.componentInstance.opened()).toBe(1);
	});

	it('gives the checkbox the whole cell to be hit in', () => {
		const label = cell().querySelector('.hub-table__select-hit');

		expect(label).toBeTruthy();
		expect(label!.querySelector('input[type="checkbox"]')).toBeTruthy();
	});

	// The select-all box is the same control in the same column. Wrapping only the body left the
	// two boxes centred by different rules, so the column read as two columns.
	it('dresses the select-all box in the header the same way', () => {
		const header = fixture.nativeElement.querySelector('.hub-table__header-cell--actions') as HTMLElement;
		const label = header.querySelector('.hub-table__select-hit');

		expect(label).toBeTruthy();
		expect(label!.querySelector('input[type="checkbox"]')).toBeTruthy();
	});
});

/**
 * A row that runs a consumer's `clickFn` is a control, and it answered only to the mouse: no
 * tab stop, no key. For anybody driving the page from the keyboard the action was not there.
 */
describe('table clickable row, from the keyboard', () => {
	let fixture: ComponentFixture<Host>;

	const row = () => fixture.nativeElement.querySelector('.hub-table__body-row') as HTMLElement;
	const press = (key: string, target: Element) => target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [Host, BrowserAnimationsModule],
			providers: [
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: HubPaginableService, useClass: MockPaginableService },
				{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
			]
		}).compileComponents();
		fixture = TestBed.createComponent(Host);
		fixture.detectChanges();
	});

	it('takes a tab stop when there is something to activate', () => {
		expect(row().getAttribute('tabindex')).toBe('0');
	});

	it('opens the row on Enter', () => {
		press('Enter', row());

		expect(fixture.componentInstance.opened()).toBe(1);
	});

	it('opens the row on Space', () => {
		press(' ', row());

		expect(fixture.componentInstance.opened()).toBe(1);
	});

	it('leaves the row alone when the key was meant for a control inside it', () => {
		const checkbox = row().querySelector('input[type="checkbox"]')!;

		press('Enter', checkbox);

		expect(fixture.componentInstance.opened()).toBe(0);
	});
});

describe('table selection cell, one row at a time', () => {
	let fixture: ComponentFixture<SingleHost>;

	const boxes = (type: string) =>
		Array.from(
			fixture.nativeElement.querySelectorAll(`.hub-table__cell--select input[type="${type}"]`)
		) as HTMLInputElement[];

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SingleHost, BrowserAnimationsModule, FormsModule],
			providers: [
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: HubPaginableService, useClass: MockPaginableService },
				{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
			]
		}).compileComponents();
		fixture = TestBed.createComponent(SingleHost);
		fixture.detectChanges();
	});

	it('draws a radio, not a checkbox', () => {
		expect(boxes('radio').length).toBe(2);
		expect(boxes('checkbox').length).toBe(0);
	});

	// A radio group is scoped by name across the document, so two tables on one page would
	// otherwise share one selection between them.
	it('groups its radios under a name of its own', () => {
		const names = new Set(boxes('radio').map((input) => input.name));

		expect(names.size).toBe(1);
		expect([...names][0]).toMatch(/^hub-table-selection-/);
	});

	it('releases the row that was picked before', () => {
		boxes('radio')[0].click();
		fixture.detectChanges();
		boxes('radio')[1].click();
		fixture.detectChanges();

		expect(boxes('radio').map((input) => input.checked)).toEqual([false, true]);
	});

	// The checkbox could be unticked, and that is worth keeping: a native radio cannot, so the
	// clearing has to come from the component.
	it('clears the pick when the chosen radio is clicked again', () => {
		boxes('radio')[0].click();
		fixture.detectChanges();
		boxes('radio')[0].click();
		fixture.detectChanges();

		expect(boxes('radio').every((input) => !input.checked)).toBe(true);
	});
});
