var assert = require("chai").assert;
var xjsml = require("..");
const fs = require("fs");
const path = require("path");

describe("xjsml", () => {
    const xjsml = new (require(".."))({
        cacheEnabled: false,
        caseSensitive: true,
        javascriptTagAllowed: false,
        callbacksAllowed: true,
    });

    it("01 html", () => {
        var filename = "xjsml/01 html";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });
    it("02 single quotes", () => {
        var filename = "xjsml/02 single quotes";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("03 tag whitespace", () => {
        var filename = "xjsml/03 tag whitespace";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("04 attribute in var", () => {
        var filename = "xjsml/04 attribute in var";
        var args = {
            link: "https://github.com/yogsagot/xjsml",
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("05 attribute in backquotes", () => {
        var filename = "xjsml/05 attribute in backquotes";
        var args = {
            protocol: "https",
            host: "github.com",
            username: "yogsagot",
            project: "xjsml",
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("06 attribute in statement", () => {
        var filename = "xjsml/06 attribute in statement";
        var args = {
            protocol: "https",
            host: "github.com",
            username: "yogsagot",
            project: "xjsml",
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    //TODO strip extra brackets
    it("07 attribute in complex statement", () => {
        var filename = "xjsml/07 attribute in complex statement";
        var args = {
            variable: 5 * 5,
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });
    
    it("08 attribute in object field", () => {
        var filename = "xjsml/08 attribute in object field";
        var args = {
            obj: {
                link: "https://github.com/yogsagot/xjsml"
            }
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("09 attribute in object nested field", () => {
        var filename = "xjsml/09 attribute in object nested field";
        var args = {
            obj: {
                nestedobj: {
                    link: "https://github.com/yogsagot/xjsml"
                }
            }
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("10 attribute in array item", () => {
        var filename = "xjsml/10 attribute in array item";
        var args = {
            arr:['item1', 'item2', "https://github.com/yogsagot/xjsml", 'item4']
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    //TODO strip extra brackets
    it("11 attribute in nested array item", () => {
        var filename = "xjsml/11 attribute in nested array item";
        var args = {
            arr:[[], ['item1', 'item2', "https://github.com/yogsagot/xjsml", 'item4'], [1,2,3]]
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });
});

function fileName(filename) {
    return path.join(__dirname, filename);
}

function loadfile(filename) {
    return fs.readFileSync(fileName(filename), "utf8").toString();
}
