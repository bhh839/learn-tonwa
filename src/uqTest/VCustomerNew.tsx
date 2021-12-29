import { Form, VPage } from "tonwa";
import { CUqTest } from "uqTest";

export class VCustomerNew extends VPage<CUqTest> {

    content() {
        let { BzTicket } = this.controller.uqs;
        let { Customer } = BzTicket;
        //let {ui} = Customer;
        /*
        return <Form fieldLabelSize={2} formData={param}
        schema={schema}
        uiSchema={uiSchema}
        onButtonClick={this.onSubmit}  />;
        */
        return <div>VCustomerNew</div>;
    }
}