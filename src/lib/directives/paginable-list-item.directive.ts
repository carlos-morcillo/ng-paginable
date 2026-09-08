import { Directive, TemplateRef } from '@angular/core';

@Directive({
	selector: '[listItemTpt]'
})
export class HubPaginableListItemDirective {
	constructor(public template: TemplateRef<any>) {}
}
