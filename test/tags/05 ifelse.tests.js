var XJSML = require("../../lib/xjsml");
var assert = require("chai").assert;
const fs = require("fs");
const path = require("path");

describe("tags", () => {
    describe("if else", () => {
        const xjsml = new XJSML({
            cacheEnabled: false,
            caseSensitive: true,
            javascriptTagAllowed: false,
            callbacksAllowed: true,
        });

        it("01 if true", () => {
            var templatename = "05 ifelse/01 if";
            var filename = "05 ifelse/01 if true";
            var args = {boolvar: true};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("02 if false", () => {
            var templatename = "05 ifelse/01 if";
            var filename = "05 ifelse/02 if false";
            var args = {boolvar: false};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("03 if else true", () => {
            var templatename = "05 ifelse/03 if else";
            var filename = "05 ifelse/03 if else true";
            var args = {boolvar: true};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("04 if else false", () => {
            var templatename = "05 ifelse/03 if else";
            var filename = "05 ifelse/04 if else false";
            var args = {boolvar: false};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("05 elseif option 1", () => {
            var templatename = "05 ifelse/05 elseif";
            var filename = "05 ifelse/05 elseif option 1";
            var args = {intvar: 1};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("06 elseif option 2", () => {
            var templatename = "05 ifelse/05 elseif";
            var filename = "05 ifelse/06 elseif option 2";
            var args = {intvar: 2};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("07 elseif option 3", () => {
            var templatename = "05 ifelse/05 elseif";
            var filename = "05 ifelse/07 elseif option 3";
            var args = {intvar: 3};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("08 elseif option 4", () => {
            var templatename = "05 ifelse/05 elseif";
            var filename = "05 ifelse/08 elseif option 4";
            var args = {intvar: 4};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("09 elseif option 5", () => {
            var templatename = "05 ifelse/05 elseif";
            var filename = "05 ifelse/09 elseif option 5";
            var args = {intvar: 5};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("10 elseif else", () => {
            var templatename = "05 ifelse/05 elseif";
            var filename = "05 ifelse/10 elseif else";
            var args = {intvar: -1};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("11 elseif error no value", () => {
            var filename = "05 ifelse/11 elseif error no value";
            var args = {};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /Cannot read properties of undefined/);
        });

        it("12 if with children true", () => {
            var templatename = "05 ifelse/12 if with children";
            var filename = "05 ifelse/12 if with children true";
            var args = {boolvar: true};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("13 if with children false", () => {
            var templatename = "05 ifelse/12 if with children";
            var filename = "05 ifelse/13 if with children false";
            var args = {boolvar: false};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("14 elseif with children option 1", () => {
            var templatename = "05 ifelse/14 elseif with children";
            var filename = "05 ifelse/14 elseif with children option 1";
            var args = {intvar: 1};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("15 elseif with children option 2", () => {
            var templatename = "05 ifelse/14 elseif with children";
            var filename = "05 ifelse/15 elseif with children option 2";
            var args = {intvar: 2};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("15 elseif with children option 2", () => {
            var templatename = "05 ifelse/14 elseif with children";
            var filename = "05 ifelse/15 elseif with children option 2";
            var args = {intvar: 2};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("16 elseif with children option 3", () => {
            var templatename = "05 ifelse/14 elseif with children";
            var filename = "05 ifelse/16 elseif with children option 3";
            var args = {intvar: 3};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("17 elseif with children option 4", () => {
            var templatename = "05 ifelse/14 elseif with children";
            var filename = "05 ifelse/17 elseif with children option 4";
            var args = {intvar: 4};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("18 elseif with children option 5", () => {
            var templatename = "05 ifelse/14 elseif with children";
            var filename = "05 ifelse/18 elseif with children option 5";
            var args = {intvar: 5};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("19 elseif with children else", () => {
            var templatename = "05 ifelse/14 elseif with children";
            var filename = "05 ifelse/19 elseif with children else";
            var args = {intvar: -1};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
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

