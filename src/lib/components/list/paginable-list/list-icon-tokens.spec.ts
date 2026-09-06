import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { ListComponent } from './list.component';

/**
 * The list draws its own glyphs, so it owns the variables behind them.
 *
 * It used to borrow the table's — `hub-table__icon--chevron-down` on the collapse trigger,
 * `--info` on every state message — which cost it twice. A product wanting another chevron
 * in the list had to redefine a variable named after the table, and got the table changed
 * with it; and the borrowed class never even arrived, because the table's stylesheet is
 * scoped to the table's own view and matches nothing rendered here. The glyphs were
 * invisible.
 *
 * The assertions read the computed `mask-image`, which is where the borrowing would show:
 * a class pointing at the wrong family reports the wrong variable name.
 */

interface TestListItem {
	id: number;
	label: string;
	children?: TestListItem[];
	collapsed?: boolean;
}

class MockHubTranslationService {
	readonly translationObserver = new Subject<any>().asObservable();
	getTranslation(key: string) {
		return key;
	}
	setTranslations() {}
	initialize() {}
}

describe('list icon tokens', () => {
	let fixture: ComponentFixture<ListComponent<TestListItem>>;

	/** The variable a rendered icon actually consumes. */
	function maskOf(selector: string): string {
		const element = fixture.nativeElement.querySelector(selector) as HTMLElement | null;
		expect(element, `no element matched "${selector}"`).not.toBeNull();
		return getComputedStyle(element!).maskImage;
	}

	/** The value the list declares for one of its own icon variables. */
	function declared(token: string): string {
		return getComputedStyle(fixture.nativeElement).getPropertyValue(token);
	}

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ListComponent],
			providers: [{ provide: HubTranslationService, useClass: MockHubTranslationService }]
		});

		fixture = TestBed.createComponent(ListComponent<TestListItem>);
		fixture.componentRef.setInput('options', { searchable: true });
		fixture.componentRef.setInput('items', [
			{ id: 1, label: 'Parent', children: [{ id: 2, label: 'Child' }] }
		] as TestListItem[]);
		fixture.detectChanges();
	});

	it('names no class of the table anywhere in its markup', () => {
		fixture.componentRef.setInput('loading', true);
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelectorAll('[class*="hub-table__icon"]').length).toBe(0);
	});

	/** A parent item starts collapsed, so this is the glyph the reader meets first. */
	it('draws the expand chevron from its own variable', () => {
		expect(maskOf('.hub-list__chevron .hub-list__icon')).toBe('var(--hub-list-icon-chevron-down)');
	});

	it('draws the collapse chevron from its own variable', () => {
		fixture.componentRef.setInput('options', { searchable: true, collapsed: false });
		fixture.detectChanges();

		expect(maskOf('.hub-list__chevron .hub-list__icon')).toBe('var(--hub-list-icon-chevron-up)');
	});

	it('draws the search glyph from a variable rather than from a literal', () => {
		expect(maskOf('.hub-list__search-icon')).toBe('var(--hub-list-icon-search)');
	});

	it('draws the state glyph from its own variable', () => {
		fixture.componentRef.setInput('loading', true);
		fixture.detectChanges();

		expect(maskOf('.hub-list__loading .hub-list__icon')).toBe('var(--hub-list-icon-info)');
	});

	it('ships a default for every glyph it draws', () => {
		for (const token of [
			'--hub-list-icon-chevron-up',
			'--hub-list-icon-chevron-down',
			'--hub-list-icon-info',
			'--hub-list-icon-search'
		]) {
			expect(declared(token), `${token} has no default`).toMatch(/^url\(/);
		}
	});

	it('exposes the ink and the size of its glyphs as its own variables', () => {
		expect(declared('--hub-list-icon-color')).not.toBe('');
		expect(declared('--hub-list-icon-size')).not.toBe('');
	});
});
