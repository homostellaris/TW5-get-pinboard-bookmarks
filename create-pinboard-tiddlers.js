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

const pinboardTiddlerTag = '$:/tags/Pinboard';

exports.startup = function() {
    console.log("Executing `create-pinboard-tiddlers.js`.");
    start = new Date().getTime();

    var apiToken = getApiToken();

    if (!apiToken) {
        console.log("For the get-pinboard-bookmarks plugin to work you must have your Pinboard API token stored in an environment variable named 'pinboard_api_token'.");
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
    apiToken = process.env.pinboard_api_token
    return apiToken;
}

function getPinboardBookmarksFromApi(apiToken) {
    var url = `https://api.pinboard.in/v1/posts/all?auth_token=${apiToken}&format=json`;
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
        title = normaliseTitle(bookmark.description);
        tags = getTiddlyWikiTags(bookmark);
        $tw.wiki.addTiddler({
            title: title,
            text: bookmark.extended,
            url: bookmark.href,
            tags: tags,
            type: 'text/x-markdown'
        })
    }
}

function getTiddlyWikiTags(bookmark) {
    var pinboardTags = bookmark.tags.split(' ');
    var tiddlyWikiTags = ['$:/tags/Pinboard']; // Can't use pinboardTiddlerTags constant here for some reason. Need to learn more about JS variable scope...
    for(var i = 0; i < pinboardTags.length; i++) {
        var pinboardTag = pinboardTags[i];
        var tiddlyWikiTag = normaliseTag(pinboardTag);
        tiddlyWikiTags.push(tiddlyWikiTag);
    }
    return tiddlyWikiTags;
}

/* Forward slashes are normally replaced with underscores in the `generateTiddlerFilename` method of the FileSystemAdaptor, but not when a path name filter is applied. It makes sense that file names are not sanitised before application of path name filters because changing the characters could stop them working as intended. However in this case forward slashes in Pinboard bookmark descriptions need to be replaced otherwise they are interpreted as path separators and cause unwanted subdirectories to be created. */
function normaliseTitle(title) {
    return title.replace(/\//g, '_');
}

function normaliseTag(tag) {
    return tag.replace(/-/g, ' ');
}

function deleteAllPinboardTiddlers() {
    var pinboardTagTiddlers = $tw.wiki.getTiddlersWithTag(pinboardTiddlerTag);
    console.log(`Deleting ${pinboardTagTiddlers.length} bookmark tiddler(s).`);
    for (var i = 0; i < pinboardTagTiddlers.length; i++) {
        var pinboardTiddler = pinboardTagTiddlers[i];
        $tw.wiki.deleteTiddler(pinboardTiddler);
    }
    console.log('Deletion of tiddlers enqueued.');
}

})();
