import { TextAsset } from './asset';
import { buildChapter } from './lib';

export class XHtmlDocument extends TextAsset {
    private _html: string;
    public title: string = '';

    constructor(fileName: string) {
        super(fileName, 'application/xhtml+xml');
        this.group = 'section';
    }

    getTextDocument() : string {
        return this._html;
    }

    /**
     * The raw html string.
     *
     * @type {string}
     * @memberof XHtmlDocument
     */
    get html(): string {
        return this._html;;
    }

    set html(val: string) {
        this._html = val;
    }
}

export class Chapter extends XHtmlDocument {
    private _content: string;

    constructor(fileName: string) {
        super(fileName);
        this.group = 'chapter';
    }

    getTextDocument() : string {
        return buildChapter(this.title, this._content);
    }

    get content() {
        return this._content;
    }

    set content(value: string) {
        this._content = value;
    }

    get html(): string {
        throw new Error('Chapter does not support html property.');
    }

    set html(val: string) {
        throw new Error('Chapter does not support html property.');
    }
}

export class CSSDocument extends TextAsset {
    public content: string;

    constructor(fileName: string) {
        super(fileName, 'text/css');
        this.group = 'css';
    }

    /**
     * The raw css string.
     *
     * @type {string}
     * @memberof XHtmlDocument
     */
    getTextDocument(): string {
        return this.content;;
    }
}
