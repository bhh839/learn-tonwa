import { List, LMR, VPage } from "tonwa";
import { Staff } from "uq-app/uqs/BzTicket";
import { CStaff } from "./CStaff";

export class VStaffSelect extends VPage<CStaff> {
    header() { return '选择职员' }
    content() {
        return <div>
            <List items={this.controller.data.staffList} item={{ render: this.renderStaff, onSelect: this.onSelect }} />
        </div>
    }

    onSelect = (staff: Staff, isSelected: boolean) => {
        this.controller.returnCall(staff);
        this.closePage();
    }

    renderStaff = (staff: Staff, index: number) => {
        let { no, name } = staff;
        let left = <span className="w-12c">{name}</span>;
        let right = <small className="text-muted">{no}</small>;
        return <LMR className="ps-3 py-2" left={left} right={right} />;
    }
}
