import { CHome } from "home";
import { FA, VPage } from "tonwa";

export class VTestPage3 extends VPage<CHome> {
    header() {
        return '页面表头3'
    }
    content() {
        let { inc, dec } = this.controller;
        return <div className="p-3">
            测试页面3
            <div className="d-flex p-2">
                <button className="btn btn-primary cursor-pointer me-3"
                    onClick={inc/*this.inc*/}>
                    <FA name="plus" />
                </button>
                <button className="btn btn-success cursor-pointer me-3"
                    onClick={dec /*() => this.dec()*/}>
                    <FA name="minus" />
                </button>
            </div>
            {this.react(() => <div>计数：{this.controller.data.count}</div>)}
        </div>;
    }

    inc = () => {
        ++this.controller.data.count;
    }

    dec() {
        --this.controller.data.count;
    }
}