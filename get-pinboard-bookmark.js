/*\
title: get-pinboard-bookmarks.js
type: application/javascript
module-type: macro

Gets related links for a Tiddler by searching your Pinboard account for bookmarks with the same tags as the Tiddler.

Only the first 3 tags on the Tiddler are used (this is a limitation of the Pinboard API).

Before searching Pinboard the Tiddler's tags are lower cased and spaces replaced with hyphens.
\*/
(function(){

exports.name = "get-pinboard-bookmarks";

exports.params = [
    {name: "tags"}
];

/*
Run the macro
*/
exports.run = function(tags) {
    var tagsArray = tags.split(',');
    return 'testing, testing';
};

})();
