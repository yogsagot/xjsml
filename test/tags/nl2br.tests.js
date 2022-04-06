var XJSML = require("../..");
var assert = require("chai").assert;
const fs = require("fs");
const path = require("path");

describe("tags", () => {
    describe("nl2br", () => {
        const xjsml = new XJSML({
            cacheEnabled: false,
            caseSensitive: true,
            javascriptTagAllowed: false,
            callbacksAllowed: true,
        });

        it("01 nl2br", () => {
            var filename = "03 nl2br/01 nl2br";
            var args = {};
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

