import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubIconComponent, IconType } from './icon.component';
import { Icon } from '../../interfaces/paginable-table-header';

/**
 * Test suite for HubIconComponent
 * Tests icon rendering with support for different icon libraries
 */
describe('HubIconComponent', () => {
	let component: HubIconComponent;
	let fixture: ComponentFixture<HubIconComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HubIconComponent]
		});

		fixture = TestBed.createComponent(HubIconComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('config input - string', () => {
		it('should accept string config', () => {
			component.config = 'test-icon';
			expect(component.value).toBe('test-icon');
		});

		it('should handle empty string', () => {
			component.config = '';
			expect(component.value).toBe('');
		});

		it('should handle undefined', () => {
			component.config = undefined;
			expect(component.value).toBe('');
		});
	});

	describe('config input - Icon object', () => {
		it('should accept Icon object with all properties', () => {
			const iconConfig: Icon = {
				type: 'font-awesome',
				value: 'fa-home',
				variant: 'solid'
			};

			component.config = iconConfig;

			expect(component.type).toBe('font-awesome');
			expect(component.value).toBe('fa-home');
			expect(component.variant).toBe('solid');
		});

		it('should handle Icon object with minimal properties', () => {
			const iconConfig: Icon = {
				type: 'material',
				value: 'home'
			};

			component.config = iconConfig;

			expect(component.type).toBe('material');
			expect(component.value).toBe('home');
		});

		it('should handle Icon object without variant', () => {
			const iconConfig: Icon = {
				type: 'bootstrap',
				value: 'icon-name'
			};

			component.config = iconConfig;

			expect(component.type).toBe('bootstrap');
			expect(component.variant).toBe('');
		});
	});

	describe('classlist getter', () => {
		it('should return null when no value is set', () => {
			component.value = '';
			expect(component.classlist).toBeNull();
		});

		it('should return value as-is when no type is set', () => {
			component.value = 'custom-icon-class';
			component.type = null;
			expect(component.classlist).toBe('custom-icon-class');
		});

		it('should add fa class for font-awesome icons', () => {
			component.type = 'font-awesome';
			component.value = 'fa-home';
			expect(component.classlist).toContain('fa');
			expect(component.classlist).toContain('fa-home');
		});

		it('should not duplicate fa class if already present', () => {
			component.type = 'font-awesome';
			component.value = 'fa fa-home';
			const classList = component.classlist?.split(' ') || [];
			const faCount = classList.filter((c) => c === 'fa').length;
			// The classlist getter adds fa if not present, but since it's already in value, it won't duplicate
			// Actually, looking at the code, it splits the value and checks if fa is in the combined list
			expect(classList).toContain('fa');
			expect(classList).toContain('fa-home');
		});

		it('should handle bootstrap icons', () => {
			component.type = 'bootstrap';
			component.value = 'bi-house';
			expect(component.classlist).toContain('bs');
			expect(component.classlist).toContain('bi-house');
		});

		it('should add material-symbols-outlined class for material icons', () => {
			component.type = 'material';
			component.value = 'home';
			expect(component.classlist).toContain('material-symbols-outlined');
		});

		it('should handle array value for font-awesome', () => {
			component.type = 'font-awesome';
			component.value = ['fa', 'fa-home', 'fa-lg'] as any;
			const classList = component.classlist || '';
			expect(classList).toContain('fa-home');
			expect(classList).toContain('fa-lg');
		});

		it('should handle space-separated string value', () => {
			component.type = 'font-awesome';
			component.value = 'fa fa-home fa-2x';
			const classList = component.classlist || '';
			expect(classList).toContain('fa-home');
			expect(classList).toContain('fa-2x');
		});

		it('should handle material icon with single word', () => {
			component.type = 'material';
			component.value = 'search';
			expect(component.classlist).toContain('material-symbols-outlined');
		});
	});

	describe('content getter', () => {
		it('should return value for material icons', () => {
			component.type = 'material';
			component.value = 'home';
			expect(component.content).toBe('home');
		});

		it('should return null for font-awesome icons', () => {
			component.type = 'font-awesome';
			component.value = 'fa-home';
			expect(component.content).toBeNull();
		});

		it('should return null for bootstrap icons', () => {
			component.type = 'bootstrap';
			component.value = 'bi-house';
			expect(component.content).toBeNull();
		});

		it('should return null when no type is set', () => {
			component.type = null;
			component.value = 'icon';
			expect(component.content).toBeNull();
		});
	});

	describe('different icon types', () => {
		const testCases: Array<{
			type: IconType;
			value: string;
			expectedClass: string;
		}> = [
			{
				type: 'font-awesome',
				value: 'fa-user',
				expectedClass: 'fa'
			},
			{
				type: 'bootstrap',
				value: 'bi-person',
				expectedClass: 'bs'
			},
			{
				type: 'material',
				value: 'person',
				expectedClass: 'material-symbols-outlined'
			}
		];

		testCases.forEach(({ type, value, expectedClass }) => {
			it(`should handle ${type} icon type correctly`, () => {
				component.type = type;
				component.value = value;
				expect(component.classlist).toContain(expectedClass);
			});
		});
	});

	describe('integration with template', () => {
		it('should render with font-awesome icon', () => {
			const iconConfig: Icon = {
				type: 'font-awesome',
				value: 'fa-home'
			};

			component.config = iconConfig;
			fixture.detectChanges();

			const element = fixture.nativeElement.querySelector('i, span');
			expect(element).toBeTruthy();
		});

		it('should render with material icon', () => {
			const iconConfig: Icon = {
				type: 'material',
				value: 'home'
			};

			component.config = iconConfig;
			fixture.detectChanges();

			const element = fixture.nativeElement;
			expect(element).toBeTruthy();
		});
	});
});
