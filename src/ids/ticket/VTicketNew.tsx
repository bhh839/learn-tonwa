import { CStaff } from "ids/staff";
import { ChangeEvent } from "react";
import { FA, VPage } from "tonwa";
import { CTicket } from ".";

export class VTicketNew extends VPage<CTicket> {
    data: {
        buttonDisabled: boolean;
    };
    private textarea: HTMLTextAreaElement;
    constructor(cTicket: CTicket) {
        super(cTicket);
        this.data = this.shallow({
            buttonDisabled: true,
        });
    }
    header() { return '新建工单' }
    right() {
        return this.react(() => {
            return <button
                disabled={this.data.buttonDisabled}
                className="btn btn-sm btn-success me-2"
                onClick={this.saveTicket}>
                <FA name="paper-plane-o" className="me-1" /> 提交
            </button>;
        });
    }

    content() {
        return <div className="m-3">
            <div className="mb-3 row">
                <label htmlFor="staticStaff" className="col-sm-2 col-form-label text-right">经办人</label>
                <div className="col-sm-10">
                    {
                        this.react(() => {
                            let { selectedStaff: staff } = this.controller.data;
                            let placeholder: string;
                            let value: string;
                            if (staff) {
                                value = staff.name;
                            }
                            else {
                                placeholder = ' 点击选择经办人';
                            }
                            return <input type="text" readOnly={true}
                                placeholder={placeholder}
                                onClick={this.onSelectStaff}
                                value={value}
                                className="cursor-pointer form-control-plaintext bg-light border px-2" id="staticStaff" />
                        })
                    }
                </div>
            </div>
            <textarea ref={tt => this.textarea = tt}
                className="w-100 rounded form-control"
                onChange={this.onChange}
                style={{ height: '75vh', }} />
        </div>
    }

    private saveTicket = async () => {
        await this.controller.saveTicket(this.textarea.value);
        this.closePage();
    }

    private onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        this.runInAction(() => {
            this.data.buttonDisabled = e.currentTarget.value.trim().length === 0;
        });
    }

    private onSelectStaff = async () => {
        let cStaff = this.controller.cApp.newC(CStaff);
        let staff = await cStaff.selectStaff();
        this.controller.setStaff(staff);
    }
}