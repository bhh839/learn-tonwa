import { CLogin } from "./CLogin";
import { VPage } from "../vm";
import { CenterAppApi } from "tonwa-core";

const waitingTime = '一小时';

abstract class VUserQuitBase extends VPage<CLogin> {
    protected abstract get note(): any;
    protected get button1Caption(): string { return undefined; }
    protected get button2Caption(): string { return undefined; }
    protected renderButton1(): JSX.Element {
        let caption = this.button1Caption;
        if (caption === null) return null;
        return <button className="btn btn-primary" onClick={() => this.onClickButton1()}>
            {caption ?? '不注销'}
        </button>;
    }
    protected renderButton2(): JSX.Element {
        let caption = this.button2Caption;
        if (caption === null) return null;
        return <button className="btn btn-outline-info ms-3" onClick={() => this.onClickButton2()}>
            {caption ?? '确认注销'}
        </button>;
    }
    header() { return '注销账号' }
    content() {
        return <div className="border border-danger rounded mx-auto m-3 w-max-30c bg-white ">
            <div className="p-4 border-bottom">{this.note}</div>
            <div className="p-3 text-center">
                {this.renderButton1()}
                {this.renderButton2()}
            </div>
        </div>
    }

    protected onClickButton1() {
        this.closePage();
    }

    protected onClickButton2() {
    }
}

export class VUserQuit extends VUserQuitBase {
    protected get note(): any {
        return <>
            注意：账号注销后，账号绑定手机、邮件等相关信息将被释放。账号无法将登录。<br />
            请确认！
        </>;
    }
    protected get button2Caption(): string { return '我已了解，仍然注销'; }

    protected onClickButton2() {
        this.openVPage(VQuitConfirm);
    }
}

class VQuitConfirm extends VUserQuitBase {
    protected get note(): any {
        return <>
            账号注销后，如果在{waitingTime}内容重新登录账号，账号自动恢复。
            {waitingTime}之后，账号绑定手机、邮件等相关信息将被释放。账号无法将登录。<br />
            请再次确认！
        </>;
    }
    protected get button2Caption(): string { return '确认注销'; }

    protected onClickButton1() {
        this.closePage(2);
    }

    protected async onClickButton2() {
        let centerAppApi = new CenterAppApi(this.controller.web, 'tv/', undefined);
        await centerAppApi.userQuit();
        this.openVPage(VQuitDone);
    }
}

class VQuitDone extends VUserQuitBase {
    header() { return '注销已账号' }
    protected get back(): 'close' | 'back' | 'none' { return 'none' }
    protected get note(): any {
        return <>
            账号将在{waitingTime}后彻底注销。<br />
            如果在{waitingTime}内容重新登录账号，注销操作自动取消。
            {waitingTime}之后，账号绑定手机、邮件等相关信息将被释放。账号无法将登录。
        </>;
    }
    protected get button1Caption(): string { return '退出'; }
    protected get button2Caption(): string { return null; }
    protected onClickButton1() {
        this.tonwa.logout();
    }
}
