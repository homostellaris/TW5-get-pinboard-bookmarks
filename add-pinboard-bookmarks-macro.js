/*\
title: $:/get-pinboard-bookmarks/add-pinboard-bookmarks-macro.js
type: application/javascript
module-type: macro

A macro that will transclude the body of all Pinboard bookmarks which have tags matching those of the host tiddler.
\*/
(function(){

exports.name = "add-pinboard-bookmarks";

exports.params = [{name: "tags"}];

exports.run = function(tags) {
    tags = tags.split(',');
    var output = "";
    for (var i = 0; i < tags.length; i++) {
        output += `Tag ${i}: ${tags[i]}\n`;
    }
    return output;
};

})();