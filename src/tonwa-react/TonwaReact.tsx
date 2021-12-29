import { makeObservable, observable } from "mobx";
import { FetchError, Nav, Tonwa, Web } from "tonwa-core";
import { WebReact } from "./app";

import { Page } from './components';

import 'font-awesome/css/font-awesome.min.css';
import './css/va-form.css';
import './css/va.css';
import './css/animation.css';
import { ReloadPage, ConfirmReloadPage } from './components/reloadPage';
import { createLogin, showForget, showRegister } from './components/login';
import { SystemNotifyPage } from './nav/FetchErrorView';
import { NavView } from './nav';

export class TonwaReact extends Tonwa {
    navView: NavView;

    constructor() {
        super();
        makeObservable(this, {
            user: observable,
        });
        this.setCreateLogin(createLogin);
    }

    createWeb(): Web { return new WebReact(this); }

    createObservableMap<K, V>(): Map<K, V> {
        return observable.map({}, { deep: false });
    }

    set(navView: NavView) {
        //this.logo = logo;
        this.navView = navView;
    }

    get nav(): Nav<JSX.Element> { return this.navView };

    setFetchError(fetchError: FetchError) {
        this.navView.setFetchError(fetchError);
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

    /*
    setIsWebNav() {
        this.isWebNav = true;
        this.navView.backIcon = <i className="fa fa-arrow-left" />;
        this.navView.closeIcon = <i className="fa fa-close" />;
    }
    */

    // pageWebNav: PageWebNav;

    async showAppView(isUserLogin?: boolean): Promise<void> {
        let { onLogined } = this.navView.props;
        if (onLogined === undefined) {
            this.navView.push(<div>NavView has no prop onLogined</div>);
            return;
        }
        this.nav.clear();
        await onLogined(isUserLogin);
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
            this.navView.push(<Page header="隐私政策">
                <div className="p-3">AppConfig 中没有定义 privacy。可以定义为字符串，或者url。markdown格式</div>
            </Page>);
        }
    }

    private privacyPage = async (htmlString: string) => {
        let content = { __html: htmlString };
        this.navView.push(<Page header="隐私政策">
            <div className="p-3" dangerouslySetInnerHTML={content} />
        </Page>);
    }

    async showRegister() {
        showRegister(this);
    }

    async showForget() {
        showForget(this);
    }

    resetAll = () => {
        this.navView.push(<ConfirmReloadPage confirm={(ok: boolean): Promise<void> => {
            if (ok === true) {
                this.showReloadPage('彻底升级');
                localStorage.clear();
            }
            else {
                this.navView.pop();
            }
            return;
        }} />);
    }

    showReloadPage(msg: string) {
        let seconds = -1;
        this.navView.push(<ReloadPage message={msg} seconds={seconds} />);
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
                    this.navView.push(<SystemNotifyPage message="单据正在处理中。请重新操作！" />);
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
        this.navView.show(<Page header={false}>
            <div>
                UQ升级了，请点击按钮升级 <br />
                <small className="text-muted">{uq} ver-{version}</small>
                <button className="btn btn-primary" onClick={this.upgradeUq}>升级</button>
            </div>
        </Page>)
    }
}
