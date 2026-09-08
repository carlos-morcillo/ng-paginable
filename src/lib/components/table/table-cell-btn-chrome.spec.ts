import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { HubPaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { HubTableComponent } from './table.component';

/**
 * The chrome of a row-action button.
 *
 * A button the table draws itself takes its height from the LINE BOX of the glyph inside it,
 * and an icon font's glyph is an inline-block sitting on the baseline — so a 16px glyph in a
 * 24px line box hung from the baseline with the descender gap left underneath: 4px above and
 * 8px below, on a 28px button.
 *
 * What makes this worth pinning is that the two obvious repairs each break the height:
 * `display: flex` on the button (or on the icon host) removes the line box and collapses the
 * button to 20px, and `vertical-align: middle` overshoots to 7.78 / 4.22. The shape that works
 * gives the content row an explicit height and centres the glyph inside it.
 *
 * Asserted on the shipped rules rather than measured, like the group-flattening bench in
 * `ng-hub-ui-forms` and for the same reason: jsdom lays nothing out, so a measurement here
 * would report zeroes and pass anything. The numbers themselves were taken in a browser —
 * 28px tall and 6 / 6 after, against 28px and 4 / 8 before.
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

/** Declarations of every shipped rule whose selector mentions `fragment`, in source order. */
function declarationsFor(fragment: string): { selector: string; style: CSSStyleDeclaration }[] {
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

/** The winning declaration of `property` among the rules that mention `fragment`. */
function declared(fragment: string, property: string): string[] {
	return declarationsFor(fragment)
		.map(({ style }) => style.getPropertyValue(property))
		.filter(Boolean);
}

describe('row action button chrome', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubTableComponent, BrowserAnimationsModule],
			providers: [
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: HubPaginableService, useClass: MockPaginableService },
				{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
			]
		}).compileComponents();

		// Instantiating the component is what loads its stylesheet into the document.
		TestBed.createComponent(HubTableComponent).detectChanges();
	});

	/** Empty means the rule was renamed or dropped, and every case below is vacuous. */
	it('ships rules for the action button content row', () => {
		expect(declarationsFor('hub-table__cell-btn-content').length).toBeGreaterThan(0);
	});

	/**
	 * The height has to come from somewhere other than the glyph's line box, or centring the
	 * glyph takes the button down with it.
	 */
	it('pins the height of the content row instead of borrowing the glyph line box', () => {
		expect(declared('hub-table__cell-btn-content', 'min-height')).toContain('1.5rem');
	});

	it('centres what the row contains', () => {
		expect(declared('hub-table__cell-btn-content', 'align-items')).toContain('center');
	});

	/**
	 * Both selectors: the icon component answers to two names, and a consumer's table may be
	 * rendering either of them.
	 */
	for (const host of ['hub-paginable-icon', 'ng-hub-ui-icon']) {
		it(`centres the glyph inside ${host}`, () => {
			const rules = declarationsFor('hub-table__cell-btn-content').filter(({ selector }) => selector.includes(host));
			expect(rules.length).toBeGreaterThan(0);

			const centring = rules.map(({ style }) => style.getPropertyValue('align-items')).filter(Boolean);
			expect(centring).toContain('center');
		});
	}

	/**
	 * The trap, stated as its own case so a regression names the reason. Laying out the BUTTON
	 * as a flex container is the change that reads like the fix and silently drops it to 20px:
	 * the line box it removes is the only thing giving the button its height.
	 */
	it('leaves the button itself out of flex layout', () => {
		const onTheButton = declarationsFor('hub-table__cell-btn').filter(
			({ selector }) => !selector.includes('cell-btn-content') && !selector.includes('cell-btn-label')
		);

		expect(onTheButton.map(({ style }) => style.getPropertyValue('display')).filter(Boolean)).toEqual([]);
	});
});
