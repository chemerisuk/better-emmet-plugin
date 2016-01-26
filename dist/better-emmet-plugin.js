/**
 * better-emmet-plugin: Emmet abbreviation parser for better-dom
 * @version 0.9.0 Tue, 26 Jan 2016 20:11:45 GMT
 * @link https://github.com/chemerisuk/better-emmet-plugin
 * @copyright 2016 Maksim Chemerisuk
 * @license MIT
 */
(function (DOM) {
    "use strict";

    /* es6-transpiler has-iterators:false, has-generators: false */

    var // operator type / priority object
    operators = { "(": 1, ")": 2, "^": 3, ">": 4, "+": 5, "*": 6, "`": 7, "[": 8, ".": 8, "#": 8 },
        reParse = /`[^`]*`|\[[^\]]*\]|\.[^()>^+*`[#]+|[^()>^+*`[#.]+|\^+|./g,
        reAttr = /\s*([\w\-]+)(?:=((?:`([^`]*)`)|[^\s]*))?/g,
        reIndex = /(\$+)(?:@(-)?(\d+)?)?/g,
        reDot = /\./g,
        reDollar = /\$/g,
        tagCache = { "": "" },
        normalizeAttrs = function (_, name, value, rawValue) {
        // try to detemnie which kind of quotes to use
        var quote = value && value.indexOf("\"") >= 0 ? "'" : "\"";

        if (typeof rawValue === "string") {
            // grab unquoted value for smart quotes
            value = rawValue;
        } else if (typeof value !== "string") {
            // handle boolean attributes by using name as value
            value = name;
        }
        // always wrap attribute values with quotes even they don't exist
        return " " + name + "=" + quote + value + quote;
    },
        injectTerm = function (term, end) {
        return function (html) {
            // find index of where to inject the term
            var index = end ? html.lastIndexOf("<") : html.indexOf(">");
            // inject the term into the HTML string
            return html.slice(0, index) + term + html.slice(index);
        };
    },
        makeTerm = function (tag) {
        return tagCache[tag] || (tagCache[tag] = "<" + tag + "></" + tag + ">");
    },
        makeIndexedTerm = function (n, term) {
        var result = Array(n),
            i;

        for (i = 0; i < n; ++i) {
            result[i] = term.replace(reIndex, function (expr, fmt, sign, base) {
                var index = (sign ? n - i - 1 : i) + (base ? +base : 1);
                // handle zero-padded index values, like $$$ etc.
                return (fmt + index).slice(-fmt.length).replace(reDollar, "0");
            });
        }

        return result;
    },
        reUnsafe = /[&<>"']/g,

    // http://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
    safeSymbol = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" };

    // populate empty tag names with result
    "area base br col hr img input link meta param command keygen source".split(" ").forEach(function (tag) {
        tagCache[tag] = "<" + tag + ">";
    });

    /**
     * Parse emmet-like template and return resulting HTML string
     * @memberof DOM
     * @alias DOM.emmet
     * @param  {String}       template  input EmmetString
     * @param  {Object|Array} [varMap]  key/value map of variables
     * @return {String} a resulting HTML string
     * @see https://github.com/chemerisuk/better-dom/wiki/Microtemplating
     * @see http://docs.emmet.io/cheat-sheet/
     * @example
     * DOM.emmet("a");                                    // => '<a></a>'
     * DOM.emmet("ul>li*2");                              // => '<ul><li></li><li></li></ul>'
     * DOM.emmet("b>`hello {user}`", {user: "world"});    // => '<b>hello world</b>'
     * DOM.emmet("i.{0}+span", ["icon"]);                 // => '<i class="icon"></i><span></span>'
     * DOM.emmet("i.{a}>span#{b}", {a: "foo", b: "bar"}); // => '<i class="foo"><span id="bar"></span></i>'
     */
    DOM.emmet = function (template, varMap) {
        if (typeof template !== "string") throw new TypeError("template");

        if (varMap) template = DOM.format(template, varMap);

        if (template in tagCache) return tagCache[template];

        // transform template string into RPN

        var stack = [],
            output = [];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = template.match(reParse)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var str = _step.value;

                var op = str[0];
                var priority = operators[op];

                if (priority) {
                    if (str !== "(") {
                        // for ^ operator need to skip > str.length times
                        for (var i = 0, n = op === "^" ? str.length : 1; i < n; ++i) {
                            while (stack[0] !== op && operators[stack[0]] >= priority) {
                                var head = stack.shift();

                                output.push(head);
                                // for ^ operator stop shifting when the first > is found
                                if (op === "^" && head === ">") break;
                            }
                        }
                    }

                    if (str === ")") {
                        stack.shift(); // remove "(" symbol from stack
                    } else {
                            // handle values inside of `...` and [...] sections
                            if (op === "[" || op === "`") {
                                output.push(str.slice(1, -1));
                            }
                            // handle multiple classes, e.g. a.one.two
                            if (op === ".") {
                                output.push(str.slice(1).replace(reDot, " "));
                            }

                            stack.unshift(op);
                        }
                } else {
                    output.push(str);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        output = output.concat(stack);

        // transform RPN into html nodes

        stack = [];

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = output[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var str = _step2.value;

                if (str in operators) {
                    var value = stack.shift();
                    var node = stack.shift();

                    if (typeof node === "string") {
                        node = [makeTerm(node)];
                    }

                    switch (str) {
                        case ".":
                            value = injectTerm(" class=\"" + value + "\"");
                            break;

                        case "#":
                            value = injectTerm(" id=\"" + value + "\"");
                            break;

                        case "[":
                            value = injectTerm(value.replace(reAttr, normalizeAttrs));
                            break;

                        case "*":
                            node = makeIndexedTerm(+value, node.join(""));
                            break;

                        case "`":
                            stack.unshift(node);
                            // escape unsafe HTML symbols
                            node = [value.replace(reUnsafe, function (ch) {
                                return safeSymbol[ch];
                            })];
                            break;

                        default:
                            /* ">", "+", "^" */
                            value = typeof value === "string" ? makeTerm(value) : value.join("");

                            if (str === ">") {
                                value = injectTerm(value, true);
                            } else {
                                node.push(value);
                            }
                    }

                    str = typeof value === "function" ? node.map(value) : node;
                }

                stack.unshift(str);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        if (output.length === 1) {
            // handle single tag case
            output = makeTerm(stack[0]);
        } else {
            output = stack[0].join("");
        }

        return output;
    };
})(window.DOM);