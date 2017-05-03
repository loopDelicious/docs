var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var toMarkdown = require('to-markdown');

// extract the 'main-content' div from HTML file
// UPDATE relative links
// UPDATE img links
// convert HTML to MD
function scrape(exportedFile) {

    var htmlString = fs.readFileSync(exportedFile);
    var $ = cheerio.load(htmlString);

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
    // replace this: "attachments/"
    // with this: TODO: TBD AWS S3 link
    // $('img').each(function(index, imgTag) {
    //     var $imgTag = $(imgTag);
    //     var newImgText = $imgTag.attr('src').replace("attachments/" + pageId, "TBD");
    //     $imgTag.attr('src', newImgText);
    // });

    // convert HTML to MD
    var markdownPage = toMarkdown(mainDiv.html());

    // write file
    fs.writeFileSync(pageName + '.md', markdownPage);

    console.log(pageId);
    console.log(pageName);
    console.log(mainDiv.html());
}

var moveFrom = "./DOC";
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

            // fs.rename(fromPath, toPath, function(error) {
            //     if(error) {
            //         console.error("File moving error.", error);
            //     }
            //     else {
            //         console.log("Moved file '%s' to '%s'.", fromPath, toPath);
            //     }
            // });
        });
    });
});

// scrape('./DOC/Authorization_58930556.html');
