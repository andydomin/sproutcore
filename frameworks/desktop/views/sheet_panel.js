// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/panel');

/**
  Displays a modal sheet pane animated drop down from top.

  The default way to use the sheet pane is to simply add it to your page like this:
  
  {{{
    SC.SheetPane.create({
      contentView: SC.View.extend({
        layout: { width: 400, height: 200, centerX: 0 }
      })
    }).append();
  }}}
  
  This will cause your sheet panel to display.  The default layout for a Sheet 
  is to cover the entire document window with a semi-opaque background, and to 
  resize with the window.
  
  @extends SC.Panel
  @since SproutCore 1.0
*/
SC.SheetPanel = SC.Panel.extend({
  
  classNames: 'sc-sheet-pane'
  
});