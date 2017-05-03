var $ = require('cheerio');
var fs = require('fs');
var path = require('path');

// let $ = cheerio.load('<h2 class="title">Hello world</h2>');
//
// $('h2.title').text('Hello there!');
// $('h2').addClass('welcome');
//
// $.html();
// //=> <h2 class="title welcome">Hello there!</h2>

// extract the 'main-content' div from HTML file
function scrape(exportedFile) {

    var htmlString = fs.readFileSync(exportedFile);
    var parsedHTML = $.load(htmlString);

    // query for all elements with id 'main-content' and loop over them
    parsedHTML('#main-content').map(function (i, mainDiv) {
        // the 'main-content' html element into a cheerio object (same pattern as jQuery)
        mainDiv = $(mainDiv);
        console.log(mainDiv.html());
    });

}

var moveFrom = "./DOC";
var moveTo = "./DOC";

// Loop through files in a folder
// http://stackoverflow.com/questions/32511789/looping-through-files-in-a-folder-node-js
fs.readdir( moveFrom, function( err, files ) {

    if(err) {
        console.error("Could not list the directory.", err);
        return;
    }

    files.forEach( function( file, index ) {
        // Make one pass and make the file complete
        var fromPath = path.join( moveFrom, file );
        var toPath = path.join( moveTo, file );

        fs.stat( fromPath, function( error, stat ) {
            if(error) {
                console.error("Error stating file.", error);
                return;
            }

            if(stat.isFile()) {
                console.log("'%s' is a file.", fromPath);
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
            // } );
        } );
    } );
} );

// scrape('./DOC/Authorization_58930556.html');

// let $ = cheerio.load(fs.readFileSync('./DOC/Authorization_58930556.html'));
//
// var content = $('#main-content > div')
//
// function pullData(err, data) {
//     var $ = cheerio.load('
//
// $('#main-content > div').each(function(i, elem) {
//     var id = $(elem).attr('id'),
//         filename = id + '.html',
//         content = $.html(elem);
//     fs.writeFile(filename, content, function(err) {
//         console.log('Written html to ' + filename);
//     });
// });
// }