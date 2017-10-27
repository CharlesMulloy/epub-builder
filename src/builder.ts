import * as archiver from 'archiver';
import * as path from 'path';
import * as fs from 'fs';
import * as StringBuilder from 'string-builder';
import * as mime from 'mime';
import { buildChapter } from './lib/lib';
import { Asset } from './lib/asset';
import { Chapter } from './lib/chapter';
import { Meta } from './metadata/meta';
import { Identifier, Title, Creator, Description, Language } from './metadata/dc';

export class EpubBuilder {
    private _bookChapters = [];
    private _assets: Asset[] = [];
    private _coverImage: Asset = null;
    private _currentDate = new Date().getTime();
    private _metadata: Meta[] = [];

    constructor() {
        this.appendMeta(new Identifier(this._currentDate.toString()));
        this.appendMeta(new Title(''));
        this.appendMeta(new Creator(''));
        this.appendMeta(new Description(''));
        this.appendMeta(new Language('en'));
    }

    get title() : string {
        for (const meta of this._metadata) {
            if (meta instanceof Title) {
                return meta.Value;
            }
        }
        return null; // The book should contains default Title
    }

    set title(value: string) {
        for (const meta of this._metadata) {
            if (meta instanceof Title) {
                meta.Value = value;
                return;
            }
        }
    }

    get author(): string {
        for (const meta of this._metadata) {
            if (meta instanceof Creator) {
                return meta.Value;
            }
        }
        return null; // The book should contains default Creator
    }

    set author(value: string) {
        for (const meta of this._metadata) {
            if (meta instanceof Creator) {
                meta.Value = value;
                return;
            }
        }
    }

    get summary(): string {
        for (const meta of this._metadata) {
            if (meta instanceof Description) {
                return meta.Value;
            }
        }
        return null; // The book should contains default Description
    }

    set summary(value: string) {
        for (const meta of this._metadata) {
            if (meta instanceof Description) {
                meta.Value = value;
                return;
            }
        }
    }

    set UUID(value: string) {
        for (const meta of this._metadata) {
            if (meta instanceof Identifier) {
                meta.Value = value;
                return;
            }
        }
    }

    public appendMeta(meta: Meta) {
        this._metadata.push(meta);
    }

    public addChapter(title: string, content: string) {
        this._bookChapters.push(new Chapter(title, content));
    }

    public getChapter(chapter = -1): any {
        if (chapter === -1)
            return this._bookChapters;
        else
            return this._bookChapters[chapter];
    }

    public addCoverImage(target: string): void {
        this._coverImage = new Asset(target);
        this._assets.push(this._coverImage);
    }

    public addAsset(target: string): void{
        this._assets.push(new Asset(target));
    }

    public createBook(out: string) {
        var outputFolder = path.join(process.cwd(), out + ".epub");
        var output = fs.createWriteStream(outputFolder);
        var archive = archiver('zip', {
            store: true
        });
        archive.pipe(output);

        //Create MIME
        archive.append('application/epub+zip', {
            name: 'mimetype'
        });

        //Create Container
        archive.append(`<?xml version=\"1.0\"?>
            <container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">
            <rootfiles>
            <rootfile full-path=\"OEBPS/content.opf\" media-type=\"application/oebps-package+xml\"/>
            </rootfiles></container>`, {
                name: `META-INF/container.xml`
            });

        //Create OPF
        archive.append(this.createOPF(), {
            name: `OEBPS/content.opf`
        });

        //Create TOC
        archive.append(this.createTOC(), {
            name: `OEBPS/toc.ncx`
        });

        //Create Chapters
        for (var i = 0; i < this._bookChapters.length; i++) {
            archive.append(buildChapter(this._bookChapters[i].title, this._bookChapters[i].content), {
                name: `OEBPS/Chapter${i}.html`
            });
        }

        //Add assets
        for (var asset of this._assets) {
            archive.append(fs.createReadStream(asset.path), {
                name: `OEBPS/${asset.fileName}`
            });
        }

        //Finalize book
        archive.finalize();
    }

    private createOPF(): string {
        const item2IdMap = {};
        for (let i = 0; i < this._assets.length; i++) {
            const item = this._assets[i];
            const id = `${item.idPrefix}-${i}`;
            item2IdMap[item.fileName] = id;
        }

        var sb = new StringBuilder();

        sb.append(`<?xml version="1.0" encoding="UTF-8"?>`);
        sb.append(`<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">`);
        sb.append(`<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">`);

        for (const meta of this._metadata) {
            sb.append(meta.toXmlComponent());
        }

        //Add cover image if it is specified.
        if (this._coverImage !== null) {
            sb.append(`<meta name="cover" content="${item2IdMap[this._coverImage.fileName]}"/>`);
        }
        sb.append(`</metadata>`);

        //Begin manifest
        sb.append(`<manifest>`);
        sb.append(`<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />`);
        for (var i = 0; i < this._bookChapters.length; i++) {
            sb.append(`<item id="Chapter${i}" href="Chapter${i}.html" media-type="application/xhtml+xml"/>`);
        }
        for (let i = 0; i < this._assets.length; i++) {
            const item = this._assets[i];
            sb.append(`<item id="${item2IdMap[item.fileName]}" href="${item.fileName}" media-type="${item.mimetype}"/>`);
        }
        sb.append(`</manifest>`);

        //Begin Spine
        sb.append(`<spine toc="ncx">`);
        for (var i = 0; i < this._bookChapters.length; i++) {
            sb.append(`<itemref idref="Chapter${i}"/>`);
        }
        sb.append(`</spine></package>`);

        return sb.toString();
    }

    private createTOC(): string {
        var sb = new StringBuilder();
        sb.append(`<?xml version="1.0" encoding="UTF-8"?>`);
        sb.append(`<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">`);
        sb.append(`<head>`);
        sb.append(`<meta name="dtb:uid" content="${this._currentDate}"/>`);
        sb.append(`</head>`);
        sb.append(`<docTitle>`);
        sb.append(`<text>${this.title}</text>`);
        sb.append(`</docTitle>`);
        sb.append(`<navMap>`);

        for (var i = 1; i <= this._bookChapters.length; i++) {
            sb.append(`<navPoint id="Chapter${i - 1}.html" playOrder="${i}">`);
            sb.append(`<navLabel>`);
            sb.append(`<text>${this._bookChapters[i - 1].title}</text>`);
            sb.append(`</navLabel>`);
            sb.append(`<content src="Chapter${(i - 1)}.html" />`);
            sb.append(`</navPoint>`);
        }
        sb.append(`</navMap></ncx>`);

        return sb.toString();
    }

    /* Deprecated */

    /**
     * [Deprecated] use `this.title`.
     *
     * @param {string} value
     * @returns
     * @memberof EpubBuilder
     */
    getTitle(value: string) { return this.title; }

    /**
     * [Deprecated] use `this.title`.
     *
     * @param {string} value
     * @memberof EpubBuilder
     */
    setTitle(value: string) { this.title = value; }

    /**
     * [Deprecated] use `this.author`.
     *
     * @param {string} value
     * @memberof EpubBuilder
     */
    setAuthor(value: string) { this.author = value; }

    /**
     * [Deprecated] use `this.author`.
     *
     * @returns {string}
     * @memberof EpubBuilder
     */
    getAuthor(): string { return this.author; }

    /**
     * [Deprecated] use `this.summary`.
     *
     * @param {string} value
     * @memberof EpubBuilder
     */
    setSummary(value: string) { this.summary = value; }

    /**
     * [Deprecated] use `this.summary`.
     *
     * @returns {string}
     * @memberof EpubBuilder
     */
    getSummary(): string { return this.summary; }

    /**
     * [Deprecated] use `this.UUID`.
     *
     * @param {string} value
     * @memberof EpubBuilder
     */
    setUUID(value: string) { this.UUID = value; }
}
