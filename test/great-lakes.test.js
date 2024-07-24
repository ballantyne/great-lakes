process.env.NODE_ENV = 'test';
var path   = require('path');
var assert = require('assert');

var {
  construct,
  requireJSON,
  alphabetize,
  get,
  sway
} = require(path.join(__dirname, '..'));

describe('GreatLakes', () => {
  describe('constructObject', () => {

    it('create some kind of object', (done) => {
      var applyOptions = construct(requireJSON(path.join(__dirname, 'data', 'fake-options')));
      var options = applyOptions('default', 'another', {yetAnother: true});

      assert.equal(options.test, true)
      assert.equal(options.notTest, false)
      assert.equal(options.yetAnother, true)

      done();
    });
  });

  describe('alphabetize', function() {
    it('should reorder the objs', function() {
      var sorted = alphabetize({z: 1, g: {z: 1, a: 3}, a: 0});
      assert.equal(Object.keys(sorted.g)[1], 'z');
      assert.equal(Object.keys(sorted)[0], 'a');
    });
  });

  describe('sway', function() {
    
    // i don't know if this is the best way to collect the value for the key.
    it('should identify noTag', function() {
      var transitions = [
	{
	  "name": "findNoTag",
	  "trigger": {
	    "type": "noTag"
	  },
	  "action": "next_key"
	}
      ]

      var modulator = sway(transitions);
      
      var modulations = modulator('state', 'test') ;
      assert.equal(modulations.length, 1);
      
      var modulations = modulator('state', '<test') ;
      assert.equal(modulations.length, 0);
     
      var modulations = modulator('state', 'test>') ;
      assert.equal(modulations.length, 0);
    });
  });

});


