/*\
title: $:/get-pinboard-bookmarks/create-pinboard-tiddlers.js
type: application/javascript
module-type: startup

Creates tiddlers for all bookmarks in Pinboard.
\*/
(function(){

if (!$tw.node) return;

const https = require('https');
const path = require('path');


exports.name = "create-pinboard-tiddlers";
exports.after = ["load-modules"];

exports.startup = function() {
    console.log("Executing `create-pinboard-tiddlers.js`.");

    var pinboardTiddlersDirPath = createBookmarksDirectory();
    var bookmarksJson = getPinboardBookmarksFromApi();
}

function createBookmarksDirectory() {
    var blah = $tw.boot.wikiTiddlersPath + path.sep + 'pinboard' + path.sep;
    $tw.utils.createDirectory(blah);
    return blah;
}

function getPinboardBookmarksFromApi() {
    var url = 'https://api.pinboard.in/v1/posts/all?auth_token=d-metcalfe:4C286C8F797DA20D6F73&format=json'
    var responseBody = '';

    https.get(url, (res) => {
        console.log(`Status code: ${res.statusCode}`);

        res.on('data', (chunk) => {
            responseBody += chunk;
        });
        res.on('end', () => {
            responseBody = JSON.parse(responseBody);
            createBookmarkTiddlers(responseBody);
        })
    }).on('error', (error) => {
        console.error(error);
    });
}

function createBookmarkTiddlers(bookmarksJson, pinboardTiddlersDirPath) {
    var title = "Created From Startup Module";
    var text = "hi";
    var tags = ["Pinboard", "test"];
    $tw.wiki.addTiddler({
        title: title,
        text: text,
        url: bookmarksJson[0].href,
        tags: tags
    })
    $tw.boot.files[title];
}

})();
