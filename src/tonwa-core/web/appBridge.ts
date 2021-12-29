//import {nav} from '../components';
import { UqTokenApi } from './uqApi';
import { setSubAppWindow } from './wsChannel';
//import { host } from './host';
import { env, uid } from '../tool';
import { Web } from './Web';

export interface UqToken {
    name: string;
    db: string;
    url: string;
    token: string;
}

interface UqTokenAction {
    resolve: (value?: UqToken | PromiseLike<UqToken>) => void;
    reject: (reason?: any) => void;
}

interface BridgeCenterApi {
    id: string;
    resolve: (value?: any) => any;
    reject: (reason?: any) => void;
}

export class AppBridge {
    private readonly web: Web;
    private readonly uqTokens: { [uqName: string]: UqToken } = {};

    constructor(web: Web) {
        this.web = web;
    }

    addMessageListener() {
        window.addEventListener('message', async (evt) => {
            var message = evt.data;
            if (!message) return;
            //let {nav} = this.web.tonwa;
            switch (message.type) {
                case 'sub-frame-started':
                    this.subFrameStarted(evt);
                    break;
                case 'ws':
                    //wsBridge.receive(message.msg);
                    await this.web.onWsReceive(message.msg);
                    break;
                case 'init-sub-win':
                    await this.initSubWin(message);
                    break;
                case 'pop-app':
                    window.console.log('///\\\\\\ pop-app');
                    this.web.navBack();
                    break;
                case 'center-api':
                    await this.callCenterApiFromMessage(evt.source as Window, message);
                    break;
                case 'center-api-return':
                    this.bridgeCenterApiReturn(message);
                    break;
                case 'app-api':
                    let ret = await this.onReceiveAppApiMessage(message.hash, message.apiName);
                    (evt.source as Window).postMessage({
                        type: 'app-api-return',
                        apiName: message.apiName,
                        db: ret.db,
                        url: ret.url,
                        token: ret.token
                    } as any, "*");
                    break;
                case 'app-api-return':
                    console.log("app-api-return: %s", JSON.stringify(message));
                    console.log('await onAppApiReturn(message);');
                    await this.onAppApiReturn(message);
                    break;
                default:
                    if ((message.source as string)?.startsWith('react-devtools') === true) break;
                    window.console.log('message: %s', JSON.stringify(message));
                    break;
            }
        });
    }

    logoutUqTokens() {
        for (let i in this.uqTokens) {
            this.uqTokens[i] = undefined;
        }
        UqTokenApi.clearLocal();
    }

    isBridged(): boolean {
        return window.self !== window.parent;
    }

    private subFrameStarted(evt: any) {
        var message = evt.data;
        let subWin = evt.source as Window;
        setSubAppWindow(subWin);
        this.hideFrameBack(message.hash);
        let msg: any = Object.assign({}, this.web.user);
        msg.type = 'init-sub-win';
        subWin.postMessage(msg, '*');
    }

    hideFrameBack(hash: string) {
        let el = document.getElementById(hash);
        if (el !== undefined) el.hidden = true;
    }

    async initSubWin(message: any) {
        console.log('initSubWin: set nav.user', message);
        let user = this.web.user = message; // message.user;
        this.web.setCenterToken(user.id, user.token);
        await this.web.showAppView();
    }

    private async onReceiveAppApiMessage(hash: string, apiName: string): Promise<UqToken> {
        let { unit } = env;
        if (!unit) {
            console.error('no unit defined in unit.json or in index.html, or not logined in', unit);
        }
        let parts = apiName.split('/');
        let param = { unit: unit, uqOwner: parts[0], uqName: parts[1], appOwner: parts[2], appName: parts[3] };
        console.log('uqTokenApi.uq onReceiveAppApiMessage', param);
        let ret = await this.web.uqTokenApi.uq(param);
        let { db, url, token } = ret;
        return { name: apiName, db: db, url: url, token: token };
    }

    private async onAppApiReturn(message: any) {
        let { apiName, db, url, urlTest, token } = message;
        let action = this.uqTokenActions[apiName];
        if (action === undefined) {
            throw new Error('error app api return');
            //return;
        }
        let realUrl = this.web.host.getUrlOrTest(db, url, urlTest);
        console.log('onAppApiReturn(message:any): url=' + url + ', real=' + realUrl);
        //action.url = realUrl;
        //action.token = token;
        action.resolve({
            name: apiName,
            db: db,
            url: realUrl,
            token: token,
        } as UqToken);
    }

    private readonly uqTokenActions: { [uq: string]: UqTokenAction } = {};

    async buildAppUq(uq: string, uqOwner: string, uqName: string): Promise<void> {
        if (!this.isBridged()) {
            //let unit = getUnit();
            let { unit } = env;
            let uqToken = await this.web.uqTokenApi.uq({ unit, uqOwner, uqName });
            if (uqToken.token === undefined) uqToken.token = this.web.centerToken;
            let { db, url, urlTest } = uqToken;
            let realUrl = this.web.host.getUrlOrTest(db, url, urlTest);
            console.log('realUrl: %s', realUrl);
            uqToken.url = realUrl;
            this.uqTokens[uq] = uqToken;
            return uqToken;
        }
        //console.log("**** before buildAppUq ****", appInFrame);
        let bp = this.uqTokenActions[uq];
        if (bp !== undefined) return;
        return new Promise<void>((resolve, reject) => {
            this.uqTokenActions[uq] = {
                resolve: async (at: any) => {
                    let { db, url, token } = await at;
                    this.uqTokens[uq] = {
                        name: uq,
                        db: db,
                        url: url,
                        token: token,
                    };
                    this.uqTokenActions[uq] = undefined;
                    //console.log("**** after buildAppUq ****", appInFrame);
                    resolve();
                },
                reject: reject,
            };
            (window.opener || window.parent).postMessage({
                type: 'app-api',
                apiName: uq,
                //hash: appInFrame.hash,
            }, "*");
        });
    }

    getUqToken(uq: string): UqToken {
        let uts = this.uqTokens;
        return uts[uq];
    }

    private readonly brideCenterApis: { [id: string]: BridgeCenterApi } = {};
    async bridgeCenterApi(url: string, method: string, body: any): Promise<any> {
        console.log('bridgeCenterApi: url=%s, method=%s', url, method);
        return new Promise<any>(async (resolve, reject) => {
            let callId: string;
            for (; ;) {
                callId = uid();
                let bca = this.brideCenterApis[callId];
                if (bca === undefined) {
                    this.brideCenterApis[callId] = {
                        id: callId,
                        resolve: resolve,
                        reject: reject,
                    }
                    break;
                }
            }
            (window.opener || window.parent).postMessage({
                type: 'center-api',
                callId: callId,
                url: url,
                method: method,
                body: body
            }, '*');
        });
    }

    async callCenterApiFromMessage(from: Window, message: any): Promise<void> {
        let { callId, url, method, body } = message;
        let result = await this.web.callCenterapi.directCall(url, method, body);
        from.postMessage({
            type: 'center-api-return',
            callId: callId,
            result: result,
        }, '*');
    }

    bridgeCenterApiReturn(message: any) {
        let { callId, result } = message;
        let bca = this.brideCenterApis[callId];
        if (bca === undefined) return;
        this.brideCenterApis[callId] = undefined;
        bca.resolve(result);
    }
}
