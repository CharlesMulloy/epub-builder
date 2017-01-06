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
        //Used to add a cover image to the book.
        book.addCoverImage("path/to/image.png");
        //Use the following method to add assets to the epub, such as stylesheets or images. Make sure that the content of the chapters assume that the assets are parallel to themselves and not in any other folder.
        book.addAsset("path/to/asset");
        //Do not add .epub to the title. That is done automatically.
        book.createBook("TestBook");


Version history
---------------
1.0.0
- Allows setting of cover image.
- Allows adding assets to the book.



Todo list
---------
- Allow manual setting of UUID.
- Set to automatically prettify text.
