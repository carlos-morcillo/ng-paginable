import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { PaginableDefaults } from '../../interfaces/paginable-defaults';
import { HubListComponent } from '../list/paginable-list/list.component';
import { HubTableComponent } from './table.component';

/** Minimal translation service stand-in so the standalone components can render. */
class MockHubTranslationService {
	private source = new Subject<unknown>();
	translationObserver = this.source.asObservable();
	getTranslation(key: string) {
		return key;
	}
	setTranslations() {}
	initialize() {}
}

/**
 * Verifies that input defaults declared via `providePaginable({ defaults })`
 * (modelled here through the {@link PaginableConfigService} token) flow into the
 * table and list components, while per-component fallbacks survive when a key is
 * omitted.
 */
describe('Paginable input defaults provider', () => {
	async function configure(defaults: PaginableDefaults): Promise<void> {
		TestBed.resetTestingModule();
		await TestBed.configureTestingModule({
			imports: [HubTableComponent, HubListComponent, BrowserAnimationsModule],
			providers: [
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: PaginableConfigService, useValue: { defaults } }
			]
		}).compileComponents();
	}

	it('applies every table default from the provider config', async () => {
		await configure({
			paginate: false,
			perPage: 25,
			perPageOptions: [25, 50, 100],
			paginationPosition: 'both',
			paginationInfo: false,
			searchable: false,
			debounce: 300
		});
		const table = TestBed.createComponent(HubTableComponent).componentInstance;

		expect(table.paginate()).toBe(false);
		expect(table.perPage()).toBe(25);
		expect(table.perPageOptions()).toEqual([25, 50, 100]);
		expect(table.paginationPosition()).toBe('both');
		expect(table.paginationInfo()).toBe(false);
		expect(table.searchable()).toBe(false);
		expect(table.debounce()).toBe(300);
	});

	it('applies list defaults from the provider config', async () => {
		await configure({ paginate: true, perPage: 15, perPageOptions: [15, 30] });
		const list = TestBed.createComponent(HubListComponent).componentInstance;

		expect(list.paginate()).toBe(true);
		expect(list.perPage()).toBe(15);
		expect(list.perPageOptions()).toEqual([15, 30]);
	});

	it('keeps per-component fallbacks when a key is omitted', async () => {
		// Only perPage is configured; paginate must keep each component's own default.
		await configure({ perPage: 25 });

		const table = TestBed.createComponent(HubTableComponent).componentInstance;
		expect(table.perPage()).toBe(25);
		expect(table.paginate()).toBe(true); // table default

		const list = TestBed.createComponent(HubListComponent).componentInstance;
		expect(list.perPage()).toBe(25);
		expect(list.paginate()).toBe(false); // list default preserved
	});
});
