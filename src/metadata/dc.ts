import xmlescape = require('xml-escape');
import { ValueMeta, StringMeta } from './meta';

export class Identifier extends ValueMeta {
    toXmlComponent(): string {
        return `<dc:identifier id="BookID" opf:scheme="UUID">${this.Value}</dc:identifier>`;
    }
}

export class Title extends StringMeta {
    get TagName(): string {
        return 'dc:title'
    }
}

export class Creator extends StringMeta {
    get TagName(): string {
        return 'dc:creator'
    }
}

export class Description extends StringMeta {
    get TagName(): string {
        return 'dc:description'
    }
}

export class Language extends StringMeta {
    get TagName(): string {
        return 'dc:language'
    }
}

export class Subject extends StringMeta {
    get TagName(): string {
        return 'dc:subject'
    }
}

export class Publisher extends StringMeta {
    get TagName(): string {
        return 'dc:publisher'
    }
}
