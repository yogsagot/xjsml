var assert = require("chai").assert;
var XJSML = require("..");
const fs = require("fs");
const path = require("path");

describe("xjsml", () => {
    describe("exceptions", () => {
        const xjsml = new XJSML({
            cacheEnabled: false,
            caseSensitive: true,
            javascriptTagAllowed: false,
            callbacksAllowed: true,
        });

        it("01 file not found html", () => {
            var filename = "xjsml/exceptions/01 file not found html";
            var args = {};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender);
        });
    });
});

function fileName(filename) {
    return path.join(__dirname, filename);
}

function loadfile(filename) {
    return fs.readFileSync(fileName(filename), "utf8").toString();
}
