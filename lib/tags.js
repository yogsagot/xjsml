function doctype(tag, args) {
    return '<!DOCTYPE html>';
}

function write(tag, args) {
    return this.attrValue(tag.args.args[0], args);
}

function comment(tag, args) {
    return "";
}

module.exports = {
    '!DOCTYPE': doctype,
    '_': write,
    '*': comment
}