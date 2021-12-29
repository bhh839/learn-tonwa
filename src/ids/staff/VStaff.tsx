import { FA, VPage } from "tonwa";
import { List, LMR } from "tonwa-react";
import { Staff } from "uq-app/uqs/BzTicket";
import { CStaff } from "./CStaff";

export class VStaff extends VPage<CStaff> {
    header() { return '职员管理'; }
    right() {
        return <button className="btn btn-sm btn-success me-2" onClick={this.controller.newStaff}>
            <FA name="plus" />
        </button>;
    }
    content() {
        // return <div className="p-3">
        //     <button className="btn btn-primary" onClick={this.controller.list}>客户列表</button>
        // </div>;
        return <div>
            <List items={this.controller.data.staffList}
                item={{ render: this.renderItem, onClick: (item: Staff) => this.controller.showStaff(item) }} />
        </div>;
        // return <div>
        //     <List items={this.controller.data.staffList}
        //         item={{ render: this.renderItem, onClick: (item: Staff) => this.controller.showStaff(item) }} />
        // </div>;
    }

    private renderItem = (item: Staff, index: number) => {
        let { no, name } = item
        return <div className="px-3 py-2 d-block">
            <LMR left={<b>{name}</b>} right={<small className="text-muted">{no}</small>}></LMR>
        </div>
    };
}
