sc_require('views/table_header');
sc_require('views/table_cell');


SC.TableView = SC.View.extend({
	classNames: ['sc-table-view'],
  childViews: "tableHeaderView dataView".w(),
	horizontalScrollOffset: 0,
	numColumns: null,
	content: null,
	dataSource: null,
	
	rowHeight:22,
	
	selection:null,
	
	target:null,
	action:null,
	
	useHeaders: YES,
	
	exampleView: SC.ListItemView,
	exampleScrollView: SC.ScrollView,
	
	isEditable: YES,
	canEditContent: YES,
	
	sortDescriptor: null,
	sortDescriptorBinding: '*dataSource.orderBy',
	
	init: function() {
		debugger;
		if (this.get('isFoldered'))
		{
		  this.set('dataView',this.get('exampleScrollView').extend({
        autohidesVerticalScroller: NO,
        layout: { left: 0, right: 0, top: top, bottom: 0 },
        contentView: Orion.FolderedListView.extend({
          exampleView: this.get('exampleView'),
          columns: this.get('columns'),
          rowHeight: this.get('rowHeight'),
          contentBinding: '.dataSource',
          selectionBinding: '.selection',
          target: this.get('target'),
          action: this.get('action'),
          contentValueKey: 'name',
          hasContentIcon: this.get('hasContentIcon'),
          contentIconKey: 'icon',
          newTarget: this.get('delegate'),
          newAction: this.get('newAction'),
          canReorderContent: this.get('canReorderContent'),
          canEditContent: this.get('canEditContent'),
          canDeleteContent: this.get('canDeleteContent'),
          allowDeselectAll: this.get('allowDeselectAll'),
          delegate: this.get('delegate'),
          beginEditingSelectionBinding: this.get('beginEditingSelectionPath') || SC.binding('.beginEditingSelection',this.get('delegate')),
          folderedListViewDelegate: this.get('delegate'),
          isDropTarget: this.get('isDropTarget'),
          allowActionOnFolder: this.get('allowActionOnFolder'),
          needsContextMenu: this.get('needsContextMenu')
        })
      }));
		}
		
		else
		{
		  this.set('dataView', this.get('exampleScrollView').design({
        isVisible: YES,
        layout: {
          left:   0,
          right:  0,
          bottom: 0,
          top:    40
        },

        borderStyle: SC.BORDER_NONE,
        contentView: SC.DataView.design({

    			classNames: ['sc-table-data-view'],

     			tableBinding: '.parentView.parentView.parentView',

     			rowHeightBinding: '*table.rowHeight',

     			isEditable: '*table.isEditable',
    			canEditContentBinding: '*table.canEditContent',

    			targetBinding: '*table.target',
    			actionBinding: '*table.action',

     			selectionBinding: '*table.selection',

    			sortDescriptorBinding: '*table.sortDescriptor',
     			columnsBinding: '*table.columns',
    			dataSourceBinding: '*table.dataSource',

    			exampleViewBinding: '*table.exampleView',

    			rebuildChildViews: function(){

    			}
    		}),


    	  autohidesVerticalScroller: NO,
    		horizontalScrollOffsetBinding: '.parentView.horizontalScrollOffset'
      }));
		}
		
		sc_super();
		
		if(!this.columnsBinding)
		{
			this.notifyPropertyChange('columns');
		}
	},

	content: function() {
		return this.get('dataSource');
	}.property('dataSource').cacheable(),

	contentDidChange: function() {
		this.notifyPropertyChange('dataSource');
		this.getPath('dataView.contentView').reload(null);
	}.observes('*content.[]'),
	
  dataView: null,

  tableHeaderView: SC.ScrollView.design({
    isVisibleBinding: '.parentView.useHeaders',
    layout: {
      left:   0,
      // right:  16,
			right: 0,
      bottom: 0,
      top:    0,
 			height: 39
    },
 		hasHorizontalScroller: NO,
 	  canScrollHorizontal: function() {
 			return YES;
 		}.property().cacheable(),
 		horizontalScrollOffsetBinding: '.parentView.horizontalScrollOffset',
    borderStyle: SC.BORDER_NONE,
    contentView: SC.TableHeaderView.extend({
 			tableBinding: '.parentView.parentView.parentView',
 			columnsBinding: '*table.columns',
			sortDescriptorBinding: '*table.sortDescriptor'
 		})
  }),
	
	_sctv_columnsDidChange: function() {
		var columns = this.get('columns');
		if(SC.none(columns) || columns.get('length') < 1 || columns == this._columns)
		{
			return this;
		}
			
		var observer = this._sctv_columnsRangeObserver;
		var func = this.columnsRangeDidChange;
			
		if(this._columns)
		{
			this._columns.removeRangeObserver(observer);
		}

		observer = columns.addRangeObserver(null, this, func, null);      
		this._sctv_columnsRangeObserver = observer ;

		this.resetRules();
		
		this._columns = columns;
	}.observes('columns'),
	
	resetRules: function() {
		this._offsets = [];
		this._widths = [];
		
		var columns = this.get('columns'),
			stylesheet = this._stylesheet,
			left = 6,
			offsets = this._offsets,
			widths = this._widths,
			width;
		
		if(stylesheet)
		{
			stylesheet.destroy();
		}
			
		stylesheet = this._stylesheet = SC.CSSStyleSheet.create();

		columns.forEach(function(column, i) {
			offsets[i] = left;
			stylesheet.insertRule(this.ruleForColumn(i), i);
			left += widths[i] + 1;
		}, this);
		
    this.getPath('dataView.contentView').set('calculatedWidth', left);
	},
	
	ruleForColumn: function(column) {
		var columns = this.get('columns'),
			col = columns.objectAt(column),
			width = col.get('width') - 1;
		this._widths[column] = width ;
		return ['div.column-' + column + ' {',
				'width: ' + width + 'px !important;',
				'left: ' + this._offsets[column] + 'px !important;',
			'}'].join("");
	},
	
	columnsRangeDidChange: function(columns, object, key, indexes) {
		if(this._ghost)
		{
			return;
		}
			
		columns = this.get('columns');
		
		var	len = columns.get('length');

		if(indexes !== 0)
		{
			indexes = indexes.firstObject();
		}
		
		var diff = columns.objectAt(indexes).get('width') - this._widths[indexes] - 1;
		var css = this._stylesheet;
		if(Math.abs(diff) > 0) {
			for(var i = indexes; i < len; i++) {
				css.deleteRule(i);
				if(i > indexes)
				{
					this._offsets[i] += diff;
				}
				css.insertRule(this.ruleForColumn(i), i);
			}
			
			this.getPath('dataView.contentView').calculatedWidth += diff;
			this.getPath('dataView.contentView').adjust(this.getPath('dataView.contentView').computeLayout());
		}
	},
	
	sortByColumn: function(column, sortState) {
		if(sortState != "ASC")
		{
			sortState = "ASC";
		}
		else
		{
			sortState = "DESC";
		}
		this.set('sortDescriptor', sortState + " " + column.get('key'));
	},
	
	// reordering
	
	ghostForColumn: function(column) {
		var columns = this.get('columns'),
			idx = columns.indexOf(column),
			el = this.getPath('dataView.contentView').ghostForColumn(idx);
			
		this._ghostLeft = this.getPath('tableHeaderView.contentView').offsetForView(idx) + 1;
		this._ghost = el;
		SC.$(el).css({left: this._ghostLeft, top: 40});
		this.get('layer').appendChild(el);
	},

	draggingColumn: function(column) {
		this.$().addClass('reordering-columns');
		this.ghostForColumn(column);
		this._dragging = column;
	},
	
	columnDragged: function(offset) {
		this._ghostLeft += offset;
		SC.$(this._ghost).css('left', this._ghostLeft + "px !important");
	},
	
	endColumnDrag: function() {
		this.$().removeClass('reordering-columns');
		if (!SC.none(this._ghost))
		{
		  this.get('layer').removeChild(this._ghost);
	  }
		this._ghost = this._blocker = null;
		this._ghostLeft = null;
		this.resetRules();
		this.getPath('dataView.contentView').reload(null);
	}
});