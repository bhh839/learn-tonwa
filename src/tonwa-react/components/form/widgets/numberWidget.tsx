//import * as React from 'react';
import { TextWidget } from './textWidget';
import { NumBaseSchema } from '../../schema';
import { RuleInt, RuleNum } from '../../inputRules';

export class NumberWidget extends TextWidget {
    protected inputType = 'number';
    protected get itemSchema(): NumBaseSchema {return this._itemSchema as NumBaseSchema};

    protected buildRules() {
        super.buildRules();
        let res = this.context.form.res;
        let {min, max} = this.itemSchema;
        this.rules.push(
            this.itemSchema.type === 'integer'?
            new RuleInt(res, min, max) :
            new RuleNum(res, min, max)
        );
    }

    protected parse(value:any):any {
        switch (typeof value) {
            default: return;
            case 'undefined': return;
            case 'number': return value;
            case 'string':
                if ((value as string).trim().length === 0) return;
                return Number(value);
        }
    }
}
