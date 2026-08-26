/**
 * The list drag-and-drop coordinator is the shared native drag-and-drop service from
 * `ng-hub-ui-utils`. It is re-exported here (under the historical `HubListDragService` name)
 * so the list keeps a stable public surface while the implementation lives in the shared
 * core consumed by every ng-hub-ui library.
 */
export { HubDragDropService as HubListDragService, HubDragDropService } from 'ng-hub-ui-utils';
export type { ActiveDrag, DragPointerMode, DragRegistration, DragTarget } from 'ng-hub-ui-utils';
