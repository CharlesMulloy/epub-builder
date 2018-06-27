import xmlescape = require('xml-escape');
import * as StringBuilder from 'string-builder';

import { XHtmlDocument } from '../lib/html';

let INC_ID = 0;

export class NavPoint {
    private _subNavPoints: NavPoint[] = null;
    public PlayOrder: number = 0;
    public Id: string = `NAV_POINT_${INC_ID++}`;
    public LabelText: string = 'NAV_POINT_LABEL';
    public ContentSrc: string = null;

    constructor() {
    }

    addSubNavPoint(navPoint) {
        if (this._subNavPoints === null) {
            this._subNavPoints = [];
        }
        this._subNavPoints.push(navPoint);
    }

    get SubNavPoints(): NavPoint[] | null {
        return this._subNavPoints;
    }
}

export class TocBuilder {
    private _navPoints: NavPoint[] = [];
    public UUID: string;
    public Title: string;

    constructor() {

    }

    addNavPoint(navPoint: NavPoint) {
        this._navPoints.push(navPoint);
    }

    toXmlDocument() {
        const uuid = this.UUID;
        if (!uuid) {
            throw new Error('Missing required UUID.')
        }
        const title = this.Title || '';

        var sb = new StringBuilder();
        sb.append(`<?xml version="1.0" encoding="UTF-8"?>`);
        sb.append(`<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">`);
        sb.append(`<head>`);
        sb.append(`<meta name="dtb:uid" content="${uuid}"/>`);
        sb.append(`</head>`);
        sb.append(`<docTitle>`);
        sb.append(`<text>${title}</text>`);
        sb.append(`</docTitle>`);
        sb.append(`<navMap>`);

        function addNavPointComponent(navPoint: NavPoint) {
            sb.append(`<navPoint id="${navPoint.Id}" playOrder="${navPoint.PlayOrder}">`);
            sb.append(`<navLabel>`);
            sb.append(`<text>${xmlescape(navPoint.LabelText)}</text>`);
            sb.append(`</navLabel>`);
            sb.append(`<content src="${xmlescape(navPoint.ContentSrc)}" />`);
            if (navPoint.SubNavPoints) {
                navPoint.SubNavPoints.forEach(z => addNavPointComponent(z));
            }
            sb.append(`</navPoint>`);
        }

        for (const navPoint of this._navPoints) {
            addNavPointComponent(navPoint);
        }

        sb.append(`</navMap></ncx>`);

        return sb.toString();
    }
}
