import { Directive, TemplateRef } from '@angular/core';

@Directive({
	selector: '[rowTpt], [paginableTableRow]',
	standalone: true
})
export class HubPaginableTableRowDirective {
	constructor(public template: TemplateRef<any>) {}
}
