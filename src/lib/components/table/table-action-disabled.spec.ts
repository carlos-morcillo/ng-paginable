import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject, firstValueFrom } from 'rxjs';

import { HubPaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { PaginableActionButton } from '../../interfaces';
import { TableRow } from '../../interfaces/table-row';
import { HubTableComponent } from './table.component';

/**
 * A row action can be offered and refused, and until now it could only vanish.
 *
 * `hidden` was the only thing a consumer could say about a button that does not apply,
 * and it says the wrong thing for half the cases: a cancelled payment is not a row where
 * editing does not exist, it is a row where editing has nothing left to act on. Forced to
 * choose, consumers hid the action — so the column changed shape row by row, and nothing
 * on screen said why the button was gone.
 *
 * `disabled` is the other half, shaped exactly like `hidden` — boolean or predicate,
 * always an Observable — because both answer the same question about the same button.
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

describe('row action disabled state', () => {
	let component: HubTableComponent;

	const row = { data: { status: 'cancelled' } } as TableRow;
	const liveRow = { data: { status: 'completed' } } as TableRow;

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
	it('leaves a button that said nothing enabled', async () => {
		expect(await firstValueFrom(component.isDisabled({} as PaginableActionButton, liveRow))).toBe(false);
	});

	it('takes a plain boolean', async () => {
		const button = { disabled: true } as PaginableActionButton;

		expect(await firstValueFrom(component.isDisabled(button, liveRow))).toBe(true);
	});

	it('takes a rule that reads the row, the way `hidden` does', async () => {
		const button = {
			disabled: (r: TableRow) => (r.data as any).status === 'cancelled'
		} as PaginableActionButton;

		expect(await firstValueFrom(component.isDisabled(button, row))).toBe(true);
		expect(await firstValueFrom(component.isDisabled(button, liveRow))).toBe(false);
	});

	/**
	 * The half that makes it honest. The table draws its own buttons, so the browser's
	 * default disabled rendering never reaches them: without this the refused action kept
	 * its full tint and its pointer, and read as pressable while swallowing every click.
	 */
	it('makes a refused action look refused', () => {
		// Matched loosely and then filtered: emulated encapsulation interleaves its
		// attribute selector, so `.hub-table__cell-btn:disabled` is never one substring.
		const rules = declarationsFor('hub-table__cell-btn').filter((r) => r.selector.includes(':disabled'));

		expect(rules.length).toBeGreaterThan(0);
		expect(rules.map((r) => r.style.getPropertyValue('cursor'))).toContain('not-allowed');
		expect(rules.some((r) => r.style.getPropertyValue('opacity') !== '')).toBe(true);
	});
});
