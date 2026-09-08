import { Directive, TemplateRef, input } from '@angular/core';

@Directive({
	selector: '[cellTpt], [paginableTableCell]',
	standalone: true
})
export class HubPaginableTableCellDirective {
	readonly header = input.required<string>();
	constructor(public template: TemplateRef<any>) {}
}
