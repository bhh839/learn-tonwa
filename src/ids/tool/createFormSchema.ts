import { UqID } from "tonwa-core";
import { ButtonSchema, FieldItem, IDXEntity, UiItem, UiSchema } from "tonwa";

export function createFormSchema(ID: UqID<any> & IDXEntity<any>, uiItems: { [name: string]: UiItem }): {
    schema: (ButtonSchema | FieldItem)[];
    uiSchema: UiSchema
} {
    let { ui } = ID;
    let button: ButtonSchema = {
        name: 'submit',
        type: 'submit',
    };
    let schema = [...ui.fieldArr, button];
    let uiSchema: UiSchema;
    if (uiItems) {
        let items: { [name: string]: UiItem } = {}
        for (let i in uiItems) {
            items[i] = {
                ...ui.fields[i],
                ...uiItems[i],
            } as UiItem;
        }
        uiSchema = { items };
    };
    return {
        schema,
        uiSchema,
    }
}
