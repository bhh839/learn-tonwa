import { CUqBase } from "uq-app";
import { Staff } from "uq-app/uqs/BzTicket";
import { VStaff } from "./VStaff";
import { VStaffList } from "./VStaffList";
import { VStaffNew } from "./VStaffNew";
import { VStaffSelect } from "./VStaffSelect";
import { VStaffView } from "./VStaffView";

export class CStaff extends CUqBase {
    data: {
        newNo: string;
        staffList: Staff[];
    };

    init(...param: any[]): void {
        this.data = this.shallow({
            newNo: undefined,
            staffList: undefined,
        });
    }

    protected async internalStart() {
        await this.loadList();
        this.openVPage(VStaff);
    }

    newStaff = async () => {
        let { BzTicket } = this.uqs;
        let newNo = await BzTicket.IDNO({ ID: BzTicket.Staff });
        this.runInAction(() => {
            this.data.newNo = newNo;
            this.openVPage(VStaffNew);
        });
    }

    onNewSubmit = async (data: Staff) => {
        let { BzTicket } = this.uqs;
        let ret = await BzTicket.Acts(
            {
                staff: [data],
            }
        );
        alert(JSON.stringify(ret));
    }

    private async loadList() {
        let { BzTicket } = this.uqs;
        let staffList = await BzTicket.QueryID<Staff>({
            ID: BzTicket.Staff,
            page: {
                start: 0,
                size: 100,
            }
        });
        this.runInAction(() => {
            this.data.staffList = staffList;
        });
    }

    list = async () => {
        await this.loadList();
        this.openVPage(VStaffList);
    }

    showStaff = async (item: Staff) => {
        this.openVPage(VStaffView);
    }

    async selectStaff() {
        await this.loadList();
        return await this.vCall(VStaffSelect);
    }
}
