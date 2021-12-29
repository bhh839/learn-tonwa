import { Tonwa, User, Web } from "tonwa-core";
import { VPage } from "./VPage";
import { Controller, WebNav } from "./Controller";

export abstract class ControllerWithWeb extends Controller {
    readonly web: Web;
    constructor(tonwa: Tonwa) {
        super(tonwa);
        this.web = tonwa.web;
    }

    private receiveHandlerId: number;
    //private disposer:()=>void;

    protected dispose = () => {
        // message listener的清理
        //nav.unregisterReceiveHandler(this.receiveHandlerId);
        this.web.messageHub.unregisterReceiveHandler(this.receiveHandlerId);
        this.onDispose();
    }

    protected onDispose() {
    }

    protected async internalStart(param?: any, ...params: any[]): Promise<void> {
        return;
    }

    get user(): User { return this.tonwa.user }
    get isLogined(): boolean {
        let { user } = this.tonwa;
        if (!user) return false;
        return user.id > 0;
    }

    get webNav(): WebNav<any> { return undefined; }

    getWebNav(): WebNav<any> { return this.webNav; }

    get isWebNav(): boolean { return this.nav.isWebNav }
    navigate(url: string) {
        this.navigate(url);
    }

    isMe(id: any): boolean {
        if (id === null) return false;
        let { user } = this;
        let userId = user.id;
        switch (typeof id) {
            default: return false;
            case 'string': return Number(id) === userId;
            case 'number': return id === userId;
            case 'object': return id.id === userId;
        }
    }

    protected onMessage(message: any): Promise<void> {
        return;
    }

    private onMessageReceive = async (message: any): Promise<void> => {
        await this.onMessage(message);
    }

    protected async beforeStart(): Promise<boolean> {
        return true;
    }
    protected async afterStart(): Promise<void> {
    }
    protected registerReceiveHandler() {
        this.receiveHandlerId = this.web.messageHub.registerReceiveHandler(this.onMessageReceive);
    }

    async start(param?: any, ...params: any[]): Promise<void> {
        this.registerReceiveHandler();
        let ret = await this.beforeStart();
        if (ret === false) return;
        await this.internalStart(param, ...params);
        await this.afterStart();
    }

    get isCalling(): boolean { return this._resolve_$ !== undefined }

    private _resolve_$: ((value: any) => void)[];
    async call<T>(param?: any, ...params: any[]): Promise<T> {
        if (this._resolve_$ === undefined) this._resolve_$ = [];
        return new Promise<T>(async (resolve, reject) => {
            this._resolve_$.push(resolve);
            await this.start(param, ...params);
        });
    }

    async vCall<C extends Controller>(vp: new (controller: C) => VPage<C>, param?: any): Promise<any> {
        if (this._resolve_$ === undefined) this._resolve_$ = [];
        return new Promise<any>(async (resolve, reject) => {
            this._resolve_$.push(resolve);
            await (new vp(this as any)).open(param);
        });
    }

    returnCall(value: any) {
        if (this._resolve_$ === undefined) return;
        let resolve = this._resolve_$.pop();
        if (resolve === undefined) {
            alert('the Controller call already returned, or not called');
            return;
        }
        resolve(value);
    }

}
