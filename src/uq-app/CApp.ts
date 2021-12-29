import { CHome } from "../home";
import { CMe } from "../me";
import { CUqApp } from "./CBase";
import { res } from "./res";
import { VMain } from "./VMain";
import { setUI } from "./uqs";
import { makeObservable, observable, runInAction } from "mobx";
import { start } from "tonwa";
import { appConfig } from "./appConfig";
import { Tonwa } from "tonwa-core";
import { CTicket } from "ids/ticket";

const gaps = [10, 3, 3, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 10, 10, 10, 10, 15, 15, 15, 30, 30, 60];

export interface Title {
	title: string;
	vice?: string;
	unit?: string;
	fixed?: number;
}


export class CApp extends CUqApp {
	constructor(tonwa: Tonwa) {
		super(tonwa, appConfig);
	}

	cHome: CHome;
	cMe: CMe;
	cTicket: CTicket;

	protected async internalStart(isUserLogin: boolean) {
		makeObservable(this, {
			refreshTime: observable
		});
		this.setRes(res);
		setUI(this.uqs);

		await this.loadBaseData();

		this.cHome = this.newC(CHome);
		this.cMe = this.newC(CMe);
		this.cTicket = this.newC(CTicket);
		this.cHome.load();
		this.openVPage(VMain, undefined, this.dispose);
		// 加上下面一句，可以实现主动页面刷新
		this.timer = setInterval(this.callTick, 1000);
		// uq 里面加入这一句，会让相应的$Poked查询返回poke=1：
		// TUID [$User] ID (member) SET poke=1;
	}

	private timer: any;
	protected onDispose() {
		clearInterval(this.timer);
		this.timer = undefined;
	}

	async initStart() {
		await this.tonwa.appStart();
	}

	render(loginedOnly: boolean = true): JSX.Element {
		const onLogined = async (isUserLogin?: boolean) => {
			await start(CApp, this.tonwa, appConfig, isUserLogin);
		}
		let onNotLogined: () => Promise<void> = undefined;
		if (loginedOnly === false) onNotLogined = onLogined;
		return this.tonwa.nav.renderNavView(onLogined, onNotLogined);
	}


	private async loadBaseData() {
		/*
		let { JkMe } = this.uqs;
		let [retItemTitles, retPostTitles, retAccountTitles, roleOps, myTimezone] = await Promise.all([
			JkMe.GetItemTitles.query({}),
			JkMe.GetPostTitles.query({}),
			JkMe.GetAccountTitles.query({}),
			JkMe.GetRoleOps.query({}),
			JkMe.$getMyTimezone.query({}),
		]);
		for (let it of retItemTitles.ret) this.itemTitles[it.id as Item] = it;
		for (let pt of retPostTitles.ret) this.postTitles[pt.id as Post] = pt;
		for (let at of retAccountTitles.ret) this.accountTitles[at.id as EnumAccount] = at;
		this.ops = roleOps.ret;
		let tz = myTimezone.ret[0];
		this.timezone = tz.timezone;
		this.unitTimezone = tz.unitTimeZone;
		*/
	}

	// 数据服务器提醒客户端刷新，下面代码重新调入的数据
	refresh = async () => {
		let d = Date.now() / 1000;
		if (d - this.refreshTime < 30) return;
		await Promise.all([
			this.cHome.load(),
		]);
		runInAction(() => {
			this.refreshTime = d;
		});
	}

	refreshTime: number = Date.now() / 1000;

	private tick = 0;
	private gapIndex = 0;
	private callTick = async () => {
		try {
			if (!this.user) return;
			++this.tick;
			if (this.tick < gaps[this.gapIndex]) return;
			this.tick = 0;
			if (this.gapIndex < gaps.length - 1) ++this.gapIndex;
			/*
			let ret = await this.uqs.JkMe.$poked.query(undefined, undefined, false);
			let v = ret.ret[0];
			if (v === undefined) return;
			if (!v.poke) return;
			this.gapIndex = 1;
			await this.refresh();
			*/
		}
		catch {
		}
	}
}
