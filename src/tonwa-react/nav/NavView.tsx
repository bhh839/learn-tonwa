import * as React from 'react';
import { env, FetchError, PageWebNav } from 'tonwa-core';
import { Loading } from '../components';
import FetchErrorView from './FetchErrorView';
import { FA } from '../components';

export interface Props {
    onLogined: (isUserLogin?: boolean) => Promise<void>;
    notLogined?: () => Promise<void>;
    userPassword?: () => Promise<{ user: string; password: string }>;
};
let stackKey = 1;
export interface StackItem {
    key: number;
    view: JSX.Element;
    ceased: boolean;
    confirmClose?: () => Promise<boolean>;
    disposer?: () => void;
}
export interface NavViewState {
    notSupportedBrowser: boolean;
    stack: StackItem[];
    wait: 0 | 1 | 2;
    fetchError: FetchError;
}

const notSupportedBrowsers = ['IE'];

export class NavView extends React.Component<Props, NavViewState> {
    private stack: StackItem[];
    private waitCount: number = 0;
    private waitTimeHandler?: NodeJS.Timer;
    isWebNav: boolean = false;

    constructor(props: Props) {
        super(props);
        this.stack = [];
        let { browser } = env;
        let notSupportedBrowser = notSupportedBrowsers.findIndex(v => v === browser) >= 0;
        this.state = {
            notSupportedBrowser,
            stack: this.stack,
            wait: 0,
            fetchError: undefined
        };
        //nav.set(this);
    }
    async componentDidMount() {
        if (this.state.notSupportedBrowser === true) return;
        window.addEventListener('popstate', this.navBack);
    }

    get level(): number {
        return this.stack.length;
    }

    startWait() {
        if (this.waitCount === 0) {
            this.setState({ wait: 1 });
            this.waitTimeHandler = env.setTimeout(
                'NavView.startWait',
                () => {
                    this.waitTimeHandler = undefined;
                    this.setState({ wait: 2 });
                },
                1000) as NodeJS.Timer;
        }
        ++this.waitCount;
        this.setState({
            fetchError: undefined,
        });
    }

    endWait() {
        env.setTimeout(
            undefined, //'NavView.endWait',
            () => {
                /*
                this.setState({
                    fetchError: undefined,
                });*/
                --this.waitCount;
                if (this.waitCount === 0) {
                    if (this.waitTimeHandler !== undefined) {
                        env.clearTimeout(this.waitTimeHandler);
                        this.waitTimeHandler = undefined;
                    }
                    this.setState({ wait: 0 });
                }
            }, 100);
    }

    show(view: JSX.Element, disposer?: () => void): number {
        this.clear();
        return this.push(view, disposer);
    }

    push(view: JSX.Element, disposer?: () => void): number {
        this.removeCeased();
        if (this.stack.length > 0) {
            window.history.pushState('forward', null, null);
        }
        let key = stackKey++;
        this.stack.push({
            key: key,
            view: view,
            ceased: false,
            disposer: disposer
        });
        this.refresh();
        //console.log('push: %s pages', this.stack.length);
        return key;
    }

    replace(view: JSX.Element, disposer?: () => void): number {
        let item: StackItem = undefined;
        let stack = this.stack;
        if (stack.length > 0) {
            item = stack.pop();
            //this.popAndDispose();
        }
        let key = stackKey++;
        this.stack.push({
            key: key,
            view: view,
            ceased: false,
            disposer: disposer
        });
        if (item !== undefined) this.dispose(item.disposer);
        this.refresh();
        //console.log('replace: %s pages', this.stack.length);
        return key;
    }

    ceaseTop(level: number = 1) {
        let p = this.stack.length - 1;
        for (let i = 0; i < level; i++, p--) {
            if (p < 0) break;
            let item = this.stack[p];
            item.ceased = true;
        }
    }

    pop(level: number = 1) {
        let stack = this.stack;
        let len = stack.length;
        //console.log('pop start: %s pages level=%s', len, level);
        if (level <= 0 || len <= 1) return;
        if (len < level) level = len;
        let backLevel = 0;
        for (let i = 0; i < level; i++) {
            if (stack.length === 0) break;
            //stack.pop();
            this.popAndDispose();
            ++backLevel;
        }
        if (backLevel >= len) backLevel--;
        this.refresh();
        if (this.isHistoryBack !== true) {
            //window.removeEventListener('popstate', this.navBack);
            //window.history.back(backLevel);
            //window.addEventListener('popstate', this.navBack);
        }
        //console.log('pop: %s pages', stack.length);
    }

    popTo(key: number) {
        if (key === undefined) return;
        if (this.stack.find(v => v.key === key) === undefined) return;
        while (this.stack.length > 0) {
            let len = this.stack.length;
            let top = this.stack[len - 1];
            if (top.key === key) break;
            this.pop();
        }
    }

    topKey(): number {
        let len = this.stack.length;
        if (len === 0) return undefined;
        return this.stack[len - 1].key;
    }

    removeCeased() {
        for (; ;) {
            let p = this.stack.length - 1;
            if (p < 0) break;
            let top = this.stack[p];
            if (top.ceased === false) break;
            let item = this.stack.pop();
            let { disposer } = item;
            this.dispose(disposer);
        }
        this.refresh();
    }

    private popAndDispose() {
        this.removeCeased();
        let item = this.stack.pop();
        if (item === undefined) return;
        //if (nav.isRouting) {
        //	window.history.back();
        //}
        let { disposer } = item;
        this.dispose(disposer);
        this.removeCeased();
        return item;
    }

    private dispose(disposer: () => void) {
        if (disposer === undefined) return;
        let item = this.stack.find(v => v.disposer === disposer);
        if (item === undefined) disposer();
    }

    clear() {
        let len = this.stack.length;
        while (this.stack.length > 0) this.popAndDispose();
        //this.refresh();
        if (len > 1) {
            //window.removeEventListener('popstate', this.navBack);
            //window.history.back(len-1);
            //window.addEventListener('popstate', this.navBack);
        }
    }

    regConfirmClose(confirmClose: () => Promise<boolean>) {
        let stack = this.stack;
        let len = stack.length;
        if (len === 0) return;
        let top = stack[len - 1];
        top.confirmClose = confirmClose;
    }

    private isHistoryBack: boolean = false;
    navBack = () => {
        //nav.log('backbutton pressed - nav level: ' + this.stack.length);
        let tick = Date.now();
        this.isHistoryBack = true;
        this.back(true);
        this.isHistoryBack = false;
        console.log(`///\\\\ ${Date.now() - tick}ms backbutton pressed - nav level: ${this.stack.length}`);
    }

    back = async (confirm: boolean = true) => {
        let stack = this.stack;
        let len = stack.length;
        if (len === 0) return;
        if (len === 1) {
            if (window.self !== window.top) {
                window.top.postMessage({ type: 'pop-app' }, '*');
            }
            return;
        }
        let top = stack[len - 1];
        if (confirm === true && top.confirmClose) {
            if (await top.confirmClose() === true) this.pop();
        }
        else {
            this.pop();
        }
    }

    confirmBox(message?: string): boolean {
        return window.confirm(message);
    }
    clearError = () => {
        this.setState({ fetchError: undefined });
    }

    setFetchError(fetchError: FetchError) {
        this.setState({ fetchError });
    }

    render() {
        const { notSupportedBrowser, wait, fetchError } = this.state;
        if (notSupportedBrowser === true) {
            return <div className="p-3 text-danger">
                {env.browser} not supported !
            </div>;
        }
        let { stack } = this.state;
        let top = stack.length - 1;
        let elWait = null, elError = null;
        switch (wait) {
            case 1:
                elWait = <div className="va-wait va-wait1">
                </div>;
                break;
            case 2:
                elWait = <div className="va-wait va-wait2">
                    <Loading />
                </div>;
                break;
        }
        if (fetchError) {
            elError = <FetchErrorView clearError={this.clearError} {...fetchError} />;
            ++top;
        }
        let test = env.testing === true &&
            <span className="cursor-pointer position-fixed" style={{ top: 0, left: '0.2rem', zIndex: 90001 }}>
                <FA className="text-warning" name="info-circle" />
            </span>;
        return <>
            {stack.map((item, index) => {
                let { key, view } = item;
                return <div key={key} style={index < top ? { visibility: 'hidden', position: 'absolute' } : undefined}>
                    {view}
                </div>
            })}
            {elWait}
            {elError}
            {test}
        </>;
    }

    private refresh() {
        this.setState({ stack: this.stack });
    }

    backIcon = <i className="fa fa-angle-left" />;
    closeIcon = <i className="fa fa-close" />;

    setIsWebNav(): void {
        this.isWebNav = true;
        this.backIcon = <i className="fa fa-arrow-left" />;
        this.closeIcon = <i className="fa fa-close" />;
    }

    pageWebNav: PageWebNav<JSX.Element>;

    renderNavView(onLogined: any, onNotLogined?: any): JSX.Element {
        throw new Error('renderNavView');
    }
}
