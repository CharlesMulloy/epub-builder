var assert = require('assert');

describe("EpubBuilder", function() {
  describe("API functionality", function() {
    let EpubBuilder = require('./index');
  


    it("Should create the book object", function() {
      const ebook = new EpubBuilder()
      assert.notEqual(ebook === null);
    })

    it("Should allow the setting of the books' properies", function() {
      const ebook = new EpubBuilder()
      ebook.title = "This is a title";
      ebook.author = "This is the author";
      ebook.summary = "This is the summary";

      assert.ok(ebook.getTitle() == "This is a title");
      assert.ok(ebook.getAuthor() == "This is the author");
      assert.ok(ebook.getSummary() == "This is the summary");
    });

    it("Should allow the creation of chapters", function() {
      const ebook = new EpubBuilder()

      ebook.title = "This is a title";

      assert.equal(ebook.getChapter().length, 0);
      ebook.addChapter("Chapter 1", "<p>The story begins...</p>");
      assert.equal(ebook.getChapter().length, 1);
      assert.equal(ebook.getChapter(0).title, "Chapter 1");
      assert.equal(ebook.getChapter(0).content, "<p>The story begins...</p>");
    });

    it("Should allow the addition of assets", function() {

      const ebook = new EpubBuilder()

      ebook.addChapter("Chapter 1", "<p><img src=\"image.jpeg\" alt=\"Test image\"/></p>");
      ebook.addAsset("./src/testAssets/image.jpeg");
      ebook.createBook("testbook1.epub");
    });


    it("Should allow the addition of assets in other folders", function() {
      const ebook = new EpubBuilder()
      ebook.title = "Title"
      ebook.addChapter("Chapter 1", `<p><img src="images/image.jpeg" alt="Test image"/></p>`);
      ebook.addAsset("./src/testAssets/image.jpeg", "images/image.jpeg");
      ebook.createBook("testbook2.epub");
    });

  });
});
