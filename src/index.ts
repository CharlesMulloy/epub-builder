import * as archiver from 'archiver';
import * as path from 'path';
import * as fs from 'fs';
import * as StringBuilder from 'string-builder';
import * as helper from './lib/lib';

var title = '';
var author = '';
var summary = '';
var bookChapters = [];

var date = new Date();
var currentDate = date.getTime();

export function setTitle(titleIn: string) {
    title = titleIn;
}

export function getTitle(): string {
    return title;
}

export function setAuthor(authorIn: string) {
    author = authorIn;
}

export function getAuthor(): string {
    return author;
}

export function setSummary(summaryIn: string) {
    summary = summaryIn;
}

export function getSummary(): string {
    return summary;
}

export function addChapter(title: string, content: string) {
    bookChapters.push({
        title,
        content
    });
}

export function getChapter(chapter = -1) {
    if (chapter === -1)
        return bookChapters;
    else
        return bookChapters[chapter];
}

export function createBook(out: string) {
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
    archive.append(createOPF(), {
        name: `OEBPS/content.opf`
    });

    //Create TOC
    archive.append(createTOC(), {
        name: `OEBPS/toc.ncx`
    });

    //Create Chapters
    for (var i = 0; i < bookChapters.length; i++) {
        archive.append(helper.buildChapter(bookChapters[i].title, bookChapters[i].content), {
            name: `OEBPS/Chapter${i}.html`
        });
    }

    //Finalize book
    archive.finalize();
}

function createOPF(): string {
    var sb = new StringBuilder();

    sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    sb.append("<package xmlns=\"http://www.idpf.org/2007/opf\" unique-identifier=\"BookID\" version=\"2.0\">");
    sb.append("<metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:opf=\"http://www.idpf.org/2007/opf\">");
    sb.append(`<dc:title>${title}</dc:title>`);
    sb.append(`<dc:creator>${author}</dc:creator>`);
    sb.append(`<dc:description>${summary}</dc:description>`);
    sb.append("<dc:language>en</dc:language>");
    sb.append("<dc:identifier id=\"BookID\" opf:scheme=\"UUID\">" + currentDate + "</dc:identifier>");
    sb.append("</metadata>");

    //Begin manifest
    sb.append("<manifest>");
    sb.append("<item id=\"ncx\" href=\"toc.ncx\" media-type=\"application/x-dtbncx+xml\" />");
    for (var i = 0; i < bookChapters.length; i++) {
        sb.append("<item id=\"Chapter" + i + "\" href=\"Chapter" + i + ".html\" media-type=\"application/xhtml+xml\"/>");
    }
    sb.append("</manifest>");

    //Begin Spine
    sb.append("<spine toc=\"ncx\">");
    for (var i = 0; i < bookChapters.length; i++) {
        sb.append("<itemref idref=\"Chapter" + i + "\" />");
    }

    sb.append("</spine></package>");

    return sb.toString();
}

function createTOC(): string {
    var sb = new StringBuilder();
    sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    sb.append("<ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\" version=\"2005-1\">");
    sb.append("<head>");
    sb.append("<meta name=\"dtb:uid\" content=\"" + currentDate + "\"/>");
    sb.append("</head>");
    sb.append("<docTitle>");
    sb.append("<text>" + title + "</text>");
    sb.append("</docTitle>");
    sb.append("<navMap>");

    for (var i = 1; i <= bookChapters.length; i++) {
        sb.append("<navPoint id=\"Chapter" + (i - 1) + ".html\" playOrder=\"" + i + "\">");
        sb.append("<navLabel>");
        sb.append("<text>" + bookChapters[i - 1].title + "</text>");
        sb.append("</navLabel>");
        sb.append("<content src=\"Chapter" + (i - 1) + ".html\" />");
        sb.append("</navPoint>");
    }
    sb.append("</navMap></ncx>");

    return sb.toString();
}
