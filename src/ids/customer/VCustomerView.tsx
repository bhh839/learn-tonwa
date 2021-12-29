import { VPage } from "tonwa";
import { CCustomer } from "./CCustomer";

export class VCustomerView extends VPage<CCustomer> {
    header() { return '编辑客户' }

    content() {
        //let { BzTicket } = this.controller.uqs;
        //let { Customer } = BzTicket;
        //let {ui} = Customer;
        /*
        return <Form fieldLabelSize={2} formData={param}
        schema={schema} 
        uiSchema={uiSchema}
        onButtonClick={this.onSubmit}  />;
        */
        return <div>VCustomerEdit</div>;
    }
}