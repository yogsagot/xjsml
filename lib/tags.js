let HtmlEntities = require('./htmlentities');
const path = require('path');
const fs = require('fs');
const os = require('os');

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
    return this.renderTag(tag.children, args, context).split(os.EOL).join(`<br />${os.EOL}`);
}

function assign(tag, args, context) {
    if (!tag.args.name && !tag.args.var) {
        this.error(tag, `${tag.tag} tag has no "name" and no "var" property on line ${tag.line}`);
    }

    if (!tag.args.value && !tag.args.val) {
        this.error(tag, `${tag.tag} tag has no "value" and no "val" property on line ${tag.line}`);
    }

    let name = tag.args.name ? this.attrValue(tag.args.name, args) : this.attrValue(tag.args.var, args);
    let value = tag.args.value ? this.attrValue(tag.args.value, args) : this.attrValue(tag.args.val, args);

    if (tag.children.length > 0) {
        let newargs = {
            ...args
        };
        newargs[name] = value;
        return this.renderTag(tag.children, newargs, context);
    } else {
        args[name] = value;
        return "";
    }
}

function ifelse(tag, args, context) {
    let currentcase = {
        value: this.attrValue(tag.args.args[0], args),
        children: [],
        haschildren: false
    }

    let arr = [];
    tag.children.forEach(child => {
        if (child.tag === 'elseif') {
            if (child.action === 'closetag') {
                return;
            }
            arr.push(currentcase);
            currentcase = {
                value: this.attrValue(child.args.args[0], args),
                children: child.children.length > 0 ? child.children : [],
                haschildren: child.children.length > 0
            };
            return;
        }

        if (child.tag === 'else') {
            if (child.action === 'closetag') {
                return;
            }
            arr.push(currentcase);
            currentcase = {
                value: true,
                children: child.children.length > 0 ? child.children : [],
                haschildren: child.children.length > 0
            };
            return;
        }

        if (!currentcase.haschildren)
            currentcase.children.push(child);
    });

    if (currentcase.children.length > 0) {
        arr.push(currentcase);
    }

    for (let i = 0; i < arr.length; i++) {
        if (arr[i].value)
            return this.renderTag(arr[i].children, args, context);
    }
    return "";
}

function switchcase(tag, args, context) {
    let arg = this.attrValue(tag.args.args[0], args);

    for (let i = 0; i < tag.children.length; i++) {
        if (tag.children[i].tag === 'case' && tag.children[i].action !== 'closetag'
            && arg === this.attrValue(tag.children[i].args.args[0], args))
            return this.renderTag(tag.children[i].children, args, context);
        if (tag.children[i].tag === 'else' && tag.children[i].action !== 'closetag')
            return this.renderTag(tag.children[i].children, args, context);
    }

    return "";
}

function forloop(tag, args, context) {
    let tagstr = "";
    let src = tag.args.src ? this.attrValue(tag.args.src, args) : this.attrValue(tag.args.args[0], args);
    let itemname = tag.args.item ? this.attrValue(tag.args.item, args) : "item";
    let keyname = tag.args.key ? this.attrValue(tag.args.key, args) : "key";

    if (args.hasOwnProperty(keyname)) {
        this.error(tag, `Cannot render for loop: key variable ${keyname} already declared`);
    }

    if (args.hasOwnProperty(itemname)) {
        this.error(tag, `Cannot render for loop: item variable ${itemname} already declared`);
    }

    if (Array.isArray(src)) {
        src.forEach((item, key) => {
            let localargs = {
                ...args
            };
            localargs[keyname] = key;
            localargs[itemname] = item;
            tagstr += this.renderTag(tag.children, localargs, context);
        });
        return tagstr;
    }

    if (typeof src === 'object' && src.constructor === Object) {
        for (let [key, item] of Object.entries(src)) {
            let localargs = {
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

function withblock(tag, args, context) {
    let obj = this.attrValue(tag.args.args[0], args);
    if (!(typeof obj === 'object' && obj.constructor === Object))
        this.error(tag, `With tag must accept object as a parameter. Got ${typeof obj} instead`);

    let localargs = {
        ...args,
        ...obj
    };

    return this.renderTag(tag.children, localargs, context);
}

function javascript(tag, args, context) {
    if (!this.javascriptTagAllowed) {
        this.error(tag, `Template side javascript execution is disabled`);
    }

    let result = "";
    if (tag.args.args.length > 0) {
        let func = new Function(...Object.keys(args), this.attrValue(tag.args.args[0], args));
        let funcresult = func.call(args, ...Object.values(args));
        if (funcresult !== undefined)
            result += funcresult;
    }

    if (tag.children.length > 0) {
        let func = new Function(...Object.keys(args), tag.children[0].content);
        let funcresult = func.call(args, ...Object.values(args));
        if (funcresult !== undefined)
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

    let name = "";
    let params = {};

    tag.args.args.forEach(arg => {
        if (typeof arg.name == 'number') {
            this.error(tag, `Only named parameters allowed in callback tag`);
        }
        if (arg.name === 'name') {
            name = this.attrValue(arg, args);
        } else {
            params[arg.name] = this.attrValue(arg, args);
        }
    });

    if (!this.registeredCallbacks.hasOwnProperty(name)) {
        this.error(tag, `Callback "${name}" is not registered`);
    }

    let paramnames = (this.registeredCallbacks[name] + '')
        .replace(/[/][/].*$/mg, '') // strip single-line comments
        .replace(/\s+/g, '') // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
        .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]

    let paramvalues = paramnames.map(paramname => {
        if (!params.hasOwnProperty(paramname)) {
            this.error(tag, `Callback "${name}" does not provide value for parameter "${paramname}"`);
        }
        return params[paramname];
    });

    let result = this.registeredCallbacks[name].call(args, ...paramvalues);
    if (result !== undefined)
        return result;

    return "";
}

function include(tag, args, context) {
    if (!tag.args.src) {
        this.error(tag, `Include tag must have "src" property`);
    }

    let newfilename = this.attrValue(tag.args.src, args);
    if (!fs.existsSync(newfilename)) {
        let dir = path.dirname(tag.filename);
        newfilename = path.normalize(path.join(dir, newfilename));
    }

    if (!fs.existsSync(newfilename)) {
        this.error(tag, `Cannot include template, file ${newfilename} does not exist`);
    }

    let parsed = {};
    if (this.cacheEnabled && this.cache[newfilename]) {
        parsed = this.cache[newfilename];
    } else {
        let template = this.fileLoader.call(this, newfilename);
        parsed = this.parse(template, newfilename);
    }

    let params = {};

    tag.args.args.forEach(arg => {
        if (arg.name !== 'src') {
            params[arg.name] = this.attrValue(arg, args);
        }
    });

    let blocks = {};

    tag.children.forEach(child => {
        if (child.tag === 'block' && child.action !== 'closetag') {
            if (!child.args.name) {
                this.error(tag, `Block tag must have "name" property`);
            }
            let name = this.attrValue(child.args.name, args);
            blocks[name] = child;
        }
    });

    let newargs = {...args};
    return this.renderTag(parsed, newargs, {...context, params: params, content: tag.children, blocks: blocks});
}

function param(tag, args, context) {
    if (!tag.args.name) {
        this.error(tag, `${tag.tag} tag has no "name" property on line ${tag.line}`);
    }

    let name = this.attrValue(tag.args.name, args);
    let value = null;

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

    let name = this.attrValue(tag.args.name, args);
    if (context != null && context.hasOwnProperty('blocks') && context.blocks.hasOwnProperty(name)) {
        let mode = 'replace';
        if (context.blocks[name].args.mode) {
            mode = this.attrValue(context.blocks[name].args.mode, args);
            if (!['replace', 'precede', 'append'].includes(mode)) {
                this.error(context.blocks[name], `Block tag "mode" property must be "replace", "precede" or "append"`);
            }
        }

        if (mode === 'replace') {
            return this.renderTag(context.blocks[name].children, args, context);
        }

        if (mode === 'precede') {
            return this.renderTag(context.blocks[name].children, args, context) +
                this.renderTag(tag.children, args, context);
        }

        if (mode === 'append') {
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

    let name = this.attrValue(tag.args.name, args);

    // if (context != null && context.hasOwnProperty("registered") && context.registered.hasOwnProperty(name)) {
    //     this.error(tag, `Tag with name "${name}" already registered`);
    // }

    let newfilename = this.attrValue(tag.args.src, args);
    if (!fs.existsSync(newfilename)) {
        let dir = path.dirname(tag.filename);
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
    if (context == null || !context.hasOwnProperty('registered') || !context.registered.hasOwnProperty(tag.tag)) {
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
    'variable': assign,
    'var': assign,
    'if': ifelse,
    'switch': switchcase,
    'for': forloop,
    'foreach': forloop,
    'with': withblock,
    'javascript': javascript,
    'js': javascript,
    'callback': callback,
    'include': include,
    'layout': include,
    'param': param,
    'content': content,
    'block': block,
    'register': register,
    'registered': registered
}