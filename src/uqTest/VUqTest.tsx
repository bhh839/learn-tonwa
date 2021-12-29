import { VPage } from "tonwa";
import { Customer } from "uq-app/uqs/BzTicket";
import { CUqTest } from "uqTest";

export class VUqTest extends VPage<CUqTest> {
    header() {
        return 'UQ数据操作';
    }
    content() {
        let customer: Customer = {
            no: '1013',
            name: '王五',
            vice: '这是一个好客户3',
            tel: '13572626512',
            address: 'Nanjing JS',
            status: 1
        };
        return <div className="p-3">
            <div className="mb-3">
                <button className="btn btn-primary"
                    onClick={() => this.controller.newCustomer(customer)}>新建客户</button>
            </div>
            <div className="mb-3">
                <button className="btn btn-primary"
                    onClick={() => this.controller.listCustomer()}>客户列表</button>
            </div>
            <div className="mb-3">
                <button className="btn btn-primary"
                    onClick={() => this.controller.loadTvCustomer()}>客户Tv</button>
            </div>
            <div className="mb-3">
                <button className="btn btn-primary"
                    onClick={() => this.controller.changeCustomer()}>编辑客户</button>
            </div>
        </div>
    }
}
