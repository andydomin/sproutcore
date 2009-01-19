// ========================================================================
// SC.Set Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var a, b, c ; // global variables

module("creating SC.Set instances", {
  
  setup: function() {
    // create objects...
    a = { name: "a" } ;
    b = { name: "b" } ;
    c = { name: "c" } ;
  },
  
  teardown: function() {
    a = undefined ;
    b = undefined ;
    c = undefined ;
  }
  
});

test("new SC.Set() should create empty set", function() {
  var set = new SC.Set() ;
  equals(set.length, 0) ;
});

test("new SC.Set([1,2,3]) should create set with three items in them", function() {
  var set = new SC.Set([a,b,c]) ;
  equals(set.length, 3) ;
  equals(set.contains(a), YES) ;
  equals(set.contains(b), YES) ;
  equals(set.contains(c), YES) ;
});

test("SC.Set.create() is an alias for new SC.Set()", function() {
  var set = SC.Set.create() ;
  equals(set.length, 0) ;
  
  var set = SC.Set.create([a,b,c]) ;
  equals(set.length, 3) ;
  equals(set.contains(a), YES) ;
  equals(set.contains(b), YES) ;
  equals(set.contains(c), YES) ;
});

test("new SC.Set() should accept anything that implements SC.Array", function() {
  var arrayLikeObject = SC.Object.create(SC.Array, {
    _content: [a,b,c],
    length: 3,
    objectAt: function(idx) { return this._content[idx]; } 
  }) ;
  
  var set = SC.Set.create(arrayLikeObject) ;
  equals(set.length, 3) ;
  equals(set.contains(a), YES) ;
  equals(set.contains(b), YES) ;
  equals(set.contains(c), YES) ;
});

test("new SC.Set() should accept anything that looks like an array, even if it does not implement SC.Array", function() {
  var arrayLikeObject = { length: 3, '0': a, '1': b, '2': c } ;
  
  var set = SC.Set.create(arrayLikeObject) ;
  equals(set.length, 3) ;
  equals(set.contains(a), YES) ;
  equals(set.contains(b), YES) ;
  equals(set.contains(c), YES) ;
});

var set ; // global variables

// The tests below also end up testing the contains() method pretty 
// exhaustively.
module("SC.Set.add + SC.Set.contains", {
  
  setup: function() {
    set = SC.Set.create() ;
  },
  
  teardown: function() {
    set = undefined ;
  }
  
});

test("should add an SC.Object", function() {
  var obj = SC.Object.create() ;
  
  var oldLength = set.length ;
  set.add(obj) ;
  equals(set.contains(obj), YES, "contains()") ;
  equals(oldLength+1, set.length, "new set length") ;
});

test("should add a regular hash", function() {
  var obj = {} ;
  
  var oldLength = set.length ;
  set.add(obj) ;
  equals(set.contains(obj), YES, "contains()") ;
  equals(oldLength+1, set.length, "new set length") ;
});

test("should add a string", function() {
  var obj = "String!" ;
  
  var oldLength = set.length ;
  set.add(obj) ;
  equals(set.contains(obj), YES, "contains()") ;
  equals(oldLength+1, set.length, "new set length") ;
});

test("should add a number", function() {
  var obj = 23 ;
  
  var oldLength = set.length ;
  set.add(obj) ;
  equals(set.contains(obj), YES, "contains()") ;
  equals(oldLength+1, set.length, "new set length") ;
});

test("should add a bool", function() {
  var obj = true ;
  
  var oldLength = set.length ;
  set.add(obj) ;
  equals(set.contains(obj), YES, "contains()") ;
  equals(oldLength+1, set.length, "new set length") ;
});

test("should add a function", function() {
  var obj = function() { return "Test function"; } ;
  
  var oldLength = set.length ;
  set.add(obj) ;
  equals(set.contains(obj), YES, "contains()") ;
  equals(oldLength+1, set.length, "new set length") ;
});

test("should NOT add a null", function() {
  set.add(null) ;
  equals(set.length, 0) ;
  equals(set.contains(null), NO) ;
});

test("should NOT add an undefined", function() {
  set.add(undefined) ;
  equals(set.length, 0) ;
  equals(set.contains(undefined), NO) ;
});

test("adding an item, removing it, adding another item", function() {
  var item1 = "item1" ;
  var item2 = "item2" ;

  set.add(item1) ; // add to set
  set.remove(item1) ; //remove from set
  set.add(item2) ;
  
  equals(NO, set.contains(item1), "set.contains(item1)") ;
  
  set.add(item1) ; // re-add to set
  equals(2, set.length, "set.length") ;
});

module("SC.Set.remove + SC.Set.contains", {
  
  // generate a set with every type of object, but none of the specific
  // ones we add in the tests below...
  setup: function() {
    set = SC.Set.create([
      SC.Object.create({ dummy: YES }),
      { isHash: YES },
      "Not the String",
      16, false]) ;
  },
  
  teardown: function() {
    set = undefined ;
  }
  
});

test("should remove an SC.Object and reduce length", function() {
  var obj = SC.Object.create() ;
  set.add(obj) ;
  equals(set.contains(obj), YES) ;
  var oldLength = set.length ;
  
  set.remove(obj) ;
  equals(NO, set.contains(obj), "should be removed") ;
  equals(oldLength-1, set.length, "should be 1 shorter") ;
});

test("should remove a regular hash and reduce length", function() {
  var obj = {} ;
  set.add(obj) ;
  equals(set.contains(obj), YES) ;
  var oldLength = set.length ;
  
  set.remove(obj) ;
  equals(NO, set.contains(obj), "should be removed") ;
  equals(oldLength-1, set.length, "should be 1 shorter") ;
});

test("should remove a string and reduce length", function() {
  var obj = "String!" ;
  set.add(obj) ;
  equals(set.contains(obj), YES) ;
  var oldLength = set.length ;
  
  set.remove(obj) ;
  equals(NO, set.contains(obj), "should be removed") ;
  equals(oldLength-1, set.length, "should be 1 shorter") ;
});

test("should remove a number and reduce length", function() {
  var obj = 23 ;
  set.add(obj) ;
  equals(set.contains(obj), YES) ;
  var oldLength = set.length ;
  
  set.remove(obj) ;
  equals(NO, set.contains(obj), "should be removed") ;
  equals(oldLength-1, set.length, "should be 1 shorter") ;
});

test("should remove a bool and reduce length", function() {
  var obj = true ;
  set.add(obj) ;
  equals(set.contains(obj), YES) ;
  var oldLength = set.length ;
  
  set.remove(obj) ;
  equals(NO, set.contains(obj), "should be removed") ;
  equals(oldLength-1, set.length, "should be 1 shorter") ;
});

test("should remove a function and reduce length", function() {
  var obj = function() { return "Test function"; } ;
  set.add(obj) ;
  equals(set.contains(obj), YES) ;
  var oldLength = set.length ;
  
  set.remove(obj) ;
  equals(NO, set.contains(obj), "should be removed") ;
  equals(oldLength-1, set.length, "should be 1 shorter") ;
});

test("should NOT remove a null", function() {
  var oldLength = set.length ;
  set.remove(null) ;
  equals(oldLength, set.length) ;
});

test("should NOT remove an undefined", function() {
  var oldLength = set.length ;
  set.remove(undefined) ;
  equals(oldLength, set.length) ;
});

test("should ignore removing an object not in the set", function() {
  var obj = SC.Object.create() ;
  var oldLength = set.length ;
  set.remove(obj) ;
  equals(oldLength, set.length) ;
});
