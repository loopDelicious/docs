var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var toMarkdown = require('to-markdown');

// extract the 'main-content' div from HTML file
// UPDATE relative links
// UPDATE img links
// convert HTML to MD
function scrape(exportedFile) {

    var pageId = exportedFile.slice(-13,-5);
    var pageName = exportedFile.slice(4).split("_")[0];

    // read in file
    var htmlString = fs.readFileSync(exportedFile);
    // console.log("htmlString " + typeof(htmlString)); // object
    // console.log("htmlString " + htmlString); // object

    // parse HTML
    var $ = cheerio.load(htmlString);

    // UPDATE relative links
    // replace this: https://postmanlabs.atlassian.net/wiki/display/DOC/
    // with this: https://www.getpostman.com/docs/
    $('a').each(function(index, aTag) {
        var $aTag = $(aTag);
        if (!$aTag.attr('href')) {
            return;
        }
        var newText = $aTag.attr('href').replace("https://postmanlabs.atlassian.net/wiki/display/DOC/", "https://www.getpostman.com/docs/");
        $aTag.attr('href', newText);
    });

    // UPDATE img links
    // replace src="attachments/58388634/59135435.png"
    // with this: "https://s3.amazonaws.com/postman-static-getpostman-com/postman-docs/59135435.png"
    $('img').each(function(index, imgTag) {
        var $imgTag = $(imgTag);
        var newImgText = $imgTag.attr('src').replace("attachments/" + pageId + "/", "https://s3.amazonaws.com/postman-static-getpostman-com/postman-docs/");
        var paramIndex = newImgText.indexOf("?");
        var newLink = newImgText.slice(0, paramIndex);
        $imgTag.attr('src', newLink);
    });

    // pull out element with #main-content
    var mainDiv = $('#main-content');

    // sanitize HTML by removing unwanted CSS
    var sanitizedDiv = sanitizeHtml(mainDiv);

    // convert HTML to MD
    var markdownPage = toMarkdown(sanitizedDiv);

    // write file
    fs.writeFileSync(pageName + '.md', markdownPage);

    console.log(pageId);
    console.log(pageName);
    // console.log(mainDiv.html());
}

// Crawl through entries in a folder containing HTML pages exported from wiki
// http://stackoverflow.com/questions/32511789/looping-through-files-in-a-folder-node-js
function crawler(moveFrom, moveTo) {

    fs.readdir(moveFrom, function (err, entries) {

        if (err) {
            console.error("Could not list the directory.", err);
            return;
        }

        entries.forEach(function (entry, index) {

            // Make one pass and make the file complete
            var fromPath = path.join(moveFrom, entry);
            var toPath = path.join(moveTo, entry);

            fs.stat(fromPath, function (error, stat) {

                if (error) {
                    console.error("Error stating file.", error);
                    return;
                }

                if (stat.isFile() && entry != ".DS_Store") {
                    console.log("'%s' is a file.", fromPath);
                    console.log("Scraping '%s'", fromPath);
                    scrape(fromPath);
                } else if (stat.isDirectory()) {
                    console.log("'%s' is a directory.", fromPath);
                }

            });
        });
    });
}

crawler("./DOC", "./DOC");

// scrape('./DOC/Authorization_58930556.html');
