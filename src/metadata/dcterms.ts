import { Meta } from './meta';

export class DctermsModified extends Meta {
    toXmlComponent() : string {
        const now = new Date();
        const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
        return `<meta property="dcterms:modified">${utc.toISOString()}</meta>`;
    }
}