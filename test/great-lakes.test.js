process.env.NODE_ENV = 'test';
var path   = require('path');
var assert = require('assert');

var fs = require('fs');

var {
  cp,
  construct,
  requireJSON,
  alphabetize,
  get,
  sway,
  restack
} = require(path.join(__dirname, '..'));

describe('GreatLakes', () => {


  describe('restack', () => {

    it('should create an array for parsing', (done) => {
      var html = '<div class="row"><div class="col-md-6"><dl><dt>Business Type</dt><dd>Limited Liability Company (Domestic)</dd></dl></div><div class="col-md-6"><dl><dt>MN Statute</dt><dd>322C</dd></dl></div></div><div class="row"><div class="col-md-6"><dl><dt>File Number</dt><dd>4419236-2</dd></dl></div><div class="col-md-6"><dl><dt>Home Jurisdiction</dt><dd>Minnesota</dd></dl></div></div><div class="row"><div class="col-md-6"><dl><dt>Filing Date</dt><dd>08/22/2011</dd></dl></div><div class="col-md-6"><dl><dt>Status</dt><dd>Inactive</dd></dl></div></div><div class="row"><div class="col-md-6"><dl><dt>Renewal Due Date</dt><dd>12/31/2022</dd></dl></div><div class="col-md-6"><dl><dt>Registered Office Address</dt><dd><address>1779 Hampshire Ave<br />St Paul, MN 55116<br />USA</address></dd></dl></div></div><div class="row"><div class="col-md-6"><dl><dt>Registered Agent(s)</dt><dd>Ellen Hart-Shegos</dd></dl></div><div class="col-md-6"><dl><dt>Manager</dt><dd>Ellen Hart-Shegos</dd><dd><address>1779 Hampshire Ave<br />St Paul, MN 55116<br />USA</address></dd></dl></div></div><div class="row"><div class="col-md-6"><dl><dt>Principal Executive Office Address</dt><dd><address>1779 Hampshire Ave<br />St Paul, MN 55116<br />USA</address></dd></dl></div></div>'
      
      var parts = restack(html);
      done();
    });


  });


  describe('structuredClone', () => {

    it('this is meant to replace JSON.parse, JSON.stringify', (done) => {
      var options = requireJSON(path.join(__dirname, 'data', 'fake-options'));
      var copiedOptions = cp(options);

      //console.log('not the same',options !== copiedOptions);

      assert.deepEqual(options, copiedOptions);

      done();
    });
  });


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


