Epub-Generator
==============

This library is designed to factilitate the creation of EPUB files as easily as possible. It is very basic and simple, so the features are limited, but it is also very quick and easy to understand.

To create a book you only need to follow this simple formula.

        var book = require("./index");
        book.setTitle("This is a title");
        book.setAuthor("This is the author");
        book.setSummary("This is the summary");
        //Repeat the following for each chapter you with to add.
        book.addChapter("Chapter Title", "Chapter Content");
        //Do not add .epub to the title. That is done automatically.
        book.createBook("TestBook");

Todo list
---------
- Allow manual setting of UUID.
- Enable adding local assets, such as images and stylesheets.
- Enable adding cover image
