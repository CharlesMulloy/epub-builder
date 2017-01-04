//Creates a string that will be put into the file for each chapter that is created.
export function buildChapter(title: string, content: string): string {
    return `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body>${content}</body></html>`;
}
