import { CApp, CUqBase } from "uq-app";
import { CUqTest } from "uqTest";
import { VHome } from "./VHome";
import { VTestPage1 } from "./VTestPage1";
import { VTestPage2 } from "./VTestPage2";
import { VTestPage3 } from "./VTestPage3";

interface Data {
	count: number;
}

export class CHome extends CUqBase {
	data: Data;

	constructor(cApp: CApp) {
		super(cApp);
		this.data = this.shallow({
			count: 0
		});
	}

	protected async internalStart() {
	}

	tab = () => this.renderView(VHome);

	load = async () => {
		await this.cApp.cTicket.loadMyTicket();
	}

	startController = (controller: new (cApp: CApp) => CUqBase) => {
		let c = this.newC(controller);
		c.start();
	}

	showUqTest = async () => {
		let cUqTest = this.newC(CUqTest);
		await cUqTest.start();
	}

	showTestPage1 = () => {
		this.openVPage(VTestPage1);
	}

	showTestPage2 = () => {
		this.openVPage(VTestPage2);
	}

	showTestPage3 = () => {
		this.openVPage(VTestPage3);
	}

	inc = () => {
		++this.data.count;
	}

	dec = () => {
		--this.data.count;
	}
}

