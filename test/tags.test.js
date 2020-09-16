var assert = require('chai').assert;
describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe('xjsml', () => {
  it('two plus two', () => {
    assert(2+2==4, "two plus two");
  });

  it('fails', () => {
    assert.fail('lol');
  });
});