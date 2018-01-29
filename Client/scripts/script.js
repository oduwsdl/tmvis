(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = global.document ? factory(global, true) : function(w) {
                if (!w.document) {
                    throw new Error("jQuery requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
}(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
    var deletedIds = [];
    var slice = deletedIds.slice;
    var concat = deletedIds.concat;
    var push = deletedIds.push;
    var indexOf = deletedIds.indexOf;
    var class2type = {};
    var toString = class2type.toString;
    var hasOwn = class2type.hasOwnProperty;
    var support = {};
    var
        version = "1.11.3",
        jQuery = function(selector, context) {
            return new jQuery.fn.init(selector, context);
        },
        rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        rmsPrefix = /^-ms-/,
        rdashAlpha = /-([\da-z])/gi,
        fcamelCase = function(all, letter) {
            return letter.toUpperCase();
        };
    jQuery.fn = jQuery.prototype = {
        jquery: version,
        constructor: jQuery,
        selector: "",
        length: 0,
        toArray: function() {
            return slice.call(this);
        },
        get: function(num) {
            return num != null ? (num < 0 ? this[num + this.length] : this[num]) : slice.call(this);
        },
        pushStack: function(elems) {
            var ret = jQuery.merge(this.constructor(), elems);
            ret.prevObject = this;
            ret.context = this.context;
            return ret;
        },
        each: function(callback, args) {
            return jQuery.each(this, callback, args);
        },
        map: function(callback) {
            return this.pushStack(jQuery.map(this, function(elem, i) {
                return callback.call(elem, i, elem);
            }));
        },
        slice: function() {
            return this.pushStack(slice.apply(this, arguments));
        },
        first: function() {
            return this.eq(0);
        },
        last: function() {
            return this.eq(-1);
        },
        eq: function(i) {
            var len = this.length,
                j = +i + (i < 0 ? len : 0);
            return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
        },
        end: function() {
            return this.prevObject || this.constructor(null);
        },
        push: push,
        sort: deletedIds.sort,
        splice: deletedIds.splice
    };
    jQuery.extend = jQuery.fn.extend = function() {
        var src, copyIsArray, copy, name, options, clone, target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[i] || {};
            i++;
        }
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {};
        }
        if (i === length) {
            target = this;
            i--;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];
                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }
                        target[name] = jQuery.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    jQuery.extend({
        expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
        isReady: true,
        error: function(msg) {
            throw new Error(msg);
        },
        noop: function() {},
        isFunction: function(obj) {
            return jQuery.type(obj) === "function";
        },
        isArray: Array.isArray || function(obj) {
            return jQuery.type(obj) === "array";
        },
        isWindow: function(obj) {
            return obj != null && obj == obj.window;
        },
        isNumeric: function(obj) {
            return !jQuery.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
        },
        isEmptyObject: function(obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        },
        isPlainObject: function(obj) {
            var key;
            if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
                return false;
            }
            try {
                if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                return false;
            }
            if (support.ownLast) {
                for (key in obj) {
                    return hasOwn.call(obj, key);
                }
            }
            for (key in obj) {}
            return key === undefined || hasOwn.call(obj, key);
        },
        type: function(obj) {
            if (obj == null) {
                return obj + "";
            }
            return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
        },
        globalEval: function(data) {
            if (data && jQuery.trim(data)) {
                (window.execScript || function(data) {
                    window["eval"].call(window, data);
                })(data);
            }
        },
        camelCase: function(string) {
            return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
        },
        nodeName: function(elem, name) {
            return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        },
        each: function(obj, callback, args) {
            var value, i = 0,
                length = obj.length,
                isArray = isArraylike(obj);
            if (args) {
                if (isArray) {
                    for (; i < length; i++) {
                        value = callback.apply(obj[i], args);
                        if (value === false) {
                            break;
                        }
                    }
                } else {
                    for (i in obj) {
                        value = callback.apply(obj[i], args);
                        if (value === false) {
                            break;
                        }
                    }
                }
            } else {
                if (isArray) {
                    for (; i < length; i++) {
                        value = callback.call(obj[i], i, obj[i]);
                        if (value === false) {
                            break;
                        }
                    }
                } else {
                    for (i in obj) {
                        value = callback.call(obj[i], i, obj[i]);
                        if (value === false) {
                            break;
                        }
                    }
                }
            }
            return obj;
        },
        trim: function(text) {
            return text == null ? "" : (text + "").replace(rtrim, "");
        },
        makeArray: function(arr, results) {
            var ret = results || [];
            if (arr != null) {
                if (isArraylike(Object(arr))) {
                    jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
                } else {
                    push.call(ret, arr);
                }
            }
            return ret;
        },
        inArray: function(elem, arr, i) {
            var len;
            if (arr) {
                if (indexOf) {
                    return indexOf.call(arr, elem, i);
                }
                len = arr.length;
                i = i ? i < 0 ? Math.max(0, len + i) : i : 0;
                for (; i < len; i++) {
                    if (i in arr && arr[i] === elem) {
                        return i;
                    }
                }
            }
            return -1;
        },
        merge: function(first, second) {
            var len = +second.length,
                j = 0,
                i = first.length;
            while (j < len) {
                first[i++] = second[j++];
            }
            if (len !== len) {
                while (second[j] !== undefined) {
                    first[i++] = second[j++];
                }
            }
            first.length = i;
            return first;
        },
        grep: function(elems, callback, invert) {
            var callbackInverse, matches = [],
                i = 0,
                length = elems.length,
                callbackExpect = !invert;
            for (; i < length; i++) {
                callbackInverse = !callback(elems[i], i);
                if (callbackInverse !== callbackExpect) {
                    matches.push(elems[i]);
                }
            }
            return matches;
        },
        map: function(elems, callback, arg) {
            var value, i = 0,
                length = elems.length,
                isArray = isArraylike(elems),
                ret = [];
            if (isArray) {
                for (; i < length; i++) {
                    value = callback(elems[i], i, arg);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            } else {
                for (i in elems) {
                    value = callback(elems[i], i, arg);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            }
            return concat.apply([], ret);
        },
        guid: 1,
        proxy: function(fn, context) {
            var args, proxy, tmp;
            if (typeof context === "string") {
                tmp = fn[context];
                context = fn;
                fn = tmp;
            }
            if (!jQuery.isFunction(fn)) {
                return undefined;
            }
            args = slice.call(arguments, 2);
            proxy = function() {
                return fn.apply(context || this, args.concat(slice.call(arguments)));
            };
            proxy.guid = fn.guid = fn.guid || jQuery.guid++;
            return proxy;
        },
        now: function() {
            return +(new Date());
        },
        support: support
    });
    jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

    function isArraylike(obj) {
        var length = "length" in obj && obj.length,
            type = jQuery.type(obj);
        if (type === "function" || jQuery.isWindow(obj)) {
            return false;
        }
        if (obj.nodeType === 1 && length) {
            return true;
        }
        return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
    }
    var Sizzle = (function(window) {
        var i, support, Expr, getText, isXML, tokenize, compile, select, outermostContext, sortInput, hasDuplicate, setDocument, document, docElem, documentIsHTML, rbuggyQSA, rbuggyMatches, matches, contains, expando = "sizzle" + 1 * new Date(),
            preferredDoc = window.document,
            dirruns = 0,
            done = 0,
            classCache = createCache(),
            tokenCache = createCache(),
            compilerCache = createCache(),
            sortOrder = function(a, b) {
                if (a === b) {
                    hasDuplicate = true;
                }
                return 0;
            },
            MAX_NEGATIVE = 1 << 31,
            hasOwn = ({}).hasOwnProperty,
            arr = [],
            pop = arr.pop,
            push_native = arr.push,
            push = arr.push,
            slice = arr.slice,
            indexOf = function(list, elem) {
                var i = 0,
                    len = list.length;
                for (; i < len; i++) {
                    if (list[i] === elem) {
                        return i;
                    }
                }
                return -1;
            },
            booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
            whitespace = "[\\x20\\t\\r\\n\\f]",
            characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
            identifier = characterEncoding.replace("w", "w#"),
            attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace + "*([*^$|!~]?=)" + whitespace + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace + "*\\]",
            pseudos = ":(" + characterEncoding + ")(?:\\((" + "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" + "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" + ".*" + ")\\)|)",
            rwhitespace = new RegExp(whitespace + "+", "g"),
            rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),
            rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
            rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),
            rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),
            rpseudo = new RegExp(pseudos),
            ridentifier = new RegExp("^" + identifier + "$"),
            matchExpr = {
                "ID": new RegExp("^#(" + characterEncoding + ")"),
                "CLASS": new RegExp("^\\.(" + characterEncoding + ")"),
                "TAG": new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
                "ATTR": new RegExp("^" + attributes),
                "PSEUDO": new RegExp("^" + pseudos),
                "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
                "bool": new RegExp("^(?:" + booleans + ")$", "i"),
                "needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
                    whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
            },
            rinputs = /^(?:input|select|textarea|button)$/i,
            rheader = /^h\d$/i,
            rnative = /^[^{]+\{\s*\[native \w/,
            rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
            rsibling = /[+~]/,
            rescape = /'|\\/g,
            runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
            funescape = function(_, escaped, escapedWhitespace) {
                var high = "0x" + escaped - 0x10000;
                return high !== high || escapedWhitespace ? escaped : high < 0 ? String.fromCharCode(high + 0x10000) : String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
            },
            unloadHandler = function() {
                setDocument();
            };
        try {
            push.apply((arr = slice.call(preferredDoc.childNodes)), preferredDoc.childNodes);
            arr[preferredDoc.childNodes.length].nodeType;
        } catch (e) {
            push = {
                apply: arr.length ? function(target, els) {
                        push_native.apply(target, slice.call(els));
                    } : function(target, els) {
                        var j = target.length,
                            i = 0;
                        while ((target[j++] = els[i++])) {}
                        target.length = j - 1;
                    }
            };
        }

        function Sizzle(selector, context, results, seed) {
            var match, elem, m, nodeType, i, groups, old, nid, newContext, newSelector;
            if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
                setDocument(context);
            }
            context = context || document;
            results = results || [];
            nodeType = context.nodeType;
            if (typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
                return results;
            }
            if (!seed && documentIsHTML) {
                if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {
                    if ((m = match[1])) {
                        if (nodeType === 9) {
                            elem = context.getElementById(m);
                            if (elem && elem.parentNode) {
                                if (elem.id === m) {
                                    results.push(elem);
                                    return results;
                                }
                            } else {
                                return results;
                            }
                        } else {
                            if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) {
                                results.push(elem);
                                return results;
                            }
                        }
                    } else if (match[2]) {
                        push.apply(results, context.getElementsByTagName(selector));
                        return results;
                    } else if ((m = match[3]) && support.getElementsByClassName) {
                        push.apply(results, context.getElementsByClassName(m));
                        return results;
                    }
                }
                if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                    nid = old = expando;
                    newContext = context;
                    newSelector = nodeType !== 1 && selector;
                    if (nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                        groups = tokenize(selector);
                        if ((old = context.getAttribute("id"))) {
                            nid = old.replace(rescape, "\\$&");
                        } else {
                            context.setAttribute("id", nid);
                        }
                        nid = "[id='" + nid + "'] ";
                        i = groups.length;
                        while (i--) {
                            groups[i] = nid + toSelector(groups[i]);
                        }
                        newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
                        newSelector = groups.join(",");
                    }
                    if (newSelector) {
                        try {
                            push.apply(results, newContext.querySelectorAll(newSelector));
                            return results;
                        } catch (qsaError) {} finally {
                            if (!old) {
                                context.removeAttribute("id");
                            }
                        }
                    }
                }
            }
            return select(selector.replace(rtrim, "$1"), context, results, seed);
        }

        function createCache() {
            var keys = [];

            function cache(key, value) {
                if (keys.push(key + " ") > Expr.cacheLength) {
                    delete cache[keys.shift()];
                }
                return (cache[key + " "] = value);
            }
            return cache;
        }

        function markFunction(fn) {
            fn[expando] = true;
            return fn;
        }

        function assert(fn) {
            var div = document.createElement("div");
            try {
                return !!fn(div);
            } catch (e) {
                return false;
            } finally {
                if (div.parentNode) {
                    div.parentNode.removeChild(div);
                }
                div = null;
            }
        }

        function addHandle(attrs, handler) {
            var arr = attrs.split("|"),
                i = attrs.length;
            while (i--) {
                Expr.attrHandle[arr[i]] = handler;
            }
        }

        function siblingCheck(a, b) {
            var cur = b && a,
                diff = cur && a.nodeType === 1 && b.nodeType === 1 && (~b.sourceIndex || MAX_NEGATIVE) -
                    (~a.sourceIndex || MAX_NEGATIVE);
            if (diff) {
                return diff;
            }
            if (cur) {
                while ((cur = cur.nextSibling)) {
                    if (cur === b) {
                        return -1;
                    }
                }
            }
            return a ? 1 : -1;
        }

        function createInputPseudo(type) {
            return function(elem) {
                var name = elem.nodeName.toLowerCase();
                return name === "input" && elem.type === type;
            };
        }

        function createButtonPseudo(type) {
            return function(elem) {
                var name = elem.nodeName.toLowerCase();
                return (name === "input" || name === "button") && elem.type === type;
            };
        }

        function createPositionalPseudo(fn) {
            return markFunction(function(argument) {
                argument = +argument;
                return markFunction(function(seed, matches) {
                    var j, matchIndexes = fn([], seed.length, argument),
                        i = matchIndexes.length;
                    while (i--) {
                        if (seed[(j = matchIndexes[i])]) {
                            seed[j] = !(matches[j] = seed[j]);
                        }
                    }
                });
            });
        }

        function testContext(context) {
            return context && typeof context.getElementsByTagName !== "undefined" && context;
        }
        support = Sizzle.support = {};
        isXML = Sizzle.isXML = function(elem) {
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
        };
        setDocument = Sizzle.setDocument = function(node) {
            var hasCompare, parent, doc = node ? node.ownerDocument || node : preferredDoc;
            if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
                return document;
            }
            document = doc;
            docElem = doc.documentElement;
            parent = doc.defaultView;
            if (parent && parent !== parent.top) {
                if (parent.addEventListener) {
                    parent.addEventListener("unload", unloadHandler, false);
                } else if (parent.attachEvent) {
                    parent.attachEvent("onunload", unloadHandler);
                }
            }
            documentIsHTML = !isXML(doc);
            support.attributes = assert(function(div) {
                div.className = "i";
                return !div.getAttribute("className");
            });
            support.getElementsByTagName = assert(function(div) {
                div.appendChild(doc.createComment(""));
                return !div.getElementsByTagName("*").length;
            });
            support.getElementsByClassName = rnative.test(doc.getElementsByClassName);
            support.getById = assert(function(div) {
                docElem.appendChild(div).id = expando;
                return !doc.getElementsByName || !doc.getElementsByName(expando).length;
            });
            if (support.getById) {
                Expr.find["ID"] = function(id, context) {
                    if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                        var m = context.getElementById(id);
                        return m && m.parentNode ? [m] : [];
                    }
                };
                Expr.filter["ID"] = function(id) {
                    var attrId = id.replace(runescape, funescape);
                    return function(elem) {
                        return elem.getAttribute("id") === attrId;
                    };
                };
            } else {
                delete Expr.find["ID"];
                Expr.filter["ID"] = function(id) {
                    var attrId = id.replace(runescape, funescape);
                    return function(elem) {
                        var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                        return node && node.value === attrId;
                    };
                };
            }
            Expr.find["TAG"] = support.getElementsByTagName ? function(tag, context) {
                    if (typeof context.getElementsByTagName !== "undefined") {
                        return context.getElementsByTagName(tag);
                    } else if (support.qsa) {
                        return context.querySelectorAll(tag);
                    }
                } : function(tag, context) {
                    var elem, tmp = [],
                        i = 0,
                        results = context.getElementsByTagName(tag);
                    if (tag === "*") {
                        while ((elem = results[i++])) {
                            if (elem.nodeType === 1) {
                                tmp.push(elem);
                            }
                        }
                        return tmp;
                    }
                    return results;
                };
            Expr.find["CLASS"] = support.getElementsByClassName && function(className, context) {
                    if (documentIsHTML) {
                        return context.getElementsByClassName(className);
                    }
                };
            rbuggyMatches = [];
            rbuggyQSA = [];
            if ((support.qsa = rnative.test(doc.querySelectorAll))) {
                assert(function(div) {
                    docElem.appendChild(div).innerHTML = "<a id='" + expando + "'></a>" + "<select id='" + expando + "-\f]' msallowcapture=''>" + "<option selected=''></option></select>";
                    if (div.querySelectorAll("[msallowcapture^='']").length) {
                        rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
                    }
                    if (!div.querySelectorAll("[selected]").length) {
                        rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
                    }
                    if (!div.querySelectorAll("[id~=" + expando + "-]").length) {
                        rbuggyQSA.push("~=");
                    }
                    if (!div.querySelectorAll(":checked").length) {
                        rbuggyQSA.push(":checked");
                    }
                    if (!div.querySelectorAll("a#" + expando + "+*").length) {
                        rbuggyQSA.push(".#.+[+~]");
                    }
                });
                assert(function(div) {
                    var input = doc.createElement("input");
                    input.setAttribute("type", "hidden");
                    div.appendChild(input).setAttribute("name", "D");
                    if (div.querySelectorAll("[name=d]").length) {
                        rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
                    }
                    if (!div.querySelectorAll(":enabled").length) {
                        rbuggyQSA.push(":enabled", ":disabled");
                    }
                    div.querySelectorAll("*,:x");
                    rbuggyQSA.push(",.*:");
                });
            }
            if ((support.matchesSelector = rnative.test((matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)))) {
                assert(function(div) {
                    support.disconnectedMatch = matches.call(div, "div");
                    matches.call(div, "[s!='']:x");
                    rbuggyMatches.push("!=", pseudos);
                });
            }
            rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
            rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));
            hasCompare = rnative.test(docElem.compareDocumentPosition);
            contains = hasCompare || rnative.test(docElem.contains) ? function(a, b) {
                    var adown = a.nodeType === 9 ? a.documentElement : a,
                        bup = b && b.parentNode;
                    return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
                } : function(a, b) {
                    if (b) {
                        while ((b = b.parentNode)) {
                            if (b === a) {
                                return true;
                            }
                        }
                    }
                    return false;
                };
            sortOrder = hasCompare ? function(a, b) {
                    if (a === b) {
                        hasDuplicate = true;
                        return 0;
                    }
                    var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                    if (compare) {
                        return compare;
                    }
                    compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1;
                    if (compare & 1 || (!support.sortDetached && b.compareDocumentPosition(a) === compare)) {
                        if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
                            return -1;
                        }
                        if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
                            return 1;
                        }
                        return sortInput ? (indexOf(sortInput, a) - indexOf(sortInput, b)) : 0;
                    }
                    return compare & 4 ? -1 : 1;
                } : function(a, b) {
                    if (a === b) {
                        hasDuplicate = true;
                        return 0;
                    }
                    var cur, i = 0,
                        aup = a.parentNode,
                        bup = b.parentNode,
                        ap = [a],
                        bp = [b];
                    if (!aup || !bup) {
                        return a === doc ? -1 : b === doc ? 1 : aup ? -1 : bup ? 1 : sortInput ? (indexOf(sortInput, a) - indexOf(sortInput, b)) : 0;
                    } else if (aup === bup) {
                        return siblingCheck(a, b);
                    }
                    cur = a;
                    while ((cur = cur.parentNode)) {
                        ap.unshift(cur);
                    }
                    cur = b;
                    while ((cur = cur.parentNode)) {
                        bp.unshift(cur);
                    }
                    while (ap[i] === bp[i]) {
                        i++;
                    }
                    return i ? siblingCheck(ap[i], bp[i]) : ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
                };
            return doc;
        };
        Sizzle.matches = function(expr, elements) {
            return Sizzle(expr, null, null, elements);
        };
        Sizzle.matchesSelector = function(elem, expr) {
            if ((elem.ownerDocument || elem) !== document) {
                setDocument(elem);
            }
            expr = expr.replace(rattributeQuotes, "='$1']");
            if (support.matchesSelector && documentIsHTML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
                try {
                    var ret = matches.call(elem, expr);
                    if (ret || support.disconnectedMatch || elem.document && elem.document.nodeType !== 11) {
                        return ret;
                    }
                } catch (e) {}
            }
            return Sizzle(expr, document, null, [elem]).length > 0;
        };
        Sizzle.contains = function(context, elem) {
            if ((context.ownerDocument || context) !== document) {
                setDocument(context);
            }
            return contains(context, elem);
        };
        Sizzle.attr = function(elem, name) {
            if ((elem.ownerDocument || elem) !== document) {
                setDocument(elem);
            }
            var fn = Expr.attrHandle[name.toLowerCase()],
                val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : undefined;
            return val !== undefined ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
        };
        Sizzle.error = function(msg) {
            throw new Error("Syntax error, unrecognized expression: " + msg);
        };
        Sizzle.uniqueSort = function(results) {
            var elem, duplicates = [],
                j = 0,
                i = 0;
            hasDuplicate = !support.detectDuplicates;
            sortInput = !support.sortStable && results.slice(0);
            results.sort(sortOrder);
            if (hasDuplicate) {
                while ((elem = results[i++])) {
                    if (elem === results[i]) {
                        j = duplicates.push(i);
                    }
                }
                while (j--) {
                    results.splice(duplicates[j], 1);
                }
            }
            sortInput = null;
            return results;
        };
        getText = Sizzle.getText = function(elem) {
            var node, ret = "",
                i = 0,
                nodeType = elem.nodeType;
            if (!nodeType) {
                while ((node = elem[i++])) {
                    ret += getText(node);
                }
            } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                if (typeof elem.textContent === "string") {
                    return elem.textContent;
                } else {
                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                        ret += getText(elem);
                    }
                }
            } else if (nodeType === 3 || nodeType === 4) {
                return elem.nodeValue;
            }
            return ret;
        };
        Expr = Sizzle.selectors = {
            cacheLength: 50,
            createPseudo: markFunction,
            match: matchExpr,
            attrHandle: {},
            find: {},
            relative: {
                ">": {
                    dir: "parentNode",
                    first: true
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: true
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                "ATTR": function(match) {
                    match[1] = match[1].replace(runescape, funescape);
                    match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);
                    if (match[2] === "~=") {
                        match[3] = " " + match[3] + " ";
                    }
                    return match.slice(0, 4);
                },
                "CHILD": function(match) {
                    match[1] = match[1].toLowerCase();
                    if (match[1].slice(0, 3) === "nth") {
                        if (!match[3]) {
                            Sizzle.error(match[0]);
                        }
                        match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
                        match[5] = +((match[7] + match[8]) || match[3] === "odd");
                    } else if (match[3]) {
                        Sizzle.error(match[0]);
                    }
                    return match;
                },
                "PSEUDO": function(match) {
                    var excess, unquoted = !match[6] && match[2];
                    if (matchExpr["CHILD"].test(match[0])) {
                        return null;
                    }
                    if (match[3]) {
                        match[2] = match[4] || match[5] || "";
                    } else if (unquoted && rpseudo.test(unquoted) && (excess = tokenize(unquoted, true)) && (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
                        match[0] = match[0].slice(0, excess);
                        match[2] = unquoted.slice(0, excess);
                    }
                    return match.slice(0, 3);
                }
            },
            filter: {
                "TAG": function(nodeNameSelector) {
                    var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                    return nodeNameSelector === "*" ? function() {
                            return true;
                        } : function(elem) {
                            return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                        };
                },
                "CLASS": function(className) {
                    var pattern = classCache[className + " "];
                    return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
                            return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");
                        });
                },
                "ATTR": function(name, operator, check) {
                    return function(elem) {
                        var result = Sizzle.attr(elem, name);
                        if (result == null) {
                            return operator === "!=";
                        }
                        if (!operator) {
                            return true;
                        }
                        result += "";
                        return operator === "=" ? result === check : operator === "!=" ? result !== check : operator === "^=" ? check && result.indexOf(check) === 0 : operator === "*=" ? check && result.indexOf(check) > -1 : operator === "$=" ? check && result.slice(-check.length) === check : operator === "~=" ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 : operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
                    };
                },
                "CHILD": function(type, what, argument, first, last) {
                    var simple = type.slice(0, 3) !== "nth",
                        forward = type.slice(-4) !== "last",
                        ofType = what === "of-type";
                    return first === 1 && last === 0 ? function(elem) {
                            return !!elem.parentNode;
                        } : function(elem, context, xml) {
                            var cache, outerCache, node, diff, nodeIndex, start, dir = simple !== forward ? "nextSibling" : "previousSibling",
                                parent = elem.parentNode,
                                name = ofType && elem.nodeName.toLowerCase(),
                                useCache = !xml && !ofType;
                            if (parent) {
                                if (simple) {
                                    while (dir) {
                                        node = elem;
                                        while ((node = node[dir])) {
                                            if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                                                return false;
                                            }
                                        }
                                        start = dir = type === "only" && !start && "nextSibling";
                                    }
                                    return true;
                                }
                                start = [forward ? parent.firstChild : parent.lastChild];
                                if (forward && useCache) {
                                    outerCache = parent[expando] || (parent[expando] = {});
                                    cache = outerCache[type] || [];
                                    nodeIndex = cache[0] === dirruns && cache[1];
                                    diff = cache[0] === dirruns && cache[2];
                                    node = nodeIndex && parent.childNodes[nodeIndex];
                                    while ((node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop())) {
                                        if (node.nodeType === 1 && ++diff && node === elem) {
                                            outerCache[type] = [dirruns, nodeIndex, diff];
                                            break;
                                        }
                                    }
                                } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
                                    diff = cache[1];
                                } else {
                                    while ((node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop())) {
                                        if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                                            if (useCache) {
                                                (node[expando] || (node[expando] = {}))[type] = [dirruns, diff];
                                            }
                                            if (node === elem) {
                                                break;
                                            }
                                        }
                                    }
                                }
                                diff -= last;
                                return diff === first || (diff % first === 0 && diff / first >= 0);
                            }
                        };
                },
                "PSEUDO": function(pseudo, argument) {
                    var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo);
                    if (fn[expando]) {
                        return fn(argument);
                    }
                    if (fn.length > 1) {
                        args = [pseudo, pseudo, "", argument];
                        return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(seed, matches) {
                                var idx, matched = fn(seed, argument),
                                    i = matched.length;
                                while (i--) {
                                    idx = indexOf(seed, matched[i]);
                                    seed[idx] = !(matches[idx] = matched[i]);
                                }
                            }) : function(elem) {
                                return fn(elem, 0, args);
                            };
                    }
                    return fn;
                }
            },
            pseudos: {
                "not": markFunction(function(selector) {
                    var input = [],
                        results = [],
                        matcher = compile(selector.replace(rtrim, "$1"));
                    return matcher[expando] ? markFunction(function(seed, matches, context, xml) {
                            var elem, unmatched = matcher(seed, null, xml, []),
                                i = seed.length;
                            while (i--) {
                                if ((elem = unmatched[i])) {
                                    seed[i] = !(matches[i] = elem);
                                }
                            }
                        }) : function(elem, context, xml) {
                            input[0] = elem;
                            matcher(input, null, xml, results);
                            input[0] = null;
                            return !results.pop();
                        };
                }),
                "has": markFunction(function(selector) {
                    return function(elem) {
                        return Sizzle(selector, elem).length > 0;
                    };
                }),
                "contains": markFunction(function(text) {
                    text = text.replace(runescape, funescape);
                    return function(elem) {
                        return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
                    };
                }),
                "lang": markFunction(function(lang) {
                    if (!ridentifier.test(lang || "")) {
                        Sizzle.error("unsupported lang: " + lang);
                    }
                    lang = lang.replace(runescape, funescape).toLowerCase();
                    return function(elem) {
                        var elemLang;
                        do {
                            if ((elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang"))) {
                                elemLang = elemLang.toLowerCase();
                                return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
                            }
                        } while ((elem = elem.parentNode) && elem.nodeType === 1);
                        return false;
                    };
                }),
                "target": function(elem) {
                    var hash = window.location && window.location.hash;
                    return hash && hash.slice(1) === elem.id;
                },
                "root": function(elem) {
                    return elem === docElem;
                },
                "focus": function(elem) {
                    return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
                },
                "enabled": function(elem) {
                    return elem.disabled === false;
                },
                "disabled": function(elem) {
                    return elem.disabled === true;
                },
                "checked": function(elem) {
                    var nodeName = elem.nodeName.toLowerCase();
                    return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
                },
                "selected": function(elem) {
                    if (elem.parentNode) {
                        elem.parentNode.selectedIndex;
                    }
                    return elem.selected === true;
                },
                "empty": function(elem) {
                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                        if (elem.nodeType < 6) {
                            return false;
                        }
                    }
                    return true;
                },
                "parent": function(elem) {
                    return !Expr.pseudos["empty"](elem);
                },
                "header": function(elem) {
                    return rheader.test(elem.nodeName);
                },
                "input": function(elem) {
                    return rinputs.test(elem.nodeName);
                },
                "button": function(elem) {
                    var name = elem.nodeName.toLowerCase();
                    return name === "input" && elem.type === "button" || name === "button";
                },
                "text": function(elem) {
                    var attr;
                    return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
                },
                "first": createPositionalPseudo(function() {
                    return [0];
                }),
                "last": createPositionalPseudo(function(matchIndexes, length) {
                    return [length - 1];
                }),
                "eq": createPositionalPseudo(function(matchIndexes, length, argument) {
                    return [argument < 0 ? argument + length : argument];
                }),
                "even": createPositionalPseudo(function(matchIndexes, length) {
                    var i = 0;
                    for (; i < length; i += 2) {
                        matchIndexes.push(i);
                    }
                    return matchIndexes;
                }),
                "odd": createPositionalPseudo(function(matchIndexes, length) {
                    var i = 1;
                    for (; i < length; i += 2) {
                        matchIndexes.push(i);
                    }
                    return matchIndexes;
                }),
                "lt": createPositionalPseudo(function(matchIndexes, length, argument) {
                    var i = argument < 0 ? argument + length : argument;
                    for (; --i >= 0;) {
                        matchIndexes.push(i);
                    }
                    return matchIndexes;
                }),
                "gt": createPositionalPseudo(function(matchIndexes, length, argument) {
                    var i = argument < 0 ? argument + length : argument;
                    for (; ++i < length;) {
                        matchIndexes.push(i);
                    }
                    return matchIndexes;
                })
            }
        };
        Expr.pseudos["nth"] = Expr.pseudos["eq"];
        for (i in {
            radio: true,
            checkbox: true,
            file: true,
            password: true,
            image: true
        }) {
            Expr.pseudos[i] = createInputPseudo(i);
        }
        for (i in {
            submit: true,
            reset: true
        }) {
            Expr.pseudos[i] = createButtonPseudo(i);
        }

        function setFilters() {}
        setFilters.prototype = Expr.filters = Expr.pseudos;
        Expr.setFilters = new setFilters();
        tokenize = Sizzle.tokenize = function(selector, parseOnly) {
            var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + " "];
            if (cached) {
                return parseOnly ? 0 : cached.slice(0);
            }
            soFar = selector;
            groups = [];
            preFilters = Expr.preFilter;
            while (soFar) {
                if (!matched || (match = rcomma.exec(soFar))) {
                    if (match) {
                        soFar = soFar.slice(match[0].length) || soFar;
                    }
                    groups.push((tokens = []));
                }
                matched = false;
                if ((match = rcombinators.exec(soFar))) {
                    matched = match.shift();
                    tokens.push({
                        value: matched,
                        type: match[0].replace(rtrim, " ")
                    });
                    soFar = soFar.slice(matched.length);
                }
                for (type in Expr.filter) {
                    if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
                        matched = match.shift();
                        tokens.push({
                            value: matched,
                            type: type,
                            matches: match
                        });
                        soFar = soFar.slice(matched.length);
                    }
                }
                if (!matched) {
                    break;
                }
            }
            return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : tokenCache(selector, groups).slice(0);
        };

        function toSelector(tokens) {
            var i = 0,
                len = tokens.length,
                selector = "";
            for (; i < len; i++) {
                selector += tokens[i].value;
            }
            return selector;
        }

        function addCombinator(matcher, combinator, base) {
            var dir = combinator.dir,
                checkNonElements = base && dir === "parentNode",
                doneName = done++;
            return combinator.first ? function(elem, context, xml) {
                    while ((elem = elem[dir])) {
                        if (elem.nodeType === 1 || checkNonElements) {
                            return matcher(elem, context, xml);
                        }
                    }
                } : function(elem, context, xml) {
                    var oldCache, outerCache, newCache = [dirruns, doneName];
                    if (xml) {
                        while ((elem = elem[dir])) {
                            if (elem.nodeType === 1 || checkNonElements) {
                                if (matcher(elem, context, xml)) {
                                    return true;
                                }
                            }
                        }
                    } else {
                        while ((elem = elem[dir])) {
                            if (elem.nodeType === 1 || checkNonElements) {
                                outerCache = elem[expando] || (elem[expando] = {});
                                if ((oldCache = outerCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                                    return (newCache[2] = oldCache[2]);
                                } else {
                                    outerCache[dir] = newCache;
                                    if ((newCache[2] = matcher(elem, context, xml))) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                };
        }

        function elementMatcher(matchers) {
            return matchers.length > 1 ? function(elem, context, xml) {
                    var i = matchers.length;
                    while (i--) {
                        if (!matchers[i](elem, context, xml)) {
                            return false;
                        }
                    }
                    return true;
                } : matchers[0];
        }

        function multipleContexts(selector, contexts, results) {
            var i = 0,
                len = contexts.length;
            for (; i < len; i++) {
                Sizzle(selector, contexts[i], results);
            }
            return results;
        }

        function condense(unmatched, map, filter, context, xml) {
            var elem, newUnmatched = [],
                i = 0,
                len = unmatched.length,
                mapped = map != null;
            for (; i < len; i++) {
                if ((elem = unmatched[i])) {
                    if (!filter || filter(elem, context, xml)) {
                        newUnmatched.push(elem);
                        if (mapped) {
                            map.push(i);
                        }
                    }
                }
            }
            return newUnmatched;
        }

        function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
            if (postFilter && !postFilter[expando]) {
                postFilter = setMatcher(postFilter);
            }
            if (postFinder && !postFinder[expando]) {
                postFinder = setMatcher(postFinder, postSelector);
            }
            return markFunction(function(seed, results, context, xml) {
                var temp, i, elem, preMap = [],
                    postMap = [],
                    preexisting = results.length,
                    elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),
                    matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems,
                    matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
                if (matcher) {
                    matcher(matcherIn, matcherOut, context, xml);
                }
                if (postFilter) {
                    temp = condense(matcherOut, postMap);
                    postFilter(temp, [], context, xml);
                    i = temp.length;
                    while (i--) {
                        if ((elem = temp[i])) {
                            matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
                        }
                    }
                }
                if (seed) {
                    if (postFinder || preFilter) {
                        if (postFinder) {
                            temp = [];
                            i = matcherOut.length;
                            while (i--) {
                                if ((elem = matcherOut[i])) {
                                    temp.push((matcherIn[i] = elem));
                                }
                            }
                            postFinder(null, (matcherOut = []), temp, xml);
                        }
                        i = matcherOut.length;
                        while (i--) {
                            if ((elem = matcherOut[i]) && (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1) {
                                seed[temp] = !(results[temp] = elem);
                            }
                        }
                    }
                } else {
                    matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
                    if (postFinder) {
                        postFinder(null, results, matcherOut, xml);
                    } else {
                        push.apply(results, matcherOut);
                    }
                }
            });
        }

        function matcherFromTokens(tokens) {
            var checkContext, matcher, j, len = tokens.length,
                leadingRelative = Expr.relative[tokens[0].type],
                implicitRelative = leadingRelative || Expr.relative[" "],
                i = leadingRelative ? 1 : 0,
                matchContext = addCombinator(function(elem) {
                    return elem === checkContext;
                }, implicitRelative, true),
                matchAnyContext = addCombinator(function(elem) {
                    return indexOf(checkContext, elem) > -1;
                }, implicitRelative, true),
                matchers = [function(elem, context, xml) {
                    var ret = (!leadingRelative && (xml || context !== outermostContext)) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
                    checkContext = null;
                    return ret;
                }];
            for (; i < len; i++) {
                if ((matcher = Expr.relative[tokens[i].type])) {
                    matchers = [addCombinator(elementMatcher(matchers), matcher)];
                } else {
                    matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);
                    if (matcher[expando]) {
                        j = ++i;
                        for (; j < len; j++) {
                            if (Expr.relative[tokens[j].type]) {
                                break;
                            }
                        }
                        return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(tokens.slice(0, i - 1).concat({
                                value: tokens[i - 2].type === " " ? "*" : ""
                            })).replace(rtrim, "$1"), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens((tokens = tokens.slice(j))), j < len && toSelector(tokens));
                    }
                    matchers.push(matcher);
                }
            }
            return elementMatcher(matchers);
        }

        function matcherFromGroupMatchers(elementMatchers, setMatchers) {
            var bySet = setMatchers.length > 0,
                byElement = elementMatchers.length > 0,
                superMatcher = function(seed, context, xml, results, outermost) {
                    var elem, j, matcher, matchedCount = 0,
                        i = "0",
                        unmatched = seed && [],
                        setMatched = [],
                        contextBackup = outermostContext,
                        elems = seed || byElement && Expr.find["TAG"]("*", outermost),
                        dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
                        len = elems.length;
                    if (outermost) {
                        outermostContext = context !== document && context;
                    }
                    for (; i !== len && (elem = elems[i]) != null; i++) {
                        if (byElement && elem) {
                            j = 0;
                            while ((matcher = elementMatchers[j++])) {
                                if (matcher(elem, context, xml)) {
                                    results.push(elem);
                                    break;
                                }
                            }
                            if (outermost) {
                                dirruns = dirrunsUnique;
                            }
                        }
                        if (bySet) {
                            if ((elem = !matcher && elem)) {
                                matchedCount--;
                            }
                            if (seed) {
                                unmatched.push(elem);
                            }
                        }
                    }
                    matchedCount += i;
                    if (bySet && i !== matchedCount) {
                        j = 0;
                        while ((matcher = setMatchers[j++])) {
                            matcher(unmatched, setMatched, context, xml);
                        }
                        if (seed) {
                            if (matchedCount > 0) {
                                while (i--) {
                                    if (!(unmatched[i] || setMatched[i])) {
                                        setMatched[i] = pop.call(results);
                                    }
                                }
                            }
                            setMatched = condense(setMatched);
                        }
                        push.apply(results, setMatched);
                        if (outermost && !seed && setMatched.length > 0 && (matchedCount + setMatchers.length) > 1) {
                            Sizzle.uniqueSort(results);
                        }
                    }
                    if (outermost) {
                        dirruns = dirrunsUnique;
                        outermostContext = contextBackup;
                    }
                    return unmatched;
                };
            return bySet ? markFunction(superMatcher) : superMatcher;
        }
        compile = Sizzle.compile = function(selector, match) {
            var i, setMatchers = [],
                elementMatchers = [],
                cached = compilerCache[selector + " "];
            if (!cached) {
                if (!match) {
                    match = tokenize(selector);
                }
                i = match.length;
                while (i--) {
                    cached = matcherFromTokens(match[i]);
                    if (cached[expando]) {
                        setMatchers.push(cached);
                    } else {
                        elementMatchers.push(cached);
                    }
                }
                cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
                cached.selector = selector;
            }
            return cached;
        };
        select = Sizzle.select = function(selector, context, results, seed) {
            var i, tokens, token, type, find, compiled = typeof selector === "function" && selector,
                match = !seed && tokenize((selector = compiled.selector || selector));
            results = results || [];
            if (match.length === 1) {
                tokens = match[0] = match[0].slice(0);
                if (tokens.length > 2 && (token = tokens[0]).type === "ID" && support.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
                    context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
                    if (!context) {
                        return results;
                    } else if (compiled) {
                        context = context.parentNode;
                    }
                    selector = selector.slice(tokens.shift().value.length);
                }
                i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
                while (i--) {
                    token = tokens[i];
                    if (Expr.relative[(type = token.type)]) {
                        break;
                    }
                    if ((find = Expr.find[type])) {
                        if ((seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context))) {
                            tokens.splice(i, 1);
                            selector = seed.length && toSelector(tokens);
                            if (!selector) {
                                push.apply(results, seed);
                                return results;
                            }
                            break;
                        }
                    }
                }
            }
            (compiled || compile(selector, match))(seed, context, !documentIsHTML, results, rsibling.test(selector) && testContext(context.parentNode) || context);
            return results;
        };
        support.sortStable = expando.split("").sort(sortOrder).join("") === expando;
        support.detectDuplicates = !!hasDuplicate;
        setDocument();
        support.sortDetached = assert(function(div1) {
            return div1.compareDocumentPosition(document.createElement("div")) & 1;
        });
        if (!assert(function(div) {
                div.innerHTML = "<a href='#'></a>";
                return div.firstChild.getAttribute("href") === "#";
            })) {
            addHandle("type|href|height|width", function(elem, name, isXML) {
                if (!isXML) {
                    return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
                }
            });
        }
        if (!support.attributes || !assert(function(div) {
                div.innerHTML = "<input/>";
                div.firstChild.setAttribute("value", "");
                return div.firstChild.getAttribute("value") === "";
            })) {
            addHandle("value", function(elem, name, isXML) {
                if (!isXML && elem.nodeName.toLowerCase() === "input") {
                    return elem.defaultValue;
                }
            });
        }
        if (!assert(function(div) {
                return div.getAttribute("disabled") == null;
            })) {
            addHandle(booleans, function(elem, name, isXML) {
                var val;
                if (!isXML) {
                    return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
                }
            });
        }
        return Sizzle;
    })(window);
    jQuery.find = Sizzle;
    jQuery.expr = Sizzle.selectors;
    jQuery.expr[":"] = jQuery.expr.pseudos;
    jQuery.unique = Sizzle.uniqueSort;
    jQuery.text = Sizzle.getText;
    jQuery.isXMLDoc = Sizzle.isXML;
    jQuery.contains = Sizzle.contains;
    var rneedsContext = jQuery.expr.match.needsContext;
    var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);
    var risSimple = /^.[^:#\[\.,]*$/;

    function winnow(elements, qualifier, not) {
        if (jQuery.isFunction(qualifier)) {
            return jQuery.grep(elements, function(elem, i) {
                return !!qualifier.call(elem, i, elem) !== not;
            });
        }
        if (qualifier.nodeType) {
            return jQuery.grep(elements, function(elem) {
                return (elem === qualifier) !== not;
            });
        }
        if (typeof qualifier === "string") {
            if (risSimple.test(qualifier)) {
                return jQuery.filter(qualifier, elements, not);
            }
            qualifier = jQuery.filter(qualifier, elements);
        }
        return jQuery.grep(elements, function(elem) {
            return (jQuery.inArray(elem, qualifier) >= 0) !== not;
        });
    }
    jQuery.filter = function(expr, elems, not) {
        var elem = elems[0];
        if (not) {
            expr = ":not(" + expr + ")";
        }
        return elems.length === 1 && elem.nodeType === 1 ? jQuery.find.matchesSelector(elem, expr) ? [elem] : [] : jQuery.find.matches(expr, jQuery.grep(elems, function(elem) {
                return elem.nodeType === 1;
            }));
    };
    jQuery.fn.extend({
        find: function(selector) {
            var i, ret = [],
                self = this,
                len = self.length;
            if (typeof selector !== "string") {
                return this.pushStack(jQuery(selector).filter(function() {
                    for (i = 0; i < len; i++) {
                        if (jQuery.contains(self[i], this)) {
                            return true;
                        }
                    }
                }));
            }
            for (i = 0; i < len; i++) {
                jQuery.find(selector, self[i], ret);
            }
            ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
            ret.selector = this.selector ? this.selector + " " + selector : selector;
            return ret;
        },
        filter: function(selector) {
            return this.pushStack(winnow(this, selector || [], false));
        },
        not: function(selector) {
            return this.pushStack(winnow(this, selector || [], true));
        },
        is: function(selector) {
            return !!winnow(this, typeof selector === "string" && rneedsContext.test(selector) ? jQuery(selector) : selector || [], false).length;
        }
    });
    var rootjQuery, document = window.document,
        rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
        init = jQuery.fn.init = function(selector, context) {
            var match, elem;
            if (!selector) {
                return this;
            }
            if (typeof selector === "string") {
                if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
                    match = [null, selector, null];
                } else {
                    match = rquickExpr.exec(selector);
                }
                if (match && (match[1] || !context)) {
                    if (match[1]) {
                        context = context instanceof jQuery ? context[0] : context;
                        jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));
                        if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
                            for (match in context) {
                                if (jQuery.isFunction(this[match])) {
                                    this[match](context[match]);
                                } else {
                                    this.attr(match, context[match]);
                                }
                            }
                        }
                        return this;
                    } else {
                        elem = document.getElementById(match[2]);
                        if (elem && elem.parentNode) {
                            if (elem.id !== match[2]) {
                                return rootjQuery.find(selector);
                            }
                            this.length = 1;
                            this[0] = elem;
                        }
                        this.context = document;
                        this.selector = selector;
                        return this;
                    }
                } else if (!context || context.jquery) {
                    return (context || rootjQuery).find(selector);
                } else {
                    return this.constructor(context).find(selector);
                }
            } else if (selector.nodeType) {
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            } else if (jQuery.isFunction(selector)) {
                return typeof rootjQuery.ready !== "undefined" ? rootjQuery.ready(selector) : selector(jQuery);
            }
            if (selector.selector !== undefined) {
                this.selector = selector.selector;
                this.context = selector.context;
            }
            return jQuery.makeArray(selector, this);
        };
    init.prototype = jQuery.fn;
    rootjQuery = jQuery(document);
    var rparentsprev = /^(?:parents|prev(?:Until|All))/,
        guaranteedUnique = {
            children: true,
            contents: true,
            next: true,
            prev: true
        };
    jQuery.extend({
        dir: function(elem, dir, until) {
            var matched = [],
                cur = elem[dir];
            while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until))) {
                if (cur.nodeType === 1) {
                    matched.push(cur);
                }
                cur = cur[dir];
            }
            return matched;
        },
        sibling: function(n, elem) {
            var r = [];
            for (; n; n = n.nextSibling) {
                if (n.nodeType === 1 && n !== elem) {
                    r.push(n);
                }
            }
            return r;
        }
    });
    jQuery.fn.extend({
        has: function(target) {
            var i, targets = jQuery(target, this),
                len = targets.length;
            return this.filter(function() {
                for (i = 0; i < len; i++) {
                    if (jQuery.contains(this, targets[i])) {
                        return true;
                    }
                }
            });
        },
        closest: function(selectors, context) {
            var cur, i = 0,
                l = this.length,
                matched = [],
                pos = rneedsContext.test(selectors) || typeof selectors !== "string" ? jQuery(selectors, context || this.context) : 0;
            for (; i < l; i++) {
                for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
                    if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 : cur.nodeType === 1 && jQuery.find.matchesSelector(cur, selectors))) {
                        matched.push(cur);
                        break;
                    }
                }
            }
            return this.pushStack(matched.length > 1 ? jQuery.unique(matched) : matched);
        },
        index: function(elem) {
            if (!elem) {
                return (this[0] && this[0].parentNode) ? this.first().prevAll().length : -1;
            }
            if (typeof elem === "string") {
                return jQuery.inArray(this[0], jQuery(elem));
            }
            return jQuery.inArray(elem.jquery ? elem[0] : elem, this);
        },
        add: function(selector, context) {
            return this.pushStack(jQuery.unique(jQuery.merge(this.get(), jQuery(selector, context))));
        },
        addBack: function(selector) {
            return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
        }
    });

    function sibling(cur, dir) {
        do {
            cur = cur[dir];
        } while (cur && cur.nodeType !== 1);
        return cur;
    }
    jQuery.each({
        parent: function(elem) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
        },
        parents: function(elem) {
            return jQuery.dir(elem, "parentNode");
        },
        parentsUntil: function(elem, i, until) {
            return jQuery.dir(elem, "parentNode", until);
        },
        next: function(elem) {
            return sibling(elem, "nextSibling");
        },
        prev: function(elem) {
            return sibling(elem, "previousSibling");
        },
        nextAll: function(elem) {
            return jQuery.dir(elem, "nextSibling");
        },
        prevAll: function(elem) {
            return jQuery.dir(elem, "previousSibling");
        },
        nextUntil: function(elem, i, until) {
            return jQuery.dir(elem, "nextSibling", until);
        },
        prevUntil: function(elem, i, until) {
            return jQuery.dir(elem, "previousSibling", until);
        },
        siblings: function(elem) {
            return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
        },
        children: function(elem) {
            return jQuery.sibling(elem.firstChild);
        },
        contents: function(elem) {
            return jQuery.nodeName(elem, "iframe") ? elem.contentDocument || elem.contentWindow.document : jQuery.merge([], elem.childNodes);
        }
    }, function(name, fn) {
        jQuery.fn[name] = function(until, selector) {
            var ret = jQuery.map(this, fn, until);
            if (name.slice(-5) !== "Until") {
                selector = until;
            }
            if (selector && typeof selector === "string") {
                ret = jQuery.filter(selector, ret);
            }
            if (this.length > 1) {
                if (!guaranteedUnique[name]) {
                    ret = jQuery.unique(ret);
                }
                if (rparentsprev.test(name)) {
                    ret = ret.reverse();
                }
            }
            return this.pushStack(ret);
        };
    });
    var rnotwhite = (/\S+/g);
    var optionsCache = {};

    function createOptions(options) {
        var object = optionsCache[options] = {};
        jQuery.each(options.match(rnotwhite) || [], function(_, flag) {
            object[flag] = true;
        });
        return object;
    }
    jQuery.Callbacks = function(options) {
        options = typeof options === "string" ? (optionsCache[options] || createOptions(options)) : jQuery.extend({}, options);
        var
            firing, memory, fired, firingLength, firingIndex, firingStart, list = [],
            stack = !options.once && [],
            fire = function(data) {
                memory = options.memory && data;
                fired = true;
                firingIndex = firingStart || 0;
                firingStart = 0;
                firingLength = list.length;
                firing = true;
                for (; list && firingIndex < firingLength; firingIndex++) {
                    if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                        memory = false;
                        break;
                    }
                }
                firing = false;
                if (list) {
                    if (stack) {
                        if (stack.length) {
                            fire(stack.shift());
                        }
                    } else if (memory) {
                        list = [];
                    } else {
                        self.disable();
                    }
                }
            },
            self = {
                add: function() {
                    if (list) {
                        var start = list.length;
                        (function add(args) {
                            jQuery.each(args, function(_, arg) {
                                var type = jQuery.type(arg);
                                if (type === "function") {
                                    if (!options.unique || !self.has(arg)) {
                                        list.push(arg);
                                    }
                                } else if (arg && arg.length && type !== "string") {
                                    add(arg);
                                }
                            });
                        })(arguments);
                        if (firing) {
                            firingLength = list.length;
                        } else if (memory) {
                            firingStart = start;
                            fire(memory);
                        }
                    }
                    return this;
                },
                remove: function() {
                    if (list) {
                        jQuery.each(arguments, function(_, arg) {
                            var index;
                            while ((index = jQuery.inArray(arg, list, index)) > -1) {
                                list.splice(index, 1);
                                if (firing) {
                                    if (index <= firingLength) {
                                        firingLength--;
                                    }
                                    if (index <= firingIndex) {
                                        firingIndex--;
                                    }
                                }
                            }
                        });
                    }
                    return this;
                },
                has: function(fn) {
                    return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
                },
                empty: function() {
                    list = [];
                    firingLength = 0;
                    return this;
                },
                disable: function() {
                    list = stack = memory = undefined;
                    return this;
                },
                disabled: function() {
                    return !list;
                },
                lock: function() {
                    stack = undefined;
                    if (!memory) {
                        self.disable();
                    }
                    return this;
                },
                locked: function() {
                    return !stack;
                },
                fireWith: function(context, args) {
                    if (list && (!fired || stack)) {
                        args = args || [];
                        args = [context, args.slice ? args.slice() : args];
                        if (firing) {
                            stack.push(args);
                        } else {
                            fire(args);
                        }
                    }
                    return this;
                },
                fire: function() {
                    self.fireWith(this, arguments);
                    return this;
                },
                fired: function() {
                    return !!fired;
                }
            };
        return self;
    };
    jQuery.extend({
        Deferred: function(func) {
            var tuples = [
                    ["resolve", "done", jQuery.Callbacks("once memory"), "resolved"],
                    ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"],
                    ["notify", "progress", jQuery.Callbacks("memory")]
                ],
                state = "pending",
                promise = {
                    state: function() {
                        return state;
                    },
                    always: function() {
                        deferred.done(arguments).fail(arguments);
                        return this;
                    },
                    then: function() {
                        var fns = arguments;
                        return jQuery.Deferred(function(newDefer) {
                            jQuery.each(tuples, function(i, tuple) {
                                var fn = jQuery.isFunction(fns[i]) && fns[i];
                                deferred[tuple[1]](function() {
                                    var returned = fn && fn.apply(this, arguments);
                                    if (returned && jQuery.isFunction(returned.promise)) {
                                        returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);
                                    } else {
                                        newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
                                    }
                                });
                            });
                            fns = null;
                        }).promise();
                    },
                    promise: function(obj) {
                        return obj != null ? jQuery.extend(obj, promise) : promise;
                    }
                },
                deferred = {};
            promise.pipe = promise.then;
            jQuery.each(tuples, function(i, tuple) {
                var list = tuple[2],
                    stateString = tuple[3];
                promise[tuple[1]] = list.add;
                if (stateString) {
                    list.add(function() {
                        state = stateString;
                    }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
                }
                deferred[tuple[0]] = function() {
                    deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
                    return this;
                };
                deferred[tuple[0] + "With"] = list.fireWith;
            });
            promise.promise(deferred);
            if (func) {
                func.call(deferred, deferred);
            }
            return deferred;
        },
        when: function(subordinate) {
            var i = 0,
                resolveValues = slice.call(arguments),
                length = resolveValues.length,
                remaining = length !== 1 || (subordinate && jQuery.isFunction(subordinate.promise)) ? length : 0,
                deferred = remaining === 1 ? subordinate : jQuery.Deferred(),
                updateFunc = function(i, contexts, values) {
                    return function(value) {
                        contexts[i] = this;
                        values[i] = arguments.length > 1 ? slice.call(arguments) : value;
                        if (values === progressValues) {
                            deferred.notifyWith(contexts, values);
                        } else if (!(--remaining)) {
                            deferred.resolveWith(contexts, values);
                        }
                    };
                },
                progressValues, progressContexts, resolveContexts;
            if (length > 1) {
                progressValues = new Array(length);
                progressContexts = new Array(length);
                resolveContexts = new Array(length);
                for (; i < length; i++) {
                    if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
                        resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues));
                    } else {
                        --remaining;
                    }
                }
            }
            if (!remaining) {
                deferred.resolveWith(resolveContexts, resolveValues);
            }
            return deferred.promise();
        }
    });
    var readyList;
    jQuery.fn.ready = function(fn) {
        jQuery.ready.promise().done(fn);
        return this;
    };
    jQuery.extend({
        isReady: false,
        readyWait: 1,
        holdReady: function(hold) {
            if (hold) {
                jQuery.readyWait++;
            } else {
                jQuery.ready(true);
            }
        },
        ready: function(wait) {
            if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
                return;
            }
            if (!document.body) {
                return setTimeout(jQuery.ready);
            }
            jQuery.isReady = true;
            if (wait !== true && --jQuery.readyWait > 0) {
                return;
            }
            readyList.resolveWith(document, [jQuery]);
            if (jQuery.fn.triggerHandler) {
                jQuery(document).triggerHandler("ready");
                jQuery(document).off("ready");
            }
        }
    });

    function detach() {
        if (document.addEventListener) {
            document.removeEventListener("DOMContentLoaded", completed, false);
            window.removeEventListener("load", completed, false);
        } else {
            document.detachEvent("onreadystatechange", completed);
            window.detachEvent("onload", completed);
        }
    }

    function completed() {
        if (document.addEventListener || event.type === "load" || document.readyState === "complete") {
            detach();
            jQuery.ready();
        }
    }
    jQuery.ready.promise = function(obj) {
        if (!readyList) {
            readyList = jQuery.Deferred();
            if (document.readyState === "complete") {
                setTimeout(jQuery.ready);
            } else if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", completed, false);
                window.addEventListener("load", completed, false);
            } else {
                document.attachEvent("onreadystatechange", completed);
                window.attachEvent("onload", completed);
                var top = false;
                try {
                    top = window.frameElement == null && document.documentElement;
                } catch (e) {}
                if (top && top.doScroll) {
                    (function doScrollCheck() {
                        if (!jQuery.isReady) {
                            try {
                                top.doScroll("left");
                            } catch (e) {
                                return setTimeout(doScrollCheck, 50);
                            }
                            detach();
                            jQuery.ready();
                        }
                    })();
                }
            }
        }
        return readyList.promise(obj);
    };
    var strundefined = typeof undefined;
    var i;
    for (i in jQuery(support)) {
        break;
    }
    support.ownLast = i !== "0";
    support.inlineBlockNeedsLayout = false;
    jQuery(function() {
        var val, div, body, container;
        body = document.getElementsByTagName("body")[0];
        if (!body || !body.style) {
            return;
        }
        div = document.createElement("div");
        container = document.createElement("div");
        container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
        body.appendChild(container).appendChild(div);
        if (typeof div.style.zoom !== strundefined) {
            div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1";
            support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;
            if (val) {
                body.style.zoom = 1;
            }
        }
        body.removeChild(container);
    });
    (function() {
        var div = document.createElement("div");
        if (support.deleteExpando == null) {
            support.deleteExpando = true;
            try {
                delete div.test;
            } catch (e) {
                support.deleteExpando = false;
            }
        }
        div = null;
    })();
    jQuery.acceptData = function(elem) {
        var noData = jQuery.noData[(elem.nodeName + " ").toLowerCase()],
            nodeType = +elem.nodeType || 1;
        return nodeType !== 1 && nodeType !== 9 ? false : !noData || noData !== true && elem.getAttribute("classid") === noData;
    };
    var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
        rmultiDash = /([A-Z])/g;

    function dataAttr(elem, key, data) {
        if (data === undefined && elem.nodeType === 1) {
            var name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();
            data = elem.getAttribute(name);
            if (typeof data === "string") {
                try {
                    data = data === "true" ? true : data === "false" ? false : data === "null" ? null : +data + "" === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
                } catch (e) {}
                jQuery.data(elem, key, data);
            } else {
                data = undefined;
            }
        }
        return data;
    }

    function isEmptyDataObject(obj) {
        var name;
        for (name in obj) {
            if (name === "data" && jQuery.isEmptyObject(obj[name])) {
                continue;
            }
            if (name !== "toJSON") {
                return false;
            }
        }
        return true;
    }

    function internalData(elem, name, data, pvt) {
        if (!jQuery.acceptData(elem)) {
            return;
        }
        var ret, thisCache, internalKey = jQuery.expando,
            isNode = elem.nodeType,
            cache = isNode ? jQuery.cache : elem,
            id = isNode ? elem[internalKey] : elem[internalKey] && internalKey;
        if ((!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === "string") {
            return;
        }
        if (!id) {
            if (isNode) {
                id = elem[internalKey] = deletedIds.pop() || jQuery.guid++;
            } else {
                id = internalKey;
            }
        }
        if (!cache[id]) {
            cache[id] = isNode ? {} : {
                    toJSON: jQuery.noop
                };
        }
        if (typeof name === "object" || typeof name === "function") {
            if (pvt) {
                cache[id] = jQuery.extend(cache[id], name);
            } else {
                cache[id].data = jQuery.extend(cache[id].data, name);
            }
        }
        thisCache = cache[id];
        if (!pvt) {
            if (!thisCache.data) {
                thisCache.data = {};
            }
            thisCache = thisCache.data;
        }
        if (data !== undefined) {
            thisCache[jQuery.camelCase(name)] = data;
        }
        if (typeof name === "string") {
            ret = thisCache[name];
            if (ret == null) {
                ret = thisCache[jQuery.camelCase(name)];
            }
        } else {
            ret = thisCache;
        }
        return ret;
    }

    function internalRemoveData(elem, name, pvt) {
        if (!jQuery.acceptData(elem)) {
            return;
        }
        var thisCache, i, isNode = elem.nodeType,
            cache = isNode ? jQuery.cache : elem,
            id = isNode ? elem[jQuery.expando] : jQuery.expando;
        if (!cache[id]) {
            return;
        }
        if (name) {
            thisCache = pvt ? cache[id] : cache[id].data;
            if (thisCache) {
                if (!jQuery.isArray(name)) {
                    if (name in thisCache) {
                        name = [name];
                    } else {
                        name = jQuery.camelCase(name);
                        if (name in thisCache) {
                            name = [name];
                        } else {
                            name = name.split(" ");
                        }
                    }
                } else {
                    name = name.concat(jQuery.map(name, jQuery.camelCase));
                }
                i = name.length;
                while (i--) {
                    delete thisCache[name[i]];
                }
                if (pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache)) {
                    return;
                }
            }
        }
        if (!pvt) {
            delete cache[id].data;
            if (!isEmptyDataObject(cache[id])) {
                return;
            }
        }
        if (isNode) {
            jQuery.cleanData([elem], true);
        } else if (support.deleteExpando || cache != cache.window) {
            delete cache[id];
        } else {
            cache[id] = null;
        }
    }
    jQuery.extend({
        cache: {},
        noData: {
            "applet ": true,
            "embed ": true,
            "object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
        },
        hasData: function(elem) {
            elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando];
            return !!elem && !isEmptyDataObject(elem);
        },
        data: function(elem, name, data) {
            return internalData(elem, name, data);
        },
        removeData: function(elem, name) {
            return internalRemoveData(elem, name);
        },
        _data: function(elem, name, data) {
            return internalData(elem, name, data, true);
        },
        _removeData: function(elem, name) {
            return internalRemoveData(elem, name, true);
        }
    });
    jQuery.fn.extend({
        data: function(key, value) {
            var i, name, data, elem = this[0],
                attrs = elem && elem.attributes;
            if (key === undefined) {
                if (this.length) {
                    data = jQuery.data(elem);
                    if (elem.nodeType === 1 && !jQuery._data(elem, "parsedAttrs")) {
                        i = attrs.length;
                        while (i--) {
                            if (attrs[i]) {
                                name = attrs[i].name;
                                if (name.indexOf("data-") === 0) {
                                    name = jQuery.camelCase(name.slice(5));
                                    dataAttr(elem, name, data[name]);
                                }
                            }
                        }
                        jQuery._data(elem, "parsedAttrs", true);
                    }
                }
                return data;
            }
            if (typeof key === "object") {
                return this.each(function() {
                    jQuery.data(this, key);
                });
            }
            return arguments.length > 1 ? this.each(function() {
                    jQuery.data(this, key, value);
                }) : elem ? dataAttr(elem, key, jQuery.data(elem, key)) : undefined;
        },
        removeData: function(key) {
            return this.each(function() {
                jQuery.removeData(this, key);
            });
        }
    });
    jQuery.extend({
        queue: function(elem, type, data) {
            var queue;
            if (elem) {
                type = (type || "fx") + "queue";
                queue = jQuery._data(elem, type);
                if (data) {
                    if (!queue || jQuery.isArray(data)) {
                        queue = jQuery._data(elem, type, jQuery.makeArray(data));
                    } else {
                        queue.push(data);
                    }
                }
                return queue || [];
            }
        },
        dequeue: function(elem, type) {
            type = type || "fx";
            var queue = jQuery.queue(elem, type),
                startLength = queue.length,
                fn = queue.shift(),
                hooks = jQuery._queueHooks(elem, type),
                next = function() {
                    jQuery.dequeue(elem, type);
                };
            if (fn === "inprogress") {
                fn = queue.shift();
                startLength--;
            }
            if (fn) {
                if (type === "fx") {
                    queue.unshift("inprogress");
                }
                delete hooks.stop;
                fn.call(elem, next, hooks);
            }
            if (!startLength && hooks) {
                hooks.empty.fire();
            }
        },
        _queueHooks: function(elem, type) {
            var key = type + "queueHooks";
            return jQuery._data(elem, key) || jQuery._data(elem, key, {
                    empty: jQuery.Callbacks("once memory").add(function() {
                        jQuery._removeData(elem, type + "queue");
                        jQuery._removeData(elem, key);
                    })
                });
        }
    });
    jQuery.fn.extend({
        queue: function(type, data) {
            var setter = 2;
            if (typeof type !== "string") {
                data = type;
                type = "fx";
                setter--;
            }
            if (arguments.length < setter) {
                return jQuery.queue(this[0], type);
            }
            return data === undefined ? this : this.each(function() {
                    var queue = jQuery.queue(this, type, data);
                    jQuery._queueHooks(this, type);
                    if (type === "fx" && queue[0] !== "inprogress") {
                        jQuery.dequeue(this, type);
                    }
                });
        },
        dequeue: function(type) {
            return this.each(function() {
                jQuery.dequeue(this, type);
            });
        },
        clearQueue: function(type) {
            return this.queue(type || "fx", []);
        },
        promise: function(type, obj) {
            var tmp, count = 1,
                defer = jQuery.Deferred(),
                elements = this,
                i = this.length,
                resolve = function() {
                    if (!(--count)) {
                        defer.resolveWith(elements, [elements]);
                    }
                };
            if (typeof type !== "string") {
                obj = type;
                type = undefined;
            }
            type = type || "fx";
            while (i--) {
                tmp = jQuery._data(elements[i], type + "queueHooks");
                if (tmp && tmp.empty) {
                    count++;
                    tmp.empty.add(resolve);
                }
            }
            resolve();
            return defer.promise(obj);
        }
    });
    var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;
    var cssExpand = ["Top", "Right", "Bottom", "Left"];
    var isHidden = function(elem, el) {
        elem = el || elem;
        return jQuery.css(elem, "display") === "none" || !jQuery.contains(elem.ownerDocument, elem);
    };
    var access = jQuery.access = function(elems, fn, key, value, chainable, emptyGet, raw) {
        var i = 0,
            length = elems.length,
            bulk = key == null;
        if (jQuery.type(key) === "object") {
            chainable = true;
            for (i in key) {
                jQuery.access(elems, fn, i, key[i], true, emptyGet, raw);
            }
        } else if (value !== undefined) {
            chainable = true;
            if (!jQuery.isFunction(value)) {
                raw = true;
            }
            if (bulk) {
                if (raw) {
                    fn.call(elems, value);
                    fn = null;
                } else {
                    bulk = fn;
                    fn = function(elem, key, value) {
                        return bulk.call(jQuery(elem), value);
                    };
                }
            }
            if (fn) {
                for (; i < length; i++) {
                    fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
                }
            }
        }
        return chainable ? elems : bulk ? fn.call(elems) : length ? fn(elems[0], key) : emptyGet;
    };
    var rcheckableType = (/^(?:checkbox|radio)$/i);
    (function() {
        var input = document.createElement("input"),
            div = document.createElement("div"),
            fragment = document.createDocumentFragment();
        div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
        support.leadingWhitespace = div.firstChild.nodeType === 3;
        support.tbody = !div.getElementsByTagName("tbody").length;
        support.htmlSerialize = !!div.getElementsByTagName("link").length;
        support.html5Clone = document.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>";
        input.type = "checkbox";
        input.checked = true;
        fragment.appendChild(input);
        support.appendChecked = input.checked;
        div.innerHTML = "<textarea>x</textarea>";
        support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
        fragment.appendChild(div);
        div.innerHTML = "<input type='radio' checked='checked' name='t'/>";
        support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
        support.noCloneEvent = true;
        if (div.attachEvent) {
            div.attachEvent("onclick", function() {
                support.noCloneEvent = false;
            });
            div.cloneNode(true).click();
        }
        if (support.deleteExpando == null) {
            support.deleteExpando = true;
            try {
                delete div.test;
            } catch (e) {
                support.deleteExpando = false;
            }
        }
    })();
    (function() {
        var i, eventName, div = document.createElement("div");
        for (i in {
            submit: true,
            change: true,
            focusin: true
        }) {
            eventName = "on" + i;
            if (!(support[i + "Bubbles"] = eventName in window)) {
                div.setAttribute(eventName, "t");
                support[i + "Bubbles"] = div.attributes[eventName].expando === false;
            }
        }
        div = null;
    })();
    var rformElems = /^(?:input|select|textarea)$/i,
        rkeyEvent = /^key/,
        rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
        rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
        rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

    function returnTrue() {
        return true;
    }

    function returnFalse() {
        return false;
    }

    function safeActiveElement() {
        try {
            return document.activeElement;
        } catch (err) {}
    }
    jQuery.event = {
        global: {},
        add: function(elem, types, handler, data, selector) {
            var tmp, events, t, handleObjIn, special, eventHandle, handleObj, handlers, type, namespaces, origType, elemData = jQuery._data(elem);
            if (!elemData) {
                return;
            }
            if (handler.handler) {
                handleObjIn = handler;
                handler = handleObjIn.handler;
                selector = handleObjIn.selector;
            }
            if (!handler.guid) {
                handler.guid = jQuery.guid++;
            }
            if (!(events = elemData.events)) {
                events = elemData.events = {};
            }
            if (!(eventHandle = elemData.handle)) {
                eventHandle = elemData.handle = function(e) {
                    return typeof jQuery !== strundefined && (!e || jQuery.event.triggered !== e.type) ? jQuery.event.dispatch.apply(eventHandle.elem, arguments) : undefined;
                };
                eventHandle.elem = elem;
            }
            types = (types || "").match(rnotwhite) || [""];
            t = types.length;
            while (t--) {
                tmp = rtypenamespace.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = (tmp[2] || "").split(".").sort();
                if (!type) {
                    continue;
                }
                special = jQuery.event.special[type] || {};
                type = (selector ? special.delegateType : special.bindType) || type;
                special = jQuery.event.special[type] || {};
                handleObj = jQuery.extend({
                    type: type,
                    origType: origType,
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    needsContext: selector && jQuery.expr.match.needsContext.test(selector),
                    namespace: namespaces.join(".")
                }, handleObjIn);
                if (!(handlers = events[type])) {
                    handlers = events[type] = [];
                    handlers.delegateCount = 0;
                    if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                        if (elem.addEventListener) {
                            elem.addEventListener(type, eventHandle, false);
                        } else if (elem.attachEvent) {
                            elem.attachEvent("on" + type, eventHandle);
                        }
                    }
                }
                if (special.add) {
                    special.add.call(elem, handleObj);
                    if (!handleObj.handler.guid) {
                        handleObj.handler.guid = handler.guid;
                    }
                }
                if (selector) {
                    handlers.splice(handlers.delegateCount++, 0, handleObj);
                } else {
                    handlers.push(handleObj);
                }
                jQuery.event.global[type] = true;
            }
            elem = null;
        },
        remove: function(elem, types, handler, selector, mappedTypes) {
            var j, handleObj, tmp, origCount, t, events, special, handlers, type, namespaces, origType, elemData = jQuery.hasData(elem) && jQuery._data(elem);
            if (!elemData || !(events = elemData.events)) {
                return;
            }
            types = (types || "").match(rnotwhite) || [""];
            t = types.length;
            while (t--) {
                tmp = rtypenamespace.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = (tmp[2] || "").split(".").sort();
                if (!type) {
                    for (type in events) {
                        jQuery.event.remove(elem, type + types[t], handler, selector, true);
                    }
                    continue;
                }
                special = jQuery.event.special[type] || {};
                type = (selector ? special.delegateType : special.bindType) || type;
                handlers = events[type] || [];
                tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
                origCount = j = handlers.length;
                while (j--) {
                    handleObj = handlers[j];
                    if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
                        handlers.splice(j, 1);
                        if (handleObj.selector) {
                            handlers.delegateCount--;
                        }
                        if (special.remove) {
                            special.remove.call(elem, handleObj);
                        }
                    }
                }
                if (origCount && !handlers.length) {
                    if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                        jQuery.removeEvent(elem, type, elemData.handle);
                    }
                    delete events[type];
                }
            }
            if (jQuery.isEmptyObject(events)) {
                delete elemData.handle;
                jQuery._removeData(elem, "events");
            }
        },
        trigger: function(event, data, elem, onlyHandlers) {
            var handle, ontype, cur, bubbleType, special, tmp, i, eventPath = [elem || document],
                type = hasOwn.call(event, "type") ? event.type : event,
                namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
            cur = tmp = elem = elem || document;
            if (elem.nodeType === 3 || elem.nodeType === 8) {
                return;
            }
            if (rfocusMorph.test(type + jQuery.event.triggered)) {
                return;
            }
            if (type.indexOf(".") >= 0) {
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }
            ontype = type.indexOf(":") < 0 && "on" + type;
            event = event[jQuery.expando] ? event : new jQuery.Event(type, typeof event === "object" && event);
            event.isTrigger = onlyHandlers ? 2 : 3;
            event.namespace = namespaces.join(".");
            event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
            event.result = undefined;
            if (!event.target) {
                event.target = elem;
            }
            data = data == null ? [event] : jQuery.makeArray(data, [event]);
            special = jQuery.event.special[type] || {};
            if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
                return;
            }
            if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
                bubbleType = special.delegateType || type;
                if (!rfocusMorph.test(bubbleType + type)) {
                    cur = cur.parentNode;
                }
                for (; cur; cur = cur.parentNode) {
                    eventPath.push(cur);
                    tmp = cur;
                }
                if (tmp === (elem.ownerDocument || document)) {
                    eventPath.push(tmp.defaultView || tmp.parentWindow || window);
                }
            }
            i = 0;
            while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
                event.type = i > 1 ? bubbleType : special.bindType || type;
                handle = (jQuery._data(cur, "events") || {})[event.type] && jQuery._data(cur, "handle");
                if (handle) {
                    handle.apply(cur, data);
                }
                handle = ontype && cur[ontype];
                if (handle && handle.apply && jQuery.acceptData(cur)) {
                    event.result = handle.apply(cur, data);
                    if (event.result === false) {
                        event.preventDefault();
                    }
                }
            }
            event.type = type;
            if (!onlyHandlers && !event.isDefaultPrevented()) {
                if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && jQuery.acceptData(elem)) {
                    if (ontype && elem[type] && !jQuery.isWindow(elem)) {
                        tmp = elem[ontype];
                        if (tmp) {
                            elem[ontype] = null;
                        }
                        jQuery.event.triggered = type;
                        try {
                            elem[type]();
                        } catch (e) {}
                        jQuery.event.triggered = undefined;
                        if (tmp) {
                            elem[ontype] = tmp;
                        }
                    }
                }
            }
            return event.result;
        },
        dispatch: function(event) {
            event = jQuery.event.fix(event);
            var i, ret, handleObj, matched, j, handlerQueue = [],
                args = slice.call(arguments),
                handlers = (jQuery._data(this, "events") || {})[event.type] || [],
                special = jQuery.event.special[event.type] || {};
            args[0] = event;
            event.delegateTarget = this;
            if (special.preDispatch && special.preDispatch.call(this, event) === false) {
                return;
            }
            handlerQueue = jQuery.event.handlers.call(this, event, handlers);
            i = 0;
            while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
                event.currentTarget = matched.elem;
                j = 0;
                while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
                    if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {
                        event.handleObj = handleObj;
                        event.data = handleObj.data;
                        ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
                        if (ret !== undefined) {
                            if ((event.result = ret) === false) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }
                    }
                }
            }
            if (special.postDispatch) {
                special.postDispatch.call(this, event);
            }
            return event.result;
        },
        handlers: function(event, handlers) {
            var sel, handleObj, matches, i, handlerQueue = [],
                delegateCount = handlers.delegateCount,
                cur = event.target;
            if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {
                for (; cur != this; cur = cur.parentNode || this) {
                    if (cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click")) {
                        matches = [];
                        for (i = 0; i < delegateCount; i++) {
                            handleObj = handlers[i];
                            sel = handleObj.selector + " ";
                            if (matches[sel] === undefined) {
                                matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) >= 0 : jQuery.find(sel, this, null, [cur]).length;
                            }
                            if (matches[sel]) {
                                matches.push(handleObj);
                            }
                        }
                        if (matches.length) {
                            handlerQueue.push({
                                elem: cur,
                                handlers: matches
                            });
                        }
                    }
                }
            }
            if (delegateCount < handlers.length) {
                handlerQueue.push({
                    elem: this,
                    handlers: handlers.slice(delegateCount)
                });
            }
            return handlerQueue;
        },
        fix: function(event) {
            if (event[jQuery.expando]) {
                return event;
            }
            var i, prop, copy, type = event.type,
                originalEvent = event,
                fixHook = this.fixHooks[type];
            if (!fixHook) {
                this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {};
            }
            copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
            event = new jQuery.Event(originalEvent);
            i = copy.length;
            while (i--) {
                prop = copy[i];
                event[prop] = originalEvent[prop];
            }
            if (!event.target) {
                event.target = originalEvent.srcElement || document;
            }
            if (event.target.nodeType === 3) {
                event.target = event.target.parentNode;
            }
            event.metaKey = !!event.metaKey;
            return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
        },
        props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(event, original) {
                if (event.which == null) {
                    event.which = original.charCode != null ? original.charCode : original.keyCode;
                }
                return event;
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(event, original) {
                var body, eventDoc, doc, button = original.button,
                    fromElement = original.fromElement;
                if (event.pageX == null && original.clientX != null) {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;
                    event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                    event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
                }
                if (!event.relatedTarget && fromElement) {
                    event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
                }
                if (!event.which && button !== undefined) {
                    event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
                }
                return event;
            }
        },
        special: {
            load: {
                noBubble: true
            },
            focus: {
                trigger: function() {
                    if (this !== safeActiveElement() && this.focus) {
                        try {
                            this.focus();
                            return false;
                        } catch (e) {}
                    }
                },
                delegateType: "focusin"
            },
            blur: {
                trigger: function() {
                    if (this === safeActiveElement() && this.blur) {
                        this.blur();
                        return false;
                    }
                },
                delegateType: "focusout"
            },
            click: {
                trigger: function() {
                    if (jQuery.nodeName(this, "input") && this.type === "checkbox" && this.click) {
                        this.click();
                        return false;
                    }
                },
                _default: function(event) {
                    return jQuery.nodeName(event.target, "a");
                }
            },
            beforeunload: {
                postDispatch: function(event) {
                    if (event.result !== undefined && event.originalEvent) {
                        event.originalEvent.returnValue = event.result;
                    }
                }
            }
        },
        simulate: function(type, elem, event, bubble) {
            var e = jQuery.extend(new jQuery.Event(), event, {
                type: type,
                isSimulated: true,
                originalEvent: {}
            });
            if (bubble) {
                jQuery.event.trigger(e, null, elem);
            } else {
                jQuery.event.dispatch.call(elem, e);
            }
            if (e.isDefaultPrevented()) {
                event.preventDefault();
            }
        }
    };
    jQuery.removeEvent = document.removeEventListener ? function(elem, type, handle) {
            if (elem.removeEventListener) {
                elem.removeEventListener(type, handle, false);
            }
        } : function(elem, type, handle) {
            var name = "on" + type;
            if (elem.detachEvent) {
                if (typeof elem[name] === strundefined) {
                    elem[name] = null;
                }
                elem.detachEvent(name, handle);
            }
        };
    jQuery.Event = function(src, props) {
        if (!(this instanceof jQuery.Event)) {
            return new jQuery.Event(src, props);
        }
        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
            this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined && src.returnValue === false ? returnTrue : returnFalse;
        } else {
            this.type = src;
        }
        if (props) {
            jQuery.extend(this, props);
        }
        this.timeStamp = src && src.timeStamp || jQuery.now();
        this[jQuery.expando] = true;
    };
    jQuery.Event.prototype = {
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,
        preventDefault: function() {
            var e = this.originalEvent;
            this.isDefaultPrevented = returnTrue;
            if (!e) {
                return;
            }
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        },
        stopPropagation: function() {
            var e = this.originalEvent;
            this.isPropagationStopped = returnTrue;
            if (!e) {
                return;
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            e.cancelBubble = true;
        },
        stopImmediatePropagation: function() {
            var e = this.originalEvent;
            this.isImmediatePropagationStopped = returnTrue;
            if (e && e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            }
            this.stopPropagation();
        }
    };
    jQuery.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        pointerenter: "pointerover",
        pointerleave: "pointerout"
    }, function(orig, fix) {
        jQuery.event.special[orig] = {
            delegateType: fix,
            bindType: fix,
            handle: function(event) {
                var ret, target = this,
                    related = event.relatedTarget,
                    handleObj = event.handleObj;
                if (!related || (related !== target && !jQuery.contains(target, related))) {
                    event.type = handleObj.origType;
                    ret = handleObj.handler.apply(this, arguments);
                    event.type = fix;
                }
                return ret;
            }
        };
    });
    if (!support.submitBubbles) {
        jQuery.event.special.submit = {
            setup: function() {
                if (jQuery.nodeName(this, "form")) {
                    return false;
                }
                jQuery.event.add(this, "click._submit keypress._submit", function(e) {
                    var elem = e.target,
                        form = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : undefined;
                    if (form && !jQuery._data(form, "submitBubbles")) {
                        jQuery.event.add(form, "submit._submit", function(event) {
                            event._submit_bubble = true;
                        });
                        jQuery._data(form, "submitBubbles", true);
                    }
                });
            },
            postDispatch: function(event) {
                if (event._submit_bubble) {
                    delete event._submit_bubble;
                    if (this.parentNode && !event.isTrigger) {
                        jQuery.event.simulate("submit", this.parentNode, event, true);
                    }
                }
            },
            teardown: function() {
                if (jQuery.nodeName(this, "form")) {
                    return false;
                }
                jQuery.event.remove(this, "._submit");
            }
        };
    }
    if (!support.changeBubbles) {
        jQuery.event.special.change = {
            setup: function() {
                if (rformElems.test(this.nodeName)) {
                    if (this.type === "checkbox" || this.type === "radio") {
                        jQuery.event.add(this, "propertychange._change", function(event) {
                            if (event.originalEvent.propertyName === "checked") {
                                this._just_changed = true;
                            }
                        });
                        jQuery.event.add(this, "click._change", function(event) {
                            if (this._just_changed && !event.isTrigger) {
                                this._just_changed = false;
                            }
                            jQuery.event.simulate("change", this, event, true);
                        });
                    }
                    return false;
                }
                jQuery.event.add(this, "beforeactivate._change", function(e) {
                    var elem = e.target;
                    if (rformElems.test(elem.nodeName) && !jQuery._data(elem, "changeBubbles")) {
                        jQuery.event.add(elem, "change._change", function(event) {
                            if (this.parentNode && !event.isSimulated && !event.isTrigger) {
                                jQuery.event.simulate("change", this.parentNode, event, true);
                            }
                        });
                        jQuery._data(elem, "changeBubbles", true);
                    }
                });
            },
            handle: function(event) {
                var elem = event.target;
                if (this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox")) {
                    return event.handleObj.handler.apply(this, arguments);
                }
            },
            teardown: function() {
                jQuery.event.remove(this, "._change");
                return !rformElems.test(this.nodeName);
            }
        };
    }
    if (!support.focusinBubbles) {
        jQuery.each({
            focus: "focusin",
            blur: "focusout"
        }, function(orig, fix) {
            var handler = function(event) {
                jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
            };
            jQuery.event.special[fix] = {
                setup: function() {
                    var doc = this.ownerDocument || this,
                        attaches = jQuery._data(doc, fix);
                    if (!attaches) {
                        doc.addEventListener(orig, handler, true);
                    }
                    jQuery._data(doc, fix, (attaches || 0) + 1);
                },
                teardown: function() {
                    var doc = this.ownerDocument || this,
                        attaches = jQuery._data(doc, fix) - 1;
                    if (!attaches) {
                        doc.removeEventListener(orig, handler, true);
                        jQuery._removeData(doc, fix);
                    } else {
                        jQuery._data(doc, fix, attaches);
                    }
                }
            };
        });
    }
    jQuery.fn.extend({
        on: function(types, selector, data, fn, one) {
            var type, origFn;
            if (typeof types === "object") {
                if (typeof selector !== "string") {
                    data = data || selector;
                    selector = undefined;
                }
                for (type in types) {
                    this.on(type, selector, data, types[type], one);
                }
                return this;
            }
            if (data == null && fn == null) {
                fn = selector;
                data = selector = undefined;
            } else if (fn == null) {
                if (typeof selector === "string") {
                    fn = data;
                    data = undefined;
                } else {
                    fn = data;
                    data = selector;
                    selector = undefined;
                }
            }
            if (fn === false) {
                fn = returnFalse;
            } else if (!fn) {
                return this;
            }
            if (one === 1) {
                origFn = fn;
                fn = function(event) {
                    jQuery().off(event);
                    return origFn.apply(this, arguments);
                };
                fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
            }
            return this.each(function() {
                jQuery.event.add(this, types, fn, data, selector);
            });
        },
        one: function(types, selector, data, fn) {
            return this.on(types, selector, data, fn, 1);
        },
        off: function(types, selector, fn) {
            var handleObj, type;
            if (types && types.preventDefault && types.handleObj) {
                handleObj = types.handleObj;
                jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
                return this;
            }
            if (typeof types === "object") {
                for (type in types) {
                    this.off(type, selector, types[type]);
                }
                return this;
            }
            if (selector === false || typeof selector === "function") {
                fn = selector;
                selector = undefined;
            }
            if (fn === false) {
                fn = returnFalse;
            }
            return this.each(function() {
                jQuery.event.remove(this, types, fn, selector);
            });
        },
        trigger: function(type, data) {
            return this.each(function() {
                jQuery.event.trigger(type, data, this);
            });
        },
        triggerHandler: function(type, data) {
            var elem = this[0];
            if (elem) {
                return jQuery.event.trigger(type, data, elem, true);
            }
        }
    });

    function createSafeFragment(document) {
        var list = nodeNames.split("|"),
            safeFrag = document.createDocumentFragment();
        if (safeFrag.createElement) {
            while (list.length) {
                safeFrag.createElement(list.pop());
            }
        }
        return safeFrag;
    }
    var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" + "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
        rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
        rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
        rleadingWhitespace = /^\s+/,
        rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        rtagName = /<([\w:]+)/,
        rtbody = /<tbody/i,
        rhtml = /<|&#?\w+;/,
        rnoInnerhtml = /<(?:script|style|link)/i,
        rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
        rscriptType = /^$|\/(?:java|ecma)script/i,
        rscriptTypeMasked = /^true\/(.*)/,
        rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
        wrapMap = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            legend: [1, "<fieldset>", "</fieldset>"],
            area: [1, "<map>", "</map>"],
            param: [1, "<object>", "</object>"],
            thead: [1, "<table>", "</table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            _default: support.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"]
        },
        safeFragment = createSafeFragment(document),
        fragmentDiv = safeFragment.appendChild(document.createElement("div"));
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;

    function getAll(context, tag) {
        var elems, elem, i = 0,
            found = typeof context.getElementsByTagName !== strundefined ? context.getElementsByTagName(tag || "*") : typeof context.querySelectorAll !== strundefined ? context.querySelectorAll(tag || "*") : undefined;
        if (!found) {
            for (found = [], elems = context.childNodes || context;
                 (elem = elems[i]) != null; i++) {
                if (!tag || jQuery.nodeName(elem, tag)) {
                    found.push(elem);
                } else {
                    jQuery.merge(found, getAll(elem, tag));
                }
            }
        }
        return tag === undefined || tag && jQuery.nodeName(context, tag) ? jQuery.merge([context], found) : found;
    }

    function fixDefaultChecked(elem) {
        if (rcheckableType.test(elem.type)) {
            elem.defaultChecked = elem.checked;
        }
    }

    function manipulationTarget(elem, content) {
        return jQuery.nodeName(elem, "table") && jQuery.nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr") ? elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")) : elem;
    }

    function disableScript(elem) {
        elem.type = (jQuery.find.attr(elem, "type") !== null) + "/" + elem.type;
        return elem;
    }

    function restoreScript(elem) {
        var match = rscriptTypeMasked.exec(elem.type);
        if (match) {
            elem.type = match[1];
        } else {
            elem.removeAttribute("type");
        }
        return elem;
    }

    function setGlobalEval(elems, refElements) {
        var elem, i = 0;
        for (;
            (elem = elems[i]) != null; i++) {
            jQuery._data(elem, "globalEval", !refElements || jQuery._data(refElements[i], "globalEval"));
        }
    }

    function cloneCopyEvent(src, dest) {
        if (dest.nodeType !== 1 || !jQuery.hasData(src)) {
            return;
        }
        var type, i, l, oldData = jQuery._data(src),
            curData = jQuery._data(dest, oldData),
            events = oldData.events;
        if (events) {
            delete curData.handle;
            curData.events = {};
            for (type in events) {
                for (i = 0, l = events[type].length; i < l; i++) {
                    jQuery.event.add(dest, type, events[type][i]);
                }
            }
        }
        if (curData.data) {
            curData.data = jQuery.extend({}, curData.data);
        }
    }

    function fixCloneNodeIssues(src, dest) {
        var nodeName, e, data;
        if (dest.nodeType !== 1) {
            return;
        }
        nodeName = dest.nodeName.toLowerCase();
        if (!support.noCloneEvent && dest[jQuery.expando]) {
            data = jQuery._data(dest);
            for (e in data.events) {
                jQuery.removeEvent(dest, e, data.handle);
            }
            dest.removeAttribute(jQuery.expando);
        }
        if (nodeName === "script" && dest.text !== src.text) {
            disableScript(dest).text = src.text;
            restoreScript(dest);
        } else if (nodeName === "object") {
            if (dest.parentNode) {
                dest.outerHTML = src.outerHTML;
            }
            if (support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML))) {
                dest.innerHTML = src.innerHTML;
            }
        } else if (nodeName === "input" && rcheckableType.test(src.type)) {
            dest.defaultChecked = dest.checked = src.checked;
            if (dest.value !== src.value) {
                dest.value = src.value;
            }
        } else if (nodeName === "option") {
            dest.defaultSelected = dest.selected = src.defaultSelected;
        } else if (nodeName === "input" || nodeName === "textarea") {
            dest.defaultValue = src.defaultValue;
        }
    }
    jQuery.extend({
        clone: function(elem, dataAndEvents, deepDataAndEvents) {
            var destElements, node, clone, i, srcElements, inPage = jQuery.contains(elem.ownerDocument, elem);
            if (support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test("<" + elem.nodeName + ">")) {
                clone = elem.cloneNode(true);
            } else {
                fragmentDiv.innerHTML = elem.outerHTML;
                fragmentDiv.removeChild(clone = fragmentDiv.firstChild);
            }
            if ((!support.noCloneEvent || !support.noCloneChecked) && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
                destElements = getAll(clone);
                srcElements = getAll(elem);
                for (i = 0;
                     (node = srcElements[i]) != null; ++i) {
                    if (destElements[i]) {
                        fixCloneNodeIssues(node, destElements[i]);
                    }
                }
            }
            if (dataAndEvents) {
                if (deepDataAndEvents) {
                    srcElements = srcElements || getAll(elem);
                    destElements = destElements || getAll(clone);
                    for (i = 0;
                         (node = srcElements[i]) != null; i++) {
                        cloneCopyEvent(node, destElements[i]);
                    }
                } else {
                    cloneCopyEvent(elem, clone);
                }
            }
            destElements = getAll(clone, "script");
            if (destElements.length > 0) {
                setGlobalEval(destElements, !inPage && getAll(elem, "script"));
            }
            destElements = srcElements = node = null;
            return clone;
        },
        buildFragment: function(elems, context, scripts, selection) {
            var j, elem, contains, tmp, tag, tbody, wrap, l = elems.length,
                safe = createSafeFragment(context),
                nodes = [],
                i = 0;
            for (; i < l; i++) {
                elem = elems[i];
                if (elem || elem === 0) {
                    if (jQuery.type(elem) === "object") {
                        jQuery.merge(nodes, elem.nodeType ? [elem] : elem);
                    } else if (!rhtml.test(elem)) {
                        nodes.push(context.createTextNode(elem));
                    } else {
                        tmp = tmp || safe.appendChild(context.createElement("div"));
                        tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
                        wrap = wrapMap[tag] || wrapMap._default;
                        tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];
                        j = wrap[0];
                        while (j--) {
                            tmp = tmp.lastChild;
                        }
                        if (!support.leadingWhitespace && rleadingWhitespace.test(elem)) {
                            nodes.push(context.createTextNode(rleadingWhitespace.exec(elem)[0]));
                        }
                        if (!support.tbody) {
                            elem = tag === "table" && !rtbody.test(elem) ? tmp.firstChild : wrap[1] === "<table>" && !rtbody.test(elem) ? tmp : 0;
                            j = elem && elem.childNodes.length;
                            while (j--) {
                                if (jQuery.nodeName((tbody = elem.childNodes[j]), "tbody") && !tbody.childNodes.length) {
                                    elem.removeChild(tbody);
                                }
                            }
                        }
                        jQuery.merge(nodes, tmp.childNodes);
                        tmp.textContent = "";
                        while (tmp.firstChild) {
                            tmp.removeChild(tmp.firstChild);
                        }
                        tmp = safe.lastChild;
                    }
                }
            }
            if (tmp) {
                safe.removeChild(tmp);
            }
            if (!support.appendChecked) {
                jQuery.grep(getAll(nodes, "input"), fixDefaultChecked);
            }
            i = 0;
            while ((elem = nodes[i++])) {
                if (selection && jQuery.inArray(elem, selection) !== -1) {
                    continue;
                }
                contains = jQuery.contains(elem.ownerDocument, elem);
                tmp = getAll(safe.appendChild(elem), "script");
                if (contains) {
                    setGlobalEval(tmp);
                }
                if (scripts) {
                    j = 0;
                    while ((elem = tmp[j++])) {
                        if (rscriptType.test(elem.type || "")) {
                            scripts.push(elem);
                        }
                    }
                }
            }
            tmp = null;
            return safe;
        },
        cleanData: function(elems, acceptData) {
            var elem, type, id, data, i = 0,
                internalKey = jQuery.expando,
                cache = jQuery.cache,
                deleteExpando = support.deleteExpando,
                special = jQuery.event.special;
            for (;
                (elem = elems[i]) != null; i++) {
                if (acceptData || jQuery.acceptData(elem)) {
                    id = elem[internalKey];
                    data = id && cache[id];
                    if (data) {
                        if (data.events) {
                            for (type in data.events) {
                                if (special[type]) {
                                    jQuery.event.remove(elem, type);
                                } else {
                                    jQuery.removeEvent(elem, type, data.handle);
                                }
                            }
                        }
                        if (cache[id]) {
                            delete cache[id];
                            if (deleteExpando) {
                                delete elem[internalKey];
                            } else if (typeof elem.removeAttribute !== strundefined) {
                                elem.removeAttribute(internalKey);
                            } else {
                                elem[internalKey] = null;
                            }
                            deletedIds.push(id);
                        }
                    }
                }
            }
        }
    });
    jQuery.fn.extend({
        text: function(value) {
            return access(this, function(value) {
                return value === undefined ? jQuery.text(this) : this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(value));
            }, null, value, arguments.length);
        },
        append: function() {
            return this.domManip(arguments, function(elem) {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                    var target = manipulationTarget(this, elem);
                    target.appendChild(elem);
                }
            });
        },
        prepend: function() {
            return this.domManip(arguments, function(elem) {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                    var target = manipulationTarget(this, elem);
                    target.insertBefore(elem, target.firstChild);
                }
            });
        },
        before: function() {
            return this.domManip(arguments, function(elem) {
                if (this.parentNode) {
                    this.parentNode.insertBefore(elem, this);
                }
            });
        },
        after: function() {
            return this.domManip(arguments, function(elem) {
                if (this.parentNode) {
                    this.parentNode.insertBefore(elem, this.nextSibling);
                }
            });
        },
        remove: function(selector, keepData) {
            var elem, elems = selector ? jQuery.filter(selector, this) : this,
                i = 0;
            for (;
                (elem = elems[i]) != null; i++) {
                if (!keepData && elem.nodeType === 1) {
                    jQuery.cleanData(getAll(elem));
                }
                if (elem.parentNode) {
                    if (keepData && jQuery.contains(elem.ownerDocument, elem)) {
                        setGlobalEval(getAll(elem, "script"));
                    }
                    elem.parentNode.removeChild(elem);
                }
            }
            return this;
        },
        empty: function() {
            var elem, i = 0;
            for (;
                (elem = this[i]) != null; i++) {
                if (elem.nodeType === 1) {
                    jQuery.cleanData(getAll(elem, false));
                }
                while (elem.firstChild) {
                    elem.removeChild(elem.firstChild);
                }
                if (elem.options && jQuery.nodeName(elem, "select")) {
                    elem.options.length = 0;
                }
            }
            return this;
        },
        clone: function(dataAndEvents, deepDataAndEvents) {
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
            return this.map(function() {
                return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
            });
        },
        html: function(value) {
            return access(this, function(value) {
                var elem = this[0] || {},
                    i = 0,
                    l = this.length;
                if (value === undefined) {
                    return elem.nodeType === 1 ? elem.innerHTML.replace(rinlinejQuery, "") : undefined;
                }
                if (typeof value === "string" && !rnoInnerhtml.test(value) && (support.htmlSerialize || !rnoshimcache.test(value)) && (support.leadingWhitespace || !rleadingWhitespace.test(value)) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {
                    value = value.replace(rxhtmlTag, "<$1></$2>");
                    try {
                        for (; i < l; i++) {
                            elem = this[i] || {};
                            if (elem.nodeType === 1) {
                                jQuery.cleanData(getAll(elem, false));
                                elem.innerHTML = value;
                            }
                        }
                        elem = 0;
                    } catch (e) {}
                }
                if (elem) {
                    this.empty().append(value);
                }
            }, null, value, arguments.length);
        },
        replaceWith: function() {
            var arg = arguments[0];
            this.domManip(arguments, function(elem) {
                arg = this.parentNode;
                jQuery.cleanData(getAll(this));
                if (arg) {
                    arg.replaceChild(elem, this);
                }
            });
            return arg && (arg.length || arg.nodeType) ? this : this.remove();
        },
        detach: function(selector) {
            return this.remove(selector, true);
        },
        domManip: function(args, callback) {
            args = concat.apply([], args);
            var first, node, hasScripts, scripts, doc, fragment, i = 0,
                l = this.length,
                set = this,
                iNoClone = l - 1,
                value = args[0],
                isFunction = jQuery.isFunction(value);
            if (isFunction || (l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value))) {
                return this.each(function(index) {
                    var self = set.eq(index);
                    if (isFunction) {
                        args[0] = value.call(this, index, self.html());
                    }
                    self.domManip(args, callback);
                });
            }
            if (l) {
                fragment = jQuery.buildFragment(args, this[0].ownerDocument, false, this);
                first = fragment.firstChild;
                if (fragment.childNodes.length === 1) {
                    fragment = first;
                }
                if (first) {
                    scripts = jQuery.map(getAll(fragment, "script"), disableScript);
                    hasScripts = scripts.length;
                    for (; i < l; i++) {
                        node = fragment;
                        if (i !== iNoClone) {
                            node = jQuery.clone(node, true, true);
                            if (hasScripts) {
                                jQuery.merge(scripts, getAll(node, "script"));
                            }
                        }
                        callback.call(this[i], node, i);
                    }
                    if (hasScripts) {
                        doc = scripts[scripts.length - 1].ownerDocument;
                        jQuery.map(scripts, restoreScript);
                        for (i = 0; i < hasScripts; i++) {
                            node = scripts[i];
                            if (rscriptType.test(node.type || "") && !jQuery._data(node, "globalEval") && jQuery.contains(doc, node)) {
                                if (node.src) {
                                    if (jQuery._evalUrl) {
                                        jQuery._evalUrl(node.src);
                                    }
                                } else {
                                    jQuery.globalEval((node.text || node.textContent || node.innerHTML || "").replace(rcleanScript, ""));
                                }
                            }
                        }
                    }
                    fragment = first = null;
                }
            }
            return this;
        }
    });
    jQuery.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(name, original) {
        jQuery.fn[name] = function(selector) {
            var elems, i = 0,
                ret = [],
                insert = jQuery(selector),
                last = insert.length - 1;
            for (; i <= last; i++) {
                elems = i === last ? this : this.clone(true);
                jQuery(insert[i])[original](elems);
                push.apply(ret, elems.get());
            }
            return this.pushStack(ret);
        };
    });
    var iframe, elemdisplay = {};

    function actualDisplay(name, doc) {
        var style, elem = jQuery(doc.createElement(name)).appendTo(doc.body),
            display = window.getDefaultComputedStyle && (style = window.getDefaultComputedStyle(elem[0])) ? style.display : jQuery.css(elem[0], "display");
        elem.detach();
        return display;
    }

    function defaultDisplay(nodeName) {
        var doc = document,
            display = elemdisplay[nodeName];
        if (!display) {
            display = actualDisplay(nodeName, doc);
            if (display === "none" || !display) {
                iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(doc.documentElement);
                doc = (iframe[0].contentWindow || iframe[0].contentDocument).document;
                doc.write();
                doc.close();
                display = actualDisplay(nodeName, doc);
                iframe.detach();
            }
            elemdisplay[nodeName] = display;
        }
        return display;
    }
    (function() {
        var shrinkWrapBlocksVal;
        support.shrinkWrapBlocks = function() {
            if (shrinkWrapBlocksVal != null) {
                return shrinkWrapBlocksVal;
            }
            shrinkWrapBlocksVal = false;
            var div, body, container;
            body = document.getElementsByTagName("body")[0];
            if (!body || !body.style) {
                return;
            }
            div = document.createElement("div");
            container = document.createElement("div");
            container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
            body.appendChild(container).appendChild(div);
            if (typeof div.style.zoom !== strundefined) {
                div.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" + "box-sizing:content-box;display:block;margin:0;border:0;" + "padding:1px;width:1px;zoom:1";
                div.appendChild(document.createElement("div")).style.width = "5px";
                shrinkWrapBlocksVal = div.offsetWidth !== 3;
            }
            body.removeChild(container);
            return shrinkWrapBlocksVal;
        };
    })();
    var rmargin = (/^margin/);
    var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
    var getStyles, curCSS, rposition = /^(top|right|bottom|left)$/;
    if (window.getComputedStyle) {
        getStyles = function(elem) {
            if (elem.ownerDocument.defaultView.opener) {
                return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
            }
            return window.getComputedStyle(elem, null);
        };
        curCSS = function(elem, name, computed) {
            var width, minWidth, maxWidth, ret, style = elem.style;
            computed = computed || getStyles(elem);
            ret = computed ? computed.getPropertyValue(name) || computed[name] : undefined;
            if (computed) {
                if (ret === "" && !jQuery.contains(elem.ownerDocument, elem)) {
                    ret = jQuery.style(elem, name);
                }
                if (rnumnonpx.test(ret) && rmargin.test(name)) {
                    width = style.width;
                    minWidth = style.minWidth;
                    maxWidth = style.maxWidth;
                    style.minWidth = style.maxWidth = style.width = ret;
                    ret = computed.width;
                    style.width = width;
                    style.minWidth = minWidth;
                    style.maxWidth = maxWidth;
                }
            }
            return ret === undefined ? ret : ret + "";
        };
    } else if (document.documentElement.currentStyle) {
        getStyles = function(elem) {
            return elem.currentStyle;
        };
        curCSS = function(elem, name, computed) {
            var left, rs, rsLeft, ret, style = elem.style;
            computed = computed || getStyles(elem);
            ret = computed ? computed[name] : undefined;
            if (ret == null && style && style[name]) {
                ret = style[name];
            }
            if (rnumnonpx.test(ret) && !rposition.test(name)) {
                left = style.left;
                rs = elem.runtimeStyle;
                rsLeft = rs && rs.left;
                if (rsLeft) {
                    rs.left = elem.currentStyle.left;
                }
                style.left = name === "fontSize" ? "1em" : ret;
                ret = style.pixelLeft + "px";
                style.left = left;
                if (rsLeft) {
                    rs.left = rsLeft;
                }
            }
            return ret === undefined ? ret : ret + "" || "auto";
        };
    }

    function addGetHookIf(conditionFn, hookFn) {
        return {
            get: function() {
                var condition = conditionFn();
                if (condition == null) {
                    return;
                }
                if (condition) {
                    delete this.get;
                    return;
                }
                return (this.get = hookFn).apply(this, arguments);
            }
        };
    }
    (function() {
        var div, style, a, pixelPositionVal, boxSizingReliableVal, reliableHiddenOffsetsVal, reliableMarginRightVal;
        div = document.createElement("div");
        div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
        a = div.getElementsByTagName("a")[0];
        style = a && a.style;
        if (!style) {
            return;
        }
        style.cssText = "float:left;opacity:.5";
        support.opacity = style.opacity === "0.5";
        support.cssFloat = !!style.cssFloat;
        div.style.backgroundClip = "content-box";
        div.cloneNode(true).style.backgroundClip = "";
        support.clearCloneStyle = div.style.backgroundClip === "content-box";
        support.boxSizing = style.boxSizing === "" || style.MozBoxSizing === "" || style.WebkitBoxSizing === "";
        jQuery.extend(support, {
            reliableHiddenOffsets: function() {
                if (reliableHiddenOffsetsVal == null) {
                    computeStyleTests();
                }
                return reliableHiddenOffsetsVal;
            },
            boxSizingReliable: function() {
                if (boxSizingReliableVal == null) {
                    computeStyleTests();
                }
                return boxSizingReliableVal;
            },
            pixelPosition: function() {
                if (pixelPositionVal == null) {
                    computeStyleTests();
                }
                return pixelPositionVal;
            },
            reliableMarginRight: function() {
                if (reliableMarginRightVal == null) {
                    computeStyleTests();
                }
                return reliableMarginRightVal;
            }
        });

        function computeStyleTests() {
            var div, body, container, contents;
            body = document.getElementsByTagName("body")[0];
            if (!body || !body.style) {
                return;
            }
            div = document.createElement("div");
            container = document.createElement("div");
            container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
            body.appendChild(container).appendChild(div);
            div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" + "box-sizing:border-box;display:block;margin-top:1%;top:1%;" + "border:1px;padding:1px;width:4px;position:absolute";
            pixelPositionVal = boxSizingReliableVal = false;
            reliableMarginRightVal = true;
            if (window.getComputedStyle) {
                pixelPositionVal = (window.getComputedStyle(div, null) || {}).top !== "1%";
                boxSizingReliableVal = (window.getComputedStyle(div, null) || {
                        width: "4px"
                    }).width === "4px";
                contents = div.appendChild(document.createElement("div"));
                contents.style.cssText = div.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" + "box-sizing:content-box;display:block;margin:0;border:0;padding:0";
                contents.style.marginRight = contents.style.width = "0";
                div.style.width = "1px";
                reliableMarginRightVal = !parseFloat((window.getComputedStyle(contents, null) || {}).marginRight);
                div.removeChild(contents);
            }
            div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
            contents = div.getElementsByTagName("td");
            contents[0].style.cssText = "margin:0;border:0;padding:0;display:none";
            reliableHiddenOffsetsVal = contents[0].offsetHeight === 0;
            if (reliableHiddenOffsetsVal) {
                contents[0].style.display = "";
                contents[1].style.display = "none";
                reliableHiddenOffsetsVal = contents[0].offsetHeight === 0;
            }
            body.removeChild(container);
        }
    })();
    jQuery.swap = function(elem, options, callback, args) {
        var ret, name, old = {};
        for (name in options) {
            old[name] = elem.style[name];
            elem.style[name] = options[name];
        }
        ret = callback.apply(elem, args || []);
        for (name in options) {
            elem.style[name] = old[name];
        }
        return ret;
    };
    var
        ralpha = /alpha\([^)]*\)/i,
        ropacity = /opacity\s*=\s*([^)]*)/,
        rdisplayswap = /^(none|table(?!-c[ea]).+)/,
        rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"),
        rrelNum = new RegExp("^([+-])=(" + pnum + ")", "i"),
        cssShow = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        },
        cssNormalTransform = {
            letterSpacing: "0",
            fontWeight: "400"
        },
        cssPrefixes = ["Webkit", "O", "Moz", "ms"];

    function vendorPropName(style, name) {
        if (name in style) {
            return name;
        }
        var capName = name.charAt(0).toUpperCase() + name.slice(1),
            origName = name,
            i = cssPrefixes.length;
        while (i--) {
            name = cssPrefixes[i] + capName;
            if (name in style) {
                return name;
            }
        }
        return origName;
    }

    function showHide(elements, show) {
        var display, elem, hidden, values = [],
            index = 0,
            length = elements.length;
        for (; index < length; index++) {
            elem = elements[index];
            if (!elem.style) {
                continue;
            }
            values[index] = jQuery._data(elem, "olddisplay");
            display = elem.style.display;
            if (show) {
                if (!values[index] && display === "none") {
                    elem.style.display = "";
                }
                if (elem.style.display === "" && isHidden(elem)) {
                    values[index] = jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
                }
            } else {
                hidden = isHidden(elem);
                if (display && display !== "none" || !hidden) {
                    jQuery._data(elem, "olddisplay", hidden ? display : jQuery.css(elem, "display"));
                }
            }
        }
        for (index = 0; index < length; index++) {
            elem = elements[index];
            if (!elem.style) {
                continue;
            }
            if (!show || elem.style.display === "none" || elem.style.display === "") {
                elem.style.display = show ? values[index] || "" : "none";
            }
        }
        return elements;
    }

    function setPositiveNumber(elem, value, subtract) {
        var matches = rnumsplit.exec(value);
        return matches ? Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") : value;
    }

    function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
        var i = extra === (isBorderBox ? "border" : "content") ? 4 : name === "width" ? 1 : 0,
            val = 0;
        for (; i < 4; i += 2) {
            if (extra === "margin") {
                val += jQuery.css(elem, extra + cssExpand[i], true, styles);
            }
            if (isBorderBox) {
                if (extra === "content") {
                    val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
                }
                if (extra !== "margin") {
                    val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
                }
            } else {
                val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);
                if (extra !== "padding") {
                    val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
                }
            }
        }
        return val;
    }

    function getWidthOrHeight(elem, name, extra) {
        var valueIsBorderBox = true,
            val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
            styles = getStyles(elem),
            isBorderBox = support.boxSizing && jQuery.css(elem, "boxSizing", false, styles) === "border-box";
        if (val <= 0 || val == null) {
            val = curCSS(elem, name, styles);
            if (val < 0 || val == null) {
                val = elem.style[name];
            }
            if (rnumnonpx.test(val)) {
                return val;
            }
            valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);
            val = parseFloat(val) || 0;
        }
        return (val +
            augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles)) + "px";
    }
    jQuery.extend({
        cssHooks: {
            opacity: {
                get: function(elem, computed) {
                    if (computed) {
                        var ret = curCSS(elem, "opacity");
                        return ret === "" ? "1" : ret;
                    }
                }
            }
        },
        cssNumber: {
            "columnCount": true,
            "fillOpacity": true,
            "flexGrow": true,
            "flexShrink": true,
            "fontWeight": true,
            "lineHeight": true,
            "opacity": true,
            "order": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true
        },
        cssProps: {
            "float": support.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function(elem, name, value, extra) {
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
                return;
            }
            var ret, type, hooks, origName = jQuery.camelCase(name),
                style = elem.style;
            name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName));
            hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
            if (value !== undefined) {
                type = typeof value;
                if (type === "string" && (ret = rrelNum.exec(value))) {
                    value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name));
                    type = "number";
                }
                if (value == null || value !== value) {
                    return;
                }
                if (type === "number" && !jQuery.cssNumber[origName]) {
                    value += "px";
                }
                if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
                    style[name] = "inherit";
                }
                if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
                    try {
                        style[name] = value;
                    } catch (e) {}
                }
            } else {
                if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
                    return ret;
                }
                return style[name];
            }
        },
        css: function(elem, name, extra, styles) {
            var num, val, hooks, origName = jQuery.camelCase(name);
            name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName));
            hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
            if (hooks && "get" in hooks) {
                val = hooks.get(elem, true, extra);
            }
            if (val === undefined) {
                val = curCSS(elem, name, styles);
            }
            if (val === "normal" && name in cssNormalTransform) {
                val = cssNormalTransform[name];
            }
            if (extra === "" || extra) {
                num = parseFloat(val);
                return extra === true || jQuery.isNumeric(num) ? num || 0 : val;
            }
            return val;
        }
    });
    jQuery.each(["height", "width"], function(i, name) {
        jQuery.cssHooks[name] = {
            get: function(elem, computed, extra) {
                if (computed) {
                    return rdisplayswap.test(jQuery.css(elem, "display")) && elem.offsetWidth === 0 ? jQuery.swap(elem, cssShow, function() {
                            return getWidthOrHeight(elem, name, extra);
                        }) : getWidthOrHeight(elem, name, extra);
                }
            },
            set: function(elem, value, extra) {
                var styles = extra && getStyles(elem);
                return setPositiveNumber(elem, value, extra ? augmentWidthOrHeight(elem, name, extra, support.boxSizing && jQuery.css(elem, "boxSizing", false, styles) === "border-box", styles) : 0);
            }
        };
    });
    if (!support.opacity) {
        jQuery.cssHooks.opacity = {
            get: function(elem, computed) {
                return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ? (0.01 * parseFloat(RegExp.$1)) + "" : computed ? "1" : "";
            },
            set: function(elem, value) {
                var style = elem.style,
                    currentStyle = elem.currentStyle,
                    opacity = jQuery.isNumeric(value) ? "alpha(opacity=" + value * 100 + ")" : "",
                    filter = currentStyle && currentStyle.filter || style.filter || "";
                style.zoom = 1;
                if ((value >= 1 || value === "") && jQuery.trim(filter.replace(ralpha, "")) === "" && style.removeAttribute) {
                    style.removeAttribute("filter");
                    if (value === "" || currentStyle && !currentStyle.filter) {
                        return;
                    }
                }
                style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : filter + " " + opacity;
            }
        };
    }
    jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function(elem, computed) {
        if (computed) {
            return jQuery.swap(elem, {
                "display": "inline-block"
            }, curCSS, [elem, "marginRight"]);
        }
    });
    jQuery.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(prefix, suffix) {
        jQuery.cssHooks[prefix + suffix] = {
            expand: function(value) {
                var i = 0,
                    expanded = {},
                    parts = typeof value === "string" ? value.split(" ") : [value];
                for (; i < 4; i++) {
                    expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
                }
                return expanded;
            }
        };
        if (!rmargin.test(prefix)) {
            jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
        }
    });
    jQuery.fn.extend({
        css: function(name, value) {
            return access(this, function(elem, name, value) {
                var styles, len, map = {},
                    i = 0;
                if (jQuery.isArray(name)) {
                    styles = getStyles(elem);
                    len = name.length;
                    for (; i < len; i++) {
                        map[name[i]] = jQuery.css(elem, name[i], false, styles);
                    }
                    return map;
                }
                return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
            }, name, value, arguments.length > 1);
        },
        show: function() {
            return showHide(this, true);
        },
        hide: function() {
            return showHide(this);
        },
        toggle: function(state) {
            if (typeof state === "boolean") {
                return state ? this.show() : this.hide();
            }
            return this.each(function() {
                if (isHidden(this)) {
                    jQuery(this).show();
                } else {
                    jQuery(this).hide();
                }
            });
        }
    });

    function Tween(elem, options, prop, end, easing) {
        return new Tween.prototype.init(elem, options, prop, end, easing);
    }
    jQuery.Tween = Tween;
    Tween.prototype = {
        constructor: Tween,
        init: function(elem, options, prop, end, easing, unit) {
            this.elem = elem;
            this.prop = prop;
            this.easing = easing || "swing";
            this.options = options;
            this.start = this.now = this.cur();
            this.end = end;
            this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
        },
        cur: function() {
            var hooks = Tween.propHooks[this.prop];
            return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
        },
        run: function(percent) {
            var eased, hooks = Tween.propHooks[this.prop];
            if (this.options.duration) {
                this.pos = eased = jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration);
            } else {
                this.pos = eased = percent;
            }
            this.now = (this.end - this.start) * eased + this.start;
            if (this.options.step) {
                this.options.step.call(this.elem, this.now, this);
            }
            if (hooks && hooks.set) {
                hooks.set(this);
            } else {
                Tween.propHooks._default.set(this);
            }
            return this;
        }
    };
    Tween.prototype.init.prototype = Tween.prototype;
    Tween.propHooks = {
        _default: {
            get: function(tween) {
                var result;
                if (tween.elem[tween.prop] != null && (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
                    return tween.elem[tween.prop];
                }
                result = jQuery.css(tween.elem, tween.prop, "");
                return !result || result === "auto" ? 0 : result;
            },
            set: function(tween) {
                if (jQuery.fx.step[tween.prop]) {
                    jQuery.fx.step[tween.prop](tween);
                } else if (tween.elem.style && (tween.elem.style[jQuery.cssProps[tween.prop]] != null || jQuery.cssHooks[tween.prop])) {
                    jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
                } else {
                    tween.elem[tween.prop] = tween.now;
                }
            }
        }
    };
    Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
        set: function(tween) {
            if (tween.elem.nodeType && tween.elem.parentNode) {
                tween.elem[tween.prop] = tween.now;
            }
        }
    };
    jQuery.easing = {
        linear: function(p) {
            return p;
        },
        swing: function(p) {
            return 0.5 - Math.cos(p * Math.PI) / 2;
        }
    };
    jQuery.fx = Tween.prototype.init;
    jQuery.fx.step = {};
    var
        fxNow, timerId, rfxtypes = /^(?:toggle|show|hide)$/,
        rfxnum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i"),
        rrun = /queueHooks$/,
        animationPrefilters = [defaultPrefilter],
        tweeners = {
            "*": [function(prop, value) {
                var tween = this.createTween(prop, value),
                    target = tween.cur(),
                    parts = rfxnum.exec(value),
                    unit = parts && parts[3] || (jQuery.cssNumber[prop] ? "" : "px"),
                    start = (jQuery.cssNumber[prop] || unit !== "px" && +target) && rfxnum.exec(jQuery.css(tween.elem, prop)),
                    scale = 1,
                    maxIterations = 20;
                if (start && start[3] !== unit) {
                    unit = unit || start[3];
                    parts = parts || [];
                    start = +target || 1;
                    do {
                        scale = scale || ".5";
                        start = start / scale;
                        jQuery.style(tween.elem, prop, start + unit);
                    } while (scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations);
                }
                if (parts) {
                    start = tween.start = +start || +target || 0;
                    tween.unit = unit;
                    tween.end = parts[1] ? start + (parts[1] + 1) * parts[2] : +parts[2];
                }
                return tween;
            }]
        };

    function createFxNow() {
        setTimeout(function() {
            fxNow = undefined;
        });
        return (fxNow = jQuery.now());
    }

    function genFx(type, includeWidth) {
        var which, attrs = {
                height: type
            },
            i = 0;
        includeWidth = includeWidth ? 1 : 0;
        for (; i < 4; i += 2 - includeWidth) {
            which = cssExpand[i];
            attrs["margin" + which] = attrs["padding" + which] = type;
        }
        if (includeWidth) {
            attrs.opacity = attrs.width = type;
        }
        return attrs;
    }

    function createTween(value, prop, animation) {
        var tween, collection = (tweeners[prop] || []).concat(tweeners["*"]),
            index = 0,
            length = collection.length;
        for (; index < length; index++) {
            if ((tween = collection[index].call(animation, prop, value))) {
                return tween;
            }
        }
    }

    function defaultPrefilter(elem, props, opts) {
        var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay, anim = this,
            orig = {},
            style = elem.style,
            hidden = elem.nodeType && isHidden(elem),
            dataShow = jQuery._data(elem, "fxshow");
        if (!opts.queue) {
            hooks = jQuery._queueHooks(elem, "fx");
            if (hooks.unqueued == null) {
                hooks.unqueued = 0;
                oldfire = hooks.empty.fire;
                hooks.empty.fire = function() {
                    if (!hooks.unqueued) {
                        oldfire();
                    }
                };
            }
            hooks.unqueued++;
            anim.always(function() {
                anim.always(function() {
                    hooks.unqueued--;
                    if (!jQuery.queue(elem, "fx").length) {
                        hooks.empty.fire();
                    }
                });
            });
        }
        if (elem.nodeType === 1 && ("height" in props || "width" in props)) {
            opts.overflow = [style.overflow, style.overflowX, style.overflowY];
            display = jQuery.css(elem, "display");
            checkDisplay = display === "none" ? jQuery._data(elem, "olddisplay") || defaultDisplay(elem.nodeName) : display;
            if (checkDisplay === "inline" && jQuery.css(elem, "float") === "none") {
                if (!support.inlineBlockNeedsLayout || defaultDisplay(elem.nodeName) === "inline") {
                    style.display = "inline-block";
                } else {
                    style.zoom = 1;
                }
            }
        }
        if (opts.overflow) {
            style.overflow = "hidden";
            if (!support.shrinkWrapBlocks()) {
                anim.always(function() {
                    style.overflow = opts.overflow[0];
                    style.overflowX = opts.overflow[1];
                    style.overflowY = opts.overflow[2];
                });
            }
        }
        for (prop in props) {
            value = props[prop];
            if (rfxtypes.exec(value)) {
                delete props[prop];
                toggle = toggle || value === "toggle";
                if (value === (hidden ? "hide" : "show")) {
                    if (value === "show" && dataShow && dataShow[prop] !== undefined) {
                        hidden = true;
                    } else {
                        continue;
                    }
                }
                orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
            } else {
                display = undefined;
            }
        }
        if (!jQuery.isEmptyObject(orig)) {
            if (dataShow) {
                if ("hidden" in dataShow) {
                    hidden = dataShow.hidden;
                }
            } else {
                dataShow = jQuery._data(elem, "fxshow", {});
            }
            if (toggle) {
                dataShow.hidden = !hidden;
            }
            if (hidden) {
                jQuery(elem).show();
            } else {
                anim.done(function() {
                    jQuery(elem).hide();
                });
            }
            anim.done(function() {
                var prop;
                jQuery._removeData(elem, "fxshow");
                for (prop in orig) {
                    jQuery.style(elem, prop, orig[prop]);
                }
            });
            for (prop in orig) {
                tween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
                if (!(prop in dataShow)) {
                    dataShow[prop] = tween.start;
                    if (hidden) {
                        tween.end = tween.start;
                        tween.start = prop === "width" || prop === "height" ? 1 : 0;
                    }
                }
            }
        } else if ((display === "none" ? defaultDisplay(elem.nodeName) : display) === "inline") {
            style.display = display;
        }
    }

    function propFilter(props, specialEasing) {
        var index, name, easing, value, hooks;
        for (index in props) {
            name = jQuery.camelCase(index);
            easing = specialEasing[name];
            value = props[index];
            if (jQuery.isArray(value)) {
                easing = value[1];
                value = props[index] = value[0];
            }
            if (index !== name) {
                props[name] = value;
                delete props[index];
            }
            hooks = jQuery.cssHooks[name];
            if (hooks && "expand" in hooks) {
                value = hooks.expand(value);
                delete props[name];
                for (index in value) {
                    if (!(index in props)) {
                        props[index] = value[index];
                        specialEasing[index] = easing;
                    }
                }
            } else {
                specialEasing[name] = easing;
            }
        }
    }

    function Animation(elem, properties, options) {
        var result, stopped, index = 0,
            length = animationPrefilters.length,
            deferred = jQuery.Deferred().always(function() {
                delete tick.elem;
            }),
            tick = function() {
                if (stopped) {
                    return false;
                }
                var currentTime = fxNow || createFxNow(),
                    remaining = Math.max(0, animation.startTime + animation.duration - currentTime),
                    temp = remaining / animation.duration || 0,
                    percent = 1 - temp,
                    index = 0,
                    length = animation.tweens.length;
                for (; index < length; index++) {
                    animation.tweens[index].run(percent);
                }
                deferred.notifyWith(elem, [animation, percent, remaining]);
                if (percent < 1 && length) {
                    return remaining;
                } else {
                    deferred.resolveWith(elem, [animation]);
                    return false;
                }
            },
            animation = deferred.promise({
                elem: elem,
                props: jQuery.extend({}, properties),
                opts: jQuery.extend(true, {
                    specialEasing: {}
                }, options),
                originalProperties: properties,
                originalOptions: options,
                startTime: fxNow || createFxNow(),
                duration: options.duration,
                tweens: [],
                createTween: function(prop, end) {
                    var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
                    animation.tweens.push(tween);
                    return tween;
                },
                stop: function(gotoEnd) {
                    var index = 0,
                        length = gotoEnd ? animation.tweens.length : 0;
                    if (stopped) {
                        return this;
                    }
                    stopped = true;
                    for (; index < length; index++) {
                        animation.tweens[index].run(1);
                    }
                    if (gotoEnd) {
                        deferred.resolveWith(elem, [animation, gotoEnd]);
                    } else {
                        deferred.rejectWith(elem, [animation, gotoEnd]);
                    }
                    return this;
                }
            }),
            props = animation.props;
        propFilter(props, animation.opts.specialEasing);
        for (; index < length; index++) {
            result = animationPrefilters[index].call(animation, elem, props, animation.opts);
            if (result) {
                return result;
            }
        }
        jQuery.map(props, createTween, animation);
        if (jQuery.isFunction(animation.opts.start)) {
            animation.opts.start.call(elem, animation);
        }
        jQuery.fx.timer(jQuery.extend(tick, {
            elem: elem,
            anim: animation,
            queue: animation.opts.queue
        }));
        return animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
    }
    jQuery.Animation = jQuery.extend(Animation, {
        tweener: function(props, callback) {
            if (jQuery.isFunction(props)) {
                callback = props;
                props = ["*"];
            } else {
                props = props.split(" ");
            }
            var prop, index = 0,
                length = props.length;
            for (; index < length; index++) {
                prop = props[index];
                tweeners[prop] = tweeners[prop] || [];
                tweeners[prop].unshift(callback);
            }
        },
        prefilter: function(callback, prepend) {
            if (prepend) {
                animationPrefilters.unshift(callback);
            } else {
                animationPrefilters.push(callback);
            }
        }
    });
    jQuery.speed = function(speed, easing, fn) {
        var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
                complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
                duration: speed,
                easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
            };
        opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;
        if (opt.queue == null || opt.queue === true) {
            opt.queue = "fx";
        }
        opt.old = opt.complete;
        opt.complete = function() {
            if (jQuery.isFunction(opt.old)) {
                opt.old.call(this);
            }
            if (opt.queue) {
                jQuery.dequeue(this, opt.queue);
            }
        };
        return opt;
    };
    jQuery.fn.extend({
        fadeTo: function(speed, to, easing, callback) {
            return this.filter(isHidden).css("opacity", 0).show().end().animate({
                opacity: to
            }, speed, easing, callback);
        },
        animate: function(prop, speed, easing, callback) {
            var empty = jQuery.isEmptyObject(prop),
                optall = jQuery.speed(speed, easing, callback),
                doAnimation = function() {
                    var anim = Animation(this, jQuery.extend({}, prop), optall);
                    if (empty || jQuery._data(this, "finish")) {
                        anim.stop(true);
                    }
                };
            doAnimation.finish = doAnimation;
            return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
        },
        stop: function(type, clearQueue, gotoEnd) {
            var stopQueue = function(hooks) {
                var stop = hooks.stop;
                delete hooks.stop;
                stop(gotoEnd);
            };
            if (typeof type !== "string") {
                gotoEnd = clearQueue;
                clearQueue = type;
                type = undefined;
            }
            if (clearQueue && type !== false) {
                this.queue(type || "fx", []);
            }
            return this.each(function() {
                var dequeue = true,
                    index = type != null && type + "queueHooks",
                    timers = jQuery.timers,
                    data = jQuery._data(this);
                if (index) {
                    if (data[index] && data[index].stop) {
                        stopQueue(data[index]);
                    }
                } else {
                    for (index in data) {
                        if (data[index] && data[index].stop && rrun.test(index)) {
                            stopQueue(data[index]);
                        }
                    }
                }
                for (index = timers.length; index--;) {
                    if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
                        timers[index].anim.stop(gotoEnd);
                        dequeue = false;
                        timers.splice(index, 1);
                    }
                }
                if (dequeue || !gotoEnd) {
                    jQuery.dequeue(this, type);
                }
            });
        },
        finish: function(type) {
            if (type !== false) {
                type = type || "fx";
            }
            return this.each(function() {
                var index, data = jQuery._data(this),
                    queue = data[type + "queue"],
                    hooks = data[type + "queueHooks"],
                    timers = jQuery.timers,
                    length = queue ? queue.length : 0;
                data.finish = true;
                jQuery.queue(this, type, []);
                if (hooks && hooks.stop) {
                    hooks.stop.call(this, true);
                }
                for (index = timers.length; index--;) {
                    if (timers[index].elem === this && timers[index].queue === type) {
                        timers[index].anim.stop(true);
                        timers.splice(index, 1);
                    }
                }
                for (index = 0; index < length; index++) {
                    if (queue[index] && queue[index].finish) {
                        queue[index].finish.call(this);
                    }
                }
                delete data.finish;
            });
        }
    });
    jQuery.each(["toggle", "show", "hide"], function(i, name) {
        var cssFn = jQuery.fn[name];
        jQuery.fn[name] = function(speed, easing, callback) {
            return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
        };
    });
    jQuery.each({
        slideDown: genFx("show"),
        slideUp: genFx("hide"),
        slideToggle: genFx("toggle"),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(name, props) {
        jQuery.fn[name] = function(speed, easing, callback) {
            return this.animate(props, speed, easing, callback);
        };
    });
    jQuery.timers = [];
    jQuery.fx.tick = function() {
        var timer, timers = jQuery.timers,
            i = 0;
        fxNow = jQuery.now();
        for (; i < timers.length; i++) {
            timer = timers[i];
            if (!timer() && timers[i] === timer) {
                timers.splice(i--, 1);
            }
        }
        if (!timers.length) {
            jQuery.fx.stop();
        }
        fxNow = undefined;
    };
    jQuery.fx.timer = function(timer) {
        jQuery.timers.push(timer);
        if (timer()) {
            jQuery.fx.start();
        } else {
            jQuery.timers.pop();
        }
    };
    jQuery.fx.interval = 13;
    jQuery.fx.start = function() {
        if (!timerId) {
            timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval);
        }
    };
    jQuery.fx.stop = function() {
        clearInterval(timerId);
        timerId = null;
    };
    jQuery.fx.speeds = {
        slow: 600,
        fast: 200,
        _default: 400
    };
    jQuery.fn.delay = function(time, type) {
        time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
        type = type || "fx";
        return this.queue(type, function(next, hooks) {
            var timeout = setTimeout(next, time);
            hooks.stop = function() {
                clearTimeout(timeout);
            };
        });
    };
    (function() {
        var input, div, select, a, opt;
        div = document.createElement("div");
        div.setAttribute("className", "t");
        div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
        a = div.getElementsByTagName("a")[0];
        select = document.createElement("select");
        opt = select.appendChild(document.createElement("option"));
        input = div.getElementsByTagName("input")[0];
        a.style.cssText = "top:1px";
        support.getSetAttribute = div.className !== "t";
        support.style = /top/.test(a.getAttribute("style"));
        support.hrefNormalized = a.getAttribute("href") === "/a";
        support.checkOn = !!input.value;
        support.optSelected = opt.selected;
        support.enctype = !!document.createElement("form").enctype;
        select.disabled = true;
        support.optDisabled = !opt.disabled;
        input = document.createElement("input");
        input.setAttribute("value", "");
        support.input = input.getAttribute("value") === "";
        input.value = "t";
        input.setAttribute("type", "radio");
        support.radioValue = input.value === "t";
    })();
    var rreturn = /\r/g;
    jQuery.fn.extend({
        val: function(value) {
            var hooks, ret, isFunction, elem = this[0];
            if (!arguments.length) {
                if (elem) {
                    hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];
                    if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
                        return ret;
                    }
                    ret = elem.value;
                    return typeof ret === "string" ? ret.replace(rreturn, "") : ret == null ? "" : ret;
                }
                return;
            }
            isFunction = jQuery.isFunction(value);
            return this.each(function(i) {
                var val;
                if (this.nodeType !== 1) {
                    return;
                }
                if (isFunction) {
                    val = value.call(this, i, jQuery(this).val());
                } else {
                    val = value;
                }
                if (val == null) {
                    val = "";
                } else if (typeof val === "number") {
                    val += "";
                } else if (jQuery.isArray(val)) {
                    val = jQuery.map(val, function(value) {
                        return value == null ? "" : value + "";
                    });
                }
                hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];
                if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
                    this.value = val;
                }
            });
        }
    });
    jQuery.extend({
        valHooks: {
            option: {
                get: function(elem) {
                    var val = jQuery.find.attr(elem, "value");
                    return val != null ? val : jQuery.trim(jQuery.text(elem));
                }
            },
            select: {
                get: function(elem) {
                    var value, option, options = elem.options,
                        index = elem.selectedIndex,
                        one = elem.type === "select-one" || index < 0,
                        values = one ? null : [],
                        max = one ? index + 1 : options.length,
                        i = index < 0 ? max : one ? index : 0;
                    for (; i < max; i++) {
                        option = options[i];
                        if ((option.selected || i === index) && (support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {
                            value = jQuery(option).val();
                            if (one) {
                                return value;
                            }
                            values.push(value);
                        }
                    }
                    return values;
                },
                set: function(elem, value) {
                    var optionSet, option, options = elem.options,
                        values = jQuery.makeArray(value),
                        i = options.length;
                    while (i--) {
                        option = options[i];
                        if (jQuery.inArray(jQuery.valHooks.option.get(option), values) >= 0) {
                            try {
                                option.selected = optionSet = true;
                            } catch (_) {
                                option.scrollHeight;
                            }
                        } else {
                            option.selected = false;
                        }
                    }
                    if (!optionSet) {
                        elem.selectedIndex = -1;
                    }
                    return options;
                }
            }
        }
    });
    jQuery.each(["radio", "checkbox"], function() {
        jQuery.valHooks[this] = {
            set: function(elem, value) {
                if (jQuery.isArray(value)) {
                    return (elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0);
                }
            }
        };
        if (!support.checkOn) {
            jQuery.valHooks[this].get = function(elem) {
                return elem.getAttribute("value") === null ? "on" : elem.value;
            };
        }
    });
    var nodeHook, boolHook, attrHandle = jQuery.expr.attrHandle,
        ruseDefault = /^(?:checked|selected)$/i,
        getSetAttribute = support.getSetAttribute,
        getSetInput = support.input;
    jQuery.fn.extend({
        attr: function(name, value) {
            return access(this, jQuery.attr, name, value, arguments.length > 1);
        },
        removeAttr: function(name) {
            return this.each(function() {
                jQuery.removeAttr(this, name);
            });
        }
    });
    jQuery.extend({
        attr: function(elem, name, value) {
            var hooks, ret, nType = elem.nodeType;
            if (!elem || nType === 3 || nType === 8 || nType === 2) {
                return;
            }
            if (typeof elem.getAttribute === strundefined) {
                return jQuery.prop(elem, name, value);
            }
            if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
                name = name.toLowerCase();
                hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name) ? boolHook : nodeHook);
            }
            if (value !== undefined) {
                if (value === null) {
                    jQuery.removeAttr(elem, name);
                } else if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                    return ret;
                } else {
                    elem.setAttribute(name, value + "");
                    return value;
                }
            } else if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
                return ret;
            } else {
                ret = jQuery.find.attr(elem, name);
                return ret == null ? undefined : ret;
            }
        },
        removeAttr: function(elem, value) {
            var name, propName, i = 0,
                attrNames = value && value.match(rnotwhite);
            if (attrNames && elem.nodeType === 1) {
                while ((name = attrNames[i++])) {
                    propName = jQuery.propFix[name] || name;
                    if (jQuery.expr.match.bool.test(name)) {
                        if (getSetInput && getSetAttribute || !ruseDefault.test(name)) {
                            elem[propName] = false;
                        } else {
                            elem[jQuery.camelCase("default-" + name)] = elem[propName] = false;
                        }
                    } else {
                        jQuery.attr(elem, name, "");
                    }
                    elem.removeAttribute(getSetAttribute ? name : propName);
                }
            }
        },
        attrHooks: {
            type: {
                set: function(elem, value) {
                    if (!support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
                        var val = elem.value;
                        elem.setAttribute("type", value);
                        if (val) {
                            elem.value = val;
                        }
                        return value;
                    }
                }
            }
        }
    });
    boolHook = {
        set: function(elem, value, name) {
            if (value === false) {
                jQuery.removeAttr(elem, name);
            } else if (getSetInput && getSetAttribute || !ruseDefault.test(name)) {
                elem.setAttribute(!getSetAttribute && jQuery.propFix[name] || name, name);
            } else {
                elem[jQuery.camelCase("default-" + name)] = elem[name] = true;
            }
            return name;
        }
    };
    jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function(i, name) {
        var getter = attrHandle[name] || jQuery.find.attr;
        attrHandle[name] = getSetInput && getSetAttribute || !ruseDefault.test(name) ? function(elem, name, isXML) {
                var ret, handle;
                if (!isXML) {
                    handle = attrHandle[name];
                    attrHandle[name] = ret;
                    ret = getter(elem, name, isXML) != null ? name.toLowerCase() : null;
                    attrHandle[name] = handle;
                }
                return ret;
            } : function(elem, name, isXML) {
                if (!isXML) {
                    return elem[jQuery.camelCase("default-" + name)] ? name.toLowerCase() : null;
                }
            };
    });
    if (!getSetInput || !getSetAttribute) {
        jQuery.attrHooks.value = {
            set: function(elem, value, name) {
                if (jQuery.nodeName(elem, "input")) {
                    elem.defaultValue = value;
                } else {
                    return nodeHook && nodeHook.set(elem, value, name);
                }
            }
        };
    }
    if (!getSetAttribute) {
        nodeHook = {
            set: function(elem, value, name) {
                var ret = elem.getAttributeNode(name);
                if (!ret) {
                    elem.setAttributeNode((ret = elem.ownerDocument.createAttribute(name)));
                }
                ret.value = value += "";
                if (name === "value" || value === elem.getAttribute(name)) {
                    return value;
                }
            }
        };
        attrHandle.id = attrHandle.name = attrHandle.coords = function(elem, name, isXML) {
            var ret;
            if (!isXML) {
                return (ret = elem.getAttributeNode(name)) && ret.value !== "" ? ret.value : null;
            }
        };
        jQuery.valHooks.button = {
            get: function(elem, name) {
                var ret = elem.getAttributeNode(name);
                if (ret && ret.specified) {
                    return ret.value;
                }
            },
            set: nodeHook.set
        };
        jQuery.attrHooks.contenteditable = {
            set: function(elem, value, name) {
                nodeHook.set(elem, value === "" ? false : value, name);
            }
        };
        jQuery.each(["width", "height"], function(i, name) {
            jQuery.attrHooks[name] = {
                set: function(elem, value) {
                    if (value === "") {
                        elem.setAttribute(name, "auto");
                        return value;
                    }
                }
            };
        });
    }
    if (!support.style) {
        jQuery.attrHooks.style = {
            get: function(elem) {
                return elem.style.cssText || undefined;
            },
            set: function(elem, value) {
                return (elem.style.cssText = value + "");
            }
        };
    }
    var rfocusable = /^(?:input|select|textarea|button|object)$/i,
        rclickable = /^(?:a|area)$/i;
    jQuery.fn.extend({
        prop: function(name, value) {
            return access(this, jQuery.prop, name, value, arguments.length > 1);
        },
        removeProp: function(name) {
            name = jQuery.propFix[name] || name;
            return this.each(function() {
                try {
                    this[name] = undefined;
                    delete this[name];
                } catch (e) {}
            });
        }
    });
    jQuery.extend({
        propFix: {
            "for": "htmlFor",
            "class": "className"
        },
        prop: function(elem, name, value) {
            var ret, hooks, notxml, nType = elem.nodeType;
            if (!elem || nType === 3 || nType === 8 || nType === 2) {
                return;
            }
            notxml = nType !== 1 || !jQuery.isXMLDoc(elem);
            if (notxml) {
                name = jQuery.propFix[name] || name;
                hooks = jQuery.propHooks[name];
            }
            if (value !== undefined) {
                return hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined ? ret : (elem[name] = value);
            } else {
                return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
            }
        },
        propHooks: {
            tabIndex: {
                get: function(elem) {
                    var tabindex = jQuery.find.attr(elem, "tabindex");
                    return tabindex ? parseInt(tabindex, 10) : rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ? 0 : -1;
                }
            }
        }
    });
    if (!support.hrefNormalized) {
        jQuery.each(["href", "src"], function(i, name) {
            jQuery.propHooks[name] = {
                get: function(elem) {
                    return elem.getAttribute(name, 4);
                }
            };
        });
    }
    if (!support.optSelected) {
        jQuery.propHooks.selected = {
            get: function(elem) {
                var parent = elem.parentNode;
                if (parent) {
                    parent.selectedIndex;
                    if (parent.parentNode) {
                        parent.parentNode.selectedIndex;
                    }
                }
                return null;
            }
        };
    }
    jQuery.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
        jQuery.propFix[this.toLowerCase()] = this;
    });
    if (!support.enctype) {
        jQuery.propFix.enctype = "encoding";
    }
    var rclass = /[\t\r\n\f]/g;
    jQuery.fn.extend({
        addClass: function(value) {
            var classes, elem, cur, clazz, j, finalValue, i = 0,
                len = this.length,
                proceed = typeof value === "string" && value;
            if (jQuery.isFunction(value)) {
                return this.each(function(j) {
                    jQuery(this).addClass(value.call(this, j, this.className));
                });
            }
            if (proceed) {
                classes = (value || "").match(rnotwhite) || [];
                for (; i < len; i++) {
                    elem = this[i];
                    cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : " ");
                    if (cur) {
                        j = 0;
                        while ((clazz = classes[j++])) {
                            if (cur.indexOf(" " + clazz + " ") < 0) {
                                cur += clazz + " ";
                            }
                        }
                        finalValue = jQuery.trim(cur);
                        if (elem.className !== finalValue) {
                            elem.className = finalValue;
                        }
                    }
                }
            }
            return this;
        },
        removeClass: function(value) {
            var classes, elem, cur, clazz, j, finalValue, i = 0,
                len = this.length,
                proceed = arguments.length === 0 || typeof value === "string" && value;
            if (jQuery.isFunction(value)) {
                return this.each(function(j) {
                    jQuery(this).removeClass(value.call(this, j, this.className));
                });
            }
            if (proceed) {
                classes = (value || "").match(rnotwhite) || [];
                for (; i < len; i++) {
                    elem = this[i];
                    cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : "");
                    if (cur) {
                        j = 0;
                        while ((clazz = classes[j++])) {
                            while (cur.indexOf(" " + clazz + " ") >= 0) {
                                cur = cur.replace(" " + clazz + " ", " ");
                            }
                        }
                        finalValue = value ? jQuery.trim(cur) : "";
                        if (elem.className !== finalValue) {
                            elem.className = finalValue;
                        }
                    }
                }
            }
            return this;
        },
        toggleClass: function(value, stateVal) {
            var type = typeof value;
            if (typeof stateVal === "boolean" && type === "string") {
                return stateVal ? this.addClass(value) : this.removeClass(value);
            }
            if (jQuery.isFunction(value)) {
                return this.each(function(i) {
                    jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
                });
            }
            return this.each(function() {
                if (type === "string") {
                    var className, i = 0,
                        self = jQuery(this),
                        classNames = value.match(rnotwhite) || [];
                    while ((className = classNames[i++])) {
                        if (self.hasClass(className)) {
                            self.removeClass(className);
                        } else {
                            self.addClass(className);
                        }
                    }
                } else if (type === strundefined || type === "boolean") {
                    if (this.className) {
                        jQuery._data(this, "__className__", this.className);
                    }
                    this.className = this.className || value === false ? "" : jQuery._data(this, "__className__") || "";
                }
            });
        },
        hasClass: function(selector) {
            var className = " " + selector + " ",
                i = 0,
                l = this.length;
            for (; i < l; i++) {
                if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0) {
                    return true;
                }
            }
            return false;
        }
    });
    jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup error contextmenu").split(" "), function(i, name) {
        jQuery.fn[name] = function(data, fn) {
            return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
        };
    });
    jQuery.fn.extend({
        hover: function(fnOver, fnOut) {
            return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
        },
        bind: function(types, data, fn) {
            return this.on(types, null, data, fn);
        },
        unbind: function(types, fn) {
            return this.off(types, null, fn);
        },
        delegate: function(selector, types, data, fn) {
            return this.on(types, selector, data, fn);
        },
        undelegate: function(selector, types, fn) {
            return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
        }
    });
    var nonce = jQuery.now();
    var rquery = (/\?/);
    var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;
    jQuery.parseJSON = function(data) {
        if (window.JSON && window.JSON.parse) {
            return window.JSON.parse(data + "");
        }
        var requireNonComma, depth = null,
            str = jQuery.trim(data + "");
        return str && !jQuery.trim(str.replace(rvalidtokens, function(token, comma, open, close) {
            if (requireNonComma && comma) {
                depth = 0;
            }
            if (depth === 0) {
                return token;
            }
            requireNonComma = open || comma;
            depth += !close - !open;
            return "";
        })) ? (Function("return " + str))() : jQuery.error("Invalid JSON: " + data);
    };
    jQuery.parseXML = function(data) {
        var xml, tmp;
        if (!data || typeof data !== "string") {
            return null;
        }
        try {
            if (window.DOMParser) {
                tmp = new DOMParser();
                xml = tmp.parseFromString(data, "text/xml");
            } else {
                xml = new ActiveXObject("Microsoft.XMLDOM");
                xml.async = "false";
                xml.loadXML(data);
            }
        } catch (e) {
            xml = undefined;
        }
        if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
            jQuery.error("Invalid XML: " + data);
        }
        return xml;
    };
    var
        ajaxLocParts, ajaxLocation, rhash = /#.*$/,
        rts = /([?&])_=[^&]*/,
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,
        rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
        rnoContent = /^(?:GET|HEAD)$/,
        rprotocol = /^\/\//,
        rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
        prefilters = {},
        transports = {},
        allTypes = "*/".concat("*");
    try {
        ajaxLocation = location.href;
    } catch (e) {
        ajaxLocation = document.createElement("a");
        ajaxLocation.href = "";
        ajaxLocation = ajaxLocation.href;
    }
    ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];

    function addToPrefiltersOrTransports(structure) {
        return function(dataTypeExpression, func) {
            if (typeof dataTypeExpression !== "string") {
                func = dataTypeExpression;
                dataTypeExpression = "*";
            }
            var dataType, i = 0,
                dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];
            if (jQuery.isFunction(func)) {
                while ((dataType = dataTypes[i++])) {
                    if (dataType.charAt(0) === "+") {
                        dataType = dataType.slice(1) || "*";
                        (structure[dataType] = structure[dataType] || []).unshift(func);
                    } else {
                        (structure[dataType] = structure[dataType] || []).push(func);
                    }
                }
            }
        };
    }

    function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
        var inspected = {},
            seekingTransport = (structure === transports);

        function inspect(dataType) {
            var selected;
            inspected[dataType] = true;
            jQuery.each(structure[dataType] || [], function(_, prefilterOrFactory) {
                var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
                if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
                    options.dataTypes.unshift(dataTypeOrTransport);
                    inspect(dataTypeOrTransport);
                    return false;
                } else if (seekingTransport) {
                    return !(selected = dataTypeOrTransport);
                }
            });
            return selected;
        }
        return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
    }

    function ajaxExtend(target, src) {
        var deep, key, flatOptions = jQuery.ajaxSettings.flatOptions || {};
        for (key in src) {
            if (src[key] !== undefined) {
                (flatOptions[key] ? target : (deep || (deep = {})))[key] = src[key];
            }
        }
        if (deep) {
            jQuery.extend(true, target, deep);
        }
        return target;
    }

    function ajaxHandleResponses(s, jqXHR, responses) {
        var firstDataType, ct, finalDataType, type, contents = s.contents,
            dataTypes = s.dataTypes;
        while (dataTypes[0] === "*") {
            dataTypes.shift();
            if (ct === undefined) {
                ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
            }
        }
        if (ct) {
            for (type in contents) {
                if (contents[type] && contents[type].test(ct)) {
                    dataTypes.unshift(type);
                    break;
                }
            }
        }
        if (dataTypes[0] in responses) {
            finalDataType = dataTypes[0];
        } else {
            for (type in responses) {
                if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                    finalDataType = type;
                    break;
                }
                if (!firstDataType) {
                    firstDataType = type;
                }
            }
            finalDataType = finalDataType || firstDataType;
        }
        if (finalDataType) {
            if (finalDataType !== dataTypes[0]) {
                dataTypes.unshift(finalDataType);
            }
            return responses[finalDataType];
        }
    }

    function ajaxConvert(s, response, jqXHR, isSuccess) {
        var conv2, current, conv, tmp, prev, converters = {},
            dataTypes = s.dataTypes.slice();
        if (dataTypes[1]) {
            for (conv in s.converters) {
                converters[conv.toLowerCase()] = s.converters[conv];
            }
        }
        current = dataTypes.shift();
        while (current) {
            if (s.responseFields[current]) {
                jqXHR[s.responseFields[current]] = response;
            }
            if (!prev && isSuccess && s.dataFilter) {
                response = s.dataFilter(response, s.dataType);
            }
            prev = current;
            current = dataTypes.shift();
            if (current) {
                if (current === "*") {
                    current = prev;
                } else if (prev !== "*" && prev !== current) {
                    conv = converters[prev + " " + current] || converters["* " + current];
                    if (!conv) {
                        for (conv2 in converters) {
                            tmp = conv2.split(" ");
                            if (tmp[1] === current) {
                                conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
                                if (conv) {
                                    if (conv === true) {
                                        conv = converters[conv2];
                                    } else if (converters[conv2] !== true) {
                                        current = tmp[0];
                                        dataTypes.unshift(tmp[1]);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (conv !== true) {
                        if (conv && s["throws"]) {
                            response = conv(response);
                        } else {
                            try {
                                response = conv(response);
                            } catch (e) {
                                return {
                                    state: "parsererror",
                                    error: conv ? e : "No conversion from " + prev + " to " + current
                                };
                            }
                        }
                    }
                }
            }
        }
        return {
            state: "success",
            data: response
        };
    }
    jQuery.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: {
            url: ajaxLocation,
            type: "GET",
            isLocal: rlocalProtocol.test(ajaxLocParts[1]),
            global: true,
            processData: true,
            async: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
                "*": allTypes,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText",
                json: "responseJSON"
            },
            converters: {
                "* text": String,
                "text html": true,
                "text json": jQuery.parseJSON,
                "text xml": jQuery.parseXML
            },
            flatOptions: {
                url: true,
                context: true
            }
        },
        ajaxSetup: function(target, settings) {
            return settings ? ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) : ajaxExtend(jQuery.ajaxSettings, target);
        },
        ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
        ajaxTransport: addToPrefiltersOrTransports(transports),
        ajax: function(url, options) {
            if (typeof url === "object") {
                options = url;
                url = undefined;
            }
            options = options || {};
            var
                parts, i, cacheURL, responseHeadersString, timeoutTimer, fireGlobals, transport, responseHeaders, s = jQuery.ajaxSetup({}, options),
                callbackContext = s.context || s,
                globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event,
                deferred = jQuery.Deferred(),
                completeDeferred = jQuery.Callbacks("once memory"),
                statusCode = s.statusCode || {},
                requestHeaders = {},
                requestHeadersNames = {},
                state = 0,
                strAbort = "canceled",
                jqXHR = {
                    readyState: 0,
                    getResponseHeader: function(key) {
                        var match;
                        if (state === 2) {
                            if (!responseHeaders) {
                                responseHeaders = {};
                                while ((match = rheaders.exec(responseHeadersString))) {
                                    responseHeaders[match[1].toLowerCase()] = match[2];
                                }
                            }
                            match = responseHeaders[key.toLowerCase()];
                        }
                        return match == null ? null : match;
                    },
                    getAllResponseHeaders: function() {
                        return state === 2 ? responseHeadersString : null;
                    },
                    setRequestHeader: function(name, value) {
                        var lname = name.toLowerCase();
                        if (!state) {
                            name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                            requestHeaders[name] = value;
                        }
                        return this;
                    },
                    overrideMimeType: function(type) {
                        if (!state) {
                            s.mimeType = type;
                        }
                        return this;
                    },
                    statusCode: function(map) {
                        var code;
                        if (map) {
                            if (state < 2) {
                                for (code in map) {
                                    statusCode[code] = [statusCode[code], map[code]];
                                }
                            } else {
                                jqXHR.always(map[jqXHR.status]);
                            }
                        }
                        return this;
                    },
                    abort: function(statusText) {
                        var finalText = statusText || strAbort;
                        if (transport) {
                            transport.abort(finalText);
                        }
                        done(0, finalText);
                        return this;
                    }
                };
            deferred.promise(jqXHR).complete = completeDeferred.add;
            jqXHR.success = jqXHR.done;
            jqXHR.error = jqXHR.fail;
            s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");
            s.type = options.method || options.type || s.method || s.type;
            s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(rnotwhite) || [""];
            if (s.crossDomain == null) {
                parts = rurl.exec(s.url.toLowerCase());
                s.crossDomain = !!(parts && (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] || (parts[3] || (parts[1] === "http:" ? "80" : "443")) !== (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? "80" : "443"))));
            }
            if (s.data && s.processData && typeof s.data !== "string") {
                s.data = jQuery.param(s.data, s.traditional);
            }
            inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
            if (state === 2) {
                return jqXHR;
            }
            fireGlobals = jQuery.event && s.global;
            if (fireGlobals && jQuery.active++ === 0) {
                jQuery.event.trigger("ajaxStart");
            }
            s.type = s.type.toUpperCase();
            s.hasContent = !rnoContent.test(s.type);
            cacheURL = s.url;
            if (!s.hasContent) {
                if (s.data) {
                    cacheURL = (s.url += (rquery.test(cacheURL) ? "&" : "?") + s.data);
                    delete s.data;
                }
                if (s.cache === false) {
                    s.url = rts.test(cacheURL) ? cacheURL.replace(rts, "$1_=" + nonce++) : cacheURL + (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce++;
                }
            }
            if (s.ifModified) {
                if (jQuery.lastModified[cacheURL]) {
                    jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
                }
                if (jQuery.etag[cacheURL]) {
                    jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
                }
            }
            if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
                jqXHR.setRequestHeader("Content-Type", s.contentType);
            }
            jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);
            for (i in s.headers) {
                jqXHR.setRequestHeader(i, s.headers[i]);
            }
            if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
                return jqXHR.abort();
            }
            strAbort = "abort";
            for (i in {
                success: 1,
                error: 1,
                complete: 1
            }) {
                jqXHR[i](s[i]);
            }
            transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
            if (!transport) {
                done(-1, "No Transport");
            } else {
                jqXHR.readyState = 1;
                if (fireGlobals) {
                    globalEventContext.trigger("ajaxSend", [jqXHR, s]);
                }
                if (s.async && s.timeout > 0) {
                    timeoutTimer = setTimeout(function() {
                        jqXHR.abort("timeout");
                    }, s.timeout);
                }
                try {
                    state = 1;
                    transport.send(requestHeaders, done);
                } catch (e) {
                    if (state < 2) {
                        done(-1, e);
                    } else {
                        throw e;
                    }
                }
            }

            function done(status, nativeStatusText, responses, headers) {
                var isSuccess, success, error, response, modified, statusText = nativeStatusText;
                if (state === 2) {
                    return;
                }
                state = 2;
                if (timeoutTimer) {
                    clearTimeout(timeoutTimer);
                }
                transport = undefined;
                responseHeadersString = headers || "";
                jqXHR.readyState = status > 0 ? 4 : 0;
                isSuccess = status >= 200 && status < 300 || status === 304;
                if (responses) {
                    response = ajaxHandleResponses(s, jqXHR, responses);
                }
                response = ajaxConvert(s, response, jqXHR, isSuccess);
                if (isSuccess) {
                    if (s.ifModified) {
                        modified = jqXHR.getResponseHeader("Last-Modified");
                        if (modified) {
                            jQuery.lastModified[cacheURL] = modified;
                        }
                        modified = jqXHR.getResponseHeader("etag");
                        if (modified) {
                            jQuery.etag[cacheURL] = modified;
                        }
                    }
                    if (status === 204 || s.type === "HEAD") {
                        statusText = "nocontent";
                    } else if (status === 304) {
                        statusText = "notmodified";
                    } else {
                        statusText = response.state;
                        success = response.data;
                        error = response.error;
                        isSuccess = !error;
                    }
                } else {
                    error = statusText;
                    if (status || !statusText) {
                        statusText = "error";
                        if (status < 0) {
                            status = 0;
                        }
                    }
                }
                jqXHR.status = status;
                jqXHR.statusText = (nativeStatusText || statusText) + "";
                if (isSuccess) {
                    deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
                } else {
                    deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
                }
                jqXHR.statusCode(statusCode);
                statusCode = undefined;
                if (fireGlobals) {
                    globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error]);
                }
                completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);
                if (fireGlobals) {
                    globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
                    if (!(--jQuery.active)) {
                        jQuery.event.trigger("ajaxStop");
                    }
                }
            }
            return jqXHR;
        },
        getJSON: function(url, data, callback) {
            return jQuery.get(url, data, callback, "json");
        },
        getScript: function(url, callback) {
            return jQuery.get(url, undefined, callback, "script");
        }
    });
    jQuery.each(["get", "post"], function(i, method) {
        jQuery[method] = function(url, data, callback, type) {
            if (jQuery.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            return jQuery.ajax({
                url: url,
                type: method,
                dataType: type,
                data: data,
                success: callback
            });
        };
    });
    jQuery._evalUrl = function(url) {
        return jQuery.ajax({
            url: url,
            type: "GET",
            dataType: "script",
            async: false,
            global: false,
            "throws": true
        });
    };
    jQuery.fn.extend({
        wrapAll: function(html) {
            if (jQuery.isFunction(html)) {
                return this.each(function(i) {
                    jQuery(this).wrapAll(html.call(this, i));
                });
            }
            if (this[0]) {
                var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);
                if (this[0].parentNode) {
                    wrap.insertBefore(this[0]);
                }
                wrap.map(function() {
                    var elem = this;
                    while (elem.firstChild && elem.firstChild.nodeType === 1) {
                        elem = elem.firstChild;
                    }
                    return elem;
                }).append(this);
            }
            return this;
        },
        wrapInner: function(html) {
            if (jQuery.isFunction(html)) {
                return this.each(function(i) {
                    jQuery(this).wrapInner(html.call(this, i));
                });
            }
            return this.each(function() {
                var self = jQuery(this),
                    contents = self.contents();
                if (contents.length) {
                    contents.wrapAll(html);
                } else {
                    self.append(html);
                }
            });
        },
        wrap: function(html) {
            var isFunction = jQuery.isFunction(html);
            return this.each(function(i) {
                jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
            });
        },
        unwrap: function() {
            return this.parent().each(function() {
                if (!jQuery.nodeName(this, "body")) {
                    jQuery(this).replaceWith(this.childNodes);
                }
            }).end();
        }
    });
    jQuery.expr.filters.hidden = function(elem) {
        return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 || (!support.reliableHiddenOffsets() && ((elem.style && elem.style.display) || jQuery.css(elem, "display")) === "none");
    };
    jQuery.expr.filters.visible = function(elem) {
        return !jQuery.expr.filters.hidden(elem);
    };
    var r20 = /%20/g,
        rbracket = /\[\]$/,
        rCRLF = /\r?\n/g,
        rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
        rsubmittable = /^(?:input|select|textarea|keygen)/i;

    function buildParams(prefix, obj, traditional, add) {
        var name;
        if (jQuery.isArray(obj)) {
            jQuery.each(obj, function(i, v) {
                if (traditional || rbracket.test(prefix)) {
                    add(prefix, v);
                } else {
                    buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
                }
            });
        } else if (!traditional && jQuery.type(obj) === "object") {
            for (name in obj) {
                buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
            }
        } else {
            add(prefix, obj);
        }
    }
    jQuery.param = function(a, traditional) {
        var prefix, s = [],
            add = function(key, value) {
                value = jQuery.isFunction(value) ? value() : (value == null ? "" : value);
                s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
            };
        if (traditional === undefined) {
            traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
        }
        if (jQuery.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
            jQuery.each(a, function() {
                add(this.name, this.value);
            });
        } else {
            for (prefix in a) {
                buildParams(prefix, a[prefix], traditional, add);
            }
        }
        return s.join("&").replace(r20, "+");
    };
    jQuery.fn.extend({
        serialize: function() {
            return jQuery.param(this.serializeArray());
        },
        serializeArray: function() {
            return this.map(function() {
                var elements = jQuery.prop(this, "elements");
                return elements ? jQuery.makeArray(elements) : this;
            }).filter(function() {
                var type = this.type;
                return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
            }).map(function(i, elem) {
                var val = jQuery(this).val();
                return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function(val) {
                            return {
                                name: elem.name,
                                value: val.replace(rCRLF, "\r\n")
                            };
                        }) : {
                            name: elem.name,
                            value: val.replace(rCRLF, "\r\n")
                        };
            }).get();
        }
    });
    jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ? function() {
            return !this.isLocal && /^(get|post|head|put|delete|options)$/i.test(this.type) && createStandardXHR() || createActiveXHR();
        } : createStandardXHR;
    var xhrId = 0,
        xhrCallbacks = {},
        xhrSupported = jQuery.ajaxSettings.xhr();
    if (window.attachEvent) {
        window.attachEvent("onunload", function() {
            for (var key in xhrCallbacks) {
                xhrCallbacks[key](undefined, true);
            }
        });
    }
    support.cors = !!xhrSupported && ("withCredentials" in xhrSupported);
    xhrSupported = support.ajax = !!xhrSupported;
    if (xhrSupported) {
        jQuery.ajaxTransport(function(options) {
            if (!options.crossDomain || support.cors) {
                var callback;
                return {
                    send: function(headers, complete) {
                        var i, xhr = options.xhr(),
                            id = ++xhrId;
                        xhr.open(options.type, options.url, options.async, options.username, options.password);
                        if (options.xhrFields) {
                            for (i in options.xhrFields) {
                                xhr[i] = options.xhrFields[i];
                            }
                        }
                        if (options.mimeType && xhr.overrideMimeType) {
                            xhr.overrideMimeType(options.mimeType);
                        }
                        if (!options.crossDomain && !headers["X-Requested-With"]) {
                            headers["X-Requested-With"] = "XMLHttpRequest";
                        }
                        for (i in headers) {
                            if (headers[i] !== undefined) {
                                xhr.setRequestHeader(i, headers[i] + "");
                            }
                        }
                        xhr.send((options.hasContent && options.data) || null);
                        callback = function(_, isAbort) {
                            var status, statusText, responses;
                            if (callback && (isAbort || xhr.readyState === 4)) {
                                delete xhrCallbacks[id];
                                callback = undefined;
                                xhr.onreadystatechange = jQuery.noop;
                                if (isAbort) {
                                    if (xhr.readyState !== 4) {
                                        xhr.abort();
                                    }
                                } else {
                                    responses = {};
                                    status = xhr.status;
                                    if (typeof xhr.responseText === "string") {
                                        responses.text = xhr.responseText;
                                    }
                                    try {
                                        statusText = xhr.statusText;
                                    } catch (e) {
                                        statusText = "";
                                    }
                                    if (!status && options.isLocal && !options.crossDomain) {
                                        status = responses.text ? 200 : 404;
                                    } else if (status === 1223) {
                                        status = 204;
                                    }
                                }
                            }
                            if (responses) {
                                complete(status, statusText, responses, xhr.getAllResponseHeaders());
                            }
                        };
                        if (!options.async) {
                            callback();
                        } else if (xhr.readyState === 4) {
                            setTimeout(callback);
                        } else {
                            xhr.onreadystatechange = xhrCallbacks[id] = callback;
                        }
                    },
                    abort: function() {
                        if (callback) {
                            callback(undefined, true);
                        }
                    }
                };
            }
        });
    }

    function createStandardXHR() {
        try {
            return new window.XMLHttpRequest();
        } catch (e) {}
    }

    function createActiveXHR() {
        try {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {}
    }
    jQuery.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /(?:java|ecma)script/
        },
        converters: {
            "text script": function(text) {
                jQuery.globalEval(text);
                return text;
            }
        }
    });
    jQuery.ajaxPrefilter("script", function(s) {
        if (s.cache === undefined) {
            s.cache = false;
        }
        if (s.crossDomain) {
            s.type = "GET";
            s.global = false;
        }
    });
    jQuery.ajaxTransport("script", function(s) {
        if (s.crossDomain) {
            var script, head = document.head || jQuery("head")[0] || document.documentElement;
            return {
                send: function(_, callback) {
                    script = document.createElement("script");
                    script.async = true;
                    if (s.scriptCharset) {
                        script.charset = s.scriptCharset;
                    }
                    script.src = s.url;
                    script.onload = script.onreadystatechange = function(_, isAbort) {
                        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                            script.onload = script.onreadystatechange = null;
                            if (script.parentNode) {
                                script.parentNode.removeChild(script);
                            }
                            script = null;
                            if (!isAbort) {
                                callback(200, "success");
                            }
                        }
                    };
                    head.insertBefore(script, head.firstChild);
                },
                abort: function() {
                    if (script) {
                        script.onload(undefined, true);
                    }
                }
            };
        }
    });
    var oldCallbacks = [],
        rjsonp = /(=)\?(?=&|$)|\?\?/;
    jQuery.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var callback = oldCallbacks.pop() || (jQuery.expando + "_" + (nonce++));
            this[callback] = true;
            return callback;
        }
    });
    jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
        var callbackName, overwritten, responseContainer, jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data");
        if (jsonProp || s.dataTypes[0] === "jsonp") {
            callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
            if (jsonProp) {
                s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
            } else if (s.jsonp !== false) {
                s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
            }
            s.converters["script json"] = function() {
                if (!responseContainer) {
                    jQuery.error(callbackName + " was not called");
                }
                return responseContainer[0];
            };
            s.dataTypes[0] = "json";
            overwritten = window[callbackName];
            window[callbackName] = function() {
                responseContainer = arguments;
            };
            jqXHR.always(function() {
                window[callbackName] = overwritten;
                if (s[callbackName]) {
                    s.jsonpCallback = originalSettings.jsonpCallback;
                    oldCallbacks.push(callbackName);
                }
                if (responseContainer && jQuery.isFunction(overwritten)) {
                    overwritten(responseContainer[0]);
                }
                responseContainer = overwritten = undefined;
            });
            return "script";
        }
    });
    jQuery.parseHTML = function(data, context, keepScripts) {
        if (!data || typeof data !== "string") {
            return null;
        }
        if (typeof context === "boolean") {
            keepScripts = context;
            context = false;
        }
        context = context || document;
        var parsed = rsingleTag.exec(data),
            scripts = !keepScripts && [];
        if (parsed) {
            return [context.createElement(parsed[1])];
        }
        parsed = jQuery.buildFragment([data], context, scripts);
        if (scripts && scripts.length) {
            jQuery(scripts).remove();
        }
        return jQuery.merge([], parsed.childNodes);
    };
    var _load = jQuery.fn.load;
    jQuery.fn.load = function(url, params, callback) {
        if (typeof url !== "string" && _load) {
            return _load.apply(this, arguments);
        }
        var selector, response, type, self = this,
            off = url.indexOf(" ");
        if (off >= 0) {
            selector = jQuery.trim(url.slice(off, url.length));
            url = url.slice(0, off);
        }
        if (jQuery.isFunction(params)) {
            callback = params;
            params = undefined;
        } else if (params && typeof params === "object") {
            type = "POST";
        }
        if (self.length > 0) {
            jQuery.ajax({
                url: url,
                type: type,
                dataType: "html",
                data: params
            }).done(function(responseText) {
                response = arguments;
                self.html(selector ? jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) : responseText);
            }).complete(callback && function(jqXHR, status) {
                    self.each(callback, response || [jqXHR.responseText, status, jqXHR]);
                });
        }
        return this;
    };
    jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(i, type) {
        jQuery.fn[type] = function(fn) {
            return this.on(type, fn);
        };
    });
    jQuery.expr.filters.animated = function(elem) {
        return jQuery.grep(jQuery.timers, function(fn) {
            return elem === fn.elem;
        }).length;
    };
    var docElem = window.document.documentElement;

    function getWindow(elem) {
        return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : false;
    }
    jQuery.offset = {
        setOffset: function(elem, options, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = jQuery.css(elem, "position"),
                curElem = jQuery(elem),
                props = {};
            if (position === "static") {
                elem.style.position = "relative";
            }
            curOffset = curElem.offset();
            curCSSTop = jQuery.css(elem, "top");
            curCSSLeft = jQuery.css(elem, "left");
            calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1;
            if (calculatePosition) {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left;
            } else {
                curTop = parseFloat(curCSSTop) || 0;
                curLeft = parseFloat(curCSSLeft) || 0;
            }
            if (jQuery.isFunction(options)) {
                options = options.call(elem, i, curOffset);
            }
            if (options.top != null) {
                props.top = (options.top - curOffset.top) + curTop;
            }
            if (options.left != null) {
                props.left = (options.left - curOffset.left) + curLeft;
            }
            if ("using" in options) {
                options.using.call(elem, props);
            } else {
                curElem.css(props);
            }
        }
    };
    jQuery.fn.extend({
        offset: function(options) {
            if (arguments.length) {
                return options === undefined ? this : this.each(function(i) {
                        jQuery.offset.setOffset(this, options, i);
                    });
            }
            var docElem, win, box = {
                    top: 0,
                    left: 0
                },
                elem = this[0],
                doc = elem && elem.ownerDocument;
            if (!doc) {
                return;
            }
            docElem = doc.documentElement;
            if (!jQuery.contains(docElem, elem)) {
                return box;
            }
            if (typeof elem.getBoundingClientRect !== strundefined) {
                box = elem.getBoundingClientRect();
            }
            win = getWindow(doc);
            return {
                top: box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
                left: box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
            };
        },
        position: function() {
            if (!this[0]) {
                return;
            }
            var offsetParent, offset, parentOffset = {
                    top: 0,
                    left: 0
                },
                elem = this[0];
            if (jQuery.css(elem, "position") === "fixed") {
                offset = elem.getBoundingClientRect();
            } else {
                offsetParent = this.offsetParent();
                offset = this.offset();
                if (!jQuery.nodeName(offsetParent[0], "html")) {
                    parentOffset = offsetParent.offset();
                }
                parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", true);
                parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", true);
            }
            return {
                top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
                left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", true)
            };
        },
        offsetParent: function() {
            return this.map(function() {
                var offsetParent = this.offsetParent || docElem;
                while (offsetParent && (!jQuery.nodeName(offsetParent, "html") && jQuery.css(offsetParent, "position") === "static")) {
                    offsetParent = offsetParent.offsetParent;
                }
                return offsetParent || docElem;
            });
        }
    });
    jQuery.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(method, prop) {
        var top = /Y/.test(prop);
        jQuery.fn[method] = function(val) {
            return access(this, function(elem, method, val) {
                var win = getWindow(elem);
                if (val === undefined) {
                    return win ? (prop in win) ? win[prop] : win.document.documentElement[method] : elem[method];
                }
                if (win) {
                    win.scrollTo(!top ? val : jQuery(win).scrollLeft(), top ? val : jQuery(win).scrollTop());
                } else {
                    elem[method] = val;
                }
            }, method, val, arguments.length, null);
        };
    });
    jQuery.each(["top", "left"], function(i, prop) {
        jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function(elem, computed) {
            if (computed) {
                computed = curCSS(elem, prop);
                return rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + "px" : computed;
            }
        });
    });
    jQuery.each({
        Height: "height",
        Width: "width"
    }, function(name, type) {
        jQuery.each({
            padding: "inner" + name,
            content: type,
            "": "outer" + name
        }, function(defaultExtra, funcName) {
            jQuery.fn[funcName] = function(margin, value) {
                var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"),
                    extra = defaultExtra || (margin === true || value === true ? "margin" : "border");
                return access(this, function(elem, type, value) {
                    var doc;
                    if (jQuery.isWindow(elem)) {
                        return elem.document.documentElement["client" + name];
                    }
                    if (elem.nodeType === 9) {
                        doc = elem.documentElement;
                        return Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
                    }
                    return value === undefined ? jQuery.css(elem, type, extra) : jQuery.style(elem, type, value, extra);
                }, type, chainable ? margin : undefined, chainable, null);
            };
        });
    });
    jQuery.fn.size = function() {
        return this.length;
    };
    jQuery.fn.andSelf = jQuery.fn.addBack;
    if (typeof define === "function" && define.amd) {
        define("jquery", [], function() {
            return jQuery;
        });
    }
    var
        _jQuery = window.jQuery,
        _$ = window.$;
    jQuery.noConflict = function(deep) {
        if (window.$ === jQuery) {
            window.$ = _$;
        }
        if (deep && window.jQuery === jQuery) {
            window.jQuery = _jQuery;
        }
        return jQuery;
    };
    if (typeof noGlobal === strundefined) {
        window.jQuery = window.$ = jQuery;
    }
    return jQuery;
}));
(function(jQuery, window, undefined) {
    var warnedAbout = {};
    jQuery.migrateWarnings = [];
    if (!jQuery.migrateMute && window.console && window.console.log) {
        window.console.log("JQMIGRATE: Logging is active");
    }
    if (jQuery.migrateTrace === undefined) {
        jQuery.migrateTrace = true;
    }
    jQuery.migrateReset = function() {
        warnedAbout = {};
        jQuery.migrateWarnings.length = 0;
    };

    function migrateWarn(msg) {
        var console = window.console;
        if (!warnedAbout[msg]) {
            warnedAbout[msg] = true;
            jQuery.migrateWarnings.push(msg);
            if (console && console.warn && !jQuery.migrateMute) {
                console.warn("JQMIGRATE: " + msg);
                if (jQuery.migrateTrace && console.trace) {
                    console.trace();
                }
            }
        }
    }

    function migrateWarnProp(obj, prop, value, msg) {
        if (Object.defineProperty) {
            try {
                Object.defineProperty(obj, prop, {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                        migrateWarn(msg);
                        return value;
                    },
                    set: function(newValue) {
                        migrateWarn(msg);
                        value = newValue;
                    }
                });
                return;
            } catch (err) {}
        }
        jQuery._definePropertyBroken = true;
        obj[prop] = value;
    }
    if (document.compatMode === "BackCompat") {
        migrateWarn("jQuery is not compatible with Quirks Mode");
    }
    var attrFn = jQuery("<input/>", {
                size: 1
            }).attr("size") && jQuery.attrFn,
        oldAttr = jQuery.attr,
        valueAttrGet = jQuery.attrHooks.value && jQuery.attrHooks.value.get || function() {
                return null;
            },
        valueAttrSet = jQuery.attrHooks.value && jQuery.attrHooks.value.set || function() {
                return undefined;
            },
        rnoType = /^(?:input|button)$/i,
        rnoAttrNodeType = /^[238]$/,
        rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
        ruseDefault = /^(?:checked|selected)$/i;
    migrateWarnProp(jQuery, "attrFn", attrFn || {}, "jQuery.attrFn is deprecated");
    jQuery.attr = function(elem, name, value, pass) {
        var lowerName = name.toLowerCase(),
            nType = elem && elem.nodeType;
        if (pass) {
            if (oldAttr.length < 4) {
                migrateWarn("jQuery.fn.attr( props, pass ) is deprecated");
            }
            if (elem && !rnoAttrNodeType.test(nType) && (attrFn ? name in attrFn : jQuery.isFunction(jQuery.fn[name]))) {
                return jQuery(elem)[name](value);
            }
        }
        if (name === "type" && value !== undefined && rnoType.test(elem.nodeName) && elem.parentNode) {
            migrateWarn("Can't change the 'type' of an input or button in IE 6/7/8");
        }
        if (!jQuery.attrHooks[lowerName] && rboolean.test(lowerName)) {
            jQuery.attrHooks[lowerName] = {
                get: function(elem, name) {
                    var attrNode, property = jQuery.prop(elem, name);
                    return property === true || typeof property !== "boolean" && (attrNode = elem.getAttributeNode(name)) && attrNode.nodeValue !== false ? name.toLowerCase() : undefined;
                },
                set: function(elem, value, name) {
                    var propName;
                    if (value === false) {
                        jQuery.removeAttr(elem, name);
                    } else {
                        propName = jQuery.propFix[name] || name;
                        if (propName in elem) {
                            elem[propName] = true;
                        }
                        elem.setAttribute(name, name.toLowerCase());
                    }
                    return name;
                }
            };
            if (ruseDefault.test(lowerName)) {
                migrateWarn("jQuery.fn.attr('" + lowerName + "') may use property instead of attribute");
            }
        }
        return oldAttr.call(jQuery, elem, name, value);
    };
    jQuery.attrHooks.value = {
        get: function(elem, name) {
            var nodeName = (elem.nodeName || "").toLowerCase();
            if (nodeName === "button") {
                return valueAttrGet.apply(this, arguments);
            }
            if (nodeName !== "input" && nodeName !== "option") {
                migrateWarn("jQuery.fn.attr('value') no longer gets properties");
            }
            return name in elem ? elem.value : null;
        },
        set: function(elem, value) {
            var nodeName = (elem.nodeName || "").toLowerCase();
            if (nodeName === "button") {
                return valueAttrSet.apply(this, arguments);
            }
            if (nodeName !== "input" && nodeName !== "option") {
                migrateWarn("jQuery.fn.attr('value', val) no longer sets properties");
            }
            elem.value = value;
        }
    };
    var matched, browser, oldInit = jQuery.fn.init,
        oldParseJSON = jQuery.parseJSON,
        rquickExpr = /^([^<]*)(<[\w\W]+>)([^>]*)$/;
    jQuery.fn.init = function(selector, context, rootjQuery) {
        var match;
        if (selector && typeof selector === "string" && !jQuery.isPlainObject(context) && (match = rquickExpr.exec(jQuery.trim(selector))) && match[0]) {
            if (selector.charAt(0) !== "<") {
                migrateWarn("$(html) HTML strings must start with '<' character");
            }
            if (match[3]) {
                migrateWarn("$(html) HTML text after last tag is ignored");
            }
            if (match[0].charAt(0) === "#") {
                migrateWarn("HTML string cannot start with a '#' character");
                jQuery.error("JQMIGRATE: Invalid selector string (XSS)");
            }
            if (context && context.context) {
                context = context.context;
            }
            if (jQuery.parseHTML) {
                return oldInit.call(this, jQuery.parseHTML(match[2], context, true), context, rootjQuery);
            }
        }
        return oldInit.apply(this, arguments);
    };
    jQuery.fn.init.prototype = jQuery.fn;
    jQuery.parseJSON = function(json) {
        if (!json && json !== null) {
            migrateWarn("jQuery.parseJSON requires a valid JSON string");
            return null;
        }
        return oldParseJSON.apply(this, arguments);
    };
    jQuery.uaMatch = function(ua) {
        ua = ua.toLowerCase();
        var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
        return {
            browser: match[1] || "",
            version: match[2] || "0"
        };
    };
    if (!jQuery.browser) {
        matched = jQuery.uaMatch(navigator.userAgent);
        browser = {};
        if (matched.browser) {
            browser[matched.browser] = true;
            browser.version = matched.version;
        }
        if (browser.chrome) {
            browser.webkit = true;
        } else if (browser.webkit) {
            browser.safari = true;
        }
        jQuery.browser = browser;
    }
    migrateWarnProp(jQuery, "browser", jQuery.browser, "jQuery.browser is deprecated");
    jQuery.sub = function() {
        function jQuerySub(selector, context) {
            return new jQuerySub.fn.init(selector, context);
        }
        jQuery.extend(true, jQuerySub, this);
        jQuerySub.superclass = this;
        jQuerySub.fn = jQuerySub.prototype = this();
        jQuerySub.fn.constructor = jQuerySub;
        jQuerySub.sub = this.sub;
        jQuerySub.fn.init = function init(selector, context) {
            if (context && context instanceof jQuery && !(context instanceof jQuerySub)) {
                context = jQuerySub(context);
            }
            return jQuery.fn.init.call(this, selector, context, rootjQuerySub);
        };
        jQuerySub.fn.init.prototype = jQuerySub.fn;
        var rootjQuerySub = jQuerySub(document);
        migrateWarn("jQuery.sub() is deprecated");
        return jQuerySub;
    };
    jQuery.ajaxSetup({
        converters: {
            "text json": jQuery.parseJSON
        }
    });
    var oldFnData = jQuery.fn.data;
    jQuery.fn.data = function(name) {
        var ret, evt, elem = this[0];
        if (elem && name === "events" && arguments.length === 1) {
            ret = jQuery.data(elem, name);
            evt = jQuery._data(elem, name);
            if ((ret === undefined || ret === evt) && evt !== undefined) {
                migrateWarn("Use of jQuery.fn.data('events') is deprecated");
                return evt;
            }
        }
        return oldFnData.apply(this, arguments);
    };
    var rscriptType = /\/(java|ecma)script/i,
        oldSelf = jQuery.fn.andSelf || jQuery.fn.addBack;
    jQuery.fn.andSelf = function() {
        migrateWarn("jQuery.fn.andSelf() replaced by jQuery.fn.addBack()");
        return oldSelf.apply(this, arguments);
    };
    if (!jQuery.clean) {
        jQuery.clean = function(elems, context, fragment, scripts) {
            context = context || document;
            context = !context.nodeType && context[0] || context;
            context = context.ownerDocument || context;
            migrateWarn("jQuery.clean() is deprecated");
            var i, elem, handleScript, jsTags, ret = [];
            jQuery.merge(ret, jQuery.buildFragment(elems, context).childNodes);
            if (fragment) {
                handleScript = function(elem) {
                    if (!elem.type || rscriptType.test(elem.type)) {
                        return scripts ? scripts.push(elem.parentNode ? elem.parentNode.removeChild(elem) : elem) : fragment.appendChild(elem);
                    }
                };
                for (i = 0;
                     (elem = ret[i]) != null; i++) {
                    if (!(jQuery.nodeName(elem, "script") && handleScript(elem))) {
                        fragment.appendChild(elem);
                        if (typeof elem.getElementsByTagName !== "undefined") {
                            jsTags = jQuery.grep(jQuery.merge([], elem.getElementsByTagName("script")), handleScript);
                            ret.splice.apply(ret, [i + 1, 0].concat(jsTags));
                            i += jsTags.length;
                        }
                    }
                }
            }
            return ret;
        };
    }
    var eventAdd = jQuery.event.add,
        eventRemove = jQuery.event.remove,
        eventTrigger = jQuery.event.trigger,
        oldToggle = jQuery.fn.toggle,
        oldLive = jQuery.fn.live,
        oldDie = jQuery.fn.die,
        ajaxEvents = "ajaxStart|ajaxStop|ajaxSend|ajaxComplete|ajaxError|ajaxSuccess",
        rajaxEvent = new RegExp("\\b(?:" + ajaxEvents + ")\\b"),
        rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
        hoverHack = function(events) {
            if (typeof(events) !== "string" || jQuery.event.special.hover) {
                return events;
            }
            if (rhoverHack.test(events)) {
                migrateWarn("'hover' pseudo-event is deprecated, use 'mouseenter mouseleave'");
            }
            return events && events.replace(rhoverHack, "mouseenter$1 mouseleave$1");
        };
    if (jQuery.event.props && jQuery.event.props[0] !== "attrChange") {
        jQuery.event.props.unshift("attrChange", "attrName", "relatedNode", "srcElement");
    }
    if (jQuery.event.dispatch) {
        migrateWarnProp(jQuery.event, "handle", jQuery.event.dispatch, "jQuery.event.handle is undocumented and deprecated");
    }
    jQuery.event.add = function(elem, types, handler, data, selector) {
        if (elem !== document && rajaxEvent.test(types)) {
            migrateWarn("AJAX events should be attached to document: " + types);
        }
        eventAdd.call(this, elem, hoverHack(types || ""), handler, data, selector);
    };
    jQuery.event.remove = function(elem, types, handler, selector, mappedTypes) {
        eventRemove.call(this, elem, hoverHack(types) || "", handler, selector, mappedTypes);
    };
    jQuery.fn.error = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        migrateWarn("jQuery.fn.error() is deprecated");
        args.splice(0, 0, "error");
        if (arguments.length) {
            return this.bind.apply(this, args);
        }
        this.triggerHandler.apply(this, args);
        return this;
    };
    jQuery.fn.toggle = function(fn, fn2) {
        if (!jQuery.isFunction(fn) || !jQuery.isFunction(fn2)) {
            return oldToggle.apply(this, arguments);
        }
        migrateWarn("jQuery.fn.toggle(handler, handler...) is deprecated");
        var args = arguments,
            guid = fn.guid || jQuery.guid++,
            i = 0,
            toggler = function(event) {
                var lastToggle = (jQuery._data(this, "lastToggle" + fn.guid) || 0) % i;
                jQuery._data(this, "lastToggle" + fn.guid, lastToggle + 1);
                event.preventDefault();
                return args[lastToggle].apply(this, arguments) || false;
            };
        toggler.guid = guid;
        while (i < args.length) {
            args[i++].guid = guid;
        }
        return this.click(toggler);
    };
    jQuery.fn.live = function(types, data, fn) {
        migrateWarn("jQuery.fn.live() is deprecated");
        if (oldLive) {
            return oldLive.apply(this, arguments);
        }
        jQuery(this.context).on(types, this.selector, data, fn);
        return this;
    };
    jQuery.fn.die = function(types, fn) {
        migrateWarn("jQuery.fn.die() is deprecated");
        if (oldDie) {
            return oldDie.apply(this, arguments);
        }
        jQuery(this.context).off(types, this.selector || "**", fn);
        return this;
    };
    jQuery.event.trigger = function(event, data, elem, onlyHandlers) {
        if (!elem && !rajaxEvent.test(event)) {
            migrateWarn("Global events are undocumented and deprecated");
        }
        return eventTrigger.call(this, event, data, elem || document, onlyHandlers);
    };
    jQuery.each(ajaxEvents.split("|"), function(_, name) {
        jQuery.event.special[name] = {
            setup: function() {
                var elem = this;
                if (elem !== document) {
                    jQuery.event.add(document, name + "." + jQuery.guid, function() {
                        jQuery.event.trigger(name, null, elem, true);
                    });
                    jQuery._data(this, name, jQuery.guid++);
                }
                return false;
            },
            teardown: function() {
                if (this !== document) {
                    jQuery.event.remove(document, name + "." + jQuery._data(this, name));
                }
                return false;
            }
        };
    });
})(jQuery, window);


(function() {
    var root = this;
    var previousUnderscore = root._;
    var breaker = {};
    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype;
    var push = ArrayProto.push,
        slice = ArrayProto.slice,
        concat = ArrayProto.concat,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;
    var
        nativeForEach = ArrayProto.forEach,
        nativeMap = ArrayProto.map,
        nativeReduce = ArrayProto.reduce,
        nativeReduceRight = ArrayProto.reduceRight,
        nativeFilter = ArrayProto.filter,
        nativeEvery = ArrayProto.every,
        nativeSome = ArrayProto.some,
        nativeIndexOf = ArrayProto.indexOf,
        nativeLastIndexOf = ArrayProto.lastIndexOf,
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind;
    var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }
    _.VERSION = '1.4.4';
    var each = _.each = _.forEach = function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            for (var key in obj) {
                if (_.has(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) return;
                }
            }
        }
    };
    _.map = _.collect = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
        each(obj, function(value, index, list) {
            results[results.length] = iterator.call(context, value, index, list);
        });
        return results;
    };
    var reduceError = 'Reduce of empty array with no initial value';
    _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj, function(value, index, list) {
            if (!initial) {
                memo = value;
                initial = true;
            } else {
                memo = iterator.call(context, memo, value, index, list);
            }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
    };
    _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
        }
        var length = obj.length;
        if (length !== +length) {
            var keys = _.keys(obj);
            length = keys.length;
        }
        each(obj, function(value, index, list) {
            index = keys ? keys[--length] : --length;
            if (!initial) {
                memo = obj[index];
                initial = true;
            } else {
                memo = iterator.call(context, memo, obj[index], index, list);
            }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
    };
    _.find = _.detect = function(obj, iterator, context) {
        var result;
        any(obj, function(value, index, list) {
            if (iterator.call(context, value, index, list)) {
                result = value;
                return true;
            }
        });
        return result;
    };
    _.filter = _.select = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
        each(obj, function(value, index, list) {
            if (iterator.call(context, value, index, list)) results[results.length] = value;
        });
        return results;
    };
    _.reject = function(obj, iterator, context) {
        return _.filter(obj, function(value, index, list) {
            return !iterator.call(context, value, index, list);
        }, context);
    };
    _.every = _.all = function(obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = true;
        if (obj == null) return result;
        if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
        each(obj, function(value, index, list) {
            if (!(result = result && iterator.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };
    var any = _.some = _.any = function(obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = false;
        if (obj == null) return result;
        if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
        each(obj, function(value, index, list) {
            if (result || (result = iterator.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };
    _.contains = _.include = function(obj, target) {
        if (obj == null) return false;
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
        return any(obj, function(value) {
            return value === target;
        });
    };
    _.invoke = function(obj, method) {
        var args = slice.call(arguments, 2);
        var isFunc = _.isFunction(method);
        return _.map(obj, function(value) {
            return (isFunc ? method : value[method]).apply(value, args);
        });
    };
    _.pluck = function(obj, key) {
        return _.map(obj, function(value) {
            return value[key];
        });
    };
    _.where = function(obj, attrs, first) {
        if (_.isEmpty(attrs)) return first ? null : [];
        return _[first ? 'find' : 'filter'](obj, function(value) {
            for (var key in attrs) {
                if (attrs[key] !== value[key]) return false;
            }
            return true;
        });
    };
    _.findWhere = function(obj, attrs) {
        return _.where(obj, attrs, true);
    };
    _.max = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
            return Math.max.apply(Math, obj);
        }
        if (!iterator && _.isEmpty(obj)) return -Infinity;
        var result = {
            computed: -Infinity,
            value: -Infinity
        };
        each(obj, function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed >= result.computed && (result = {
                value: value,
                computed: computed
            });
        });
        return result.value;
    };
    _.min = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
            return Math.min.apply(Math, obj);
        }
        if (!iterator && _.isEmpty(obj)) return Infinity;
        var result = {
            computed: Infinity,
            value: Infinity
        };
        each(obj, function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed < result.computed && (result = {
                value: value,
                computed: computed
            });
        });
        return result.value;
    };
    _.shuffle = function(obj) {
        var rand;
        var index = 0;
        var shuffled = [];
        each(obj, function(value) {
            rand = _.random(index++);
            shuffled[index - 1] = shuffled[rand];
            shuffled[rand] = value;
        });
        return shuffled;
    };
    var lookupIterator = function(value) {
        return _.isFunction(value) ? value : function(obj) {
                return obj[value];
            };
    };
    _.sortBy = function(obj, value, context) {
        var iterator = lookupIterator(value);
        return _.pluck(_.map(obj, function(value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iterator.call(context, value, index, list)
            };
        }).sort(function(left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || a === void 0) return 1;
                if (a < b || b === void 0) return -1;
            }
            return left.index < right.index ? -1 : 1;
        }), 'value');
    };
    var group = function(obj, value, context, behavior) {
        var result = {};
        var iterator = lookupIterator(value || _.identity);
        each(obj, function(value, index) {
            var key = iterator.call(context, value, index, obj);
            behavior(result, key, value);
        });
        return result;
    };
    _.groupBy = function(obj, value, context) {
        return group(obj, value, context, function(result, key, value) {
            (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
        });
    };
    _.countBy = function(obj, value, context) {
        return group(obj, value, context, function(result, key) {
            if (!_.has(result, key)) result[key] = 0;
            result[key]++;
        });
    };
    _.sortedIndex = function(array, obj, iterator, context) {
        iterator = iterator == null ? _.identity : lookupIterator(iterator);
        var value = iterator.call(context, obj);
        var low = 0,
            high = array.length;
        while (low < high) {
            var mid = (low + high) >>> 1;
            iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
        }
        return low;
    };
    _.toArray = function(obj) {
        if (!obj) return [];
        if (_.isArray(obj)) return slice.call(obj);
        if (obj.length === +obj.length) return _.map(obj, _.identity);
        return _.values(obj);
    };
    _.size = function(obj) {
        if (obj == null) return 0;
        return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
    };
    _.first = _.head = _.take = function(array, n, guard) {
        if (array == null) return void 0;
        return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
    };
    _.initial = function(array, n, guard) {
        return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
    };
    _.last = function(array, n, guard) {
        if (array == null) return void 0;
        if ((n != null) && !guard) {
            return slice.call(array, Math.max(array.length - n, 0));
        } else {
            return array[array.length - 1];
        }
    };
    _.rest = _.tail = _.drop = function(array, n, guard) {
        return slice.call(array, (n == null) || guard ? 1 : n);
    };
    _.compact = function(array) {
        return _.filter(array, _.identity);
    };
    var flatten = function(input, shallow, output) {
        each(input, function(value) {
            if (_.isArray(value)) {
                shallow ? push.apply(output, value) : flatten(value, shallow, output);
            } else {
                output.push(value);
            }
        });
        return output;
    };
    _.flatten = function(array, shallow) {
        return flatten(array, shallow, []);
    };
    _.without = function(array) {
        return _.difference(array, slice.call(arguments, 1));
    };
    _.uniq = _.unique = function(array, isSorted, iterator, context) {
        if (_.isFunction(isSorted)) {
            context = iterator;
            iterator = isSorted;
            isSorted = false;
        }
        var initial = iterator ? _.map(array, iterator, context) : array;
        var results = [];
        var seen = [];
        each(initial, function(value, index) {
            if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
                seen.push(value);
                results.push(array[index]);
            }
        });
        return results;
    };
    _.union = function() {
        return _.uniq(concat.apply(ArrayProto, arguments));
    };
    _.intersection = function(array) {
        var rest = slice.call(arguments, 1);
        return _.filter(_.uniq(array), function(item) {
            return _.every(rest, function(other) {
                return _.indexOf(other, item) >= 0;
            });
        });
    };
    _.difference = function(array) {
        var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
        return _.filter(array, function(value) {
            return !_.contains(rest, value);
        });
    };
    _.zip = function() {
        var args = slice.call(arguments);
        var length = _.max(_.pluck(args, 'length'));
        var results = new Array(length);
        for (var i = 0; i < length; i++) {
            results[i] = _.pluck(args, "" + i);
        }
        return results;
    };
    _.object = function(list, values) {
        if (list == null) return {};
        var result = {};
        for (var i = 0, l = list.length; i < l; i++) {
            if (values) {
                result[list[i]] = values[i];
            } else {
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    };
    _.indexOf = function(array, item, isSorted) {
        if (array == null) return -1;
        var i = 0,
            l = array.length;
        if (isSorted) {
            if (typeof isSorted == 'number') {
                i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
            } else {
                i = _.sortedIndex(array, item);
                return array[i] === item ? i : -1;
            }
        }
        if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
        for (; i < l; i++)
            if (array[i] === item) return i;
        return -1;
    };
    _.lastIndexOf = function(array, item, from) {
        if (array == null) return -1;
        var hasIndex = from != null;
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
            return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
        }
        var i = (hasIndex ? from : array.length);
        while (i--)
            if (array[i] === item) return i;
        return -1;
    };
    _.range = function(start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;
        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(len);
        while (idx < len) {
            range[idx++] = start;
            start += step;
        }
        return range;
    };
    _.bind = function(func, context) {
        if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        var args = slice.call(arguments, 2);
        return function() {
            return func.apply(context, args.concat(slice.call(arguments)));
        };
    };
    _.partial = function(func) {
        var args = slice.call(arguments, 1);
        return function() {
            return func.apply(this, args.concat(slice.call(arguments)));
        };
    };
    _.bindAll = function(obj) {
        var funcs = slice.call(arguments, 1);
        if (funcs.length === 0) funcs = _.functions(obj);
        each(funcs, function(f) {
            obj[f] = _.bind(obj[f], obj);
        });
        return obj;
    };
    _.memoize = function(func, hasher) {
        var memo = {};
        hasher || (hasher = _.identity);
        return function() {
            var key = hasher.apply(this, arguments);
            return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
        };
    };
    _.delay = function(func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function() {
            return func.apply(null, args);
        }, wait);
    };
    _.defer = function(func) {
        return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
    };
    _.throttle = function(func, wait) {
        var context, args, timeout, result;
        var previous = 0;
        var later = function() {
            previous = new Date;
            timeout = null;
            result = func.apply(context, args);
        };
        return function() {
            var now = new Date;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
            } else if (!timeout) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };
    _.debounce = function(func, wait, immediate) {
        var timeout, result;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) result = func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) result = func.apply(context, args);
            return result;
        };
    };
    _.once = function(func) {
        var ran = false,
            memo;
        return function() {
            if (ran) return memo;
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo;
        };
    };
    _.wrap = function(func, wrapper) {
        return function() {
            var args = [func];
            push.apply(args, arguments);
            return wrapper.apply(this, args);
        };
    };
    _.compose = function() {
        var funcs = arguments;
        return function() {
            var args = arguments;
            for (var i = funcs.length - 1; i >= 0; i--) {
                args = [funcs[i].apply(this, args)];
            }
            return args[0];
        };
    };
    _.after = function(times, func) {
        if (times <= 0) return func();
        return function() {
            if (--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };
    _.keys = nativeKeys || function(obj) {
            if (obj !== Object(obj)) throw new TypeError('Invalid object');
            var keys = [];
            for (var key in obj)
                if (_.has(obj, key)) keys[keys.length] = key;
            return keys;
        };
    _.values = function(obj) {
        var values = [];
        for (var key in obj)
            if (_.has(obj, key)) values.push(obj[key]);
        return values;
    };
    _.pairs = function(obj) {
        var pairs = [];
        for (var key in obj)
            if (_.has(obj, key)) pairs.push([key, obj[key]]);
        return pairs;
    };
    _.invert = function(obj) {
        var result = {};
        for (var key in obj)
            if (_.has(obj, key)) result[obj[key]] = key;
        return result;
    };
    _.functions = _.methods = function(obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
    };
    _.extend = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };
    _.pick = function(obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        each(keys, function(key) {
            if (key in obj) copy[key] = obj[key];
        });
        return copy;
    };
    _.omit = function(obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        for (var key in obj) {
            if (!_.contains(keys, key)) copy[key] = obj[key];
        }
        return copy;
    };
    _.defaults = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            if (source) {
                for (var prop in source) {
                    if (obj[prop] == null) obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };
    _.clone = function(obj) {
        if (!_.isObject(obj)) return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };
    _.tap = function(obj, interceptor) {
        interceptor(obj);
        return obj;
    };
    var eq = function(a, b, aStack, bStack) {
        if (a === b) return a !== 0 || 1 / a == 1 / b;
        if (a == null || b == null) return a === b;
        if (a instanceof _) a = a._wrapped;
        if (b instanceof _) b = b._wrapped;
        var className = toString.call(a);
        if (className != toString.call(b)) return false;
        switch (className) {
            case '[object String]':
                return a == String(b);
            case '[object Number]':
                return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
            case '[object Date]':
            case '[object Boolean]':
                return +a == +b;
            case '[object RegExp]':
                return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
        }
        if (typeof a != 'object' || typeof b != 'object') return false;
        var length = aStack.length;
        while (length--) {
            if (aStack[length] == a) return bStack[length] == b;
        }
        aStack.push(a);
        bStack.push(b);
        var size = 0,
            result = true;
        if (className == '[object Array]') {
            size = a.length;
            result = size == b.length;
            if (result) {
                while (size--) {
                    if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                }
            }
        } else {
            var aCtor = a.constructor,
                bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) && _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
                return false;
            }
            for (var key in a) {
                if (_.has(a, key)) {
                    size++;
                    if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                }
            }
            if (result) {
                for (key in b) {
                    if (_.has(b, key) && !(size--)) break;
                }
                result = !size;
            }
        }
        aStack.pop();
        bStack.pop();
        return result;
    };
    _.isEqual = function(a, b) {
        return eq(a, b, [], []);
    };
    _.isEmpty = function(obj) {
        if (obj == null) return true;
        if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
        for (var key in obj)
            if (_.has(obj, key)) return false;
        return true;
    };
    _.isElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };
    _.isArray = nativeIsArray || function(obj) {
            return toString.call(obj) == '[object Array]';
        };
    _.isObject = function(obj) {
        return obj === Object(obj);
    };
    each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
        _['is' + name] = function(obj) {
            return toString.call(obj) == '[object ' + name + ']';
        };
    });
    if (!_.isArguments(arguments)) {
        _.isArguments = function(obj) {
            return !!(obj && _.has(obj, 'callee'));
        };
    }
    if (typeof(/./) !== 'function') {
        _.isFunction = function(obj) {
            return typeof obj === 'function';
        };
    }
    _.isFinite = function(obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj));
    };
    _.isNaN = function(obj) {
        return _.isNumber(obj) && obj != +obj;
    };
    _.isBoolean = function(obj) {
        return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
    };
    _.isNull = function(obj) {
        return obj === null;
    };
    _.isUndefined = function(obj) {
        return obj === void 0;
    };
    _.has = function(obj, key) {
        return hasOwnProperty.call(obj, key);
    };
    _.noConflict = function() {
        root._ = previousUnderscore;
        return this;
    };
    _.identity = function(value) {
        return value;
    };
    _.times = function(n, iterator, context) {
        var accum = Array(n);
        for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
        return accum;
    };
    _.random = function(min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };
    var entityMap = {
        escape: {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        }
    };
    entityMap.unescape = _.invert(entityMap.escape);
    var entityRegexes = {
        escape: new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
        unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
    };
    _.each(['escape', 'unescape'], function(method) {
        _[method] = function(string) {
            if (string == null) return '';
            return ('' + string).replace(entityRegexes[method], function(match) {
                return entityMap[method][match];
            });
        };
    });
    _.result = function(object, property) {
        if (object == null) return null;
        var value = object[property];
        return _.isFunction(value) ? value.call(object) : value;
    };
    _.mixin = function(obj) {
        each(_.functions(obj), function(name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function() {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return result.call(this, func.apply(_, args));
            };
        });
    };
    var idCounter = 0;
    _.uniqueId = function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };
    var noMatch = /(.)^/;
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\t': 't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    _.template = function(text, data, settings) {
        var render;
        settings = _.defaults({}, settings, _.templateSettings);
        var matcher = new RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, function(match) {
                return '\\' + escapes[match];
            });
            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            index = offset + match.length;
            return match;
        });
        source += "';\n";
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
        source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + "return __p;\n";
        try {
            render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }
        if (data) return render(data, _);
        var template = function(data) {
            return render.call(this, data, _);
        };
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';
        return template;
    };
    _.chain = function(obj) {
        return _(obj).chain();
    };
    var result = function(obj) {
        return this._chain ? _(obj).chain() : obj;
    };
    _.mixin(_);
    each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
            return result.call(this, obj);
        };
    });
    each(['concat', 'join', 'slice'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            return result.call(this, method.apply(this._wrapped, arguments));
        };
    });
    _.extend(_.prototype, {
        chain: function() {
            this._chain = true;
            return this;
        },
        value: function() {
            return this._wrapped;
        }
    });
}).call(this);
(function() {
    var initializing = false,
        fnTest = /xyz/.test(function() {
            xyz;
        }) ? /\b_super\b/ : /.*/;
    this.Base = function() {};
    Base.extend = function(prop) {
        var _super = this.prototype;
        initializing = true;
        var prototype = new this();
        initializing = false;
        for (var name in prop) {
            prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? (function(name, fn) {
                    return function() {
                        var tmp = this._super;
                        this._super = _super[name];
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, prop[name]) : prop[name];
        }

        function Base() {
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }
        Base.prototype = prototype;
        Base.constructor = Base;
        Base.extend = arguments.callee;
        return Base;
    };
})();
(function() {
    var IE = document.all,
        URL = 'http://www.adobe.com/go/getflashplayer',
        JQUERY = typeof jQuery == 'function',
        RE = /(\d+)[^\d]+(\d+)[^\d]*(\d*)/,
        GLOBAL_OPTS = {
            width: '100%',
            height: '100%',
            id: "_" + ("" + Math.random()).slice(9),
            allowfullscreen: true,
            allowscriptaccess: 'always',
            quality: 'high',
            version: [3, 0],
            onFail: null,
            expressInstall: null,
            w3c: false,
            cachebusting: false
        };
    if (window.attachEvent) {
        window.attachEvent("onbeforeunload", function() {
            __flash_unloadHandler = function() {};
            __flash_savedUnloadHandler = function() {};
        });
    }

    function extend(to, from) {
        if (from) {
            for (var key in from) {
                if (from.hasOwnProperty(key)) {
                    to[key] = from[key];
                }
            }
        }
        return to;
    }

    function map(arr, func) {
        var newArr = [];
        for (var i in arr) {
            if (arr.hasOwnProperty(i)) {
                newArr[i] = func(arr[i]);
            }
        }
        return newArr;
    }
    window.flashembed = function(root, opts, conf) {
        if (typeof root == 'string') {
            root = document.getElementById(root.replace("#", ""));
        }
        if (!root) {
            return;
        }
        if (typeof opts == 'string') {
            opts = {
                src: opts
            };
        }
        return new Flash(root, extend(extend({}, GLOBAL_OPTS), opts), conf);
    };
    var f = extend(window.flashembed, {
        conf: GLOBAL_OPTS,
        getVersion: function() {
            var ver;
            try {
                ver = navigator.plugins["Shockwave Flash"].description.slice(16);
            } catch (e) {
                try {
                    var fo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
                    ver = fo && fo.GetVariable("$version");
                } catch (err) {}
            }
            ver = RE.exec(ver);
            return ver ? [ver[1], ver[3]] : [0, 0];
        },
        asString: function(obj) {
            if (obj === null || obj === undefined) {
                return null;
            }
            var type = typeof obj;
            if (type == 'object' && obj.push) {
                type = 'array';
            }
            switch (type) {
                case 'string':
                    obj = obj.replace(new RegExp('(["\\\\])', 'g'), '\\$1');
                    obj = obj.replace(/^\s?(\d+\.?\d+)%/, "$1pct");
                    return '"' + obj + '"';
                case 'array':
                    return '[' + map(obj, function(el) {
                            return f.asString(el);
                        }).join(',') + ']';
                case 'function':
                    return '"function()"';
                case 'object':
                    var str = [];
                    for (var prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            str.push('"' + prop + '":' + f.asString(obj[prop]));
                        }
                    }
                    return '{' + str.join(',') + '}';
            }
            return String(obj).replace(/\s/g, " ").replace(/\'/g, "\"");
        },
        getHTML: function(opts, conf) {
            opts = extend({}, opts);
            var html = '<object width="' + opts.width + '" height="' + opts.height + '" id="' + opts.id + '" name="' + opts.id + '"';
            if (opts.cachebusting) {
                opts.src += ((opts.src.indexOf("?") != -1 ? "&" : "?") + Math.random());
            }
            if (opts.w3c || !IE) {
                html += ' data="' + opts.src + '" type="application/x-shockwave-flash"';
            } else {
                html += ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';
            }
            html += '>';
            if (opts.w3c || IE) {
                html += '<param name="movie" value="' + opts.src + '" />';
            }
            opts.width = opts.height = opts.id = opts.w3c = opts.src = null;
            opts.onFail = opts.version = opts.expressInstall = null;
            for (var key in opts) {
                if (opts[key]) {
                    html += '<param name="' + key + '" value="' + opts[key] + '" />';
                }
            }
            var vars = "";
            if (conf) {
                for (var k in conf) {
                    if (conf[k]) {
                        var val = conf[k];
                        vars += k + '=' + (/function|object/.test(typeof val) ? f.asString(val) : val) + '&';
                    }
                }
                vars = vars.slice(0, -1);
                html += '<param name="flashvars" value=\'' + vars + '\' />';
            }
            html += "</object>";
            return html;
        },
        isSupported: function(ver) {
            return VERSION[0] > ver[0] || VERSION[0] == ver[0] && VERSION[1] >= ver[1];
        }
    });
    var VERSION = f.getVersion();

    function Flash(root, opts, conf) {
        if (f.isSupported(opts.version)) {
            root.innerHTML = f.getHTML(opts, conf);
        } else if (opts.expressInstall && f.isSupported([6, 65])) {
            root.innerHTML = f.getHTML(extend(opts, {
                src: opts.expressInstall
            }), {
                MMredirectURL: location.href,
                MMplayerType: 'PlugIn',
                MMdoctitle: document.title
            });
        } else {
            if (!root.innerHTML.replace(/\s/g, '')) {
                root.innerHTML = "<h2>Flash version " + opts.version + " or greater is required</h2>" + "<h3>" +
                    (VERSION[0] > 0 ? "Your version is " + VERSION : "You have no flash plugin installed") + "</h3>" +
                    (root.tagName == 'A' ? "<p>Click here to download latest version</p>" : "<p>Download latest version from <a href='" + URL + "'>here</a></p>" + opts);
                if (root.tagName == 'A') {
                    root.onclick = function() {
                        location.href = URL;
                    };
                }
            }
            if (opts.onFail) {
                var ret = opts.onFail.call(this);
                if (typeof ret == 'string') {
                    root.innerHTML = ret;
                }
            }
        }
        if (IE) {
            window[opts.id] = document.getElementById(opts.id);
        }
        extend(this, {
            getRoot: function() {
                return root;
            },
            getOptions: function() {
                return opts;
            },
            getConf: function() {
                return conf;
            },
            getApi: function() {
                return root.firstChild;
            }
        });
    }
    if (JQUERY) {
        jQuery.tools = jQuery.tools || {
                version: '1.2.3'
            };
        jQuery.tools.flashembed = {
            conf: GLOBAL_OPTS
        };
        jQuery.fn.flashembed = function(opts, conf) {
            return this.each(function() {
                $(this).data("flashembed", flashembed(this, opts, conf));
            });
        };
    }
})();
(function() {
    var startTag = /^<(\w+)((?:\s+[\w\-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
        endTag = /^<\/(\w+)[^>]*>/,
        attr = /([\w\-]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
    var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");
    var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");
    var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");
    var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");
    var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");
    var special = makeMap("script,style");
    var HTMLParser = this.HTMLParser = function(html, handler) {
        var index, chars, match, stack = [],
            last = html,
            allowed = _.extend({}, empty, block, inline, closeSelf, fillAttrs);
        if (handler.allowed) allowed = makeMap(handler.allowed);
        stack.last = function() {
            return this[this.length - 1];
        };
        while (html) {
            chars = true;
            if (!stack.last() || !special[stack.last()]) {
                if (html.indexOf("<!--") == 0) {
                    index = html.indexOf("-->");
                    if (index >= 0) {
                        if (handler.comment)
                            handler.comment(html.substring(4, index));
                        html = html.substring(index + 3);
                        chars = false;
                    }
                } else if (html.indexOf("</") == 0) {
                    match = html.match(endTag);
                    if (match) {
                        html = html.substring(match[0].length);
                        match[0].replace(endTag, parseEndTag);
                        chars = false;
                    }
                } else if (html.indexOf("<") == 0) {
                    match = html.match(startTag);
                    if (match) {
                        html = html.substring(match[0].length);
                        match[0].replace(startTag, parseStartTag);
                        chars = false;
                    }
                }
                if (chars) {
                    index = html.indexOf("<");
                    var text = index < 0 ? html : html.substring(0, index);
                    html = index < 0 ? "" : html.substring(index);
                    if (handler.chars && allowed[stack.last()])
                        handler.chars(text);
                }
            } else {
                html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text) {
                    text = text.replace(/<!--(.*?)-->/g, "$1").replace(/<!\[CDATA\[(.*?)]]>/g, "$1");
                    if (handler.chars && allowed[stack.last()])
                        handler.chars(text);
                    return "";
                });
                parseEndTag("", stack.last());
            }
            if (html === last)
                throw "Parse Error: " + html;
            last = html;
        }
        parseEndTag();

        function parseStartTag(tag, tagName, rest, unary) {
            if (block[tagName]) {
                while (stack.last() && inline[stack.last()]) {
                    parseEndTag("", stack.last());
                }
            }
            if (closeSelf[tagName] && stack.last() == tagName) {
                parseEndTag("", tagName);
            }
            unary = empty[tagName] || !!unary;
            if (!unary)
                stack.push(tagName);
            if (handler.start) {
                var attrs = [];
                rest.replace(attr, function(match, name) {
                    var value = arguments[2] ? arguments[2] : arguments[3] ? arguments[3] : arguments[4] ? arguments[4] : fillAttrs[name] ? name : "";
                    attrs.push({
                        name: name,
                        value: value,
                        escaped: value.replace(/(^|[^\\])"/g, '$1\\\"')
                    });
                });
                if (handler.start && allowed[tagName])
                    handler.start(tagName, attrs, unary);
            }
        }

        function parseEndTag(tag, tagName) {
            if (!tagName)
                var pos = 0;
            else
                for (var pos = stack.length - 1; pos >= 0; pos--)
                    if (stack[pos] == tagName)
                        break; if (pos >= 0) {
                for (var i = stack.length - 1; i >= pos; i--)
                    if (handler.end && allowed[stack[i]])
                        handler.end(stack[i]);
                stack.length = pos;
            }
        }
    };
    this.HTMLtoXML = function(html) {
        var results = "";
        HTMLParser(html, {
            start: function(tag, attrs, unary) {
                results += "<" + tag;
                for (var i = 0; i < attrs.length; i++)
                    results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';
                results += (unary ? "/" : "") + ">";
            },
            end: function(tag) {
                results += "</" + tag + ">";
            },
            chars: function(text) {
                results += text;
            },
            comment: function(text) {
                results += "<!--" + text + "-->";
            }
        });
        return results;
    };
    this.HTMLtoDOM = function(html, doc) {
        var one = makeMap("html,head,body,title");
        var structure = {
            link: "head",
            base: "head"
        };
        if (!doc) {
            if (typeof DOMDocument != "undefined")
                doc = new DOMDocument();
            else if (typeof document != "undefined" && document.implementation && document.implementation.createDocument)
                doc = document.implementation.createDocument("", "", null);
            else if (typeof ActiveX != "undefined")
                doc = new ActiveXObject("Msxml.DOMDocument");
        } else
            doc = doc.ownerDocument || doc.getOwnerDocument && doc.getOwnerDocument() || doc;
        var elems = [],
            documentElement = doc.documentElement || doc.getDocumentElement && doc.getDocumentElement();
        if (!documentElement && doc.createElement)(function() {
            var html = doc.createElement("html");
            var head = doc.createElement("head");
            head.appendChild(doc.createElement("title"));
            html.appendChild(head);
            html.appendChild(doc.createElement("body"));
            doc.appendChild(html);
        })();
        if (doc.getElementsByTagName)
            for (var i in one)
                one[i] = doc.getElementsByTagName(i)[0];
        var curParentNode = one.body;
        HTMLParser(html, {
            start: function(tagName, attrs, unary) {
                if (one[tagName]) {
                    curParentNode = one[tagName];
                    return;
                }
                var elem = doc.createElement(tagName);
                for (var attr in attrs)
                    elem.setAttribute(attrs[attr].name, attrs[attr].value);
                if (structure[tagName] && typeof one[structure[tagName]] != "boolean")
                    one[structure[tagName]].appendChild(elem);
                else if (curParentNode && curParentNode.appendChild)
                    curParentNode.appendChild(elem);
                if (!unary) {
                    elems.push(elem);
                    curParentNode = elem;
                }
            },
            end: function(tag) {
                elems.length -= 1;
                curParentNode = elems[elems.length - 1];
            },
            chars: function(text) {
                curParentNode.appendChild(doc.createTextNode(text));
            },
            comment: function(text) {}
        });
        return doc;
    };

    function makeMap(str) {
        var obj = {},
            items = str.split(",");
        for (var i = 0; i < items.length; i++) {
            obj[items[i]] = true;
            obj[items[i].toUpperCase()] = true;
        }
        return obj;
    }
})();
(function($) {
    $.fn.iframeTracker = function(handler) {
        $.iframeTracker.handlersList.push(handler);
        $(this).bind('mouseover', {
            handler: handler
        }, function(e) {
            e.data.handler.over = true;
            try {
                e.data.handler.overCallback(this);
            } catch (ex) {}
        }).bind('mouseout', {
            handler: handler
        }, function(e) {
            e.data.handler.over = false;
            $.iframeTracker.focusRetriever.focus();
            try {
                e.data.handler.outCallback(this);
            } catch (ex) {}
        });
    };
    $.iframeTracker = {
        focusRetriever: null,
        focusRetrieved: false,
        handlersList: [],
        isIE8AndOlder: false,
        init: function() {
            try {
                if ($.browser.msie == true && $.browser.version < 9) {
                    this.isIE8AndOlder = true;
                }
            } catch (ex) {
                try {
                    var matches = navigator.userAgent.match(/(msie) ([\w.]+)/i);
                    if (matches[2] < 9) {
                        this.isIE8AndOlder = true;
                    }
                } catch (ex2) {}
            }
            $(window).focus();
            $(window).blur(function(e) {
                $.iframeTracker.windowLoseFocus(e);
            });
            $('body').append('<div style="position:fixed; top:0; left:0; overflow:hidden;"><input style="position:absolute; left:-300px;" type="text" value="" id="focus_retriever" /></div>');
            this.focusRetriever = $('#focus_retriever');
            this.focusRetrieved = false;
            $(document).mousemove(function(e) {
                if (document.activeElement && document.activeElement.tagName == 'IFRAME') {
                    $.iframeTracker.focusRetriever.focus();
                    $.iframeTracker.focusRetrieved = true;
                }
            });
            if (this.isIE8AndOlder) {
                this.focusRetriever.blur(function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $.iframeTracker.windowLoseFocus(e);
                });
            }
            if (this.isIE8AndOlder) {
                $('body').click(function(e) {
                    $(window).focus();
                });
                $('form').click(function(e) {
                    e.stopPropagation();
                });
            }
        },
        windowLoseFocus: function(event) {
            for (var i in this.handlersList) {
                if (this.handlersList[i].over == true) {
                    try {
                        this.handlersList[i].blurCallback();
                    } catch (ex) {}
                }
            }
        }
    };
    $(document).ready(function() {
        $.iframeTracker.init();
    });
})(jQuery);
if (!this.JSON) {
    this.JSON = {};
}
(function() {
    function f(n) {
        return n < 10 ? '0' + n : n;
    }
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function(key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z' : null;
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
            return this.valueOf();
        };
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent, meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
                var c = meta[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
    }

    function str(key, holder) {
        var i, k, v, length, mind = gap,
            partial, value = holder[key];
        if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    v = partial.length === 0 ? '[]' : gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                            mind + ']' : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
                v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }
    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function(value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {
                '': value
            });
        };
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function(text, reviver) {
            var j;

            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function(a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function' ? walk({
                        '': j
                    }, '') : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
}());
var itemWrapOuter = null;
(function($) {
    $.tools = $.tools || {
            version: '1.2.2'
        };
    $.tools.scrollable = {
        conf: {
            activeClass: 'active',
            circular: false,
            clonedClass: 'cloned',
            disabledClass: 'disabled',
            easing: 'swing',
            initialIndex: 0,
            item: null,
            items: '.items',
            keyboard: true,
            mousewheel: false,
            next: '.next',
            prev: '.prev',
            speed: 400,
            vertical: false,
            wheelSpeed: 0
        }
    };

    function dim(el, key) {
        var v = parseInt(el.css(key), 10);
        if (v) {
            return v;
        }
        var s = el[0].currentStyle;
        return s && s.width && parseInt(s.width, 10);
    }

    function find(root, query) {
        var el = $(query);
        return el.length < 2 ? el : root.parent().find(query);
    }
    var current;

    function Scrollable(root, conf) {
        var self = this,
            fire = root.add(self),
            itemWrap = root.children(),
            index = 0,
            vertical = conf.vertical;
        itemWrapOuter = itemWrap;
        if (!current) {
            current = self;
        }
        if (itemWrap.length > 1) {
            itemWrap = $(conf.items, root);
        }
        $.extend(self, {
            getConf: function() {
                return conf;
            },
            getIndex: function() {
                return index;
            },
            getSize: function() {
                return self.getItems().size();
            },
            getNaviButtons: function() {
                return prev.add(next);
            },
            getRoot: function() {
                return root;
            },
            getItemWrap: function() {
                return itemWrap;
            },
            getItems: function() {
                return itemWrap.children(conf.item).not("." + conf.clonedClass);
            },
            move: function(offset, time) {
                return self.seekTo(index + offset, time);
            },
            next: function(time) {
                return self.move(1, time);
            },
            prev: function(time) {
                return self.move(-1, time);
            },
            begin: function(time) {
                return self.seekTo(0, time);
            },
            end: function(time) {
                return self.seekTo(self.getSize() - 1, time);
            },
            focus: function() {
                current = self;
                return self;
            },
            addItem: function(item) {
                item = $(item);
                if (!conf.circular) {
                    itemWrap.append(item);
                } else {
                    $(".cloned:last").before(item);
                    $(".cloned:first").replaceWith(item.clone().addClass(conf.clonedClass));
                }
                fire.trigger("onAddItem", [item]);
                return self;
            },
            seekTo: function(i, time, fn) {
                if (conf.circular && i === 0 && index == -1 && time !== 0) {
                    return self;
                }
                if (!conf.circular && i < 0 || i > self.getSize() || i < -1) {
                    return self;
                }
                var item = i;
                if (i.jquery) {
                    i = self.getItems().index(i);
                } else {
                    item = self.getItems().eq(i);
                }
                var e = $.Event("onBeforeSeek");
                if (!fn) {
                    fire.trigger(e, [i, time]);
                    if (e.isDefaultPrevented() || !item.length) {
                        return self;
                    }
                }
                var props = vertical ? {
                        top: -item.position().top
                    } : {
                        left: -item.position().left
                    };
                index = i;
                current = self;
                if (time === undefined) {
                    time = conf.speed;
                }
                itemWrap.animate(props, time, conf.easing, fn || function() {
                        fire.trigger("onSeek", [i]);
                    });
                return self;
            }
        });
        $.each(['onBeforeSeek', 'onSeek', 'onAddItem'], function(i, name) {
            if ($.isFunction(conf[name])) {
                $(self).bind(name, conf[name]);
            }
            self[name] = function(fn) {
                $(self).bind(name, fn);
                return self;
            };
        });
        if (conf.circular) {
            var cloned1 = self.getItems().slice(-1).clone().prependTo(itemWrap),
                cloned2 = self.getItems().eq(1).clone().appendTo(itemWrap);
            cloned1.add(cloned2).addClass(conf.clonedClass);
            self.onBeforeSeek(function(e, i, time) {
                if (e.isDefaultPrevented()) {
                    return;
                }
                if (i == -1) {
                    self.seekTo(cloned1, time, function() {
                        self.end(0);
                    });
                    return e.preventDefault();
                } else if (i == self.getSize()) {
                    self.seekTo(cloned2, time, function() {
                        self.begin(0);
                    });
                }
            });
            self.seekTo(0, 0);
        }
        var prev = find(root, conf.prev).click(function() {
                self.prev();
            }),
            next = find(root, conf.next).click(function() {
                self.next();
            });
        if (!conf.circular && self.getSize() > 1) {
            self.onBeforeSeek(function(e, i) {
                prev.toggleClass(conf.disabledClass, i <= 0);
                next.toggleClass(conf.disabledClass, i >= self.getSize() - 1);
            });
        }
        if (conf.mousewheel && $.fn.mousewheel) {
            root.mousewheel(function(e, delta) {
                if (conf.mousewheel) {
                    self.move(delta < 0 ? 1 : -1, conf.wheelSpeed || 50);
                    return false;
                }
            });
        }
        if (conf.keyboard) {
            $(document).bind("keydown.scrollable", function(evt) {
                if (!conf.keyboard || evt.altKey || evt.ctrlKey || $(evt.target).is(":input")) {
                    return;
                }
                if (conf.keyboard != 'static' && current != self) {
                    return;
                }
                var key = evt.keyCode;
                if (vertical && (key == 38 || key == 40)) {
                    self.move(key == 38 ? -1 : 1);
                    return evt.preventDefault();
                }
                if (!vertical && (key == 37 || key == 39)) {
                    self.move(key == 37 ? -1 : 1);
                    return evt.preventDefault();
                }
            });
        }
        $(self).trigger("onBeforeSeek", [conf.initialIndex]);
    }
    $.fn.scrollable = function(conf) {
        var el = this.data("scrollable");
        if (el) {
            return el;
        }
        conf = $.extend({}, $.tools.scrollable.conf, conf);
        this.each(function() {
            el = new Scrollable($(this), conf);
            $(this).data("scrollable", el);
        });
        return conf.api ? el : this;
    };
})(jQuery);
(function() {
    var slice = [].slice;
    (function() {
        var args = slice.call(arguments);
        for (var i = 0; i < args.length; i++)
            document.createElement(args[i]);
    })("article", "aside", "figure", "footer", "header", "hgroup", "nav", "section");
})();
(function($) {
    $.tools = $.tools || {
            version: '1.2.2'
        };
    $.tools.tabs = {
        conf: {
            tabs: 'a',
            current: 'current',
            onBeforeClick: null,
            onClick: null,
            effect: 'default',
            initialIndex: 0,
            event: 'click',
            rotate: false,
            history: false
        },
        addEffect: function(name, fn) {
            effects[name] = fn;
        }
    };
    var effects = {
        'default': function(i, done) {
            this.getPanes().hide().eq(i).show();
            done.call();
        },
        fade: function(i, done) {
            var conf = this.getConf(),
                speed = conf.fadeOutSpeed,
                panes = this.getPanes();
            if (speed) {
                panes.fadeOut(speed);
            } else {
                panes.hide();
            }
            panes.eq(i).fadeIn(conf.fadeInSpeed, done);
        },
        slide: function(i, done) {
            this.getPanes().slideUp(200);
            this.getPanes().eq(i).slideDown(400, done);
        },
        ajax: function(i, done) {
            this.getPanes().eq(0).load(this.getTabs().eq(i).attr("href"), done);
        }
    };
    var w;
    $.tools.tabs.addEffect("horizontal", function(i, done) {
        if (!w) {
            w = this.getPanes().eq(0).width();
        }
        this.getCurrentPane().animate({
            width: 0
        }, function() {
            $(this).hide();
        });
        this.getPanes().eq(i).animate({
            width: w
        }, function() {
            $(this).show();
            done.call();
        });
    });

    function Tabs(root, paneSelector, conf) {
        var self = this,
            trigger = root.add(this),
            tabs = root.find(conf.tabs),
            panes = paneSelector.jquery ? paneSelector : root.children(paneSelector),
            current;
        if (!tabs.length) {
            tabs = root.children();
        }
        if (!panes.length) {
            panes = root.parent().find(paneSelector);
        }
        if (!panes.length) {
            panes = $(paneSelector);
        }
        $.extend(this, {
            click: function(i, e) {
                var tab = tabs.eq(i);
                if (typeof i == 'string' && i.replace("#", "")) {
                    tab = tabs.filter("[href*=" + i.replace("#", "") + "]");
                    i = Math.max(tabs.index(tab), 0);
                }
                if (conf.rotate) {
                    var last = tabs.length - 1;
                    if (i < 0) {
                        return self.click(last, e);
                    }
                    if (i > last) {
                        return self.click(0, e);
                    }
                }
                if (!tab.length) {
                    if (current >= 0) {
                        return self;
                    }
                    i = conf.initialIndex;
                    tab = tabs.eq(i);
                }
                if (i === current) {
                    return self;
                }
                e = e || $.Event();
                e.type = "onBeforeClick";
                trigger.trigger(e, [i]);
                if (e.isDefaultPrevented()) {
                    return;
                }
                effects[conf.effect].call(self, i, function() {
                    e.type = "onClick";
                    trigger.trigger(e, [i]);
                });
                current = i;
                tabs.removeClass(conf.current);
                tab.addClass(conf.current);
                return self;
            },
            getConf: function() {
                return conf;
            },
            getTabs: function() {
                return tabs;
            },
            getPanes: function() {
                return panes;
            },
            getCurrentPane: function() {
                return panes.eq(current);
            },
            getCurrentTab: function() {
                return tabs.eq(current);
            },
            getIndex: function() {
                return current;
            },
            next: function() {
                return self.click(current + 1);
            },
            prev: function() {
                return self.click(current - 1);
            }
        });
        $.each("onBeforeClick,onClick".split(","), function(i, name) {
            if ($.isFunction(conf[name])) {
                $(self).bind(name, conf[name]);
            }
            self[name] = function(fn) {
                $(self).bind(name, fn);
                return self;
            };
        });
        if (conf.history && $.fn.history) {
            $.tools.history.init(tabs);
            conf.event = 'history';
        }
        tabs.each(function(i) {
            $(this).bind(conf.event, function(e) {
                self.click(i, e);
                return e.preventDefault();
            });
        });
        panes.find("a[href^=#]").click(function(e) {
            self.click($(this).attr("href"), e);
        });
        if (location.hash) {
            self.click(location.hash);
        } else {
            if (conf.initialIndex === 0 || conf.initialIndex > 0) {
                self.click(conf.initialIndex);
            }
        }
    }
    $.fn.tabs = function(paneSelector, conf) {
        var el = this.data("tabs");
        if (el) {
            return el;
        }
        if ($.isFunction(conf)) {
            conf = {
                onBeforeClick: conf
            };
        }
        conf = $.extend({}, $.tools.tabs.conf, conf);
        this.each(function() {
            el = new Tabs($(this), paneSelector, conf);
            $(this).data("tabs", el);
        });
        return conf.api ? el : this;
    };
})(jQuery);
(function() {
    var propublica = window.propublica = {};
    propublica.models = {};
    propublica.views = {};
    propublica.app = {};
    propublica.utils = {
        begat: function(tag, attributes, content) {
            var str = "<" + tag + ">";
            if (content) str + content;
            str += "</" + tag + ">";
            var el = $(str);
            if (attributes) el.attr(attributes);
            return el;
        },
        conditionalLock: function(obj, key, cb) {
            if (!obj[key]) {
                setTimeout(function() {
                    propublica.utils.conditionalLock(obj, key, cb);
                }, 0);
            } else {
                cb();
            }
        }
    };
    _.uniqueId();
})();
(function() {
    var slice = [].slice;
    (function() {
        var args = slice.call(arguments);
        for (var i = 0; i < args.length; i++)
            document.createElement(args[i]);
    })("article", "aside", "figcaption", "figure", "footer", "header", "hgroup", "main", "nav", "section", "noapp");
})();
propublica.Model = Base.extend({
    MODEL_CHANGED: "changed",
    init: function(attrs) {
        this._attrs = this._attrs || {};
        _.extend(this._attrs, attrs);
        if ('id' in this._attrs) this.id = attrs.id;
        this.cid = _.uniqueId(this.name || this.id || "");
    },
    read: function(key) {
        return this._attrs[key];
    },
    write: function(key, attr) {
        attrs = {};
        !_.isUndefined(attr) ? attrs[key] = attr : attrs = _.extend(attrs, key);
        for (var k in attrs) {
            var value = attrs[k];
            var old = this._attrs[k];
            if ('id' in attrs) this.id = attrs.id;
            if (!_.isEqual(old, value)) {
                this._attrs[k] = value;
                this._onchange(k, old, value);
            }
        }
        return this;
    },
    remove: function(key) {
        var oldAttr = this._attrs[key];
        delete this._attrs[key];
        this._onchange(key, oldAttr, undefined);
        return oldAttr;
    },
    _onchange: function(key, old, value) {
        this.fire(this.MODEL_CHANGED, this, key, old, value);
        this.fire(this.keyPath(key), this, key, old, value);
    },
    keyPath: function(key) {
        return [key, this.MODEL_CHANGED].join("_");
    },
    bind: function(e, cb) {
        var callbacks = (this._callbacks = this._callbacks || {});
        var list = (callbacks[e] = callbacks[e] || []);
        list.push(cb);
    },
    unbind: function(e, cb) {
        if (!(this._callbacks && this._callbacks[e])) return;
        var list = this._callbacks[e];
        for (var i = 0; i < list.length; i++) {
            if (list[i] === cb) {
                list.splice(i, 1);
                break;
            }
        }
    },
    unbindAll: function() {
        delete this._callbacks;
    },
    fire: function(e) {
        if (!this._callbacks) return;
        var list = this._callbacks[e];
        if (!list) return;
        for (var i = 0; i < list.length; i++) list[i].apply(this, arguments);
    }
});
propublica.View = Base.extend({
    el: null,
    bindings: {},
    tag: 'div',
    cssClass: '',
    toggleClass: 'active',
    id: '',
    scope: '',
    init: function() {
        if (this.query().string.length === 0) return;
        this._ensureElement();
    },
    _ensureElement: function() {
        this.el = $(this.query().string);
        this.cid = _.uniqueId();
        this.setBindings();
        this.el.bind("_render", _.bind(this._render, this));
    },
    $: function(query) {
        return $(query, this.el);
    },
    _render: function() {
        this.render();
        return true;
    },
    render: function() {
        return this;
    },
    query: function() {
        var self = this;
        var string = _.reduce([
            ['', 'scope'],
            [' ', 'tag'],
            ['#', 'id'],
            ['.', 'cssClass']
        ], function(memo, attr) {
            return memo + (self[attr[1]].length > 0 ? attr[0] + self[attr[1]] : '');
        }, '');
        string = string.replace(/^\s*/, '');
        return {
            string: string,
            scope: this.scope,
            tag: this.tag,
            id: this.id,
            cssClass: this.cssClass
        };
    },
    munge: function(collection) {
        var c = $('<div></div>');
        _.each(collection, function(child) {
            c.append(child);
        });
        this.el.html(c.children());
    },
    toggle: function(e) {
        e.preventDefault();
        e.stopPropagation();
        var el = $(e.currentTarget);
        el.toggleClass(this.toggleClass);
        return el.hasClass(this.toggleClass) ? this.toggleClass : false;
    },
    track: function() {
        window.dataLayer = (window.dataLayer || []);
        var args = _.toArray(arguments).slice(0);
        window.dataLayer.push({
            'eventInfo': args,
            'event': 'trackEvent'
        });
    },
    setBindings: function() {
        var self = this;
        $(document).off(".delegate-" + this.cid, self.query().string);
        _.each(this.bindings, function(fn, key) {
            $(document).on(key + ".delegate-" + self.cid, self.query().string, _.bind(self[fn], self));
        });
    },
    bindTo: function(keyPath, object, targetKey) {
        keyPath = object.keyPath(keyPath);
        var cb = targetKey ? this[targetKey] : this[keyPath];
        object.bind(keyPath, _.bind(cb, this));
    }
});
propublica.models.AsyncFunctionQueue = propublica.Model.extend({
    stopped: false,
    init: function(attrs) {
        this.queue = [];
        this._super(attrs);
    },
    add: function(fn) {
        this.queue.push(fn);
        this._run();
    },
    start: function() {
        this.stopped = false;
        _.delay(_.bind(this._run, this), 50);
    },
    stop: function() {
        this.stopped = true;
    },
    _run: function() {
        if (!this.stopped && this.queue.length) {
            this.queue.shift()();
            if (!this.stopped) this._run();
        }
    }
});
propublica.models.Cookie = propublica.Model.extend({
    name: 'lastVisit',
    _expires: (365 * 24 * 60 * 60 * 1000),
    init: function(attributes) {
        this._super(attributes);
        this.read();
    },
    save: function() {
        var value = this._attrs.value;
        try {
            value = JSON.stringify(this._attrs.value);
        } catch (e) {}
        var date = new Date();
        date.setTime(date.getTime() + this._expires);
        var expires = "; expires=" + date.toUTCString();
        document.cookie = this.name + "=" + value + expires + "; path=/";
        return true;
    },
    read: function() {
        if (this._attrs.value) return this._attrs.value;
        var name = this.name + "=",
            cookieArray = document.cookie.split(";"),
            len = cookieArray.length;
        for (var i = 0; i < len; i++) {
            var c = cookieArray[i];
            c = c.replace(/^\s+/, "");
            if (c.indexOf(name) === 0) {
                var value = c.substring(name.length, c.length);
                try {
                    value = JSON.parse(value);
                } catch (e) {}
                return this._attrs.value = value;
            }
        }
        return this._attrs.value = {};
    },
    get: function(key) {
        return this._attrs.value[key];
    },
    set: function(key, value) {
        this._attrs.value[key] = value;
        this.save();
        this.read();
    },
    erase: function() {
        var oldExpires = this._expires;
        this._expires = -1;
        this.save();
        delete this._attrs.value;
        this._expires = oldExpires;
    },
    empty: function() {
        return _.isEmpty(this._attrs.value);
    }
});
propublica.Deferrable = propublica.View.extend({
    init: function() {
        this._super();
        _.bindAll(this, 'render');
        var oldRender = this.render;
        this.render = function() {
            _.defer(oldRender);
        };
    }
});
propublica.models.filterable = propublica.Model.extend({
    _attrs: {
        additive: false
    },
    init: function(attrs) {
        this._attrs.collection = $.makeArray(attrs.collection) || {};
        this.length = this._attrs.collection.length;
        this.reset();
        return this._super(attrs);
    },
    filter: function(filter) {
        var filtered = _.select(this.collection, filter);
        if (this._attrs.additive) this.collection = filtered;
        return filtered;
    },
    filterByAttr: function(value, attr, key) {
        if (key) value = value[key];
        return this.filter(function(element) {
            var values = $(element).attr(attr);
            if (key) values = JSON.parse(values)[key];
            values = _.isArray(values) ? values : [values];
            return _.include(values, value);
        });
    },
    numByAttr: function(value, attr, key) {
        var num = this.filterByAttr(value, attr, key).length;
        this.reset();
        return num;
    },
    sort: function(comparator) {
        this.collection = _.sortBy(this.collection, comparator);
        return this.collection;
    },
    reset: function() {
        this.collection = _.clone(this._attrs.collection);
        return this.collection;
    }
});
(function() {
    if (!window.console) {
        var console = window.console = {};
        _.each(["log", "debug", "info", "warn", "error", "exception", "assert", "dir", "dirxml", "trace", "group", "groupEnd", "groupCollapsed", "time", "timeEnd", "profile", "profileEnd", "count", "clear", "notifyFirebug", "getFirebugElement", "firebug", "element"], function(fn) {
            console[fn] = function() {};
        });
    }
})();
propublica.models.RESTClient = propublica.Model.extend({
    init: function(attrs) {
        this._super(attrs);
        if (this._attrs.url) this.url = this._attrs.url;
        if (!this.url) {
            this.url = window.location.pathname;
            if (!(/^\/$/.test(this.url))) {
                this.url.replace(/\.html$/, ".json");
                if (!(/\.json$/).test(this.url)) this.url += ".json";
            } else {
                this.url += "index.json";
            }
        }
        this._create("get");
        this._create("put");
        this._create("del");
        this._create("post");
    },
    _create: function(method) {
        this[method] = function(payload, callback, err) {
            if (method === "del") method = "delete";
            if (method === "put" || method === "delete") {
                _.extend(payload, {
                    _method: method.toUpperCase()
                });
                method = "post";
            }
            this._request.apply(this, ([method.toUpperCase()]).concat(_.toArray(arguments)));
        };
    },
    _request: function(method, payload, callback, err) {
        err = err || function(req, stat, error) {
                console.log(req, stat, error);
            };
        $.ajax({
            url: _.isFunction(this.url) ? this.url() : this.url,
            dataType: 'json',
            type: method,
            data: payload,
            success: callback,
            error: err
        });
    }
});
propublica.models.Set = propublica.Model.extend({
    init: function(vals, cap) {
        this._super();
        this._attrs.values = vals || [];
        this._commit();
        this.setCap(cap);
    },
    unshift: function(value) {
        this._attrs.values.unshift(value);
        this._commit();
        return this.indexOf(value);
    },
    push: function(value) {
        this._attrs.values.push(value);
        this._commit();
        return this.indexOf(value);
    },
    del: function(value) {
        this._attrs.values = _.without(this._attrs.values, value);
        this._commit();
        return value;
    },
    isEmpty: function() {
        return this._attrs.values.length === 0;
    },
    size: function() {
        return this._attrs.values.length;
    },
    capacity: function() {
        return this.cap || -1;
    },
    pop: function() {
        var val = this._attrs.values.pop();
        this._commit();
        return val;
    },
    find: function(item) {
        return this.indexOf(item) > -1 ? this._attrs.values[this.indexOf(item)] : null;
    },
    indexOf: function(item) {
        return _.indexOf(this._attrs.values, item);
    },
    include: function(item) {
        return _.include(this._attrs.values, item);
    },
    empty: function() {
        this._attrs.values.length = [];
    },
    values: function() {
        return this._attrs.values;
    },
    setCap: function(cap) {
        if (cap) this.cap = cap;
        this._commit();
    },
    union: function(other_set) {
        return new propublica.models.Set(_.uniq(this._attrs.values, other_set));
    },
    intersect: function(other_set) {
        return new propublica.models.Set(_.intersect(this._attrs.values, other_set));
    },
    _cap: function() {
        if (this.cap) this._attrs.values = this._attrs.values.slice(0, this.cap);
    },
    _commit: function() {
        this._attrs.values = _.uniq(this._attrs.values);
        this._cap();
        this.length = this._attrs.values.length;
    }
});
propublica.models.articleContent = propublica.Model.extend({
    init: function(attrs) {
        this._super(attrs);
        _.extend(this, propublica.models.articleContent.cacher.get());
    },
    html: function() {
        var h1 = "<h1>" + (this.headline.text() || '') + "</h1>\n";
        var byline = "<p>" + (this.byline.text() || '') + "</p>\n";
        var html = _.reduce(this.article, function(memo, item) {
            return memo + (item.html() || '');
        }, '');
        return h1 + byline + html;
    },
    simpleHTML: function() {
        var results = "";
        var allowed = "h1,h2,h3,h4,h5,h6,a,abbr,acronym,ol,ul,li,blockquote,div,b,cite,code,em,i,p,pre,q,small,strike,span,strong,sub,sup,tt,u,table,td,tr";
        var allowedArr = (allowed + "," + allowed.toUpperCase()).split(',');
        var allowedAttrs = "href".split(",");
        HTMLParser(this.html(), {
            allowed: allowed,
            start: function(tag, attrs, unary) {
                if (_.include(allowedArr, tag)) {
                    results += "<" + tag.toLowerCase();
                    var attrLength = attrs.length;
                    for (var i = 0; i < attrLength; i++) {
                        if (_.include(allowedAttrs, attrs[i].name)) results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';
                    }
                    results += ">";
                }
            },
            end: function(tag) {
                if (_.include(allowedArr, tag)) {
                    results += "</" + tag.toLowerCase() + ">";
                }
            },
            chars: function(text) {
                results += text;
            },
            comment: function(text) {}
        });
        return results.replace(/\n/g, " ").replace(/<ol>.*<\/ol>/g, "").replace(/<div>.*?<\/div>/g, "").replace(/<span> \[\d*\]<\/span>/g, "").replace(/(â€œ|â€)/g, '"').replace(/(\2018|â€™)/g, "'").replace(/''/, '"');
    }
});
propublica.models.getInvolvedContent = propublica.models.articleContent.extend({
    init: function(attrs) {
        this._super(attrs);
        _.extend(this, propublica.models.getInvolvedContent.cacher.get());
    }
});
propublica.models.articleContent.cacher = {
    TEMPLATE_CHANGE: 1392854400000,
    ret: null,
    newStyle: {
        SCOPE: "article ",
        HEADLINE: "header h1",
        BYLINE: "header p.byline",
        ARTICLE: "section.bodytext",
    },
    oldStyle: {
        SCOPE: "",
        HEADLINE: "h1.title-link",
        BYLINE: "p.byline",
        ARTICLE: ".article"
    },
    get: function() {
        var pubDate = Date.parse($("meta[property='article:published_time']").attr('content'));
        if (pubDate < this.TEMPLATE_CHANGE) {
            _.extend(this, this.oldStyle);
        } else {
            _.extend(this, this.newStyle);
        };
        if (!this.ret) this.ret = {
            headline: $(this.SCOPE + this.HEADLINE),
            byline: $(this.SCOPE + this.BYLINE),
            article: _.compact(_.map($(this.SCOPE + this.ARTICLE).toArray(), function(el) {
                return $(el);
            }))
        };
        return this.ret;
    },
    reget: function() {
        this.ret = null;
        return this.get();
    }
};
propublica.models.getInvolvedContent.cacher = {
    ret: null,
    SCOPE: "div.topic-wrapper ",
    HEADLINE: "header h1",
    BYLINE: "header p.byline",
    ARTICLE: "section.bodytext",
    get: propublica.models.articleContent.cacher.get,
    reget: propublica.models.articleContent.cacher.reget
};
propublica.models.eeCookie = propublica.models.Cookie.extend({
    name: 'exp_userhash'
});
propublica.models.pageCookie = propublica.models.Cookie.extend({
    name: "propublica-pagecookie",
    init: function(attrs) {
        this.path = window.location.pathname;
        $(window).unload(_.bind(this.save, this));
        this._super(attrs);
    },
    isSet: function() {
        return this.read().getTime() > 0;
    },
    save: function() {
        this._attrs.value[this.path] = new Date();
        return this._super();
    },
    read: function() {
        var read = this._super();
        return read[this.path] ? new Date(Date.parse(Date(read[this.path]))) : new Date(0);
    }
});
propublica.models.trackingCookie = propublica.models.Cookie.extend({
    name: 'pp-tracking',
    init: function(attrs) {
        this._super(attrs);
        this.cappedSet = new propublica.models.Set(this._attrs.value.pages || [], 30);
        this.set('pageCount', this.get('pageCount') || 0);
    },
    send: function(id) {
        this.cappedSet.unshift(id);
        this.set('lastVisit', new Date());
        this.set('pages', this.cappedSet.values());
        this.set('pageCount', this.get('pageCount') + 1);
        $(window).unload(_.bind(this.save, this));
    },
    setPopped: function(reset) {
        if (reset) this.set('pageCount', 0);
        this.set('popped', new Date());
    },
    getPopped: function() {
        return this.get('popped');
    },
    include: function(item) {
        return this.cappedSet.include(item);
    },
    pages: function() {
        return this.cappedSet.values();
    }
});
(function() {
    _.extend(propublica.app, {
        trackingCookie: null,
        initCookies: function() {
            this.trackingCookie = window.trackingCookie = new propublica.models.trackingCookie();
        }
    });
    propublica.app.initCookies();
})();
propublica.views.TrackableSubmit = propublica.View.extend({
    tag: '',
    LABEL: 'generic-submit',
    ACTION: 'submit',
    CATEGORY: 'signup',
    init: function() {
        this.SUBMIT_EVENT = this.SUBMIT_EVENT || [this.CATEGORY, this.ACTION, this.LABEL];
        this._super();
    },
    render: function() {
        this.el.find('form').submit(_.bind(this.trackEvent, this));
    },
    trackEvent: function(e) {
        var el = $(e.currentTarget);
        e.preventDefault();
        var tracker = _.isFunction(this.SUBMIT_EVENT) ? this.SUBMIT_EVENT(e) : this.SUBMIT_EVENT;
        this.track.apply(this, tracker);
        el.unbind();
        _.delay(function() {
            $(el).submit();
            el.submit(function() {
                e.preventDefault();
                return false;
            });
        }, 50);
        return false;
    }
});
propublica.views.Pulldown = propublica.views.TrackableSubmit.extend({
    tag: '',
    bindings: {
        'click': 'toggle'
    },
    CATEGORY: 'signup',
    ACTION: 'pulldown',
    toggle: function(e) {
        var el = $(e.target);
        if (!el.parents('form').is('*')) {
            if (!this.el.hasClass(this.toggleClass)) this.track('signup', 'pulldown', this.LABEL);
            return this._super(e);
        }
        return true;
    }
});
propublica.views.clickable = propublica.View.extend({
    tag: '',
    bindings: {
        'click': 'redirect'
    },
    render: function() {
        if (!this.url) throw ('You need to specify a url for clickables');
        this.el.css({
            'cursor': 'pointer'
        });
        this._super();
    },
    redirect: function(e) {
        if (!$(e.target).is('a')) window.location = this.url;
        return true;
    }
});
propublica.views.Flippy = propublica.View.extend({
    tag: '',
    CATEGORY: 'flippy',
    init: function() {
        _.bindAll(this, 'trackEvent');
        this._super();
    },
    trackEvent: function(e, index) {
        this.track(this.CATEGORY, 'click', window.location.pathname + " " + (index + 1));
    }
});
propublica.views.marmaduke = propublica.View.extend({
    id: "admin-only-toggle",
    bindings: {
        'click': 'toggle'
    },
    render: function() {
        this.el.trigger("click");
    },
    toggle: function(e) {
        this._super(e);
        if (this.el.hasClass(this.toggleClass)) {
            $('#admin-only-meta').animate({
                bottom: 0
            }, 100);
            this.el.text("Close Panel");
        } else {
            $('#admin-only-meta').animate({
                bottom: ($('#admin-only-meta').height() + (13 * 3)) * -1
            }, 100);
            this.el.text("Admin Panel");
        }
    }
});
propublica.views.purpleNumbers = propublica.View.extend({
    id: "admin-stats",
    tag: "li",
    STATS_URL: "http://stats.propublica.org:8090/search.json?callback=?",
    render: function() {
        var req = new propublica.models.RESTClient({
            url: this.STATS_URL
        });
        var that = this;
        req.get({
            url: window.location.href
        }, function(json) {
            if (json && json.stat)
                that.el.text("Views: " + json.stat.hits);
        });
    }
});
propublica.views.searchForm = propublica.View.extend({
    tag: 'form',
    cssClass: 'search_form',
    bindings: {
        'click': 'clearInput'
    },
    clearInput: function(e) {
        var el = $(e.target);
        if (el.is('input[type=text]') && !el.hasClass('cleared')) {
            el.attr({
                'value': ''
            });
            el.addClass('cleared');
        }
        return true;
    }
});
propublica.views.archiveForm = propublica.View.extend({
    id: "archive_form_go",
    tag: "input",
    bindings: {
        "click": "archive_form_go_activate"
    },
    archive_form_go_activate: function(e) {
        e.stopPropagation();
        e.preventDefault();
        var addSlash = _.last(window.location.href.split("")) === "/" ? "" : "/";
        var archive_form_target = "archive/" + $("select#archive_select").val();
        window.location = window.location.href + addSlash + archive_form_target;
    }
});
propublica.views.articleSidebar = propublica.View.extend({
    scope: "body.article-page",
    cssClass: "content-left",
    render: function() {
        if (this.el.html().replace(/\s/g, "").length < 5 || (this.el.find(".related-sidebar-meat").is("*") && this.el.find(".related-sidebar-meat").html().replace(/\s/g, "").length < 5)) return;
        this.el.detach();
        this.el.css({
            "display": "block"
        });
        var that = this;
        $(".sidebar-inject").each(function() {
            $(this).html(that.el.clone());
        });
    }
});
propublica.views.bannerForm = propublica.views.searchForm.extend({
    scope: "div#banner",
    cssClass: ''
});
propublica.views.dontMiss = propublica.View.extend({
    scope: 'div#dont-miss',
    cssClass: 'wrapper',
    render: function() {
        var self = this;
        var url = (("https:" === document.location.protocol) ? "https:" : "http:") + '//www.propublica.org/callbacks/dont_miss/telephoneline?callback=propublica.views.dontMiss.callback';
        propublica.views.dontMiss.callback = function(data) {
            self.el.prepend(data);
        };
        var script = document.createElement('script');
        script.src = url;
        script.async = true;
        document.body.appendChild(script);
    }
});
propublica.views.dontMiss2011 = propublica.views.dontMiss.extend({
    scope: "nav#dont-miss"
});
propublica.views.facebookPopper = propublica.View.extend({
    tag: 'aside',
    cssClass: 'fb',
    render: function() {
        this.$('.jspopper').remove();
    }
});
propublica.views.twitterPopper = propublica.View.extend({
    tag: 'aside',
    cssClass: 'tw',
    render: function() {
        this.$('.popper').remove();
    }
});
propublica.views.footer = propublica.Deferrable.extend({
    cssClass: 'footer-block',
    equalizeHeights: function() {
        var tallest = _.max($.makeArray(this.el), function(child) {
            return $(child).height();
        });
        this.el.height($(tallest).height() + 20);
    },
    render: function() {
        this.equalizeHeights();
    }
});
propublica.views.legacyImages = propublica.Deferrable.extend({
    scope: "div#content",
    cssClass: 'article',
    render: function() {
        var images = this.el.find('img');
        images.each(function() {
            var el = $(this);
            if (!(el.parent().is('p') || el.parent().is("a"))) return false;
            var width = el.attr('width');
            var div = propublica.utils.begat('div', {
                'class': el.attr('class') || '',
                style: el.attr('style') || ''
            }).addClass('article-inline-image');
            el.removeClass();
            el.removeAttr('style');
            if (width) div.css({
                'width': width
            });
            var caption = propublica.utils.begat('p', {
                'class': 'photo-caption'
            }).html(el.attr('alt'));
            el.wrap(div).after(caption);
            return true;
        });
    }
});
propublica.views.metaToggler = propublica.View.extend({
    scope: 'aside.toggler',
    tag: 'h1',
    bindings: {
        'click': "toggle",
        'touchstart': 'toggle'
    },
    toggle: function(e) {
        $(e.currentTarget).parents('aside.toggler').toggleClass(this.toggleClass);
    }
});
propublica.views.mostRead = propublica.View.extend({
    id: 'most-read',
    render: function() {
        var self = this;
        $.get("/static/chartbeat.html", function(data) {
            var lis = $(data).find('li');
            lis.eq(0).addClass('first');
            self.el.children('ul').html(lis);
        });
    }
});
propublica.views.neapolitanOfficialsSay = propublica.View.extend({
    id: "neapolitan-officials-say",
    ENDPOINT: "https://api.tumblr.com/v2/blog/officialssay.tumblr.com/posts/quote?api_key=0u3x9hf7gLEX7QQiJwWAAtoI3A0Gkeg194Dsw0xHDZ33mRuU28",
    render: function() {
        _.bindAll(this, 'tmpl');
        this.getTumblr();
    },
    getTumblr: function() {
        $.getJSON(this.ENDPOINT + "&jsonp=?", this.tmpl);
    },
    tmpl: function(data) {
        var firstPost = data['response']['posts'][0];
        var quote = firstPost['text'];
        var source = $("<div>" + firstPost['source'] + "<\/div>").text();
        var link = firstPost['post_url'];
        if (source.length > 60) {
            source = source.split('').splice(0, 60).join('') + "...";
        }
        this.el.children(".quote").html("<a href=" + link + ">" + quote + "<\/a>");
        this.el.children(".source").html("<a href=" + link + ">" + source + "<\/a>");
    }
});
propublica.views.printFormat = propublica.Deferrable.extend({
    scope: "div#content",
    cssClass: 'article-full',
    render: function() {
        this.content = new propublica.models.articleContent();
        this.linkify();
    },
    linkify: function() {
        var begat = propublica.utils.begat;
        var set = new propublica.models.Set([]);
        var list = begat('ol', {
            'id': 'print-links',
            'class': 'print-only'
        });
        _.each(this.content.article, function(section) {
            $(section).find('a[href]').each(function(i) {
                var el = $(this);
                var href = el.attr('href');
                var index = set.push(href);
                var span = begat('span', {
                    'class': 'print-only'
                }).html(' [' + (index + 1) + ']');
                el.after(span);
            });
        });
        _.each(set.values(), function(val) {
            list.append(begat('li').html(val));
        });
        if (_.last(this.content.article))
            _.last(this.content.article).append(list);
    }
});
propublica.views.printer = propublica.View.extend({
    tag: 'a',
    cssClass: 'print-link',
    bindings: {
        'click': 'print'
    },
    print: function(e) {
        e.preventDefault();
        path = "/print/" + window.location.pathname;
        this.track(['_trackPageview', path]);
        window.print();
    }
});
propublica.views.searchToggler = propublica.View.extend({
    scope: "#search-toggler",
    cssClass: "search-toggle",
    bindings: {
        'touchstart': 'toggle'
    },
    toggle: function() {
        $("#search-toggler").toggleClass(this.toggleClass);
    }
});
propublica.views.SearchToken = propublica.View.extend({
    scope: "#search-toggler",
    tag: "form",
    render: function() {
        $.getJSON("https://www.propublica.org/search/auth.php?callback=?", _.bind(this.append, this));
    },
    append: function(data) {
        var el = $("<input />").attr({
            "type": "hidden",
            "name": "csrf_token",
            "value": data.token
        });
        this.el.append(el);
    }
});
propublica.views.stickyNav = propublica.View.extend({
    tag: "",
    cssClass: "sticky-scroller",
    render: function() {
        _.bindAll(this, "stick");
        this.jWindow = $(window);
        this.jFooter = $("footer.shell, #footer");
        this.offsetTop = (this.el.offset().top) - (this.el.outerHeight(true) - this.el.height());
        this.elHeight = this.el.height();
        this.jWindow.scroll(this.stick);
        this.bottomOffset = 560;
    },
    stick: function() {
        var windowTop = this.jWindow.scrollTop();
        var footerTop = this.jFooter.offset().top;
        if (windowTop > this.offsetTop && windowTop < footerTop - this.bottomOffset) {
            this.el.addClass("stuck").removeClass("topped bottomed")
        } else if (windowTop > footerTop - this.bottomOffset) {
            this.el.addClass("bottomed").removeClass("stuck topped")
        } else {
            this.el.addClass("topped").removeClass("stuck bottomed")
        }
    }
});
propublica.views.underdog = propublica.views.footer.extend({
    cssClass: 'further-reading-item'
});
propublica.views.republish = propublica.View.extend({
    tag: 'a',
    cssClass: 'commons-link',
    bindings: {
        'click': 'display'
    },
    render: function() {
        this.modal = $('#republish-modal');
        var that = this;
        if (window.location.hash.indexOf("#republish") > -1) _.defer(function() {
            that.el.trigger("click")
        });
    },
    display: function(e) {
        e.preventDefault();
        this.modal.trigger('display');
    }
});
propublica.views.republishModal = propublica.View.extend({
    id: 'republish-modal',
    bindings: {
        'display': 'display',
        'click': 'dismiss'
    },
    render: function() {
        this.el.children('div.republish-window').click(function(e) {
            e.stopPropagation();
        });
    },
    display: function(e) {
        e.currentTarget = this.el[0];
        this.toggle(e);
        this.track('modal', 'click', window.location.pathname);
        this.el.find('a.close').click(_.bind(this.dismiss, this));
        this._adjustHeight();
        if (!this.rendered) {
            if ($(e.currentTarget).hasClass("getinvolved-modal")) {
                var article = new propublica.models.getInvolvedContent()
            } else {
                var article = new propublica.models.articleContent();
            }
            var html = article.simpleHTML();
            html = html + "<p><em>ProPublica is a Pulitzer Prize-winning investigative newsroom.  Sign up for their <a href=\"http://www.propublica.org/forms/newsletter_daily_email\">newsletter</a></em>.</p>";
            var url = "http://" + (window.location.host + '/' + window.location.pathname).replace("//", "/");
            html = html + '<link rel="canonical" href="' + url + '">';
            html = html + '<meta name="syndication-source" content="' + url + '">';
            html = html + '<script type="text/javascript" src="http://pixel.propublica.org/pixel.js" async></script>';
            this.el.find('p.byline').html(article.byline.html());
            this.el.find('h3.title-link').html(article.headline.html());
            this.el.find('textarea').text(html);
            this.el.find('#clippy').flashembed('/images/flash/clippy.swf', {
                text: escape(html)
            }).css({
                "font-size": "12px"
            });
            this.rendered = true;
        }
    },
    _adjustHeight: function() {
        this.el.css({
            position: 'fixed'
        });
    },
    dismiss: function(e) {
        if (!this.el.hasClass(this.toggleClass)) return true;
        e.currentTarget = this.el[0];
        this.toggle(e);
        return false;
    }
});
propublica.views.river = propublica.View.extend({
    id: 'filterable',
    bindings: {
        'authors': 'filter',
        'tags': 'filter',
        'type': 'filter',
        'project': 'filter',
        'unread': 'unread',
        'sort': 'date',
        'reset': 'reset',
        'all': 'all',
        'commit': 'commit'
    },
    render: function() {
        this.model = new propublica.models.filterable({
            collection: this.el.children(),
            additive: true
        });
        this.el.children().css({
            height: 'auto'
        });
        this.el.height(this.el.height());
    },
    filter: function(e, filter, key) {
        this.model.filterByAttr(filter, 'data-info', key);
    },
    date: function(e, filter) {
        var collection = this.model.sort(function(a) {
            var ts = (Date.parse(JSON.parse($(a).attr('data-info'))['date'])).valueOf();
            if (filter['sort'] === 'desc') ts *= -1;
            return ts;
        });
    },
    reset: function(e, from) {
        return this.model.reset();
    },
    all: function(e, from) {
        this.lastKey = 'all';
        this.reset();
    },
    commit: function(e) {
        this.munge(this.model.collection);
    },
    unread: function(e, filter) {
        this.lastKey = 'unread';
        this.model.filter(function(el) {
            var article_id = JSON.parse($(el).attr('data-info'))['article_id'];
            return !propublica.app.trackingCookie.include(article_id);
        });
    }
});
propublica.views.riverControl = propublica.Deferrable.extend({
    scope: 'div.filter-module',
    cssClass: 'filter',
    tag: 'a',
    bindings: {
        'click': 'dispatch'
    },
    render: function() {
        var model = new propublica.models.filterable({
            collection: $('div#filterable').children(),
            additive: true
        });
        this.articleCountEl = $("div.article-list-header h3");
        _.each($.makeArray(this.el), function(el) {
            try {
                var json = JSON.parse($(el).attr('data-dispatch'));
                var key = _.keys(json)[0];
                var num = null;
                if (key !== 'unread') {
                    num = model.numByAttr(json, 'data-info', key);
                } else {
                    num = model.filter(function(el) {
                        try {
                            var article_id = JSON.parse($(el).attr('data-info'))['article_id'];
                        } catch (e) {
                            console.log(e, article_id, el);
                        }
                        return !propublica.app.trackingCookie.include(article_id);
                    }).length;
                    model.reset();
                }
                if (num) {
                    $(el).find('span').html("(" + num + ")");
                } else $(el).parent().remove();
            } catch (e) {
                console.log(e, el, $(el).attr('data-dispatch'));
            };
        });
    },
    dispatch: function(e) {
        e.preventDefault();
        var clickedOn = $(e.currentTarget);
        clickedOn.parents(this.scope).find(this.tag).removeClass('active');
        clickedOn.addClass('active');
        $('div#filterable').trigger('reset');
        this.el.filter('.active').each(function() {
            var disp = JSON.parse($(this).attr('data-dispatch'));
            var key = _.keys(disp)[0];
            $('div#filterable').trigger(key, [disp, key]);
        });
        $('div#filterable').trigger('commit');
        this.articleCountEl.html(clickedOn.html()).children('span').text("(" + $('div#filterable').children().length + ")");
    }
});
propublica.views.riverLastVisit = propublica.Deferrable.extend({
    tag: 'a',
    id: 'last-visit-link',
    render: function() {
        var model = new propublica.models.filterable({
            collection: $('div#filterable').children('div.article-excerpt'),
            additive: true
        });
        var cookie = new propublica.models.pageCookie();
        var lastVisit = cookie.read();
        var num = model.filter(function(el) {
            var date = Date.parse(JSON.parse($(el).attr('data-info')).date);
            return date > lastVisit;
        }).length;
        this.el.text(num + " updates since last visit");
    }
});
propublica.views.riverReset = propublica.views.riverControl.extend({
    cssClass: 'all',
    render: function() {
        this.el.find('span').html("(" + $('div#filterable').children().length + ")");
        this.articleCountEl = $("div.article-list-header h3");
        this.articleCountEl.html(this.el.eq(0).html().replace("Show", ""));
    },
    dispatch: function(e) {
        $("div#filterable").trigger('all');
        this.cssClass = 'filter';
        this.el = $(this.query().string);
        this._super(e);
        this.cssClass = 'all';
        this.el = $(this.query().string);
        this.articleCountEl.html($(e.currentTarget).html().replace("Show", "")).children('span').text("(" + $('div#filterable').children().length + ")");
    }
});
propublica.views.riverSort = propublica.views.riverControl.extend({
    cssClass: 'sort',
    tag: 'a',
    render: function() {
        this.articleCountEl = $();
        return this;
    }
});
propublica.views.donateModule = propublica.views.clickable.extend({
    cssClass: 'donate-module',
    tag: 'div',
    url: 'https://www.propublica.org/site/donate3',
    redirect: function(e) {
        this.track('donate', 'click', 'module');
        return this._super(e);
    }
});
propublica.views.podcastModule = propublica.views.clickable.extend({
    cssClass: 'podcast-module',
    tag: 'div',
    url: 'https://www.propublica.org/podcast'
});
propublica.views.twitterModule = propublica.views.clickable.extend({
    cssClass: 'twitter-module',
    tag: 'div',
    url: 'https://projects.propublica.org/twitter'
});
propublica.views.emailBox = propublica.views.Pulldown.extend({
    cssClass: 'email-article',
    tag: 'li',
    CATEGORY: 'email',
    LABEL: 'email-pulldown',
    init: function() {
        this._super();
        this.EVENT_TRACK = [this.CATEGORY, 'submit', window.location.href];
    }
});
propublica.views.updates = propublica.views.Pulldown.extend({
    id: 'updates-tab',
    tag: 'li',
    LABEL: 'newsletter-pulldown',
    toggle: function(e) {
        var el = $(e.target);
        if (!el.parents("#updates-options").is("*")) return this._super(e);
        return true;
    }
});
propublica.views.docUnderdog = propublica.views.TrackableSubmit.extend({
    id: "doc",
    toggleClass: "active",
    LABEL: 'newsletter-pulldown',
    render: function() {
        this.html = $(window.JST.get_updates_flyup({}));
        this.el.before(this.html);
        this.html.show();
        this.el.unbind();
        this.el = this.html;
        this.setBindings();
        this.height = this.html.height();
        this.titleHeight = this.html.find('.module-top').height() + 20;
        this.html.hide();
        _.bindAll(this, "show", "click");
        _.delay(this.show, 1500);
        this.html.find('.module-top').click(this.click);
        this._super();
    },
    show: function() {
        this.html.css({
            "bottom": this.height * -1 + 20
        }).show().animate({
            "bottom": this.titleHeight - this.height
        }, 150);
    },
    click: function(e) {
        this.html.toggleClass(this.toggleClass);
        e.stopPropagation();
        this.track('signup', 'pulldown', this.LABEL);
        if (this.html.hasClass(this.toggleClass)) {
            this.html.animate({
                "bottom": 0
            });
        } else {
            this.html.animate({
                "bottom": this.titleHeight - this.height
            });
        }
    }
});
propublica.views.getUpdatesBox = propublica.views.TrackableSubmit.extend({
    tag: 'div',
    cssClass: 'updates-module',
    LABEL: 'newsletter-module'
});
propublica.views.pprnBox = propublica.views.TrackableSubmit.extend({
    tag: 'div',
    cssClass: 'network-module',
    LABEL: 'pprn-module'
});
propublica.views.accordion = propublica.views.Flippy.extend({
    id: "accordion",
    cssClass: '',
    tag: 'div',
    bHeight: 0,
    CATEGORY: 'accordion',
    slideCorrectly: function(i, done) {
        var panes = this.el.children('.pane'),
            targetPane = panes.eq(i),
            currentPane = panes.filter(':visible');
        if (targetPane.is(':visible')) {
            return;
        }
        var opt = $.speed(200);
        var self = this;
        opt.step = function(now, fx) {
            targetPane.height(now);
            currentPane.height(self.bHeight - now);
        };
        opt.complete = function() {
            currentPane.hide();
            currentPane.height(self.bHeight);
        };
        targetPane.animate({
            height: "show"
        }, opt);
        this.trackEvent(null, i);
    },
    render: function() {
        var panes = this.el.children('.pane');
        var biggie = $(_.max($.makeArray(panes), function(pane) {
            return $(pane).text().length;
        }));
        var biggieByHeight = $(_.max($.makeArray(panes), function(pane) {
            return $(pane).height();
        }));
        biggie.show();
        this.bHeight = (biggie.height() > biggieByHeight.height() ? biggie.height() : biggieByHeight.height()) + 20;
        biggie.hide();
        panes.height(this.bHeight);
        $.tools.tabs.addEffect('slideCorrectly', _.bind(this.slideCorrectly, this));
        this.el.tabs(this.query().string + " div.pane", {
            tabs: 'div.ac-tab',
            effect: 'slideCorrectly'
        });
    }
});
propublica.views.accordion2011 = propublica.views.accordion.extend({
    id: "accordion-2011"
});
propublica.views.carousel = propublica.views.Flippy.extend({
    id: 'tools-carousel',
    cssClass: '',
    tag: 'div',
    CATEGORY: 'carousel',
    render: function() {
        this.el.children('.scrollable').scrollable({
            circular: true
        }).bind('onSeek', this.trackEvent);
    }
});
propublica.views.featureModuleSlider = propublica.View.extend({
    cssClass: 'series-header-nav-title',
    bindings: {
        'click': 'slider'
    },
    lock: false,
    slide: null,
    children: null,
    cookie: null,
    SPEED: 300,
    toggleClass: 'open',
    render: function() {
        this.slide = this.el.siblings('div.summary-content');
        var elHeight = this.el.height() * (this.el.length) + 56;
        var totalHeight = $('div#series-header').height() < 350 ? 350 : $('div#series-header').height();
        $('div.series-header-nav').height(totalHeight);
        this.slide.height(totalHeight - elHeight);
        this.children = this.el.find('a');
        _.bindAll(this, "unlock");
    },
    slider: function(e) {
        var el = $(e.target);
        if ($('.series-header-nav').hasClass('no-ssf')) return false;
        if (el.parents("div").is("#features-header") && el.hasClass(this.toggleClass)) return false;
        if (!this.lock) {
            this.lock = true;
        } else {
            return false;
        }
        var suffix = "open";
        if (!this.slide.is(":visible")) {
            this.slide.slideDown(this.SPEED, this.unlock);
        } else {
            suffix = "closed";
            this.slide.slideUp(this.SPEED, this.unlock);
        }
        this.track('flippy', 'click', window.location.pathname + " story-so-far" + " " + suffix);
        return false;
    },
    unlock: function() {
        this.lock = false;
    }
});
propublica.views.featureModuleTabs = propublica.views.Flippy.extend({
    id: 'series-features',
    tag: 'ul',
    toggleClass: 'current',
    bindings: {
        'click': 'tabClick'
    },
    render: function() {
        this.el.tabs('div.series-feature', {
            current: this.toggleClass
        }).bind('onClick', this.trackEvent);
    },
    tabClick: function(e) {
        var curr = $(e.target);
        var kids = this.el.children('li').children('a');
        kids.removeClass('shd-top shd-btm');
        curr.parent().next().children('a').addClass('shd-top');
        curr.parent().prev().children('a').addClass('shd-btm');
    }
});
propublica.views.ionTabs = propublica.views.Flippy.extend({
    scope: 'div#topic-related-apps',
    tag: 'ul',
    cssClass: 'tabs',
    render: function() {
        this.el.tabs("div#topic-carousel-main div.panes > div.topic-app-large", {
            tabs: 'li.app-tab'
        }).bind('onClick', this.trackEvent);
    }
});
propublica.views.tabBox = propublica.views.Flippy.extend({
    scope: 'div.tabbed-module, aside.module-tabbed-2011',
    cssClass: "tabs",
    tag: 'ul',
    CATEGORY: 'most read',
    render: function() {}
});
(function() {
    _.extend(propublica.app, {
        writeQueue: new propublica.models.AsyncFunctionQueue()
    });
})();
propublica.views.chiclets = propublica.Deferrable.extend({
    cssClass: 'social-module',
    render: function() {
        window.dataLayer = (window.dataLayer || []);
        if ($(window).width() < 500) return;
        this.rawUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        this.url = window.PP_SHARING_URL || this.rawUrl;
        this.twDesc = window.PP_DEFAULT_TWEET || document.title;
        this.plusone();
        this.facebook();
        this.facebook_like();
        this.twitter();
        this.linkedin();
    },
    trackedUrl: function(net) {
        var lookup = {
            "twitter": "utm_campaign=bt_twitter&utm_source=twitter&utm_medium=social",
            "googleplus": "utm_campaign=bt_googleplus&utm_source=googleplus&utm_medium=social",
            "linkedin": "utm_campaign=bt_linkedin&utm_source=linkedin&utm_medium=social",
            "reddit": "utm_campaign=bt_reddit&utm_source=reddit&utm_medium=social",
            "facebook": "utm_campaign=bt_facebook&utm_source=facebook&utm_medium=social"
        };
        return this.url.match(/\?.*$/g) ? (this.url + "&" + lookup[net]) : (this.url + "?" + lookup[net]);
    },
    facebook: function() {
        var that = this;
        if ($("#fb-root").length < 1) {
            $("body").append('<div id="fb-root"></div>');
        }
        this.el.each(function() {
            $('li.fb-link', this).append('<div class="fb-like" data-href="' +
                that.trackedUrl("facebook") + '" data-layout="' +
                ($('li.fb-link', this).hasClass('social-tall') ? "box_count" : "button_count") + '" data-send="false" width="115" show_faces="false" font=""></div>');
        });
        if (this.$('li.fb-link').is("*")) {
            _.defer(function() {
                var wait = function() {
                    if (!e.readyState && e.readyState != "complete" && e.readyState != "loaded") return;
                    e.onload = e.onreadystatechange = null;
                };
                if (window.FB) {
                    FB.XFBML.parse();
                    return;
                }
                var e = document.createElement('script');
                e.async = true;
                e.onload = e.onreadystatechange = wait;
                e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js#xfbml=true';
                document.getElementById('fb-root').appendChild(e);
            });
        }
    },
    facebook_like: function() {
        var that = this;
        this.el.each(function() {
            $('li.fb-like-300', this).append(that._facebookLikeMarkupIframe("standard"));
        });
    },
    _facebookLikeMarkupIframe: function(layout) {
        return '<iframe src="https://www.facebook.com/plugins/like.php?href=' +
            encodeURIComponent("https://www.facebook.com/propublica") + '&amp;layout=' + layout + '&amp;show_faces=false&amp;width=275&amp;action=like&amp;colorscheme=light&amp;height=35" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:275px; height:35px;" allowTransparency="true"></iframe>';
    },
    plusone: function() {
        if (this.$('li.po-link').is("*"))
            $("script:eq(0)").before('<script type="text/javascript" src="https://apis.google.com/js/plusone.js"></script>');
    },
    twitter: function() {
        var self = this;
        this.el.each(function() {
            $('li.tw-link', this).html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="' +
                self.trackedUrl("twitter") + '" data-text="' + self.twDesc + '" data-count="' +
                ($('li.tw-link', this).hasClass('social-tall') ? "vertical" : "horizontal") + '" data-via="propublica">Tweet</a>');
        });
        var js = document.location.protocol + "//platform.twitter.com/widgets.js";
        $.getScript(js, function() {});
    },
    linkedin: function() {
        var that = this;
        if (this.$('li.linkd-link').is("*")) {
            var js = "https://platform.linkedin.com/in.js";
            $.getScript(js, function() {});
        }
    }
});
propublica.views.barChart = propublica.View.extend({
    cssClass: "bar-chart",
    PADDING: 5,
    render: function() {
        var that = this;
        this.el.each(function() {
            var el = $(this);
            if (!el.attr("data-labels") && !el.attr("data-values")) return;
            var labels = JSON.parse(el.attr("data-labels"));
            var values = JSON.parse(el.attr("data-values"));
            var colors = el.attr("data-colors") ? JSON.parse(el.attr("data-colors")) : null;
            var group = el.attr("data-group") ? JSON.parse(el.attr("data-group")) : null;
            var width_padding = group ? _(group).select(function(q) {
                    return q === "right";
                }).length : values.length;
            var format = that[el.attr("data-format")] ? that[el.attr("data-format")].bind(that) : function(thing) {
                    return thing;
                };
            var type = el.attr("data-type");
            var max = el.attr("data-max") ? parseInt(el.attr("data-max"), 10) : _.max(values);
            var markup = window.JST["bar_chart_" + type]({
                labels: labels,
                values: values,
                max: max,
                width: (el.width() - that.PADDING * width_padding) / values.length,
                format: format,
                colors: colors,
                group: group
            });
            el.append(markup);
        });
    },
    percent: function(thing) {
        return "" + thing + "%";
    },
    dollars: function(thing) {
        return "$" + thing.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "\$1,");
    },
    abbrevDollars: function(thing) {
        return "$" + this.abbreviation(thing);
    },
    comma: function(thing) {
        return thing.toString().replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,");
    },
    abbreviation: function(thing) {
        var newValue = thing;
        if (thing >= 1000) {
            var suffixes = ["", "K", "M", "B", "T"];
            var suffixNum = Math.floor(("" + thing).length / 3);
            var shortValue = '';
            for (var precision = 2; precision >= 1; precision--) {
                shortValue = parseFloat((suffixNum !== 0 ? (thing / Math.pow(1000, suffixNum)) : thing).toFixed(precision));
                var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
                if (dotLessShortValue.length <= 2) {
                    break;
                }
            }
            if (shortValue % 1 !== 0) shortNum = shortValue.toFixed(1);
            newValue = shortValue + suffixes[suffixNum];
        }
        return newValue;
    }
});
propublica.views.articleCollectionTabs = propublica.View.extend({
    id: "group-nav",
    tag: "ul",
    init: function() {
        this._super();
        _.bindAll(this, "highlight");
    },
    render: function() {
        var links = $.makeArray(this.el.find("a"));
        this.highlight(_.detect(links, function(link) {
            return $(link).attr("href").indexOf(window.location.pathname) > 0;
        }));
    },
    highlight: function(link) {
        if (!link) return;
        $(link).parent().addClass(this.toggleClass);
        $(link).parent().prev().addClass("shd-btm");
        $(link).parent().next().addClass("shd-top");
        $(link).click(function(e) {
            e.preventDefault();
        });
    }
});
propublica.views.articleSlideShow = propublica.View.extend({
    cssClass: "slides",
    render: function() {
        var that = this;
        _.bindAll(this, "page", "updateNumber");
        this.el.each(function() {
            this.slides = $(this).children(".item");
            this.pager = $(this).children(".slide-pager");
            this.player = $(this).children(".audio-player");
            this.labels = this.pager.find(".labels");
            this.audioPlayer = $(this).find(".audio-player");
            this.currentSlide = this.slides.filter(that.toggleClass).is("*") ? this.slides.filter(that.toggleClass) : this.slides.first().addClass(that.toggleClass);
            var el = this;
            this.pager.find(".prev").click(function(e) {
                e.preventDefault();
                that.page(-1, el);
            });
            this.pager.find(".next").click(function(e) {
                e.preventDefault();
                that.page(1, el);
            });
            that.updateNumber(this);
            that.renderAudioPlayer(this);
        });
    },
    renderAudioPlayer: function(el) {
        var mp3 = el.audioPlayer.find(".mp3");
        if (mp3.is("*")) {
            var divPlayer = propublica.utils.begat("div", {
                "class": "player"
            });
            mp3.hide().before(divPlayer);
            divPlayer.flashembed({
                src: "https://www.propublica.org/projects/niftyplayer.swf?file=" + mp3.attr("href") + "&as=0",
                onFail: function() {
                    divPlayer.remove();
                    mp3.show();
                    return "";
                }
            });
            divPlayer.children().attr({
                width: 165,
                height: 37
            });
        }
    },
    page: function(direction, el) {
        el.slides.removeClass(this.toggleClass);
        el.currentSlide = direction > 0 ? el.currentSlide.next(".item") : el.currentSlide.prev(".item");
        if (!el.currentSlide.is("*"))
            el.currentSlide = direction > 0 ? el.slides.first() : el.slides.last();
        el.currentSlide.addClass(this.toggleClass);
        this.updateNumber(el);
    },
    updateNumber: function(el) {
        var index = el.slides.index(el.currentSlide) + 1;
        el.labels.text(index + " of " + el.slides.length);
    }
});
propublica.views.paywall = propublica.View.extend({
    tag: 'body',
    cssClass: 'article-page',
    THRESHOLDS: [10],
    LIMIT: 60 * 60 * 24 * 14 * 1000,
    init: function() {
        this._super();
        this.cookie = propublica.app.trackingCookie;
    },
    render: function() {
        if (!this.shouldPop()) return;
        this.track('popup', 'show', 'shown');
        this.pop();
        this.popped();
    },
    shouldPop: function() {
        if (window.location.href.indexOf('pop_please') > -1) return true;
        var that = this;
        var anyMatches = _.select(this.THRESHOLDS, function(it) {
            return (it === that.cookie.get('pageCount'));
        });
        return anyMatches.length > 0;
    },
    pop: function() {
        var popper = this.popper = propublica.utils.begat('div', {
            'id': 'mist'
        });
        popper.html(window.JST.popper);
        this.el.prepend(popper);
        popper.find('.dismiss').on('click', function(e) {
            e.preventDefault();
            popper.remove();
        });
    },
    popped: function() {
        this.cookie.setPopped(_.last(this.THRESHOLDS) === this.cookie.get('pageCount'));
    }
});
(function($) {
    _.extend(propublica.app, {
        VERSION: '0.3.3',
        live: [],
        held: [],
        initialize: function() {
            if (window.pp_initialized) return false;

            function render(ctor, name) {
                var view = new ctor();
                if (view.query().string.length > 0)
                    view.el.triggerHandler('_render') ? this.live.push(name) : this.held.push(name);
            }
            _.each(propublica.views, _.bind(render, this));
            return window.pp_initialized = true;
        }
    });
    $(function() {
        propublica.app.initialize();
    });
})(jQuery);
(function() {
    window.JST = window.JST || {};
    window.JST['bar_chart_horizontal'] = _.template('<div class="horizontal">\n  <% _.each(values, function(value, i){ %>\n    <div class="bar">\n      <span class="label"><%= (labels[i] || "") %></span>\n      <div class="outer-bar">\n        <div class="inner-bar" style="width: <%= (value / max) * 90 %>%;<% if (colors) { %>background-color:<%= colors[i] %>;<% } %>"></div>\n        <span class="value"><%= format(("" + value).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")) %></span>\n      </div>\n    </div>\n  <% }); %>\n</div>');
    window.JST['bar_chart_vertical'] = _.template('<div class="vertical">\n  <% _.each(values, function(value, i){ %>\n    <div class="bar" style="width: <%= width %>px;<% if (group && (group[i] === \'right\' || group[i] === \'center\')) { %>margin-right:0;<% } %><% if (group && (group[i] === \'left\' || group[i] === \'center\')) { %>margin-left:0;<% } %>">\n      <div class="outer-bar">\n        <div class="inner-bar" style="height: <%= (value / max) * 90 %>%;<% if (colors) { %>background-color:<%= colors[i] %>;<% } %>"><span class="value"><%= format(("" + value).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")) %></span></div>\n      </div>\n      <span class="label" <% if (labels[i] && group && group[i] === \'right\') { %>style="width:200%;"<% } %>><%= (labels[i] || "") %></span>\n    </div>\n  <% }); %>\n</div>');
    window.JST['get_updates_flyup'] = _.template('<div class="updates-module module">\n    <div class="module-top module-content">\n        <h3>Get Updates</h3>\n    </div>\n    <div class="module-btm module-content">\n        <form  method="get" action="https://org2.democracyinaction.org/dia/api/process.jsp">\n          <input type="hidden" name="table" value="supporter">\n          <input type="hidden" name="key" value="0">\n          <input type="hidden" name="required" value="Email">\n          <input type="hidden" name="link" value="groups">\n          <input type="hidden" name="linkKey" value="90412">\n          <input type="hidden" name="redirect" value="https://www.propublica.org/about/thank-you"> \n          <input type="hidden" name="Receive_Email" value="3">  \n          <input type="hidden" name="organization_KEY" value="6253">\n          <input type="hidden" name="email_trigger_KEYS" value="8405">\n            <p>Stay on top of what ProPublica\'s working on by subscribing to our e-mail digest.</p>\n            <div class="form-row text-row">\n                <label for="Email">e-mail</label><input title="Email" type="text" id="f11" name="Email" value="" class="text-input">\n            </div>\n            <div class="form-row text-row">\n                <label for="Zip">zip code</label>\n                <input title="Zip Code" type="text" id="f32" name="Zip" value="" maxlength="10" class="text-input">\n                <span>optional</span>\n            </div>\n            <div class="form-row buttons-row">\n                <input type="submit" value="Subscribe" class="btn-input">\n            </div>\n        </form>\n    </div>\n</div>\n');
    window.JST['popper'] = _.template('<div class="wrapper">\n  <div class="modal donate">\n    <a href="#" title="close" class="dismiss">close</a>\n    <header>\n       <h1><a href="/"><img src="https://www.propublica.org/images/donate/logo-banner-24-black-text.png"></a></h1>\n    </header>\n    <h1>Readers Power ProPublica</h1>\n    <h2>\n\n\n<img src="https://d1t8xfi7n2gbr1.cloudfront.net/deploy/images/common/icn-donate-gift-box.png" style="float:left; padding-right:10px">\n    A community of generous supporters keeps our investigative newsroom strong.\n<br><br>\nMake a tax-deductible gift to power ProPublica in 2016.\n\n</h2>\n    <form action="https://www.propublica.org/site/donate3/">\n      <fieldset class="info-block your-info">\n         <h1>Your Information</h1>\n         <label for="donate-first-name">First Name</label>\n            <input type="text" name="first_name" value="" id="donate-first-name">\n         <label for="donate-last-name">Last Name</label>\n            <input type="text" name="last_name" value="" id="donate-last-name">\n      </fieldset>\n      <fieldset class="gift">\n         <h1>Gift Amount</h1>\n            <span><input type="radio" name="amount" value="100" id="amount100" class="non_recurring_radio" checked="checked"> <label for="amount100">$100</label></span>\n            <span><input type="radio" name="amount" value="35" id="amount25" class="non_recurring_radio"> <label for="amount35">$35</label></span>\n            <span><input type="radio" name="amount" value="50" id="amount50" class="non_recurring_radio"> <label for="amount50">$50</label></span>\n            <span><input type="radio" name="amount" value="500" id="amount500" class="non_recurring_radio"> <label for="amount500">$500</label></span>\n            <span><input type="radio" name="amount" value="1000" id="amount1000" class="non_recurring_radio"> <label for="amount1000">$1000</label></span>\n            <span class="other-amount"><input type="radio" name="amount" value="" id="custom_amount" class="non_recurring_radio"> <label for="custom_amount">$</label><input type="text" name="c_amount" id="other-value" /></span>\n      </fieldset>\n      <section class="submit">\n         <input name="submit" type="submit" value="NEXT Â»" />\n      </section>\n    </form>\n  </div>\n</div>\n');
})();