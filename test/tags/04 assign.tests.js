var XJSML = require("../../lib/xjsml");
var assert = require("chai").assert;
const fs = require("fs");
const path = require("path");

describe("tags", () => {
    describe("assign", () => {
        const xjsml = new XJSML({
            cacheEnabled: false,
            caseSensitive: true,
            javascriptTagAllowed: false,
            callbacksAllowed: true,
        });

        it("01 assign", () => {
            var filename = "04 assign/01 assign";
            var args = {};
            var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("02 assign close tag", () => {
            var filename = "04 assign/02 assign close tag";
            var args = {};
            var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("03 assign error var outside tag", () => {
            var filename = "04 assign/03 assign error var outside tag";
            var args = {};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /var1 is not defined .* on line 6/);
        });

        it("04 assign error no name", () => {
            var filename = "04 assign/04 assign error no name";
            var args = {};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /tag has no "name" and no "var" property .* on line 3/);
        });

        it("05 assign error no value", () => {
            var filename = "04 assign/05 assign error no value";
            var args = {};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /tag has no "value" and no "val" property on line .* on line 3/);
        });
    });
});

function fileName(filename) {
    return path.join(__dirname, filename);
}

function loadfile(filename) {
    return fs.readFileSync(fileName(filename), "utf8").toString();
}

