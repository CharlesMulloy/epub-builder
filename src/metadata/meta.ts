import xmlescape = require('xml-escape');

export abstract class Meta {
    abstract toXmlComponent() : string;
}

export abstract class ValueMeta extends Meta {
    private _value : string = '';

    constructor(value : string = null) {
        super();
        this._value = value;
    }

    get Value() {
        return this._value;
    }

    set Value(val) {
        this._value = val;
    }
}

export abstract class StringMeta extends ValueMeta {

    abstract get TagName() : string;

    toXmlComponent(): string {
        return `<${this.TagName}>${xmlescape(this.Value)}</${this.TagName}>`;
    }
}
