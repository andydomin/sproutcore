// ========================================================================
// SC.guidFor Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var objectA, objectB ; // global variables

module("Object", {
  
  setup: function() {
    objectA = {} ;
    objectB = {} ;
  }
  
});

test("should return same guid for same instance every time", function() {
  equals(SC.guidFor(objectA), SC.guidFor(objectA)) ;
});

test("should return different guid for different instances", function() {
  ok(SC.guidFor(objectA) !==  SC.guidFor(objectB)) ;
});

test("guid should not parse to a number", function() {
  equals(YES, isNaN(parseInt(SC.guidFor(objectA), 0))) ;
});

var stringA, stringACopy, stringB ; // global variables

module("String", {
  
  setup: function() {
    stringA = "string A" ;
    stringACopy = "string A" ;
    stringB = "string B" ;
  }
  
});

test("same string instance should have same guide every time", function() {
  equals(SC.guidFor(stringA), SC.guidFor(stringA)) ;  
});

test("two string instances with same value should have same guid", function() {
  equals(SC.guidFor(stringA), SC.guidFor(stringACopy)) ;  
});

test("two instances with different value should have different guid", function() {
  ok(SC.guidFor(stringA) !==  SC.guidFor(stringB)) ;
});

test("guid should not parse to a number", function() {
  equals(YES, isNaN(parseInt(SC.guidFor(stringA), 0))) ;
});

var numberA, numberACopy, numberB ; // global variables

module("Number", {
  
  setup: function() {
    numberA = 23 ;
    numberACopy = 23 ;
    numberB = 34 ;
  }
  
});

test("same number instance should have same guide every time", function() {
  equals(SC.guidFor(numberA), SC.guidFor(numberA)) ;  
});

test("two number instances with same value should have same guid", function() {
  equals(SC.guidFor(numberA), SC.guidFor(numberACopy)) ;  
});

test("two instances with different value should have different guid", function() {
  ok(SC.guidFor(numberA) !==  SC.guidFor(numberB)) ;
});

test("guid should not parse to a number", function() {
  equals(YES, isNaN(parseInt(SC.guidFor(numberA), 0))) ;
});

module("Boolean") ;

test("should always have same guid", function() {
  equals(SC.guidFor(true), SC.guidFor(true)) ;
  equals(SC.guidFor(false), SC.guidFor(false)) ;
});

test("true should have different guid than false", function() {
  ok(SC.guidFor(true) !==  SC.guidFor(false)) ;
});

test("guid should not parse to a number", function() {
  equals(YES, isNaN(parseInt(SC.guidFor(true), 0))) ;
  equals(YES, isNaN(parseInt(SC.guidFor(false), 0))) ;
});

module("Null and Undefined") ;

test("should always have same guid", function() {
  equals(SC.guidFor(null), SC.guidFor(null)) ;
  equals(SC.guidFor(undefined), SC.guidFor(undefined)) ;
});

test("null should have different guid than undefined", function() {
  ok(SC.guidFor(null) !==  SC.guidFor(undefined)) ;
});

test("guid should not parse to a number", function() {
  equals(YES, isNaN(parseInt(SC.guidFor(null), 0))) ;
  equals(YES, isNaN(parseInt(SC.guidFor(undefined), 0))) ;
});
