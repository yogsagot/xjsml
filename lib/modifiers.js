module.exports = {
    'default': function(value, param) {
        if (value != undefined)
            return value;
        return param;
    },
    'uppercase': function(value, param) {
        return value.toUpperCase();
    },
    'lowercase': function(value, param) {
        return value.toLowerCase();
    },
    'if': function(value, param) {
        return param ? value : -Infinity;
    }
}