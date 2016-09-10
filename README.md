# TW5-get-pinboard-bookmarks
Work in progress.

The intention is that on startup the plugin will retrieve all bookmarks from the Pinboard API using
the `posts/all` method. It will asynchronously process the JSON response and write a new tiddler for each bookmark.
These tiddlers can then easily be transcluded into tiddlers.

In addition a macro will be provided that transcludes all relevant 'Pinboard tiddlers' into the current tiddler by
matching on tags.
