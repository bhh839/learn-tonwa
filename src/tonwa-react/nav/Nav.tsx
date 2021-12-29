import { makeObservable, observable } from 'mobx';
import { Navigo, RouteFunc, Hooks, NamedRoute, Web, resOptions, Tonwa, Login } from 'tonwa-core';
import { Page } from '../components';

import 'font-awesome/css/font-awesome.min.css';
import '../css/va-form.css';
import '../css/va.css';
import '../css/animation.css';
import { ReloadPage, ConfirmReloadPage } from '../components/reloadPage';
//import { PageWebNav } from '../components/page';
import { createLogin, showForget, showRegister } from '../components/login';
//import { env, FetchError, LocalData, User } from 'tonwa-core';
import { SystemNotifyPage } from './FetchErrorView';

import { User, Guest } from 'tonwa-core';
//import { netToken } from 'tonwa-core';
import { FetchError } from 'tonwa-core';
import { LocalData, env } from 'tonwa-core';
//import {guestApi, logoutApis, setCenterUrl, setCenterToken, host, resUrlFromHost, messageHub} from 'tonwa-core';
//import { userApi } from 'tonwa-core';
import { NavView } from './NavView';

export type NavPage = (params: any) => Promise<void>;

export interface NavSettings {
    oem?: string;
    loginTop?: JSX.Element;
    privacy?: string;
    htmlTitle?: string;
}

let logMark: number;
const logs: string[] = [];
export class Nav {
    private readonly tonwa: Tonwa;
    private readonly web: Web;
    private navView: NavView;
    private wsHost: string;
    private local: LocalData = new LocalData();
    private navigo: Navigo;
    navSettings: NavSettings;
    user: User = null;
    testing: boolean;
    language: string;
    culture: string;
    resUrl: string;

    constructor(tonwa: Tonwa) {
        makeObservable(this, {
            user: observable,
        });
        this.web = tonwa.web;
        let { lang, district } = resOptions;
        this.language = lang;
        this.culture = district;
        this.testing = false;
    }

    renderNavView(onLogined: (isUserLogin?: boolean) => Promise<void>,
        notLogined?: () => Promise<void>,
        userPassword?: () => Promise<{ user: string; password: string }>,
    ) {
        return <NavView ref={nv => this.navView = nv}
            onLogined={onLogined}
            notLogined={notLogined}
            userPassword={userPassword} />;
    }

    get guest(): number {
        let guest = this.local.guest;
        if (guest === undefined) return 0;
        let g = guest.get();
        if (g === undefined) return 0;
        return g.guest;
    }

    set(navView: NavView) {
        //this.logo = logo;
        this.navView = navView;
    }
    /*
    registerReceiveHandler(handler: (message:any)=>Promise<void>):number {
        //if (this.ws === undefined) return;
        return messageHub.onReceiveAny(handler);
    }

    unregisterReceiveHandler(handlerId:number) {
        //if (this.ws === undefined) return;
        if (handlerId === undefined) return;
        messageHub.endReceive(handlerId);
    }
    */
    async onReceive(msg: any) {
        //if (this.ws === undefined) return;
        await this.web.messageHub.dispatch(msg);
    }

    private async loadUnitJson() {
        try {
            let unitJsonPath = this.unitJsonPath();
            let unitRes = await fetch(unitJsonPath, {});
            let res = await unitRes.json();
            return res.unit;
        }
        catch (err1) {
            this.local.unit.remove();
            return;
        }
    }

    private async getPredefinedUnitName() {
        let el = document.getElementById('unit');
        if (el) {
            return el.innerText;
        }
        el = document.getElementById('unit.json');
        if (!el) {
            return await this.loadUnitJson();
        }
        try {
            let json = el.innerHTML;
            let res = JSON.parse(json);
            return res.unit;
        }
        catch (err) {
            return await this.loadUnitJson();
        }
    }

    private async loadPredefinedUnit() {
        let envUnit = process.env.REACT_APP_UNIT;
        if (envUnit !== undefined) {
            return Number(envUnit);
        }
        let unitName: string;
        let unit = this.local.unit.get();
        if (unit !== undefined) {
            if (env.isDevelopment !== true) return unit.id;
            unitName = await this.getPredefinedUnitName();
            if (unitName === undefined) return;
            if (unit.name === unitName) return unit.id;
        }
        else {
            unitName = await this.getPredefinedUnitName();
            if (unitName === undefined) return;
        }
        let unitId = await this.web.guestApi.unitFromName(unitName);
        if (unitId !== undefined) {
            this.local.unit.set({ id: unitId, name: unitName });
        }
        return unitId;
    }

    setSettings(settings?: NavSettings) {
        this.navSettings = settings;
        let { htmlTitle } = settings;
        if (htmlTitle) {
            document.title = htmlTitle;
        }
        let html = document.getElementsByTagName('html');
        let html0 = html[0];
        if (html0) {
            let version = html0?.getAttribute('data-version');
            if (version) {
                //appConfig.version = version;
            }
        }
    }

    get oem(): string {
        return this.navSettings && this.navSettings.oem;
    }

    hashParam: string;
    private centerHost: string;
    private arrs = ['/test', '/test/'];
    private unitJsonPath(): string {
        let { origin, pathname } = document.location;
        pathname = pathname.toLowerCase();
        for (let item of this.arrs) {
            if (pathname.endsWith(item) === true) {
                pathname = pathname.substr(0, pathname.length - item.length);
                break;
            }
        }
        if (pathname.endsWith('/') === true || pathname.endsWith('\\') === true) {
            pathname = pathname.substr(0, pathname.length - 1);
        }
        return origin + pathname + '/unit.json';
    }
    private windowOnError = (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => {
        debugger;
        console.error('windowOnError');
        console.error(error);
    }
    private windowOnUnhandledRejection = (ev: PromiseRejectionEvent) => {
        debugger;
        console.error('windowOnUnhandledRejection');
        console.error(ev.reason);
    }
    private windowOnClick = (ev: MouseEvent) => {
        console.error('windowOnClick');
    }
    private windowOnMouseMove = (ev: MouseEvent) => {
        console.log('navigator.userAgent: ' + navigator.userAgent);
        console.log('mouse move (%s, %s)', ev.x, ev.y);
    }
    private windowOnScroll = (ev: Event) => {
        console.log('scroll event');
    }

    forceDevelopment: boolean;

    async init() {
        this.testing = env.testing;
        if (this.forceDevelopment === true) {
            env.isDevelopment = true;
        }
        await this.web.host.start(this.testing);
        /*
        let hash = document.location.hash;
        if (hash !== undefined && hash.length > 0) {
            let pos = getExHashPos();
            if (pos < 0) pos = undefined;
            this.hashParam = hash.substring(1, pos);
        }
        */
        let { url, ws, resHost } = this.web.host;
        this.centerHost = url;
        this.resUrl = this.web.resUrlFromHost(resHost);
        this.wsHost = ws;
        this.web.setCenterUrl(url);

        let guest: Guest = this.local.guest.get();
        if (guest === undefined) {
            guest = await this.web.guestApi.guest();
        }
        if (!guest) {
            debugger;
            throw Error('guest can not be undefined');
        }
        this.setGuest(guest);
    }

    reloadUser = () => {
        let user: User = this.local.user.get();
        let curUser = this.user;
        if (!user && !curUser) return;
        if (user?.id === curUser?.id) return;
        if (!user) {
            this.logout();
        }
        else {
            this.logined(user);
        }
    }

    //private appStarted:boolean = false;
    async appStart() {
        //if (this.appStarted === true) return;
        //this.appStarted = true;
        await this.init();
        await this.start();
    }

    async start() {
        try {
            window.onerror = this.windowOnError;
            window.onunhandledrejection = this.windowOnUnhandledRejection;
            window.onfocus = this.reloadUser;
            if (env.isMobile === true) {
                document.onselectstart = function () { return false; }
                document.oncontextmenu = function () { return false; }
            }
            this.clear();
            this.startWait();

            let user: User = this.local.user.get();
            if (user === undefined) {
                let { userPassword } = this.navView.props;
                if (userPassword) {
                    let ret = await userPassword();
                    if (ret) {
                        let { user: userName, password } = ret;
                        let logindUser = await this.web.userApi.login({
                            user: userName,
                            pwd: password,
                            guest: this.guest,
                        });
                        user = logindUser;
                    }
                }
                if (user === undefined) {
                    let { notLogined } = this.navView.props;
                    if (notLogined !== undefined) {
                        await notLogined();
                    }
                    else {
                        await this.showLogin(undefined);
                        //nav.navigateToLogin();
                    }
                    return;
                }
            }

            await this.logined(user);
        }
        catch (err) {
            console.error(err);
            debugger;
        }
        finally {
            this.endWait();
        }
    }

    resolveRoute() {
        //if (this.isRouting === false) return;
        if (this.navigo === undefined) return;
        this.navigo.resolve();
    }

    on(routeFunc: RouteFunc, hooks?: Hooks): Navigo;
    on(url: string, routeFunc: RouteFunc, hooks?: Hooks): Navigo;
    on(regex: RegExp, routeFunc: RouteFunc, hooks?: Hooks): Navigo;
    on(options: { [url: string]: RouteFunc | NamedRoute }): Navigo;
    on(...args: any[]): Navigo {
        if (this.navigo === undefined) {
            this.navigo = new Navigo();
            if (this.isWebNav !== true) this.navigo.historyAPIUpdateMethod('replaceState');
        }
        return this.navigo.on(args[0], args[1], args[2]);
    }

    private navLogin: NavPage = async (params: any) => {
        this.showLogin(async (user: User) => window.history.back(), false);
    }

    private navLogout: NavPage = async (params: any) => {
        this.showLogout(async () => window.history.back());
    }

    private navRegister: NavPage = async (params: any) => {
        this.showRegister();
    }

    private navForget: NavPage = async (params: any) => {
        this.showForget();
    }

    navigateToLogin() {
        this.navigate('/login');
    }

    openSysPage(url: string): boolean {
        let navPage: NavPage = this.sysRoutes[url];
        if (navPage === undefined) {
            //alert(url + ' is not defined in sysRoutes');
            return false;
        }
        navPage(undefined);
        return true;
    }

    private navPageRoutes: { [url: string]: NavPage };
    private routeFromNavPage(navPage: NavPage) {
        return (params: any, queryStr: any) => {
            if (navPage) {
                if (this.isWebNav) this.clear();
                navPage(params);
            }
        }
    }
    onNavRoute(navPage: NavPage) {
        this.on(this.routeFromNavPage(navPage));
    }
    private doneSysRoutes: boolean = false;
    private sysRoutes: { [route: string]: NavPage } = {
        '/login': this.navLogin,
        '/logout': this.navLogout,
        '/register': this.navRegister,
        '/forget': this.navForget,
    }
    /*
    onSysNavRoutes() {
        this.onNavRoutes(this.sysRoutes);
    }
    */
    onNavRoutes(navPageRoutes: { [url: string]: NavPage }) {
        if (this.doneSysRoutes === false) {
            this.doneSysRoutes = true;
            this.internalOnNavRoutes(this.sysRoutes);
        }
        this.internalOnNavRoutes(navPageRoutes);
    }

    private internalOnNavRoutes(navPageRoutes: { [url: string]: NavPage }) {
        if (!navPageRoutes) return;
        this.navPageRoutes = Object.assign(this.navPageRoutes, navPageRoutes);
        let navOns: { [route: string]: (params: any, queryStr: any) => void } = {};
        for (let route in navPageRoutes) {
            let navPage = navPageRoutes[route];
            navOns[route] = this.routeFromNavPage(navPage);
        }
        this.on(navOns);
    }

    isWebNav: boolean = false;
    backIcon = <i className="fa fa-angle-left" />;
    closeIcon = <i className="fa fa-close" />;
    setIsWebNav() {
        this.isWebNav = true;
        this.backIcon = <i className="fa fa-arrow-left" />;
        this.closeIcon = <i className="fa fa-close" />;
    }

    pageWebNav: any; //PageWebNav;

    navigate(url: string, absolute?: boolean) {
        if (!this.navigo) {
            alert('Is not in webnav state, cannot navigate to url "' + url + '"');
            return;
        }
        if (this.testing === true) {
            url += '#test';
        }
        return this.navigo.navigate(url, absolute);
    }

    go(showPage: () => void, url: string, absolute?: boolean) {
        if (this.navigo !== undefined) {
            this.navigate(url, absolute);
        }
        else {
            showPage();
        }
    }

    async showAppView(isUserLogin?: boolean) {
        let { onLogined } = this.navView.props;
        if (onLogined === undefined) {
            this.push(<div>NavView has no prop onLogined</div>);
            return;
        }
        this.clear();
        await onLogined(isUserLogin);
    }

    setGuest(guest: Guest) {
        this.local.guest.set(guest);
        this.web.setNetToken(0, guest.token);
    }

    saveLocalUser() {
        this.local.user.set(this.user);
    }

    setUqRoles(uq: string, roles: string[]) {
        let { roles: userRoles } = this.user;
        if (!userRoles) {
            this.user.roles = {};
        }
        this.user.roles[uq] = roles;
        this.local.user.set(this.user);
    }

    async loadMe() {
        let me = await this.web.userApi.me();
        this.user.icon = me.icon;
        this.user.nick = me.nick;
    }

    private async internalLogined(user: User, callback: (user: User) => Promise<void>, isUserLogin: boolean) {
        this.web.logoutApis();
        this.user = user;
        this.saveLocalUser();
        this.web.setNetToken(user.id, user.token);
        this.clear();

        await this.onChangeLogin?.(this.user);
        if (callback !== undefined) {
            await callback(user);
        }
        else if (this.isWebNav === true) {
            this.navigate('/index');
        }
        else {
            await this.showAppView(isUserLogin);
        }
    }

    onChangeLogin: (user: User) => Promise<void>;

    // 缓冲登录
    async logined(user: User, callback?: (user: User) => Promise<void>) {
        await this.internalLogined(user, callback, false);
    }

    // 用户操作之后登录
    async userLogined(user: User, callback?: (user: User) => Promise<void>) {
        await this.internalLogined(user, callback, true);
    }

    loginTop(defaultTop: JSX.Element) {
        return (this.navSettings && this.navSettings.loginTop) || defaultTop;
    }

    privacyEntry() {
        if (!this.getPrivacyContent()) return;
        return <div className="text-center">
            <button className="btn btn-sm btn-link"
                onClick={this.showPrivacyPage}>
                <small className="text-muted">隐私政策</small>
            </button>
        </div>;
    }

    private getPrivacyContent(): string {
        if (!this.navSettings) return;
        let { privacy } = this.navSettings;
        return privacy;
    }

    showPrivacyPage = () => {
        let privacy = this.getPrivacyContent();
        if (privacy) {
            this.privacyPage(privacy);
        }
        else {
            this.push(<Page header="隐私政策">
                <div className="p-3">AppConfig 中没有定义 privacy。可以定义为字符串，或者url。markdown格式</div>
            </Page>);
        }
    }

    private privacyPage = async (htmlString: string) => {
        //let html = await this.getPrivacy(privacy);
        //let content = {__html: marked(html)};
        let content = { __html: htmlString };
        this.push(<Page header="隐私政策">
            <div className="p-3" dangerouslySetInnerHTML={content} />
        </Page>);
    }

    private createLogin = createLogin;
    setCreateLogin(createLogin: (tonwa: Tonwa) => Promise<Login>) {
        this.createLogin = createLogin;
    }

    private login: Login;
    private async getLogin(): Promise<Login> {
        if (this.login) return this.login;
        return this.login = await this.createLogin(this.tonwa);
    }
    async showLogin(callback?: (user: User) => Promise<void>, withBack?: boolean) {
        let login = await this.getLogin();
        login.showLogin(callback, withBack);
    }

    async showLogout(callback?: () => Promise<void>) {
        let login = await this.getLogin();
        login.showLogout(callback);
    }

    async showRegister() {
        showRegister(this.tonwa);
    }

    async showForget() {
        showForget(this.tonwa);
    }

    async logout(callback?: () => Promise<void>) { //notShowLogin?:boolean) {
        this.local.logoutClear();
        this.user = undefined; //{} as User;
        this.web.logoutApis();
        let guest = this.local.guest.get();
        this.web.setCenterToken(0, guest && guest.token);
        this.clear();
        if (callback === undefined)
            await this.start();
        else
            await callback();
        this.onChangeLogin?.(undefined);
    }

    async changePassword() {
        let login = await this.getLogin();
        login.showChangePassword();
    }

    async userQuit() {
        let login = await this.getLogin();
        login.showUserQuit();
    }

    get level(): number {
        return this.navView.level;
    }
    startWait() {
        this.navView?.startWait();
    }
    endWait() {
        this.navView?.endWait();
    }
    async onError(fetchError: FetchError) {
        let err = fetchError.error;
        if (err !== undefined) {
            if (err.unauthorized === true) {
                await this.showLogin(undefined);
                //nav.navigateToLogin();
                return;
            }
            switch (err.type) {
                case 'unauthorized':
                    await this.showLogin(undefined);
                    //nav.navigateToLogin();
                    return;
                case 'sheet-processing':
                    this.push(<SystemNotifyPage message="单据正在处理中。请重新操作！" />);
                    return;
            }
        }
        this.navView.setState({
            fetchError,
        });
    }

    private upgradeUq = () => {
        this.start();
    }

    async showUpgradeUq(uq: string, version: number): Promise<void> {
        this.show(<Page header={false}>
            <div>
                UQ升级了，请点击按钮升级 <br />
                <small className="text-muted">{uq} ver-{version}</small>
                <button className="btn btn-primary" onClick={this.upgradeUq}>升级</button>
            </div>
        </Page>)
    }

    show(view: JSX.Element, disposer?: () => void): void {
        this.navView.show(view, disposer);
    }
    push(view: JSX.Element, disposer?: () => void): void {
        this.navView.push(view, disposer);
    }
    replace(view: JSX.Element, disposer?: () => void): void {
        this.navView.replace(view, disposer);
    }
    pop(level: number = 1) {
        this.navView.pop(level);
    }
    topKey(): number {
        return this.navView.topKey();
    }
    popTo(key: number) {
        this.navView.popTo(key);
    }
    clear() {
        this.navView?.clear();
    }
    navBack() {
        this.navView.navBack();
    }
    ceaseTop(level?: number) {
        this.navView.ceaseTop(level);
    }
    removeCeased() {
        this.navView.removeCeased();
    }
    async back(confirm: boolean = true) {
        await this.navView.back(confirm);
    }
    regConfirmClose(confirmClose: () => Promise<boolean>) {
        this.navView.regConfirmClose(confirmClose);
    }
    confirmBox(message?: string): boolean {
        return this.navView.confirmBox(message);
    }
    /*
    async navToApp(url: string, unitId: number, apiId?:number, sheetType?:number, sheetId?:number):Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let sheet = this.centerHost.includes('http://localhost:') === true? 'sheet_debug':'sheet'
            let uh = sheetId === undefined?
                    appUrl(url, unitId) :
                    appUrl(url, unitId, sheet, [apiId, sheetType, sheetId]);
            console.log('navToApp: %s', JSON.stringify(uh));
            nav.push(<article className='app-container'>
                <span id={uh.hash} onClick={()=>this.back()}/>
                    <i className="fa fa-arrow-left" />
                </span>
                {
                    // eslint-disable-next-line 
                    <iframe src={uh.url} title={String(sheetId)} />
                }
            </article>, 
            ()=> {
                resolve();
            });
        });
    }

    navToSite(url: string) {
        // show in new window
        window.open(url);
    }
    */

    get logs() { return logs };
    log(msg: string) {
        logs.push(msg);
    }
    logMark() {
        let date = new Date();
        logMark = date.getTime();
        logs.push('log-mark: ' + date.toTimeString());
    }
    logStep(step: string) {
        logs.push(step + ': ' + (new Date().getTime() - logMark));
    }

    showReloadPage(msg: string) {
        let seconds = -1;
        this.push(<ReloadPage message={msg} seconds={seconds} />);
        /*
        if (seconds > 0) {
            env.setTimeout(undefined, this.reload, seconds*1000);
        }
        */
    }

    reload = async () => {
        let waiting: Promise<void> = new Promise<void>((resolve, reject) => {
            setTimeout(resolve, 100);
        });

        if ('serviceWorker' in navigator) {
            let registration = await Promise.race([waiting, navigator.serviceWorker.ready]);
            if (registration) registration.unregister();
        }
        window.document.location.reload();
        // dcloud hbuilder里面的app自动升级，需要清webview的缓存
        let plus = (window as any).plus;
        if (plus) {
            let webview = plus.webview;
            if (webview) {
                if (webview.reload) webview.reload(true);
            }
            else {
                let webView = plus.webView;
                if (webView) {
                    if (webView.reload) webView.reload(true);
                }
            }
            //plus.webview.reload(true)
        }
    }

    resetAll = () => {
        this.push(<ConfirmReloadPage confirm={(ok: boolean): Promise<void> => {
            if (ok === true) {
                this.showReloadPage('彻底升级');
                localStorage.clear();
                /*
                this.local.readToMemory();
                env.localDb.removeAll();
                this.local.saveToLocalStorage();
                */
            }
            else {
                this.pop();
            }
            return;
        }} />);
    }

    async checkVersion(): Promise<string> {
        let { href } = document.location;
        href += (href.indexOf('?') >= 0 ? '&' : '?') + '_t_t_=' + new Date().getTime();
        let ret = await fetch(href);
        let r = await ret.text();
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(r, 'text/html');
        let elHtml = htmlDoc.getElementsByTagName('html');
        let newVersion = elHtml[0].getAttribute('data-version');
        return newVersion;
    }
}
