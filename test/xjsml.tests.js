var assert = require('chai').assert;
var xjsml = require('..');
const fs = require('fs');
const path = require('path');

describe('xjsml', () => {

  const xjsml = new (require('..'))({
    cacheEnabled: false,
    caseSensitive: true,
    javascriptTagAllowed: false,
    callbacksAllowed: true
  });

  it('01 html', () => {
    var filename = 'xjsml/01_html';
    var args = {};
    var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
    var html = loadfile(`${filename}.html`);

    assert.equal(rendered, html);
  });

  
  it('02 single quotes', () => {
    var filename = 'xjsml/02_single_quotes';
    var args = {};
    var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
    var html = loadfile(`xjsml/01_html.html`);

    assert.equal(rendered, html);
  });

  it('03 tag whitespace', () => {
    var filename = 'xjsml/03_tag_whitespace';
    var args = {};
    var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
    var html = loadfile(`xjsml/01_html.html`);

    assert.equal(rendered, html);
  });

  it('04 attribute in var', () => {
    var filename = 'xjsml/04_attribute_in_var';
    var args = {link: "https://github.com/yogsagot/xjsml"};
    var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
    var html = loadfile(`xjsml/01_html.html`);

    assert.equal(rendered, html);
  });

  it('05 attribute in backquotes', () => {
    var filename = 'xjsml/05_attribute_in_backquotes';
    var args = {
      protocol: 'https',
      host: 'github.com',
      username: 'yogsagot',
      project: 'xjsml'
    };
    var rendered = xjsml.renderFile(fileName(`${filename}.xjsml`), args);
    var html = loadfile(`xjsml/01_html.html`);

    assert.equal(rendered, html);
  });

});

function fileName(filename) {
  return path.join(__dirname, filename);
}

function loadfile(filename)  {
  return fs.readFileSync(fileName(filename), "utf8").toString();
}