import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { HubPaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { PaginableTableHeader } from '../../interfaces';
import { HubTableComponent } from './table.component';

/**
 * The chrome of the sort trigger.
 *
 * The table draws its own sort button and styled only the glyph inside it, leaving the
 * `<button>` to whatever the host application happened to provide. It also carried a bare
 * `btn` class — Bootstrap's, which this family does not ship and does not depend on. In an
 * application without Bootstrap the class matched nothing and the button fell back to the
 * browser's native grey chrome, in every sortable column header.
 *
 * A component cannot leave a hole and expect the page to fill it: the glyph is the whole
 * affordance, so the button around it has to be nothing at all.
 *
 * Asserted on the shipped rules rather than measured, like the row-action bench next door
 * and for the same reason: jsdom lays nothing out, so a measurement would report zeroes and
 * pass anything.
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

/** Every declared value of `property` among the rules that mention `fragment`. */
function declared(fragment: string, property: string): string[] {
	return declarationsFor(fragment)
		.map(({ style }) => style.getPropertyValue(property))
		.filter(Boolean);
}

describe('sort trigger chrome', () => {
	let fixture: ReturnType<typeof TestBed.createComponent<HubTableComponent>>;

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
		fixture = TestBed.createComponent(HubTableComponent);
		fixture.detectChanges();
	});

	/** Empty means the rule was renamed or dropped, and every case below is vacuous. */
	it('ships rules for the sort trigger', () => {
		expect(declarationsFor('hub-table__sort-btn').length).toBeGreaterThan(0);
	});

	it('strips the native border', () => {
		// The CSSOM expands and re-serialises shorthands, so the assertion is on what the
		// declaration *means* rather than on the exact string a browser chose for it.
		const widths = declarationsFor('hub-table__sort-btn')
			.map(({ style }) => style.getPropertyValue('border-width') || style.getPropertyValue('border'))
			.filter(Boolean);

		expect(widths.some((value) => /(^|\s)0(px)?(\s|$)/.test(value))).toBe(true);
	});

	it('strips the native background', () => {
		expect(declared('hub-table__sort-btn', 'background')).toContain('transparent');
	});

	it('strips the native padding', () => {
		const paddings = declared('hub-table__sort-btn', 'padding');

		expect(paddings.some((value) => /^0(px)?$/.test(value.trim()))).toBe(true);
	});

	it('inherits the header cell colour rather than the browser button colour', () => {
		expect(declared('hub-table__sort-btn', 'color')).toContain('inherit');
	});

	it('keeps the pointer, because the whole header cell is the affordance', () => {
		expect(declared('hub-table__sort-btn', 'cursor')).toContain('pointer');
	});

	/**
	 * The reason the hole existed. `btn` is Bootstrap's, this family does not ship it, and a
	 * consumer without Bootstrap got the browser's own button back.
	 */
	it('does not lean on a class the family does not ship', () => {
		fixture.componentRef.setInput('headers', [
			{ property: 'name', title: 'Name', sortable: true }
		] as Array<PaginableTableHeader>);
		fixture.componentRef.setInput('data', [{ name: 'Ada' }]);
		fixture.detectChanges();

		const trigger = fixture.nativeElement.querySelector('.hub-table__sort-btn') as HTMLElement;

		expect(trigger).toBeTruthy();
		expect(trigger.classList.contains('btn')).toBe(false);
	});
});
