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

    var htmlString = fs.readFileSync(exportedFile);
    var sanitized = sanitizeHtml(htmlString);
    var $ = cheerio.load(sanitized);

    var pageId = exportedFile.slice(-13,-5);
    var pageName = exportedFile.slice(4).split("_")[0];

    // query for all elements with id 'main-content' and loop over them
    var mainDiv = $('#main-content');

    // UPDATE relative links
    // replace this: https://postmanlabs.atlassian.net/wiki/display/DOC/
    // with this: https://www.getpostman.com/docs/
    $('a').each(function(index, aTag) {
        var $aTag = $(aTag);
        var newText = $aTag.attr('href').replace("https://postmanlabs.atlassian.net/wiki/display/DOC/", "https://www.getpostman.com/docs/");
        $aTag.attr('href', newText);
    });

    // UPDATE img links
    // replace this: src="attachments/58388634/59135435.png...
    // with this: "https://s3.amazonaws.com/postman-static-getpostman-com/postman-docs/59135435.png"
    $('img').each(function(index, imgTag) {
        var $imgTag = $(imgTag);
        var newImgText = $imgTag.attr('src').replace("attachments/" + pageId + "/", "https://s3.amazonaws.com/postman-static-getpostman-com/postman-docs/");
        var paramIndex = newImgText.indexOf("?");
        var newLink = newImgText.slice(0, paramIndex);
        $imgTag.attr('src', newLink);
    });

    // convert HTML to MD
    var markdownPage = toMarkdown(mainDiv.html(), {
        converters:
        [ {
            filter: function (node) {
                return node.nodeName === 'span';
            },
            replacement: function (content) {
                return "";
            }
        }]
    });

    // write file
    fs.writeFileSync(pageName + '.md', markdownPage);

    console.log(pageId);
    console.log(pageName);
    console.log(mainDiv.html());
}

var moveFrom = "./DOC"; // HTML pages exported from wiki to crawl
var moveTo = "./DOC";

// Loop through entries in a folder
// http://stackoverflow.com/questions/32511789/looping-through-files-in-a-folder-node-js
fs.readdir(moveFrom, function(err, entries) {

    if(err) {
        console.error("Could not list the directory.", err);
        return;
    }

    entries.forEach(function(entry, index) {
        // Make one pass and make the file complete
        var fromPath = path.join(moveFrom, entry);
        var toPath = path.join(moveTo, entry);

        fs.stat( fromPath, function( error, stat ) {
            if(error) {
                console.error("Error stating file.", error);
                return;
            }

            if(stat.isFile() && entry != ".DS_Store") {
                console.log("'%s' is a file.", fromPath);
                console.log("Scraping '%s'", fromPath);
                scrape(fromPath);
            } else if(stat.isDirectory()) {
                console.log("'%s' is a directory.", fromPath);
            }

        });
    });
});

// scrape('./DOC/Authorization_58930556.html');
