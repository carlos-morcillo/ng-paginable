import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Component for creating resizable table headers.
 * Applied to `th` elements with the `resizable` attribute.
 *
 * @export
 * @class HubResizableComponent
 */
@Component({
	selector: 'th[resizable]',
	templateUrl: './resizable.component.html',
	styleUrls: ['./resizable.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[style.width.px]': 'width'
	}
})
export class HubResizableComponent {
	/**
	 * The width of the resizable element in pixels.
	 *
	 * @type {(number | null)}
	 * @memberof HubResizableComponent
	 */
	width: number | null = null;

	onResize(width: any) {
		this.width = width;
	}
}
