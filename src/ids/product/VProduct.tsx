import { FA, VPage } from "tonwa";
import { List, LMR } from "tonwa-react";
import { Customer } from "uq-app/uqs/BzTicket";
import { CProduct } from ".";

export class VProduct extends VPage<CProduct> {
    header() { return '产品管理'; }
    right() {
        return <button className="btn btn-sm btn-success me-2">
            <FA name="plus" />
        </button>;
    }
    content() {
        
        return <div>
            
        </div>;
        
    }

    private renderItem = (item: Customer, index: number) => {
        let { no, name, vice } = item
        return <div className="px-3 py-2 d-block">
            <LMR left={<b>{name}</b>} right={<small className="text-muted">{no}</small>}></LMR>
            <div className="small text-muted">{vice}</div>
        </div>
    };
}
