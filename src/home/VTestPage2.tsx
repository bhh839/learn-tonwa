import { CHome } from "home";
import { VPage } from "tonwa";

export class VTestPage2 extends VPage<CHome> {
    header() {
        return '页面表头2'
    }
    content() {
        let { inc, dec } = this.controller;
        return <div className="p-3">
            测试页面2
            <div>这里显示页面3里面调整了的count计数：{this.controller.data.count}</div>
            <div className="d-flex p-2">
                <button className="btn btn-primary cursor-pointer me-3"
                    onClick={inc/*this.inc*/}>+</button>
                <button className="btn btn-success cursor-pointer me-3"
                    onClick={dec /*() => this.dec()*/}>-</button>
            </div>
            {this.react(() => <div>计数：{this.controller.data.count}</div>)}
            <div>
                <button onClick={this.controller.showTestPage3}>显示页面3</button>
            </div>
        </div>;
    }
}