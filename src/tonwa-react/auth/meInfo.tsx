import * as React from 'react';
import { makeObservable, observable } from 'mobx';
import { Page, ItemSchema, UiSchema, StringSchema, UiTextItem, Edit, ImageSchema, UiImageItem } from '../components';
import { tonwa } from 'tonwa-core';

export class EditMeInfo extends React.Component {
    private schema: ItemSchema[] = [
        { name: 'nick', type: 'string' } as StringSchema,
        { name: 'icon', type: 'image' } as ImageSchema
    ];
    private uiSchema: UiSchema = {
        items: {
            nick: { widget: 'text', label: '别名', placeholder: '好的别名更方便记忆' } as UiTextItem,
            icon: { widget: 'image', label: '头像' } as UiImageItem,
        }
    }
    data: any;

    constructor(props: any) {
        super(props);
        makeObservable(this, {
            data: observable,
        })
        let { nick, icon } = tonwa.user;
        this.data = {
            nick: nick,
            icon: icon,
        }
    }

    private onItemChanged = async (itemSchema: ItemSchema, newValue: any, preValue: any) => {
        //let {name} = itemSchema;        
        //await userApi.userSetProp(name, newValue);
        throw new Error('await userApi.userSetProp(name, newValue);');
        /*
        this.data[name] = newValue;
        let user:any = nav.user;
        user[name] = newValue;
        nav.saveLocalUser();
        */
    }

    render() {
        return <Page header="个人信息">
            <Edit schema={this.schema} uiSchema={this.uiSchema}
                data={this.data}
                onItemChanged={this.onItemChanged} />
        </Page>;
    }
}
