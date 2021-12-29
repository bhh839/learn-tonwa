import { UqExt as Uq, assign } from './BzTicket';
import * as Customer from './Customer.ui';
import * as ProductPackage from './ProductPackage.ui';
import * as Market from './Market.ui';
import * as PackageVersion from './PackageVersion.ui';
import * as Project from './Project.ui';
import * as Ticket from './Ticket.ui';
import * as TicketType from './TicketType.ui';
import * as Source from './Source.ui';
import * as PackageCustomer from './PackageCustomer.ui';
import * as TicketSheet from './TicketSheet.ui';
import * as SourceCustomer from './SourceCustomer.ui';
import * as TicketNode from './TicketNode.ui';
import * as Staff from './Staff.ui';
import * as SourceCustomerSheet from './SourceCustomerSheet.ui';
import * as TicketState from './TicketState.ui';
import * as TicketAssess from './TicketAssess.ui';
import * as Product from './Product.ui';
	
export function setUI(uq: Uq) {
	assign(uq, 'Customer', Customer);
	assign(uq, 'ProductPackage', ProductPackage);
	assign(uq, 'Market', Market);
	assign(uq, 'PackageVersion', PackageVersion);
	assign(uq, 'Project', Project);
	assign(uq, 'Ticket', Ticket);
	assign(uq, 'TicketType', TicketType);
	assign(uq, 'Source', Source);
	assign(uq, 'PackageCustomer', PackageCustomer);
	assign(uq, 'TicketSheet', TicketSheet);
	assign(uq, 'SourceCustomer', SourceCustomer);
	assign(uq, 'TicketNode', TicketNode);
	assign(uq, 'Staff', Staff);
	assign(uq, 'SourceCustomerSheet', SourceCustomerSheet);
	assign(uq, 'TicketState', TicketState);
	assign(uq, 'TicketAssess', TicketAssess);
	assign(uq, 'Product', Product);
}
export * from './BzTicket';
