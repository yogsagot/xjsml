var assert = require("chai").assert;
var XJSML = require("..");
const fs = require("fs");
const path = require("path");

describe("tests", () => {
    describe("exceptions", () => {
        const xjsml = new XJSML({
            cacheEnabled: false,
            caseSensitive: true,
            javascriptTagAllowed: false,
            callbacksAllowed: true,
        });

        it("01 file not found html", () => {
            var filename = "exceptions/01 file not found html";
            var args = {};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender);
        });

        it("02 Unclosed tag", () => {
            var filename = "exceptions/02 Unclosed tag";
            var args = {};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /Unclosed tag br in file .* on line 3/);
        });

        it("02-1 Unclosed tag inside tag inside script", () => {
            var filename = "exceptions/02-1 Unclosed tag inside tag inside script";
            var args = {};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /Unclosed tag echo in file .* on line 5/);
        });
    });
});

function fileName(filename) {
    return path.join(__dirname, filename);
}

function loadfile(filename) {
    return fs.readFileSync(fileName(filename), "utf8").toString();
}
