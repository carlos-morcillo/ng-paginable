import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PaginableTableRangeInputComponent } from './paginable-table-range-input.component';
import { HUB_TRANSLATION_CONFIG, HubTranslationService, TranslatePipe, UcfirstPipe } from 'ng-hub-ui-utils';

/**
 * Test suite for PaginableTableRangeInputComponent
 * Tests range input functionality for filtering table data
 */
describe('PaginableTableRangeInputComponent', () => {
	let component: PaginableTableRangeInputComponent;
	let fixture: ComponentFixture<PaginableTableRangeInputComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [PaginableTableRangeInputComponent, FormsModule, TranslatePipe, UcfirstPipe],
			providers: [
				HubTranslationService,
				{
					provide: HUB_TRANSLATION_CONFIG,
					useValue: {
						dictionaries: {
							en: {
								FROM: 'from',
								TO: 'to'
							}
						},
						language: 'en',
						fallbackLanguage: 'en'
					}
				}
			]
		});

		fixture = TestBed.createComponent(PaginableTableRangeInputComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('initial state', () => {
		it('should have default type as number', () => {
			expect(component.type()).toBe('number');
		});

		it('should not be disabled by default', () => {
			expect(component.disabled).toBe(false);
		});

		it('should have initial value as [null, null]', () => {
			expect(component.value).toEqual([null, null]);
		});

		it('should have onChange function', () => {
			expect(component.onChange).toBeDefined();
			expect(typeof component.onChange).toBe('function');
		});

		it('should have onTouched function', () => {
			expect(component.onTouched).toBeDefined();
			expect(typeof component.onTouched).toBe('function');
		});
	});

	describe('type input', () => {
		it('should accept number type', () => {
			fixture.componentRef.setInput('type', 'number');
			fixture.detectChanges();
			expect(component.type()).toBe('number');
		});

		it('should accept date type', () => {
			fixture.componentRef.setInput('type', 'date');
			fixture.detectChanges();
			expect(component.type()).toBe('date');
		});
	});

	describe('ControlValueAccessor - writeValue', () => {
		it('should write valid array value', () => {
			component.writeValue([10, 20]);
			expect(component.value).toEqual([10, 20]);
		});

		it('should write string values for date type', () => {
			component.writeValue(['2024-01-01', '2024-12-31']);
			expect(component.value).toEqual(['2024-01-01', '2024-12-31']);
		});

		it('should handle mixed types', () => {
			component.writeValue([0, 100]);
			expect(component.value).toEqual([0, 100]);
		});

		it('should reset to [null, null] for invalid value', () => {
			component.value = [10, 20];
			component.writeValue(null as any);
			expect(component.value).toEqual([null, null]);
		});

		it('should reset to [null, null] for non-array value', () => {
			component.value = [10, 20];
			component.writeValue('invalid' as any);
			expect(component.value).toEqual([null, null]);
		});

		it('should reset to [null, null] for array with wrong length', () => {
			component.value = [10, 20];
			component.writeValue([10] as any);
			expect(component.value).toEqual([null, null]);
		});

		it('should reset to [null, null] for array with more than 2 elements', () => {
			component.value = [10, 20];
			component.writeValue([10, 20, 30] as any);
			expect(component.value).toEqual([null, null]);
		});

		it('should handle empty array', () => {
			component.value = [10, 20];
			component.writeValue([] as any);
			expect(component.value).toEqual([null, null]);
		});

		it('should preserve null values in valid array', () => {
			component.writeValue([null as any, 20]);
			expect(component.value).toEqual([null, 20]);

			component.writeValue([10, null as any]);
			expect(component.value).toEqual([10, null]);
		});
	});

	describe('ControlValueAccessor - registerOnChange', () => {
		it('should register onChange callback', () => {
			const mockFn = vi.fn().mockName('onChange');
			component.registerOnChange(mockFn);

			component.onChange([1, 2]);
			expect(mockFn).toHaveBeenCalledWith([1, 2]);
		});

		it('should replace previous onChange callback', () => {
			const mockFn1 = vi.fn().mockName('onChange1');
			const mockFn2 = vi.fn().mockName('onChange2');

			component.registerOnChange(mockFn1);
			component.registerOnChange(mockFn2);

			component.onChange([1, 2]);

			expect(mockFn1).not.toHaveBeenCalled();
			expect(mockFn2).toHaveBeenCalledWith([1, 2]);
		});
	});

	describe('ControlValueAccessor - registerOnTouched', () => {
		it('should register onTouched callback', () => {
			const mockFn = vi.fn().mockName('onTouched');
			component.registerOnTouched(mockFn);

			component.onTouched();
			expect(mockFn).toHaveBeenCalled();
		});

		it('should replace previous onTouched callback', () => {
			const mockFn1 = vi.fn().mockName('onTouched1');
			const mockFn2 = vi.fn().mockName('onTouched2');

			component.registerOnTouched(mockFn1);
			component.registerOnTouched(mockFn2);

			component.onTouched();

			expect(mockFn1).not.toHaveBeenCalled();
			expect(mockFn2).toHaveBeenCalled();
		});
	});

	describe('ControlValueAccessor - setDisabledState', () => {
		it('should set disabled to true', () => {
			component.setDisabledState(true);
			expect(component.disabled).toBe(true);
		});

		it('should set disabled to false', () => {
			component.disabled = true;
			component.setDisabledState(false);
			expect(component.disabled).toBe(false);
		});

		it('should toggle disabled state', () => {
			component.setDisabledState(true);
			expect(component.disabled).toBe(true);

			component.setDisabledState(false);
			expect(component.disabled).toBe(false);

			component.setDisabledState(true);
			expect(component.disabled).toBe(true);
		});
	});

	describe('integration scenarios', () => {
		it('should work with number range', () => {
			const onChange = vi.fn().mockName('onChange');
			component.registerOnChange(onChange);

			component.writeValue([0, 100]);
			expect(component.value).toEqual([0, 100]);
		});

		it('should work with date range', () => {
			fixture.componentRef.setInput('type', 'date');
			fixture.detectChanges();

			const onChange = vi.fn().mockName('onChange');
			component.registerOnChange(onChange);

			component.writeValue(['2024-01-01', '2024-12-31']);
			expect(component.value).toEqual(['2024-01-01', '2024-12-31']);
		});

		it('should maintain state when disabled', () => {
			component.writeValue([10, 20]);
			component.setDisabledState(true);

			expect(component.value).toEqual([10, 20]);
			expect(component.disabled).toBe(true);
		});
	});

	describe('edge cases', () => {
		it('should handle zero values', () => {
			component.writeValue([0, 0]);
			expect(component.value).toEqual([0, 0]);
		});

		it('should handle negative numbers', () => {
			component.writeValue([-10, -5]);
			expect(component.value).toEqual([-10, -5]);
		});

		it('should handle very large numbers', () => {
			component.writeValue([1000000, 9999999]);
			expect(component.value).toEqual([1000000, 9999999]);
		});

		it('should handle inverted range (max before min)', () => {
			component.writeValue([100, 10]);
			expect(component.value).toEqual([100, 10]);
		});
	});
});
