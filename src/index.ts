import * as archiver from 'archiver';
import * as path from 'path';
import * as fs from 'fs';
import * as StringBuilder from 'string-builder';
import * as mime from 'mime';
import {buildChapter} from './lib/lib';
import {Asset} from './lib/asset';
import {Chapter} from './lib/chapter';

export class EpubBuilder {
    private _title: string = '';
    private _author: string = '';
    private _summary: string = '';
    private _uuid: string = '';
    private _bookChapters = [];
    private _assets: Asset[] = [];
    private _coverImage: Asset = null;
    private _currentDate = new Date().getTime();

    get title() : string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get author(): string {
        return this._author;
    }

    set author(value: string) {
        this._author = value;
    }

    get summary(): string {
        return this._summary;
    }

    set summary(value: string) {
        this._summary = value;
    }

    set UUID(value: string) {
        this._uuid = value;
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
        sb.append(`<dc:title>${this._title}</dc:title>`);
        sb.append(`<dc:creator>${this._author}</dc:creator>`);
        sb.append(`<dc:description>${this._summary}</dc:description>`);
        sb.append("<dc:language>en</dc:language>");

        //Generates UUID if the user did not set one.
        if(this._uuid.length < 1 )
            sb.append(`<dc:identifier id="BookID" opf:scheme="UUID">${this._currentDate}</dc:identifier>`);
        //Uses the user's SSID if set.
        else
            sb.append(`<dc:identifier id="BookID" opf:scheme="UUID"> ${this._uuid} </dc:identifier>`);

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
        sb.append(`<text>${this._title}</text>`);
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
}
