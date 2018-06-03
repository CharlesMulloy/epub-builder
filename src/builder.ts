import * as archiver from 'archiver';
import * as path from 'path';
import * as fs from 'fs';
import * as StringBuilder from 'string-builder';
import * as mime from 'mime';
import { Asset, StringAsset, FileRefAsset, ImageFileRefAsset } from './lib/asset';
import { XHtmlDocument, Chapter } from './lib/html';
import { Meta } from './metadata/meta';
import { Identifier, Title, Creator, Description, Language } from './metadata/dc';

export class EpubBuilder {
    private _assets: Asset[] = [];
    private _coverImage: ImageFileRefAsset = null;
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
        const index = this.getChapter().length;
        const chapter = new Chapter(`chapter-${index}.xhtml`);
        chapter.title = title;
        chapter.content = content;
        this._assets.push(chapter);
    }

    public getChapter(chapter = -1): any {
        const chapters = this._assets.filter(z => z instanceof XHtmlDocument);
        if (chapter === -1)
            return chapters;
        else
            return chapters[chapter];
    }

    public addCoverImage(path: string): void {
        const asset = new ImageFileRefAsset(path);
        this._coverImage = asset;
        this._assets.push(asset);
    }

    public addAsset(asset: Asset | string): void{
        if (asset instanceof Asset) {
            this._assets.push(asset);
        } else {
            this._assets.push(new FileRefAsset(asset));
        }
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

        this._assignId();

        //Create OPF
        archive.append(this.createOPF(), {
            name: `OEBPS/content.opf`
        });

        //Create TOC
        archive.append(this.createTOC(), {
            name: `OEBPS/toc.ncx`
        });

        // Add assets
        for (const asset of this._assets) {
            if (asset instanceof FileRefAsset) {
                archive.append(fs.createReadStream(asset.path), {
                    name: `OEBPS/${asset.fileName}`
                });
            } else if (asset instanceof StringAsset) {
                archive.append(asset.value(), {
                    name: `OEBPS/${asset.fileName}`
                });
            } else {
                // should not contains other asset.
                throw new Error("Method not implemented.");
            }
        }

        //Finalize book
        archive.finalize();
    }

    private _assignId() {
        const groups = {};
        for (const asset of this._assets) {
            if (asset.id === null) {
                const ls = groups[asset.group] || [];
                if (ls.length === 0) {
                    groups[asset.group] = ls;
                }
                asset.id = `${asset.group}-${ls.length}`;
                ls.push(asset);
            }
        }
    }

    private createOPF(): string {
        var sb = new StringBuilder();

        sb.append(`<?xml version="1.0" encoding="UTF-8"?>`);
        sb.append(`<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">`);
        sb.append(`<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">`);

        for (const meta of this._metadata) {
            sb.append(meta.toXmlComponent());
        }

        //Add cover image if it is specified.
        if (this._coverImage !== null) {
            sb.append(`<meta name="cover" content="${this._coverImage.id}"/>`);
        }
        sb.append(`</metadata>`);

        //Begin manifest
        sb.append(`<manifest>`);
        sb.append(`<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />`);
        for (const asset of this._assets) {
            sb.append(`<item id="${asset.id}" href="${asset.fileName}" media-type="${asset.mimetype}"/>`);
        }
        sb.append(`</manifest>`);

        //Begin Spine
        sb.append(`<spine toc="ncx">`);
        for (const asset of this._assets) {
            if (asset instanceof XHtmlDocument) {
                sb.append(`<itemref idref="${asset.id}"/>`);
            }
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

        const sections = this._assets.filter(z => z instanceof XHtmlDocument);
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i] as XHtmlDocument;
            sb.append(`<navPoint id="${section.id}" playOrder="${i + 1}">`);
            sb.append(`<navLabel>`);
            sb.append(`<text>${section.title}</text>`);
            sb.append(`</navLabel>`);
            sb.append(`<content src="${section.fileName}" />`);
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
