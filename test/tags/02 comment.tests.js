var assert = require("chai").assert;
var XJSML = require("../..");
const fs = require("fs");
const path = require("path");

describe("tags", () => {
    describe("comment", () => {
        const xjsml = new XJSML({
            cacheEnabled: false,
            caseSensitive: true,
            javascriptTagAllowed: false,
            callbacksAllowed: true,
        });

        it("01 comment", () => {
            var filename = "02 comment/01 comment";
            var args = {a: 'abcd'};
            var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        //TODO: Self closing comments

        it("02 unclosed tags", () => {
            var filename = "02 comment/02 unclosed tags";
            var args = {a: 'abcd'};
            var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });
    });
});

function fileName(filename) {
    return path.join(__dirname, filename);
}

function loadfile(filename) {
    return fs.readFileSync(fileName(filename), "utf8").toString();
}
