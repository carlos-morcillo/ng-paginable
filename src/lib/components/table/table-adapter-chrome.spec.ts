import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { PaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { TableComponent } from './table.component';
import { PaginatorComponent } from '../paginator/paginator.component';

/**
 * The table's own chrome controls, when a consumer swaps them for hub-forms ones.
 *
 * `provideHubPaginableFormControls` lets the search box and the page-size picker be
 * rendered as `<hub-input>` and `<hub-select>` instead of the native fallbacks. The CSS
 * for them was written for the fallbacks, and the two encapsulation modes then failed in
 * opposite directions:
 *
 * - The table's stylesheet is **emulated**, so its `.hub-table__search-input` rule carries
 *   an `_ngcontent` attribute. A dynamically created component carries none, so the rule
 *   never reached it and the field came out with no group geometry at all — a standalone
 *   rounded control beside a button it was meant to be joined to.
 * - The paginator's stylesheet is **`encapsulation: None`**, so its `.hub-paginator__select`
 *   rule was global and *did* reach the component's host, drawing a second border and a
 *   second padding around a control that already draws its own.
 *
 * One rule too narrow, one too wide, from the same assumption.
 *
 * Asserted on the shipped rules rather than measured, like the benches next door: jsdom
 * lays nothing out, so a measurement would report zeroes and pass anything.
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

/** Declarations of every shipped rule whose selector matches `test`, in source order. */
function rulesMatching(test: (selector: string) => boolean): { selector: string; style: CSSStyleDeclaration }[] {
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
			if (style.selectorText && test(style.selectorText) && style.style) {
				out.push({ selector: style.selectorText, style: style.style });
			}
		}
	}
	return out;
}

describe('adapter-rendered chrome', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TableComponent, PaginatorComponent, BrowserAnimationsModule],
			providers: [
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: PaginableService, useClass: MockPaginableService },
				{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
			]
		}).compileComponents();

		// Instantiating them is what loads their stylesheets into the document.
		TestBed.createComponent(TableComponent).detectChanges();
		TestBed.createComponent(PaginatorComponent).detectChanges();
	});

	describe('the search button', () => {
		/**
		 * It declared a border colour and no width or style, which only draws a border if
		 * something else supplies them. That something was Bootstrap's `.btn`, which this
		 * family does not ship.
		 */
		it('declares its own border rather than borrowing one', () => {
			const declared = rulesMatching((s) => s.includes('hub-table__search-button')).map(
				({ style }) => style.getPropertyValue('border') || style.getPropertyValue('border-width')
			);

			expect(declared.some(Boolean)).toBe(true);
		});
	});

	describe('the page-size picker', () => {
		/** The native skin has to name the native element, or it lands on the component too. */
		it('paints the native control by element, not by class alone', () => {
			const painted = rulesMatching((s) => s.includes('hub-paginator__select') && s.includes('select.'));

			expect(painted.length).toBeGreaterThan(0);
		});

		/** And the component's host draws no box, because the control inside draws one. */
		it('strips the box from the adapter host', () => {
			const host = rulesMatching((s) => s.includes('hub-select.hub-paginator__select'));

			expect(host.length).toBeGreaterThan(0);
			// The CSSOM re-serialises the shorthand, so the assertion is on what the
			// declaration means rather than on the exact string a browser chose for it.
			const borders = host.map(({ style }) => style.getPropertyValue('border'));
			expect(borders.some((value) => /^0(px)?\b/.test(value.trim()))).toBe(true);
			expect(host.map(({ style }) => style.getPropertyValue('background'))).toContain('transparent');
		});

		/**
		 * The rule that caused it, stated as its own case so a regression names the reason:
		 * a bare `.hub-paginator__select` in a global sheet reaches every element wearing
		 * the class, the component host included.
		 */
		it('has no bare class rule painting a background', () => {
			const bare = rulesMatching((s) => s.split(',').some((part) => part.trim() === '.hub-paginator__select')).filter(
				({ style }) => style.getPropertyValue('background-color')
			);

			expect(bare).toEqual([]);
		});
	});

	describe('the search field', () => {
		/**
		 * The geometry is handed over, not reached for.
		 *
		 * When the adapter is wired, the field here is a component this table creates at
		 * runtime, and a dynamically created component carries no `_ngcontent` attribute —
		 * so no rule in this emulated stylesheet can name it. The first attempt was a
		 * `::ng-deep` rule, which is a rule reaching into someone else's component: it
		 * shipped nested inside the right-to-left block, compiled to
		 * `:host.hub-table--rtl :host ::ng-deep …`, and was inert in every table.
		 *
		 * Custom properties inherit, so the container states the geometry and whatever fills
		 * it reads it. The native fallback ignores what it does not use.
		 */
		it('states the group radius on its own container', () => {
			const declared = rulesMatching((s) => s.includes('hub-table__search'))
				.map(({ style }) => style.getPropertyValue('--hub-input-border-radius'))
				.filter(Boolean);

			expect(declared.length).toBeGreaterThan(0);
		});

		/** No rule may name the control: that is what emulation forbids and what broke. */
		it('never reaches into the control it does not own', () => {
			const invasoras = rulesMatching((s) => s.includes('ng-deep') || /hub-input\.hub-table__search-input/.test(s));

			expect(invasoras.map(({ selector }) => selector)).toEqual([]);
		});

		/**
		 * The stacking gap is deliberately NOT zeroed here. A control the adapter creates is
		 * embedded wherever it is created — a search group, a paginator row, anything wired
		 * next — so `ng-hub-ui-forms` states it once in the adapter rather than each host
		 * library discovering the same margin separately.
		 */
		it('leaves the stacking gap to the adapter that creates the control', () => {
			const declared = rulesMatching((s) => s.includes('hub-table__search'))
				.map(({ style }) => style.getPropertyValue('--hub-field-stack-gap'))
				.filter(Boolean);

			expect(declared).toEqual([]);
		});
	});
});
