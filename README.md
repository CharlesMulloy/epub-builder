Epub-Builder
==============

This library is designed to facilitate the creation of EPUB files as easily as possible. It is very basic and simple, so the features are limited, but it is also very quick and easy to understand.

To create a book you only need to follow this simple formula.

``` js
var book = require("epub-builder");
book.title = "This is a title";
book.author = "This is the author";
book.summary = "This is the summary";
// Used to set the UUID of the book. Defaults to the current date according to the system's calendar if not set.
book.UUID = "1234567890";
// Repeat the following for each chapter you with to add.
book.addChapter("Chapter Title", "Chapter Content");
// Used to add a cover image to the book.
book.addCoverImage("path/to/image.png");
// Use the following method to add assets to the epub, such as stylesheets or images.
// Make sure that the content of the chapters assume that the assets are parallel to themselves and not in any other folder.
book.addAsset("path/to/asset");
// Do not add .epub to the title. That is done automatically.
book.createBook("TestBook");

// To create a new book, try:
var newbook = new (require("epub-builder").constructor);
```

Version history
---------------
1.2.5
- Fixed version typo in README.md

1.2.4
- Cleaned up code.

1.1.1
- Allows manual setting of UUID.
- Cleaned up code.

1.1.0
- Allows setting of cover image.
- Allows adding assets to the book.



Todo list
---------
- Will deprecate createBook() and replace with another method so that the output filename can have any extension desired. File will still be an Epub file though.
- Set to automatically prettify text.
