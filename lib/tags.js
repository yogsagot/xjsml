var HtmlEntities = require('./htmlentiities');

function doctype(tag, args) {
    return '<!DOCTYPE html>';
}

function write(tag, args) {
    return HtmlEntities.encode(String(this.attrValue(tag.args.args[0], args)));
}

function writeraw(tag, args) {
    return this.attrValue(tag.args.args[0], args);
}

function comment(tag, args) {
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
    if (!tag.args.src)
        return "";
    var src = this.attrValue(tag.args.src, args);
    if (!Array.isArray(src)) {
        return "";
    }
    var itemname = tag.args.item ? this.attrValue(tag.args.item, args) : "item";
    var keyname = tag.args.key ? this.attrValue(tag.args.item, args) : "key";
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

module.exports = {
    '!DOCTYPE': doctype,
    '_': write,
    '=': writeraw,
    '*': comment,
    'comment': comment,
    'if': ifelse,
    'switch': switchcase,
    'for': forloop
}