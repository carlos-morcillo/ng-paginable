import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	inject,
	input,
	OnDestroy,
	output,
	signal,
	TemplateRef,
	viewChild,
	ViewContainerRef
} from '@angular/core';

import { ConnectionPosition, generateUniqueId, OverlayRef, OverlayService } from 'ng-hub-ui-utils';

/**
 * Event emitted when the dropdown state changes
 */
export interface DropdownEvent {
	/** Unique identifier of the dropdown */
	id: string;
}

/**
 * Configuration for dropdown overlay positioning
 */
const DROPDOWN_POSITIONS: ReadonlyArray<ConnectionPosition> = [
	{
		originX: 'start',
		originY: 'bottom',
		overlayX: 'start',
		overlayY: 'top',
		offsetY: 4
	},
	{
		originX: 'start',
		originY: 'top',
		overlayX: 'start',
		overlayY: 'bottom',
		offsetY: -4
	},
	{
		originX: 'end',
		originY: 'bottom',
		overlayX: 'end',
		overlayY: 'top',
		offsetY: 4
	},
	{
		originX: 'end',
		originY: 'top',
		overlayX: 'end',
		overlayY: 'bottom',
		offsetY: -4
	}
] as const;

/**
 * Dropdown component that provides a floating overlay menu.
 *
 * This component uses a custom overlay system to create a positioned dropdown menu
 * that can be toggled open and closed. It automatically positions itself relative
 * to the host element and handles backdrop clicks for closing.
 *
 * @example
 * ```html
 * <hub-dropdown>
 *   <div class="button">Open Menu</div>
 *   <div class="content">
 *     <button>Option 1</button>
 *     <button>Option 2</button>
 *   </div>
 * </hub-dropdown>
 * ```
 */
@Component({
	selector: 'hub-dropdown, hub-ui-dropdown',
	standalone: true,
	imports: [],
	templateUrl: './dropdown.component.html',
	styleUrls: ['./dropdown.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'hub-dropdown',
		'[id]': 'id()'
	}
})
export class DropdownComponent implements OnDestroy {
	/** Change detection reference for manual updates */
	private readonly _cdr = inject(ChangeDetectorRef);

	/** Overlay service for creating floating panels */
	private readonly _overlay = inject(OverlayService);

	/** View container reference for portal attachment */
	private readonly _viewContainerRef = inject(ViewContainerRef);

	/** Reference to the host element */
	private readonly _elementRef = inject(ElementRef);

	/** Reference to the overlay instance */
	private _overlayRef: OverlayRef | null = null;

	/** Reference to the scroll event listener for cleanup */
	private _scrollListener: (() => void) | null = null;

	/**
	 * Unique identifier for the dropdown instance.
	 * Automatically generated if not provided.
	 */
	readonly id = input(generateUniqueId(16));

	/**
	 * Template reference containing the dropdown content.
	 * This template is projected into the overlay when opened.
	 */
	readonly dropdownContent = viewChild.required<TemplateRef<unknown>>('dropdownContent');

	/**
	 * Event emitted when the dropdown is opened.
	 * Includes the dropdown's unique identifier.
	 */
	readonly open = output<DropdownEvent>();

	/**
	 * Event emitted when the dropdown is closed.
	 * Includes the dropdown's unique identifier.
	 */
	readonly close = output<DropdownEvent>();

	/**
	 * Reactive signal tracking the dropdown's open/closed state.
	 * Use this for reactive state management in templates.
	 */
	readonly isOpened = signal<boolean>(false);

	/**
	 * Toggles the dropdown between open and closed states.
	 * Automatically handles overlay creation and cleanup.
	 */
	toggle(): void {
		if (this.isOpened()) {
			this.closeDropdown();
		} else {
			this.openDropdown();
		}
	}

	/**
	 * Closes the dropdown and disposes the overlay completely.
	 * Emits the close event with the dropdown's identifier.
	 */
	closeDropdown(): void {
		if (this._overlayRef) {
			this._overlayRef.dispose();
			this._overlayRef = null;
		}

		this._removeScrollListener();
		this.isOpened.set(false);
		this._cdr.markForCheck();
		this.close.emit({ id: this.id() });
	}

	/**
	 * Opens the dropdown and creates/attaches the overlay.
	 * Emits the open event with the dropdown's identifier.
	 *
	 * The overlay is positioned relative to the host element with fallback positions
	 * to ensure it remains visible within the viewport.
	 */
	openDropdown(): void {
		this.isOpened.set(true);
		this._cdr.markForCheck();
		this.open.emit({ id: this.id() });

		// Use setTimeout to ensure the template content is available after change detection
		setTimeout(() => {
			const dropdownContent = this.dropdownContent();
			if (!dropdownContent) {
				return;
			}

			// Create new overlay instance
			this._overlayRef = this._createOverlay();
			this._setupBackdropClickHandler();

			// Attach the dropdown content to the overlay
			this._overlayRef.attach(dropdownContent, this._viewContainerRef);

			// Update position after attachment to ensure proper positioning
			requestAnimationFrame(() => {
				this._overlayRef?.updatePosition();
				this._setupScrollListener();
			});
		});
	}

	/**
	 * Creates and configures the custom overlay with positioning strategies.
	 *
	 * @returns The configured overlay reference
	 */
	private _createOverlay(): OverlayRef {
		const positionStrategy = this._overlay
			.position()
			.flexibleConnectedTo(this._elementRef)
			.withPositions([...DROPDOWN_POSITIONS]);

		return this._overlay.create({
			positionStrategy,
			hasBackdrop: true,
			backdropClass: 'hub-overlay-transparent-backdrop'
		});
	}

	/**
	 * Sets up the backdrop click handler to close the dropdown when clicking outside.
	 */
	private _setupBackdropClickHandler(): void {
		this._overlayRef?.onBackdropClick(() => {
			this.closeDropdown();
		});
	}

	/**
	 * Sets up a scroll listener to close the dropdown when scrolling occurs.
	 * This prevents the dropdown from appearing detached from its trigger element.
	 */
	private _setupScrollListener(): void {
		this._removeScrollListener();

		this._scrollListener = () => {
			this.closeDropdown();
		};

		// Listen to scroll events on window and all parent elements
		window.addEventListener('scroll', this._scrollListener, true);
	}

	/**
	 * Removes the scroll event listener to prevent memory leaks.
	 */
	private _removeScrollListener(): void {
		if (this._scrollListener) {
			window.removeEventListener('scroll', this._scrollListener, true);
			this._scrollListener = null;
		}
	}

	/**
	 * Lifecycle hook called when the component is destroyed.
	 * Cleans up the overlay to prevent memory leaks.
	 */
	ngOnDestroy(): void {
		this._removeScrollListener();
		this._overlayRef?.dispose();
	}
}
