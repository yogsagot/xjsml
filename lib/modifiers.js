module.exports = {
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