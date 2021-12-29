import { observer } from "mobx-react";
import React from "react";
import {
	UqMan, Uq as UqCore, Web
} from "tonwa-core";

export class Uq {
	private web: Web;
	private $_uqMan: UqMan;
	private $_uqSql: UqCore;
	constructor(web: Web, uqMan: UqMan) {
		this.web = web;
		this.$_uqMan = uqMan;
		this.$_uqSql = this.$_createUqSqlProxy();
	}

	$_createProxy() {
		let ret = new Proxy(this.$_uqMan.entities, {
			get: (target, key, receiver) => {
				if (key === '$') {
					return this;
				}
				if (key === 'SQL') {
					return this.$_uqSql;
				}
				let lk = (key as string).toLowerCase();
				let ret = target[lk];
				if (ret !== undefined) return ret;
				let func = (this.$_uqMan as any)[key];
				if (func !== undefined) return func;
				func = (this as any)[key];
				if (func !== undefined) return func;
				let err = `entity ${this.$_uqMan.name}.${String(key)} not defined`;
				console.error('UQ错误：' + err);
				this.showReload('服务器正在更新');
				return undefined;
			}
		});
		return ret;
	}

	private $_createUqSqlProxy(): UqCore {
		let ret = new Proxy(this.$_uqMan, {
			get: (target, key, receiver) => {
				let ret = (target as any)['$' + (key as string)];
				if (ret !== undefined) return ret;
				let err = `entity ${this.$_uqMan.name}.${String(key)} not defined`;
				console.error('UQ错误：' + err);
				this.$_uqMan.showReload('服务器正在更新');
				return undefined;
			}
		});
		return ret as unknown as UqCore;
	}

	private showReload(msg: string) {
		//console.error('uq proxy error name', msg);
		let cache = this.$_uqMan.localMap.child('$reload-tick');
		let reloadTick = cache.get();
		if (!reloadTick) reloadTick = 0;
		console.error(msg);
		this.$_uqMan.localMap.removeAll();
		let tick = Date.now();
		cache.set(tick);
		if (tick - reloadTick < 10 * 1000) {
			this.web.showReloadPage(msg);
		}
		else {
			this.web.reload();
		}
	}

	/*
	IDTv(ids: number[]): Promise<any[]> {
		return this.$_uqMan.IDTv(ids);
	}
	*/

	protected IDRender = (id: number, render?: (value: any) => JSX.Element): JSX.Element => {
		if (id === undefined || id === null) return null;
		return React.createElement(observer(() => {
			let ret = this.$_uqMan.idCache.getValue(id);
			if (ret === undefined) {
				return React.createElement('span', { props: { className: 'text-muted' }, children: ['id=' + id] });
			}
			let { $type } = ret as any;
			if (!$type) return this.renderIDUnknownType(id);
			let IDType = this.$_uqMan.ids[$type];
			if (!IDType) return this.renderIDUnknownType(id);
			return (render ?? (IDType as any).render)(ret);
		}));
	}

	protected IDV = <T extends object>(id: number): T => {
		let ret = this.$_uqMan.idCache.getValue(id);
		return ret as T;
	}

	private renderIDUnknownType(id: number) {
		return React.createElement('span', { props: { className: 'text-muted' }, children: [`id=${id} type undefined`] });
	}
	/*
	IDLocalTv(ids: number[]): Promise<any[]> {
		return this.IDTv(ids.map(v => -v));
	}
	*/
	protected IDLocalV = <T extends object>(id: number): T => {
		return this.IDV(-id);
	}

	protected IDLocalRender = (id: number, render?: (value: any) => JSX.Element): JSX.Element => {
		if (id === undefined || id === null) return null;
		return this.IDRender(-id, render);
	}
}
