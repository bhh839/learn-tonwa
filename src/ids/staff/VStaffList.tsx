import { VPage } from "tonwa";
import { List, LMR } from "tonwa";
import { Staff } from "uq-app/uqs/BzTicket";
import { CStaff } from "./CStaff";

export class VStaffList extends VPage<CStaff> {
    header() { return '职员列表' }

    content() {
        //let { BzTicket } = this.controller.uqs;
        //let { Staff } = BzTicket;
        return <div>
            <List items={this.controller.data.staffList}
                item={{ render: this.renderItem, onClick: (item: Staff) => this.controller.showStaff(item) }} />
        </div>;
    }

    private renderItem = (item: Staff, index: number) => {
        let { no, name } = item
        return <div className="px-3 py-2 d-block">
            <LMR left={<b>{name}</b>} right={<small className="text-muted">{no}</small>}></LMR>
        </div>
    };
}