// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  Displays a progress bar.  You can display both a defined and an 
  indeterminate progressbar.  The progress bar itself is designed to be styled
  using CSS classes with the following structure:
  
  <div class="sc-progress-view"><div class="inner"></div></div>
  
  The outer can form the boundary of the bar while the inner will be adjusted 
  to fit the percentage of the progress.
  
  Creating a ProgressView accepts a number of properties, for example:
  {
    value: 50, 
    minimum: 0, 
    maximum: 100,
    isIndeterminate: NO,
    isEnabled: YES
  }
  
  Default isEnabled value is YES.

  @extends SC.View
  @extends SC.Control
  @since SproutCore 1.0
*/
SC.ProgressView = SC.View.extend(SC.Control, {
  
  // ........................................
  // PROPERTIES
  //

  /**
    Bind this to the current value of the progress bar.  Note that by default 
    an empty value will disable the progress bar and a multiple value will make 
    it indeterminate.
  */
  value: 0.50,
  valueBindingDefault: SC.Binding.single().notEmpty(),
  
  /**
    The minimum value of the progress.
  */ 
  minimum: 0,
  minimumBindingDefault: SC.Binding.single().notEmpty(),

  /**
    Optionally specify the key used to extract the minimum progress value 
    from the content object.  If this is set to null then the minimum value
    will not be derived from the content object.
    
    @property {String}
  */
  contentMinimumKey: null,
  
  /**
    The maximum value of the progress bar.
  */
  maximum: 1.0,
  maximumBindingDefault: SC.Binding.single().notEmpty(),

  /**
    The value of the progress inner offset range. Should be the same as width 
    of image. Default it to 24

    @type Integer
  */
  offsetRange: 24,

  /**
    Optionally specify the key used to extract the maximum progress value 
    from the content object.  If this is set to null then the maximum value
    will not be derived from the content object.
    
    @property {String}
  */
  contentMaximumKey: null,

  /** 
    Set to true if the item in progress is indeterminate.  This may be 
    overridden by the actual value.
    @returns {Boolean} 
  */
  isIndeterminate: NO,
  isIndeterminateBindingDefault: SC.Binding.bool(),

  /**
    Set to YES when the process is currently running.  This will cause the 
    progress bar to animate, especially if it is indeterminate.  
  */
  isRunning: NO,
  isRunningBindingDefault: SC.Binding.bool(),

  /** 
    Set to the matrix used for background image position for animation.
    [1st image y-location, offset, total number of images]
    @property {Array}
  */
  animatedBackgroundMatrix: [],
  
  /**
    Optionally specify the key used to extract the isIndeterminate value 
    from the content object.  If this is set to null then the isIndeterminate 
    value will not be derived from the content object.
    
    @property {String}
  */
  contentIsIndeterminateKey: null,

  // ........................................
  // STRUCTURE
  //

  classNames: 'sc-progress-view',
  
  // ........................................
  // INTERNAL SUPPORT
  //

  _backgroundOffset: 0,
  _currentBackground: 1,
  _nextBackground: 1,
  
  // start animating at the end of the init() method.  note that we call this
  // here because we want this to make sure this function is called anytime 
  // the progress view is instantiated.
  init: function() {
    sc_super();
    this.animateProgressBar(); // start animating...  
  },
  
  // start/stop running animation based on isRunning state.
  animateProgressBar: function() {
    if (this.get('isRunning') && this.get('isVisibleInWindow')) {
      this._animateProgressBar(500); // wait to start to avoid probs
    }
  }.observes('isRunning', 'isVisibleInWindow'),

  _animateProgressBar: function(delay) {  
    if (delay===0) delay = 1000/30;
    if (this.get('isRunning') && this.get('isVisibleInWindow')) {
      this.displayDidChange();
      this.invokeLater(this._animateProgressBar, delay, 600);
    }
  },
  
  displayProperties: 'value minimum maximum isIndeterminate'.w(),
  
  render: function(context, firstTime) {
    var inner, animatedBackground, value, cssString, backPosition,
        isIndeterminate = this.get('isIndeterminate'),
        isRunning = this.get('isRunning'),
        isEnabled = this.get('isEnabled'),
        offsetRange = this.get('offsetRange'),
        offset = (isIndeterminate && isRunning) ? 
                (Math.floor(Date.now()/75)%offsetRange-offsetRange) : 0;
  
    //
    var percentNum = this.get("_percentageNumeric") * 100;

    // compute value for setting the width of the inner progress
    if (!isEnabled) {
      value = "0%" ;
    } else if (isIndeterminate) {
      value = "120%";
    } else {
      value = (percentNum) + "%";
    }
    
    // if this item already exists, we don't need to reconstruct the styles
    var progressBarObj = SC.$("#sc-progress-emails");
    if(progressBarObj.length==0) 
    {
        var str = "progress";

        if( percentNum<100 || isIndeterminate)
          str += " progress-striped active";

        context.push(
          '<div id="sc-progress-emails" class="' + str + '" style="width:100%;"><div class="progress-bar"  role="progressbar" style="width: ', value, '"></div></div>'
                   );
    }
    else 
    {
      //make sure the logic that reassigns classes to elements is the same as when constructed
      progressBarObj.find(".progress-bar").css("width", value);
      progressBarObj.toggleClass("progress-striped", percentNum<100 || isIndeterminate);
      progressBarObj.toggleClass("active", percentNum<100 || isIndeterminate);
    }
    
  },
  
  contentPropertyDidChange: function(target, key) {
    var content = this.get('content');
    this.beginPropertyChanges()
      .updatePropertyFromContent('value', key, 'contentValueKey', content)
      .updatePropertyFromContent('minimum', key, 'contentMinimumKey', content)
      .updatePropertyFromContent('maximum', key, 'contentMaximumKey', content)
      .updatePropertyFromContent('isIndeterminate', key, 'contentIsIndeterminateKey', content)
    .endPropertyChanges();
  },
  
  _percentageNumeric: function(){
    var minimum = this.get('minimum') || 0.0,
        maximum = this.get('maximum') || 1.0,
        value = this.get('value') || 0.0;
    value = (value - minimum) / (maximum - minimum);
    if (value > 1.0) value = 1.0;

    if(isNaN(value)) value = 0.0;
    // cannot be smaller then minimum
    if(value<minimum) value = 0.0;
    // cannot be larger then maximum
    if(value>maximum) value = 1.0;
    return value;
  }.property('value').cacheable(),
  
  _createClassNameString: function(classNames) {
    var classNameArray = [], key;
    for(key in classNames) {
      if(!classNames.hasOwnProperty(key)) continue;
      if(classNames[key]) classNameArray.push(key);
    }
    return classNameArray.join(" ");
  }
  
}) ;
