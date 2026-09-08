import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe, UcfirstPipe } from 'ng-hub-ui-utils';

/**
 * Component for inputting a range of values (number or date) in a table filter.
 *
 * @export
 * @class HubPaginableTableRangeInputComponent
 * @implements {ControlValueAccessor}
 */
@Component({
	selector: 'hub-table-range-input, paginable-table-range-input',
	templateUrl: './paginable-table-range-input.component.html',
	styleUrls: ['./paginable-table-range-input.component.scss'],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [FormsModule, TranslatePipe, UcfirstPipe],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => HubPaginableTableRangeInputComponent),
			multi: true
		}
	]
})
export class HubPaginableTableRangeInputComponent implements ControlValueAccessor {
	disabled = false;
	/**
	 * The type of input to display. Can be 'number' or 'date'.
	 *
	 * @type {('number' | 'date')}
	 * @memberof HubPaginableTableRangeInputComponent
	 */
	readonly type = input<'number' | 'date'>('number');

	onChange = (value: [string | number, string | number]) => {};

	onTouched = () => {};

	value: [string | number | null, string | number | null] = [null, null];

	writeValue(value: [string | number, string | number]): void {
		if (Array.isArray(value) && value.length === 2) {
			this.value = value;
		} else {
			this.value = [null, null];
		}
	}

	registerOnChange(fn: (value: [string | number, string | number]) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}
}
