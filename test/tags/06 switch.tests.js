var XJSML = require("../../lib/xjsml");
var assert = require("chai").assert;
const fs = require("fs");
const path = require("path");

describe("tags", () => {
    describe("switch", () => {
        const xjsml = new XJSML({
            cacheEnabled: false,
            caseSensitive: true,
            javascriptTagAllowed: false,
            callbacksAllowed: true,
        });

        it("01 switch case 1", () => {
            var templatename = "06 switch/01 switch";
            var filename = "06 switch/01 switch case 1";
            var args = {intvar: 1};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("02 switch case 2", () => {
            var templatename = "06 switch/01 switch";
            var filename = "06 switch/02 switch case 2";
            var args = {intvar: 2};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("03 switch case 3", () => {
            var templatename = "06 switch/01 switch";
            var filename = "06 switch/03 switch case 3";
            var args = {intvar: 3};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("04 switch case 4", () => {
            var templatename = "06 switch/01 switch";
            var filename = "06 switch/04 switch case 4";
            var args = {intvar: 4};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("05 switch else", () => {
            var templatename = "06 switch/01 switch";
            var filename = "06 switch/05 switch else";
            var args = {intvar: -1};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("06 switch calculated case 5+5", () => {
            var templatename = "06 switch/06 switch calculated";
            var filename = "06 switch/06 switch calculated case 5+5";
            var args = {intvar: 5+5};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("07 switch calculated case 10+10", () => {
            var templatename = "06 switch/06 switch calculated";
            var filename = "06 switch/07 switch calculated case 10+10";
            var args = {intvar: 10+10};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("08 switch calculated case 15+15", () => {
            var templatename = "06 switch/06 switch calculated";
            var filename = "06 switch/08 switch calculated case 15+15";
            var args = {intvar: 15+15};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("09 switch calculated case 20+20", () => {
            var templatename = "06 switch/06 switch calculated";
            var filename = "06 switch/09 switch calculated case 20+20";
            var args = {intvar: 20+20};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("10 switch calculated else", () => {
            var templatename = "06 switch/06 switch calculated";
            var filename = "06 switch/10 switch calculated else";
            var args = {intvar: 5-5};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("11 switch ignore outside tags case 1", () => {
            var templatename = "06 switch/11 switch ignore outside tags";
            var filename = "06 switch/01 switch case 1";
            var args = {intvar: 1};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("12 switch ignore outside tags case 2", () => {
            var templatename = "06 switch/11 switch ignore outside tags";
            var filename = "06 switch/02 switch case 2";
            var args = {intvar: 2};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("13 switch ignore outside tags case 3", () => {
            var templatename = "06 switch/11 switch ignore outside tags";
            var filename = "06 switch/03 switch case 3";
            var args = {intvar: 3};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("14 switch ignore outside tags case 4", () => {
            var templatename = "06 switch/11 switch ignore outside tags";
            var filename = "06 switch/04 switch case 4";
            var args = {intvar: 4};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("15 switch ignore outside tags else", () => {
            var templatename = "06 switch/11 switch ignore outside tags";
            var filename = "06 switch/05 switch else";
            var args = {intvar: -1};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("16 switch exception variable undefined", () => {
            var filename = "06 switch/01 switch";
            var args = {};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /ReferenceError: intvar is not defined .* on line 3/);
        });
    });
});

function fileName(filename) {
    return path.join(__dirname, filename);
}

function loadfile(filename) {
    return fs.readFileSync(fileName(filename), "utf8").toString();
}
