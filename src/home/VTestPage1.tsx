import { CHome } from "home";
import { VPage } from "tonwa";

export class VTestPage1 extends VPage<CHome> {
    header() {
        return '页面表头1'
    }
    content() {
        return <div className="p-3">
            测试页面1
        </div>;
    }
}