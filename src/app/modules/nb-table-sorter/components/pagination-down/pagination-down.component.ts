import { Component, OnInit } from '@angular/core';
import { NbTableSorterHeader } from '../../nb-table-sorter-header';
import { MockedUsersService } from '../../../../mocked-users.service';

@Component({
	selector: 'app-pagination-down',
	templateUrl: './pagination-down.component.html',
	styleUrls: ['./pagination-down.component.scss']
})
export class PaginationDownComponent implements OnInit {

	items: any[];
	headers: (NbTableSorterHeader | string)[] = [
		'name',
		{
			property: 'email',
			title: 'Email'
		}
	];
	searchKeys: string[] = ['id', 'username', 'email', 'name'];

	constructor(
		private _mockedUsersSvc: MockedUsersService
	) { }

	ngOnInit() {
		this.items = this._mockedUsersSvc.items;
	}
}
