// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================


require('views/palette_pane');

/** 
  Popular customized picker position rules:
  default: initiated just below the anchor. 
           shift x, y to optimized picker visibility and make sure top-left corner is always visible.
  menu :   same as default rule +
           default(1,4,3) or custom offset below the anchor for default location to fine tunned visual alignment +
           enforce min left(7px)/right(8px) padding to the window
  fixed :  default(1,4,3) or custom offset below the anchor for default location to cope with specific anchor and skip fitPositionToScreen
  pointer :take default [0,1,2,3,2] or custom matrix to choose one of four perfect pointer positions.Ex:
           perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
           fallback to perfect top (2)
*/
SC.PICKER_MENU = 'menu';
SC.PICKER_FIXED = 'fixed';
SC.PICKER_POINTER = 'pointer';
/** 
  Pointer layout for perfect right/left/top/bottom
*/
SC.POINTER_LAYOUT = ["perfectRight", "perfectLeft", "perfectTop", "perfectBottom"];

/**
  Displays a non-modal, self anchor positioned picker pane.

  The default way to use the picker pane is to simply add it to your page like this:
  
  {{{
	  SC.PickerPane.create({
	    contentView: SC.View.extend({
	      layout: { width: 400, height: 200 }
	    })
	  }).popup(anchor);
  }}}
  
  This will cause your picker pane to display.
  
  Picker pane is a simple way to provide non-modal messaging that won't 
  blocks the user's interaction with your application.  Picker panes are 
  useful for showing important detail informations with optimized position around anchor.
  They provide a better user experience than modal panel.

  Examples for applying popular customized picker position rules:
  
  1. default:   
  {{{
	  SC.PickerPane.create({contentView: SC.View.extend({layout: { width: 400, height: 200 }})
	  }).popup(anchor);
  }}}

  2. menu below the anchor with default offset matrix [1,4,3]:   
  {{{
	  SC.PickerPane.create({contentView: SC.View.extend({layout: { width: 400, height: 200 }})
	  }).popup(anchor, SC.PICKER_MENU);
  }}}

  3. menu on the right side of anchor with custom offset matrix [2,6,0]:   
  {{{
	  SC.PickerPane.create({contentView: SC.View.extend({layout: { width: 400, height: 200 }})
	  }).popup(anchor, SC.PICKER_MENU, [2,6,0]);
  }}}

  4. fixed below the anchor with default offset matrix [1,4,3]:   
  {{{
	  SC.PickerPane.create({contentView: SC.View.extend({layout: { width: 400, height: 200 }})
	  }).popup(anchor, SC.PICKER_FIXED);
  }}}

  5. fixed on the right side of anchor with custom offset matrix [-22,-17,0]:   
  {{{
	  SC.PickerPane.create({contentView: SC.View.extend({layout: { width: 400, height: 200 }})
	  }).popup(anchor, SC.PICKER_FIXED, [-22,-17,0]);
  }}}

  6. pointer with default position pref matrix [0,1,2,3,2]:   
  {{{
	  SC.PickerPane.create({contentView: SC.View.extend({layout: { width: 400, height: 200 }})
	  }).popup(anchor, SC.PICKER_POINTER);
  }}}
	perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
  fallback to perfect top (2)

  7. pointer with custom position pref matrix [3,0,1,2,2]:   
  {{{
	  SC.PickerPane.create({contentView: SC.View.extend({layout: { width: 400, height: 200 }})
	  }).popup(anchor, SC.PICKER_POINTER, [3,0,1,2,2]);
  }}}

	perfect bottom (3) > perfect right (0) > perfect left (1) > perfect top (2)
  fallback to perfect top (2)
  
  @extends SC.PalettePane
  @since SproutCore 1.0
*/
SC.PickerPane = SC.PalettePane.extend({
  
  classNames: 'sc-picker-pane',
  isAnchored: true,
  
  pointerPos: 'perfectRight',
  
  /**
    This property will be set to the element (or view.get('layer')) that triggered your picker to show
    You can use this to properly position your picker.
    
    @property {Object}
  */
  anchorElement: null,
  /**
    popular customized picker position rule
    
    @property {String}
  */
  preferType: null,
  /**
    default/custom offset or position pref matrix for specific preferType
    
    @property {String}
  */
  preferMatrix: null,

	layoutShadow: null,

	/**
	  Displays a new picker pane according to the passed parameters.  
	  Every parameter except for the anchorViewOrElement is optional.  

	  @param {Object} anchorViewOrElement You can use this to properly position your picker.
	  @param {String} preferType an optional to apply popular customized picker position rule
	  @param {Array} preferMatrix an optional to apply custom offset or position pref matrix for specific preferType
	*/
  popup: function(anchorViewOrElement, preferType, preferMatrix) {
    this.set('anchorElement',anchorViewOrElement.get('layer') || anchor) ;
    if(preferType) this.set('preferType',preferType) ;
    if(preferMatrix) this.set('preferMatrix',preferMatrix) ;
    this.positionPane();
    this.append();
  },

	/** @private
    The ideal position for a picker pane is just below the anchor that triggered it + offset of specific preferType    
    Find that ideal position, then call fitPositionToScreen to get final position.
    If anchor is missing, fallback to center.
  */	
  positionPane: function() {
    var anchor = this.anchorElement ;
    var picker = this.contentView ;
    var origin ;
    
    // usually an anchorElement will be passed.  The ideal position is just below the anchor + default or custom offset according to preferType.
    // If that is not possible, fitPositionToScreen will take care of that for other alternative and fallback position.
    if (anchor) {
	    anchor = this.computeAnchorRect(anchor);
	    origin = SC.cloneRect(anchor);
	    if(this.preferType) {
		    switch(this.preferType) {
		      case SC.PICKER_MENU:
		      case SC.PICKER_FIXED:
	          if(!this.preferMatrix || this.preferMatrix.length != 3) {
					    // default below the anchor with fine tunned visual alignment for Menu to appear just below the anchorElement.
		          this.set('preferMatrix', [1, 4, 3]) ;
	          }
				    // fine tunned visual alignment from preferMatrix
			      origin.x += ((this.preferMatrix[2]==0) ? origin.width : 0) + this.preferMatrix[0] ;
			      origin.y += ((this.preferMatrix[2]==3) ? origin.height : 0) + this.preferMatrix[1];		
		  	    break;
		      default:
			      origin.y += origin.height ;
		  	    break;
		    }   
			} else {
				origin.y += origin.height ;
			}
      origin = this.fitPositionToScreen(origin, picker.get('frame'), anchor) ;
	    picker.set('layoutShadow', { width: picker.layout.width, height: picker.layout.height, left: origin.x, top: origin.y });
    } else {
	    // if no anchor view has been set for some reason, just center.
	    picker.set('layoutShadow', { width: picker.layout.width, height: picker.layout.height, centerX: 0, centerY: 0 });
    }
  },

	/** @private
    This method will return ret (x, y, width, height) from a rectangular element
  */	
	computeAnchorRect: function(anchor) {
		var ret = SC.viewportOffset(anchor); // get x & y
		var cq = SC.$(anchor);
		ret.width = cq.width();
		ret.height = cq.height();
		return ret ;
	},

	/** @private
    This method will dispatch to the right re-position rule according to preferType
  */	
  fitPositionToScreen: function(preferredPosition, picker, anchor) {
    // get window rect.
    var wret = { x: 0, y: 0, width: SC.$().width(), height: SC.$().height() } ;
    picker.x = preferredPosition.x ; picker.y = preferredPosition.y ;

    if(this.preferType) {
	    switch(this.preferType) {
	      case SC.PICKER_MENU:
	        // apply default + menu re-position rule
			    picker = this.fitPositionToScreenDefault(wret, picker, anchor) ;
			    picker = this.fitPositionToScreenMenu(wret, picker) ;
	  	    break;
	      case SC.PICKER_POINTER:
	        // apply pointer re-position rule
			    picker = this.fitPositionToScreenPointer(wret, picker, anchor) ;
	      case SC.PICKER_FIXED:
	        // skip fitPositionToScreen
	  	    break;
	      default:
	  	    break;
	    }   	
    } else {
	    // apply default re-position rule
      picker = this.fitPositionToScreenDefault(wret, picker, anchor) ;
		}
		this.displayDidChange();
    return picker ;
  },

	/** @private
    re-position rule migrated from old SC.OverlayPaneView. 
    shift x, y to optimized picker visibility and make sure top-left corner is always visible.
  */
  fitPositionToScreenDefault: function(w, f, a) {
    // make sure the right edge fits on the screen.  If not, anchor to 
    // right edge of anchor or right edge of window, whichever is closer.
    if (SC.maxX(f) > w.width) {
      var mx = Math.max(SC.maxX(a), f.width) ;
      f.x = Math.min(mx, w.width) - f.width ;
    }

    // if the left edge is off of the screen, try to position at left edge
    // of anchor.  If that pushes right edge off screen, shift back until 
    // right is on screen or left = 0
    if (SC.minX(f) < 0) {
      f.x = SC.minX(Math.max(a,0)) ;
      if (SC.maxX(f) > w.width) {
        f.x = Math.max(0, w.width - f.width);
      }
    }

    // make sure bottom edge fits on screen.  If not, try to anchor to top
    // of anchor or bottom edge of screen.
    if (SC.maxY(f) > w.height) {
      var mx = Math.max((a.y - f.height), 0) ;
      if (mx > w.height) {
        f.y = Math.max(0, w.height - f.height) ;
      } else f.y = mx ;
    }

    // if Top edge is off screen, try to anchor to bottom of anchor. If that
    // pushes off bottom edge, shift up until it is back on screen or top =0
    if (SC.minY(f) < 0) {
      var mx = Math.min(SC.maxY(a), (w.height - a.height)) ;
      f.y = Math.max(mx, 0) ;
    }
    return f ;    
  },

	/** @private
    re-position rule optimized for Menu to enforce min left(7px)/right(8px) padding to the window
  */
  fitPositionToScreenMenu: function(w, f) {
    // min left/right padding to the window
    if( (f.x + f.width) > (w.width-8) ) f.x = w.width - f.width - 8;
    if( f.x < 7 ) f.x = 7;
    return f ;    
  },

	/** @private
    re-position rule for triangle pointer picker: take default [0,1,2,3,2] or custom matrix to choose one of four perfect pointer positions.
  */
  fitPositionToScreenPointer: function(w, f, a) {
    // initiate perfect positions matrix
    // 4 perfect positions: right > left > top > bottom
    // 2 coordinates: x, y
    // top-left corner of 4 perfect positioned f  (4x2)
    var prefP1    =[[a.x+a.width-15, a.y+parseInt(a.height/3,0)-35], 
                    [a.x-f.width+15, a.y+parseInt(a.height/3,0)-35], 
                    [a.x+parseInt(a.width/2,0)-parseInt(f.width/2,0), a.y-f.height-5],
                    [a.x+parseInt(a.width/2,0)-parseInt(f.width/2,0), a.y+a.height+5]];
    // bottom-right corner of 4 perfect positioned f  (4x2)
    var prefP2    =[[a.x+a.width+f.width-15, a.y+parseInt(a.height/3,0)+f.height-35], 
                    [a.x+15,                 a.y+parseInt(a.height/3,0)+f.height-35], 
                    [a.x+parseInt(a.width/2,0)-parseInt(f.width/2,0)+f.width, a.y-5],
                    [a.x+parseInt(a.width/2,0)-parseInt(f.width/2,0)+f.width, a.y+a.height+f.height+5]];
    // cutoff of 4 perfect positioned f: top, right, bottom, left  (4x4)
    var cutoffPrefP =[[prefP1[0][1]>0 ? 0 : 0-prefP1[0][1], prefP2[0][0]<w.width ? 0 : prefP2[0][0]-w.width, prefP2[0][1]<w.height ? 0 : prefP2[0][1]-w.height, prefP1[0][0]>0 ? 0 : 0-prefP1[0][0]], 
                      [prefP1[1][1]>0 ? 0 : 0-prefP1[1][1], prefP2[1][0]<w.width ? 0 : prefP2[1][0]-w.width, prefP2[1][1]<w.height ? 0 : prefP2[1][1]-w.height, prefP1[1][0]>0 ? 0 : 0-prefP1[1][0]],
                      [prefP1[2][1]>0 ? 0 : 0-prefP1[2][1], prefP2[2][0]<w.width ? 0 : prefP2[2][0]-w.width, prefP2[2][1]<w.height ? 0 : prefP2[2][1]-w.height, prefP1[2][0]>0 ? 0 : 0-prefP1[2][0]],
                      [prefP1[3][1]>0 ? 0 : 0-prefP1[3][1], prefP2[3][0]<w.width ? 0 : prefP2[3][0]-w.width, prefP2[3][1]<w.height ? 0 : prefP2[3][1]-w.height, prefP1[3][0]>0 ? 0 : 0-prefP1[3][0]]];

    if(!this.preferMatrix || this.preferMatrix.length != 5) {
		  // default re-position rule : perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
		  // fallback to perfect top (2)
      this.set('preferMatrix', [0,1,2,3,2]) ;
    }
    var m = this.preferMatrix;
    //var pointer = this.contentView.childViews[this.contentView.childViews.length-1];

    // initiated with fallback position
    // Will be used only if the following preferred alternative can not be found
    f.x = prefP1[m[4]][0] ;
    f.y = prefP1[m[4]][1] ;
    this.set('pointerPos', SC.POINTER_LAYOUT[m[4]]);

    for(var i=0; i<SC.POINTER_LAYOUT.length; i++) {
      if (cutoffPrefP[m[i]][0]==0 && cutoffPrefP[m[i]][1]==0 && cutoffPrefP[m[i]][2]==0 && cutoffPrefP[m[i]][3]==0) {
	      // alternative i in preferMatrix by priority
	      if (m[4] != m[i]) {
		      f.x = prefP1[m[i]][0] ;
		      f.y = prefP1[m[i]][1] ;
		      this.set('pointerPos', SC.POINTER_LAYOUT[m[i]]);
	      }
	      i = SC.POINTER_LAYOUT.length;
	    }
    }
    return f ;    
  },
  
  

	render: function(context, firstTime) {
	    var s=this.contentView.get('layoutShadow');
	    var ss='';
	    for(key in s) {
	      value = s[key];
	      if (value!==null) {
	        ss=ss+key.dasherize()+': '+value+'; ';
	      }
	    }
	    if(firstTime){
	     context.push("<div style='position:absolute; "+ss+"'>");
	     this.renderChildViews(context, firstTime) ;
	     context.push("<div class='top-left-edge'></div>"+
	      "<div class='top-edge'></div>"+
	      "<div class='top-right-edge'></div>"+
	      "<div class='right-edge'></div>"+
	      "<div class='bottom-right-edge'></div>"+
	      "<div class='bottom-edge'></div>"+
	      "<div class='bottom-left-edge'></div>"+
	      "<div class='left-edge'></div>"+
	      ((this.get('preferType') == SC.PICKER_POINTER) ? "<div class='"+this.get('pointerPos')+"'></div>" : '')+
	      "</div>");
	    }else{
	      var divs=this.$('div')
	      var el=SC.$(divs[0]);
	      for(key in s) {
	        value = s[key];
	        if (value!==null) {
	          el.css(key, value);
	        }
	      }
	      el=SC.$(divs[10]);
	      el.attr('class', this.get('pointerPos'));
	    }
	   },
  


   /** @private - click away picker. */
  click: function(evt) {
    var f=this.contentView.get("frame");
    if(!this.clickInside(f, evt)) this.remove();
    return true ; 
  },

	/** @private
	  internal method to define the range for clicking inside so the picker won't be clicked away
	  default is the range of contentView frame. Over-write for adjustments. ex: shadow
	*/
	clickInside: function(frame, evt) {
		return SC.pointInRect({ x: evt.pageX, y: evt.pageY }, frame);
	},

  /** 
    Invoked by the root responder. Re-position picker whenever the window resizes. 
  */
  windowSizeDidChange: function(oldSize, newSize) {
	  sc_super();
    this.positionPane();
  }

});

