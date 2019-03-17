import { computed, observable } from "mobx";

import { API } from "../";
import { MenuItem } from "./interface.item";
import { lang } from "../i18/i18";

class MenuData {
	@observable
	items: MenuItem[] = [
		{
			icon: "Home",
			name: "Home",
			order: -99,
			key: "Home",
			url: "",
			onClick: () => {
				API.router.go([""]);
			}
		}
	];

	@observable visible: boolean = false;

	@computed
	get sortedItems() {
		return this.items
			.slice()
			.reduce((arr: MenuItem[], item) => {
				if (arr.findIndex(x => x.key === item.key) === -1) {
					arr.push(item);
				}
				return arr;
			}, [])
			.sort((a, b) => a.order - b.order)
			.filter(item => !item.condition || item.condition());
	}

	@computed
	get currentIndex() {
		return this.sortedItems.findIndex(
			x => x.name === API.router.currentNamespace
		);
	}

	hide() {
		this.visible = false;
	}

	show() {
		this.visible = true;
	}
}

export const menu = new MenuData();
