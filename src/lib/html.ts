import { StringAsset } from './asset';
import { buildChapter } from './lib';

export class XHtmlDocument extends StringAsset {
    private _content: string;

    constructor(fileName: string) {
        super(fileName, 'application/xhtml+xml');
        this.group = 'section';
    }

    /**
     * The raw html string.
     *
     * @type {string}
     * @memberof XHtmlDocument
     */
    get content(): string {
        return this._content;;
    }

    set content(val: string) {
        this._content = val;
    }
}

export class CSSDocument extends StringAsset {
    private _content: string;

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
    get content(): string {
        return this._content;;
    }

    set content(val: string) {
        this._content = val;
    }
}
