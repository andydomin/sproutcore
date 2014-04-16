// ==========================================================================
// Project:   SC.TextFieldView hintON Unit Test
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals module test ok equals same stop start */

module("SC.TextFieldView hintON", {

  setup: function() {
    tfv = SC.TextFieldView.create({});
  },

  teardown: function() {
    tfv = null ;
  }
});


test("By default, hintON should be true", function() {
  SC.RunLoop.begin();
  SC.RunLoop.end();
  var expected = YES;
  var result   = tfv.get('hintON');
  equals(result, expected, "hintON should true");
});

test("hintON should be false if value is set", function() {
  SC.RunLoop.begin();
  tfv.set('value', "test");
  SC.RunLoop.end();
  var expected = NO;
  var result   = tfv.get('hintON');
  equals(result, expected, "hintON should be false");
});

test("hintON should be false if the value is numeric", function() {
  SC.RunLoop.begin();
  tfv.set('value', 1);
  SC.RunLoop.end();
  var expected = NO;
  var result   = tfv.get('hintON');
  equals(result, expected, "hintON should be false");
});
