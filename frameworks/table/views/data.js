// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.DataView = SC.ListView.extend({

  /**
    Setting this to 'undefined' lets the 'contentValueKey' property
    be determined by SC.ListItemView instead of SC.ListItem.  It forces

      del.getDelegateProperty('contentValueKey', del) 

    in SC.ListItemView.displayValue() to ask itself instead of 'del' for
    the 'contentValueKey'.
  */
  contentValueKey: undefined,
  
  /**
     Returns the appropriate value from the content based on row and column number

     @private
  */
  valueForRowAndColumnInTableView: function(row, column, tableView) {
    var ds = this.get('content');
    if (ds){
      var item = ds.objectAt(row),
        columns = tableView.get('columns');
        column = columns.objectAt(column);
      var  key = column.get('key');
      var ret = null;
      if (item){
        if (item.get){
          ret = item.get(key);
        }
        else
        {
          ret = item[key];
        }
      }
      return ret;
    }
  },
  
  /**
     Returns layout for row and column, or just for row if column is not specified

     @private
  */
  layoutForContentIndex: function(contentIndex,i) {
     if (SC.none(i)){
       return sc_super();
     }
     var columns = this.get('columns');
     return {
       top: 0,
       bottom: 0,
       left: this._leftLayoutForColumnIndex(i), 
       width: columns.objectAt(i).get('width')
     };
   },
   
   _leftLayoutForColumnIndex: function(i) {
     var ret = 0;
     
     if (i > 0) {
       var columns = this.get('columns');
       ret = this._leftLayoutForColumnIndex(i-1) + columns.objectAt(i-1).get('width');
     }
     
     return ret;
   },
  
   /**
      Returns a view instance for the given row and column

      @param {Number} row the row index
      @param {Number} column the column index
   */
  viewForCell: function(row, column) {
    var itemViews = this._sc_itemViews;
    var view = itemViews[row].childViews[column];
      
    if(!view){
      return NO;  
    }

    return view;
  },
  
  /**
      Returns a clone of the layer for the view at the given row and column

      @param {Number} row the row index
      @param {Number} column the column index
   */
  ghostLayerForCell: function(row, column) {
    var itemViews = this._sc_itemViews;
    var view = itemViews[row].childViews[column];
    var layer;
      
    if(!view){
      return NO;  
    }

    layer = view.get('layer').cloneNode(YES);
    layer.style.top='%@px'.fmt(itemViews[row].get('layout').top);
    return layer;
  },
  
  /**
      Determines if a content item is selected

      @private
   */
  isSelected: function(item) {
    var sel = this.get('selection');
    return sel ? sel.contains(this.get('content'), item) : NO;
  },

  /** @private */
  computeLayout: function() {
    var ret = this._sclv_layout;
    if (!ret) ret = this._sclv_layout = {};
    ret.minHeight = this.rowOffsetForContentIndex(this.get('length'))+4;
    ret.minWidth = this.get('calculatedWidth');
    this.set('calculatedHeight',ret.minHeight);
    return ret ;
  },

  /**
    Returns a ghost view for a given column 
  */
  ghostForColumn: function(column) {
    var nowShowing = this.get('nowShowing'),
      el = document.createElement('div');
      
    nowShowing.forEach(function(idx) {
      var layer = this.ghostLayerForCell(idx, column);
      if (layer)
      {
        el.appendChild(layer);
      }
    }, this);
    
    el.className = "ghost";
    
    return el;
  },
  
  /** @private */
  mouseMoved: function(ev) {
    if(this._isDirty)
    {
      this.reload(null);
    }
    sc_super();
  },
  
  /** @private */
  _cv_columnsDidChange: function() {
    this.reload(null);
  }.observes('columns')
  
});