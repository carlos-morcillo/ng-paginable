import { Directive, TemplateRef, input } from '@angular/core';

@Directive({
	selector: '[headerTpt], [paginableTableHeader]',
	standalone: true
})
export class HubPaginableTableHeaderDirective {
	readonly header = input.required<string>();
	constructor(public template: TemplateRef<any>) {}
}
