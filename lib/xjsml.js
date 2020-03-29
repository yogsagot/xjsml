const fs = require('fs');
module.exports = class xjsml {
    constructor(params) {

        if (!params) {
            params = {};
        }

        this.caseSensitive = params.hasOwnProperty("caseSensitive") ? params.caseSensitive : true;
        this.cacheEnabled = params.hasOwnProperty("cacheEnabled") ? params.cacheEnabled : true;
        this.cache = {};
        this.globals = params.hasOwnProperty("globals") ? params.globals : {};
        this.fileLoader = params.hasOwnProperty("fileLoader") ? params.fileLoader : function(filename)  {
            return fs.readFileSync(filename, "utf8").toString()
        }
        this.javascriptTagAllowed = params.hasOwnProperty("javascriptTagAllowed") ? params.javascriptTagAllowed : false;
        this.callbacksAllowed = params.hasOwnProperty("callbacksAllowed") ? params.callbacksAllowed : false;

        this.registeredTags = require('./tags');
        this.registeredModifiers = require('./modifiers');
        this.registeredCallbacks = {};

        this.registerTag = function(name, cb) {
            if (this.registeredTags.hasOwnProperty(name))
                throw new Error(`Cannot register tag "${name}", already registered`);
            this.registeredTags[name] = cb;
        }

        this.registerModifier = function(name, cb) {
            if (this.registeredModifiers.hasOwnProperty(name))
                throw new Error(`Cannot register modifier "${name}", already registered`);
            this.registeredModifiers[name] = cb;
        }

        this.registerCallback = function(name, cb) {
            if (this.registeredCallbacks.hasOwnProperty(name))
                throw new Error(`Cannot register callback "${name}", already registered`);
            this.registeredCallbacks[name] = cb;
        }

        this.parse = function (template, filename="") {
            if (this.cacheEnabled && this.cache[filename])
                return this.cache[filename];

            let linenum = 1;

            var html = {
                action: 'html',
                filename: filename,
                children: []
            };

            var currenttag = html;
            var tagarray = [html];
            var currentstring = '';
            var isscript = false;
            var isstyle = false;
            var isjavascript = false;
            var isjs = false;
            var iscomment = false;
            var isdoctype = false;

            [...template].forEach(c => {
                if (isscript || isstyle || isjs || isjavascript) {
                    currentstring += c;
                    var closetag = '';
                    if (isscript)
                        closetag = '</script>';
                    if (isstyle)
                        closetag = '</style>';
                    if (isjs)
                        closetag = '</js>';
                    if (isjavascript)
                        closetag = '</javascript>';
                    if (currentstring.substring(currentstring.length - closetag.length) == closetag) {
                        isscript = false;
                        isstyle = false;
                        isjs = false;
                        isjavascript = false;
                        var tag = this.parseTag(currentstring.substring(0, currentstring.length - closetag.length), filename, linenum);
                        currenttag.children.push(tag);
                        linenum += currentstring.split('\n').length - 1;
                        tagarray.pop();
                        currenttag = tagarray[tagarray.length - 1];
                        currenttag.children.push(this.parseTag(closetag, filename, linenum));
                        currentstring = '';
                        return;
                    }
                    return;
                }
                if (iscomment) {
                    currentstring += c;
                    closetag = '-->';
                    if (currentstring.substring(currentstring.length - closetag.length) == closetag) {
                        iscomment = false;
                        var tag = this.parseTag(currentstring, filename, linenum);
                        currenttag.children.push(tag);
                        currentstring = '';
                        return;
                    }
                    return;
                }
                if (isdoctype) {
                    currentstring += c;
                    closetag = '>';
                    if (currentstring.substring(currentstring.length - closetag.length) == closetag) {
                        isdoctype = false;
                        var tag = this.parseTag(currentstring, filename, linenum);
                        currenttag.children.push(tag);
                        currentstring = '';
                        return;
                    }
                    return;
                }
                if (c == '<') {
                    if (currentstring != '') {
                        currenttag.children.push(this.parseTag(currentstring, filename, linenum));
                        linenum += currentstring.split('\n').length - 1;
                    }
                    currentstring = '';
                    currentstring += c;
                } else if (c == '>') {
                    currentstring += c;
                    var tag = this.parseTag(currentstring, filename, linenum);
                    linenum += currentstring.split('\n').length - 1;
                    if (tag.action == 'closetag') {
                        if (currenttag.action != 'opentag' || currenttag.tag != tag.tag) {
                            var e = new Error(`Unclosed tag ${currenttag.tag}`, currenttag.filename, currenttag.line);
                            e.fileName = currenttag.filename;
                            e.lineNumber = currenttag.line;
                            throw e;
                        }
                        tagarray.pop();
                        currenttag = tagarray[tagarray.length - 1];
                    }
                    currenttag.children.push(tag);
                    if (tag.action == 'opentag') {
                        currenttag = tag;
                        tagarray.push(tag);
                    }
                    currentstring = '';
                    if (tag.action == 'opentag' && tag.tag == 'script') {
                        isscript = true;
                    }
                    if (tag.action == 'opentag' && tag.tag == 'style') {
                        isstyle = true;
                    }
                    if (tag.action == 'opentag' && tag.tag == 'js') {
                        isjs = true;
                    }
                    if (tag.action == 'opentag' && tag.tag == 'javascript') {
                        isjavascript = true;
                    }
                } else {
                    currentstring += c;
                    if (currentstring == '<!--') {
                        iscomment = true;
                    }
                    if (currentstring.toLowerCase() == '<!doctype') {
                        isdoctype = true;
                    }
                }
            });

            if (this.cacheEnabled)
                this.cache[filename] = html;

            return html;
        }

        this.parseTag = function (s, filename, linenum) {
            if (s.substring(0, 4) =='<!--' && s.substring(s.length-3) == '-->') {
                return {
                    action: 'write',
                    content: s,
                    filename: filename,
                    line: linenum
                };
            }
            if (s.substring(0, 9).toLowerCase() =='<!doctype' && s.substring(s.length-1) == '>') {
                return {
                    action: 'write',
                    content: s,
                    filename: filename,
                    line: linenum
                };
            }
            if (s[0] == '<') {
                var tagstrings = [];
                var iscontent = false;
                var isquote = false;
                var isdoublequote = false;
                var isbacquote = false;
                var isbracket = 0;
                var issquarebracket = 0;
                var iscurlybracket = 0;
                var currentstring = '';

                [...s].forEach(c => {
                    if ((c == '<' || c == '>') && !iscontent) {
                        return;
                    }
                    if (c == '/' && !iscontent) {
                        if (currentstring != '') {
                            tagstrings.push(currentstring);
                            currentstring = '';
                            tagstrings.push(c);
                            return
                        } else {
                            tagstrings.push(c);
                            return
                        }
                    }
                    if (c == '=' && !iscontent) {
                        if (currentstring != '') {
                            tagstrings.push(currentstring);
                            currentstring = '';
                            tagstrings.push(c);
                            return
                        } else {
                            tagstrings.push(c);
                            return
                        }
                    }
                    if ((c == ' ' || c == '\t' || c == '\n' || c == '\r') && !iscontent) {
                        if (currentstring != '') {
                            tagstrings.push(currentstring);
                            currentstring = '';
                            return;
                        } else {
                            return;
                        }
                    }
                    if (c == "'") {
                        if (!iscontent && !isquote) {
                            if (currentstring != '') {
                                tagstrings.push(currentstring);
                                currentstring = '';
                            }
                            iscontent = true;
                            isquote = true;
                            currentstring += c;
                            return;
                        }
                        if (iscontent && isquote) {
                            if (currentstring[currentstring.length - 1] == "\\") {
                                currentstring += c;
                                return;
                            }
                            currentstring += c;
                            iscontent = false;
                            isquote = false;
                            tagstrings.push(currentstring);
                            currentstring = '';
                            return;
                        }
                        if (iscontent && !isquote) {
                            currentstring += c;
                            return;
                        }
                    }
                    if (c == '"') {
                        if (!iscontent && !isdoublequote) {
                            if (currentstring != '') {
                                tagstrings.push(currentstring);
                                currentstring = '';
                            }
                            iscontent = true;
                            isdoublequote = true;
                            currentstring += c;
                            return;
                        }
                        if (iscontent && isdoublequote) {
                            if (currentstring[currentstring.length - 1] == "\\") {
                                currentstring += c;
                                return;
                            }
                            currentstring += c;
                            iscontent = false;
                            isdoublequote = false;
                            tagstrings.push(currentstring);
                            currentstring = '';
                            return;
                        }
                        if (iscontent && !isdoublequote) {
                            currentstring += c;
                            return;
                        }
                    }
                    if (c == "`") {
                        if (!iscontent && !isbacquote) {
                            if (currentstring != '') {
                                tagstrings.push(currentstring);
                                currentstring = '';
                            }
                            iscontent = true;
                            isbacquote = true;
                            currentstring += c;
                            return;
                        }
                        if (iscontent && isbacquote) {
                            if (currentstring[currentstring.length - 1] == "\\") {
                                currentstring += c;
                                return;
                            }
                            currentstring += c;
                            iscontent = false;
                            tagstrings.push(currentstring);
                            currentstring = '';
                            return;
                        }
                        if (iscontent && !isbacquote) {
                            currentstring += c;
                            return;
                        }
                    }
                    if (c == "(") {
                        if (!iscontent || (iscontent && isbracket > 0)) {
                            if (currentstring != '' && isbracket == 0) {
                                tagstrings.push(currentstring);
                                currentstring = '';
                            }
                            iscontent = true;
                            isbracket += 1;
                            currentstring += c;
                            return;
                        }
                        if (iscontent && !isbracket) {
                            currentstring += c;
                            return;
                        }
                    }
                    if (c == ")") {
                        if (iscontent && isbracket > 0) {
                            currentstring += c;
                            isbracket -= 1;
                            if (isbracket == 0) {
                                iscontent = false;
                                tagstrings.push(currentstring);
                                currentstring = '';
                                return;
                            }
                            return;
                        }
                    }
                    if (c == "{") {
                        if (!iscontent || (iscontent && iscurlybracket > 0)) {
                            if (currentstring != '' && iscurlybracket == 0) {
                                tagstrings.push(currentstring);
                                currentstring = '';
                            }
                            iscontent = true;
                            iscurlybracket += 1;
                            currentstring += c;
                            return;
                        }
                        if (iscontent && !iscurlybracket) {
                            currentstring += c;
                            return;
                        }
                    }
                    if (c == "}") {
                        if (iscontent && iscurlybracket > 0) {
                            iscurlybracket -= 1;
                            currentstring += c;
                            if (iscurlybracket == 0) {
                                iscontent = false;
                                tagstrings.push(currentstring);
                                currentstring = '';
                                return;
                            }
                            return;
                        }
                    }
                    if (c == "[") {
                        if (!iscontent || (iscontent && issquarebracket > 0)) {
                            if (currentstring != '' && issquarebracket == 0) {
                                tagstrings.push(currentstring);
                                currentstring = '';
                            }
                            iscontent = true;
                            issquarebracket += 1;
                            currentstring += c;
                            return;
                        }
                        if (iscontent && !issquarebracket) {
                            currentstring += c;
                            return;
                        }
                    }
                    if (c == "]") {
                        if (iscontent && issquarebracket > 0) {
                            issquarebracket -= 1;
                            currentstring += c;
                            if (issquarebracket == 0) {
                                iscontent = false;
                                tagstrings.push(currentstring);
                                currentstring = '';
                                return;
                            }
                            return;
                        }
                    }
                    currentstring += c;
                });
                if (currentstring != '')
                    tagstrings.push(currentstring);
                if (tagstrings[0] != '/' && tagstrings[tagstrings.length - 1] != '/') {
                    return {
                        action: 'opentag',
                        tag: tagstrings[0],
                        args: this.parseArgs(tagstrings.slice(1), filename, linenum),
                        filename: filename,
                        line: linenum,
                        children: []
                    };
                }
                if (tagstrings[tagstrings.length - 1] == '/') {
                    return {
                        action: 'selfclosetag',
                        tag: tagstrings[0],
                        args: this.parseArgs(tagstrings.slice(1, tagstrings.length - 1), filename, linenum),
                        filename: filename,
                        line: linenum,
                        children: []
                    };
                }
                if (tagstrings[0] == '/') {
                    if (tagstrings.length == 2) {
                        return {
                            action: 'closetag',
                            tag: tagstrings[1],
                            filename: filename,
                            line: linenum
                        };
                    }
                }
            } else {
                return {
                    action: 'write',
                    content: s,
                    filename: filename,
                    line: linenum
                };
            }
        }

        this.parseArgs = function (args, filename, linenum) {
            var parsed = {
                args: []
            };
            var currentarg = null;
            var isequal = false;
            var currentmodifier = null;
            for (var i = 0; i < args.length; i++) {
                if (args[i] == '=') {
                    if (isequal || i == 0 || i == args.length - 1) {
                        var e = new Error(`Mismatching '=' on line ${linenum}`, filename, linenum);
                        e.fileName = filename;
                        e.lineNumber = linenum;
                        throw e;
                    }
                    isequal = true;
                } else {
                    if (isequal) {
                        isequal = false;
                        if (currentarg == null) {
                            var e = new Error(`Mismatching '=' on line ${linenum}`, filename, linenum);
                            e.fileName = filename;
                            e.lineNumber = linenum;
                            throw e;
                        }
                        if (currentmodifier != null) {
                            currentmodifier.value = args[i];
                            currentmodifier = null;
                        } else {
                            var value = args[i];
                            var stringvalue = undefined;
                            if ((value[0] == '"' && value[value.length-1] == '"')
                                || (value[0] == "'" && value[value.length-1] == "'")) {
                                    stringvalue = value.substring(1, value.length-1);
                            }
                            currentarg.name = currentarg.value;
                            currentarg.value = value;
                            currentarg.stringvalue = stringvalue;
                        }
                    } else {
                        var attrname = this.caseSensitive ? args[i] : args[i].toLowerCase();
                        if (this.registeredModifiers.hasOwnProperty(attrname)) {
                            if (currentarg == null) {
                                var e = new Error(`A modifier '${args[i]}' with no corresponding value`, filename, linenum);
                                e.fileName = filename;
                                e.lineNumber = linenum;
                                throw e;
                            }
                            currentmodifier = {
                                name: attrname,
                                value: null
                            };
                            currentarg.modifiers.push(currentmodifier);
                        } else {
                            currentarg = {
                                name: parsed.args.length,
                                value: args[i],
                                stringvalue: undefined,
                                modifiers: [],
                                filename: filename,
                                line: linenum
                            };
                            parsed[args[i]] = currentarg;
                            parsed.args.push(currentarg);
                            currentmodifier = null;
                        }
                    }
                }
            }
            return parsed;
        }

        this.renderTag = function (tag, args, context = {}) {
            var tagstr = '';
            if (Array.isArray(tag)) {
                tag.forEach(child => {
                    tagstr += this.renderTag(child, args, context);
                });
                return tagstr;
            }
            if (tag.action == 'html') {
                tagstr += this.renderTag(tag.children, args, context);
                return tagstr;
            }
            if (tag.action == 'write') {
                tagstr += tag.content;
            }
            if (tag.action == 'opentag' || tag.action == 'selfclosetag') {
                var tagname = this.caseSensitive ? tag.tag : tag.tag.toLowerCase();
                if (this.registeredTags.hasOwnProperty(tagname)) {
                    tagstr += this.registeredTags[tagname].call(this, tag, args, context);
                } else if (context != null && context.hasOwnProperty('registered') && context.registered.hasOwnProperty(tag.tag)) {
                    tagstr += this.registeredTags.registered.call(this, tag, args, context);
                } else {
                    if (tag.action == 'opentag') {
                        tagstr += `<${tag.tag}${this.renderAttributes(tag, args)}>`;
                        tagstr += this.renderTag(tag.children, args, context);
                    }
                    if (tag.action == 'selfclosetag') {
                        tagstr += `<${tag.tag}${this.renderAttributes(tag, args)} />`;
                    }
                }
            }
            if (tag.action == 'closetag') {
                var tagname = this.caseSensitive ? tag.tag : tag.tag.toLowerCase();
                if (!this.registeredTags.hasOwnProperty(tagname)) {
                    tagstr += `</${tag.tag}>`;
                }
            }
            return tagstr;
        }

        this.attrValue = function (attr, values) {
            var value = "";
            if (attr.stringvalue != undefined) {
                value = attr.stringvalue;
            } else {
                try {
                    var func = new Function(...Object.keys(values), `return ${attr.value}`);
                    value = func.call(attr, ...Object.values(values));
                } catch (error) {
                    if (error instanceof ReferenceError) {
                        if (attr.modifiers.filter(mod => mod.name == 'default').length > 0) {
                            value = undefined;
                        } else {
                            var e = new Error(`cannot parse argument ${attr.name}: ${error}`, attr.filename, attr.line);
                            e.fileName = attr.filename;
                            e.lineNumber = attr.line;
                            throw e;
                        }
                    } else {
                        var e = new Error(`cannot parse argument ${attr.name}: ${error}`, attr.filename, attr.line);
                        e.fileName = attr.filename;
                        e.lineNumber = attr.line;
                        throw e;
                    }
                }
            }
            attr.modifiers.forEach(mod => {
                var modvalue = null;
                if (mod.value != null) {
                    try {
                        var modfunc = new Function(...Object.keys(values), `return ${mod.value}`);
                        modvalue = modfunc.call(attr, ...Object.values(values));
                    } catch(error) {
                        var e = new Error(`Cannot parse modifier ${mod.name} in parameter ${attr.name}: ${error}`, attr.filename, attr.line);
                        e.fileName = attr.filename;
                        e.lineNumber = attr.line;
                        throw e;
                    }
                }
                value = this.registeredModifiers[this.caseSensitive ? mod.name : mod.name.toLowerCase()].call(attr, value, modvalue);
            });
            return value;
        }

        this.renderAttributes = function (tag, args) {
            var attr = "";
            tag.args.args.forEach(arg => {
                if (arg.value.substring(0, 3) == '...') {
                    var paramobj = {}
                    try {
                        var paramfunc = new Function(...Object.keys(args), `return ${arg.value.substring(3)}`);
                        paramobj = paramfunc.call(args, ...Object.values(args));
                        if (!(typeof paramobj === 'object' && paramobj.constructor === Object)) {
                            throw new Error('not an object');
                        }
                    } catch(error) {
                        var e = new Error(`Cannot parse argument ${arg.value} in tag ${tag.tag}: ${error}`, arg.filename, arg.line);
                        e.fileName = arg.filename;
                        e.lineNumber = arg.line;
                        throw e;
                    }
                    for (let [key, item] of Object.entries(paramobj)) {
                        attr += ` ${key}="${item}"`;
                    }
                } else {
                    var value = this.attrValue(arg, args);
                    if (value != undefined)
                        attr += ` ${arg.name}="${value}"`;
                }
            });
            return attr;
        }

        this.renderFile = function (filename, args) {
            var parsed = {};
            if (this.cacheEnabled && this.cache[filename]) {
                parsed = this.cache[filename];
            } else {
                var template = this.fileLoader.call(this, filename);
                parsed = this.parse(template, filename);
            }
            var localvars = {
                ...args,
                ...this.globals
            }
            return this.renderTag(parsed, localvars);
        }

        this.express = function () {
            let engine = this;
            return function (filename, args, cb) {
                var localvars = {
                    ...args,
                    ...engine.globals
                }
                try {
                    var parsed = {};
                    if (engine.cacheEnabled && engine.cache[filename]) {
                        parsed = engine.cache[filename];
                    } else {
                        var template = engine.fileLoader.call(engine, filename);
                        parsed = engine.parse(template, filename);
                    }
                    var rendered = engine.renderTag(parsed, localvars);
                } catch (error) {
                    return cb(error);
                }
                return cb(null, rendered);
            }
        }

    }
}
