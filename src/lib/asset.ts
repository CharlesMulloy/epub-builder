//Used to get the mimetype from the asset.
import { lookup } from 'mime';
//Used to get the file name of the asset
import { basename } from 'path';


export class Asset {
    private _fileName: string;
    private _mimetype: string;
    private _group: string = null;
    public id: string = null;

    constructor(fileName: string, mimetype: string = null) {
        this._fileName = fileName;
        this._mimetype = mimetype || lookup(fileName);
    }

    get fileName() {
        return this._fileName;
    }

    get mimetype() {
        return this._mimetype;
    }

    get group() : string {
        if (this._group !== null) {
            return this._group;
        }
        const idx = this.mimetype.indexOf('/');
        if (idx >= 0) {
            return this.mimetype.substr(0, idx);
        }
        return this.mimetype;
    }

    set group(value: string) {
        this._group = value;
    }
}

export abstract class TextAsset extends Asset {
    /**
     * The asset value which should store into epub file.
     *
     * @readonly
     * @abstract
     * @type {string}
     * @memberof TextAsset
     */
    abstract getTextDocument(): string;
}


/**
 * The file should target to a physical file. like image.
 *
 * @export
 * @class FileRefAsset
 * @extends {Asset}
 */
export class FileRefAsset extends Asset {
    private _path: string;

    constructor(path: string, fileName: string = null, mimetype: string = null) {
        super(fileName || basename(path), mimetype);
        this._path = path;
    }

    get path() {
        return this._path;
    }
}

export class ImageFileRefAsset extends FileRefAsset {
    constructor(path: string, fileName: string = null) {
        super(path, fileName);
        this.group = 'image';
    }
}
