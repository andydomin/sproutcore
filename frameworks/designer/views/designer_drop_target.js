// ==========================================================================
// Project:   SC - designPage
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals SC */
/*jslint evil: true*/
/** 
  @class
  This View is used by Greenhouse when application is in design mode
  
  
  @extends SC.ContainerView
*/
SC.DesignerDropTarget = SC.ContainerView.extend(
  /** @scope SC.DesignerDropTarget.prototype */ {
  
  // ..........................................................
  // Key Events
  // 
  acceptsFirstResponder: YES,
  
  keyDown: function(evt) {
    return this.interpretKeyEvents(evt);
  },
  
  keyUp: function(evt) {
    return YES; 
  },
  
  deleteForward: function(evt){
    var c = SC.designsController.getPath('page.designController');
    if(c) c.deleteSelection();
    return YES;
  },
  
  deleteBackward: function(evt){
    var c = SC.designsController.getPath('page.designController');
    if(c) c.deleteSelection();
    return YES;
  },

  moveLeft: function(sender, evt) {
    return YES;
  },
  
  moveRight: function(sender, evt) {   
    return YES;
  },
  
  moveUp: function(sender, evt) {
    return YES;
  },
  
  moveDown: function(sender, evt) {
    return YES;
  },

  // ..........................................................
  // Drag and drop code
  // 
  isDropTarget: YES,
  
  inGlobalOffset: YES,
  
  dragStarted: function(drag, evt) {
  },
  
  dragEntered: function(drag, evt) {
  },
  
  dragUpdated: function(drag, evt) {},
  
  dragExited: function(drag, evt) {},
  
  dragEnded: function(drag, evt) {},
  

  computeDragOperations: function(drag, evt) { 
    return SC.DRAG_ANY; 
  },
  

  acceptDragOperation: function(drag, op) { 
    var data = drag.dataForType('SC.Object'),
        scClass = eval(data.get('scClass'));
    return scClass.kindOf(SC.View);
  },
  
  /**
    Called to actually perform the drag operation.
    
    Overide this method to actually perform the drag operation.  This method
    is only called if you returned YES in acceptDragOperation(). 
    
    Return the operation that was actually performed or SC.DRAG_NONE if the 
    operation was aborted.
    
    The default implementation returns SC.DRAG_NONE
    
    @param {SC.Drag} drag The drag instance managing this drag
    @param {DragOp} op The proposed drag operation. A drag constant.
    
    @return {DragOp} Drag Operation actually performed
  */
  performDragOperation: function(drag, op) {
    var data = drag.dataForType('SC.Object'),
        cv = this.get('contentView'),
        loc = drag.get('location'),
        frame = drag.iframeFrame,
        design, size, newView, defaults, layout;
    var page = cv.get('page');
    var designController = page.get('designController'),
        rootDesigner = designController.get('rootDesigner');
    var rootDesignerFrame = rootDesigner.get('frame');
    //TODO: [MB] should we move most of this into the designer's addView?
    //size and location
    size = data.get('size');
    loc.x = loc.x - frame.x - rootDesignerFrame.x;
    loc.y = loc.y - frame.y - rootDesignerFrame.y;
    //setup design (use eval to make sure code comes from iframe)
    design = eval(data.get('scClass'));
    defaults = data.get('defaults') || {};
    layout = defaults.layout || {};
    layout = SC.merge(layout, {top: loc.y, left: loc.x});
    defaults.layout = layout;
    design = design.design(defaults);
    //drop it in the root designer
    newView = design.create({page: page});
    if(rootDesigner && newView){
      rootDesigner.addView(newView);
      //cv.appendChild(newView);
    }
    page.get('designController').select(newView.get('designer'));
    return SC.DRAG_ANY; 
  }
  
  
});
