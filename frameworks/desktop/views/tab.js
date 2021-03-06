// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/segmented');

SC.TOP_LOCATION = 'top';
SC.TOP_TOOLBAR_LOCATION = 'top-toolbar';
SC.BOTTOM_LOCATION = 'bottom';

/** 
  @class

  Incorporates a segmented view and a container view to display the selected
  tab.  Provide an array of items, which will be passed onto the segmented
  view.
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.TabView = SC.View.extend(
/** @scope SC.TabView.prototype */ {

  classNames: ['sc-tab-view'],
  
  displayProperties: ['nowShowing'],

  // ..........................................................
  // PROPERTIES
  // 

 /** 
    Set nowShowing with the page you want to display.
  */
  nowShowing: null,
  
  items: [],
  
  isEnabled: YES,
  
  /** 
    The key that contains the title for each item. This will be passed onto the segmented view.
    
    @property {String}
  */
  itemTitleKey: null,
  
  /** 
    The key that contains the value for each item. This will be passed onto the segmented view.
    
    @property {String}
  */
  itemValueKey: null,
  
  /** 
    A key that determines if this item in particular is enabled.This will be passed onto the segmented view.  Note if the
    control in general is not enabled, no items will be enabled, even if the
    item's enabled property returns YES. 
    
    @property {String}
  */
  itemIsEnabledKey: null,
  
  /** 
    The key that contains the icon for each item.This will be passed onto the segmented view.  If omitted, no icons will
    be displayed.
    
    @property {String}
  */
  itemIconKey: null,
  
  /** 
    The key that contains the desired width for each item. This will be passed onto the segmented view.  If omitted, the
    width will autosize.
  
    @property {String}
  */
  itemWidthKey: null,
  
  /**
    The key that contains the tooltip for each item. This will be passed onto the segmented view. 
    
    @property {String}
  */
  itemToolTipKey: null,
  
  /** 
    The key that contains the action for each item. This will be passed onto the segmented view.  If defined, then 
    selecting this item will fire the action in addition to changing the 
    value.  See also itemTargetKey.
    
    @property {String}
  */
  itemActionKey: null,

  /** 
    This key passes on to Segmented the ability for the value to be set even if you have an action
    
    @property {String}
  */
  itemAlwaysSetValueKey: null,
  
  /** 
    The key that contains the target for each item. This will be passed onto the segmented view.  If this and itemActionKey
    are defined, then this will be the target of the action fired. 
    
    @property {String}
  */
  itemTargetKey: null,
  
  /** 
    The height for the tab buttons.
    
    @property {Number}
  */
  tabHeight: SC.REGULAR_BUTTON_HEIGHT,
  
  /**
    The location for the tab buttons.
    
    @property {String} One of: SC.TOP_LOCATION, SC.TOP_TOOLBAR_LOCATION, SC.BOTTOM_LOCATION
   */
  tabLocation: SC.TOP_LOCATION,
  
  /** 
    If set, then the tab location will be automatically saved in the user
    defaults.  Browsers that support localStorage will automatically store
    this information locally.
  */
  userDefaultKey: null,
  
  /**
    If set, strings longer than this will be truncated with ..., with their tooltip set to the full length.
  */
  // FIXME: [SC][JS] attempts to do this in a more dynamic way have failed utterly and I just don't have the time to argue with it anymore.
  maxTitleLength: null,
  
  // ..........................................................
  // FORWARDING PROPERTIES
  // 
  
  // forward important changes on to child views
  _tab_nowShowingDidChange: function() {
    var v = this.get('nowShowing');
    this.get('containerView').set('nowShowing',v);
    this.get('segmentedView').set('value',v);
    return this;
  }.observes('nowShowing'),

  _tab_saveUserDefault: function() {
    // if user default is set, save also
    var v = this.get('nowShowing');
    var defaultKey = this.get('userDefaultKey');
    if (defaultKey) {
      SC.userDefaults.set([defaultKey,'nowShowing'].join(':'), v);
    }
  }.observes('nowShowing'),
  
  _tab_itemsDidChange: function() {
    this.get('segmentedView').set('items', this.get('items'));
    return this;
  }.observes('items'),

  _tab_maxTitleLengthDidChange: function() {
    this.get('segmentedView').set('maxTitleLength', this.get('maxTitleLength'));
    return this;
  }.observes('maxTitleLength'),

  /** @private
    Restore userDefault key if set.
  */
  init: function() {
    sc_super();
    this._tab_nowShowingDidChange()._tab_maxTitleLengthDidChange()._tab_itemsDidChange();
  },

  awake: function() {
    sc_super();  
    var defaultKey = this.get('userDefaultKey');
    if (defaultKey) {
      defaultKey = [defaultKey,'nowShowing'].join(':');
      var nowShowing = SC.userDefaults.get(defaultKey);
      if (!SC.none(nowShowing)) this.set('nowShowing', nowShowing);
    }

  },
  
  createChildViews: function() {
    var childViews  = [], view, containerView, layout,
        tabLocation = this.get('tabLocation'),
        tabHeight   = this.get('tabHeight');
    
    layout = (tabLocation === SC.TOP_LOCATION) ?
             { top: tabHeight/2+1, left: 0, right: 0, bottom: 0 } :
             (tabLocation === SC.TOP_TOOLBAR_LOCATION) ?
             { top: tabHeight+1, left: 0, right: 0, bottom: 0 } :
             { top: 0, left: 0, right: 0, bottom: tabHeight-1 } ;
    
    containerView = this.containerView.extend(SC.Border, {
      layout: layout,
      borderStyle: SC.BORDER_BLACK
    });

    view = this.containerView = this.createChildView(containerView) ;
    childViews.push(view);
    
    //  The segmentedView managed by this tab view.  Note that this TabView uses
    //  a custom segmented view.  You can access this view but you cannot change
    // it.
    layout = (tabLocation === SC.TOP_LOCATION || 
              tabLocation === SC.TOP_TOOLBAR_LOCATION) ?
             { height: tabHeight, left: 0, right: 0, top: 0 } :
             { height: tabHeight, left: 0, right: 0, bottom: 0 } ;

    this.segmentedView = this.get('segmentedView').extend({
      layout: layout,

      /** @private
        When the value changes, update the parentView's value as well.
      */
      _sc_tab_segmented_valueDidChange: function() {
        var pv = this.get('parentView');
        if (pv) pv.set('nowShowing', this.get('value'));

        // FIXME: why is this necessary? 'value' is a displayProperty and should
        // automatically cause displayDidChange() to fire, which should cause 
        // the two lines below to execute in the normal course of things...
        this.set('layerNeedsUpdate', YES) ;
        this.invokeOnce(this.updateLayerIfNeeded) ;
      }.observes('value'),

      init: function() {
        // before we setup the rest of the view, copy key config properties 
        // from the owner view...
        var pv = this.get('parentView');
        if (pv) {
          SC._TAB_ITEM_KEYS.forEach(function(k) { this[k] = pv.get(k); }, this);
        }
        return sc_super();
      }
    });
    
    view = this.segmentedView = this.createChildView(this.segmentedView) ;
    childViews.push(view);
    
    this.set('childViews', childViews);
    return this; 
  },
  
  // ..........................................................
  // COMPONENT VIEWS
  // 

  /**
    The containerView managed by this tab view.  Note that TabView uses a 
    custom container view.  You can access this view but you cannot change 
    it.
  */
  containerView: SC.ContainerView,
  
  segmentedView: SC.SegmentedView
  
}) ;

SC._TAB_ITEM_KEYS = 'itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemWidthKey itemToolTipKey itemActionKey itemTargetKey itemAlwaysSetValueKey'.w();
