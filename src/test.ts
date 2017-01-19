var book = require("./index");
book.setTitle("This is a title");
book.setAuthor("This is the author");
book.setSummary("This is the summary");
var testChapters = [{
    'title': "this is title 1",
    'content': "This is the content for chapter 1."
}, {
    'title': "this is title 2",
    'content': "This is the content for chapter 2"
}, {
    'title': "this is title 3",
    'content': "This is the content for chapter 3"
}, {
    'title': "this is title 4",
    'content': "This is the content for chapter 4"
}, {
    'title': "this is title 5",
    'content': "This is the content for chapter 5"
}];
for (var i = 0; i < testChapters.length; i++) {
    book.addChapter(testChapters[i].title, testChapters[i].content);
}
//book.setUUID("testUUID");

book.createBook("TestBook");
