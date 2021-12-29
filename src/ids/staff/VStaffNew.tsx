import { createFormSchema } from "ids/tool/createFormSchema";
import { Context, Form, UiButton, UiTextItem, VPage } from "tonwa";
import { CStaff } from "./CStaff";

export class VStaffNew extends VPage<CStaff> {
    header() { return '新建客户' }
    content() {
        let { BzTicket } = this.controller.uqs;
        let { Staff } = BzTicket;
        let { schema, uiSchema } = createFormSchema(Staff, {
            no: {
                widget: 'text',
                label: '编号',
                placeholder: '请输入唯一编号',
                defaultValue: this.controller.data.newNo
            } as UiTextItem,
            name: {
                widget: 'text',
                label: '名称',
            } as UiTextItem,
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
