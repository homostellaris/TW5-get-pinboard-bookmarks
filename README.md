# TW5-get-pinboard-bookmarks
## Disclaimer
This plugin is a work in progress, it is not yet `1.0`.
This plugin only works with the Node.js version of TiddlyWiki5.

# Getting Started
*Coming soon...*

On startup the plugin retrieves all your bookmarks from the Pinboard API using
the `posts/all` method. It asynchronously processes the JSON response and writes a new tiddler for each bookmark.
These 'bookmark tiddlers' have the following characteristics.
* They are saved in a `.tid` file with the naming convention `pinboard_Bookmark_Title` (the intention was that they be saved in a `tiddlers/pinboard` but that is not possible until a particular PR is merged on the TiddlyWiki5 repository).
* They are tagged with `$:/tags/Pinboard`.
* They have a *url* field that contains the URL of the original bookmark.

# Roadmap
* Add an SVG icon to the list items in the `get-pinboard-bookmarks` macro that serves as a link to the bookmarks URL.
* Parse the bookmark description as Markdown.
