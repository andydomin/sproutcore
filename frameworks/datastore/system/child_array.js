// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Evin Grano
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A ChildArray is used to map an array of ChildRecord
  
  @extends SC.Enumerable
  @extends SC.Array
  @since SproutCore 1.0
*/

SC.ChildArray = SC.Object.extend(SC.Enumerable, SC.Array,
  /** @scope SC.ManyArray.prototype */ {
    
  /**
    If set, it is the default record recordType
  
    @property {SC.Record}
  */
  defaultRecordType: null,
  
  /**
    If set, the parent record will be notified whenever the array changes so that 
    it can change its own state
    
    @property {SC.Record}
  */
  record: null,
  
  /**
    If set will be used by the many array to get an editable version of the
    storeIds from the owner.
    
    @property {String}
  */
  propertyName: null,
  
  /**
    Actual references to the hashes
  */
  children: null,
  
  /**
    The store that owns this record array.  All record arrays must have a 
    store to function properly.

    @property {SC.Store}
  */
  store: function() {
    return this.getPath('record.store');
  }.property('record').cacheable(),
  
  /**
    The storeKey for the parent record of this many array.  Editing this 
    array will place the parent record into a READY_DIRTY state.

    @property {Number}
  */
  storeKey: function() {
    return this.getPath('record.storeKey');
  }.property('record').cacheable(),
  
  /**
    Returns the storeIds in read only mode.  Avoids modifying the record 
    unnecessarily.
    
    @property {SC.Array}
  */
  readOnlyChildren: function() {
    return this.get('record').readAttribute(this.get('propertyName'));
  }.property(),
  
  /**
    Returns an editable array of child hashes.  Marks the owner records as 
    modified. 
    
    @property {SC.Array}
  */
  editableChildren: function() {
    var store    = this.get('store'),
        storeKey = this.get('storeKey'),
        pname    = this.get('propertyName'),
        ret, hash;
        
    ret = store.readEditableProperty(storeKey, pname);    
    if (!ret) {
      hash = store.readEditableDataHash(storeKey);
      ret = hash[pname] = [];      
    }
    
    if (ret !== this._prevChildren) this.recordPropertyDidChange();
    return ret ;
  }.property(),
    
  // ..........................................................
  // ARRAY PRIMITIVES
  // 

  /** @private
    Returned length is a pass-through to the storeIds array.
    
    @property {Number}
  */
  length: function() {
    var children = this.get('readOnlyChildren');
    return children ? children.length : 0;
  }.property('readOnlyChildren'),

  /** @private
    Looks up the store id in the store ids array and materializes a
    records.
  */
  objectAt: function(idx) {
    var recs      = this._records, 
        children = this.get('readOnlyChildren'),
        hash, ret, pname = this.get('propertyName'),
        parent = this.get('record');
    var len = children ? children.length : 0;
    
    if (!children) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached
    if (!recs) this._records = recs = [] ; // create cache
    
    // If not a good index return undefined
    if (idx >= len) return undefined;
    hash = children.objectAt(idx);
    if (!hash) return undefined;
    
    // not in cache, materialize
    recs[idx] = ret = parent.registerNestedRecord(hash, '%@.%@'.fmt(pname, idx));
    
    return ret;
  },

  /** @private
    Pass through to the underlying array.  The passed in objects must be
    records, which can be converted to storeIds.
  */
  replace: function(idx, amt, recs) {
    var children = this.get('editableChildren'), 
        len      = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
        parent   = this.get('record'), newRecs,
        
        pname    = this.get('propertyName'),
        cr, recordType, i, limit=idx+amt;
    newRecs = this._processRecordsToHashes(recs);
    // if removing records, unregister them from the parent path cache
    if (amt) {
      for (i = idx; i < limit; ++i) {
        parent.unregisterNestedRecord('%@.%@'.fmt(pname, i));
      }
    }

    // perform the replace operation on the contained array
    children.replace(idx, amt, newRecs);

    // now change the registration path for all children after the replace area
    var newIndex, oldIndex, length = children.get('length');
    for (newIndex = idx+len; newIndex < length; ++newIndex) {
      oldIndex = newIndex - len + amt;
      parent.replaceRegisteredNestedRecordPath('%@.%@'.fmt(pname, oldIndex),'%@.%@'.fmt(pname, newIndex))
    }
    
    // notify that the record did change...
    parent.recordDidChange(pname);
  
    return this;
  },
  
  _processRecordsToHashes: function(recs){
    var store, sk;
    recs = recs || [];
    recs.forEach( function(me, idx){
      if (me.isNestedRecord){
        store = me.get('store');
        sk = me.storeKey;
        recs[idx] = store.readDataHash(sk);
      }
    });
    
    return recs;
  },
  
  /*
  calls normalize on each object in the array
  */
  normalize: function(){
    this.forEach(function(child,id){
      if(child.normalize) child.normalize();
    });
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  //  
  
  /** @private 
    Invoked whenever the children array changes.  Observes changes.
  */
  recordPropertyDidChange: function(keys) {
    if (keys && !keys.contains(this.get('propertyName'))) return this;
    
    var children = this.get('readOnlyChildren');
    var prev = this._prevChildren, f = this._childrenContentDidChange;
    
    if (children === prev) return this; // nothing to do
        
    if (prev) prev.removeObserver('[]', this, f);
    this._prevChildren = children;
    if (children) children.addObserver('[]', this, f);
    
    var rev = (children) ? children.propertyRevision : -1 ;
    this._childrenContentDidChange(children, '[]', children, rev);
    return this;
  },

  /**
   * Overrides unknownProperty() to allow for index-based get() calls, which allows you to do
   * things like get an instance of a child record within a child record array from the parent
   * record. For example...
   *
   * var child = parent.get('children.0');
   *
   * Or even more simply...
   *
   * var child = children.get('0');
   *
   * Note that you can't set() child objects this way. In other words...
   *
   * children.set('0', child);
   *
   * ...won't work.
   */
  unknownProperty: function(key, value) {
    // First check to see if this is a reduced property.
    var ret = this.reducedProperty(key, value);

    // Nope; let any superclasses/mixins have a crack at it.
    if (ret === undefined) ret = sc_super();

    // Finally, try to call objectAt().
    if (ret === undefined && !SC.empty(key)) {
      var index = parseInt(key, 0);
      if (SC.typeOf(index) === SC.T_NUMBER) ret = this.objectAt(index);
    }

    return ret;
  },

  /** @private
    Invoked whenever the content of the children array changes.  This will
    dump any cached record lookup and then notify that the enumerable content
    has changed.
  */
  _childrenContentDidChange: function(target, key, value, rev) {
    this._records = null ; // clear cache
    this.enumerableContentDidChange();
  },
  
  /** @private */
  init: function() {
    sc_super();
    this.recordPropertyDidChange();
  }
  
}) ;
