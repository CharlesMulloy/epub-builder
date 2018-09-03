Epub-Builder
==============

This library is designed to facilitate the creation of EPUB files as easily as possible. It is very basic and simple, so the features are limited, but it is also very quick and easy to understand.

To create a book you only need to follow this simple formula.

``` js
var EbookBuilder = require("epub-builder");
var book = new EbookBuilder();
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
// Add a second argument if you want it to change the filename/location in the file.
book.addAsset("path/to/asset", "images/image.jpg");
// Do not add .epub to the title. That is done automatically.
book.createBook("TestBook");

// To create a new book, try:
var newbook = new EbookBuilder();
```

Version history
---------------

1.3.4
- Created build script for VS Code.
- Can now specify the path that assets are saved to with .addAsset();
- Builder no longer automatically appends ".epub" to the end of the output file names.
- Can now create multiple builders with "new EbookBuilder()".

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
- Fix tests to cover every feature of the project.
