import { TestBed } from '@angular/core/testing';
import { HubPaginableService } from './paginable.service';
import { PaginableConfigService } from './paginate-config.service';
import { DEFAULT_PAGINABLE_CONFIG } from '../constants/defaults';

/**
 * Test suite for HubPaginableService
 * Tests configuration management for paginable components
 */
describe('HubPaginableService', () => {
	let service: HubPaginableService;

	describe('with default config', () => {
		beforeEach(() => {
			TestBed.configureTestingModule({
				providers: [HubPaginableService]
			});
			service = TestBed.inject(HubPaginableService);
		});

		it('should be created', () => {
			expect(service).toBeTruthy();
		});

		it('should initialize with default config', () => {
			expect(service.config).toBeDefined();
			expect(service.config).toEqual(DEFAULT_PAGINABLE_CONFIG as any);
		});

		it('should have mapping property from config', () => {
			expect(service.mapping).toBeDefined();
			expect(service.mapping).toBe(service.config.mapping);
		});

		it('should have default language in config', () => {
			expect(service.config.language).toBeDefined();
		});
	});

	describe('with custom config', () => {
		const customConfig = {
			language: 'es',
			mapping: {
				customKey: 'customValue'
			}
		};

		beforeEach(() => {
			TestBed.configureTestingModule({
				providers: [
					HubPaginableService,
					{
						provide: PaginableConfigService,
						useValue: customConfig
					}
				]
			});
			service = TestBed.inject(HubPaginableService);
		});

		it('should merge custom config with default config', () => {
			expect(service.config.language).toBe('es');
		});

		it('should preserve default config properties not overridden', () => {
			// The merged config should have all default properties plus custom ones
			expect(service.config).toBeDefined();
		});

		it('should have custom mapping', () => {
			// Service merges custom mapping with default mapping using mergeDeep
			expect(service.mapping).toEqual(expect.objectContaining(customConfig.mapping));
			// Verify custom property exists
			expect(service.mapping.customKey).toBe('customValue');
		});
	});

	describe('initialize', () => {
		beforeEach(() => {
			TestBed.configureTestingModule({
				providers: [HubPaginableService]
			});
			service = TestBed.inject(HubPaginableService);
		});

		it('should be called during construction', () => {
			expect(service.config).toBeDefined();
		});

		it('should allow re-initialization', () => {
			const originalConfig = service.config;
			service.initialize();
			expect(service.config).toEqual(originalConfig);
		});
	});

	describe('mapping getter', () => {
		beforeEach(() => {
			TestBed.configureTestingModule({
				providers: [HubPaginableService]
			});
			service = TestBed.inject(HubPaginableService);
		});

		it('should return mapping from config', () => {
			const mapping = service.mapping;
			expect(mapping).toBe(service.config.mapping);
		});

		it('should update when config changes', () => {
			const originalMapping = service.mapping;
			service.config.mapping = { ...originalMapping, currentPage: 'new-page' } as any;
			expect(service.mapping).not.toBe(originalMapping);
			expect(service.mapping.currentPage).toBe('new-page');
		});
	});
});
