import { CUqBase } from "uq-app";
import { VCustomerEdit } from "./VCustomerEdit";
import { VCustomer } from "./VCustomer";
import { VCustomerList } from "./VCustomerList";
import { VCustomerNew } from "./VCustomerNew";
import { VCustomerView } from "./VCustomerView";
import { Customer, ReturnQueryCustomerByIDRet } from "uq-app/uqs/BzTicket";

export class CCustomer extends CUqBase {
    newNo: string;
    status: number;
    customerList: Customer[];
    customer: ReturnQueryCustomerByIDRet;


    protected async internalStart() {
        await this.loadList();
        // let { BzTicket } = this.uqs;
        // this.customerList = await BzTicket.QueryID<Customer>({
        //     ID: BzTicket.Customer,
        //     page: {
        //         start: 0,
        //         size: 100,
        //     }
        // });
        this.openVPage(VCustomer);
    }

    newCustomer = async () => {
        let { BzTicket } = this.uqs;
        this.newNo = await BzTicket.IDNO({ ID: BzTicket.Customer });
        this.status = 1;
        this.openVPage(VCustomerNew);
    }

    onNewSubmit = async (data: Customer) => {
        let { BzTicket } = this.uqs;
        let ret = await BzTicket.Acts(
            {
                customer: [data],
            }
        );
        await this.loadList();
        this.replaceVPage(VCustomer);
    }

    onEditSubmit = async (data: Customer) => {
        let { BzTicket } = this.uqs;
        await BzTicket.UpdateCustomer.submit(
            {
                id: data.id,
                name: data.name,
                tel: data.tel,
                address: data.address,
                vice: data.vice,
                status: 1
            }
        );
        await this.loadList();
        this.replaceVPage(VCustomer);
    }

    list = async () => {
        let { BzTicket } = this.uqs;

        this.customerList = await BzTicket.QueryID<Customer>({
            ID: BzTicket.Customer,
            page: {
                start: 0,
                size: 100,
            }
        });
        this.openVPage(VCustomerList);
    }

    showCustomer = async (item: Customer) => {
        this.openVPage(VCustomerView);
    }

    editCustomer = async (item: Customer) => {
        let { BzTicket } = this.uqs;
        this.customer = await (await BzTicket.QueryCustomerByID.query({ id: item.id })).ret[0];
        this.openVPage(VCustomerEdit);
    }

    private async loadList() {
        let { BzTicket } = this.uqs;
        let customerList = await BzTicket.QueryID<Customer>({
            ID: BzTicket.Customer,
            page: {
                start: 0,
                size: 100,
            }
        });
        this.runInAction(() => {
            this.customerList = customerList;
        });
    }
}
