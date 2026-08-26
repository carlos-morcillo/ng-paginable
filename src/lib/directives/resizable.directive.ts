import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Output } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';

@Directive({
	selector: '[resizable]'
})
export class ResizableDirective {
	@Output()
	readonly resizable: Observable<number>;

	constructor(
		@Inject(DOCUMENT) private readonly documentRef: any /* Document */,
		@Inject(ElementRef) private readonly elementRef: ElementRef<HTMLElement>
	) {
		this.resizable = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mousedown').pipe(
			tap((e) => e.preventDefault()),
			switchMap(() => {
				const { width, right } = this.elementRef.nativeElement.closest('th')!.getBoundingClientRect();
				return fromEvent<MouseEvent>(this.documentRef, 'mousemove').pipe(
					map(({ clientX }) => width + clientX - right),
					distinctUntilChanged(),
					takeUntil(fromEvent(this.documentRef, 'mouseup'))
				);
			})
		);
	}
}
