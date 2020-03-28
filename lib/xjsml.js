const fs = require('fs');
module.exports = class xjsml {
    constructor(params) {
        this.registeredTags = require('./tags');
        this.registeredModifiers = require('./modifiers');
        this.globals = {};

        this.parse = function (template) {
            let linenum = 1;

            var html = {
                action: 'html',
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
                        var tag = this.parseTag(currentstring.substring(0, currentstring.length - closetag.length), linenum);
                        currenttag.children.push(tag);
                        linenum += currentstring.split('\n').length - 1;
                        tagarray.pop();
                        currenttag = tagarray[tagarray.length - 1];
                        currenttag.children.push(this.parseTag(closetag, linenum));
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
                        var tag = this.parseTag(currentstring, linenum);
                        currenttag.children.push(tag);
                        currentstring = '';
                        return;
                    }
                    return;
                }
                if (c == '<') {
                    if (currentstring != '') {
                        currenttag.children.push(this.parseTag(currentstring, linenum));
                        linenum += currentstring.split('\n').length - 1;
                    }
                    currentstring = '';
                    currentstring += c;
                } else if (c == '>') {
                    currentstring += c;
                    var tag = this.parseTag(currentstring, linenum);
                    linenum += currentstring.split('\n').length - 1;
                    if (tag.action == 'closetag') {
                        if (currenttag.action != 'opentag' || currenttag.tag != tag.tag) {
                            throw new Error(`Unclosed tag ${currenttag.tag} on line ${currenttag.line}`);
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
                }
            });

            return html;
        }

        this.parseTag = function (s, linenum) {
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
                if (tagstrings[0] == '!--' && tagstrings[tagstrings.length - 1] == '--') {
                    return {
                        action: 'write',
                        content: s,
                        line: linenum
                    };
                }
                if (tagstrings[0] != '/' && tagstrings[tagstrings.length - 1] != '/') {
                    if (tagstrings[0].toLowerCase() == '!doctype') {
                        return {
                            action: 'selfclosetag',
                            tag: tagstrings[0],
                            args: this.parseArgs(tagstrings.slice(1, tagstrings.length - 1), linenum),
                            line: linenum,
                            children: []
                        };
                    } else {
                        return {
                            action: 'opentag',
                            tag: tagstrings[0],
                            args: this.parseArgs(tagstrings.slice(1), linenum),
                            line: linenum,
                            children: []
                        };
                    }
                }
                if (tagstrings[tagstrings.length - 1] == '/') {
                    return {
                        action: 'selfclosetag',
                        tag: tagstrings[0],
                        args: this.parseArgs(tagstrings.slice(1, tagstrings.length - 1), linenum),
                        line: linenum,
                        children: []
                    };
                }
                if (tagstrings[0] == '/') {
                    if (tagstrings.length == 2) {
                        return {
                            action: 'closetag',
                            tag: tagstrings[1],
                            line: linenum
                        };
                    }
                }
            } else {
                return {
                    action: 'write',
                    content: s,
                    line: linenum
                };
            }
        }

        this.parseArgs = function (args, linenum) {
            var parsed = {
                args: []
            };
            var currentarg = null;
            var isequal = false;
            var currentmodifier = null;
            for (var i = 0; i < args.length; i++) {
                if (args[i] == '=') {
                    if (isequal || i == 0 || i == args.length - 1) {
                        throw new Error(`Mismatching '=' on line ${linenum}`);
                    }
                    isequal = true;
                } else {
                    if (isequal) {
                        isequal = false;
                        if (currentarg == null) {
                            throw new Error(`Mismatching '=' on line ${linenum}`);
                        }
                        if (currentmodifier != null) {
                            currentmodifier.value = args[i];
                            currentmodifier = null;
                        } else {
                            currentarg.name = currentarg.value;
                            currentarg.value = args[i];
                        }
                    } else {
                        if (this.registeredModifiers.hasOwnProperty(args[i])) {
                            if (currentarg == null) {
                                throw new Error(`A modifier '${args[i]}' with no corresponding value on line ${linenum}`);
                            }
                            currentmodifier = {
                                name: args[i],
                                value: null
                            };
                            currentarg.modifiers.push(currentmodifier);
                        } else {
                            currentarg = {
                                name: parsed.args.length,
                                value: args[i],
                                modifiers: [],
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

        this.renderTag = function (tag, args) {
            var tagstr = '';
            if (Array.isArray(tag)) {
                tag.forEach(child => {
                    tagstr += this.renderTag(child, args);
                });
                return tagstr;
            }
            if (tag.action == 'html') {
                tagstr += this.renderTag(tag.children, args);
                return tagstr;
            }
            if (tag.action == 'write') {
                tagstr += tag.content;
            }
            if (tag.action == 'opentag' || tag.action == 'selfclosetag') {
                if (this.registeredTags.hasOwnProperty(tag.tag)) {
                    tagstr += this.registeredTags[tag.tag].call(this, tag, args);
                } else {
                    if (tag.action == 'opentag') {
                        tagstr += `<${tag.tag}${this.renderAttributes(tag, args)}>`;
                        tagstr += this.renderTag(tag.children, args);
                    }
                    if (tag.action == 'selfclosetag') {
                        tagstr += `<${tag.tag}${this.renderAttributes(tag, args)} />`;
                    }
                }
            }
            if (tag.action == 'closetag') {
                if (!this.registeredTags.hasOwnProperty(tag.tag)) {
                    tagstr += `</${tag.tag}>`;
                }
            }
            return tagstr;
        }

        this.attrValue = function (attr, values) {
            var value = "";
            try {
                var func = new Function(...Object.keys(values), `return ${attr.value}`);
                value = func.call(values, ...Object.values(values));
            } catch (error) {
                if (error instanceof ReferenceError) {
                    if (attr.modifiers.filter(mod => mod.name == 'default').length > 0) {
                        value = undefined;
                    } else {
                        throw new Error(`cannot parse argument ${attr.name} on line ${attr.line}: ${error}`);
                    }
                } else {
                    throw new Error(`cannot parse argument ${attr.name} on line ${attr.line}: ${error}`);
                }
            }
            attr.modifiers.forEach(mod => {
                var modvalue = null;
                if (mod.value != null) {
                    try {
                        var modfunc = new Function(...Object.keys(values), `return ${mod.value}`);
                        modvalue = modfunc.call(values, ...Object.values(values));
                    } catch {
                        throw new Error(`Cannot parse modifier ${mod.name} parameter on line ${attr.line}: ${error}`);
                    }
                }
                value = this.registeredModifiers[mod.name].call(values, value, modvalue);
            });
            return value;
        }

        this.renderAttributes = function (tag, args) {
            var attr = "";
            tag.args.args.forEach(arg => {
                var value = this.attrValue(arg, args);
                if (value != undefined)
                    attr += ` ${arg.name}="${value}"`;
            });
            return attr;
        }

        this.renderFile = function (filename, args, cb) {
            var template = fs.readFileSync(filename, "utf8").toString();
            console.log(template);
            console.log(this);
            var parsed = this.parse(template);
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
                var template = fs.readFileSync(filename, "utf8").toString();
                try {
                    var parsed = engine.parse(template);
                    var rendered = engine.renderTag(parsed, localvars);
                } catch (error) {
                    return cb(error);
                }
                return cb(null, rendered);
            }
        }

    }
}
