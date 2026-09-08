import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { HubPaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { PaginableActionButton } from '../../interfaces';
import { HubTableComponent } from './table.component';

/**
 * A row action can say how it should look, and until now it could not.
 *
 * This table draws its action buttons itself — plain `<button>` elements — and
 * `hub-buttons` styles appearance through `:host(...)` selectors, which match nothing on
 * an element the primitive did not create. So a consumer who wanted a row action to read
 * like the buttons beside it had no way to say so, and rebuilt the tint by hand in its own
 * stylesheet: two copies of one formula, free to drift the moment either side changed.
 *
 * `variant` and `color` are the same vocabulary `hubButton` uses, and the tints ship here.
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

/** Declarations of every shipped rule whose selector mentions `fragment`. */
function declarationsFor(fragment: string): { selector: string; style: CSSStyleDeclaration }[] {
	const out: { selector: string; style: CSSStyleDeclaration }[] = [];
	for (const sheet of [...document.styleSheets]) {
		let rules: CSSRule[];
		try {
			rules = [...(sheet.cssRules ?? [])];
		} catch {
			continue;
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

describe('row action variants', () => {
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

		const fixture = TestBed.createComponent(HubTableComponent);
		fixture.detectChanges();
		component = fixture.componentInstance;
	});

	/** What every table already in use gets, and has to keep getting. */
	it('leaves a button that asked for nothing on the plain bordered look', () => {
		expect(component.getRowActionClassList({} as PaginableActionButton)).toEqual(['hub-table__cell-btn--default']);
	});

	it('emits the variant as a class and the colour as a value', () => {
		const button = { variant: 'soft', color: 'danger' } as PaginableActionButton;

		// The VARIANT is a shape, and its set is closed on purpose, so it travels as a class.
		expect(component.getRowActionClassList(button)).toContain('hub-table__cell-btn--soft');

		// The COLOUR is not: `color` is typed `… | (string & {})` and accepts anything.
		expect(component.actionAccent(button)).toBe('var(--hub-sys-color-danger, danger)');
	});

	/**
	 * The case the old shape could not serve, and the reason this moved.
	 *
	 * A class per colour honours the seven names the stylesheet happened to enumerate. A
	 * consumer naming a role of their own got a class matching no rule, an unset custom
	 * property and a `color-mix` with nothing to mix — a button with no accent, no error and
	 * no warning, from an API whose type said any string was welcome.
	 */
	it('resolves a colour the design system never declared', () => {
		expect(component.actionAccent({ variant: 'soft', color: 'brand' } as PaginableActionButton)).toBe(
			'var(--hub-sys-color-brand, brand)'
		);

		// And a literal colour passes through instead of becoming a nonsense token name.
		expect(component.actionAccent({ variant: 'solid', color: '#ff6600' } as PaginableActionButton)).toBe('#ff6600');
	});

	/** No accent named means neutral, not none: a variant with no colour has nothing to tint. */
	it('falls back to neutral when a variant carries no colour', () => {
		expect(component.actionAccent({ variant: 'soft' } as PaginableActionButton)).toBe(
			'var(--hub-sys-color-neutral, neutral)'
		);
	});

	/**
	 * `default` is the plain bordered button and has no accent. Colouring it would be
	 * giving it a variant by the back door, and the result would be a button whose look
	 * nobody asked for.
	 */
	it('does not colour the default variant', () => {
		const classes = component.getRowActionClassList({
			color: 'danger'
		} as PaginableActionButton);

		expect(classes).toEqual(['hub-table__cell-btn--default']);
	});

	/** The consumer's own classes still travel, after the ones the variant implies. */
	it('keeps the classes a consumer passed', () => {
		const classes = component.getRowActionClassList({
			variant: 'soft',
			classlist: ['my-own']
		} as PaginableActionButton);

		expect(classes).toContain('my-own');
	});

	it('accepts a single class as well as a list', () => {
		expect(component.getRowActionClassList({ classlist: 'my-own' } as PaginableActionButton)).toContain('my-own');
	});

	describe('the shipped tints', () => {
		it('ships a rule per variant', () => {
			for (const variant of ['soft', 'solid', 'outline', 'ghost']) {
				expect(declarationsFor(`hub-table__cell-btn--${variant}`).length).toBeGreaterThan(0);
			}
		});

		/**
		 * The stylesheet ships NO accent per role, and that is the point.
		 *
		 * It used to enumerate one rule per built-in colour, which served those names and
		 * silently refused every other — while the type invited any string. The accent is a
		 * value now, written on the element by {@link HubTableComponent.actionAccent}, so the
		 * sheet has no business naming colours at all. If a rule ever comes back, the closed
		 * set comes back with it.
		 */
		it('ships no rule that names a colour, because the accent is a value now', () => {
			for (const role of ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral']) {
				expect(declarationsFor(`hub-table__cell-btn--${role}`).length).toBe(0);
			}
		});

		/**
		 * The formula, pinned because it is the thing a consumer would otherwise copy: the
		 * soft tint is the accent at 12% over the page surface. If this drifts, a row action
		 * and a real `hubButton variant="soft"` stop reading the same side by side.
		 */
		it('tints soft with the accent at 12% over the page surface', () => {
			const declared = declarationsFor('hub-table__cell-btn--soft')
				.map(({ style }) => style.getPropertyValue('--hub-table-action-subtle'))
				.filter(Boolean)
				.join(' ');

			expect(declared).toContain('12%');
		});
	});
});
