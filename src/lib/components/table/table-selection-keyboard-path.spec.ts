import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

/**
 * A selectable table hands the keyboard the checkbox, not the row.
 *
 * `selectWhileSelecting` gives the pointer a shortcut — a click anywhere on a row marks it — and
 * the row carries no `tabindex` unless a `clickFn` makes it a control in its own right. That looks
 * at a glance like a keyboard hole, so this file pins why it is not one: every row already ends up
 * with a checkbox of its own, which is a tab stop by nature, and ticking it does exactly what the
 * shortcut does. Giving the row a stop as well would double the tab stops of a two-hundred-row
 * table to reach a feature the reader can already operate.
 */
@Component({
	standalone: true,
	imports: [HubTableComponent],
	template: ` <hub-table [headers]="headers" [data]="rows" [selectable]="selectable" [selectWhileSelecting]="true" /> `
})
class Host {
	readonly headers = [{ title: 'Name', property: 'name' }];
	readonly selectable = SelectionTypes.Multiple;
	readonly rows = [
		{ id: 1, name: 'Ada' },
		{ id: 2, name: 'Grace' }
	];
}

describe('table selection keyboard path (selectWhileSelecting, no clickFn)', () => {
	let fixture: ComponentFixture<Host>;

	const bodyRows = () => [...fixture.nativeElement.querySelectorAll('tr.hub-table__body-row')] as HTMLElement[];
	const checkboxOf = (index: number) => bodyRows()[index].querySelector('.hub-table__cell--select input') as HTMLInputElement;
	const isMarked = (index: number) => bodyRows()[index].classList.contains('hub-table__body-row--selected');

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

	it('gives every row a checkbox that the keyboard can reach', () => {
		for (const index of [0, 1]) {
			const checkbox = checkboxOf(index);

			expect(checkbox, 'the row has a selection control').toBeTruthy();
			expect(checkbox.disabled, 'and it is operable').toBe(false);
			// A native, enabled input with no tabindex override sits in the natural tab order.
			expect(checkbox.getAttribute('tabindex'), 'and it is left in the natural tab order').toBeNull();

			checkbox.focus();
			expect(document.activeElement, 'so it takes focus').toBe(checkbox);
		}
	});

	it('marks the row from its checkbox, which is what Space on a focused checkbox does', () => {
		checkboxOf(1).focus();
		// Space on a focused checkbox dispatches a click; that click is the whole keyboard path.
		checkboxOf(1).click();
		fixture.detectChanges();

		expect(isMarked(1)).toBe(true);
	});

	it('does not add a second tab stop on the row itself', () => {
		// The row is not a control here: without a clickFn it does nothing the checkbox cannot,
		// and one stop per row would bury the rest of the page under two hundred of them.
		expect(bodyRows().every((row) => row.getAttribute('tabindex') === null)).toBe(true);
	});
});
