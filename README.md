**DEPRECATED AND NO LONGER SUPPORTED: use standards-frieldly [ES6 template literals](http://wesbos.com/template-strings-html/) instead**

# better-emmet-plugin<br>[![NPM version][npm-version]][npm-url] [![NPM downloads][npm-downloads]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Bower version][bower-image]][bower-url]
> Emmet abbreviation parser for [better-dom](https://github.com/chemerisuk/better-dom)

On front-end it's typically to have some HTML pieces in Java Script. This plugin helps to simplify such embed strings using a nice [Emmet](http://emmet.io/)-like syntax which we are all familiar with. Compare the line below:

```js
DOM.create("<ul><li class='list-item'></li><li class='list-item'></li><li class='list-item'></li></ul>");
```

to the equivalent micro template

```js
DOM.create(DOM.emmet("ul>li.list-item*3"));
```
Take a look at the [Emmet cheat sheet](http://docs.emmet.io/cheat-sheet/) for more examples, but be aware about the [differences](#differences-from-emmetio-parser).

## Where to use
`DOM.emmet` converts an Emmet abbreviation to HTML string:

```js
DOM.emmet("a+b"); // => "<a></a><b></b>"
DOM.emmet("select>option[value=$]*2"); 
// => "<select><option value="1"></option><option value="2"></option></select>"
```

If you use a ES6 trinspiler for your source code, the plugin exposes `DOM.emmetLiteral`. This function provides even more elegant syntax for microtemplating using [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals):

```js
var emmet = DOM.emmetLiteral;
...
DOM.create(emmet`ul>li.list-item*3`);
DOM.create(emmet`a>{Hello ${username}!}`);
```

## Differences from emmet.io parser
1. Element aliases are not supported
2. Implied tag names are not supported
3. Shortcut `a{text}` instead of `a>{text}` is not supported
4. Operator `^` is not supported (use scopes instead)
5. Expandos are not supported
6. Boolean attributes (attributes are boolean by default)
7. Default attribute values are not supported
8. Short tags are not supported

## Do not be crazy with microtemplates!
Several recommendations from the [emmet docs](http://docs.emmet.io/):

> You don’t really need to write complex abbreviations. Stop thinking that “typing” is the slowest process in web-development. You’ll quickly find out that constructing a single complex abbreviation is much slower and error-prone than constructing and typing a few short ones.

## Browser support
#### Desktop
* Chrome
* Safari 6.0+
* Firefox 16+
* Opera 12.10+
* Internet Explorer 8+ (see [notes](https://github.com/chemerisuk/better-dom#notes-about-old-ies))

#### Mobile
* iOS Safari 6+
* Android 2.3+
* Chrome for Android

[npm-url]: https://www.npmjs.com/package/better-emmet-plugin
[npm-version]: https://img.shields.io/npm/v/better-emmet-plugin.svg
[npm-downloads]: https://img.shields.io/npm/dt/better-emmet-plugin.svg

[travis-url]: http://travis-ci.org/chemerisuk/better-emmet-plugin
[travis-image]: http://img.shields.io/travis/chemerisuk/better-emmet-plugin/master.svg

[coveralls-url]: https://coveralls.io/r/chemerisuk/better-emmet-plugin
[coveralls-image]: http://img.shields.io/coveralls/chemerisuk/better-emmet-plugin/master.svg

[bower-url]: https://github.com/chemerisuk/better-emmet-plugin
[bower-image]: http://img.shields.io/bower/v/better-emmet-plugin.svg
