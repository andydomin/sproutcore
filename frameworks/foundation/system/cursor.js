// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('system/css_style_sheet') ;

// standard browser cursor definitions
SC.SYSTEM_CURSOR = 'default' ;
SC.AUTO_CURSOR = SC.DEFAULT_CURSOR = 'auto' ;
SC.CROSSHAIR_CURSOR = 'crosshair' ;
SC.HAND_CURSOR = SC.POINTER_CURSOR = 'pointer' ;
SC.MOVE_CURSOR = 'move' ;
SC.E_RESIZE_CURSOR = 'e-resize' ;
SC.NE_RESIZE_CURSOR = 'ne-resize' ;
SC.NW_RESIZE_CURSOR = 'nw-resize' ;
SC.N_RESIZE_CURSOR = 'n-resize' ;
SC.SE_RESIZE_CURSOR = 'se-resize' ;
SC.SW_RESIZE_CURSOR = 'sw-resize' ;
SC.S_RESIZE_CURSOR = 's-resize' ;
SC.W_RESIZE_CURSOR = 'w-resize' ;
SC.IBEAM_CURSOR = SC.TEXT_CURSOR = 'text' ;
SC.WAIT_CURSOR = 'wait' ;
SC.HELP_CURSOR = 'help' ;

/**
  @class SC.Cursor

  A Cursor object is used to sychronize the cursor used by multiple views at 
  the same time. For example, thumb views within a split view acquire a cursor
  instance from the split view and set it as their cursor. The split view is 
  able to update its cursor object to reflect the state of the split view.
  Because cursor objects are implemented internally with CSS, this is a very 
  efficient way to update the same cursor for a group of view objects.
  
  Note: This object creates an anonymous CSS class to represent the cursor. 
  The anonymous CSS class is automatically added by SproutCore to views that
  have the cursor object set as "their" cursor. Thus, all objects attached to 
  the same cursor object will have their cursors updated simultaneously with a
  single DOM call.
  
  @extends SC.Object
*/
SC.Cursor = SC.Object.extend(
/** @scope SC.Cursor.prototype */ {
  
  /** @private */
  init: function() {
    sc_super() ;
    
    // create style rule
    var cursorStyle = this.get('cursorStyle') || SC.DEFAULT_CURSOR ;
    // var rule = SC.CSSRule.create({
    //   selector: '.' + SC.guidFor(this), // a unique selector
    //   styles: [SC.CSSStyle.create({ style: 'cursor: %@;'.fmt(cursor) })]
    // })
    
    // add it to the shared cursor style sheet
    var ss = this.constructor.sharedStyleSheet() ;
    
    if (ss.insertRule) {
      ss.insertRule('.%@ {cursor: %@;}'.fmt(SC.guidFor(this), cursorStyle)) ;
    } else if (ss.addRule) { // IE
      ss.addRule('.'+SC.guidFor(this), 'cursor: '+cursorStyle) ;
    }
    
    this.cursorStyle = cursorStyle ;
    this.className = SC.guidFor(this) ; // used by cursor clients...
    return this ;
  },
  
  cursorStyle: SC.DEFAULT_CURSOR,
  
  cursorStyleDidChange: function() {
    var cursor = this.get('cursor') || SC.DEFAULT_CURSOR ;
    var rule = this.get('rule') ;
    var style = rule.get('styles') || [] ;
    style = style.objectAt(0) ;
    if (style) style.set('style', 'cursor: %@;'.fmt(cursor)) ;
  }.observes('cursorStyle'),
  
  /** @property {String} a css class name */
  className: null
  
});

/** @private */
SC.Cursor.sharedStyleSheet = function() {
  var ss = this._styleSheet ;
  if (!ss) {
    // create the stylesheet object the hard way (works everywhere)
    ss = this._styleSheet = document.createElement('style') ;
    ss.type = 'text/css' ;
    var head = document.getElementsByTagName('head')[0] ;
    if (!head) head = document.documentElement ; // fix for Opera
    head.appendChild(ss) ;
  }
  return ss ;
}
