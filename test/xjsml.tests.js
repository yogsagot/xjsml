var assert = require("chai").assert;
var XJSML = require("..");
const fs = require("fs");
const path = require("path");

describe("xjsml", () => {
    const xjsml = new XJSML({
        cacheEnabled: false,
        caseSensitive: true,
        javascriptTagAllowed: false,
        callbacksAllowed: true,
    });

    it("01 html", () => {
        var filename = "xjsml/01 html";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("01-1 attribute is number", () => {
        var filename = "xjsml/01-1 attribute is number";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("01-2 attribute is exponent number", () => {
        var filename = "xjsml/01-2 attribute is exponent number";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("01-3 attribute is hex number", () => {
        var filename = "xjsml/01-3 attribute is hex number";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("02 single quotes", () => {
        var filename = "xjsml/02 single quotes";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("02-1 escaped quote", () => {
        var filename = "xjsml/02-1 escaped quote";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("02-2 single quote inside double quote", () => {
        var filename = "xjsml/02-2 single quote inside double quote";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    //TODO: single quotes should not be escaped
    it("02-3 escaped single quote", () => {
        var filename = "xjsml/02-3 escaped single quote";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    //TODO Douvle quote should be escaped
    it("02-4 double quote inside single quote", () => {
        var filename = "xjsml/02-4 double quote inside single quote";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("02-5 backquote inside single quote", () => {
        var filename = "xjsml/02-5 backquote inside single quote";
        var args = {
            var: 'test'
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("02-6 backquote inside doule quote", () => {
        var filename = "xjsml/02-6 backquote inside doule quote";
        var args = {
            var: 'test'
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("03 tag whitespace", () => {
        var filename = "xjsml/03 tag whitespace";
        var args = {};
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("04 attribute in var", () => {
        var filename = "xjsml/04 attribute in var";
        var args = {
            link: "https://github.com/yogsagot/xjsml",
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("05 attribute in backquotes", () => {
        var filename = "xjsml/05 attribute in backquotes";
        var args = {
            protocol: "https",
            host: "github.com",
            username: "yogsagot",
            project: "xjsml",
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("06 attribute in statement", () => {
        var filename = "xjsml/06 attribute in statement";
        var args = {
            protocol: "https",
            host: "github.com",
            username: "yogsagot",
            project: "xjsml",
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    //TODO strip extra brackets
    it("07 attribute in complex statement", () => {
        var filename = "xjsml/07 attribute in complex statement";
        var args = {
            variable: 5 * 5,
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("08 attribute in object field", () => {
        var filename = "xjsml/08 attribute in object field";
        var args = {
            obj: {
                link: "https://github.com/yogsagot/xjsml"
            }
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("09 attribute in object nested field", () => {
        var filename = "xjsml/09 attribute in object nested field";
        var args = {
            obj: {
                nestedobj: {
                    link: "https://github.com/yogsagot/xjsml"
                }
            }
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("10 attribute in array item", () => {
        var filename = "xjsml/10 attribute in array item";
        var args = {
            arr: ['item1', 'item2', "https://github.com/yogsagot/xjsml", 'item4']
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    //TODO strip extra brackets
    it("11 attribute in nested array item", () => {
        var filename = "xjsml/11 attribute in nested array item";
        var args = {
            arr: [
                [],
                ['item1', 'item2', "https://github.com/yogsagot/xjsml", 'item4'],
                [1, 2, 3]
            ]
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("12 attribute in function", () => {
        var filename = "xjsml/12 attribute in function";
        var args = {
            protocol: "https",
            host: "github.com",
            username: "yogsagot",
            project: "xjsml",
            func: function (protocol, host, username, project) {
                return `${protocol}://${host}/${username}/${project}`;
            }
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("13 attribute in method", () => {
        var filename = "xjsml/13 attribute in method";
        var args = {
            obj: {
                protocol: "https",
                host: "github.com",
                username: "yogsagot",
                project: "xjsml",
                func: function () {
                    return `${this.protocol}://${this.host}/${this.username}/${this.project}`;
                }
            }
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("14 attribute in method params", () => {
        var filename = "xjsml/14 attribute in method params";
        var args = {
            protocol: "https",
            host: "github.com",
            username: "yogsagot",
            project: "xjsml",
            obj: {
                func: function (protocol, host, username, project) {
                    return `${protocol}://${host}/${username}/${project}`;
                }
            }
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    //TODO strip extra brackets
    it("15 attribute in array item func", () => {
        var filename = "xjsml/15 attribute in array item func";
        var args = {
            protocol: "https",
            host: "github.com",
            username: "yogsagot",
            project: "xjsml",
            arr: ['item1', 2, function (protocol, host, username, project) {
                return `${protocol}://${host}/${username}/${project}`;
            }, 'other item']
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    //TODO strip extra brackets
    it("16 attribute in array item method", () => {
        var filename = "xjsml/16 attribute in array item method";
        var args = {
            protocol: "https",
            host: "github.com",
            username: "yogsagot",
            project: "xjsml",
            arr: ['item1', 2, {
                func: function (protocol, host, username, project) {
                    return `${protocol}://${host}/${username}/${project}`;
                }
            }, 'other item']
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    //TODO strip extra brackets
    it("17 attribute in obj field array item", () => {
        var filename = "xjsml/17 attribute in obj field array item";
        var args = {
            protocol: "https",
            host: "github.com",
            username: "yogsagot",
            project: "xjsml",
            obj: {
                arr: ['item1', 2, function (protocol, host, username, project) {
                    return `${protocol}://${host}/${username}/${project}`;
                }, 'other item']
            }
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    //TODO strip extra brackets
    it("18 attribute in obj field array method", () => {
        var filename = "xjsml/18 attribute in obj field array method";
        var args = {
            protocol: "https",
            host: "github.com",
            username: "yogsagot",
            project: "xjsml",
            obj: {
                arr: ['item1', 2, {
                    func: function (protocol, host, username, project) {
                        return `${protocol}://${host}/${username}/${project}`;
                    }
                }, 'other item']
            }
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`xjsml/01 html.html`);

        assert.equal(rendered, html);
    });

    it("19 attribute list in array", () => {
        var filename = "xjsml/19 attribute list in array";
        var args = {
            classvar1: "firstclass",
            classvar2: 'secondclass',
            backquotevar: 'backquotevalue',
            flag: false,
            boolvar1: "boolvalue1",
            boolvar2: "boolvalue2",
            classarr: ["arrclass1", 'arrclass2', 'anotherarrclass']
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("20 attribute list in array var", () => {
        var filename = "xjsml/20 attribute list in array var";
        var classvar1 = "firstclass";
        var classvar2 = 'secondclass';
        var backquotevar = 'backquotevalue';
        var flag = false;
        var boolvar1 = "boolvalue1";
        var boolvar2 = "boolvalue2";
        var classarr = ["arrclass1", 'arrclass2', 'anotherarrclass']
        var args = {
            arr: ['value1', "value2", classvar1, classvar2, `${backquotevar}`, (flag ? boolvar1 : boolvar2), ...classarr]
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("21 attribute list in array join", () => {
        var filename = "xjsml/21 attribute list in array join";
        var args = {
            classvar1: "firstclass",
            classvar2: 'secondclass',
            backquotevar: 'backquotevalue',
            flag: false,
            boolvar1: "boolvalue1",
            boolvar2: "boolvalue2",
            classarr: ["arrclass1", 'arrclass2', 'anotherarrclass']
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("22 attribute list in array var join", () => {
        var filename = "xjsml/22 attribute list in array var join";
        var classvar1 = "firstclass";
        var classvar2 = 'secondclass';
        var backquotevar = 'backquotevalue';
        var flag = false;
        var boolvar1 = "boolvalue1";
        var boolvar2 = "boolvalue2";
        var classarr = ["arrclass1", 'arrclass2', 'anotherarrclass']
        var args = {
            arr: ['value1', "value2", classvar1, classvar2, `${backquotevar}`, (flag ? boolvar1 : boolvar2), ...classarr]
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("23 attribute list in obj", () => {
        var filename = "xjsml/23 attribute list in obj";
        var args = {
            var1: "variable1",
            var2: 26,
            boolvar: true,
            var3: 'head'
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("24 attribute list in obj var", () => {
        var filename = "xjsml/24 attribute list in obj var";
        var var1 = "variable1";
        var var2 = 26;
        var boolvar = true;
        var var3 = 'head';
        var args = {
            obj: {
                attr1: "test",
                attr2: 10.2,
                attr3: var1,
                attr4: var2 * 2,
                attr5: (boolvar ? var3 + 'tail' : "test")
            }
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });


    it("25 attribute list in obj join", () => {
        var filename = "xjsml/25 attribute list in obj join";
        var args = {
            var1: "variable1",
            var2: 26,
            boolvar: true,
            var3: 'head'
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });

    it("26 attribute list in obj var join", () => {
        var filename = "xjsml/26 attribute list in obj var join";
        var var1 = "variable1";
        var var2 = 26;
        var boolvar = true;
        var var3 = 'head';
        var args = {
            obj: {
                attr1: "test",
                attr2: 10.2,
                attr3: var1,
                attr4: var2 * 2,
                attr5: (boolvar ? var3 + 'tail' : "test")
            }
        };
        var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
        var html = loadfile(`${filename}.html`);

        assert.equal(rendered, html);
    });
});

function fileName(filename) {
    return path.join(__dirname, filename);
}

function loadfile(filename) {
    return fs.readFileSync(fileName(filename), "utf8").toString();
}