function defaultValue(value, param) {
    if (value != undefined)
        return value;
    return param;
}

function uppercase(value, param) {
    return value.toUpperCase();
}

function lowercase(value, param) {
    return value.toLowerCase();
}

function trim(value, param) {
    return String(value).trim();
}

function display(value, param) {
    return param ? value : undefined;
}

function json(value, param) {
    return JSON.stringify(value);
}

function nl2br(value, param) {
    return String(value).split("\n").join("<br />\n");
}

function replace(value, param) {
    if(param == null || param == undefined) {
        var e = new Error(`Attribute ${this.name} should have a parameter`, this.filename, this.line);
        e.fileName = this.filename;
        e.lineNumber = this.line;
        throw e;
    }
    var search = "";
    var replacevalue = "";
    if (Array.isArray(param)) {
        if(param.length != 2) {
            var e = new Error(`"search" modifier for attribute ${this.name} should have an array of two elements as a parameter`, this.filename, this.line);
            e.fileName = this.filename;
            e.lineNumber = this.line;
            throw e;
        }
        search = param[0];
        replacevalue = param[1];
    }
    if(typeof param === 'object' && param.constructor === Object) {
        if (!param.hasOwnProperty("search")) {
            var e = new Error(`"search" modifier for attribute ${this.name} should have property "search" in a parameter`, this.filename, this.line);
            e.fileName = this.filename;
            e.lineNumber = this.line;
            throw e;
        }
        if (!param.hasOwnProperty("replace")) {
            var e = new Error(`"search" modifier for attribute ${this.name} should have property "replace" in a parameter`, this.filename, this.line);
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
    'json': json,
    'nl2br': nl2br,
    'replace': replace
}