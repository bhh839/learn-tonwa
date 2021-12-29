import { FA, VPage } from "tonwa";
import { List, LMR } from "tonwa-react";
import { Customer } from "uq-app/uqs/BzTicket";
import { CCustomer } from "./CCustomer";

export class VCustomer extends VPage<CCustomer> {
    header() { return '客户管理'; }
    right() {
        return <button className="btn btn-sm btn-success me-2" onClick={this.controller.newCustomer}>
            <FA name="plus" />
        </button>;
    }
    content() {

        return <div>
            <List items={this.controller.customerList}
                item={{ render: this.renderItem, onClick: (item: Customer) => this.controller.editCustomer(item) }} />
            {/* <div className="p-3">
                <button className="btn btn-primary" onClick={this.controller.list}>客户列表</button>
            </div> */}
        </div>;

    }

    private renderItem = (item: Customer, index: number) => {
        let { no, name, vice } = item
        return <div className="px-3 py-2 d-block">
            <LMR left={<b>{name}</b>} right={<small className="text-muted">{no}</small>}></LMR>
            <div className="small text-muted">{vice}</div>
        </div>
    };
}
