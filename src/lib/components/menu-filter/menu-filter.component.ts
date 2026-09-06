import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input } from '@angular/core';
import {
	ControlValueAccessor,
	FormArray,
	FormBuilder,
	FormGroup,
	NG_VALUE_ACCESSOR,
	ReactiveFormsModule
} from '@angular/forms';
import { TranslatePipe, UcfirstPipe } from 'ng-hub-ui-utils';
import {
	BooleanMatchModes,
	DateMatchModes,
	MatchModes,
	MenuFilterOperators,
	MenuFilterRule,
	MenuFilterValue,
	NullMatchModes,
	NumberMatchModes,
	StringMatchModes
} from '../../interfaces/column-filter-event';
import { PaginableTableHeader } from '../../interfaces/paginable-table-header';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
	selector: 'hub-menu-filter',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ReactiveFormsModule, UpperCasePipe, TranslatePipe, UcfirstPipe],
	templateUrl: './menu-filter.component.html',
	styleUrls: ['./menu-filter.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MenuFilterComponent),
			multi: true
		}
	]
})
export class MenuFilterComponent implements ControlValueAccessor {
	#fb = inject(FormBuilder);
	#parent = inject(DropdownComponent);

	/**
	 * The table header configuration associated with this filter.
	 *
	 * @type {PaginableTableHeader}
	 * @memberof MenuFilterComponent
	 */
	readonly header = input<PaginableTableHeader>();

	/**
	 * Match modes offered for this column, derived from the filter type.
	 *
	 * Derived rather than assigned from the input's setter: the setter also had to write
	 * `defaultValue`, so the two could only ever be right in the order they were written.
	 */
	readonly matchModes = computed<Array<MatchModes>>(() => {
		let matchModes;
		switch (this.header()?.filter?.type) {
			case 'number':
				matchModes = NumberMatchModes;
				break;
			case 'date':
			case 'date-range':
				matchModes = DateMatchModes;
				break;
			case 'boolean':
				matchModes = BooleanMatchModes;
				break;
			default:
				matchModes = StringMatchModes;
				break;
		}
		return [...Object.values(matchModes as any), ...Object.values(NullMatchModes)] as MatchModes[];
	});

	/** The one empty rule the filter falls back to when the form writes nothing. */
	readonly defaultValue = computed<MenuFilterValue>(() => ({
		operator: MenuFilterOperators.And,
		rules: [
			{
				value: null,
				matchMode: this.matchModes()[0]
			}
		]
	}));

	form = this.#fb.group({
		operator: [MenuFilterOperators.And],
		rules: this.#fb.array([])
	});

	get rulesFA(): FormArray {
		return this.form.get('rules') as FormArray;
	}

	onChange = (value: MenuFilterValue | null) => {};
	onTouched = () => {};

	nullMatchModes = NullMatchModes;

	/**
	 * Clears existing rules, sets a default value if none is provided, adds rules based on the input value, and patches the form with the input value.
	 * @param {MenuFilterValue} value - MenuFilterValue
	 */
	writeValue(value: MenuFilterValue | null): void {
		this.rulesFA.clear();
		if (!value) {
			value = this.defaultValue();
		}
		value.rules.forEach((_) => this.add());
		this.form.patchValue(value);
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	/**
	 * Adds a new form group to a FormArray with default values or values provided as input.
	 *
	 * @param {MenuFilterRule} [value] - The `value` parameter in the `add` method is an optional parameter of type `MenuFilterRule`.
	 * It is used to provide a value that will be patched into the form group created within the method. If a `value` is provided, it
	 * will be used to patch the form group's
	 */
	add(value?: MenuFilterRule) {
		const rulesFA = this.form.get('rules') as FormArray;
		const ruleFG = this.#fb.group({
			value: [null],
			matchMode: [this.matchModes()[0]]
		});
		if (value) {
			ruleFG.patchValue(value as any);
		}
		rulesFA.push(ruleFG);
	}

	/**
	 * Clears all rules in a FormArray, adds a new rule, and applies the changes.
	 */
	clear() {
		const rulesFA = this.form.get('rules') as FormArray;
		rulesFA.clear();
		this.add();
		this.apply();
	}

	/**
	 * Filters rules based on certain conditions and then calls onChange with the filtered rules or null.
	 */
	apply() {
		let { operator, rules } = this.form.value as MenuFilterValue;
		rules = rules?.filter(
			(rule) =>
				[NullMatchModes.IsNotNull, NullMatchModes.IsNull].includes(rule.matchMode as any) ||
				(rule.value !== undefined && rule.value !== null)
		);
		this.onChange(
			rules.length
				? {
						operator,
						rules
					}
				: null
		);
		this.#parent.closeDropdown();
	}

	/**
	 * Disables or enables a form control based on the selected match mode in a FormGroup.
	 *
	 * @param {FormGroup} group - The `group` parameter is a FormGroup object in Angular, which represents a collection of FormControl
	 * instances. It is typically used to manage the form controls within a form.
	 */
	enableOrDisableValueControl(group: FormGroup) {
		const { matchMode } = group.value;
		if (Object.values(NullMatchModes).includes(matchMode)) {
			group.get('value')?.disable();
		} else {
			group.get('value')?.enable();
		}
	}
}
