var HtmlEntities = require('./htmlentiities');

function echo(tag, args) {
    return HtmlEntities.encode(String(this.attrValue(tag.args.args[0], args)));
}

function raw(tag, args) {
    return this.attrValue(tag.args.args[0], args);
}

function comment(tag, args) {
    return "";
}

function nl2br(tag, args) {
    return this.renderTag(tag.children, args).split("\n").join("<br />\n");
}

function assign(tag, args) {
    if (!tag.args.name) {
        throw new Error(`${tag.tag} tag has no "name" property on line ${tag.line}`);
    }
    if (!tag.args.value) {
       throw new Error(`${tag.tag} tag has no "value" property on line ${tag.line}`);
    }
    var name = this.attrValue(tag.args.name, args);
    var value = this.attrValue(tag.args.value, args);
    args[name] = value;
    return "";
}

function ifelse(tag, args){
    var currentcase = {
        value: this.attrValue(tag.args.args[0], args),
        children: []
    }
    var arr = [];
    tag.children.forEach(child => {
        if (child.tag == 'elseif')  {
            if (child.action == 'closetag') {
                return;
            }
            arr.push(currentcase);
            currentcase = {
                value: this.attrValue(child.args.args[0], args),
                children: []
            };
            return;
        }
        if (child.tag == 'else')  {
            if (child.action == 'closetag') {
                return;
            }
            arr.push(currentcase);
            currentcase = {
                value: true,
                children: []
            };
            return;
        }
        currentcase.children.push(child);
    });
    if (currentcase.children.length > 0) {
        arr.push(currentcase);
    }
    for(var i = 0; i < arr.length; i++) {
        if (arr[i].value)
            return this.renderTag(arr[i].children, args);
    }
    return "";
}

function switchcase(tag, args) {
    var arg = this.attrValue(tag.args.args[0], args);
    for(var i = 0; i < tag.children.length; i++) {
        if (tag.children[i].tag == 'case' && tag.children[i].action != 'closetag'
                && arg == this.attrValue(tag.children[i].args.args[0], args))
            return this.renderTag(tag.children[i].children, args);
        if (tag.children[i].tag == 'else'  && tag.children[i].action != 'closetag' )
            return this.renderTag(tag.children[i].children, args);
    }
    return "";
}

function forloop(tag, args) {
    var tagstr = "";
    var src = tag.args.src ? this.attrValue(tag.args.src, args) : this.attrValue(tag.args.args[0], args);
    var itemname = tag.args.item ? this.attrValue(tag.args.item, args) : "item";
    var keyname = tag.args.key ? this.attrValue(tag.args.key, args) : "key";
    if (args.hasOwnProperty(keyname)) {
        var e = new Error(`Cannot render for loop: key variable ${keyname} already declared`);
        e.fileName = tag.filename;
        e.lineNumber = tag.line;
        throw e;
    }
    if (args.hasOwnProperty(itemname)) {
        var e = new Error(`Cannot render for loop: item variable ${itemname} already declared`);
        e.fileName = tag.filename;
        e.lineNumber = tag.line;
        throw e;
    }
    if (Array.isArray(src)) {
        src.forEach((item, key) => {
            var localargs = {
                ...args
            };
            localargs[keyname] = key;
            localargs[itemname] = item;
            tagstr += this.renderTag(tag.children, localargs);
        });
        return tagstr;
    }
    if(typeof src === 'object' && src.constructor === Object) {
        for (let [key, item] of Object.entries(src)) {
            var localargs = {
                ...args
            };
            localargs[keyname] = key;
            localargs[itemname] = item;
            tagstr += this.renderTag(tag.children, localargs);
        }
        return tagstr;
    }
    var e = new Error(`For tag must accept an array or an object as a parameter`);
    e.fileName = tag.filename;
    e.lineNumber = tag.line;
    throw e;
}

function javascript(tag, args) {
    if (!this.javascriptTagAllowed) {
        var e = new Error(`Template side javascript execution is disabled`);
        e.fileName = tag.filename;
        e.lineNumber = tag.line;
        throw e;
    }
    var result = "";
    if (tag.args.args.length > 0) {
        var func = new Function(...Object.keys(args), this.attrValue(tag.args.args[0], args));
        var funcresult = func.call(args, ...Object.values(args));
        if (funcresult != undefined)
            result += funcresult;
    }
    if (tag.children.length > 0) {
        var func = new Function(...Object.keys(args), tag.children[0].content);
        var funcresult = func.call(args, ...Object.values(args));
        if (funcresult != undefined)
            result += funcresult;
    }
    return result;
}

function callback(tag, args) {
    if (!this.callbacksAllowed) {
        var e = new Error(`Callback execution is disabled`);
        e.fileName = tag.filename;
        e.lineNumber = tag.line;
        throw e;
    }
    if (!tag.args.name) {
        var e = new Error(`Callback tag must have "name" property`);
        e.fileName = tag.filename;
        e.lineNumber = tag.line;
        throw e;
    }
    var name = "";
    var params = {};
    tag.args.args.forEach(arg => {
        if (typeof arg.name == 'number') {
            var e = new Error(`Only named parameters allowed in callback tag`);
            e.fileName = tag.filename;
            e.lineNumber = tag.line;
            throw e;
        }
        if (arg.name == 'name') {
            name = this.attrValue(arg, args);
        } else {
            params[arg.name] = this.attrValue(arg, args);
        }
    });
    if (!this.registeredCallbacks.hasOwnProperty(name)) {
        var e = new Error(`Callback "${name}" is not registered`);
        e.fileName = tag.filename;
        e.lineNumber = tag.line;
        throw e;
    }
    var paramnames = (this.registeredCallbacks[name] + '')
        .replace(/[/][/].*$/mg,'') // strip single-line comments
        .replace(/\s+/g, '') // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
        .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]

    var paramvalues = paramnames.map(paramname => {
        if (!params.hasOwnProperty(paramname)) {
            var e = new Error(`Callback "${name}" does not provide value for parameter "${paramname}"`);
            e.fileName = tag.filename;
            e.lineNumber = tag.line;
            throw e;
        }
        return params[paramname];
    });
    var result = this.registeredCallbacks[name].call(args, ...paramvalues);
    if (result != undefined)
        return result;
    return "";
}

module.exports = {
    'echo': echo,
    '_': echo,
    'raw': raw,
    '=': raw,
    '*': comment,
    'comment': comment,
    'nl2br': nl2br,
    'assign': assign,
    'var': assign,
    'if': ifelse,
    'switch': switchcase,
    'for': forloop,
    'javascript': javascript,
    'js': javascript,
    'callback': callback
}