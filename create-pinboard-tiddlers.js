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

    var apiToken = getApiToken();
    if (!apiToken) {
        console.log(`For the Pinboard plugin to work you must add your API token as the body of the ${configTiddlerTitle} tiddler and then restart your tiddlywiki.`);
        return
    }

    createPinboardDirectory();
    deleteAllPinboardTiddlers();

    var tiddlerCountBefore = $tw.wiki.allTitles().length;
    var tiddlerCountAfter;
    
    getPinboardBookmarksFromApi(apiToken);

    setTimeout(() => {
            tiddlerCountAfter = $tw.wiki.allTitles().length;
            console.log(`Tiddler count before getting Pinboard bookmarks: ${tiddlerCountBefore}`);
            console.log(`Tiddler count after getting Pinboard bookmarks: ${tiddlerCountAfter}`);
        },
        16000
    );
}

function createPinboardDirectory() {
    var bookmarksDirectoryPath = $tw.boot.wikiTiddlersPath + path.sep + 'pinboard' + path.sep;
    $tw.utils.createDirectory(bookmarksDirectoryPath);
    return bookmarksDirectoryPath;
}

function getApiToken() {
    var apiToken = $tw.wiki.getTiddlerText(configTiddlerTitle);
    return apiToken;
}

function getPinboardBookmarksFromApi(apiToken) {
    var url = `https://api.pinboard.in/v1/posts/all?auth_token=d-metcalfe:${apiToken}&format=json`;
    var responseBody = '';

    https.get(url, (res) => {
        console.log(`Status code: ${res.statusCode}`);

        res.on('data', (chunk) => {
            responseBody += chunk;
        });
        res.on('end', () => {
            end = new Date().getTime();
            secondsTaken = (end - start) / 1000;
            console.log(`Time taken to initialise and retrieve Pinboard bookmarks: ${secondsTaken} seconds`);

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
