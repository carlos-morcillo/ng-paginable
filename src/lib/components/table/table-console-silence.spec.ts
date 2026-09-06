import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { PaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { PaginableTableDropdownComponent } from '../paginable-table-dropdown/paginable-table-dropdown.component';
import { TableComponent } from './table.component';

/**
 * Falling back to the built-in action markup is not something to announce in someone
 * else's console.
 *
 * The table used to print a paragraph there when no actions adapter was registered, and
 * it printed it in production builds — so the audience was the end user of the consuming
 * application, who cannot register anything, on a page they cannot change, with no way to
 * turn it off. The deprecation is addressed to a developer, and it is said where a
 * developer reads it: the `@deprecated` tags, the README and the changelog.
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

describe('the deprecated actions fallback stays out of the consuming console', () => {
	let warn: ReturnType<typeof vi.spyOn>;
	let previousDevMode: unknown;

	beforeEach(async () => {
		warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		// The message was emitted in production builds only, so that is the branch a spec
		// has to reach; `isDevMode()` reads this global, which is how it is reached without
		// a second build.
		previousDevMode = (globalThis as any).ngDevMode;
		(globalThis as any).ngDevMode = false;

		await TestBed.configureTestingModule({
			imports: [TableComponent, PaginableTableDropdownComponent, BrowserAnimationsModule],
			providers: [
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: PaginableService, useClass: MockPaginableService },
				{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
			]
		}).compileComponents();
	});

	afterEach(() => {
		(globalThis as any).ngDevMode = previousDevMode;
		warn.mockRestore();
	});

	it('says nothing when a table draws row actions with no adapter registered', () => {
		const fixture = TestBed.createComponent(TableComponent);

		fixture.componentRef.setInput('headers', [
			{ title: 'Actions', buttons: [{ icon: 'icon--ph--eye', handler: () => undefined }] }
		]);
		fixture.detectChanges();

		// Reading it is what used to trigger the message: the table only knows it has
		// actions once its headers are normalised.
		expect(fixture.componentInstance.fixedHeaders().length).toBe(1);
		expect(warn).not.toHaveBeenCalled();
	});

	it('says nothing when the deprecated dropdown is instantiated', () => {
		const fixture = TestBed.createComponent(PaginableTableDropdownComponent);
		fixture.detectChanges();

		expect(fixture.componentInstance).toBeTruthy();
		expect(warn).not.toHaveBeenCalled();
	});
});
