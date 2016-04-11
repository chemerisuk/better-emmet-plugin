(function(DOM) {
    "use strict";

    /* jshint -W083, maxdepth:6 */

    var // operator type / priority object
        operators = {"(": 1,")": 2,">": 3,"+": 4,"*": 5,"{": 6,"[": 7,".": 7,"#": 7},
        reParse = /\{[^\}]*\}|\[[^\]]*\]|\.[^()>^+*\{[#]+|[^()>^+*\{[#.]+|\^+|./g,
        reAttr = /\s*([\w\-]+)(?:=((?:("|')(\\?.)*?\3)|[^\s]*))?/g,
        reIndex = /(\$+)(?:@(-)?(\d+)?)?/g,
        reDot = /\./g,
        reDollar = /\$/g,
        tagCache = {"": ""},
        normalizeAttrs = (_, name, value, quote) => {
            if (value === void 0) {
                // handle boolean attributes
                value = name;
            }

            if (quote === void 0) {
                // wrap value with quotes if they do not exist
                value = `"${value}"`;
            }

            return " " + name + "=" + value;
        },
        injectTerm = (term, end) => (html) => {
            // find index of where to inject the term
            var index = end ? html.lastIndexOf("<") : html.indexOf(">");
            // inject the term into the HTML string
            return html.slice(0, index) + term + html.slice(index);
        },
        makeTerm = (tag) => {
            return tagCache[tag] || (tagCache[tag] = `<${tag}></${tag}>`);
        },
        makeIndexedTerm = (n, term) => {
            var result = Array(n), i;

            for (i = 0; i < n; ++i) {
                result[i] = term.replace(reIndex, (expr, fmt, sign, base) => {
                    var index = (sign ? n - i - 1 : i) + (base ? +base : 1);
                    // handle zero-padded index values, like $$$ etc.
                    return (fmt + index).slice(-fmt.length).replace(reDollar, "0");
                });
            }

            return result;
        },
        reUnsafe = /[&<>"']/g,
        // http://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
        safeSymbol = {"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"};

    // populate empty tag names with result
    "area base br col hr img input link meta param command keygen source".split(" ").forEach((tag) => {
        tagCache[tag] = `<${tag}>`;
    });

    /**
     * Parse emmet-like template and return resulting HTML string
     * @memberof DOM
     * @alias DOM.emmet
     * @param  {String}       template  input EmmetString
     * @return {String} a resulting HTML string
     * @see https://github.com/chemerisuk/better-dom/wiki/Microtemplating
     * @see http://docs.emmet.io/cheat-sheet/
     * @example
     * DOM.emmet("a");                                    // => '<a></a>'
     * DOM.emmet("ul>li*2");                              // => '<ul><li></li><li></li></ul>'
     */
    DOM.emmet = function(template) {
        if (typeof template !== "string") throw new TypeError("template");

        if (template in tagCache) return tagCache[template];

        // transform template string into RPN

        var stack = [], output = [];

        for (let i = 0, match = template.match(reParse); i < match.length; ++i) {
            let str = match[i];
            let op = str[0];
            let priority = operators[op];

            if (priority) {
                if (str !== "(") {
                    while (stack[0] !== op && operators[stack[0]] >= priority) {
                        output.push(stack.shift());
                    }
                }

                if (str === ")") {
                    stack.shift(); // remove "(" symbol from stack
                } else {
                    // handle values inside of {...} and [...] sections
                    if (op === "[" || op === "{") {
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

        output = output.concat(stack);

        // transform RPN into html nodes

        stack = [];

        for (let j = 0; j < output.length; ++j) {
            let str = output[j];

            if (str in operators) {
                let value = stack.shift();
                let node = stack.shift();

                if (typeof node === "string") {
                    node = [ makeTerm(node) ];
                }

                switch(str) {
                case ".":
                    value = injectTerm(` class="${value}"`);
                    break;

                case "#":
                    value = injectTerm(` id="${value}"`);
                    break;

                case "[":
                    value = injectTerm(value.replace(reAttr, normalizeAttrs));
                    break;

                case "*":
                    node = makeIndexedTerm(+value, node.join(""));
                    break;

                case "{":
                    stack.unshift(node);
                    // escape unsafe HTML symbols
                    node = [ value.replace(reUnsafe, (ch) => safeSymbol[ch]) ];
                    break;

                default: /* ">", "+" */
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

        if (output.length === 1) {
            // handle single tag case
            output = makeTerm(stack[0]);
        } else {
            output = stack[0].join("");
        }

        return output;
    };

    DOM.emmetLiteral = function(parts) {
        var args = arguments;

        return DOM.emmet(parts.reduce((expr, part, index) => {
            return expr + args[index] + part;
        }));
    };
}(window.DOM));