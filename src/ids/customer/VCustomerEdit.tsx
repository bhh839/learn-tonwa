import { createFormSchema } from "ids/tool/createFormSchema";
import { VPage } from "tonwa";
import { Context, Form, UiButton, UiRadio, UiTextItem } from "tonwa-react";
import { CCustomer } from "./CCustomer";

export class VCustomerEdit extends VPage<CCustomer> {
    header() { return '编辑客户' }

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

        let { schema, uiSchema } = createFormSchema(Customer, {
            no: {
                widget: 'text',
                label: '编号',
                // placeholder: '请输入唯一编号',
                defaultValue: this.controller.customer.no
            } as UiTextItem,
            name: {
                widget: 'text',
                label: '名称',
                defaultValue: this.controller.customer.name
            } as UiTextItem,
            tel: {
                widget: 'text',
                label: '电话',
                defaultValue: this.controller.customer.tel
            } as UiTextItem,
            address: {
                widget: 'text',
                label: '地址',
                defaultValue: this.controller.customer.address
            } as UiTextItem,
            vice: {
                widget: 'text',
                label: '备注',
                defaultValue: this.controller.customer.vice
            } as UiTextItem,
            status: {
                widget: 'radio',
                label: '状态',
                list: [{ value: 1, title: '启用' }, { value: 0, title: '禁用' }],
                defaultValue: this.controller.customer.status,
            } as UiRadio,
            submit: {
                name: 'submit',
                widget: 'button',
                label: '提交',
                className: 'btn btn-success'
            } as UiButton
        });

        return <div className="p-3">
            <Form fieldLabelSize={2} formData={undefined}
                schema={schema}
                uiSchema={uiSchema}
                onButtonClick={(name: string, context: Context) => this.controller.onEditSubmit(context.data)} />
        </div>;
    }
}