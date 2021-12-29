/* eslint-disable */
//import { Tonwa } from "../Tonwa";
import { AppBridge } from "./appBridge";
import { CenterApi } from "./centerApi";
import { UqData, CallCenterApi, CenterAppApi, UnitxApi, UqAppData, UqTokenApi, UserApi } from "./uqApi";
import { HttpChannel, CenterHttpChannel, UqHttpChannel } from './httpChannel';
import { GuestApi } from "./guestApi";
import { MessageHub } from "./messageHub";
import { HttpChannelNavUI } from "./httpChannelUI";
import { WsBridge, WSChannel } from "./wsChannel";
import { FetchError } from "./fetchError";
import { Host, resUrlFromHost } from './host';
//import { UQsMan, UQsManApp, TVs } from "../uq";
//import { AppConfig, UqConfig } from "../app";

export interface PromiseValue<T> {
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
}

export abstract class Web {
    // ----- 从nav搬移过来的内容



    // ===== nav搬移内容结束

    // abstract navInit(): Promise<void>

    reload() {
        throw new Error('Method not implemented.');
    }
    showReloadPage(msg: string) {
        throw new Error('Method not implemented.');
    }
    // 这个应该会去掉
    navBack() {
        throw new Error('Method not implemented.');
    }
    // 这个是收到websocket消息的处理
    async onWsReceive(msg: any) {
        throw new Error('Method not implemented.');
    }
    async showAppView() {
        throw new Error('Method not implemented.');
    }
    logout() {
        throw new Error('Method not implemented.');
    }
    async onError(error: FetchError) {
        throw error;
    }
    endWait() {
        //throw new Error('Method not implemented.');
    }
    startWait() {
        //throw new Error('Method not implemented.');
    }
    centerHost: string;
    centerToken: string | undefined = undefined;
    loginedUserId: number = 0;
    centerChannelUI: HttpChannel;
    centerChannel: HttpChannel;

    channelUIs: { [name: string]: HttpChannel | (PromiseValue<any>[]) } = {};
    channelNoUIs: { [name: string]: HttpChannel | (PromiseValue<any>[]) } = {};
    channels: { [unitId: number]: HttpChannel } = {};

    //    readonly tonwa: Tonwa;
    readonly centerApi: CenterApi;
    readonly appBridge: AppBridge;
    readonly userApi: UserApi;
    readonly uqTokenApi: UqTokenApi;
    readonly callCenterapi: CallCenterApi;
    readonly unitxApi: UnitxApi;
    readonly guestApi: GuestApi;
    readonly messageHub: MessageHub;
    readonly wsBridge: WsBridge;
    readonly host: Host;

    language: string;
    culture: string;

    // 下面的变量应该以后会去掉
    isBuildingUQ: boolean;
    _uqs: any;
    user: any;
    // -- end -------------------


    constructor() {
        this.centerApi = new CenterApi(this, '/tv', undefined);
        this.appBridge = new AppBridge(this);
        this.userApi = new UserApi(this, 'tv/', undefined);
        this.uqTokenApi = new UqTokenApi(this, 'tv/tie/', undefined);
        this.callCenterapi = new CallCenterApi(this, '', undefined);
        let unitId: number = 0;
        this.unitxApi = new UnitxApi(this, unitId);
        this.guestApi = new GuestApi(this, 'tv/guest/', undefined);
        this.messageHub = new MessageHub(this);
        this.wsBridge = new WsBridge(this);
        this.host = new Host();
    }

    logoutApis() {
        this.channelUIs = {};
        this.channelNoUIs = {};
        this.channels = {};
        this.appBridge.logoutUqTokens();
    }

    setCenterUrl(url: string) {
        console.log('setCenterUrl %s', url);
        this.centerHost = url;
        this.centerChannel = undefined;
        this.centerChannelUI = undefined;
    }

    setCenterToken(userId: number, t?: string) {
        this.loginedUserId = userId;
        this.centerToken = t;
        this.centerChannel = undefined;
        this.centerChannelUI = undefined;
    }

    getCenterChannelUI(): HttpChannel {
        if (this.centerChannelUI !== undefined) return this.centerChannelUI;
        return this.centerChannelUI = new CenterHttpChannel(this, this.centerHost, this.centerToken, new HttpChannelNavUI(this));
    }

    getCenterChannel(): HttpChannel {
        if (this.centerChannel !== undefined) return this.centerChannel;
        return this.centerChannel = new CenterHttpChannel(this, this.centerHost, this.centerToken);
    }

    setNetToken(userId: number, token: string) {
        this.setCenterToken(userId, token);
        WSChannel.setCenterToken(token);
    }

    clearNetToken() {
        this.setCenterToken(0, undefined);
        WSChannel.setCenterToken(undefined);
    }

    resUrlFromHost(host: string): string {
        return resUrlFromHost(host);
    }
}
