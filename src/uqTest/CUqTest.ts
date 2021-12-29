import { CUqBase } from "uq-app";
import { Customer } from "uq-app/uqs/BzTicket";
import { VCustomerEdit } from "./VCustomerEdit";
import { VUqTest } from "./VUqTest";

export class CUqTest extends CUqBase {
    protected async internalStart() {
        this.openVPage(VUqTest);
    }

    newCustomer = async (customer: Customer) => {
        customer = {
            no: '333',
            name: 'jk1',
            vice: 'jk1 test',
            tel: '13962854126',
            address: 'NanTong JS',
            status: 1
        }
        // this.openVPage(VCustomerNew);
        let { BzTicket } = this.uqs;
        let ret = await BzTicket.Acts({
            customer: [customer],
        });
        alert('已保存 ' + JSON.stringify(ret));
    }

    editCustomer = async (customer: Customer) => {
        this.openVPage(VCustomerEdit);
    }

    listCustomer = async () => {
        let { BzTicket } = this.uqs;
        let ret = await BzTicket.ID({
            IDX: BzTicket.Customer,
            id: [1, 2, 3, 4],
        });
        alert('列表 ' + JSON.stringify(ret));
    }

    loadTvCustomer = async () => {
        let { BzTicket } = this.uqs;
        let ret = await BzTicket.IDTv([-1, -2, -3]);
        alert('tv列表 ' + JSON.stringify(ret));
    }

    changeCustomer = async () => {
        await this.uqs.BzTicket.UpdateCustomer.submit({ id: 4, name: '周杰伦', tel: '13652148457', address: '中国台湾', vice: 'test change vice', status: 1 });
        alert('完成');
    }
}
