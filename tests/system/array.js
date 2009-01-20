// ========================================================================
// SC.Array Unit Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var arrays, observer ; // global variables

// Test the SproutCore Array interface on a custom object.
DummyArray = SC.Object.extend(SC.Array, {
  
  length: 0,
  
  content: null,
  
  replace: function(idx, amt, objects) {
    if (!this.content) this.content = [] ;

    this.beginPropertyChanges() ;
    this.content.replace(idx,amt,objects) ;
    
    this.set('length', this.content.length) ;
    this.enumerableContentDidChange() ;
    this.endPropertyChanges() ;
  },
  
  objectAt: function(idx) {
    if (!this.content) this.content = [] ;
    return this.content[idx] ;
  }
  
});

module("Array, DummyArray and SC.SparseArray", {

  setup: function() {
    arrays = [[], DummyArray.create(), SC.SparseArray.create()] ;
    
    // this will record observed changes.
    observer = SC.Object.create({
      
      init: function() {
        arguments.callee.base.apply(this, arguments) ; // sc_super() ;
        
        var that = this ;
        this.observer = function(target, key, value) {
          that.notified[key] = true ;
          that.notifiedValue[key] = value ;
        }.bind(this) ;
      
        this.resetObservers = function() {
          this.notified = {} ;
          this.notifiedValue = {} ;
        } ;
      
        this.observe = function() {
          var keys = SC.$A(arguments) ;
          var loc = keys.length ;
          while(--loc >= 0) {
            this.a.addObserver(keys[loc], this, this.observer) ;
          }
        };
      
        this.didNotify = function(key) {
          return this.notified[key] == true ;
        } ;
        
        this.resetObservers() ;
      }
    });
  }
  
});

test("[].replace(0,0,'X') => ['X'] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.observe('[]') ;
    observer.a.replace(0,0,['X']) ;
    
    equals(observer.a.length, 1) ;
    equals(observer.a.objectAt(0), 'X') ;
    equals(YES, observer.didNotify('[]'), 'didNotify([])') ;
  }
});

test("[A,B,C,D].replace(1,2,X) => [A,X,D] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0,0, $w('A B C D')) ;
    observer.observe('[]') ;
    
    observer.a.replace(1,2,['X']) ;
    
    equals(observer.a.get('length'), 3) ;
    equals(observer.a.objectAt(0), 'A') ;
    equals(observer.a.objectAt(1), 'X') ;
    equals(observer.a.objectAt(2), 'D') ;
    equals(observer.didNotify("[]"), YES) ;
  }
});

test("[A,B,C,D].replace(1,2,[X,Y]) => [A,X,Y,D] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0,0, $w('A B C D')) ;
    observer.observe('[]') ;
    
    observer.a.replace(1,2, $w('X Y')) ;
    
    equals(observer.a.get('length'), 4) ;
    equals(observer.a.objectAt(0), 'A') ;
    equals(observer.a.objectAt(1), 'X') ;
    equals(observer.a.objectAt(2), 'Y') ;
    equals(observer.a.objectAt(3), 'D') ;
    equals(observer.didNotify("[]"), YES) ;
  }
});

test("[A,B].replace(1,0,[X,Y]) => [A,X,Y,B] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0,0, $w('A B')) ;
    observer.observe('[]') ;
    
    observer.a.replace(1,0, $w('X Y')) ;
    
    equals(observer.a.get('length'), 4) ;
    equals(observer.a.objectAt(0), 'A') ;
    equals(observer.a.objectAt(1), 'X') ;
    equals(observer.a.objectAt(2), 'Y') ;
    equals(observer.a.objectAt(3), 'B') ;
    equals(observer.didNotify("[]"), YES) ;
  }
});

test("[A,B,C,D].replace(2,2) => [A,B] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0,0, $w('A B C D')) ;
    observer.observe('[]') ;
    
    observer.a.replace(2,2) ;
    
    equals(observer.a.get('length'), 2) ;
    equals(observer.a.objectAt(0), 'A') ;
    equals(observer.a.objectAt(1), 'B') ;
    equals(observer.didNotify("[]"), YES) ;
  }
});

test("[].insertAt(0,X) => [X] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.observe('[]') ;
    
    observer.a.insertAt(0,['X']) ;
    
    equals(observer.a.get('length'), 1) ;
    equals(observer.a.objectAt(0), 'X') ;
    equals(observer.didNotify("[]"), YES) ;
  }
});

test("[].removeObject(obj) should remove regardless of index position", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    // spec for bug in Rev:402 where removeObject was skipping index 0 when scanning the array
    observer.a.set('[]', $w('A B C')) ;
    equals(observer.a.get('length'), 3) ;
    
    observer.a.removeObject('C') ;
    equals(observer.a.get('length'), 2) ;
    observer.a.removeObject('B') ;
    equals(observer.a.get('length'), 1) ;
    observer.a.removeObject('A') ;
    equals(observer.a.get('length'), 0) ;
  }
});

test("[].objectAt(0) => undefined", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    equals(observer.a.get('length'), 0) ;
    equals((observer.a.objectAt(0) === undefined), YES) ;
  }
});

test("[A,B,C].objectAt(5) => undefined", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    equals(observer.a.get('length'), 0) ;
    observer.a.set('[]', $w('A B C')) ;
    equals(observer.a.get('length'), 3) ;
    equals(observer.a.objectAt(0), 'A') ;
    equals((observer.a.objectAt(5) === undefined), YES) ;
  }
});

test("[A,B,C].set('[]',[X,Y]) => [X,Y] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0,0, $w('A B C')) ;
    observer.observe('[]') ;
    
    observer.a.set('[]', $w('X Y')) ;
    
    equals(observer.a.get('length'), 2) ;
    equals(observer.a.objectAt(0), 'X') ;
    equals(observer.a.objectAt(1), 'Y') ;
    equals(observer.didNotify('[]'), YES) ;
  }
});

test("[A,B,C] should be Enumerable", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0, 0, $w('A B C')) ;
    
    var cnt = 0 ;
    var items = [] ;
    observer.a.forEach(function( item, idx ) {
      items.push(item) ;
      cnt++ ;
    }) ;
    equals(cnt, observer.a.get('length')) ;
    equals('A', items[0]) ;
    equals('B', items[1]) ;
    equals('C',items[2]) ;
  }
});

test("ary.isEqual() should return true when array contents match", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0,0, $w('A B C')) ;
    
    var ary = $w('A B C') ; // test against a different object.
    equals(observer.a.isEqual(ary), true) ;
    
    ary = $w('A B') ;
    equals(observer.a.isEqual(ary), false) ;
    
    ary = $w('X Y Z') ;
    equals(observer.a.isEqual(ary), false) ;
    
    equals(observer.a.isEqual(observer.a), true) ;
  }
});
