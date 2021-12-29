import { env } from '../tool';
import { UqMan } from './uqMan';
import { TuidImport, TuidInner } from './tuid';
import { Web, UqData } from '../web';
import { Tonwa, UqConfig } from '../core';

/*
export interface TVs {
	[uqName:string]: {
		[tuidName: string]: (values: any) => JSX.Element;
	}
}
*/

export class UQsMan {
	private readonly tonwa: Tonwa;
	private readonly web: Web;
	private collection: { [uqLower: string]: UqMan };
	//private readonly tvs: TVs;
	proxy: any;
	uqMans: UqMan[] = [];

	constructor(tonwa: Tonwa/*, tvs:TVs*/) {
		this.tonwa = tonwa;
		this.web = tonwa.web;
		//this.tvs = tvs || {};
		//this.buildTVs();
		this.uqMans = [];
		this.collection = {};
	}

	async buildUqs(uqDataArr: UqData[], version: string, uqConfigs: UqConfig[], isBuildingUQ: boolean): Promise<string[]> {
		await this.init(uqDataArr);

		let localMap = env.localDb.map('$app');
		let localCacheVersion = localMap.child('version');
		let cacheVersion = localCacheVersion.get();
		if (version !== cacheVersion) {
			for (let uqMan of this.uqMans) {
				uqMan.localMap.removeAll();
			}
			localCacheVersion.set(version);
		}

		let retErrors = await this.load();
		if (retErrors.length > 0) return retErrors;
		if (isBuildingUQ === false) {
			this.setTuidImportsLocal();
		}
		if (retErrors.length > 0) return retErrors;
		if (uqConfigs) {
			for (let uqConfig of uqConfigs) {
				let { dev, name, alias } = uqConfig;
				let { name: owner, alias: ownerAlias } = dev;
				let uqLower = (ownerAlias ?? owner).toLowerCase() + '/' + (alias ?? name).toLowerCase();
				let uq = this.collection[uqLower];
				uq.config = uqConfig;
			}
		}
		this.proxy = this.buildUQs();
	}

	uq(uqName: string): UqMan {
		return this.collection[uqName.toLowerCase()];
	}

	async getUqUserRoles(uqLower: string): Promise<string[]> {
		let uqMan = this.collection[uqLower];
		if (uqMan === undefined) return null;
		let roles = await uqMan.getRoles();
		return roles;
	}

	/*
	private buildTVs() {
		if (!this.tvs) return;
		for (let i in this.tvs) {
			let uqTVs = this.tvs[i];
			if (uqTVs === undefined) continue;
			let l = i.toLowerCase();
			if (l === i) continue;
			this.tvs[l] = uqTVs;
			for (let j in uqTVs) {
				let en = uqTVs[j];
				if (en === undefined) continue;
				let lj = j.toLowerCase();
				if (lj === j) continue;
				uqTVs[lj] = en;
			}
		}
	}
	*/

	async init(uqsData: UqData[]): Promise<void> {
		let promiseInits: PromiseLike<void>[] = [];
		for (let uqData of uqsData) {
			let { uqOwner, ownerAlias, uqName, uqAlias } = uqData;

			// 原名加入collection
			let uqFullName = uqOwner + '/' + uqName;
			let uqFull = this.collection[uqFullName];
			let uq: UqMan;
			if (uqFull) {
				uq = uqFull;
			}
			else {
				uq = new UqMan(this.tonwa, uqData/*, undefined, this.tvs[uqFullName] || this.tvs[uqName]*/);
				this.collection[uqFullName] = uq;
				promiseInits.push(uq.init());
			}
			this.uqMans.push(uq);
			let lower = uqFullName.toLowerCase();
			this.collection[lower] = uq;

			// 别名加入collection
			if (uqAlias) uqName = uqAlias;
			if (ownerAlias) uqOwner = ownerAlias;
			uqFullName = uqOwner + '/' + uqName;
			lower = uqFullName.toLowerCase();
			this.collection[lower] = uq;
		}
		await Promise.all(promiseInits);
	}

	async load(): Promise<string[]> {
		let retErrors: string[] = [];
		let promises: PromiseLike<string>[] = [];
		//let lowerUqNames:string[] = [];
		// collection有小写名字，还有正常名字
		//for (let i in this.collection) {
		for (let uqMan of this.uqMans) {
			//let lower = (i as string).toLowerCase();
			//if (lowerUqNames.indexOf(lower) >= 0) continue;
			//lowerUqNames.push(lower);
			//let uq = this.collection[i];
			promises.push(uqMan.loadEntities());
		}
		let results = await Promise.all(promises);
		for (let result of results) {
			let retError = result; // await cUq.loadSchema();
			if (retError !== undefined) {
				retErrors.push(retError);
			}
		}
		return retErrors;
	}

	private buildUQs(): any {
		let uqs: any = {};
		function setUq(uqKey: string, proxy: any): void {
			if (!uqKey) return;
			let lower = uqKey.toLowerCase();
			uqs[uqKey] = proxy;
			if (lower !== uqKey) uqs[lower] = proxy;
		}
		for (let uqMan of this.uqMans) {
			let proxy = uqMan.createProxy();
			setUq(uqMan.getUqKey(), proxy);
			setUq(uqMan.getUqKeyWithConfig(), proxy);
			/*
			let uqKey = uqMan.getUqKey();
			let lower = uqKey.toLowerCase();
			uqs[uqKey] = proxy;
			if (lower !== uqKey) uqs[lower] = proxy;
			let uqKeyWithConfig = uqMan.getUqKeyWithConfig();
			let lowerWithConfig = uqKeyWithConfig.toLowerCase();
			uqs[uqKeyWithConfig] = proxy;
			if (lowerWithConfig !== uqKeyWithConfig) uqs[lowerWithConfig] = proxy;
			*/
		}
		return new Proxy(uqs, {
			get: (target, key, receiver) => {
				let lk = (key as string).toLowerCase();
				let ret = target[lk];
				if (ret !== undefined) return ret;
				debugger;
				console.error(`controller.uqs.${String(key)} undefined`);
				this.showReload(`新增 uq ${String(key)}`);
				return undefined;
			},
		});
	}

	getUqMans() {
		return this.uqMans;
	}

	private showReload(msg: string) {
		for (let uqMan of this.uqMans) {
			uqMan.localMap.removeAll();
		}
		this.web.showReloadPage(msg);
	}

	setTuidImportsLocal(): string[] {
		let ret: string[] = [];
		for (let uqMan of this.uqMans) {
			for (let tuid of uqMan.tuidArr) {
				if (tuid.isImport === true) {
					let error = this.setInner(tuid as TuidImport);
					if (error) ret.push(error);
				}
			}
		}
		return ret;
	}

	private setInner(tuidImport: TuidImport): string {
		let { from } = tuidImport;
		let fromName = from.owner + '/' + from.uq;
		let uq = this.collection[fromName];
		if (uq === undefined) {
			//debugger;
			if (env.buildingUq === false) {
				console.error(`setInner(tuidImport: TuidImport): uq ${fromName} is not loaded`);
			}
			return;
		}
		let iName = tuidImport.name
		let tuid = uq.tuid(iName);
		if (tuid === undefined) {
			//debugger;
			return `setInner(tuidImport: TuidImport): uq ${fromName} has no Tuid ${iName}`;
		}
		if (tuid.isImport === true) {
			//debugger;
			return `setInner(tuidImport: TuidImport): uq ${fromName} Tuid ${iName} is import`;
		}
		tuidImport.setFrom(tuid as TuidInner);
	}
}
