import * as React from 'react';
import { observable, IObservableArray, isObservableArray, observe, makeObservable } from 'mobx';
import classNames from 'classnames';
import { uid } from 'tonwa-core';
import { ListBase } from './base';
import { List } from './index';
import { IPageItems } from '../../tool';
import { observer } from 'mobx-react';

export interface SelectableItem {
    selected: boolean;
    item: any;
    labelId: string;
}

export class Selectable extends ListBase {
    _items: SelectableItem[] = null;
    private inputItems: { [uid: string]: HTMLInputElement } = {};

    constructor(list: List) {
        super(list);
        makeObservable(this, {
            _items: observable
        })
        this.buildItems();
        this.listenArraySplice();
    }

    private listenArraySplice() {
        let { items } = this.list.props;
        if (items === undefined) return;
        if (items === null) return;
        let itemsArray: any;
        if (Array.isArray(items) === true) {
            itemsArray = items as any;
        }
        else {
            itemsArray = (items as IPageItems<any>).items;
        }
        if (isObservableArray(items) === true) {
            observe(itemsArray as IObservableArray<any>, (change) => {
                if (change.type === 'splice') {
                    let { index, removedCount, added } = change;
                    let _added = added && added.map(v => {
                        return {
                            selected: false,
                            item: v,
                            labelId: uid()
                        }
                    });
                    this._items.splice(index, removedCount, ..._added);
                    this.buildItems();
                }
            }, true);
        }
    }

    private buildItems = () => {
        let { items, isItemSelected, selectedItems, compare } = this.list.props;
        let itemsArray: any[] | IObservableArray<any>;
        if (items === undefined) {
            this._items = undefined;
            return;
        }
        if (items === null) {
            this._items = null;
            return;
        }

        if (Array.isArray(items) === true) {
            itemsArray = items as any;
        }
        else {
            itemsArray = (items as IPageItems<any>).items;
        }

        if (isItemSelected) {
            let retItems = itemsArray.map(v => {
                return {
                    selected: isItemSelected(v),
                    item: v,
                    labelId: uid()
                };
            });
            this._items = retItems;
        }
        else {
            let comp: ((item: any, selectItem: any) => boolean);
            if (compare === undefined) {
                comp = (item: any, selectItem: any) => item === selectItem;
            }
            else {
                comp = compare;
            }
            let retItems = itemsArray.map(v => {
                //let isObserved = isObservable(v);
                //let obj = isObserved === true? toJS(v) : v;
                //let obj = v;
                let selected = selectedItems === undefined ?
                    false
                    : selectedItems.find(si => comp(v, si)) !== undefined;
                return {
                    selected: selected,
                    item: v,
                    labelId: uid()
                };
            });
            this._items = retItems;
        }
    }

    get items() {
        //if (this._items === undefined) 
        //this.buildItems();
        return this._items;
    }
    private checkAll(on: boolean) {
        for (let i in this.inputItems) this.inputItems[i].checked = on;
        for (let item of this._items) item.selected = on;
    }
    selectAll() {
        //if (this._items) this._items.forEach(v => v.selected = true);
        this.checkAll(true);
        this.list.props.item.onSelect(undefined, true, this.anySelected);
    }
    unselectAll() {
        this.checkAll(false);
        this.list.props.item.onSelect(undefined, false, this.anySelected);
    }

    private get anySelected(): boolean { return this._items.some(v => v.selected) }
    private onSelect(item: SelectableItem, selected: boolean) {
        item.selected = selected;
        this.list.props.item.onSelect(item.item, selected, this.anySelected);
    }

    get selectedItems(): any[] {
        return this._items.filter(v => v.selected === true).map(v => v.item);
    }

    render = (item: SelectableItem, index: number): JSX.Element => {
        let { key } = this.list.props.item;
        return React.createElement(this.row, { item, index, key: key === undefined ? index : key(item) });
    }

    private row = observer((props: { item: SelectableItem, index: number }): JSX.Element => {
        let { item, index } = props;
        let { className } = this.list.props.item;
        let { labelId, selected, item: obItem } = item;
        return <li className={classNames(className)}>
            <div className="d-flex align-items-center px-3">
                <input ref={input => { if (input) this.inputItems[labelId] = input; }}
                    className="" type="checkbox" value="" id={labelId}
                    defaultChecked={selected}
                    onChange={(e) => {
                        this.onSelect(item, e.target.checked)
                    }
                    } />
                <label className="" style={{ flex: 1, marginBottom: 0 }} htmlFor={labelId}>
                    {this.renderContent(obItem, index)}
                </label>
            </div>
        </li>
    })
}
