import {HttpChannel, UqHttpChannel} from './httpChannel';
import {HttpChannelNavUI} from './httpChannelUI';
//import {getUqToken, logoutUqTokens, buildAppUq} from './appBridge';
import {ApiBase} from './apiBase';
//import { host } from './host';
import { LocalMap, env, decodeUserToken } from '../tool';
import { Web, PromiseValue } from './Web';

interface UqLocal {
    user: number;
    unit: number;
    value: any;
    tick?: number;
    isNet?: boolean;
}

export class UqApi extends ApiBase {
    uqOwner: string;
    uqName: string;
    uq: string;

    constructor(web:Web, basePath:string, uqOwner:string, uqName:string, showWaiting?: boolean) {
        super(web, basePath, showWaiting);
        if (uqName) {
            this.uqOwner = uqOwner;
            this.uqName = uqName;
            this.uq = uqOwner + '/' + uqName;
        }
        this.showWaiting = showWaiting;
    }

    async init() {
        await this.web.appBridge.buildAppUq(this.uq, this.uqOwner, this.uqName);
    }

    protected async getHttpChannel(): Promise<HttpChannel> {
        let channels: {[name:string]: HttpChannel|(PromiseValue<any>[])};
        let channelUI: HttpChannelNavUI;
        if (this.showWaiting === true || this.showWaiting === undefined) {
            channels = this.web.channelUIs;
            channelUI = new HttpChannelNavUI(this.web);
        }
        else {
            channels = this.web.channelNoUIs;
        }
        let channel = channels[this.uq];
		if (channel !== undefined) {
			if (Array.isArray(channel) === false) return channel as HttpChannel;
		}
		else {
			channel = channels[this.uq] = [];
		}
		let arr = channel as PromiseValue<any>[];
		return new Promise(async (resolve, reject) => {
			arr.push({resolve, reject});
			if (arr.length !== 1) return;
			let uqToken = this.web.appBridge.getUqToken(this.uq); //, this.uqOwner, this.uqName);
			if (!uqToken) {
				//debugger;
				await this.init();
				uqToken = this.web.appBridge.getUqToken(this.uq);
			}
			let {url, token} = uqToken;
			this.token = token;
			channel = new UqHttpChannel(this.web, url, token, channelUI);
			channels[this.uq] = channel;
			for (let pv of arr) {
				pv.resolve(channel);
			}

		});
    }

    /*async update():Promise<string> {
        return await this.get('update');
    }*/

    /*
    async __loadAccess():Promise<any> {
        let acc = this.access === undefined?
            '' :
            this.access.join('|');
        let ret = await this.get('access', {acc:acc});
        return ret;
    }
    */
    async loadEntities():Promise<any> {
        //return await localUqs.loadAccess(this);
        //let acc = this.access === undefined?
        //    '' :
        //    this.access.join('|');
		//let ret = await this.get('access', {acc:acc});
		let ret = await this.get('entities');
        return ret;
	}
    async getAdmins():Promise<{id:number;role:number}[]> {
		let ret = await this.get('get-admins',);
		return ret;
    }
 	async getRoles():Promise<string[]> {
		let ret = await this.get('get-roles',);
		if (!ret) return null;
		let parts:string[] = (ret as string).split('|');
		let s:string[] = [];
		for (let p of parts) {
			p = p.trim();
			if (!p) continue;
			s.push(p);
		}
		if (s.length === 0) return null;
		return s;
	}
	async getAllRoleUsers():Promise<{user:number, admin:number, roles:string}[]> {
		let ret = await this.get('get-all-role-users');
		return ret;
	}
	async setUserRoles(theUser:number, roles:string):Promise<void> {
		await this.post('set-user-roles', {theUser, roles});
	}
	async deleteUserRoles(theUser:number):Promise<void> {
		await this.get('delete-user-roles', {theUser});
	}

	async allSchemas(): Promise<any> {
		return await this.get('all-schemas');
	}

    async schema(name:string):Promise<any> {
        return await this.get('schema/' + name);
    }

    async queueModify(start:number, page:number, entities:string) {
        return await this.post('queue-modify', {start:start, page:page, entities:entities});
    }
}

/*
let channels:{[unitId:number]: HttpChannel} = {};

export function logoutUnitxApis() {
    channels = {};
}
*/

export class UnitxApi extends UqApi {
    private unitId:number;
    constructor(web:Web, unitId:number) {
        super(web, 'tv/', undefined, undefined, true);
        this.unitId = unitId;
    }

    protected async getHttpChannel(): Promise<HttpChannel> {
        let channel = this.web.channels[this.unitId];
        if (channel !== undefined) return channel;
        return this.web.channels[this.unitId] = await this.buildChannel();
    }

    private async buildChannel():Promise<HttpChannel> {        
        let channelUI = new HttpChannelNavUI(this.web);
        let centerAppApi = new CenterAppApi(this.web, 'tv/', undefined);
        let ret = await centerAppApi.unitxUq(this.unitId);
        let {token, db, url, urlTest} = ret;
        let realUrl = this.web.host.getUrlOrTest(db, url, urlTest);
        this.token = token;
        return new UqHttpChannel(this.web, realUrl, token, channelUI);
    }
}
export abstract class CenterApiBase extends ApiBase {
    protected async getHttpChannel(): Promise<HttpChannel> {
        let ret: HttpChannel;
        if (this.showWaiting === true || this.showWaiting === undefined) {
            ret = this.web.getCenterChannelUI();
        }
        else {
            ret = this.web.getCenterChannel();
        }
        return ret;
    }
}

const uqTokensName = 'uqTokens';
export class UqTokenApi extends CenterApiBase {
	static clearLocal() {
		env.localDb.removeItem(uqTokensName);
	}
    private localMap: LocalMap = env.localDb.map(uqTokensName);

    async uq(params: {unit:number, uqOwner:string, uqName:string}):Promise<any> {
        let {uqOwner, uqName} = params;
        let un = uqOwner+'/'+uqName;
        let localCache = this.localMap.child(un);
        try {
            let uqToken:UqLocal = localCache.get();
            if (uqToken !== undefined) {
                let {unit, user} = uqToken;
                if (unit !== params.unit || user !== this.web.loginedUserId) {
                    localCache.remove();
                    uqToken = undefined;
                }
            }
            let nowTick = Math.floor(Date.now() / 1000);
            if (uqToken !== undefined) {
                let {tick, value} = uqToken;
                if (value !== undefined && (nowTick - tick) < 24*3600) {
                    return Object.assign({}, value);
                }
            }
            let uqParams:any = Object.assign({}, params);
            uqParams.testing = this.web.host.testing;
            let ret = await this.get('uq-token', uqParams);
            if (ret === undefined) {
                let {unit, uqOwner, uqName} = params;
                let err = `center get app-uq(unit=${unit}, '${uqOwner}/${uqName}') - not exists or no unit-service`;
                throw err;
            }

            uqToken = {
                unit: params.unit,
                user: this.web.loginedUserId,
                tick: nowTick,
                value: ret,
            }
            localCache.set(uqToken);
            return Object.assign({}, ret);
        }
        catch (err) {
            localCache.remove();
            throw err;
        }
    }
}

export class CallCenterApi extends CenterApiBase {
    directCall(url:string, method:string, body:any):Promise<any> {
        return this.call(url, method, body);
    }
}

export interface UqAppData {
    appName: string;
    appOwner: string;
    id: number;
    version: string;        // AppUI version
    uqs: UqData[];
}

export interface UqData {
    id: number;
    uqOwner: string;
	ownerAlias: string;
    uqName: string;
	uqAlias: string;
    access: string;
    newVersion: boolean;
}

export interface UqServiceData {
    id: number;
    db: string;
    url: string;
    urlTest: string;
    token: string;
}

//const appUqsName = 'appUqs';

export class CenterAppApi extends CenterApiBase {
    async appUqs(appOwner:string, appName:string):Promise<UqAppData> {
        let ret:UqAppData = await this.get('tie/app-uqs', {appOwner, appName});
        return ret;
    }
    async uqs(uqs: {owner:string; name:string; version:string}[]):Promise<UqData[]> {
        return await this.post('tie/pure-uqs', uqs);
    }
    async unitxUq(unit:number):Promise<UqServiceData> {
        return await this.get('tie/unitx-uq', {unit:unit});
    }
    async changePassword(param: {orgPassword:string, newPassword:string}) {
        return await this.post('tie/change-password', param);
    }

    async userQuit(): Promise<void> {
        await this.get('tie/user-ask-quit', {});
    }
}

export interface RegisterParameter {
    nick:string, 
    user:string, 
    pwd:string,
    country:number, 
    mobile:number, 
    mobileCountry:number,
    email:string,
    verify:string,
};

export class UserApi extends CenterApiBase {
    async login(params: {user: string, pwd: string, guest: number}): Promise<any> {
        //(params as any).device = nav.local.device.get();
        let ret = await this.post('user/login', params);
        switch (typeof ret) {
            default: return;
            case 'string': return decodeUserToken(ret);
            case 'object':
                let token = ret.token;
                let user = decodeUserToken(token);
                let {nick, icon} = ret;
                if (nick) user.nick = nick;
                if (icon) user.icon = icon;
                return user;
        }
        // !== undefined) return decodeToken(token);
    }
    async register(params: RegisterParameter): Promise<any>
    {
        return await this.post('user/register', params);
    }

    async sendVerify(account:string, type:'mobile'|'email', oem:string) {
        return await this.post('user/set-verify', {account:account, type:type, oem:oem});
    }

    async checkVerify(account:string, verify:string) {
        return await this.post('user/check-verify', {account:account, verify:verify});
    }

    async isExists(account:string) {
        return await this.get('user/is-exists', {account:account});
    }

    async resetPassword(account:string, password:string, verify:string, type:'mobile'|'email'):Promise<any[]> {
        return await this.post('user/reset-password', {account:account, password, verify, type});
    }
    
    async userSetProp(prop:string, value:any) {
        await this.post('tie/user-set-prop', {prop:prop, value:value});
    }

    async me():Promise<any> {
        return await this.get('tie/me');
    }

    async user(id:number): Promise<any> {
        return await this.get('tie/user', {id:id});
	}
	
	async fromKey(key:string): Promise<{id:number, name:string, nick:string, icon:string}> {
		return await this.get('tie/user-from-key', {key});
	}
}
