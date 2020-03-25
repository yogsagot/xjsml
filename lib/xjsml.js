function parse(template) {
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
            if (currentstring.substring(currentstring.length-closetag.length) == closetag) {
                isscript = false;
                isstyle = false;
                isjs = false;
                isjavascript = false;
                var tag = parseTag(currentstring.substring(0, currentstring.length-closetag.length), linenum);
                currenttag.children.push(tag);
                linenum += currentstring.split('\n').length - 1;
                tagarray.pop();
                currenttag = tagarray[tagarray.length-1];
                currenttag.children.push(parseTag(closetag, linenum));
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
                var tag = parseTag(currentstring, linenum);
                currenttag.children.push(tag);
                currentstring = '';
                return;
            }
            return;
        }
        if (c == '<') {
            if (currentstring != '') {
                currenttag.children.push(parseTag(currentstring, linenum));
                linenum += currentstring.split('\n').length - 1;
            }
            currentstring = '';
            currentstring += c;
        } else if (c == '>') {
            currentstring += c;
            var tag = parseTag(currentstring, linenum);
            linenum += currentstring.split('\n').length - 1;
            if (tag.action == 'closetag') {
                if (currenttag.action != 'opentag' || currenttag.tag != tag.tag) {
                    throw `Unclosed tag ${currenttag.tag} on line ${currenttag.line}`;
                }
                tagarray.pop();
                currenttag = tagarray[tagarray.length-1];
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

function parseTag(s, linenum) {
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
            if (c == "'")  {
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
                    if (currentstring[currentstring.length-1] == "\\") {
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
            if (c == '"')  {
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
                    if (currentstring[currentstring.length-1] == "\\") {
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
            if (c == "`")  {
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
                    if (currentstring[currentstring.length-1] == "\\") {
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
            if (c == "(")  {
                if (!iscontent || (iscontent && isbracket > 0)) {
                    if (currentstring != '' && isbracket == 0) {
                        tagstrings.push(currentstring);
                        currentstring = '';
                    }
                    iscontent = true;
                    isbracket +=1;
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
            if (c == "{")  {
                if (!iscontent || (iscontent && iscurlybracket > 0)) {
                    if (currentstring != '' && iscurlybracket == 0) {
                        tagstrings.push(currentstring);
                        currentstring = '';
                    }
                    iscontent = true;
                    iscurlybracket +=1;
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
            if (c == "[")  {
                if (!iscontent || (iscontent && issquarebracket > 0)) {
                    if (currentstring != '' && issquarebracket == 0) {
                        tagstrings.push(currentstring);
                        currentstring = '';
                    }
                    iscontent = true;
                    issquarebracket +=1;
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
        if (tagstrings[0] != '/' && tagstrings[tagstrings.length-1] != '/') {
            if (tagstrings[0].toLowerCase() == '!doctype') {
                return {
                    action: 'selfclosetag',
                    tag: tagstrings[0],
                    args: parseArgs(tagstrings.slice(1,tagstrings.length-1), linenum),
                    line: linenum,
                    children: []
                };
            } else {
                return {
                    action: 'opentag',
                    tag: tagstrings[0],
                    args: parseArgs(tagstrings.slice(1), linenum),
                    line: linenum,
                    children: []
                };
            }
        }
        if (tagstrings[tagstrings.length-1] == '/') {
            return {
                action: 'selfclosetag',
                tag: tagstrings[0],
                args: parseArgs(tagstrings.slice(1,tagstrings.length-1), linenum),
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

function parseArgs(args, linenum) {
    var parsed = {
        args: []
    };
    var currentarg = null;
    var isequal = false;
    var currentmodifier = null;
    for (var i = 0; i < args.length; i++) {
        if (args[i]=='=') {
            if (isequal || i == 0 || i == args.length-1) {
                throw `Mismatching '=' on line ${linenum}`;
            }
            isequal = true;
        } else {
            if (isequal) {
                isequal = false;
                if (currentarg == null) {
                    throw `Mismatching '=' on line ${linenum}`;
                }
                if (currentmodifier != null) {
                    currentmodifier.value = args[i];
                    currentmodifier = null;
                } else {
                    currentarg.name = currentarg.value;
                    currentarg.value = args[i];
                }
            } else {
                if (registeredModifiers.hasOwnProperty(args[i])) {
                    if (currentarg == null) {
                        throw `A modifier '${args[i]}' with no corresponding value on line ${linenum}`;
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
                        modifiers: []
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

var registeredTags = require('./tags');
var registeredModifiers = require('./modifiers');

function renderTag(tag, args) {
    var tagstr = '';
    if (tag.action == 'html') {
        tag.children.forEach(child => {
            tagstr += renderTag(child, args);
        });
    }
    if (tag.action == 'write') {
        tagstr += tag.content;
    }
    if (tag.action == 'opentag' || tag.action == 'selfclosetag') {
        if (registeredTags.hasOwnProperty(tag.tag)) {
            tagstr += registeredTags[tag.tag].call({attrValue: attrValue}, tag, args);
        } else {
            if (tag.action == 'opentag') {
                tagstr += `<${tag.tag}${renderAttributes(tag, args)}>`;
                tag.children.forEach(child => {
                    tagstr += renderTag(child, args);
                });
            }
            if (tag.action == 'selfclosetag') {
                tagstr += `<${tag.tag}${renderAttributes(tag, args)} />`;
            }
        }
    }
    if (tag.action == 'closetag') {
        if (!registeredTags.hasOwnProperty(tag.tag)) {
            tagstr += `</${tag.tag}>`;
        }
    }
    return tagstr;
}

function attrValue(attr, values) {
    var func = new Function(...Object.keys(values), `return ${attr.value}`);
    var value = func.call(values, ...Object.values(values));
    attr.modifiers.forEach(mod => {
        var modvalue = null;
        if (mod.value != null) {
            var modfunc = new Function(...Object.keys(values), `return ${mod.value}`);
            modvalue = modfunc.call(values, ...Object.values(values));
        }
        value = registeredModifiers[mod.name].call(values, value, modvalue);
    });
    return value;
}

function renderAttributes(tag, args) {
    var attr = "";
    tag.args.args.forEach(arg => {
        var value = attrValue(arg, args);
        if (value != -Infinity)
            attr += ` ${arg.name}="${value}"`;
    });
    return attr;
}

var template = `<!DOCTYPE>
<html id=[1, 2, 3, [4, 5]. {abc:123}]>
<head id=(return (dfdf))>
  <title ...titleargs>Title of the document</title>
  < link rel="657\` / sd\\"f sd' 567" / >
  <script type="text/javascript">
  var a = 5;
  if (a > 0 && a < 10) {
    alert(a);
  }
  </script>
  <style>
    html > body > b {
        text-align: center;
        color: blue;
    }
  </style>
</head>

<body>

<!-- You will not be able to see this text. -->

You can even comment out things in <!-- the middle of --> a sentence.

<!--
Or you can
comment out
a large number of lines.
-->


Read more: https://html.com/tags/comment-tag/#ixzz6Hc0QmuIj

The content of the document......
<p class=hello uppercase id="fffdf" uppercase=true lowrcase>
This is <b class="bold">bold</b> and this is <i>italic</i></p>
< / body>
</html>`;

template = `
<p class=hello uppercase id='fffdf' if=(2+2==5)>
<* "This is a comment" />
<_ hello1 uppercase />
This is <b class=(num==46?"fofo":"nene")>bold</b> and this is <i id=`+'`num${num*2}`'+`>italic</i></p>`;

var parsed = parse(template);

var args = {
    hello: "fffdfdfdfd",
    hello1: "this is a variable",
    num: 44
};

var str = renderTag(parsed, args);
console.log(str);
//console.log(parsed);

