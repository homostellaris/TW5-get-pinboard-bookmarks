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

const pinboardTag = '$:/tags/Pinboard';
const configTiddlerTitle = '$:/config/get-pinboard-bookmarks';

exports.name = "create-pinboard-tiddlers";
exports.after = ["load-modules"];

exports.startup = function() {
    console.log("Executing `create-pinboard-tiddlers.js`.");
    start = new Date().getTime();

    var tiddlerCountBefore = $tw.wiki.allTitles().length;
    console.log(`Tiddler count before: ${tiddlerCountBefore}`);
    var tiddlerCountAfter;

    // deleteAllPinboardTiddlers();
    createPinboardDirectory();
    getPinboardBookmarksFromApi();

    setTimeout(() => {
            tiddlerCountAfter = $tw.wiki.allTitles().length;
            console.log(`Tiddler count after: ${tiddlerCountAfter}`);
        },
        14000
    );
}

function createPinboardDirectory() {
    var bookmarksDirectoryPath = $tw.boot.wikiTiddlersPath + path.sep + 'pinboard' + path.sep;
    $tw.utils.createDirectory(bookmarksDirectoryPath);
    return bookmarksDirectoryPath;
}

function getApiToken() {
    var apiToken = $tw.wiki.getTiddlerText(configTiddlerTitle);
    if (!apiToken) {
        throw new Error(`For the Pinboard plugin to work you must add your API token as the body of the ${configTiddlerTitle} tiddler.`);
    }
    return apiToken;
}

function getPinboardBookmarksFromApi() {
    var apiToken = getApiToken();
    var url = `https://api.pinboard.in/v1/posts/all?auth_token=d-metcalfe:${apiToken}&format=json`;
    var responseBody = '';

    https.get(url, (res) => {
        console.log(`Status code: ${res.statusCode}`);

        res.on('data', (chunk) => {
            responseBody += chunk;
        });
        res.on('end', () => {
            responseBody = JSON.parse(responseBody);
            createPinboardTiddlers(responseBody);
        })
    }).on('error', (error) => {
        console.error(error);
    });
}

function createPinboardTiddlers(bookmarksJson, pinboardTiddlersDirPath) {
    console.log(`Creating ${bookmarksJson.length} bookmarks.`);
    var bookmark;
    for (var i = 0; i < bookmarksJson.length; i++) {
        bookmark = bookmarksJson[i];
        $tw.wiki.addTiddler({
            title: bookmark.description,
            text: bookmark.extended,
            url: bookmark.href,
            tags: [pinboardTag].concat(bookmark.tags.split(' '))
        })
    }
    end = new Date().getTime();
    secondsTaken = (end - start) / 1000;
    console.log(`Time taken: ${secondsTaken} seconds`);
}

function deleteAllPinboardTiddlers() {
    var pinboardTagTiddlers = $tw.wiki.getTiddlersWithTag(pinboardTag);
    console.log(`Deleting ${pinboardTagTiddlers.length} bookmark tiddler(s).`);
    for (var i = 0; i < pinboardTagTiddlers.length; i++) {
        var pinboardTiddler = pinboardTagTiddlers[i];
        $tw.wiki.deleteTiddler(pinboardTiddler);
    }
    console.log('Deletion of tiddlers enqueued.');
}

})();
