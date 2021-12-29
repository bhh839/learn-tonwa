import classNames from 'classnames';
import { uid } from 'tonwa-core';
import { ListBase } from './base';

export class Static extends ListBase {
    render = (item: any, index: number): JSX.Element => {
        let { className, key } = this.list.props.item;
        if (typeof item === 'string') {
            let cn = classNames('va-list-gap', 'px-3', 'pt-1');
            return <li key={uid()} className={cn}>{item}</li>;
        }
        return <li key={key === undefined ? index : key(item)} className={classNames(className)}>
            {this.renderContent(item, index)}
        </li>
    }
}
