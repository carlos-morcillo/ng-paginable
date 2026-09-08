import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuFilterComponent } from './menu-filter.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HubDropdownComponent } from '../dropdown/dropdown.component';
import { PaginableTableHeader } from '../../interfaces/paginable-table-header';
import {
	BooleanMatchModes,
	DateMatchModes,
	MenuFilterOperators,
	MenuFilterValue,
	NullMatchModes,
	NumberMatchModes,
	StringMatchModes
} from '../../interfaces/column-filter-event';
import { HubPaginableService } from '../../services/paginable.service';
import { HubTranslationService, TranslatePipe, UcfirstPipe } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

// Mock services
class MockHubTranslationService {
	private translationSource = new Subject<any>();
	translationObserver = this.translationSource.asObservable();

	getTranslation(key: string) {
		const translations: Record<string, string> = {
			LOADING: 'loading',
			SEARCH: 'search',
			NO_RESULTS_FOUND: 'No results found'
		};
		return translations[key] || key;
	}

	setTranslations() {}
	initialize() {}
}

class MockPaginableService {
	config = {
		language: 'en',
		mapping: {}
	};

	get mapping() {
		return this.config.mapping;
	}

	initialize() {}
}

describe('MenuFilterComponent', () => {
	let component: MenuFilterComponent;
	let fixture: ComponentFixture<MenuFilterComponent>;
	let formBuilder: FormBuilder;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MenuFilterComponent, ReactiveFormsModule, TranslatePipe, UcfirstPipe],
			providers: [
				FormBuilder,
				{
					provide: HubPaginableService,
					useClass: MockPaginableService
				},
				{
					provide: HubTranslationService,
					useClass: MockHubTranslationService
				},
				{
					provide: HubDropdownComponent,
					useValue: {
						closeDropdown: vi.fn().mockName('closeDropdown')
					}
				}
			]
		}).compileComponents();

		fixture = TestBed.createComponent(MenuFilterComponent);
		component = fixture.componentInstance;
		formBuilder = TestBed.inject(FormBuilder);

		// Set a default header before detecting changes
		fixture.componentRef.setInput('header', {
			title: 'Test Header',
			property: 'testProperty',
			filter: { type: 'text' }
		});

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	/**
	 * The match modes and the empty rule used to be written by the `header` setter, one after
	 * the other, so they were only ever right in the order the setter happened to write them.
	 * They are derived now, and a header arriving later has to reach both.
	 */
	it('offers the match modes of the header it is given', () => {
		expect(component.matchModes()).toEqual([...Object.values(StringMatchModes), ...Object.values(NullMatchModes)]);

		fixture.componentRef.setInput('header', { property: 'age', filter: { type: 'number' } });
		fixture.detectChanges();

		expect(component.matchModes()).toEqual([...Object.values(NumberMatchModes), ...Object.values(NullMatchModes)]);
	});

	it('falls back to one empty rule in the first match mode of that header', () => {
		fixture.componentRef.setInput('header', { property: 'born', filter: { type: 'date' } });
		fixture.detectChanges();

		expect(component.defaultValue()).toEqual({
			operator: MenuFilterOperators.And,
			rules: [{ value: null, matchMode: Object.values(DateMatchModes)[0] }]
		});
	});

	it('writes the fallback into the form when the control holds nothing', () => {
		component.writeValue(null);

		expect(component.form.value).toEqual(component.defaultValue());
	});

	// it('should initialize form correctly', () => {
	// 	expect(component.form.get('operator')).toBeTruthy();
	// 	expect(component.form.get('rules')).toBeTruthy();
	// });

	// it('should set header and update matchModes', () => {
	// 	const header: PaginableTableHeader = {
	// 		property: 'column1',
	// 		filter: { type: 'text' }
	// 	};
	// 	component.header = header;
	// 	expect(component.matchModes).toEqual(
	// 		jasmine.objectContaining(StringMatchModes)
	// 	);
	// });

	// it('should add a new rule', () => {
	// 	component.add();
	// 	expect(component.rulesFA.length).toBe(1);
	// });

	// it('should clear rules', () => {
	// 	component.add();
	// 	component.add();
	// 	component.clear();
	// 	expect(component.rulesFA.length).toBe(1);
	// });

	// it('should apply filter', () => {
	// 	spyOn(component, 'onChange');
	// 	component.add();
	// 	component.rulesFA.at(0).patchValue({
	// 		value: 'test',
	// 		matchMode: StringMatchModes.Contains
	// 	});
	// 	component.apply();
	// 	expect(component.onChange).toHaveBeenCalledWith(
	// 		jasmine.objectContaining({
	// 			operator: MenuFilterOperators.And,
	// 			rules: [{ value: 'test', matchMode: StringMatchModes.Contains }]
	// 		})
	// 	);
	// });

	// it('should write value correctly', () => {
	// 	const value: MenuFilterValue = {
	// 		operator: MenuFilterOperators.Or,
	// 		rules: [{ value: 'test', matchMode: StringMatchModes.StartsWith }]
	// 	};
	// 	component.writeValue(value);
	// 	expect(component.form.value).toEqual(value);
	// });

	// it('should set default value when writing null', () => {
	// 	component.writeValue(null);
	// 	expect(component.form.value).toEqual(component.defaultValue);
	// });

	// it('should enable/disable value control based on matchMode', () => {
	// 	component.add();
	// 	const group = component.rulesFA.at(0) as FormGroup;
	// 	group.patchValue({ matchMode: NullMatchModes.IsNull });
	// 	component.enableOrDisableValueControl(group);
	// 	expect(group.get('value')?.disabled).toBe(true);

	// 	group.patchValue({ matchMode: StringMatchModes.Contains });
	// 	component.enableOrDisableValueControl(group);
	// 	expect(group.get('value')?.enabled).toBe(true);
	// });

	// it('should register onChange function', () => {
	// 	const testFn = () => {};
	// 	component.registerOnChange(testFn);
	// 	expect(component.onChange).toBe(testFn);
	// });

	// it('should register onTouched function', () => {
	// 	const testFn = () => {};
	// 	component.registerOnTouched(testFn);
	// 	expect(component.onTouched).toBe(testFn);
	// });

	// // Test for different filter types
	// it('should set correct match modes for number filter', () => {
	// 	component.header = { property: 'column1', filter: { type: 'number' } };
	// 	expect(component.matchModes).toContain(
	// 		jasmine.objectContaining(NumberMatchModes)
	// 	);
	// });

	// it('should set correct match modes for date filter', () => {
	// 	debugger;
	// 	component.header = { property: 'column1', filter: { type: 'date' } };
	// 	expect(component.matchModes).toContain(
	// 		jasmine.objectContaining(DateMatchModes)
	// 	);
	// });

	// it('should set correct match modes for boolean filter', () => {
	// 	component.header = { property: 'column1', filter: { type: 'boolean' } };
	// 	expect(component.matchModes).toContain(
	// 		jasmine.objectContaining(BooleanMatchModes)
	// 	);
	// });
});
