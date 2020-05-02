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

            var istag = false;
            var currenttag = html;
            var tagarray = [html];
            var currentstring = '';
            var isscript = false;
            var isstyle = false;
            var isjavascript = false;
            var isjs = false;
            var iscomment = false;
            var ishtmlcomment = false;
            var isdoctype = false;

            var vars = {
                tagstrings : [],
                iscontent : false,
                isquote : false,
                isdoublequote : false,
                isbacquote : false,
                isbracket : 0,
                issquarebracket : 0,
                iscurlybracket : 0,
                currentstring : ''
            };

            var tagkeys = Object.keys(this.registeredTags);
            tagkeys.push('else');
            tagkeys.push('elseif');

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

                    if (!istag) {
                        tagkeys.forEach(tagname => {
                            if (currentstring.substring(currentstring.length-tagname.length-1) == `<${tagname}`) {
                                istag = true;
                                var tag = this.parseTag(currentstring.substring(0, currentstring.length-tagname.length-1)
                                    , filename, linenum);
                                currenttag.children.push(tag);
                                linenum += currentstring.split('\n').length - 1;
                                currentstring = currentstring.substring(currentstring.length-tagname.length-1);

                                vars = {
                                    tagstrings : [],
                                    iscontent : false,
                                    isquote : false,
                                    isdoublequote : false,
                                    isbacquote : false,
                                    isbracket : 0,
                                    issquarebracket : 0,
                                    iscurlybracket : 0,
                                    currentstring : ''
                                };
                            }
                            if (currentstring.substring(currentstring.length-tagname.length-2) == `</${tagname}`) {
                                istag = true;
                                var tag = this.parseTag(currentstring.substring(0, currentstring.length-tagname.length-2)
                                    , filename, linenum);
                                currenttag.children.push(tag);
                                linenum += currentstring.split('\n').length - 1;
                                currentstring = currentstring.substring(currentstring.length-tagname.length-2);

                                vars = {
                                    tagstrings : [],
                                    iscontent : false,
                                    isquote : false,
                                    isdoublequote : false,
                                    isbacquote : false,
                                    isbracket : 0,
                                    issquarebracket : 0,
                                    iscurlybracket : 0,
                                    currentstring : ''
                                };
                            }
                        });
                    } else {
                        this.argString(c, vars);
                        if (c == '>') {
                            if (vars.iscontent) {
                                return;
                            }
                            var tag = this.parseTag(currentstring, filename, linenum);
                            linenum += currentstring.split('\n').length - 1;
                            istag = false;
                            if (tag.action == 'closetag') {
                                if (currenttag.action != 'opentag' || currenttag.tag != tag.tag) {
                                    this.error(currenttag, `Unclosed tag ${currenttag.tag}`);
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
                        }


                    }

                    return;
                }
                if (iscomment) {
                    currentstring += c;
                    closetag = '</comment>';
                    if (currentstring.substring(0, 2) == '<*')
                        closetag = '</*>';
                    if (currentstring.substring(currentstring.length - closetag.length) == closetag) {
                        iscomment = false;
                        istag = false;
                        currentstring = '';
                        return;
                    }
                    return;

                }
                if (ishtmlcomment) {
                    currentstring += c;
                    closetag = '-->';
                    if (currentstring.substring(currentstring.length - closetag.length) == closetag) {
                        ishtmlcomment = false;
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
                this.argString(c, vars);
                if (c == '<') {
                    if (!vars.iscontent) {
                        if (istag && tag != null && tag != undefined && tag.action != 'html') {
                            this.error(currenttag, `Unexpected "<" in tag ${currenttag.tag}`);
                        }
                        if (currentstring != '') {
                            currenttag.children.push(this.parseTag(currentstring, filename, linenum));
                            linenum += currentstring.split('\n').length - 1;
                        }
                        currentstring = '';
                        istag = true;
                        vars = {
                            tagstrings : [],
                            iscontent : false,
                            isquote : false,
                            isdoublequote : false,
                            isbacquote : false,
                            isbracket : 0,
                            issquarebracket : 0,
                            iscurlybracket : 0,
                            currentstring : ''
                        };
                    }
                    currentstring += c;
                } else if (c == '>') {
                    currentstring += c;
                    if (vars.iscontent) {
                        return;
                    }
                    var tag = this.parseTag(currentstring, filename, linenum);
                    istag = false;
                    linenum += currentstring.split('\n').length - 1;
                    if (tag.action == 'closetag') {
                        if (currenttag.action != 'opentag' || currenttag.tag != tag.tag) {
                            this.error(currenttag, `Unclosed tag ${currenttag.tag}`);
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
                        ishtmlcomment = true;
                    }
                    if (currentstring.toLowerCase() == '<!doctype') {
                        isdoctype = true;
                    }
                    if (currentstring.toLowerCase() == '<comment' || currentstring.toLowerCase() == '<*') {
                        iscomment = true;
                    }
                }
            });


            if (currentstring != '') {
                currenttag.children.push(this.parseTag(currentstring, filename, linenum));
                linenum += currentstring.split('\n').length - 1;
            }

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
                var vars = {
                    tagstrings : [],
                    iscontent : false,
                    isquote : false,
                    isdoublequote : false,
                    isbacquote : false,
                    isbracket : 0,
                    issquarebracket : 0,
                    iscurlybracket : 0,
                    currentstring : ''
                };

                [...s].forEach(c => {
                    this.argString(c, vars)
                });
                if (vars.currentstring != '')
                    vars.tagstrings.push(vars.currentstring);
                if (vars.tagstrings[0] != '/' && vars.tagstrings[vars.tagstrings.length - 1] != '/') {
                    return {
                        action: 'opentag',
                        tag: vars.tagstrings[0],
                        args: this.parseArgs(vars.tagstrings.slice(1), filename, linenum),
                        filename: filename,
                        line: linenum,
                        children: []
                    };
                }
                if (vars.tagstrings[vars.tagstrings.length - 1] == '/') {
                    return {
                        action: 'selfclosetag',
                        tag: vars.tagstrings[0],
                        args: this.parseArgs(vars.tagstrings.slice(1, vars.tagstrings.length - 1), filename, linenum),
                        filename: filename,
                        line: linenum,
                        children: []
                    };
                }
                if (vars.tagstrings[0] == '/') {
                    if (vars.tagstrings.length == 2) {
                        return {
                            action: 'closetag',
                            tag: vars.tagstrings[1],
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

        this.argString = function(c, vars) {
            if ((c == '<' || c == '>') && !vars.iscontent) {
                return;
            }
            if (c == '/' && !vars.iscontent) {
                if (vars.currentstring != '') {
                    vars.tagstrings.push(vars.currentstring);
                    vars.currentstring = '';
                    vars.tagstrings.push(c);
                    return
                } else {
                    vars.tagstrings.push(c);
                    return
                }
            }
            if (c == '=' && !vars.iscontent) {
                if (vars.currentstring != '') {
                    vars.tagstrings.push(vars.currentstring);
                    vars.currentstring = '';
                    vars.tagstrings.push(c);
                    return
                } else {
                    vars.tagstrings.push(c);
                    return
                }
            }
            if ((c == ' ' || c == '\t' || c == '\n' || c == '\r') && !vars.iscontent) {
                if (vars.currentstring != '') {
                    vars.tagstrings.push(vars.currentstring);
                    vars.currentstring = '';
                    return;
                } else {
                    return;
                }
            }
            if (c == "'") {
                if (!vars.iscontent && !vars.isquote) {
                    if (vars.currentstring != '') {
                        vars.tagstrings.push(vars.currentstring);
                        vars.currentstring = '';
                    }
                    vars.iscontent = true;
                    vars.isquote = true;
                    vars.currentstring += c;
                    return;
                }
                if (vars.iscontent && vars.isquote) {
                    if (vars.currentstring[vars.currentstring.length - 1] == "\\") {
                        vars.currentstring += c;
                        return;
                    }
                    vars.currentstring += c;
                    vars.iscontent = false;
                    vars.isquote = false;
                    vars.tagstrings.push(vars.currentstring);
                    vars.currentstring = '';
                    return;
                }
                if (vars.iscontent && !vars.isquote) {
                    vars.currentstring += c;
                    return;
                }
            }
            if (c == '"') {
                if (!vars.iscontent && !vars.isdoublequote) {
                    if (vars.currentstring != '') {
                        vars.tagstrings.push(vars.currentstring);
                        vars.currentstring = '';
                    }
                    vars.iscontent = true;
                    vars.isdoublequote = true;
                    vars.currentstring += c;
                    return;
                }
                if (vars.iscontent && vars.isdoublequote) {
                    if (vars.currentstring[vars.currentstring.length - 1] == "\\") {
                        vars.currentstring += c;
                        return;
                    }
                    vars.currentstring += c;
                    vars.iscontent = false;
                    vars.isdoublequote = false;
                    vars.tagstrings.push(vars.currentstring);
                    vars.currentstring = '';
                    return;
                }
                if (vars.iscontent && !vars.isdoublequote) {
                    vars.currentstring += c;
                    return;
                }
            }
            if (c == "`") {
                if (!vars.iscontent && !vars.isbacquote) {
                    if (vars.currentstring != '') {
                        vars.tagstrings.push(vars.currentstring);
                        vars.currentstring = '';
                    }
                    vars.iscontent = true;
                    vars.isbacquote = true;
                    vars.currentstring += c;
                    return;
                }
                if (vars.iscontent && vars.isbacquote) {
                    if (vars.currentstring[vars.currentstring.length - 1] == "\\") {
                        vars.currentstring += c;
                        return;
                    }
                    vars.currentstring += c;
                    vars.iscontent = false;
                    vars.isbacquote = false;
                    vars.tagstrings.push(vars.currentstring);
                    vars.currentstring = '';
                    return;
                }
                if (vars.iscontent && !vars.isbacquote) {
                    vars.currentstring += c;
                    return;
                }
            }
            if (c == "(") {
                if (!vars.iscontent || (vars.iscontent && vars.isbracket > 0)) {
                    // if (vars.currentstring != '' && vars.isbracket == 0) {
                    //     vars.tagstrings.push(vars.currentstring);
                    //     vars.currentstring = '';
                    // }
                    vars.iscontent = true;
                    vars.isbracket += 1;
                    vars.currentstring += c;
                    return;
                }
                if (vars.iscontent && !vars.isbracket) {
                    vars.currentstring += c;
                    return;
                }
            }
            if (c == ")") {
                if (vars.iscontent && vars.isbracket > 0) {
                    vars.currentstring += c;
                    vars.isbracket -= 1;
                    if (vars.isbracket == 0) {
                        vars.iscontent = false;
                        vars.tagstrings.push(vars.currentstring);
                        vars.currentstring = '';
                        return;
                    }
                    return;
                }
            }
            if (c == "{") {
                if (!vars.iscontent || (vars.iscontent && vars.iscurlybracket > 0)) {
                    if (vars.currentstring != '' && vars.iscurlybracket == 0) {
                        vars.tagstrings.push(vars.currentstring);
                        vars.currentstring = '';
                    }
                    vars.iscontent = true;
                    vars.iscurlybracket += 1;
                    vars.currentstring += c;
                    return;
                }
                if (vars.iscontent && !vars.iscurlybracket) {
                    vars.currentstring += c;
                    return;
                }
            }
            if (c == "}") {
                if (vars.iscontent && vars.iscurlybracket > 0) {
                    vars.iscurlybracket -= 1;
                    vars.currentstring += c;
                    if (vars.iscurlybracket == 0) {
                        vars.iscontent = false;
                        vars.tagstrings.push(vars.currentstring);
                        vars.currentstring = '';
                        return;
                    }
                    return;
                }
            }
            if (c == "[") {
                if (!vars.iscontent || (vars.iscontent && vars.issquarebracket > 0)) {
                    // if (vars.currentstring != '' && vars.issquarebracket == 0) {
                    //     vars.tagstrings.push(vars.currentstring);
                    //     vars.currentstring = '';
                    // }
                    vars.iscontent = true;
                    vars.issquarebracket += 1;
                    vars.currentstring += c;
                    return;
                }
                if (vars.iscontent && !vars.issquarebracket) {
                    vars.currentstring += c;
                    return;
                }
            }
            if (c == "]") {
                if (vars.iscontent && vars.issquarebracket > 0) {
                    vars.issquarebracket -= 1;
                    vars.currentstring += c;
                    if (vars.issquarebracket == 0) {
                        vars.iscontent = false;
                        vars.tagstrings.push(vars.currentstring);
                        vars.currentstring = '';
                        return;
                    }
                    return;
                }
            }
            vars.currentstring += c;
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
                        this.error({filename: filename, line: linenum}, `Mismatching '=' on line ${linenum}`);
                    }
                    isequal = true;
                } else {
                    if (isequal) {
                        isequal = false;
                        if (currentarg == null) {
                            this.error({filename: filename, line: linenum}, `Mismatching '=' `);
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
                                this.error({filename: filename, line: linenum}, `A modifier '${args[i]}' with no corresponding value`);
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
                if (!this.registeredTags.hasOwnProperty(tagname) && (context == null || context.registered == null || !context.registered.hasOwnProperty(tag.tag))) {
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
                            this.error(attr, `cannot parse argument ${attr.name}: ${error}`);
                        }
                    } else {
                        this.error(attr, `cannot parse argument ${attr.name}: ${error}`);
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
                        this.error(attr, `Cannot parse modifier ${mod.name} in parameter ${attr.name}: ${error}`);
                    }
                }
                value = this.registeredModifiers[this.caseSensitive ? mod.name : mod.name.toLowerCase()].call(attr, value, modvalue, values);
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
                            this.error(tag, 'not an object');
                        }
                    } catch(error) {
                        this.error(tag, `Cannot parse argument ${arg.value} in tag ${tag.tag}: ${error}`);
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

        this.error = function(tag, message) {
            var e = new Error(`${message} in file ${tag.filename} on line ${tag.line}`);
            e.fileName = tag.filename;
            e.lineNumber = tag.line;
            throw e;
        }

    }
}
