var HtmlEntities = require('./htmlentiities');
const path = require('path');
const fs = require('fs');

function echo(tag, args) {
    return HtmlEntities.encode(String(this.attrValue(tag.args.args[0], args)));
}

function raw(tag, args) {
    return this.attrValue(tag.args.args[0], args);
}

function comment(tag, args) {
    return "";
}

function nl2br(tag, args, context) {
    return this.renderTag(tag.children, args, context).split("\n").join("<br />\n");
}

function assign(tag, args, context) {
    if (!tag.args.name) {
        this.error(tag, `${tag.tag} tag has no "name" property on line ${tag.line}`);
    }
    if (!tag.args.value) {
        this.error(tag, `${tag.tag} tag has no "value" property on line ${tag.line}`);
    }
    var name = this.attrValue(tag.args.name, args);
    var value = this.attrValue(tag.args.value, args);
    args[name] = value;
    return "";
}

function ifelse(tag, args, context){
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
            return this.renderTag(arr[i].children, args, context);
    }
    return "";
}

function switchcase(tag, args, context) {
    var arg = this.attrValue(tag.args.args[0], args);
    for(var i = 0; i < tag.children.length; i++) {
        if (tag.children[i].tag == 'case' && tag.children[i].action != 'closetag'
                && arg == this.attrValue(tag.children[i].args.args[0], args))
            return this.renderTag(tag.children[i].children, args, context);
        if (tag.children[i].tag == 'else'  && tag.children[i].action != 'closetag' )
            return this.renderTag(tag.children[i].children, args, context);
    }
    return "";
}

function forloop(tag, args, context) {
    var tagstr = "";
    var src = tag.args.src ? this.attrValue(tag.args.src, args) : this.attrValue(tag.args.args[0], args);
    var itemname = tag.args.item ? this.attrValue(tag.args.item, args) : "item";
    var keyname = tag.args.key ? this.attrValue(tag.args.key, args) : "key";
    if (args.hasOwnProperty(keyname)) {
        this.error(tag, `Cannot render for loop: key variable ${keyname} already declared`);
    }
    if (args.hasOwnProperty(itemname)) {
        this.error(tag, `Cannot render for loop: item variable ${itemname} already declared`);
    }
    if (Array.isArray(src)) {
        src.forEach((item, key) => {
            var localargs = {
                ...args
            };
            localargs[keyname] = key;
            localargs[itemname] = item;
            tagstr += this.renderTag(tag.children, localargs, context);
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
            tagstr += this.renderTag(tag.children, localargs, context);
        }
        return tagstr;
    }
    this.error(tag, `For tag must accept an array or an object as a parameter`);
}

function javascript(tag, args, context) {
    if (!this.javascriptTagAllowed) {
        this.error(tag, `Template side javascript execution is disabled`);
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

function callback(tag, args, context) {
    if (!this.callbacksAllowed) {
        this.error(tag, `Callback execution is disabled`);
    }
    if (!tag.args.name) {
        this.error(tag, `Callback tag must have "name" property`);
    }
    var name = "";
    var params = {};
    tag.args.args.forEach(arg => {
        if (typeof arg.name == 'number') {
            this.error(tag, `Only named parameters allowed in callback tag`);
        }
        if (arg.name == 'name') {
            name = this.attrValue(arg, args);
        } else {
            params[arg.name] = this.attrValue(arg, args);
        }
    });
    if (!this.registeredCallbacks.hasOwnProperty(name)) {
        this.error(tag, `Callback "${name}" is not registered`);
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
            this.error(tag, `Callback "${name}" does not provide value for parameter "${paramname}"`);
        }
        return params[paramname];
    });
    var result = this.registeredCallbacks[name].call(args, ...paramvalues);
    if (result != undefined)
        return result;
    return "";
}

function include(tag, args, context) {
    if (!tag.args.src) {
        this.error(tag, `Include tag must have "src" property`);
    }
    var newfilename = this.attrValue(tag.args.src, args);
    if (!fs.existsSync(newfilename)) {
        var dir = path.dirname(tag.filename);
        newfilename = path.normalize(path.join(dir, newfilename));
    }
    if (!fs.existsSync(newfilename)) {
        this.error(tag, `Cannot include template, file ${newfilename} does not exist`);
    }
    var parsed = {};
    if (this.cacheEnabled && this.cache[newfilename]) {
        parsed = this.cache[newfilename];
    } else {
        var template = this.fileLoader.call(this, newfilename);
        parsed = this.parse(template, newfilename);
    }

    var params = {};

    tag.args.args.forEach(arg => {
        if (arg.name != 'src') {
            params[arg.name] = this.attrValue(arg, args);
        }
    });

    var blocks = {};

    tag.children.forEach(child => {
        if (child.tag == 'block' && child.action != 'closetag') {
            if (!child.args.name) {
                this.error(tag, `Block tag must have "name" property`);
            }
            var name = this.attrValue(child.args.name, args);
            blocks[name] = child;
        }
    });

    var newargs = {...args};
    return this.renderTag(parsed, newargs, {...context, params: params, content: tag.children, blocks: blocks});
}

function param(tag, args, context) {
    if (!tag.args.name) {
        this.error(tag, `${tag.tag} tag has no "name" property on line ${tag.line}`);
    }
    var name = this.attrValue(tag.args.name, args);
    var value = null;
    if (tag.args.value) {
        value = this.attrValue(tag.args.value, args);
    }
    if (context != null && context.hasOwnProperty('params') && context.params.hasOwnProperty(name)) {
        value = context.params[name];
    }
    if (value == null) {
        this.error(tag, `${tag.tag} tag has no value provided for parameter "${name}"`);
    }
    args[name] = value;
    return "";

}

function content(tag, args, context) {
    if (context != null && context.hasOwnProperty('content') && context.content.length > 0)
        return this.renderTag(context.content, args, context);
    return this.renderTag(tag.children, args, context);
}

function block(tag, args, context) {
    if (!tag.args.name) {
        this.error(tag, `Block tag must have "name" property`);
    }
    var name = this.attrValue(tag.args.name, args);
    if (context != null && context.hasOwnProperty('blocks') && context.blocks.hasOwnProperty(name)) {
        var mode = 'replace';
        if (context.blocks[name].args.mode) {
            mode = this.attrValue(context.blocks[name].args.mode, args);
            if (!['replace', 'precede', 'append'].includes(mode)) {
                this.error(context.blocks[name], `Block tag "mode" property must be "replace", "precede" or "append"`);
            }
        }

        if (mode == 'replace'){
            return this.renderTag(context.blocks[name].children, args, context);
        }
        if (mode == 'precede') {
            return this.renderTag(context.blocks[name].children, args, context) +
                this.renderTag(tag.children, args, context);
        }
        if (mode == 'append') {
            return this.renderTag(tag.children, args, context) +
                this.renderTag(context.blocks[name].children, args, context);
        }
    }
    return this.renderTag(tag.children, args, context);
}

function register(tag, args, context) {
    if (!tag.args.name) {
        this.error(tag, `Register tag must have "name" property`);
    }

    if (!tag.args.src) {
        this.error(tag, `Register tag must have "src" property`);
    }

    var name = this.attrValue(tag.args.name, args);

    // if (context != null && context.hasOwnProperty("registered") && context.registered.hasOwnProperty(name)) {
    //     this.error(tag, `Tag with name "${name}" already registered`);
    // }

    var newfilename = this.attrValue(tag.args.src, args);
    if (!fs.existsSync(newfilename)) {
        var dir = path.dirname(tag.filename);
        newfilename = path.normalize(path.join(dir, newfilename));
    }
    if (!fs.existsSync(newfilename)) {
        this.error(tag, `Cannot register tag ${name}, file ${newfilename} does not exist`);
    }

    if (!context.hasOwnProperty("registered")) {
        context.registered = {}
    }

    context.registered[name] = newfilename;

    return "";
}

function registered(tag, args, context) {
    if (context == null && !context.hasOwnProperty('registered') && !context.registered.hasOwnProperty(tag.tag)) {
        this.error(tag, `Tag "${tag.tag}" has not been regisered`);
    }

    tag.args.src = {
        name: "src",
        value: context.registered[tag.tag],
        stringvalue: context.registered[tag.tag],
        modifiers: [],
        filename: tag.filename,
        line: tag.line
    };
    return include.call(this, tag, args, context);
}

module.exports = {
    'echo': echo,
    '_': echo,
    'raw': raw,
    '=': raw,
    'comment': comment,
    '*': comment,
    'nl2br': nl2br,
    'assign': assign,
    'var': assign,
    'if': ifelse,
    'switch': switchcase,
    'for': forloop,
    'foreach': forloop,
    'javascript': javascript,
    'js': javascript,
    'callback': callback,
    'include': include,
    'layout':  include,
    'param': param,
    'content': content,
    'block': block,
    'register': register,
    'registered': registered
}