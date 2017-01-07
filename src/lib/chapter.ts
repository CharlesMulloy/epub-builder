export class Chapter {
  //The title of the chapter.
  title: string;
  //The content of the chapter.
  content: string;
  constructor(chapterTitle: string, chapterContent: string) {
    this.title = chapterTitle;
    this.content = chapterContent;
  }
}
