import { env, resOptions, PageHeaderProps, PageWebNav, Tonwa, Nav } from 'tonwa-core';
import { t } from '../ui';
import { Page } from '../components';
//import { nav } from '../nav';
import { VPage } from './VPage';
import { View } from './View';
import { AnnotationsMap, makeObservable, observable, runInAction } from 'mobx';
// import { messageHub } from 'tonwa-core';

export interface ConfirmOptions {
    caption?: string;
    message: string | JSX.Element;
    classNames?: string;
    ok?: string;
    yes?: string;
    no?: string;
}

export interface WebNav<C extends Controller> {
    VNavHeader?: new (controller: C) => View<C>;
    VNavRawHeader?: new (controller: C) => View<C>;
    VNavFooter?: new (controller: C) => View<C>;
    VNavRawFooter?: new (controller: C) => View<C>;
    renderPageHeader?: (props: PageHeaderProps<JSX.Element>) => JSX.Element;
}

export abstract class Controller {
    protected readonly tonwa: Tonwa;
    protected nav: Nav;
    protected res: any = {};
    t = (str: string): string | JSX.Element => this.internalT(str) || str;
    icon: string | JSX.Element;
    label: string | JSX.Element;
    readonly isDev: boolean = env.isDevelopment;
    pageWebNav: PageWebNav<JSX.Element>;

    constructor(tonwa: Tonwa) {
        this.tonwa = tonwa;
        this.nav = tonwa.nav;
    }

    shallow<T extends object>(data: T) {
        let ret = makeObservable(data, this.buildReactiveProps(data, observable.shallow));
        return ret;
    }

    deep<T extends object>(data: T) {
        let ret = makeObservable(data, this.buildReactiveProps(data, observable));
        return ret;
    }

    private buildReactiveProps<T extends object>(data: T, ob: any): AnnotationsMap<T, never> {
        let ret: AnnotationsMap<T, never> = {};
        for (let i in data) {
            let v = data[i];
            switch (typeof v) {
                default:
                    ob = observable;
                    break;
                case 'object':
                case 'function':
                    break;
            }
            (ret as any)[i] = ob;
        }
        return ret;
    }

    runInAction<T>(fn: () => T): T {
        return runInAction(fn);
    }

    getTonwa() { return this.tonwa; }

    protected beforeInit() { }
    protected afterInit() { }

    internalInit(...param: any[]) {
        this.beforeInit();
        this.init(...param);
        this.pageWebNav = this.getPageWebNav();
        this.afterInit();
    }

    init(...param: any[]) {
    }

    internalT(str: string): any {
        return this.res?.[str] ?? t(str);
    }

    getPageWebNav(): PageWebNav { return undefined; }

    setRes(res: any) {
        if (res === undefined) return;
        let { $lang, $district } = resOptions;
        Object.assign(this.res, res);
        if ($lang !== undefined) {
            let l = res[$lang];
            if (l !== undefined) {
                Object.assign(this.res, l);
                let d = l[$district];
                if (d !== undefined) {
                    Object.assign(this.res, d);
                }
            }
        }
    }
    getRes(): any { return this.res; }

    protected async openVPage<C extends Controller, P extends VPage<C>>(vp: new (controller: C) => P, param?: any, afterBack?: (ret: any) => void): Promise<P> {
        let ret = new vp((this as any) as C);
        await ret.open(param, afterBack);
        return ret;
    }

    protected async replaceVPage<C extends Controller, P extends VPage<C>>(vp: new (controller: C) => P, param?: any, afterBack?: (ret: any) => void): Promise<P> {
        let ret = new vp((this as any) as C);
        await ret.replaceOpen(param, afterBack);
        return ret;
    }

    protected renderView<C extends Controller, V extends View<C>>(view: new (controller: C) => V, param?: any): JSX.Element {
        let v = new view((this as any) as C);
        return v.render(param);
    }

    async event(type: string, value: any) {
        await this.onEvent(type, value);
    }

    protected async onEvent(type: string, value: any) {
    }

    protected msg(text: string) {
        alert(text);
    }
    protected errorPage(header: string, err: any) {
        this.openPage(<Page header="App error!">
            <pre>
                {typeof err === 'string' ? err : err.message}
            </pre>
        </Page>);
    }

    openPage(page: JSX.Element, onClosePage?: (ret: any) => void) {
        let disposer: () => void;
        if (onClosePage !== undefined) {
            disposer = () => {
                //if (this.disposer) this.disposer();
                onClosePage(undefined);
            }
        }

        this.nav.push(page, disposer);
        //this.disposer = undefined;
    }

    replacePage(page: JSX.Element, onClosePage?: () => void) {
        this.nav.replace(page, onClosePage);
        //this.disposer = undefined;
    }

    backPage() {
        this.nav.back(false);
    }

    closePage(level?: number) {
        this.nav.pop(level);
    }

    ceasePage(level?: number) {
        this.nav.ceaseTop(level);
    }

    go(showPage: () => void, url: string, absolute?: boolean) {
        this.go(showPage, url, absolute);
    }

    removeCeased() {
        this.nav.removeCeased();
    }

    regConfirmClose(confirmClose: () => Promise<boolean>) {
        this.nav.regConfirmClose(confirmClose);
    }

    private topPageKey: any;
    protected startAction() {
        this.topPageKey = this.nav.topKey();
    }
    get TopKey() {
        return this.topPageKey;
    }
    SetTopKey(key: any) {
        this.topPageKey = key;
    }
    public popToTopPage() {
        this.nav.popTo(this.topPageKey);
    }

    async confirm(options: ConfirmOptions): Promise<'ok' | 'yes' | 'no' | undefined> {
        return new Promise<'ok' | 'yes' | 'no' | undefined>(async (resolve, reject) => {
            let { caption, message, ok, yes, no, classNames } = options;
            let close = (res: 'ok' | 'yes' | 'no' | undefined) => {
                this.closePage();
                resolve(res);
            }
            let buttons: any[] = [];
            if (ok !== undefined) {
                buttons.push(<button key="ok" className="btn btn-primary me-3" onClick={() => close('ok')}>{ok}</button>);
            }
            if (yes !== undefined) {
                buttons.push(<button key="yes" className="btn btn-success me-3" onClick={() => close('yes')}>{yes}</button>);
            }
            if (no !== undefined) {
                buttons.push(<button key="no" className="btn btn-outline-danger me-3" onClick={() => close('no')}>{no}</button>);
            }
            this.openPage(<Page header={caption || '请确认'} back="close">
                <div className={classNames || "rounded bg-white m-5 p-3 border"}>
                    <div className="d-flex align-items-center justify-content-center">
                        {message}
                    </div>
                    <div className="mt-3 d-flex align-items-center justify-content-center">
                        {buttons}
                    </div>
                </div>
            </Page>);
            this.nav.regConfirmClose(async (): Promise<boolean> => {
                resolve(undefined);
                return true;
            });
        });
    }
}
