import { CUqBase } from "uq-app";
import { VTicketTypeList } from "./VTicketTypeList";

export class CTicketType extends CUqBase {
    ticketTypes = [
        {
            name: '客户需求点',
            arr: [
                {
                    name: '经办',
                },
                {
                    name: '验收',
                }
            ]
        }
    ];

    list: any[];

    protected async internalStart(param?: any, ...params: any[]): Promise<void> {
        let { BzTicket } = this.uqs;
        this.list = await BzTicket.QueryID({
            ID: BzTicket.TicketType,
            page: {
                start: 0,
                size: 1000,
            }
        })
        this.openVPage(VTicketTypeList);
    }

    saveTicketTypes = async () => {
        let retIds: number[] = [];
        for (let tt of this.ticketTypes) {
            let ret = await this.uqs.BzTicket.SaveTicketType.submitReturns({
                typeName: tt.name,
                typeVice: undefined,
                states: tt.arr.map(v => ({
                    stateName: v.name,
                    stateVice: undefined,
                })),
            });
            retIds.push(ret.ret[0].id);
        }
        alert(JSON.stringify(retIds));
    }
}
