import { Directive, TemplateRef, input } from '@angular/core';

@Directive({
	selector: '[filterTpt], [paginableTableFilter]',
	standalone: true
})
export class HubPaginableTableFilterDirective {
	readonly header = input.required<string>();

	constructor(public template: TemplateRef<any>) {}
}
