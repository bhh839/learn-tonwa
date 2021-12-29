import { VPage } from "tonwa";
import { List, LMR } from "tonwa";
import { Customer } from "uq-app/uqs/BzTicket";
import { CCustomer } from "./CCustomer";

export class VCustomerList extends VPage<CCustomer> {
    header() { return '客户列表' }

    content() {
        //let { BzTicket } = this.controller.uqs;
        //let { Customer } = BzTicket;
        return <div>
            <List items={this.controller.customerList}
                item={{ render: this.renderItem, onClick: (item: Customer) => this.controller.showCustomer(item) }} />
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