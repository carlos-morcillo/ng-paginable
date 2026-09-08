import { Component, ViewContainerRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { HubPaginableTableExpandingRowDirective } from '../directives/paginable-table-expanding-row.directive';
import { PaginableTableHeader } from '../interfaces/paginable-table-header';
import { HubPaginableService } from '../services/paginable.service';
import { PaginableConfigService } from '../services/paginate-config.service';
import { HubDropdownComponent } from './dropdown/dropdown.component';
import { HubListComponent } from './list/paginable-list/list.component';
import { MenuFilterComponent } from './menu-filter/menu-filter.component';
import { HubPaginableTableDropdownComponent } from './paginable-table-dropdown/paginable-table-dropdown.component';
import { HubTableComponent } from './table/table.component';

/**
 * Every piece of chrome this library draws has to be dressed by this library.
 *
 * The filter panel, the dropdown and the legacy row-actions menu named their appearance
 * after Bootstrap — `.btn`, `.dropdown-menu`, `.dropdown-item`, `.dropdown-toggle`,
 * `.form-control`, `.form-select` — and the table and the list still carried `.btn` and
 * `.text-danger` on three controls of their own. Two consumer-visible failures, opposite
 * in direction and both real:
 *
 *   · without Bootstrap the names resolve to nothing, so the filter panel came out as bare
 *     text on a transparent box and the disclosure caret fell back to the browser's grey
 *     button;
 *   · with Bootstrap the host application's stylesheet owned the appearance of the
 *     library's own internals, so a theme change there silently reshaped them.
 *
 * The assertions come in two halves, because a rename on its own would satisfy the first
 * while leaving the components exactly as unstyled: the markup must not name a stylesheet
 * the family does not ship, AND the family must ship rules for the names it uses instead.
 *
 * The second half is asserted on the shipped rules rather than measured, like the row-action
 * bench next door and for the same reason: jsdom lays nothing out, so a measurement would
 * report zeroes and pass anything.
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

/** Every class token on `root` and everything under it. */
function classesUnder(root: Element): Set<string> {
	const found = new Set<string>();
	for (const element of [root, ...Array.from(root.querySelectorAll('*'))]) {
		element.classList.forEach((name) => found.add(name));
	}
	return found;
}

/** The Bootstrap names found under `root`, listed so a failure names the offender. */
function bootstrapNamesUnder(root: Element, names: ReadonlyArray<string>): string[] {
	const present = classesUnder(root);
	return names.filter((name) => present.has(name));
}

/** Selectors of every shipped rule that mentions `fragment`, in source order. */
function rulesFor(fragment: string): { selector: string; style: CSSStyleDeclaration }[] {
	const out: { selector: string; style: CSSStyleDeclaration }[] = [];
	for (const sheet of [...document.styleSheets]) {
		let rules: CSSRule[];
		try {
			rules = [...(sheet.cssRules ?? [])];
		} catch {
			continue; // another origin: not ours, and not readable
		}
		for (const rule of rules) {
			const style = rule as CSSStyleRule;
			if (style.selectorText?.includes(fragment) && style.style) {
				out.push({ selector: style.selectorText, style: style.style });
			}
		}
	}
	return out;
}

/** Every declared value of `property` among the rules that mention `fragment`. */
function declared(fragment: string, property: string): string[] {
	return rulesFor(fragment)
		.map(({ style }) => style.getPropertyValue(property))
		.filter(Boolean);
}

describe('the filter panel dresses itself', () => {
	let fixture: ComponentFixture<MenuFilterComponent>;
	let component: MenuFilterComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MenuFilterComponent, ReactiveFormsModule],
			providers: [
				FormBuilder,
				{ provide: HubPaginableService, useClass: MockPaginableService },
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: HubDropdownComponent, useValue: { closeDropdown: () => undefined } }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(MenuFilterComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('header', {
			property: 'name',
			title: 'Name',
			filter: { type: 'text' }
		} as PaginableTableHeader);
		component.writeValue(null);
		// A second rule, so the remove trigger and the divider are drawn too.
		component.add();
		fixture.detectChanges();
	});

	it('names no stylesheet the family does not ship', () => {
		expect(
			bootstrapNamesUnder(fixture.nativeElement, [
				'btn',
				'btn-sm',
				'btn-primary',
				'btn-outline-danger',
				'dropdown-item',
				'dropdown-divider',
				'form-control',
				'form-select'
			])
		).toEqual([]);
	});

	it('draws its rows, its fields and its triggers under its own names', () => {
		expect(fixture.nativeElement.querySelectorAll('.hub-filter__item').length).toBeGreaterThan(0);
		expect(fixture.nativeElement.querySelectorAll('.hub-filter__control').length).toBeGreaterThan(0);
		expect(fixture.nativeElement.querySelector('.hub-filter__divider-line')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('.hub-filter__remove-rule')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('.hub-filter__add-rule-btn')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('.hub-filter__clear')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('.hub-filter__apply')).toBeTruthy();
	});

	/** A rename with no rules behind it would leave the panel exactly as unstyled as before. */
	it('ships the box its fields and rows used to borrow', () => {
		expect(declared('hub-filter__control', 'display')).toContain('block');
		expect(declared('hub-filter__item', 'display')).toContain('block');
		expect(rulesFor('hub-filter__apply').length).toBeGreaterThan(0);
		expect(rulesFor('hub-filter__clear').length).toBeGreaterThan(0);
	});
});

describe('the dropdown dresses itself', () => {
	@Component({
		standalone: true,
		imports: [HubDropdownComponent],
		template: `
			<hub-dropdown>
				<div class="button">Open</div>
				<div class="content">Item</div>
			</hub-dropdown>
			<ng-container #outlet></ng-container>
		`
	})
	class Host {
		readonly dropdown = viewChild.required(HubDropdownComponent);
		readonly outlet = viewChild.required('outlet', { read: ViewContainerRef });
	}

	let fixture: ComponentFixture<Host>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();

		fixture = TestBed.createComponent(Host);
		fixture.detectChanges();
	});

	it('gives its host and its trigger names of its own', () => {
		const host = fixture.nativeElement.querySelector('hub-dropdown') as HTMLElement;

		expect(host.classList.contains('hub-dropdown')).toBe(true);
		expect(bootstrapNamesUnder(host, ['btn', 'dropdown'])).toEqual([]);
		expect(host.querySelector('.hub-dropdown__toggle')).toBeTruthy();
	});

	/**
	 * The panel lives in an `ng-template` the overlay attaches, so it is rendered here the
	 * way the component renders it: what is under test is the panel, not the placement.
	 */
	it('gives its panel a name of its own instead of Bootstrap two', () => {
		const view = fixture.componentInstance
			.outlet()
			.createEmbeddedView(fixture.componentInstance.dropdown().dropdownContent());
		view.detectChanges();
		const panel = view.rootNodes[0] as HTMLElement;

		expect(panel.classList.contains('hub-dropdown__menu')).toBe(true);
		expect(panel.classList.contains('dropdown-menu')).toBe(false);
		expect(panel.classList.contains('show')).toBe(false);

		view.destroy();
	});

	/** Without Bootstrap the panel was a transparent box: a surface is the whole point. */
	it('ships the surface the panel used to borrow', () => {
		expect(declared('hub-dropdown__menu', 'display')).toContain('block');
		expect(declared('hub-dropdown__menu', 'list-style')).not.toEqual([]);
		expect(declared('hub-dropdown__menu', 'min-width')).toContain('10rem');
	});
});

describe('the legacy row-actions menu dresses itself', () => {
	let fixture: ComponentFixture<HubPaginableTableDropdownComponent>;
	let component: HubPaginableTableDropdownComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubPaginableTableDropdownComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(HubPaginableTableDropdownComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('options', { buttons: [{ label: 'Edit', handler: () => undefined }] });
		fixture.detectChanges();
	});

	afterEach(() => component.close());

	it('names no stylesheet the family does not ship on its trigger', () => {
		expect(bootstrapNamesUnder(fixture.nativeElement, ['btn', 'dropdown-toggle', 'text-muted'])).toEqual([]);
		expect(fixture.nativeElement.querySelector('.hub-table-dropdown__toggle')).toBeTruthy();
	});

	/** `color` is a free-form word, so it is painted rather than turned into a class per role. */
	it('resolves the trigger colour through the design system', () => {
		fixture.componentRef.setInput('options', { buttons: [], color: 'primary' });
		fixture.detectChanges();

		expect(component.toggleColor()).toBe('var(--hub-sys-color-primary, primary)');
		expect(component.buttonClass()).toBe('hub-table-dropdown__toggle--clear');
	});

	/**
	 * The default is the path nobody passes a colour for, so it is the one that has to resolve.
	 * `muted` reads like a design-system role and is not one: there is no `--hub-sys-color-muted`,
	 * only `--hub-sys-text-muted`, so the declaration was invalid and the browser threw it away —
	 * the trigger lost its grey and inherited the table's ink instead.
	 */
	it('resolves the default trigger colour to a token the design system actually emits', () => {
		fixture.componentRef.setInput('options', { buttons: [] });
		fixture.detectChanges();

		expect(component.toggleColor()).toBe('var(--hub-sys-color-neutral, neutral)');
		expect(component.toggleColor()).not.toContain('--hub-sys-color-muted');
	});

	it('names no stylesheet the family does not ship on its panel', () => {
		component.toggle();
		fixture.detectChanges();

		const panel = document.querySelector('.hub-table-dropdown__menu') as HTMLElement;

		expect(panel).toBeTruthy();
		expect(document.querySelector('.dropdown-menu')).toBeNull();
		expect(bootstrapNamesUnder(panel, ['dropdown-menu', 'dropdown-item', 'show'])).toEqual([]);
		expect(panel.querySelector('.hub-table-dropdown__item')).toBeTruthy();
	});

	it('marks an item the consumer did not class with a default of its own', () => {
		expect(component.getDropdownItemClassList({} as any)).toEqual(['hub-table-dropdown__item--default']);
	});

	it('ships the surface the panel used to borrow', () => {
		expect(declared('hub-table-dropdown__menu', 'min-width')).toContain('10rem');
		expect(declared('hub-table-dropdown__item', 'display')).toContain('block');
	});
});

describe('the table stops leaning on Bootstrap for its own controls', () => {
	@Component({
		standalone: true,
		imports: [HubTableComponent, HubPaginableTableExpandingRowDirective],
		template: `
			<hub-table [headers]="headers" [data]="data" [searchable]="true">
				<ng-template expandingRowTpt>expanded</ng-template>
			</hub-table>
		`
	})
	class Host {
		readonly headers: Array<PaginableTableHeader> = [{ property: 'name', title: 'Name' }];
		readonly data = [{ name: 'Ada' }];
	}

	let fixture: ComponentFixture<Host>;

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

	it('draws its search button without borrowing a button skin', () => {
		const button = fixture.nativeElement.querySelector('.hub-table__search-button') as HTMLElement;

		expect(button).toBeTruthy();
		expect(bootstrapNamesUnder(button, ['btn', 'btn-outline-dark'])).toEqual([]);
	});

	it('draws its row-expander trigger without borrowing a button skin', () => {
		const trigger = fixture.nativeElement.querySelector('.hub-table__expander-btn') as HTMLElement;

		expect(trigger).toBeTruthy();
		expect(bootstrapNamesUnder(trigger, ['btn', 'btn-link', 'px-2'])).toEqual([]);
	});

	/** The caret is the whole affordance, so the button around it has to be nothing at all. */
	it('ships the rules the expander trigger used to borrow', () => {
		expect(declared('hub-table__expander-btn', 'background')).toContain('transparent');
		expect(declared('hub-table__expander-btn', 'cursor')).toContain('pointer');
	});
});

describe('the list stops leaning on Bootstrap for its error state', () => {
	let fixture: ComponentFixture<HubListComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubListComponent],
			providers: [{ provide: HubTranslationService, useClass: MockHubTranslationService }]
		}).compileComponents();

		fixture = TestBed.createComponent(HubListComponent);
		fixture.componentRef.setInput('items', [{ id: 1, label: 'First' }]);
		fixture.componentRef.setInput('error', new Error('boom'));
		fixture.detectChanges();
	});

	it('names no stylesheet the family does not ship', () => {
		const message = fixture.nativeElement.querySelector('.hub-list__error') as HTMLElement;

		expect(message).toBeTruthy();
		expect(message.classList.contains('text-danger')).toBe(false);
	});

	/** The one state the reader most needs to notice cannot be the one that looks ordinary. */
	it('ships the role colour the message used to borrow', () => {
		expect(rulesFor('hub-list__error').length).toBeGreaterThan(0);
	});
});
