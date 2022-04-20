var XJSML = require("../../lib/xjsml");
var assert = require("chai").assert;
const fs = require("fs");
const path = require("path");

describe("tags", () => {
    describe("forloop", () => {
        const xjsml = new XJSML({
            cacheEnabled: false,
            caseSensitive: true,
            javascriptTagAllowed: false,
            callbacksAllowed: true,
        });

        it("01 forloop array", () => {
            var templatename = "07 forloop/01 forloop array";
            var filename = "07 forloop/01 forloop array";
            var args = {arr: ["item1", 10, 5.55, (10+10)]};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("02 forloop array src", () => {
            var templatename = "07 forloop/02 forloop array src";
            var filename = "07 forloop/01 forloop array";
            var args = {arr: ["item1", 10, 5.55, (10+10)]};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("03 forloop array item", () => {
            var templatename = "07 forloop/03 forloop array item";
            var filename = "07 forloop/01 forloop array";
            var args = {arr: ["item1", 10, 5.55, (10+10)]};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("04 forloop array key", () => {
            var templatename = "07 forloop/04 forloop array key";
            var filename = "07 forloop/01 forloop array";
            var args = {arr: ["item1", 10, 5.55, (10+10)]};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("05 forloop array key item", () => {
            var templatename = "07 forloop/05 forloop array key item";
            var filename = "07 forloop/01 forloop array";
            var args = {arr: ["item1", 10, 5.55, (10+10)]};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("06 forloop array item key", () => {
            var templatename = "07 forloop/06 forloop array item key";
            var filename = "07 forloop/01 forloop array";
            var args = {arr: ["item1", 10, 5.55, (10+10)]};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("07 forloop array item key src", () => {
            var templatename = "07 forloop/07 forloop array item key src";
            var filename = "07 forloop/01 forloop array";
            var args = {arr: ["item1", 10, 5.55, (10+10)]};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("08 forloop object", () => {
            var templatename = "07 forloop/08 forloop object";
            var filename = "07 forloop/08 forloop object";
            var args = {obj: {
                item1: "item1",
                item2: 10,
                item3: 5.55,
                item4: (10+10)
            }};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("09 forloop object src", () => {
            var templatename = "07 forloop/09 forloop object src";
            var filename = "07 forloop/08 forloop object";
            var args = {obj: {
                item1: "item1",
                item2: 10,
                item3: 5.55,
                item4: (10+10)
            }};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("10 forloop object item", () => {
            var templatename = "07 forloop/10 forloop object item";
            var filename = "07 forloop/08 forloop object";
            var args = {obj: {
                item1: "item1",
                item2: 10,
                item3: 5.55,
                item4: (10+10)
            }};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("11 forloop object key", () => {
            var templatename = "07 forloop/11 forloop object key";
            var filename = "07 forloop/08 forloop object";
            var args = {obj: {
                item1: "item1",
                item2: 10,
                item3: 5.55,
                item4: (10+10)
            }};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("12 forloop object key item", () => {
            var templatename = "07 forloop/12 forloop object key item";
            var filename = "07 forloop/08 forloop object";
            var args = {obj: {
                item1: "item1",
                item2: 10,
                item3: 5.55,
                item4: (10+10)
            }};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("13 forloop object item key", () => {
            var templatename = "07 forloop/13 forloop object item key";
            var filename = "07 forloop/08 forloop object";
            var args = {obj: {
                item1: "item1",
                item2: 10,
                item3: 5.55,
                item4: (10+10)
            }};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("14 forloop object item key src", () => {
            var templatename = "07 forloop/14 forloop object item key src";
            var filename = "07 forloop/08 forloop object";
            var args = {obj: {
                item1: "item1",
                item2: 10,
                item3: 5.55,
                item4: (10+10)
            }};
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("15 nested forloop array array", () => {
            var templatename = "07 forloop/15 nested forloop array object";
            var filename = "07 forloop/15 nested forloop array object";
            var args = {
                arr: [
                    ["item1", "item2", "item3"],
                    [10, 20, 30],
                    [1.11, 2.22, 3.33]
                ]
            };
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("16 nested forloop array object", () => {
            var templatename = "07 forloop/15 nested forloop array object";
            var filename = "07 forloop/16 nested forloop array object";
            var args = {
                arr: [
                    {
                        key11: "item1",
                        key12: "item2",
                        key13: "item3"
                    },
                    {
                        key21: 10,
                        key22: 20,
                        key23: 30
                    },
                    {
                        key31: 1.11,
                        key32: 2.22,
                        key33: 3.33
                    }
                ]
            };
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("17 nested forloop object array", () => {
            var templatename = "07 forloop/17 nested forloop object array";
            var filename = "07 forloop/17 nested forloop object array";
            var args = {
                obj: {
                    arr1: ["item1", "item2", "item3"],
                    arr2: [10, 20, 30],
                    arr3: [1.11, 2.22, 3.33]
                }
            };
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("18 nested forloop object object", () => {
            var templatename = "07 forloop/17 nested forloop object array";
            var filename = "07 forloop/18 nested forloop object object";
            var args = {
                obj: {
                    obj1: {
                        key11: "item1",
                        key12: "item2",
                        key13: "item3"
                    },
                    obj2: {
                        key21: 10,
                        key22: 20,
                        key23: 30
                    },
                    obj3: {
                        key31: 1.11,
                        key32: 2.22,
                        key33: 3.33
                    }
                }
            };
            var rendered = xjsml.renderFile(fileName(`${templatename}.xjsml`), args);
            var html = loadfile(`${filename}.html`);

            assert.equal(rendered, html);
        });

        it("19 forloop exception source undefined", () => {
            var filename = "07 forloop/01 forloop array";
            var args = {};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /ReferenceError: arr is not defined .* on line 3/);
        });

        it("20 forloop exception key undefined", () => {
            var filename = "07 forloop/20 forloop exception key undefined";
            var args = {arr: ["item1", 10, 5.55, (10+10)]};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /ReferenceError: key is not defined .* on line 4/);
        });

        it("21 forloop exception item undefined", () => {
            var filename = "07 forloop/21 forloop exception item undefined";
            var args = {arr: ["item1", 10, 5.55, (10+10)]};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /ReferenceError: item is not defined .* on line 4/);
        });

        it("22 nested forloop exception key already defined", () => {
            var filename = "07 forloop/22 nested forloop exception key already defined";
            var args = {
                arr: [
                    ["item1", "item2", "item3"],
                    [10, 20, 30],
                    [1.11, 2.22, 3.33]
                ]
            };
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /Cannot render for loop: key variable key already declared .* on line 5/);
        });

        it("23 nested forloop exception item already defined", () => {
            var filename = "07 forloop/23 nested forloop exception item already defined";
            var args = {
                arr: [
                    ["item1", "item2", "item3"],
                    [10, 20, 30],
                    [1.11, 2.22, 3.33]
                ]
            };
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /Cannot render for loop: item variable item1 already declared .* on line 5/);
        });

        it("24 forloop exception source not array and not object", () => {
            var filename = "07 forloop/01 forloop array";
            var args = {arr: "test"};
            function callRender() {
                xjsml.renderFile(fileName(`${filename}.xjsml`), args)
            }
            assert.throws(callRender, /For tag must accept an array or an object as a parameter .* on line 3/);
        });
    });
});

function fileName(filename) {
    return path.join(__dirname, filename);
}

function loadfile(filename) {
    return fs.readFileSync(fileName(filename), "utf8").toString();
}