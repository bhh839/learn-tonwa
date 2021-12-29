import { Tonwa, AppConfig as AppConfigCore, UqConfig } from '../core';
import { UQsMan } from "./uqsMan";
import { LocalMap, LocalCache, env } from '../tool';
import { UqData, UqAppData, CenterAppApi } from '../web';

export class UQsLoader {
	readonly tonwa: Tonwa;
	protected readonly appConfig: AppConfigCore;
	protected isBuildingUQ: boolean = false;
	uqsMan: UQsMan;         // value

	constructor(tonwa: Tonwa, appConfig: AppConfigCore) {
		this.appConfig = appConfig;
		this.tonwa = tonwa;
	}

	async build() {
		let { app, uqs } = this.appConfig;
		let retErrors: string[];
		if (app) {
			retErrors = await this.loadApp();
		}
		else if (uqs) {
			retErrors = await this.loadUqs();
		}
		else {
			throw new Error('either uqs or app must be defined in AppConfig');
		}
		return retErrors;
	}
	/*
	async buildUQs(uqsConfig: AppConfig) {
		let {uqs, tvs, version} = uqsConfig;
		let retErrors:string[];
		if (uqs) {
			UQsMan.isBuildingUQ = true;
			retErrors = await this.loadUqs();
		}
		else {
			throw new Error('either uqs or app must be defined in AppConfig');
		}
		return retErrors;
	}
	*/

	// 返回 errors, 每个uq一行
	private async loadApp(): Promise<string[]> {
		let { app, uqs: uqConfigs, version } = this.appConfig;

		let { name, dev } = app;
		let uqsManApp = new UQsManApp(this.tonwa, `${dev.name}/${name}`);
		this.uqsMan = uqsManApp;
		let { appOwner, appName, localData } = uqsManApp;
		let uqAppData: UqAppData = localData.get();
		if (!uqAppData || uqAppData.version !== version) {
			uqAppData = await this.loadUqAppData(appOwner, appName);
			if (!uqAppData.id) {
				return [
					`${appOwner}/${appName}不存在。请仔细检查app全名。`
				];
			}
			uqAppData.version = version;

			if (uqConfigs) {
				let data = await this.loadUqData(uqConfigs);
				uqAppData.uqs.push(...data);
			}

			localData.set(uqAppData);
			// 
			for (let uq of uqAppData.uqs) uq.newVersion = true;
		}
		let { id, uqs } = uqAppData;
		uqsManApp.id = id;
		return await this.uqsMan.buildUqs(uqs, version, uqConfigs, this.isBuildingUQ);
	}

	// 返回 errors, 每个uq一行
	async loadUqs(/*uqConfigs: UqConfig[], version:string, tvs:TVs*/): Promise<string[]> {
		let { uqs: uqConfigs, version } = this.appConfig;
		this.uqsMan = new UQsMan(this.tonwa);
		let uqs = await this.loadUqData(uqConfigs);
		return await this.uqsMan.buildUqs(uqs, version, uqConfigs, this.isBuildingUQ);
	}

	private async loadUqAppData(appOwner: string, appName: string): Promise<UqAppData> {
		let centerAppApi = new CenterAppApi(this.tonwa.web, 'tv/', undefined);
		let ret = await centerAppApi.appUqs(appOwner, appName);
		return ret;
	}

	private async loadUqData(uqConfigs: UqConfig[]): Promise<UqData[]> {
		let uqs: { owner: string; ownerAlias: string; name: string; alias: string; version: string }[] = uqConfigs.map(
			v => {
				let { dev, name, version, alias } = v;
				let { name: owner, alias: ownerAlias } = dev;
				return { owner, ownerAlias, name, version, alias };
			}
		);
		let centerAppApi = new CenterAppApi(this.tonwa.web, 'tv/', undefined);
		let ret: UqData[] = await centerAppApi.uqs(uqs);
		if (ret.length < uqs.length) {
			let err = `下列UQ：\n${uqs.map(v => `${v.owner}/${v.name}`).join('\n')}之一不存在`;
			console.error(err);
			throw Error(err);
		}
		for (let i = 0; i < uqs.length; i++) {
			let { ownerAlias, alias } = uqs[i];
			ret[i].ownerAlias = ownerAlias;
			ret[i].uqAlias = alias;
		}
		return ret;
	}
}

class UQsManApp extends UQsMan {
	readonly appOwner: string;
	readonly appName: string;
	readonly localMap: LocalMap;
	readonly localData: LocalCache;
	id: number;

	constructor(tonwa: Tonwa, tonwaAppName: string/*, tvs:TVs*/) {
		super(tonwa/*, tvs*/);
		let parts = tonwaAppName.split('/');
		if (parts.length !== 2) {
			throw new Error('tonwaApp name must be / separated, owner/app');
		}
		this.appOwner = parts[0];
		this.appName = parts[1];
		this.localMap = env.localDb.map(tonwaAppName);
		this.localData = this.localMap.child('uqData');
	}
}

export class UQsBuildingLoader extends UQsLoader {
	async build() {
		//nav.forceDevelopment = true;
		env.isDevelopment = true;
		//await nav.init();
		//await this.tonwa.web.navInit();
		await this.tonwa.init();
		this.isBuildingUQ = true;
		let { uqs } = this.appConfig;
		let retErrors: string[];
		if (uqs) {
			retErrors = await this.loadUqs();
		}
		else {
			throw new Error('uqs must be defined in AppConfig');
		}
		return retErrors;
	}
}
