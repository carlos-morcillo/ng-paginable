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

	/** Writes the only input the component has and settles the derived state. */
	function setConfig(config: string | Icon | undefined): void {
		fixture.componentRef.setInput('config', config);
		fixture.detectChanges();
	}

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
			setConfig('test-icon');
			expect(component.value()).toBe('test-icon');
		});

		it('should handle empty string', () => {
			setConfig('');
			expect(component.value()).toBe('');
		});

		it('should handle undefined', () => {
			setConfig(undefined);
			expect(component.value()).toBe('');
		});
	});

	describe('config input - Icon object', () => {
		it('should accept Icon object with all properties', () => {
			setConfig({ type: 'font-awesome', value: 'fa-home', variant: 'solid' });

			expect(component.type()).toBe('font-awesome');
			expect(component.value()).toBe('fa-home');
			expect(component.variant()).toBe('solid');
		});

		it('should handle Icon object with minimal properties', () => {
			setConfig({ type: 'material', value: 'home' });

			expect(component.type()).toBe('material');
			expect(component.value()).toBe('home');
		});

		it('should handle Icon object without variant', () => {
			setConfig({ type: 'bootstrap', value: 'icon-name' });

			expect(component.type()).toBe('bootstrap');
			expect(component.variant()).toBe('');
		});

		/**
		 * The two shapes are one input, so switching between them has to leave nothing of the
		 * previous one behind — which a setter writing three fields could not promise.
		 */
		it('should drop the previous type when the config becomes a bare string', () => {
			setConfig({ type: 'material', value: 'home', variant: 'solid' });
			setConfig('custom-icon-class');

			expect(component.type()).toBeNull();
			expect(component.variant()).toBe('');
			expect(component.classlist()).toBe('custom-icon-class');
		});
	});

	describe('classlist', () => {
		it('should return null when no value is set', () => {
			setConfig('');
			expect(component.classlist()).toBeNull();
		});

		it('should return value as-is when no type is set', () => {
			setConfig('custom-icon-class');
			expect(component.classlist()).toBe('custom-icon-class');
		});

		it('should add fa class for font-awesome icons', () => {
			setConfig({ type: 'font-awesome', value: 'fa-home' });
			expect(component.classlist()).toContain('fa');
			expect(component.classlist()).toContain('fa-home');
		});

		it('should keep the classes the value already carries', () => {
			setConfig({ type: 'font-awesome', value: 'fa fa-home' });

			const classList = component.classlist()?.split(' ') || [];

			expect(classList).toContain('fa');
			expect(classList).toContain('fa-home');
		});

		it('should handle bootstrap icons', () => {
			setConfig({ type: 'bootstrap', value: 'bi-house' });
			expect(component.classlist()).toContain('bs');
			expect(component.classlist()).toContain('bi-house');
		});

		it('should add material-symbols-outlined class for material icons', () => {
			setConfig({ type: 'material', value: 'home' });
			expect(component.classlist()).toContain('material-symbols-outlined');
		});

		it('should handle array value for font-awesome', () => {
			setConfig({ type: 'font-awesome', value: ['fa', 'fa-home', 'fa-lg'] as any });

			const classList = component.classlist() || '';

			expect(classList).toContain('fa-home');
			expect(classList).toContain('fa-lg');
		});

		it('should handle space-separated string value', () => {
			setConfig({ type: 'font-awesome', value: 'fa fa-home fa-2x' });

			const classList = component.classlist() || '';

			expect(classList).toContain('fa-home');
			expect(classList).toContain('fa-2x');
		});
	});

	describe('content', () => {
		it('should return value for material icons', () => {
			setConfig({ type: 'material', value: 'home' });
			expect(component.content()).toBe('home');
		});

		it('should return null for font-awesome icons', () => {
			setConfig({ type: 'font-awesome', value: 'fa-home' });
			expect(component.content()).toBeNull();
		});

		it('should return null for bootstrap icons', () => {
			setConfig({ type: 'bootstrap', value: 'bi-house' });
			expect(component.content()).toBeNull();
		});

		it('should return null when no type is set', () => {
			setConfig('icon');
			expect(component.content()).toBeNull();
		});
	});

	describe('different icon types', () => {
		const testCases: Array<{
			type: IconType;
			value: string;
			expectedClass: string;
		}> = [
			{ type: 'font-awesome', value: 'fa-user', expectedClass: 'fa' },
			{ type: 'bootstrap', value: 'bi-person', expectedClass: 'bs' },
			{ type: 'material', value: 'person', expectedClass: 'material-symbols-outlined' }
		];

		testCases.forEach(({ type, value, expectedClass }) => {
			it(`should handle ${type} icon type correctly`, () => {
				setConfig({ type, value });
				expect(component.classlist()).toContain(expectedClass);
			});
		});
	});

	describe('integration with template', () => {
		it('should render with font-awesome icon', () => {
			setConfig({ type: 'font-awesome', value: 'fa-home' });

			const element = fixture.nativeElement.querySelector('i');

			expect(element).toBeTruthy();
			expect(element.className).toContain('fa-home');
		});

		it('should render with material icon', () => {
			setConfig({ type: 'material', value: 'home' });

			const element = fixture.nativeElement.querySelector('i');

			expect(element.className).toContain('material-symbols-outlined');
			expect(element.textContent.trim()).toBe('home');
		});

		it('should render nothing when the config carries no value', () => {
			setConfig('');
			expect(fixture.nativeElement.querySelector('i')).toBeNull();
		});
	});
});
