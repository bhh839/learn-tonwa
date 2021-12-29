import { createFormSchema } from "ids/tool/createFormSchema";
import { Context, Form, UiButton, UiTextItem, VPage } from "tonwa";
import { UiRadio } from "tonwa-react";
import { CCustomer } from "./CCustomer";

export class VCustomerNew extends VPage<CCustomer> {
    header() { return '新建客户' }
    content() {
        let { BzTicket } = this.controller.uqs;
        let { Customer } = BzTicket;
        let { schema, uiSchema } = createFormSchema(Customer, {
            no: {
                widget: 'text',
                label: '编号',
                placeholder: '请输入唯一编号',
                defaultValue: this.controller.newNo,
            } as UiTextItem,
            name: {
                widget: 'text',
                label: '名称',
            } as UiTextItem,
            vice: {
                widget: 'text',
                label: '备注',
            } as UiTextItem,
            tel: {
                widget: 'text',
                label: '电话',
            } as UiTextItem,
            address: {
                widget: 'text',
                label: '地址',
            } as UiTextItem,
            status: {
                widget: 'radio',
                label: '状态',
                list: [{ value: 1, title: '启用' }, { value: 0, title: '禁用' }],
                defaultValue: this.controller.status,
                disabled: true,
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
                onButtonClick={(name: string, context: Context) => this.controller.onNewSubmit(context.data)} />
        </div>;
    }
}
