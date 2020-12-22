import { NbTableSorterButton } from './nb-table-sorter-button';

export interface NbTableSorterDropdown {
	title?: string;
	icon?: string;
	color?: string;
	buttons: Array<NbTableSorterButton>
}