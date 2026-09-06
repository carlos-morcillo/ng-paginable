import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { SelectionTypes } from '../../enums/selection-types';
import { PaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { TableComponent } from './table.component';

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
 * Picking several rows out of a table with a finger means tapping them, and a table whose rows
 * open a record on click gives the second tap to the record instead of to the selection — so the
 * work done so far leaves with the navigation. `selectWhileSelecting` is the opt-in that makes a
 * click mark the row while a selection is under way, and only then: with nothing selected, and
 * with the input off, the click keeps the meaning the consumer gave it.
 */
@Component({
	standalone: true,
	imports: [TableComponent],
	template: `
		<hub-table
			[headers]="headers"
			[data]="rows"
			[selectable]="selectable"
			[clickFn]="open"
			[selectWhileSelecting]="selectWhileSelecting()"
		/>
	`
})
class Host {
	readonly headers = [{ title: 'Name', property: 'name' }];
	readonly selectable = SelectionTypes.Multiple;
	readonly rows = [
		{ id: 1, name: 'Ada' },
		{ id: 2, name: 'Grace' }
	];
	readonly opened = signal(0);
	readonly selectWhileSelecting = signal(true);
	readonly open = () => this.opened.update((count) => count + 1);
}

describe('table selectWhileSelecting', () => {
	let fixture: ComponentFixture<Host>;
	let host: Host;

	const bodyRows = () => [...fixture.nativeElement.querySelectorAll('tr.hub-table__body-row')] as HTMLElement[];

	/** The first cell that is not the selection cell: an ordinary click target on the row. */
	const cellOf = (index: number) =>
		bodyRows()[index].querySelector('.hub-table__cell:not(.hub-table__cell--select)') as HTMLElement;

	const checkboxOf = (index: number) => bodyRows()[index].querySelector('.hub-table__cell--select input') as HTMLInputElement;

	const isMarked = (index: number) => bodyRows()[index].classList.contains('hub-table__body-row--selected');

	/** Starts a selection the way a reader does: by ticking one row's box. */
	const startSelection = () => {
		checkboxOf(0).click();
		fixture.detectChanges();
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [Host, BrowserAnimationsModule],
			providers: [
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: PaginableService, useClass: MockPaginableService },
				{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
			]
		}).compileComponents();
		fixture = TestBed.createComponent(Host);
		host = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('opens the row while nothing is selected', () => {
		cellOf(0).click();
		fixture.detectChanges();

		expect(host.opened()).toBe(1);
		expect(isMarked(0)).toBe(false);
	});

	it('marks the row instead of opening it once a selection is under way', () => {
		startSelection();
		expect(isMarked(0)).toBe(true);

		cellOf(1).click();
		fixture.detectChanges();

		expect(host.opened()).toBe(0);
		expect(isMarked(1)).toBe(true);
	});

	it('unmarks a marked row, and hands the click back once the last one is unmarked', () => {
		startSelection();

		cellOf(0).click();
		fixture.detectChanges();

		expect(isMarked(0)).toBe(false);
		expect(host.opened()).toBe(0);

		cellOf(1).click();
		fixture.detectChanges();

		expect(host.opened()).toBe(1);
		expect(isMarked(1)).toBe(false);
	});

	it('follows the same rule from the keyboard', () => {
		startSelection();

		bodyRows()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		fixture.detectChanges();

		expect(host.opened()).toBe(0);
		expect(isMarked(1)).toBe(true);
	});

	it('leaves the click alone when the input is off', () => {
		host.selectWhileSelecting.set(false);
		fixture.detectChanges();

		startSelection();

		cellOf(1).click();
		fixture.detectChanges();

		expect(host.opened()).toBe(1);
		expect(isMarked(1)).toBe(false);
	});
});
