import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PaginableTableConfig } from '../interfaces/paginable-table-config';
import { HubPaginableDefaultsService } from './paginable-defaults.service';
import { HubPaginableService } from './paginable.service';
import { PaginableConfigService } from './paginate-config.service';

@Component({ selector: 'hub-eager-state', standalone: true, template: '' })
class EagerComponent {}

@Component({ selector: 'hub-lazy-state', standalone: true, template: '' })
class LazyComponent {}

/**
 * Builds an isolated injector whose paginable config is the provided one, then
 * resolves the defaults service from it.
 */
function serviceWith(config: PaginableTableConfig): HubPaginableDefaultsService {
	TestBed.configureTestingModule({
		providers: [HubPaginableService, HubPaginableDefaultsService, { provide: PaginableConfigService, useValue: config }]
	});
	return TestBed.inject(HubPaginableDefaultsService);
}

describe('HubPaginableDefaultsService', () => {
	afterEach(() => TestBed.resetTestingModule());

	it('exposes null signals when no states are configured', () => {
		const service = serviceWith({});
		expect(service.loading()).toBeNull();
		expect(service.error()).toBeNull();
		expect(service.noResults()).toBeNull();
	});

	it('publishes eager components immediately, before preload', () => {
		const service = serviceWith({ states: { loading: EagerComponent } });
		expect(service.loading()?.component).toBe(EagerComponent);
	});

	it('resolves lazy loaders only after preload', async () => {
		const service = serviceWith({ states: { error: () => Promise.resolve(LazyComponent) } });
		expect(service.error()).toBeNull();

		await service.preload();
		expect(service.error()?.component).toBe(LazyComponent);
	});

	it('keeps the input factory through resolution', async () => {
		const inputs = () => ({ message: 'boom' });
		const service = serviceWith({
			states: { noResults: { component: () => Promise.resolve(LazyComponent), inputs } }
		});

		await service.preload();
		expect(service.noResults()).toEqual({ component: LazyComponent, inputs });
	});
});
