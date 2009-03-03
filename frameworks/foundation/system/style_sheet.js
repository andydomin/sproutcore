// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('system/css_rule') ;

/**
  @class SC.StyleSheet

  A style sheet object wraps a document style sheet object. SC.StyleSheet will
  re-use stylesheet objects as needed.
  
  @extends SC.Object
*/
SC.StyleSheet = SC.Object.extend(
/** @scope SC.StyleSheet.prototype */ {
  
  init: function() {
    sc_super() ;
    
    if (!this.styleSheet) {
      // create the stylesheet object the hard way (works everywhere)
      this.styleSheet = document.createElement('style') ;
      this.styleSheet.type = 'text/css' ;
      var head = document.getElementsByTagName('head')[0] ;
      if (!head) head = document.documentElement ; // fix for Opera
      head.appendChild(this.styleSheet) ;
    }
    
    // cache this object for later
    var ssObjects = this.constructor.styleSheets ;
    if (!ssObjects) ssObjects = this.constructor.styleSheets = {} ;
    ssObjects[SC.guidFor(this)] ;
    
    // create rules array
    var array = SC.SparseArray.create(this.styleSheet.rules.length) ;
    array.delegate = this ;
    this.rules = array ;
    
    return this ;
  },
  
  /**
    @property {CSSStyleSheet} RO
  */
  styleSheet: null,
  
  /**
    @property {String}
  */
  href: function(key, val) {
    if (val !== undefined) {
      this.styleSheet.href = val ;
    }
    else return this.styleSheet.href ;
  }.property(),
  
  /**
    @property {String}
  */
  title: function(key, val) {
    if (val !== undefined) {
      this.styleSheet.title = val ;
    }
    else return this.styleSheet.title ;
  }.property(),
  
  /**
    @property {SC.Array} contains SC.CSSRule objects
  */
  rules: null,
  
  /**
    You can also insert and remove rules on the rules property array.
  */
  insertRule: function(rule) {
    var rules = this.get('rules') ;
  },
  
  /**
    You can also insert and remove rules on the rules property array.
  */
  deleteRule: function(rule) {
    var rules = this.get('rules') ;
    rules.removeObject(rule) ;
  },
  
  /**
    @private
    
    Invoked by the sparse array whenever it needs a particular index 
    provided.  Provide the content for the index.
  */
  sparseArrayDidRequestIndex: function(array, idx) {
    // sc_assert(this.rules === array) ;
    var rule = this.styleSheet.rules[idx] ;
    if (rule) {
      array.provideContentAtIndex(idx, SC.CSSRule.create({ 
        rule: rule,
        styleSheet: this
      })); 
    }
  },
  
  /** @private synchronize the browser's rules array with our own */
  sparseArrayDidReplace: function(array, idx, amt, objects) {
    var cssRules = objects.collect(function(obj) { return obj.rule; }) ;
    this.styleSheet.rules.replace(idx, amt, cssRules) ;
  }
  
});

SC.mixin(SC.StyleSheet,
/** SC.StyleSheet */{
  
  /**
    Find a stylesheet object by name or href. If by name, .css will be 
    appendend automatically.
    
    {{{
      var ss = SC.StyleSheet.find('style.css') ;
      var ss2 = SC.StyleSheet.find('style') ; // same thing
      sc_assert(ss === ss2) ; // SC.StyleSheet objects are stable
    }}}
    
    @param {String} nameOrUrl a stylsheet name or href to find
    @returns {SC.StyleSheet} null if not found
  */
  find: function(nameOrUrl) {
    var isUrl = nameOrUrl ? nameOrUrl.indexOf('/') >= 0 : NO ;
    
    if (!nameOrUrl) return null ; // no name or url? fail!
    
    if (!isUrl && nameOrUrl.indexOf('.css') == -1) {
      nameOrUrl = nameOrUrl + '.css' ;
    }
    
    // initialize styleSheet cache
    var ssObjects = this.styleSheets ;
    if (!ssObjects) ssObjects = this.styleSheets = {} ;
    
    var styleSheets = document.styleSheets ;
    var ss, ssName, ssObject, guid ;
    for (var idx=0, len=styleSheets.length; idx < len; ++idx) {
      ss = styleSheets[idx] ;
      if (isUrl) {
        if (ss.href === nameOrUrl) {
          guid = SC.guidFor(ss) ;
          ssObject = ssObjects[guid] ;
          if (!ssObject) {
            // cache for later
            ssObject = ssObjects[guid] = this.create({ styleSheet: ss }) ;
          }
          return ssObject ;
        }
      }
      else {
        if (ssName = ss.href) {
          ssName = ssName.split('/') ; // break up URL
          ssName = ssName[ssName.length-1] ; // get last component
          if (ssName == nameOrUrl) {
            guid = SC.guidFor(ss) ;
            ssObject = ssObjects[guid] ;
            if (!ssObject) {
              // cache for later
              ssObject = ssObjects[guid] = this.create({ styleSheet: ss }) ;
            }
            return ssObject ;
          }
      }
    }
    return null ; // stylesheet not found
  },
  
  styleSheets: null
  
});
