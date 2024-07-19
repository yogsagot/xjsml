let HtmlEntities = require('./htmlentities');

function defaultValue(value, param) {
    if (value !== undefined)
        return value;
    return param;
}

function uppercase(value, param, values) {
    return String(value).toUpperCase();
}

function lowercase(value, param, values) {
    return String(value).toLowerCase();
}

function trim(value, param, values) {
    return String(value).trim();
}

function display(value, param, values) {
    return param ? value : undefined;
}

function sort(value, param, values) {
    if (Array.isArray(value)) {
        if (param === 'desc')
            return value.sort().reverse();
        if (typeof param === "function")
            return value.sort(param);
        return value.sort();
    }
    if (typeof value === 'object' && value.constructor === Object) {
        let new_val = {};
        if (param === 'desc') {
            for (let [key, item] of Object.entries(value).sort().reverse()) {
                new_val[key] = item;
            }
            return new_val;
        }
        if (typeof param === "function") {
            for (let [key, item] of Object.entries(value).sort(param)) {
                new_val[key] = item;
            }
            return new_val;
        }
        for (let [key, item] of Object.entries(value).sort()) {
            new_val[key] = item;
        }
        return new_val;
    }
    return value;
}

function join(value, param, values) {
    if (Array.isArray(value)) {
        return value.join(param);
    }
    if (typeof value === 'object' && value.constructor === Object) {
        let newval = "";
        for (let [key, item] of Object.entries(value)) {
            newval += param.replace('${key}', key).replace('${item}', item);
        }
        return newval;
    }
    return value;
}

function json(value, param, values) {
    return JSON.stringify(value);
}

function encode(value, param, values) {
    return HtmlEntities.encode(String(value));
}

function nl2br(value, param, values) {
    return String(value).split("\n").join("<br />\n");
}

function replace(value, param, values) {
    if (param === null || param === undefined) {
        let e = new Error(`Attribute ${this.name} should have a parameter in file ${this.filename} on line ${this.line}`);
        e.fileName = this.filename;
        e.lineNumber = this.line;
        throw e;
    }

    let search = "";
    let replacevalue = "";
    if (Array.isArray(param)) {
        if (param.length !== 2) {
            let e = new Error(`"search" modifier for attribute ${this.name} should have an array of two elements as a parameter in file ${this.filename} on line ${this.line}`);
            e.fileName = this.filename;
            e.lineNumber = this.line;
            throw e;
        }
        search = param[0];
        replacevalue = param[1];
    }

    if (typeof param === 'object' && param.constructor === Object) {
        if (!param.hasOwnProperty("search")) {
            let e = new Error(`"search" modifier for attribute ${this.name} should have property "search" in a parameter in file ${this.filename} on line ${this.line}`);
            e.fileName = this.filename;
            e.lineNumber = this.line;
            throw e;
        }

        if (!param.hasOwnProperty("replace")) {
            let e = new Error(`"search" modifier for attribute ${this.name} should have property "replace" in a parameter in file ${this.filename} on line ${this.line}`);
            e.fileName = this.filename;
            e.lineNumber = this.line;
            throw e;
        }
        search = param.search;
        replacevalue = param.replace;
    }
    return String(value).replace(search, replacevalue);
}

module.exports = {
    'default': defaultValue,
    'uppercase': uppercase,
    'lowercase': lowercase,
    'trim': trim,
    'if': display,
    'when': display,
    'display': display,
    'sort': sort,
    'join': join,
    'json': json,
    'encode': encode,
    'nl2br': nl2br,
    'replace': replace
}