import { FA, List, VPage } from "tonwa";
import { TicketType } from "uq-app/uqs/BzTicket";
import { CTicketType } from "./CTicketType";

export class VTicketTypeList extends VPage<CTicketType> {
    header(): string | boolean | JSX.Element {
        return '工单类型';
    }

    right() {
        return <button className="btn btn-sm btn-success me-2" onClick={this.controller.saveTicketTypes}>
            <FA name="plus" />
        </button>;
    }

    content() {
        return <div className="py-2">
            <List items={this.controller.list} item={{ render: this.renderItem }} />
        </div>;
    }

    renderItem = (item: TicketType, index: number) => {
        return <div className="px-3 py-2">{item.name}</div>;
    }
}