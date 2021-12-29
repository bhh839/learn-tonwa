//=== UqApp builder created on Mon Dec 27 2021 16:14:30 GMT+0800 (中国标准时间) ===//
import * as BzTicket from './BzTicket';

export interface UQs {
	BzTicket: BzTicket.UqExt;
}

export * as BzTicket from './BzTicket';

export function setUI(uqs:UQs) {
	BzTicket.setUI(uqs.BzTicket);
}
