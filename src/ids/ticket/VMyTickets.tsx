import { FA, List, LMR, View } from "tonwa";
import { ReturnMyTicketsRet } from "uq-app/uqs/BzTicket";
import { CTicket } from ".";

export class VMyTickets extends View<CTicket> {
    render() {
        return this.react(() => {
            let { data } = this.controller;
            let { myTickets } = data;
            return <List none="[无工单]"
                items={myTickets}
                item={{ render: this.renderMyTicket, onClick: this.onMyTicket, key: item => item.ticket }}
            />;
        })
    }

    private renderMyTicket = (item: ReturnMyTicketsRet, index: number) => {
        // eslint-disable-next-line
        let { ticket, node, discription, state, from } = item;
        let { BzTicket } = this.controller.uqs;
        let left = <div className="d-block">
            <div className="small text-muted">
                <FA name="user-o" className="me-2" />
                {BzTicket.IDRender(from)}
            </div>
            <div>{discription}</div>
            <div>{BzTicket.IDLocalRender(state)}</div>
        </div>;
        return <LMR className="px-3 py-2" left={left}>
        </LMR>;
    }

    private onMyTicket = (item: ReturnMyTicketsRet) => {
        alert(JSON.stringify(item));
    }
}
