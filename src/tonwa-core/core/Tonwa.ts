import { Navigo, Hooks, NamedRoute, RouteFunc } from "./Navigo";
import { Nav, NavPage } from './Nav';
import { Web } from '../web';
import { resOptions } from '../res';
import { LocalData, env, User, Guest } from '../tool';
import { Login } from './Login';

export interface NavSettings {
	oem?: string;
	loginTop?: JSX.Element;
	privacy?: string;
	htmlTitle?: string;
}

let logMark: number;
const logs: string[] = [];

export let tonwa: Tonwa;

export abstract class Tonwa {
	readonly web: Web;
	private wsHost: string;
	private local: LocalData = new LocalData();
	private navigo: Navigo;
	//isWebNav:boolean = false;
	navSettings: NavSettings;
	user: User = null;
	testing: boolean;
	language: string;
	culture: string;
	resUrl: string;

	constructor() {
		tonwa = this;
		this.web = this.createWeb();
		let { lang, district } = resOptions;
		this.language = lang;
		this.culture = district;
		this.testing = false;
	}

	/*
	protected abstract startWait(): void;
	protected abstract endWait(): void;
	*/
	//protected abstract showLogin(callback?: (user:User)=>Promise<void>, withBack?:boolean): Promise<void>;
	protected abstract showRegister(): Promise<void>;
	protected abstract showForget(): Promise<void>;

	abstract createWeb(): Web;
	abstract createObservableMap<K, V>(): Map<K, V>;
	abstract get nav(): Nav;

	abstract privacyEntry(): void;
	//abstract showLogout(callback?: ()=>Promise<void>): Promise<void>;
	//abstract openSysPage(url: string):boolean;
	//abstract changePassword(): Promise<void>;
	//abstract userQuit(): Promise<void>;
	abstract resetAll: () => void;
	abstract showAppView(isUserLogin?: boolean): Promise<void>;
	//abstract clear(): void;

	get guest(): number {
		let guest = this.local.guest;
		if (guest === undefined) return 0;
		let g = guest.get();
		if (g === undefined) return 0;
		return g.guest;
	}
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
	private notLogined?: () => Promise<void>;
	private userPassword?: () => Promise<{ user: string; password: string; }>
	async appStart(notLogined?: () => Promise<void>, userPassword?: () => Promise<{ user: string; password: string; }>) {
		//if (this.appStarted === true) return;
		//this.appStarted = true;
		this.notLogined = notLogined;
		this.userPassword = userPassword;
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
			this.nav.clear();
			this.nav.startWait();

			let user: User = this.local.user.get();
			if (user === undefined) {
				//throw new Error('user logout to be implemented');
				//let {userPassword} = this.navView.props;
				if (this.userPassword) {
					let ret = await this.userPassword();
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
					//let {notLogined} = this.navView.props;
					if (this.notLogined !== undefined) {
						await this.notLogined();
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
			this.nav.endWait();
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
			if (this.nav.isWebNav !== true) this.navigo.historyAPIUpdateMethod('replaceState');
		}
		return this.navigo.on(args[0], args[1], args[2]);
	}

	navigateToLogin() {
		this.navigate('/login');
	}

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
		this.nav.clear();

		await this.onChangeLogin?.(this.user);
		if (callback !== undefined) {
			await callback(user);
		}
		else if (this.nav.isWebNav === true) {
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

	async logout(callback?: () => Promise<void>) { //notShowLogin?:boolean) {
		this.local.logoutClear();
		this.user = undefined; //{} as User;
		this.web.logoutApis();
		let guest = this.local.guest.get();
		this.web.setCenterToken(0, guest && guest.token);
		this.nav.clear();
		if (callback === undefined)
			await this.start();
		else
			await callback();
		this.onChangeLogin?.(undefined);
	}


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

	openSysPage(url: string): boolean {
		let navPage: NavPage = this.sysRoutes[url];
		if (navPage === undefined) {
			//alert(url + ' is not defined in sysRoutes');
			return false;
		}
		navPage(undefined);
		return true;
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


	private navPageRoutes: { [url: string]: NavPage };
	private routeFromNavPage(navPage: NavPage) {
		return (params: any, queryStr: any) => {
			if (navPage) {
				if (this.nav.isWebNav) this.nav.clear();
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

	private createLogin: (tonwa: Tonwa) => Promise<Login>;
	setCreateLogin(createLogin: (tonwa: Tonwa) => Promise<Login>) {
		this.createLogin = createLogin;
	}

	async changePassword() {
		let login = await this.getLogin();
		login.showChangePassword();
	}

	async userQuit() {
		let login = await this.getLogin();
		login.showUserQuit();
	}

	private login: Login;
	private async getLogin(): Promise<Login> {
		if (this.login) return this.login;
		return this.login = await this.createLogin(this);
	}
	async showLogin(callback?: (user: User) => Promise<void>, withBack?: boolean) {
		let login = await this.getLogin();
		login.showLogin(callback, withBack);
	}

	async showLogout(callback?: () => Promise<void>) {
		let login = await this.getLogin();
		login.showLogout(callback);
	}
}
