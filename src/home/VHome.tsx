import { FA, LMR, VPage } from "tonwa";
import { CHome } from "./CHome";
//import logo from '../logo.svg';
import '../App.css';
import { CCustomer } from "ids/customer";
import { CProduct } from "ids/product";
import { CStaff } from "ids/staff";
import { CTicketType } from "ids/ticket-type";

interface Row {
	caption: string;
	onClick: () => void;
}
export class VHome extends VPage<CHome> {
	private rows: Row[] = [
		{
			caption: '客户管理',
			onClick: () => this.controller.startController(CCustomer),
		},
		{
			caption: '产品管理',
			onClick: () => this.controller.startController(CProduct),
		},
		{
			caption: '职员管理',
			onClick: () => this.controller.startController(CStaff),
		},
		{
			caption: '工单类型',
			onClick: () => this.controller.startController(CTicketType),
		},
		null,
		{
			caption: '新建工单',
			onClick: this.controller.cApp.cTicket.newTicket,
		}
	];

	header() { return '首页' }
	content() {
		return <div className="App">
			<div className="mt-2">
				{this.rows.map((v, index) => {
					if (v === null) return <div key={index} className="my-3" />;
					let { caption, onClick } = v;
					return <LMR key={index}
						className="cursor-pointer py-2 px-3 bg-white border-bottom justify-content-start"
						left={<div><FA className="me-3 text-primary" name="hand-o-right" fixWidth={true} />{caption}</div>}
						right={<FA name="angle-right" />}
						onClick={onClick}>
					</LMR>;
				})}
				<div className="my-3">
					{this.controller.cApp.cTicket.renderMyTickets()}
				</div>
			</div>
		</div>;
	}
}

/*
		<header className="App-header">
			<p>
				<span className="text-success">tonwa</span> + <span className="text-primary">uq</span> = UI + DB
			</p>
			<div className="mb-3 h6 text-warning">
				编程
				<FA name="handshake-o" size="lg" className="text-danger mx-2" />
				开心
			</div>
		</header>
		<div className="border px-3 py-3 bg-white d-flex align-items-start">
			<button className="btn btn-primary me-3"
				onClick={this.controller.showUqTest}>测试UQ操作</button>
		</div>
		<div className="border px-3 py-3 bg-white d-flex align-items-start">
			<button className="btn btn-primary me-3"
				onClick={this.controller.showTestPage1}>测试页1</button>
			<button className="btn btn-success me-3"
				onClick={this.controller.showTestPage2}>测试页2</button>
			<button className="btn btn-danger me-3"
				onClick={this.controller.showTestPage3}>测试页3</button>
		</div>
		<img src={logo} className="App-logo" alt="logo" />
		<ul className="text-left my-3 mr-3">
			{this.items.map((v, index) => <li key={index} className="my-2">{v}</li>)}
		</ul>
*/
