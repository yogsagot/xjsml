var assert = require("chai").assert;
var XJSML = require("../..");
const fs = require("fs");
const path = require("path");

describe("tags", () => {
    describe("echo", () => {
        const xjsml = new XJSML({
            cacheEnabled: false,
            caseSensitive: true,
            javascriptTagAllowed: false,
            callbacksAllowed: true,
        });

        it("01 echo", () => {
            var filename = "01 echo/01 echo";
            var args = {a: 'abcd'};
            var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("02 echo uppercase", () => {
            var filename = "01 echo/02 echo uppercase";
            var args = {a: 'abcd'};
            var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("03 expression", () => {
            var filename = "01 echo/03 expression";
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