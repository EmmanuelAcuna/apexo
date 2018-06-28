import './data-table.component.scss';

import * as React from 'react';

import { Icon, SearchBox, CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { escapeRegExp } from '../../utils/escape-regex';

interface Cell {
	component: string | React.ReactElement<any>;
	dataValue: string | number;
	onClick?: () => void;
	className?: string;
	visibleOnSize?: string;
}

type Row = Cell[];

interface Props {
	heads: string[];
	rows: Row[];
	className?: string;
	commands?: ICommandBarItemProps[];
}

@observer
export class DataTable extends React.Component<Props, {}> {
	get sortableValues() {
		return this.props.rows.map((row) => {
			return row[this.currentColIndex].dataValue;
		});
	}
	@observable currentColIndex: number = 0;
	@observable sortDirection: number = 1;
	@observable filterString: string = '';
	render() {
		return (
			<div className="data-table">
				<CommandBar
					{...{
						className: 'commandBar fixed m-b-15',
						isSearchBoxVisible: true,
						searchPlaceholderText: 'Search Patients...',
						elipisisAriaLabel: 'More options',
						farItems: [
							{
								key: 'a',
								onRender: () => (
									<SearchBox
										placeholder="search"
										onChange={(newVal: string) => (this.filterString = newVal)}
									/>
								)
							}
						],
						items: this.props.commands || []
					}}
				/>
				<table className={'responsive ms-table ' + this.props.className}>
					<thead>
						<tr>
							{this.props.heads.map((head, index) => (
								<th
									className={
										'table-head-sort' +
										(this.currentColIndex === index ? ' current' : '') +
										(this.currentColIndex === index && this.sortDirection === 1
											? ' positive'
											: '') +
										(this.currentColIndex === index && this.sortDirection === -1 ? ' negative' : '')
									}
									key={index}
									onClick={() => {
										if (this.currentColIndex === index) {
											this.sortDirection = this.sortDirection * -1;
										} else {
											this.currentColIndex = index;
											this.sortDirection = 1;
										}
									}}
								>
									{head}
									<span className="sort-indicators">
										<Icon className="positive" iconName="ChevronUpSmall" />
										<Icon className="negative" iconName="ChevronDownSmall" />
									</span>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{this.props.rows
							.filter((row) => {
								if (!this.filterString) {
									return true;
								}

								const filters = this.filterString
									.split(' ')
									.map((filterString) => new RegExp(escapeRegExp(filterString), 'gim'));

								return row.some((cell) =>
									filters.every((filter) => filter.test(cell.dataValue.toString()))
								);
							})
							.map((row, index) => {
								return {
									row,
									index
								};
							})
							.sort((aVal, bVal) => {
								return this.sortDirection === 1
									? this.compare(this.sortableValues[aVal.index], this.sortableValues[bVal.index])
									: this.compare(this.sortableValues[bVal.index], this.sortableValues[aVal.index]);
							})
							.map((x) => x.row)
							.map((cells, index) => {
								return (
									<tr key={index}>
										{cells.map((cell, index2) => {
											return (
												<td
													className={
														(cell.onClick ? 'clickable ' : '') +
														(cell.className ? cell.className : '')
													}
													key={index2}
													data-head={this.props.heads[index2] || ''}
													onClick={cell.onClick}
												>
													{typeof cell.component === 'string' ? (
														cell.component
													) : (
														cell.component
													)}
												</td>
											);
										})}
									</tr>
								);
							})}
					</tbody>
				</table>
			</div>
		);
	}

	private compare(a: string | number, b: string | number) {
		return a.toString().localeCompare(b.toString());
	}
}
