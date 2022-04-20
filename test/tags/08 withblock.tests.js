var XJSML = require("../../lib/xjsml");
var assert = require("chai").assert;
const fs = require("fs");
const path = require("path");

describe("tags", () => {
    describe("withblock", () => {
        const xjsml = new XJSML({
            cacheEnabled: false,
            caseSensitive: true,
            javascriptTagAllowed: false,
            callbacksAllowed: true,
        });

        it("01 withblock", () => {
            var filename = "08 withblock/01 withblock";
            var args = {obj: {
                key1: "item1",
                key2: 10,
                key3: 1.11
            }};
            var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("02 withblock error undefined", () => {
            var filename = "08 withblock/02 withblock error undefined";
            var args = {};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /ReferenceError: obj is not defined .* on line 3/);
        });

        it("03 withblock error not object got string", () => {
            var filename = "08 withblock/02 withblock error undefined";
            var args = {obj: "string not object"};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /With tag must accept object as a parameter. Got string instead .* on line 3/);
        });

        it("03 withblock error not object got array", () => {
            var filename = "08 withblock/02 withblock error undefined";
            var args = {obj: ["string not object"]};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /With tag must accept object as a parameter. .* on line 3/);
        });
    });
});

function fileName(filename) {
    return path.join(__dirname, filename);
}

function loadfile(filename) {
    return fs.readFileSync(fileName(filename), "utf8").toString();
}