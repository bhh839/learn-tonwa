import { UqBuildContext } from "./UqBuildContext";

export class TsTemplate {
    private readonly buildContext: UqBuildContext;

    constructor(buildContext: UqBuildContext) {
        this.buildContext = buildContext;
        this.tsHeader = `//=== UqApp builder created on ${new Date()} ===//`;
    }

    readonly tsHeader: string;

    get tsApp(): string {
        return `${this.tsHeader}
import { NavView, start, nav } from 'tonwa-${this.buildContext.uiPlatform}';
import { CApp } from './CApp';
import { appConfig } from './appConfig';

export const App: React.FC = () => {
    nav.setSettings(appConfig);
    const onLogined = async (isUserLogin?:boolean) => {
        await start(CApp, appConfig, isUserLogin);
    }
    return <NavView onLogined={onLogined} />;
}

`;
    }

    get tsCApp(): string {
        return `${this.tsHeader}
import { CUqApp } from "./CBase";
import { res } from "./res";
import { VMain } from "./VMain";
import { setUI } from "./uqs";

const gaps = [10, 3,3,3,3,3,5,5,5,5,5,5,5,5,10,10,10,10,15,15,15,30,30,60];

export class CApp extends CUqApp {
    protected async internalStart(isUserLogin: boolean) {
        this.setRes(res);
        setUI(this.uqs);
        
        this.openVPage(VMain, undefined, this.dispose);
    }

    private timer:any;
    protected onDispose() {
        clearInterval(this.timer);
        this.timer = undefined;
    }

    private tick = 0;
    private gapIndex = 0;
    private callTick = async () => {
        try {
            if (!this.user) return;
            ++this.tick;
            if (this.tick<gaps[this.gapIndex]) return;
            this.tick = 0;
            if (this.gapIndex < gaps.length - 1) ++this.gapIndex;
            let ret = await this.uqs.BzHelloTonwa.$poked.query(undefined, false);
            let v = ret.ret[0];
            if (v === undefined) return;
            if (!v.poke) return;
            this.gapIndex = 1;

            // 数据服务器提醒客户端刷新，下面代码重新调入的数据
            //this.cHome.refresh();
        }
        catch {
        }
    }
}
`;
    }

    get tsCBase(): string {
        return `${this.tsHeader}
import { CSub, CBase, CAppBase, IConstructor } from 'tonwa-${this.buildContext.uiPlatform}';
import { UQs } from './uqs';
import { CApp } from './CApp';

export abstract class CUqBase extends CBase<CApp, UQs> {
    protected async internalStart(param?:any, ...params:any[]):Promise<void> {}
}

export abstract class CUqSub<A extends CAppBase<U>, U, T extends CBase<A,U>> extends CSub<A, U, T> {
}

export abstract class CUqApp extends CAppBase<UQs> {
    newC<T extends CUqBase>(type: IConstructor<T>, ...param:any[]): T {
        let c = new type(this);
        c.internalInit(...param);
        return c;
    }
}
`;
    }

    get tsIndex(): string {
        return `${this.tsHeader}
export { CUqApp, CUqBase, CUqSub } from './CBase';
export { CApp } from './CApp';
export * from './uqs';
export * from './App';
export * from './startApp';
`;
    }

    get tsVMain(): string {
        return `${this.tsHeader}
import { VPage, Page } from 'tonwa-${this.buildContext.uiPlatform}';
import { CApp } from './CApp';

export class VMain extends VPage<CApp> {
    header() { return 'TEST'; }
    content() {
        return <div className="m-3">
            <div>{this.renderMe()}</div>
            <div className="mb-5">同花样例主页面</div>
        </div>;
    }
}
`;
    }
}
