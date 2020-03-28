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

function display(value, param) {
    return param ? value : undefined;
}

function json(value, param) {
    return JSON.stringify(value);
}

module.exports = {
    'default': defaultValue,
    'uppercase': uppercase,
    'lowercase': lowercase,
    'if': display,
    'when': display,
    'display': display,
    'json': json
}