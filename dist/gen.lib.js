(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.genish = factory());
})(this, (function () { 'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function getAugmentedNamespace(n) {
	  if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
	  var f = n.default;
		if (typeof f == "function") {
			var a = function a () {
				var isInstance = false;
	      try {
	        isInstance = this instanceof a;
	      } catch {}
				if (isInstance) {
	        return Reflect.construct(f, arguments, this.constructor);
				}
				return f.apply(this, arguments);
			};
			a.prototype = f.prototype;
	  } else a = {};
	  Object.defineProperty(a, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	var memoryHelper;
	var hasRequiredMemoryHelper;

	function requireMemoryHelper () {
		if (hasRequiredMemoryHelper) return memoryHelper;
		hasRequiredMemoryHelper = 1;

		let MemoryHelper = {
		  
		  create( sizeOrBuffer=4096, memtype=Float32Array ) {
		    let helper = Object.create( this );

		    // conveniently, buffer constructors accept either a size or an array buffer to use...
		    // so, no matter which is passed to sizeOrBuffer it should work.
		    Object.assign( helper, {
		      heap: new memtype( sizeOrBuffer ),
		      list: {},
		      freeList: {},

		      // if useTail is true, will force MemoryHelper to allocate at end of the
		      // heap and skip any freed memory blocks. Useful to force a contiguous
		      // block of memory
		      useTail:false,
		    });

		    return helper
		  },

		  alloc( size, immutable ) {
		    let idx = -1;

		    if( size > this.heap.length ) {
		      throw Error( 'Allocation request is larger than heap size of ' + this.heap.length )
		    }

		    if( this.useTail === false ) {
		      for( let key in this.freeList ) {
		        let candidate = this.freeList[ key ];

		        if( candidate.size >= size ) {
		          idx = key;

		          this.list[ idx ] = { size, immutable, references:1 };

		          if( candidate.size !== size ) {
		            let newIndex = idx + size,
		                newFreeSize;

		            for( let key in this.list ) {
		              if( key > newIndex ) {
		                newFreeSize = key - newIndex;
		                this.freeList[ newIndex ] = newFreeSize;
		              }
		            }
		          }

		          break
		        }
		      }
		    }

		    if( idx !== -1 ) delete this.freeList[ idx ];

		    if( idx === -1 ) {
		      let keys = Object.keys( this.list ),
		          lastIndex;

		      if( keys.length ) { // if not first allocation...
		        lastIndex = parseInt( keys[ keys.length - 1 ] );

		        idx = lastIndex + this.list[ lastIndex ].size;
		      }else {
		        idx = 0;
		      }

		      this.list[ idx ] = { size, immutable, references:1 };
		    }

		    if( idx + size >= this.heap.length ) {
		      throw Error( 'No available blocks remain sufficient for allocation request.' )
		    }

		    return idx
		  },

		  // this returns the next index that will be use by 
		  // memory helper, unless there are freed blcoks available.  
		  // if the useTail property is set to true this will return
		  // the next block index regardless of any freed blocks.
		  getLastUsedIndex() {
		    let keys = Object.keys( this.list ),
		        idx = 0,
		        lastIndex;

		    if( keys.length ) { // if not first allocation...
		      lastIndex = parseInt( keys[ keys.length - 1 ] );

		      idx = lastIndex + this.list[ lastIndex ].size;
		    }

		    return idx
		  },

		  addReference( index ) {
		    if( this.list[ index ] !== undefined ) { 
		      this.list[ index ].references++;
		    }
		  },

		  free( index ) {
		    if( this.list[ index ] === undefined ) {
		      throw Error( 'Calling free() on non-existing block.' )
		    }

		    let slot = this.list[ index ];
		    if( slot === 0 ) return
		    slot.references--;

		    if( slot.references === 0 && slot.immutable !== true ) {    
		      this.list[ index ] = 0;

		      let freeBlockSize = 0;
		      for( let key in this.list ) {
		        if( key > index ) {
		          freeBlockSize = key - index;
		          break
		        }
		      }

		      this.freeList[ index ] = freeBlockSize;
		    }
		  },
		};

		memoryHelper = MemoryHelper;
		return memoryHelper;
	}

	var domain;

	// This constructor is used to store event handlers. Instantiating this is
	// faster than explicitly calling `Object.create(null)` to get a "clean" empty
	// object (tested with v8 v4.9).
	function EventHandlers() {}
	EventHandlers.prototype = Object.create(null);

	function EventEmitter() {
	  EventEmitter.init.call(this);
	}

	// nodejs oddity
	// require('events') === require('events').EventEmitter
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.usingDomains = false;

	EventEmitter.prototype.domain = undefined;
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	EventEmitter.init = function() {
	  this.domain = null;
	  if (EventEmitter.usingDomains) {
	    // if there is an active domain, then attach to it.
	    if (domain.active && !(this instanceof domain.Domain)) {
	      this.domain = domain.active;
	    }
	  }

	  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
	    this._events = new EventHandlers();
	    this._eventsCount = 0;
	  }

	  this._maxListeners = this._maxListeners || undefined;
	};

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
	  if (typeof n !== 'number' || n < 0 || isNaN(n))
	    throw new TypeError('"n" argument must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	function $getMaxListeners(that) {
	  if (that._maxListeners === undefined)
	    return EventEmitter.defaultMaxListeners;
	  return that._maxListeners;
	}

	EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
	  return $getMaxListeners(this);
	};

	// These standalone emit* functions are used to optimize calling of event
	// handlers for fast cases because emit() itself often has a variable number of
	// arguments and can be deoptimized because of that. These functions always have
	// the same number of arguments and thus do not get deoptimized, so the code
	// inside them can execute faster.
	function emitNone(handler, isFn, self) {
	  if (isFn)
	    handler.call(self);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self);
	  }
	}
	function emitOne(handler, isFn, self, arg1) {
	  if (isFn)
	    handler.call(self, arg1);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1);
	  }
	}
	function emitTwo(handler, isFn, self, arg1, arg2) {
	  if (isFn)
	    handler.call(self, arg1, arg2);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1, arg2);
	  }
	}
	function emitThree(handler, isFn, self, arg1, arg2, arg3) {
	  if (isFn)
	    handler.call(self, arg1, arg2, arg3);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1, arg2, arg3);
	  }
	}

	function emitMany(handler, isFn, self, args) {
	  if (isFn)
	    handler.apply(self, args);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].apply(self, args);
	  }
	}

	EventEmitter.prototype.emit = function emit(type) {
	  var er, handler, len, args, i, events, domain;
	  var doError = (type === 'error');

	  events = this._events;
	  if (events)
	    doError = (doError && events.error == null);
	  else if (!doError)
	    return false;

	  domain = this.domain;

	  // If there is no 'error' event listener then throw.
	  if (doError) {
	    er = arguments[1];
	    if (domain) {
	      if (!er)
	        er = new Error('Uncaught, unspecified "error" event');
	      er.domainEmitter = this;
	      er.domain = domain;
	      er.domainThrown = false;
	      domain.emit('error', er);
	    } else if (er instanceof Error) {
	      throw er; // Unhandled 'error' event
	    } else {
	      // At least give some kind of context to the user
	      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	      err.context = er;
	      throw err;
	    }
	    return false;
	  }

	  handler = events[type];

	  if (!handler)
	    return false;

	  var isFn = typeof handler === 'function';
	  len = arguments.length;
	  switch (len) {
	    // fast cases
	    case 1:
	      emitNone(handler, isFn, this);
	      break;
	    case 2:
	      emitOne(handler, isFn, this, arguments[1]);
	      break;
	    case 3:
	      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
	      break;
	    case 4:
	      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
	      break;
	    // slower
	    default:
	      args = new Array(len - 1);
	      for (i = 1; i < len; i++)
	        args[i - 1] = arguments[i];
	      emitMany(handler, isFn, this, args);
	  }

	  return true;
	};

	function _addListener(target, type, listener, prepend) {
	  var m;
	  var events;
	  var existing;

	  if (typeof listener !== 'function')
	    throw new TypeError('"listener" argument must be a function');

	  events = target._events;
	  if (!events) {
	    events = target._events = new EventHandlers();
	    target._eventsCount = 0;
	  } else {
	    // To avoid recursion in the case that type === "newListener"! Before
	    // adding it to the listeners, first emit "newListener".
	    if (events.newListener) {
	      target.emit('newListener', type,
	                  listener.listener ? listener.listener : listener);

	      // Re-assign `events` because a newListener handler could have caused the
	      // this._events to be assigned to a new object
	      events = target._events;
	    }
	    existing = events[type];
	  }

	  if (!existing) {
	    // Optimize the case of one listener. Don't need the extra array object.
	    existing = events[type] = listener;
	    ++target._eventsCount;
	  } else {
	    if (typeof existing === 'function') {
	      // Adding the second element, need to change to array.
	      existing = events[type] = prepend ? [listener, existing] :
	                                          [existing, listener];
	    } else {
	      // If we've already got an array, just append.
	      if (prepend) {
	        existing.unshift(listener);
	      } else {
	        existing.push(listener);
	      }
	    }

	    // Check for listener leak
	    if (!existing.warned) {
	      m = $getMaxListeners(target);
	      if (m && m > 0 && existing.length > m) {
	        existing.warned = true;
	        var w = new Error('Possible EventEmitter memory leak detected. ' +
	                            existing.length + ' ' + type + ' listeners added. ' +
	                            'Use emitter.setMaxListeners() to increase limit');
	        w.name = 'MaxListenersExceededWarning';
	        w.emitter = target;
	        w.type = type;
	        w.count = existing.length;
	        emitWarning(w);
	      }
	    }
	  }

	  return target;
	}
	function emitWarning(e) {
	  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
	}
	EventEmitter.prototype.addListener = function addListener(type, listener) {
	  return _addListener(this, type, listener, false);
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.prependListener =
	    function prependListener(type, listener) {
	      return _addListener(this, type, listener, true);
	    };

	function _onceWrap(target, type, listener) {
	  var fired = false;
	  function g() {
	    target.removeListener(type, g);
	    if (!fired) {
	      fired = true;
	      listener.apply(target, arguments);
	    }
	  }
	  g.listener = listener;
	  return g;
	}

	EventEmitter.prototype.once = function once(type, listener) {
	  if (typeof listener !== 'function')
	    throw new TypeError('"listener" argument must be a function');
	  this.on(type, _onceWrap(this, type, listener));
	  return this;
	};

	EventEmitter.prototype.prependOnceListener =
	    function prependOnceListener(type, listener) {
	      if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');
	      this.prependListener(type, _onceWrap(this, type, listener));
	      return this;
	    };

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener =
	    function removeListener(type, listener) {
	      var list, events, position, i, originalListener;

	      if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');

	      events = this._events;
	      if (!events)
	        return this;

	      list = events[type];
	      if (!list)
	        return this;

	      if (list === listener || (list.listener && list.listener === listener)) {
	        if (--this._eventsCount === 0)
	          this._events = new EventHandlers();
	        else {
	          delete events[type];
	          if (events.removeListener)
	            this.emit('removeListener', type, list.listener || listener);
	        }
	      } else if (typeof list !== 'function') {
	        position = -1;

	        for (i = list.length; i-- > 0;) {
	          if (list[i] === listener ||
	              (list[i].listener && list[i].listener === listener)) {
	            originalListener = list[i].listener;
	            position = i;
	            break;
	          }
	        }

	        if (position < 0)
	          return this;

	        if (list.length === 1) {
	          list[0] = undefined;
	          if (--this._eventsCount === 0) {
	            this._events = new EventHandlers();
	            return this;
	          } else {
	            delete events[type];
	          }
	        } else {
	          spliceOne(list, position);
	        }

	        if (events.removeListener)
	          this.emit('removeListener', type, originalListener || listener);
	      }

	      return this;
	    };
	    
	// Alias for removeListener added in NodeJS 10.0
	// https://nodejs.org/api/events.html#events_emitter_off_eventname_listener
	EventEmitter.prototype.off = function(type, listener){
	    return this.removeListener(type, listener);
	};

	EventEmitter.prototype.removeAllListeners =
	    function removeAllListeners(type) {
	      var listeners, events;

	      events = this._events;
	      if (!events)
	        return this;

	      // not listening for removeListener, no need to emit
	      if (!events.removeListener) {
	        if (arguments.length === 0) {
	          this._events = new EventHandlers();
	          this._eventsCount = 0;
	        } else if (events[type]) {
	          if (--this._eventsCount === 0)
	            this._events = new EventHandlers();
	          else
	            delete events[type];
	        }
	        return this;
	      }

	      // emit removeListener for all listeners on all events
	      if (arguments.length === 0) {
	        var keys = Object.keys(events);
	        for (var i = 0, key; i < keys.length; ++i) {
	          key = keys[i];
	          if (key === 'removeListener') continue;
	          this.removeAllListeners(key);
	        }
	        this.removeAllListeners('removeListener');
	        this._events = new EventHandlers();
	        this._eventsCount = 0;
	        return this;
	      }

	      listeners = events[type];

	      if (typeof listeners === 'function') {
	        this.removeListener(type, listeners);
	      } else if (listeners) {
	        // LIFO order
	        do {
	          this.removeListener(type, listeners[listeners.length - 1]);
	        } while (listeners[0]);
	      }

	      return this;
	    };

	EventEmitter.prototype.listeners = function listeners(type) {
	  var evlistener;
	  var ret;
	  var events = this._events;

	  if (!events)
	    ret = [];
	  else {
	    evlistener = events[type];
	    if (!evlistener)
	      ret = [];
	    else if (typeof evlistener === 'function')
	      ret = [evlistener.listener || evlistener];
	    else
	      ret = unwrapListeners(evlistener);
	  }

	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  if (typeof emitter.listenerCount === 'function') {
	    return emitter.listenerCount(type);
	  } else {
	    return listenerCount.call(emitter, type);
	  }
	};

	EventEmitter.prototype.listenerCount = listenerCount;
	function listenerCount(type) {
	  var events = this._events;

	  if (events) {
	    var evlistener = events[type];

	    if (typeof evlistener === 'function') {
	      return 1;
	    } else if (evlistener) {
	      return evlistener.length;
	    }
	  }

	  return 0;
	}

	EventEmitter.prototype.eventNames = function eventNames() {
	  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
	};

	// About 1.5x faster than the two-arg version of Array#splice().
	function spliceOne(list, index) {
	  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
	    list[i] = list[k];
	  list.pop();
	}

	function arrayClone(arr, i) {
	  var copy = new Array(i);
	  while (i--)
	    copy[i] = arr[i];
	  return copy;
	}

	function unwrapListeners(arr) {
	  var ret = new Array(arr.length);
	  for (var i = 0; i < ret.length; ++i) {
	    ret[i] = arr[i].listener || arr[i];
	  }
	  return ret;
	}

	var _polyfillNode_events = /*#__PURE__*/Object.freeze({
		__proto__: null,
		EventEmitter: EventEmitter,
		default: EventEmitter
	});

	var require$$1 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_events);

	var gen_1;
	var hasRequiredGen;

	function requireGen () {
		if (hasRequiredGen) return gen_1;
		hasRequiredGen = 1;

		/* gen.js
		 *
		 * low-level code generation for unit generators
		 *
		 */
		const MemoryHelper = requireMemoryHelper();
		const EE = require$$1.EventEmitter;

		const gen = {

		  accum:0,
		  getUID() { return this.accum++ },
		  debug:false,
		  samplerate: 44100, // change on audiocontext creation
		  shouldLocalize: false,
		  graph:null,
		  alwaysReturnArrays: false,
		  globals:{
		    windows: {},
		  },
		  mode:'worklet',
		  
		  /* closures
		   *
		   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
		   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
		   */

		  closures: new Set(),
		  params:   new Set(),
		  inputs:   new Set(),

		  parameters: new Set(),
		  endBlock: new Set(),
		  histories: new Map(),

		  memo: {},

		  //data: {},
		  
		  /* export
		   *
		   * place gen functions into another object for easier reference
		   */

		  export( obj ) {},

		  addToEndBlock( v ) {
		    this.endBlock.add( '  ' + v );
		  },
		  
		  requestMemory( memorySpec, immutable=false ) {
		    for( let key in memorySpec ) {
		      let request = memorySpec[ key ];

		      //console.log( 'requesting ' + key + ':' , JSON.stringify( request ) )

		      if( request.length === undefined ) {
		        console.log( 'undefined length for:', key );

		        continue
		      }

		      request.idx = gen.memory.alloc( request.length, immutable );
		    }
		  },

		  createMemory( amount=4096, type ) {
		    const mem = MemoryHelper.create( amount, type );
		    return mem
		  },

		  createCallback( ugen, mem, debug = false, shouldInlineMemory=false, memType = Float64Array ) {
		    const numChannels = Array.isArray( ugen ) ? ugen.length : 1;
		    let isStereo = Array.isArray( ugen ) && ugen.length > 1,
		        callback; 

		    if( typeof mem === 'number' || mem === undefined ) {
		      this.memory = this.createMemory( mem, memType );
		    }else {
		      this.memory = mem;
		    }
		    
		    this.outputIdx = this.memory.alloc( numChannels, true );
		    this.emit( 'memory init' );

		    //console.log( 'cb memory:', mem )
		    this.graph = ugen;
		    this.memo = {}; 
		    this.endBlock.clear();
		    this.closures.clear();
		    this.inputs.clear();
		    this.params.clear();
		    this.globals = { windows:{} };
		    
		    this.parameters.clear();
		    
		    this.functionBody = "  'use strict'\n";
		    if( shouldInlineMemory===false ) {
		      this.functionBody += this.mode === 'worklet' ? 
		        "  var memory = this.memory\n\n" :
		        "  var memory = gen.memory\n\n";
		    }

		    // call .gen() on the head of the graph we are generating the callback for
		    //console.log( 'HEAD', ugen )
		    for( let i = 0; i < numChannels; i++ ) {
		      if( typeof ugen[i] === 'number' ) continue

		      //let channel = isStereo ? ugen[i].gen() : ugen.gen(),
		      let channel = numChannels > 1 ? this.getInput( ugen[i] ) : this.getInput( ugen ), 
		          body = '';

		      // if .gen() returns array, add ugen callback (graphOutput[1]) to our output functions body
		      // and then return name of ugen. If .gen() only generates a number (for really simple graphs)
		      // just return that number (graphOutput[0]).
		      if( Array.isArray( channel ) ) {
		        for( let j = 0; j < channel.length; j++ ) {
		          body += channel[ j ] + '\n';
		        }
		      }else {
		        body += channel;
		      }

		      // split body to inject return keyword on last line
		      body = body.split('\n');
		     
		      //if( debug ) console.log( 'functionBody length', body )
		      
		      // next line is to accommodate memo as graph head
		      if( body[ body.length -1 ].trim().indexOf('let') > -1 ) { body.push( '\n' ); } 

		      // get index of last line
		      let lastidx = body.length - 1;

		      // insert return keyword
		      body[ lastidx ] = '  memory[' + (this.outputIdx + i) + ']  = ' + body[ lastidx ] + '\n';

		      this.functionBody += body.join('\n');
		    }
		    
		    this.histories.forEach( value => {
		      if( value !== null )
		        value.gen();      
		    });

		    let returnStatement =  `  return `; 

		    // if we are returning an array of values, add starting bracket
		    if( numChannels !== 1 || this.alwaysReturnArray === true ) {
		      returnStatement += '[ ';
		    }

		    returnStatement += `memory[ ${this.outputIdx} ]`;
		    if( numChannels > 1 || this.alwaysReturnArray === true ) {
		      for( let i = 1; i < numChannels; i++ ) {
		        returnStatement += `, memory[ ${this.outputIdx + i} ]`;
		      }
		      returnStatement += ' ] ';
		    }
		     // memory[${this.outputIdx + 1}] ]` : `  return memory[${this.outputIdx}]`
		    
		    this.functionBody = this.functionBody.split('\n');

		    if( this.endBlock.size ) { 
		      this.functionBody = this.functionBody.concat( Array.from( this.endBlock ) );
		      this.functionBody.push( returnStatement );
		    }else {
		      this.functionBody.push( returnStatement );
		    }
		    // reassemble function body
		    this.functionBody = this.functionBody.join('\n');

		    // we can only dynamically create a named function by dynamically creating another function
		    // to construct the named function! sheesh...
		    //
		    if( shouldInlineMemory === true ) {
		      this.parameters.add( 'memory' );
		    }

		    let paramString = '';
		    if( this.mode === 'worklet' ) {
		      for( let name of this.parameters.values() ) {
		        paramString += name + ',';
		      }
		      paramString = paramString.slice(0,-1);
		    }

		    const separator = this.parameters.size !== 0 && this.inputs.size > 0 ? ', ' : '';

		    let inputString = '';
		    if( this.mode === 'worklet' ) {
		      for( let ugen of this.inputs.values() ) {
		        inputString += ugen.name + ',';
		      }
		      inputString = inputString.slice(0,-1);
		    }

		    let buildString = this.mode === 'worklet'
		      ? `return function( ${inputString} ${separator} ${paramString} ){ \n${ this.functionBody }\n}`
		      : `return function gen( ${ [...this.parameters].join(',') } ){ \n${ this.functionBody }\n}`;
		    
		    if( this.debug || debug ) console.log( buildString ); 

		    callback = new Function( buildString )();

		    // assign properties to named function
		    for( let dict of this.closures.values() ) {
		      let name = Object.keys( dict )[0],
		          value = dict[ name ];

		      callback[ name ] = value;
		    }

		    for( let dict of this.params.values() ) {
		      let name = Object.keys( dict )[0],
		          ugen = dict[ name ];
		      
		      Object.defineProperty( callback, name, {
		        configurable: true,
		        get() { return ugen.value },
		        set(v){ ugen.value = v; }
		      });
		      //callback[ name ] = value
		    }

		    callback.members = this.closures;
		    callback.data = this.data;
		    callback.params = this.params;
		    callback.inputs = this.inputs;
		    callback.parameters = this.parameters;//.slice( 0 )
		    callback.out = this.memory.heap.subarray( this.outputIdx, this.outputIdx + numChannels );
		    callback.isStereo = isStereo;

		    //if( MemoryHelper.isPrototypeOf( this.memory ) ) 
		    callback.memory = this.memory.heap;

		    this.histories.clear();

		    return callback
		  },
		  
		  /* getInputs
		   *
		   * Called by each individual ugen when their .gen() method is called to resolve their various inputs.
		   * If an input is a number, return the number. If
		   * it is an ugen, call .gen() on the ugen, memoize the result and return the result. If the
		   * ugen has previously been memoized return the memoized value.
		   *
		   */
		  getInputs( ugen ) {
		    return ugen.inputs.map( gen.getInput ) 
		  },

		  getInput( input ) {
		    let isObject = typeof input === 'object',
		        processedInput;

		    if( isObject ) { // if input is a ugen... 
		      //console.log( input.name, gen.memo[ input.name ] )
		      if( gen.memo[ input.name ] ) { // if it has been memoized...
		        processedInput = gen.memo[ input.name ];
		      }else if( Array.isArray( input ) ) {
		        gen.getInput( input[0] );
		        gen.getInput( input[1] );
		      }else { // if not memoized generate code  
		        if( typeof input.gen !== 'function' ) {
		          console.log( 'no gen found:', input, input.gen );
		          input = input.graph;
		        }
		        let code = input.gen();
		        //if( code.indexOf( 'Object' ) > -1 ) console.log( 'bad input:', input, code )
		        
		        if( Array.isArray( code ) ) {
		          if( !gen.shouldLocalize ) {
		            gen.functionBody += code[1];
		          }else {
		            gen.codeName = code[0];
		            gen.localizedCode.push( code[1] );
		          }
		          //console.log( 'after GEN' , this.functionBody )
		          processedInput = code[0];
		        }else {
		          processedInput = code;
		        }
		      }
		    }else { // it input is a number
		      processedInput = input;
		    }

		    return processedInput
		  },

		  startLocalize() {
		    this.localizedCode = [];
		    this.shouldLocalize = true;
		  },
		  endLocalize() {
		    this.shouldLocalize = false;

		    return [ this.codeName, this.localizedCode.slice(0) ]
		  },

		  free( graph ) {
		    if( Array.isArray( graph ) ) { // stereo ugen
		      for( let channel of graph ) {
		        this.free( channel );
		      }
		    } else {
		      if( typeof graph === 'object' ) {
		        if( graph.memory !== undefined ) {
		          for( let memoryKey in graph.memory ) {
		            this.memory.free( graph.memory[ memoryKey ].idx );
		          }
		        }
		        if( Array.isArray( graph.inputs ) ) {
		          for( let ugen of graph.inputs ) {
		            this.free( ugen );
		          }
		        }
		      }
		    }
		  }
		};

		gen.__proto__ = new EE();

		gen_1 = gen;
		return gen_1;
	}

	var abs;
	var hasRequiredAbs;

	function requireAbs () {
		if (hasRequiredAbs) return abs;
		hasRequiredAbs = 1;

		let gen  = requireGen();

		let proto = {
		  name:'abs',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet ? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.abs' : Math.abs });

		      out = `${ref}abs( ${inputs[0]} )`;

		    } else {
		      out = Math.abs( parseFloat( inputs[0] ) );
		    }
		    
		    return out
		  }
		};

		abs = x => {
		  let abs = Object.create( proto );

		  abs.inputs = [ x ];

		  return abs
		};
		return abs;
	}

	var round;
	var hasRequiredRound;

	function requireRound () {
		if (hasRequiredRound) return round;
		hasRequiredRound = 1;

		let gen  = requireGen();

		let proto = {
		  name:'round',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    
		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.round' : Math.round });

		      out = `${ref}round( ${inputs[0]} )`;

		    } else {
		      out = Math.round( parseFloat( inputs[0] ) );
		    }
		    
		    return out
		  }
		};

		round = x => {
		  let round = Object.create( proto );

		  round.inputs = [ x ];

		  return round
		};
		return round;
	}

	var param;
	var hasRequiredParam;

	function requireParam () {
		if (hasRequiredParam) return param;
		hasRequiredParam = 1;

		let gen = requireGen();

		let proto = {
		  basename: 'param',

		  gen() {
		    gen.requestMemory( this.memory );
		    
		    gen.params.add( this );

		    const isWorklet = gen.mode === 'worklet';

		    if( isWorklet ) gen.parameters.add( this.name );

		    this.value = this.initialValue;

		    gen.memo[ this.name ] = isWorklet ? this.name : `memory[${this.memory.value.idx}]`;

		    return gen.memo[ this.name ]
		  } 
		};

		param = ( propName=0, value=0, min=0, max=1 ) => {
		  let ugen = Object.create( proto );
		  
		  if( typeof propName !== 'string' ) {
		    ugen.name = ugen.basename + gen.getUID();
		    ugen.initialValue = propName;
		    ugen.min = value;
		    ugen.max = min;
		  }else {
		    ugen.name = propName;
		    ugen.min = min;
		    ugen.max = max;
		    ugen.initialValue = value;
		  }

		  ugen.defaultValue = ugen.initialValue;

		  // for storing worklet nodes once they're instantiated
		  ugen.waapi = null;

		  ugen.isWorklet = gen.mode === 'worklet';

		  Object.defineProperty( ugen, 'value', {
		    get() {
		      if( this.memory.value.idx !== null ) {
		        return gen.memory.heap[ this.memory.value.idx ]
		      }else {
		        return this.initialValue
		      }
		    },
		    set( v ) {
		      if( this.memory.value.idx !== null ) {
		        if( this.isWorklet && this.waapi !== null ) {
		          this.waapi[ propName ].value = v;
		        }else {
		          gen.memory.heap[ this.memory.value.idx ] = v;
		        } 
		      }
		    }
		  });

		  ugen.memory = {
		    value: { length:1, idx:null }
		  };

		  return ugen
		};
		return param;
	}

	var add;
	var hasRequiredAdd;

	function requireAdd () {
		if (hasRequiredAdd) return add;
		hasRequiredAdd = 1;

		const gen = requireGen();

		const proto = { 
		  basename:'add',
		  gen() {
		    let inputs = gen.getInputs( this ),
		        out='',
		        sum = 0, numCount = 0, adderAtEnd = false, alreadyFullSummed = true;

		    if( inputs.length === 0 ) return 0

		    out = `  var ${this.name} = `;

		    inputs.forEach( (v,i) => {
		      if( isNaN( v ) ) {
		        out += v;
		        if( i < inputs.length -1 ) {
		          adderAtEnd = true;
		          out += ' + ';
		        }
		        alreadyFullSummed = false;
		      }else {
		        sum += parseFloat( v );
		        numCount++;
		      }
		    });

		    if( numCount > 0 ) {
		      out += adderAtEnd || alreadyFullSummed ? sum : ' + ' + sum;
		    }

		    out += '\n';

		    gen.memo[ this.name ] = this.name;

		    return [ this.name, out ]
		  }
		};

		add = ( ...args ) => {
		  const add = Object.create( proto );
		  add.id = gen.getUID();
		  add.name = add.basename + add.id;
		  add.inputs = args;

		  return add
		};
		return add;
	}

	var sub;
	var hasRequiredSub;

	function requireSub () {
		if (hasRequiredSub) return sub;
		hasRequiredSub = 1;

		const gen = requireGen();

		const proto = {
		  basename:'sub',
		  gen() {
		    let inputs = gen.getInputs( this ),
		        out=0,
		        lastNumber = inputs[ 0 ],
		        lastNumberIsUgen = isNaN( lastNumber ), 
		        returnValue = 0;

		    this.inputs.forEach( value => { });

		    out = '  var ' + this.name + ' = ';

		    inputs.forEach( (v,i) => {
		      if( i === 0 ) return

		      let isNumberUgen = isNaN( v ),
		          isFinalIdx   = i === inputs.length - 1;

		      if( !lastNumberIsUgen && !isNumberUgen ) {
		        lastNumber = lastNumber - v;
		        out += lastNumber;
		        return
		      }else {
		        out += `${lastNumber} - ${v}`;
		      }

		      if( !isFinalIdx ) out += ' - '; 
		    });

		    out += '\n';

		    returnValue = [ this.name, out ];

		    gen.memo[ this.name ] = this.name;

		    return returnValue
		  }

		};

		sub = ( ...args ) => {
		  let sub = Object.create( proto );

		  Object.assign( sub, {
		    id:     gen.getUID(),
		    inputs: args
		  });
		       
		  sub.name = 'sub' + sub.id;

		  return sub
		};
		return sub;
	}

	var mul;
	var hasRequiredMul;

	function requireMul () {
		if (hasRequiredMul) return mul;
		hasRequiredMul = 1;

		const gen = requireGen();

		const proto = {
		  basename: 'mul',

		  gen() {
		    let inputs = gen.getInputs( this ),
		        out = `  var ${this.name} = `,
		        sum = 1, numCount = 0, mulAtEnd = false, alreadyFullSummed = true;

		    inputs.forEach( (v,i) => {
		      if( isNaN( v ) ) {
		        out += v;
		        if( i < inputs.length -1 ) {
		          mulAtEnd = true;
		          out += ' * ';
		        }
		        alreadyFullSummed = false;
		      }else {
		        if( i === 0 ) {
		          sum = v;
		        }else {
		          sum *= parseFloat( v );
		        }
		        numCount++;
		      }
		    });

		    if( numCount > 0 ) {
		      out += mulAtEnd || alreadyFullSummed ? sum : ' * ' + sum;
		    }

		    out += '\n';

		    gen.memo[ this.name ] = this.name;

		    return [ this.name, out ]
		  }
		};

		mul = ( ...args ) => {
		  const mul = Object.create( proto );
		  
		  Object.assign( mul, {
		      id:     gen.getUID(),
		      inputs: args,
		  });
		  
		  mul.name = mul.basename + mul.id;

		  return mul
		};
		return mul;
	}

	var div;
	var hasRequiredDiv;

	function requireDiv () {
		if (hasRequiredDiv) return div;
		hasRequiredDiv = 1;

		let gen = requireGen();

		const proto = {
		  basename:'div',
		  gen() {
		    let inputs = gen.getInputs( this ),
		        out=`  var ${this.name} = `,
		        lastNumber = inputs[ 0 ],
		        lastNumberIsUgen = isNaN( lastNumber ); 

		    inputs.forEach( (v,i) => {
		      if( i === 0 ) return

		      let isNumberUgen = isNaN( v ),
		        isFinalIdx   = i === inputs.length - 1;

		      if( !lastNumberIsUgen && !isNumberUgen ) {
		        lastNumber = lastNumber / v;
		        out += lastNumber;
		      }else {
		        out += `${lastNumber} / ${v}`;
		      }

		      if( !isFinalIdx ) out += ' / '; 
		    });

		    out += '\n';

		    gen.memo[ this.name ] = this.name;

		    return [ this.name, out ]
		  }
		};

		div = (...args) => {
		  const div = Object.create( proto );
		  
		  Object.assign( div, {
		    id:     gen.getUID(),
		    inputs: args,
		  });

		  div.name = div.basename + div.id;
		  
		  return div
		};
		return div;
	}

	var accum;
	var hasRequiredAccum;

	function requireAccum () {
		if (hasRequiredAccum) return accum;
		hasRequiredAccum = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'accum',

		  gen() {
		    let inputs = gen.getInputs( this ),
		        genName = 'gen.' + this.name,
		        functionBody;

		    gen.requestMemory( this.memory );

		    gen.memory.heap[ this.memory.value.idx ] = this.initialValue;

		    functionBody = this.callback( genName, inputs[0], inputs[1], `memory[${this.memory.value.idx}]` );

		    //gen.closures.add({ [ this.name ]: this }) 

		    gen.memo[ this.name ] = this.name + '_value';
		    
		    return [ this.name + '_value', functionBody ]
		  },

		  callback( _name, _incr, _reset, valueRef ) {
		    let diff = this.max - this.min,
		        out = '',
		        wrap = '';
		    
		    /* three different methods of wrapping, third is most expensive:
		     *
		     * 1: range {0,1}: y = x - (x | 0)
		     * 2: log2(this.max) == integer: y = x & (this.max - 1)
		     * 3: all others: if( x >= this.max ) y = this.max -x
		     *
		     */

		    // must check for reset before storing value for output
		    if( !(typeof this.inputs[1] === 'number' && this.inputs[1] < 1) ) { 
		      if( this.resetValue !== this.min ) {

		        out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.resetValue}\n\n`;
		        //out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.min}\n\n`
		      }else {
		        out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.min}\n\n`;
		        //out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.initialValue}\n\n`
		      }
		    }

		    out += `  var ${this.name}_value = ${valueRef}\n`;
		    
		    if( this.shouldWrap === false && this.shouldClamp === true ) {
		      out += `  if( ${valueRef} < ${this.max } ) ${valueRef} += ${_incr}\n`;
		    }else {
		      out += `  ${valueRef} += ${_incr}\n`; // store output value before accumulating  
		    }

		    if( this.max !== Infinity  && this.shouldWrapMax ) wrap += `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n`;
		    if( this.min !== -Infinity && this.shouldWrapMin ) wrap += `  if( ${valueRef} < ${this.min} ) ${valueRef} += ${diff}\n`;

		    //if( this.min === 0 && this.max === 1 ) { 
		    //  wrap =  `  ${valueRef} = ${valueRef} - (${valueRef} | 0)\n\n`
		    //} else if( this.min === 0 && ( Math.log2( this.max ) | 0 ) === Math.log2( this.max ) ) {
		    //  wrap =  `  ${valueRef} = ${valueRef} & (${this.max} - 1)\n\n`
		    //} else if( this.max !== Infinity ){
		    //  wrap = `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n\n`
		    //}

		    out = out + wrap + '\n';

		    return out
		  },

		  defaults : { min:0, max:1, resetValue:0, initialValue:0, shouldWrap:true, shouldWrapMax: true, shouldWrapMin:true, shouldClamp:false }
		};

		accum = ( incr, reset=0, properties ) => {
		  const ugen = Object.create( proto );
		      
		  Object.assign( ugen, 
		    { 
		      uid:    gen.getUID(),
		      inputs: [ incr, reset ],
		      memory: {
		        value: { length:1, idx:null }
		      }
		    },
		    proto.defaults,
		    properties 
		  );

		  if( properties !== undefined && properties.shouldWrapMax === undefined && properties.shouldWrapMin === undefined ) {
		    if( properties.shouldWrap !== undefined ) {
		      ugen.shouldWrapMin = ugen.shouldWrapMax = properties.shouldWrap;
		    }
		  }

		  if( properties !== undefined && properties.resetValue === undefined ) {
		    ugen.resetValue = ugen.min;
		  }

		  if( ugen.initialValue === undefined ) ugen.initialValue = ugen.min;

		  Object.defineProperty( ugen, 'value', {
		    get()  { 
		      //console.log( 'gen:', gen, gen.memory )
		      return gen.memory.heap[ this.memory.value.idx ] 
		    },
		    set(v) { gen.memory.heap[ this.memory.value.idx ] = v; }
		  });

		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return accum;
	}

	var counter;
	var hasRequiredCounter;

	function requireCounter () {
		if (hasRequiredCounter) return counter;
		hasRequiredCounter = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'counter',

		  gen() {
		    let inputs = gen.getInputs( this ),
		        genName = 'gen.' + this.name,
		        functionBody;
		       
		    if( this.memory.value.idx === null ) gen.requestMemory( this.memory );
		    gen.memory.heap[ this.memory.value.idx ] = this.initialValue;
		    
		    functionBody  = this.callback( genName, inputs[0], inputs[1], inputs[2], inputs[3], inputs[4],  `memory[${this.memory.value.idx}]`, `memory[${this.memory.wrap.idx}]`  );

		    gen.memo[ this.name ] = this.name + '_value';
		   
		    if( gen.memo[ this.wrap.name ] === undefined ) this.wrap.gen();

		    return [ this.name + '_value', functionBody ]
		  },

		  callback( _name, _incr, _min, _max, _reset, loops, valueRef, wrapRef ) {
		    let diff = this.max - this.min,
		        out = '',
		        wrap = '';
		    // must check for reset before storing value for output
		    if( !(typeof this.inputs[3] === 'number' && this.inputs[3] < 1) ) { 
		      out += `  if( ${_reset} >= 1 ) ${valueRef} = ${_min}\n`;
		    }

		    out += `  var ${this.name}_value = ${valueRef};\n  ${valueRef} += ${_incr}\n`; // store output value before accumulating  
		    
		    if( typeof this.max === 'number' && this.max !== Infinity && typeof this.min !== 'number' ) {
		      wrap = 
		`  if( ${valueRef} >= ${this.max} &&  ${loops} > 0) {
    ${valueRef} -= ${diff}
    ${wrapRef} = 1
  }else{
    ${wrapRef} = 0
  }\n`;
		    }else if( this.max !== Infinity && this.min !== Infinity ) {
		      wrap = 
		`  if( ${valueRef} >= ${_max} &&  ${loops} > 0) {
    ${valueRef} -= ${_max} - ${_min}
    ${wrapRef} = 1
  }else if( ${valueRef} < ${_min} &&  ${loops} > 0) {
    ${valueRef} += ${_max} - ${_min}
    ${wrapRef} = 1
  }else{
    ${wrapRef} = 0
  }\n`;
		    }else {
		      out += '\n';
		    }

		    out = out + wrap;

		    return out
		  }
		};

		counter = ( incr=1, min=0, max=Infinity, reset=0, loops=1,  properties ) => {
		  let ugen = Object.create( proto ),
		      defaults = Object.assign( { initialValue: 0, shouldWrap:true }, properties );

		  Object.assign( ugen, { 
		    min:    min, 
		    max:    max,
		    initialValue: defaults.initialValue,
		    value:  defaults.initialValue,
		    uid:    gen.getUID(),
		    inputs: [ incr, min, max, reset, loops ],
		    memory: {
		      value: { length:1, idx: null },
		      wrap:  { length:1, idx: null } 
		    },
		    wrap : {
		      gen() { 
		        if( ugen.memory.wrap.idx === null ) {
		          gen.requestMemory( ugen.memory );
		        }
		        gen.getInputs( this );
		        gen.memo[ this.name ] = `memory[ ${ugen.memory.wrap.idx} ]`;
		        return `memory[ ${ugen.memory.wrap.idx} ]` 
		      }
		    }
		  },
		  defaults );
		 
		  Object.defineProperty( ugen, 'value', {
		    get() { 
		      //console.log( 'counter value', this.memory.value.idx, gen.memory.heap[ this.memory.value.idx ], gen.memory )
		        
		      if( this.memory.value.idx !== null ) {
		        return gen.memory.heap[ this.memory.value.idx ]
		      }
		    },
		    set( v ) {
		      if( this.memory.value.idx !== null ) {
		        //console.log( 'settting counter', v )
		        gen.memory.heap[ this.memory.value.idx ] = v; 
		      }
		    }
		  });
		  
		  ugen.wrap.inputs = [ ugen ];
		  ugen.name = `${ugen.basename}${ugen.uid}`;
		  ugen.wrap.name = ugen.name + '_wrap';
		  return ugen
		};
		return counter;
	}

	var sin;
	var hasRequiredSin;

	function requireSin () {
		if (hasRequiredSin) return sin;
		hasRequiredSin = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'sin',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );
		    
		    
		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ 'sin': isWorklet ? 'Math.sin' : Math.sin });

		      out = `${ref}sin( ${inputs[0]} )`; 

		    } else {
		      out = Math.sin( parseFloat( inputs[0] ) );
		    }
		    
		    return out
		  }
		};

		sin = x => {
		  let sin = Object.create( proto );

		  sin.inputs = [ x ];
		  sin.id = gen.getUID();
		  sin.name = `${sin.basename}{sin.id}`;

		  return sin
		};
		return sin;
	}

	var cos;
	var hasRequiredCos;

	function requireCos () {
		if (hasRequiredCos) return cos;
		hasRequiredCos = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'cos',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );
		    
		    
		    const isWorklet = gen.mode === 'worklet';

		    const ref = isWorklet ? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ 'cos': isWorklet ? 'Math.cos' : Math.cos });

		      out = `${ref}cos( ${inputs[0]} )`; 

		    } else {
		      out = Math.cos( parseFloat( inputs[0] ) );
		    }
		    
		    return out
		  }
		};

		cos = x => {
		  let cos = Object.create( proto );

		  cos.inputs = [ x ];
		  cos.id = gen.getUID();
		  cos.name = `${cos.basename}{cos.id}`;

		  return cos
		};
		return cos;
	}

	var tan;
	var hasRequiredTan;

	function requireTan () {
		if (hasRequiredTan) return tan;
		hasRequiredTan = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'tan',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );
		    
		    
		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ 'tan': isWorklet ? 'Math.tan' : Math.tan });

		      out = `${ref}tan( ${inputs[0]} )`; 

		    } else {
		      out = Math.tan( parseFloat( inputs[0] ) );
		    }
		    
		    return out
		  }
		};

		tan = x => {
		  let tan = Object.create( proto );

		  tan.inputs = [ x ];
		  tan.id = gen.getUID();
		  tan.name = `${tan.basename}{tan.id}`;

		  return tan
		};
		return tan;
	}

	var tanh;
	var hasRequiredTanh;

	function requireTanh () {
		if (hasRequiredTanh) return tanh;
		hasRequiredTanh = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'tanh',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );
		    
		    
		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ 'tanh': isWorklet ? 'Math.tan' : Math.tanh });

		      out = `${ref}tanh( ${inputs[0]} )`; 

		    } else {
		      out = Math.tanh( parseFloat( inputs[0] ) );
		    }
		    
		    return out
		  }
		};

		tanh = x => {
		  let tanh = Object.create( proto );

		  tanh.inputs = [ x ];
		  tanh.id = gen.getUID();
		  tanh.name = `${tanh.basename}{tanh.id}`;

		  return tanh
		};
		return tanh;
	}

	var asin;
	var hasRequiredAsin;

	function requireAsin () {
		if (hasRequiredAsin) return asin;
		hasRequiredAsin = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'asin',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );
		    
		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet ? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ 'asin': isWorklet ? 'Math.sin' : Math.asin });

		      out = `${ref}asin( ${inputs[0]} )`; 

		    } else {
		      out = Math.asin( parseFloat( inputs[0] ) );
		    }
		    
		    return out
		  }
		};

		asin = x => {
		  let asin = Object.create( proto );

		  asin.inputs = [ x ];
		  asin.id = gen.getUID();
		  asin.name = `${asin.basename}{asin.id}`;

		  return asin
		};
		return asin;
	}

	var acos;
	var hasRequiredAcos;

	function requireAcos () {
		if (hasRequiredAcos) return acos;
		hasRequiredAcos = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'acos',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );
		    

		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet ? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ 'acos': isWorklet ? 'Math.acos' :Math.acos });

		      out = `${ref}acos( ${inputs[0]} )`; 

		    } else {
		      out = Math.acos( parseFloat( inputs[0] ) );
		    }
		    
		    return out
		  }
		};

		acos = x => {
		  let acos = Object.create( proto );

		  acos.inputs = [ x ];
		  acos.id = gen.getUID();
		  acos.name = `${acos.basename}{acos.id}`;

		  return acos
		};
		return acos;
	}

	var atan;
	var hasRequiredAtan;

	function requireAtan () {
		if (hasRequiredAtan) return atan;
		hasRequiredAtan = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'atan',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );
		    
		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet ? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ 'atan': isWorklet ? 'Math.atan' : Math.atan });

		      out = `${ref}atan( ${inputs[0]} )`; 

		    } else {
		      out = Math.atan( parseFloat( inputs[0] ) );
		    }
		    
		    return out
		  }
		};

		atan = x => {
		  let atan = Object.create( proto );

		  atan.inputs = [ x ];
		  atan.id = gen.getUID();
		  atan.name = `${atan.basename}{atan.id}`;

		  return atan
		};
		return atan;
	}

	var phasor;
	var hasRequiredPhasor;

	function requirePhasor () {
		if (hasRequiredPhasor) return phasor;
		hasRequiredPhasor = 1;

		const gen   = requireGen(),
		      accum = requireAccum(),
		      mul   = requireMul(),
		      proto = { basename:'phasor' },
		      div   = requireDiv();

		const defaults = { min: -1, max: 1 };

		phasor = ( frequency = 1, reset = 0, _props ) => {
		  const props = Object.assign( {}, defaults, _props );

		  const range = props.max - props.min;

		  const ugen = typeof frequency === 'number' 
		    ? accum( (frequency * range) / gen.samplerate, reset, props ) 
		    : accum( 
		        div( 
		          mul( frequency, range ),
		          gen.samplerate
		        ), 
		        reset, props 
		    );

		  ugen.name = proto.basename + gen.getUID();

		  return ugen
		};
		return phasor;
	}

	var phasorN;
	var hasRequiredPhasorN;

	function requirePhasorN () {
		if (hasRequiredPhasorN) return phasorN;
		hasRequiredPhasorN = 1;

		const gen   = requireGen(),
		      accum = requireAccum(),
		      mul   = requireMul(),
		      proto = { basename:'phasorN' },
		      div   = requireDiv();

		const defaults = { min: 0, max: 1 };

		phasorN = ( frequency = 1, reset = 0, _props ) => {
		  const props = Object.assign( {}, defaults, _props );

		  const range = props.max - props.min;

		  const ugen = typeof frequency === 'number' 
		    ? accum( (frequency * range) / gen.samplerate, reset, props ) 
		    : accum( 
		        div( 
		          mul( frequency, range ),
		          gen.samplerate
		        ), 
		        reset, props 
		    );

		  ugen.name = proto.basename + gen.getUID();

		  return ugen
		};
		return phasorN;
	}

	/**
	 * Copyright 2018 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
	 * use this file except in compliance with the License. You may obtain a copy of
	 * the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
	 * License for the specific language governing permissions and limitations under
	 * the License.
	 */

	var realm;
	var hasRequiredRealm;

	function requireRealm () {
		if (hasRequiredRealm) return realm;
		hasRequiredRealm = 1;
		realm = function Realm (scope, parentElement) {
		  const frame = document.createElement('iframe');
		  frame.style.cssText = 'position:absolute;left:0;top:-999px;width:1px;height:1px;';
		  parentElement.appendChild(frame);
		  const win = frame.contentWindow;
		  const doc = win.document;
		  let vars = 'var window,$hook';
		  for (const i in win) {
		    if (!(i in scope) && i !== 'eval') {
		      vars += ',';
		      vars += i;
		    }
		  }
		  for (const i in scope) {
		    vars += ',';
		    vars += i;
		    vars += '=self.';
		    vars += i;
		  }
		  const script = doc.createElement('script');
		  script.appendChild(doc.createTextNode(
		    `function $hook(self,console) {"use strict";
        ${vars};return function() {return eval(arguments[0])}}`
		  ));
		  doc.body.appendChild(script);
		  this.exec = win.$hook.call(scope, scope, console);
		};
		return realm;
	}

	/**
	 * Copyright 2018 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
	 * use this file except in compliance with the License. You may obtain a copy of
	 * the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
	 * License for the specific language governing permissions and limitations under
	 * the License.
	 */

	var audioworkletPolyfill;
	var hasRequiredAudioworkletPolyfill;

	function requireAudioworkletPolyfill () {
		if (hasRequiredAudioworkletPolyfill) return audioworkletPolyfill;
		hasRequiredAudioworkletPolyfill = 1;
		// originally from:
		// https://github.com/GoogleChromeLabs/audioworklet-polyfill
		// I am modifying it to accept variable buffer sizes
		// and to get rid of some strange global initialization that seems required to use it
		// with browserify. Also, I added changes to fix a bug in Safari for the AudioWorkletProcessor
		// property not having a prototype (see:https://github.com/GoogleChromeLabs/audioworklet-polyfill/pull/25)
		// TODO: Why is there an iframe involved? (realm.js)

		const Realm = requireRealm();

		const AWPF = function( self = window, bufferSize = 4096 ) {
		  const PARAMS = [];
		  let nextPort;

		  if (typeof AudioWorkletNode !== 'function' || !("audioWorklet" in AudioContext.prototype)) {
		    self.AudioWorkletNode = function AudioWorkletNode (context, name, options) {
		      const processor = getProcessorsForContext(context)[name];
		      const outputChannels = options && options.outputChannelCount ? options.outputChannelCount[0] : 2;
		      const scriptProcessor = context.createScriptProcessor( bufferSize, 2, outputChannels);

		      scriptProcessor.parameters = new Map();
		      if (processor.properties) {
		        for (let i = 0; i < processor.properties.length; i++) {
		          const prop = processor.properties[i];
		          const node = context.createGain().gain;
		          node.value = prop.defaultValue;
		          // @TODO there's no good way to construct the proxy AudioParam here
		          scriptProcessor.parameters.set(prop.name, node);
		        }
		      }

		      const mc = new MessageChannel();
		      nextPort = mc.port2;
		      const inst = new processor.Processor(options || {});
		      nextPort = null;

		      scriptProcessor.port = mc.port1;
		      scriptProcessor.processor = processor;
		      scriptProcessor.instance = inst;
		      scriptProcessor.onaudioprocess = onAudioProcess;
		      return scriptProcessor;
		    };

		    Object.defineProperty((self.AudioContext || self.webkitAudioContext).prototype, 'audioWorklet', {
		      get () {
		        return this.$$audioWorklet || (this.$$audioWorklet = new self.AudioWorklet(this));
		      }
		    });

		    /* XXX - ADDED TO OVERCOME PROBLEM IN SAFARI WHERE AUDIOWORKLETPROCESSOR PROTOTYPE IS NOT AN OBJECT */
		    const AudioWorkletProcessor = function() {
		      this.port = nextPort;
		    };
		    AudioWorkletProcessor.prototype = {};

		    self.AudioWorklet = class AudioWorklet {
		      constructor (audioContext) {
		        this.$$context = audioContext;
		      }

		      addModule (url, options) {
		        return fetch(url).then(r => {
		          if (!r.ok) throw Error(r.status);
		          return r.text();
		        }).then( code => {
		          const context = {
		            sampleRate: this.$$context.sampleRate,
		            currentTime: this.$$context.currentTime,
		            AudioWorkletProcessor,
		            registerProcessor: (name, Processor) => {
		              const processors = getProcessorsForContext(this.$$context);
		              processors[name] = {
		                realm,
		                context,
		                Processor,
		                properties: Processor.parameterDescriptors || []
		              };
		            }
		          };

		          context.self = context;
		          const realm = new Realm(context, document.documentElement);
		          realm.exec(((options && options.transpile) || String)(code));
		          return null;
		        });
		      }
		    };
		  }

		  function onAudioProcess (e) {
		    const parameters = {};
		    let index = -1;
		    this.parameters.forEach((value, key) => {
		      const arr = PARAMS[++index] || (PARAMS[index] = new Float32Array(this.bufferSize));
		      // @TODO proper values here if possible
		      arr.fill(value.value);
		      parameters[key] = arr;
		    });
		    this.processor.realm.exec(
		      'self.sampleRate=sampleRate=' + this.context.sampleRate + ';' +
		      'self.currentTime=currentTime=' + this.context.currentTime
		    );
		    const inputs = channelToArray(e.inputBuffer);
		    const outputs = channelToArray(e.outputBuffer);
		    this.instance.process([inputs], [outputs], parameters);
		  }

		  function channelToArray (ch) {
		    const out = [];
		    for (let i = 0; i < ch.numberOfChannels; i++) {
		      out[i] = ch.getChannelData(i);
		    }
		    return out;
		  }

		  function getProcessorsForContext (audioContext) {
		    return audioContext.$$processors || (audioContext.$$processors = {});
		  }
		};

		audioworkletPolyfill = AWPF;
		return audioworkletPolyfill;
	}

	var utilities_1;
	var hasRequiredUtilities;

	function requireUtilities () {
		if (hasRequiredUtilities) return utilities_1;
		hasRequiredUtilities = 1;

		const AWPF = requireAudioworkletPolyfill(),
		      gen  = requireGen();
		      requireData();

		const utilities = {
		  ctx: null,
		  buffers: {},
		  isStereo:false,

		  clear() {
		    if( this.workletNode !== undefined ) {
		      this.workletNode.disconnect();
		    }else {
		      this.callback = () => 0;
		    }
		    this.clear.callbacks.forEach( v => v() );
		    this.clear.callbacks.length = 0;

		    this.isStereo = false;

		    if( gen.graph !== null ) gen.free( gen.graph );
		  },

		  createContext( bufferSize = 2048, __AC=null ) {
		    if( __AC === null ) {
		      const AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext;
		      
		      // tell polyfill global object and buffersize
		      AWPF( window, bufferSize );

		      const start = () => {
		        if( typeof AC !== 'undefined' ) {
		          this.ctx = new AC({ latencyHint:.0125 });

		          gen.samplerate = this.ctx.sampleRate;

		          if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
		            window.removeEventListener( 'touchstart', start );
		          }else {
		            window.removeEventListener( 'mousedown', start );
		            window.removeEventListener( 'keydown', start );
		          }

		          const mySource = utilities.ctx.createBufferSource();
		          mySource.connect( utilities.ctx.destination );
		          mySource.start();
		        }
		      };

		      if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
		        window.addEventListener( 'touchstart', start );
		      }else {
		        window.addEventListener( 'mousedown', start );
		        window.addEventListener( 'keydown', start );
		      }
		    }else {
		      this.ctx = __AC;
		      gen.samplerate = this.ctx.sampleRate;
		    }

		    return this
		  },

		  createScriptProcessor() {
		    this.node = this.ctx.createScriptProcessor( 1024, 0, 2 );
		    this.clearFunction = function() { return 0 };
		    if( typeof this.callback === 'undefined' ) this.callback = this.clearFunction;

		    this.node.onaudioprocess = function( audioProcessingEvent ) {
		      const outputBuffer = audioProcessingEvent.outputBuffer;

		      const left = outputBuffer.getChannelData( 0 ),
		            right= outputBuffer.getChannelData( 1 ),
		            isStereo = utilities.isStereo;

		     for( var sample = 0; sample < left.length; sample++ ) {
		        var out = utilities.callback();

		        if( isStereo === false ) {
		          left[ sample ] = right[ sample ] = out; 
		        }else {
		          left[ sample  ] = out[0];
		          right[ sample ] = out[1];
		        }
		      }
		    };

		    this.node.connect( this.ctx.destination );

		    return this
		  },

		  // remove starting stuff and add tabs
		  prettyPrintCallback( cb ) {
		    // get rid of "function gen" and start with parenthesis
		    // const shortendCB = cb.toString().slice(9)
		    const cbSplit = cb.toString().split('\n');
		    const cbTrim = cbSplit.slice( 3, -2 );
		    const cbTabbed = cbTrim.map( v => '      ' + v ); 
		    
		    return cbTabbed.join('\n')
		  },

		  createParameterDescriptors( cb ) {
		    // [{name: 'amplitude', defaultValue: 0.25, minValue: 0, maxValue: 1}];
		    let paramStr = '';

		    //for( let ugen of cb.params.values() ) {
		    //  paramStr += `{ name:'${ugen.name}', defaultValue:${ugen.value}, minValue:${ugen.min}, maxValue:${ugen.max} },\n      `
		    //}
		    for( let ugen of cb.params.values() ) {
		      paramStr += `{ name:'${ugen.name}', automationRate:'k-rate', defaultValue:${ugen.defaultValue}, minValue:${ugen.min}, maxValue:${ugen.max} },\n      `;
		    }
		    return paramStr
		  },

		  createParameterDereferences( cb ) {
		    let str = cb.params.size > 0 ? '\n      ' : '';
		    for( let ugen of cb.params.values() ) {
		      str += `const ${ugen.name} = parameters.${ugen.name}[0]\n      `;
		    }

		    return str
		  },

		  createParameterArguments( cb ) {
		    let  paramList = '';
		    for( let ugen of cb.params.values() ) {
		      paramList += ugen.name + '[i],';
		    }
		    paramList = paramList.slice( 0, -1 );

		    return paramList
		  },

		  createInputDereferences( cb ) {
		    let str = cb.inputs.size > 0 ? '\n' : '';
		    for( let input of  cb.inputs.values() ) {
		      str += `const ${input.name} = inputs[ ${input.inputNumber} ][ ${input.channelNumber} ]\n      `;
		    }

		    return str
		  },


		  createInputArguments( cb ) {
		    let  paramList = '';
		    for( let input of cb.inputs.values() ) {
		      paramList += input.name + '[i],';
		    }
		    paramList = paramList.slice( 0, -1 );

		    return paramList
		  },
		      
		  createFunctionDereferences( cb ) {
		    let memberString = cb.members.size > 0 ? '\n' : '';
		    let memo = {};
		    for( let dict of cb.members.values() ) {
		      const name = Object.keys( dict )[0],
		            value = dict[ name ];

		      if( memo[ name ] !== undefined ) continue
		      memo[ name ] = true;

		      memberString += `      const ${name} = ${value}\n`;
		    }

		    return memberString
		  },

		  createWorkletProcessor( graph, name, debug, mem=44100*10, __eval=false, kernel=false ) {
		    const numChannels = Array.isArray( graph ) ? graph.length : 1;
		    //const mem = MemoryHelper.create( 4096, Float64Array )
		    const cb = gen.createCallback( graph, mem, debug );
		    const inputs = cb.inputs;

		    // get all inputs and create appropriate audioparam initializers
		    const parameterDescriptors = this.createParameterDescriptors( cb );
		    const parameterDereferences = this.createParameterDereferences( cb );
		    this.createParameterArguments( cb );
		    const inputDereferences = this.createInputDereferences( cb );
		    this.createInputArguments( cb );   
		    const memberString = this.createFunctionDereferences( cb );

		    let inputsString = '';
		    let genishOutputLine = '';
		    for( let i = 0; i < numChannels; i++ ) {
		      inputsString += `const channel${i} = output[ ${i} ]\n\t\t`;
		      genishOutputLine += `channel${i}[ i ] = memory[ ${i} ]\n\t\t`;
		    }

		    // change output based on number of channels.
		    //const genishOutputLine = cb.isStereo === false
		    //  ? `left[ i ] = memory[0]`
		    //  : `left[ i ] = memory[0];\n\t\tright[ i ] = memory[1]\n`
		    

		    const prettyCallback = this.prettyPrintCallback( cb );

		    // if __eval, provide the ability of eval code in worklet
		    const evalString = __eval
		      ? ` else if( event.data.key === 'eval' ) {
        eval( event.data.code )
      }
`
		      : '';

		    const kernelFncString = `this.kernel = function( memory ) {
      ${prettyCallback}
    }`;
		    /***** begin callback code ****/
		    // note that we have to check to see that memory has been passed
		    // to the worker before running the callback function, otherwise
		    // it can be passed too slowly and fail on occassion

		    const workletCode = `
class ${name}Processor extends AudioWorkletProcessor {

  static get parameterDescriptors() {
    const params = [
      ${ parameterDescriptors }      
    ]
    return params
  }
 
  constructor( options ) {
    super( options )
    this.port.onmessage = this.handleMessage.bind( this )
    this.initialized = false
    ${ kernel ? kernelFncString : '' }
  }

  handleMessage( event ) {
    if( event.data.key === 'init' ) {
      this.memory = event.data.memory
      this.initialized = true
    }else if( event.data.key === 'set' ) {
      this.memory[ event.data.idx ] = event.data.value
    }else if( event.data.key === 'get' ) {
      this.port.postMessage({ key:'return', idx:event.data.idx, value:this.memory[event.data.idx] })     
    }${ evalString }
  }

  process( inputs, outputs, parameters ) {
    if( this.initialized === true ) {

      const output = outputs[0]
      ${inputsString}
      const len    = channel0.length
      const memory = this.memory ${parameterDereferences}${inputDereferences}${memberString}
      ${kernel ? 'const kernel = this.kernel' : '' }


      for( let i = 0; i < len; ++i ) {
        ${kernel ? 'kernel( memory )\n' : prettyCallback}
        ${genishOutputLine}
      }
    }
    return true
  }
}
    
registerProcessor( '${name}', ${name}Processor)`;

		    
		    /***** end callback code *****/


		    if( debug === true ) console.log( workletCode );

		    const url = window.URL.createObjectURL(
		      new Blob(
		        [ workletCode ], 
		        { type: 'text/javascript' }
		      )
		    );

		    return [ url, workletCode, inputs, cb.params, numChannels ] 
		  },

		  registeredForNodeAssignment: [],
		  register( ugen ) {
		    if( this.registeredForNodeAssignment.indexOf( ugen ) === -1 ) {
		      this.registeredForNodeAssignment.push( ugen );
		    }
		  },

		  makeWorklet( graph, name, debug=false, mem=44100 * 1, __eval=false, kernel=false ) {
		    const [ url, codeString, inputs, params, numChannels ] = utilities.createWorkletProcessor( graph, name, debug, mem, __eval, kernel );

		    const nodePromise = new Promise( (resolve,reject) => {
		      utilities.ctx.audioWorklet.addModule( url ).then( ()=> {
		        const workletNode = new AudioWorkletNode( utilities.ctx, name, { channelInterpretation:'discrete', channelCount: numChannels, outputChannelCount:[ numChannels ] });

		        workletNode.callbacks = {};
		        workletNode.onmessage = function( event ) {
		          if( event.data.message === 'return' ) {
		            workletNode.callbacks[ event.data.idx ]( event.data.value );


		            delete workletNode.callbacks[ event.data.idx ];
		          }
		        };

		        workletNode.getMemoryValue = function( idx, cb ) {
		          this.workletCallbacks[ idx ] = cb;
		          this.workletNode.port.postMessage({ key:'get', idx: idx });
		        };
		        
		        workletNode.port.postMessage({ key:'init', memory:gen.memory.heap });
		        utilities.workletNode = workletNode;

		        utilities.registeredForNodeAssignment.forEach( ugen => ugen.node = workletNode );
		        utilities.registeredForNodeAssignment.length = 0;

		        // assign all params as properties of node for easier reference 
		        for( let dict of inputs.values() ) {
		          const name = Object.keys( dict )[0];
		          const param = workletNode.parameters.get( name );
		      
		          Object.defineProperty( workletNode, name, {
		            set( v ) {
		              param.value = v;
		            },
		            get() {
		              return param.value
		            }
		          });
		        }

		        for( let ugen of params.values() ) {
		          const name = ugen.name;
		          const param = workletNode.parameters.get( name );
		          ugen.waapi = param; 
		          // initialize?
		          param.value = ugen.defaultValue;

		          Object.defineProperty( workletNode, name, {
		            set( v ) {
		              param.value = v;
		            },
		            get() {
		              return param.value
		            }
		          });
		        }

		        resolve( workletNode );
		      });

		    });

		    return nodePromise
		  },


		  playWorklet( graph, name, debug=false, mem=44100 * 60, __eval=false, kernel=false ) {
		    utilities.clear();

		    const [ url, codeString, inputs, params, numChannels ] = utilities.createWorkletProcessor( graph, name, debug, mem, __eval, kernel );
		    console.log( 'numChannels:', numChannels );

		    const nodePromise = new Promise( (resolve,reject) => {
		   
		      utilities.ctx.audioWorklet.addModule( url ).then( ()=> {
		        const workletNode = new AudioWorkletNode( utilities.ctx, name, { channelInterpretation:'discrete', channelCount: numChannels, outputChannelCount:[ numChannels ] });

		        workletNode.callbacks = {};
		        workletNode.onmessage = function( event ) {
		          if( event.data.message === 'return' ) {
		            workletNode.callbacks[ event.data.idx ]( event.data.value );
		            delete workletNode.callbacks[ event.data.idx ];
		          }
		        };

		        workletNode.getMemoryValue = function( idx, cb ) {
		          this.workletCallbacks[ idx ] = cb;
		          this.workletNode.port.postMessage({ key:'get', idx: idx });
		        };
		        
		        workletNode.port.postMessage({ key:'init', memory:gen.memory.heap });
		        utilities.workletNode = workletNode;

		        utilities.registeredForNodeAssignment.forEach( ugen => ugen.node = workletNode );
		        utilities.registeredForNodeAssignment.length = 0;

		        // assign all params as properties of node for easier reference 
		        for( let dict of inputs.values() ) {
		          const name = Object.keys( dict )[0];
		          const param = workletNode.parameters.get( name );
		      
		          Object.defineProperty( workletNode, name, {
		            set( v ) {
		              param.value = v;
		            },
		            get() {
		              return param.value
		            }
		          });
		        }

		        for( let ugen of params.values() ) {
		          const name = ugen.name;
		          const param = workletNode.parameters.get( name );
		          ugen.waapi = param; 
		          // initialize?
		          param.value = ugen.defaultValue;

		          Object.defineProperty( workletNode, name, {
		            set( v ) {
		              param.value = v;
		            },
		            get() {
		              return param.value
		            }
		          });
		        }

		        if( utilities.console ) utilities.console.setValue( codeString );

		        workletNode.connect( utilities.ctx.destination );

		        resolve( workletNode );
		      });

		    });

		    return nodePromise
		  },
		  
		  playGraph( graph, debug, mem=44100*10, memType=Float32Array ) {
		    utilities.clear();
		    if( debug === undefined ) debug = false;
		          
		    this.isStereo = Array.isArray( graph );

		    utilities.callback = gen.createCallback( graph, mem, debug, false, memType );
		    
		    if( utilities.console ) utilities.console.setValue( utilities.callback.toString() );

		    return utilities.callback
		  },

		  loadSample( soundFilePath, data ) {
		    const isLoaded = utilities.buffers[ soundFilePath ] !== undefined;

		    let req = new XMLHttpRequest();
		    req.open( 'GET', soundFilePath, true );
		    req.responseType = 'arraybuffer'; 
		    
		    let promise = new Promise( (resolve,reject) => {
		      if( !isLoaded ) {
		        req.onload = function() {
		          var audioData = req.response;

		          utilities.ctx.decodeAudioData( audioData, (buffer) => {
		            data.buffer = buffer.getChannelData(0);
		            utilities.buffers[ soundFilePath ] = data.buffer;
		            resolve( data.buffer );
		          });
		        };
		      }else {
		        setTimeout( ()=> resolve( utilities.buffers[ soundFilePath ] ), 0 );
		      }
		    });

		    if( !isLoaded ) req.send();

		    return promise
		  }

		};

		utilities.clear.callbacks = [];

		utilities_1 = utilities;
		return utilities_1;
	}

	var peek;
	var hasRequiredPeek;

	function requirePeek () {
		if (hasRequiredPeek) return peek;
		hasRequiredPeek = 1;
		const gen  = requireGen();
		      requireData();

		let proto = {
		  basename:'peek',

		  gen() {
		    'gen.' + this.name;
		        let inputs = gen.getInputs( this ),
		        functionBody, next, lengthIsLog2, idx;
		    
		    idx = inputs[1];
		    lengthIsLog2 = (Math.log2( this.data.buffer.length ) | 0)  === Math.log2( this.data.buffer.length );

		    if( this.mode !== 'simple' ) {

		    functionBody = `  var ${this.name}_dataIdx  = ${idx}, 
      ${this.name}_phase = ${this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + (this.data.buffer.length) }, 
      ${this.name}_index = ${this.name}_phase | 0,\n`;

		    if( this.boundmode === 'wrap' ) {
		      next = lengthIsLog2 ?
		      `( ${this.name}_index + 1 ) & (${this.data.buffer.length} - 1)` :
		      `${this.name}_index + 1 >= ${this.data.buffer.length} ? ${this.name}_index + 1 - ${this.data.buffer.length} : ${this.name}_index + 1`;
		    }else if( this.boundmode === 'clamp' ) {
		      next = 
		        `${this.name}_index + 1 >= ${this.data.buffer.length - 1} ? ${this.data.buffer.length - 1} : ${this.name}_index + 1`;
		    } else if( this.boundmode === 'fold' || this.boundmode === 'mirror' ) {
		      next = 
		        `${this.name}_index + 1 >= ${this.data.buffer.length - 1} ? ${this.name}_index - ${this.data.buffer.length - 1} : ${this.name}_index + 1`;
		    }else {
		       next = 
		      `${this.name}_index + 1`;     
		    }

		    if( this.interp === 'linear' ) {      
		    functionBody += `      ${this.name}_frac  = ${this.name}_phase - ${this.name}_index,
      ${this.name}_base  = memory[ ${this.name}_dataIdx +  ${this.name}_index ],
      ${this.name}_next  = ${next},`;
		      
		      if( this.boundmode === 'ignore' ) {
		        functionBody += `
      ${this.name}_out   = ${this.name}_index >= ${this.data.buffer.length - 1} || ${this.name}_index < 0 ? 0 : ${this.name}_base + ${this.name}_frac * ( memory[ ${this.name}_dataIdx + ${this.name}_next ] - ${this.name}_base )\n\n`;
		      }else {
		        functionBody += `
      ${this.name}_out   = ${this.name}_base + ${this.name}_frac * ( memory[ ${this.name}_dataIdx + ${this.name}_next ] - ${this.name}_base )\n\n`;
		      }
		    }else {
		      functionBody += `      ${this.name}_out = memory[ ${this.name}_dataIdx + ${this.name}_index ]\n\n`;
		    }

		    } else { // mode is simple
		      functionBody = `memory[ ${idx} + ${ inputs[0] } ]`;
		      
		      return functionBody
		    }

		    gen.memo[ this.name ] = this.name + '_out';

		    return [ this.name+'_out', functionBody ]
		  },

		  defaults : { channels:1, mode:'phase', interp:'linear', boundmode:'wrap' }
		};

		peek = ( input_data, index=0, properties ) => {
		  let ugen = Object.create( proto );

		  //console.log( dataUgen, gen.data )

		  // XXX why is dataUgen not the actual function? some type of browserify nonsense...
		  const finalData = typeof input_data.basename === 'undefined' ? gen.lib.data( input_data ) : input_data;

		  Object.assign( ugen, 
		    { 
		      'data':     finalData,
		      dataName:   finalData.name,
		      uid:        gen.getUID(),
		      inputs:     [ index, finalData ],
		    },
		    proto.defaults,
		    properties 
		  );
		  
		  ugen.name = ugen.basename + ugen.uid;

		  return ugen
		};
		return peek;
	}

	var floor;
	var hasRequiredFloor;

	function requireFloor () {
		if (hasRequiredFloor) return floor;
		hasRequiredFloor = 1;

		let gen  = requireGen();

		let proto = {
		  name:'floor',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    if( isNaN( inputs[0] ) ) {
		      //gen.closures.add({ [ this.name ]: Math.floor })

		      out = `( ${inputs[0]} | 0 )`;

		    } else {
		      out = inputs[0] | 0;
		    }
		    
		    return out
		  }
		};

		floor = x => {
		  let floor = Object.create( proto );

		  floor.inputs = [ x ];

		  return floor
		};
		return floor;
	}

	var memo;
	var hasRequiredMemo;

	function requireMemo () {
		if (hasRequiredMemo) return memo;
		hasRequiredMemo = 1;

		let gen = requireGen();

		let proto = {
		  basename:'memo',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );
		    
		    out = `  var ${this.name} = ${inputs[0]}\n`;

		    gen.memo[ this.name ] = this.name;

		    return [ this.name, out ]
		  } 
		};

		memo = (in1,memoName) => {
		  let memo = Object.create( proto );
		  
		  memo.inputs = [ in1 ];
		  memo.id   = gen.getUID();
		  memo.name = memoName !== undefined ? memoName + '_' + gen.getUID() : `${memo.basename}${memo.id}`;

		  return memo
		};
		return memo;
	}

	var wrap;
	var hasRequiredWrap;

	function requireWrap () {
		if (hasRequiredWrap) return wrap;
		hasRequiredWrap = 1;

		let gen  = requireGen();
		    requireFloor();
		    requireSub();
		    requireMemo();

		let proto = {
		  basename:'wrap',

		  gen() {
		    let inputs = gen.getInputs( this );
		        inputs[0]; let min = inputs[1], max = inputs[2],
		        out, diff;

		    //out = `(((${inputs[0]} - ${this.min}) % ${diff}  + ${diff}) % ${diff} + ${this.min})`
		    //const long numWraps = long((v-lo)/range) - (v < lo);
		    //return v - range * double(numWraps);   
		    
		    if( this.min === 0 ) {
		      diff = max;
		    }else if ( isNaN( max ) || isNaN( min ) ) {
		      diff = `${max} - ${min}`;
		    }else {
		      diff = max - min;
		    }

		    out =
		` var ${this.name} = ${inputs[0]}
  if( ${this.name} < ${this.min} ) ${this.name} += ${diff}
  else if( ${this.name} > ${this.max} ) ${this.name} -= ${diff}

`;

		    return [ this.name, ' ' + out ]
		  },
		};

		wrap = ( in1, min=0, max=1 ) => {
		  let ugen = Object.create( proto );

		  Object.assign( ugen, { 
		    min, 
		    max,
		    uid:    gen.getUID(),
		    inputs: [ in1, min, max ],
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return wrap;
	}

	var poke;
	var hasRequiredPoke;

	function requirePoke () {
		if (hasRequiredPoke) return poke;
		hasRequiredPoke = 1;

		let gen  = requireGen();
		    requireMul();
		    requireWrap();

		let proto = {
		  basename:'poke',

		  gen() {
		    let dataName = 'memory',
		        inputs = gen.getInputs( this ),
		        idx;
		    
		    idx = this.data.gen();

		    //gen.requestMemory( this.memory )
		    //wrapped = wrap( this.inputs[1], 0, this.dataLength ).gen()
		    //idx = wrapped[0]
		    //gen.functionBody += wrapped[1]
		    let outputStr = this.inputs[1] === 0 ?
		      `  ${dataName}[ ${idx} ] = ${inputs[0]}\n` :
		      `  ${dataName}[ ${idx} + ${inputs[1]} ] = ${inputs[0]}\n`;

		    if( this.inline === undefined ) {
		      gen.functionBody += outputStr;
		    }else {
		      return [ this.inline, outputStr ]
		    }
		  }
		};
		poke = ( data, value, index, properties ) => {
		  let ugen = Object.create( proto ),
		      defaults = { channels:1 }; 

		  if( properties !== undefined ) Object.assign( defaults, properties );

		  Object.assign( ugen, { 
		    data,
		    dataName:   data.name,
		    dataLength: data.buffer.length,
		    uid:        gen.getUID(),
		    inputs:     [ value, index ],
		  },
		  defaults );


		  ugen.name = ugen.basename + ugen.uid;
		  
		  gen.histories.set( ugen.name, ugen );

		  return ugen
		};
		return poke;
	}

	var data;
	var hasRequiredData;

	function requireData () {
		if (hasRequiredData) return data;
		hasRequiredData = 1;

		const gen  = requireGen(),
		      utilities = requireUtilities(),
		      peek = requirePeek(),
		      poke = requirePoke();

		const proto = {
		  basename:'data',
		  globals: {},
		  memo:{},

		  gen() {
		    let idx;
		    //console.log( 'data name:', this.name, proto.memo )
		    //debugger
		    if( gen.memo[ this.name ] === undefined ) {
		      gen.requestMemory( this.memory, this.immutable ); 
		      idx = this.memory.values.idx;
		      if( this.buffer !== undefined ) {
		        try {
		          gen.memory.heap.set( this.buffer, idx );
		        }catch( e ) {
		          console.log( e );
		          throw Error( 'error with request. asking for ' + this.buffer.length +'. current index: ' + gen.memoryIndex + ' of ' + gen.memory.heap.length )
		        }
		      }
		      //gen.data[ this.name ] = this
		      //return 'gen.memory' + this.name + '.buffer'
		      if( this.name.indexOf('data') === -1 ) {
		        proto.memo[ this.name ] = idx;
		      }else {
		        gen.memo[ this.name ] = idx;
		      }
		    }else {
		      //console.log( 'using gen data memo', proto.memo[ this.name ] )
		      idx = gen.memo[ this.name ];
		    }
		    return idx
		  },
		};

		data = ( x, y=1, properties ) => {
		  let ugen, buffer, shouldLoad = false;
		  
		  if( properties !== undefined && properties.global !== undefined ) {
		    if( gen.globals[ properties.global ] ) {
		      return gen.globals[ properties.global ]
		    }
		  }

		  if( typeof x === 'number' ) {
		    if( y !== 1 ) {
		      buffer = [];
		      for( let i = 0; i < y; i++ ) {
		        buffer[ i ] = new Float32Array( x );
		      }
		    }else {
		      buffer = new Float32Array( x );
		    }
		  }else if( Array.isArray( x ) ) { //! (x instanceof Float32Array ) ) {
		    let size = x.length;
		    buffer = new Float32Array( size );
		    for( let i = 0; i < x.length; i++ ) {
		      buffer[ i ] = x[ i ];
		    }
		  }else if( typeof x === 'string' ) {
		    //buffer = { length: y > 1 ? y : gen.samplerate * 60 } // XXX what???
		    //if( proto.memo[ x ] === undefined ) {
		      buffer = { length: y > 1 ? y : 1 }; // XXX what???
		      shouldLoad = true;
		    //}else{
		      //buffer = proto.memo[ x ]
		    //}
		  }else if( x instanceof Float32Array ) {
		    buffer = x;
		  }else if( x instanceof Uint8Array ) {
		    buffer = x;
		  }else if( x instanceof AudioBuffer ) {
		    buffer = x.getChannelData(0);
		  }
		  
		  ugen = Object.create( proto ); 

		  Object.assign( ugen, 
		  { 
		    buffer,
		    name: proto.basename + gen.getUID(),
		    dim:  buffer !== undefined ? buffer.length : 1, // XXX how do we dynamically allocate this?
		    channels : 1,
		    onload: properties !== undefined ? properties.onload || null : null,
		    //then( fnc ) {
		    //  ugen.onload = fnc
		    //  return ugen
		    //},
		    immutable: properties !== undefined && properties.immutable === true ? true : false,
		    load( filename, __resolve ) {
		      let promise = utilities.loadSample( filename, ugen );
		      promise.then( _buffer => { 
		        proto.memo[ x ] = _buffer;
		        ugen.name = filename;
		        ugen.memory.values.length = ugen.dim = _buffer.length;

		        gen.requestMemory( ugen.memory, ugen.immutable ); 
		        gen.memory.heap.set( _buffer, ugen.memory.values.idx );
		        if( typeof ugen.onload === 'function' ) ugen.onload( _buffer ); 
		        __resolve( ugen );
		      });
		    },
		    memory : {
		      values: { length:buffer !== undefined ? buffer.length : 1, idx:null }
		    }
		  },
		  properties
		  );

		  
		  if( properties !== undefined ) {
		    if( properties.global !== undefined ) {
		      gen.globals[ properties.global ] = ugen;
		    }
		    if( properties.meta === true ) {
		      for( let i = 0, length = ugen.buffer.length; i < length; i++ ) {
		        Object.defineProperty( ugen, i, {
		          get () {
		            return peek( ugen, i, { mode:'simple', interp:'none' } )
		          },
		          set( v ) {
		            return poke( ugen, v, i )
		          }
		        });
		      }
		    }
		  }

		  let returnValue;
		  if( shouldLoad === true ) {
		    returnValue = new Promise( (resolve,reject) => {
		      //ugen.load( x, resolve )
		      let promise = utilities.loadSample( x, ugen );
		      promise.then( _buffer => { 
		        proto.memo[ x ] = _buffer;
		        ugen.memory.values.length = ugen.dim = _buffer.length;

		        ugen.buffer = _buffer;
		        //gen.once( 'memory init', ()=> {
		        //  console.log( "CALLED", ugen.memory )
		        //  gen.requestMemory( ugen.memory, ugen.immutable ) 
		        //  gen.memory.heap.set( _buffer, ugen.memory.values.idx )
		        //  if( typeof ugen.onload === 'function' ) ugen.onload( _buffer ) 
		        //})
		        
		        resolve( ugen );
		      });     
		    });
		  }else if( proto.memo[ x ] !== undefined ) {

		    gen.once( 'memory init', ()=> {
		      gen.requestMemory( ugen.memory, ugen.immutable ); 
		      gen.memory.heap.set( ugen.buffer, ugen.memory.values.idx );
		      if( typeof ugen.onload === 'function' ) ugen.onload( ugen.buffer ); 
		    });

		    returnValue = ugen;
		  }else {
		    returnValue = ugen;
		  }

		  return returnValue 
		};
		return data;
	}

	var peekDyn;
	var hasRequiredPeekDyn;

	function requirePeekDyn () {
		if (hasRequiredPeekDyn) return peekDyn;
		hasRequiredPeekDyn = 1;
		const gen  = requireGen();
		      requireData();

		const proto = {
		  basename:'peek',

		  gen() {
		    'gen.' + this.name;
		        let inputs = gen.getInputs( this ),
		        functionBody, next, indexer, dataStart, length;
		    
		    // data object codegens to its starting index
		    dataStart = inputs[0];
		    length    = inputs[1];
		    indexer   = inputs[2];

		    //lengthIsLog2 = (Math.log2( length ) | 0)  === Math.log2( length )

		    if( this.mode !== 'simple' ) {

		      functionBody = `  var ${this.name}_dataIdx  = ${dataStart}, 
        ${this.name}_phase = ${this.mode === 'samples' ? indexer : indexer + ' * ' + (length) }, 
        ${this.name}_index = ${this.name}_phase | 0,\n`;

		      if( this.boundmode === 'wrap' ) {
		        next =`${this.name}_index + 1 >= ${length} ? ${this.name}_index + 1 - ${length} : ${this.name}_index + 1`;
		      }else if( this.boundmode === 'clamp' ) {
		        next = 
		          `${this.name}_index + 1 >= ${length} -1 ? ${length} - 1 : ${this.name}_index + 1`;
		      } else if( this.boundmode === 'fold' || this.boundmode === 'mirror' ) {
		        next = 
		          `${this.name}_index + 1 >= ${length} - 1 ? ${this.name}_index - ${length} - 1 : ${this.name}_index + 1`;
		      }else {
		         next = 
		        `${this.name}_index + 1`;     
		      }

		      if( this.interp === 'linear' ) {      
		        functionBody += `      ${this.name}_frac  = ${this.name}_phase - ${this.name}_index,
        ${this.name}_base  = memory[ ${this.name}_dataIdx +  ${this.name}_index ],
        ${this.name}_next  = ${next},`;
		        
		        if( this.boundmode === 'ignore' ) {
		          functionBody += `
        ${this.name}_out   = ${this.name}_index >= ${length} - 1 || ${this.name}_index < 0 ? 0 : ${this.name}_base + ${this.name}_frac * ( memory[ ${this.name}_dataIdx + ${this.name}_next ] - ${this.name}_base )\n\n`;
		        }else {
		          functionBody += `
        ${this.name}_out   = ${this.name}_base + ${this.name}_frac * ( memory[ ${this.name}_dataIdx + ${this.name}_next ] - ${this.name}_base )\n\n`;
		        }
		      }else {
		        functionBody += `      ${this.name}_out = memory[ ${this.name}_dataIdx + ${this.name}_index ]\n\n`;
		      }

		    } else { // mode is simple
		      functionBody = `memory[ ${dataStart} + ${ indexer } ]`;
		      
		      return functionBody
		    }

		    gen.memo[ this.name ] = this.name + '_out';

		    return [ this.name+'_out', functionBody ]
		  },

		  defaults : { channels:1, mode:'phase', interp:'linear', boundmode:'wrap' }
		};

		peekDyn = ( input_data, length, index=0, properties ) => {
		  const ugen = Object.create( proto );

		  // XXX why is dataUgen not the actual function? some type of browserify nonsense...
		  const finalData = typeof input_data.basename === 'undefined' ? gen.lib.data( input_data ) : input_data;

		  Object.assign( ugen, 
		    { 
		      'data':     finalData,
		      dataName:   finalData.name,
		      uid:        gen.getUID(),
		      inputs:     [ input_data, length, index, finalData ],
		    },
		    proto.defaults,
		    properties 
		  );
		  
		  ugen.name = ugen.basename + ugen.uid;

		  return ugen
		};
		return peekDyn;
	}

	var cycle;
	var hasRequiredCycle;

	function requireCycle () {
		if (hasRequiredCycle) return cycle;
		hasRequiredCycle = 1;

		let gen  = requireGen();
		    requirePhasor();
		    let data = requireData(),
		    peek = requirePeek();
		    requireMul();
		    let phasor=requirePhasor();

		let proto = {
		  basename:'cycle',

		  initTable() {    
		    let buffer = new Float32Array( 1024 );

		    for( let i = 0, l = buffer.length; i < l; i++ ) {
		      buffer[ i ] = Math.sin( ( i / l ) * ( Math.PI * 2 ) );
		    }

		    gen.globals.cycle = data( buffer, 1, { immutable:true } );
		  }

		};

		cycle = ( frequency=1, reset=0, _props ) => {
		  if( typeof gen.globals.cycle === 'undefined' ) proto.initTable(); 
		  const props = Object.assign({}, { min:0 }, _props );

		  const ugen = peek( gen.globals.cycle, phasor( frequency, reset, props ));
		  ugen.name = 'cycle' + gen.getUID();

		  return ugen
		};
		return cycle;
	}

	var cycleN;
	var hasRequiredCycleN;

	function requireCycleN () {
		if (hasRequiredCycleN) return cycleN;
		hasRequiredCycleN = 1;

		const gen  = requireGen();
		      requirePhasor();
		      const data = requireData(),
		      peek = requirePeek(),
		      mul  = requireMul(),
		      add  = requireAdd(),
		      phasor=requirePhasor();

		const proto = {
		  basename:'cycleN',

		  initTable() {    
		    let buffer = new Float32Array( 1024 );

		    for( let i = 0, l = buffer.length; i < l; i++ ) {
		      buffer[ i ] = Math.sin( ( i / l ) * ( Math.PI * 2 ) );
		    }

		    gen.globals.cycle = data( buffer, 1, { immutable:true } );
		  }

		};

		cycleN = ( frequency=1, reset=0, _props ) => {
		  if( typeof gen.globals.cycle === 'undefined' ) proto.initTable(); 
		  const props = Object.assign({}, { min:0 }, _props );

		  const ugen = mul( add( 1, peek( gen.globals.cycle, phasor( frequency, reset, props )) ), .5 );
		  ugen.name = 'cycle' + gen.getUID();

		  return ugen
		};
		return cycleN;
	}

	var history;
	var hasRequiredHistory;

	function requireHistory () {
		if (hasRequiredHistory) return history;
		hasRequiredHistory = 1;

		let gen  = requireGen();

		history = ( in1=0 ) => {
		  let ugen = {
		    inputs: [ in1 ],
		    memory: { value: { length:1, idx: null } },
		    recorder: null,

		    in( v ) {
		      if( gen.histories.has( v ) ){
		        let memoHistory = gen.histories.get( v );
		        ugen.name = memoHistory.name;
		        return memoHistory
		      }

		      let obj = {
		        gen() {
		          let inputs = gen.getInputs( ugen );

		          if( ugen.memory.value.idx === null ) {
		            gen.requestMemory( ugen.memory );
		            gen.memory.heap[ ugen.memory.value.idx ] = in1;
		          }

		          let idx = ugen.memory.value.idx;
		          
		          gen.addToEndBlock( 'memory[ ' + idx + ' ] = ' + inputs[ 0 ] );
		          
		          // return ugen that is being recorded instead of ssd.
		          // this effectively makes a call to ssd.record() transparent to the graph.
		          // recording is triggered by prior call to gen.addToEndBlock.
		          gen.histories.set( v, obj );

		          return inputs[ 0 ]
		        },
		        name: ugen.name + '_in'+gen.getUID(),
		        memory: ugen.memory
		      };

		      this.inputs[ 0 ] = v;
		      
		      ugen.recorder = obj;

		      return obj
		    },
		    
		    out: {
		            
		      gen() {
		        if( ugen.memory.value.idx === null ) {
		          if( gen.histories.get( ugen.inputs[0] ) === undefined ) {
		            gen.histories.set( ugen.inputs[0], ugen.recorder );
		          }
		          gen.requestMemory( ugen.memory );
		          gen.memory.heap[ ugen.memory.value.idx ] = parseFloat( in1 );
		        }
		        let idx = ugen.memory.value.idx;
		         
		        return 'memory[ ' + idx + ' ] '
		      },
		    },

		    uid: gen.getUID(),
		  };
		  
		  ugen.out.memory = ugen.memory; 

		  ugen.name = 'history' + ugen.uid;
		  ugen.out.name = ugen.name + '_out';
		  ugen.in._name  = ugen.name = '_in';

		  Object.defineProperty( ugen, 'value', {
		    get() {
		      if( this.memory.value.idx !== null ) {
		        return gen.memory.heap[ this.memory.value.idx ]
		      }
		    },
		    set( v ) {
		      if( this.memory.value.idx !== null ) {
		        gen.memory.heap[ this.memory.value.idx ] = v; 
		      }
		    }
		  });

		  return ugen
		};
		return history;
	}

	var delta;
	var hasRequiredDelta;

	function requireDelta () {
		if (hasRequiredDelta) return delta;
		hasRequiredDelta = 1;

		let gen     = requireGen(),
		    history = requireHistory(),
		    sub     = requireSub();

		delta = ( in1 ) => {
		  let n1 = history();
		    
		  n1.in( in1 );

		  let ugen = sub( in1, n1.out );
		  ugen.name = 'delta'+gen.getUID();

		  return ugen
		};
		return delta;
	}

	var ceil;
	var hasRequiredCeil;

	function requireCeil () {
		if (hasRequiredCeil) return ceil;
		hasRequiredCeil = 1;

		let gen  = requireGen();

		let proto = {
		  name:'ceil',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    
		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet ? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.ceil' : Math.ceil });

		      out = `${ref}ceil( ${inputs[0]} )`;

		    } else {
		      out = Math.ceil( parseFloat( inputs[0] ) );
		    }
		    
		    return out
		  }
		};

		ceil = x => {
		  let ceil = Object.create( proto );

		  ceil.inputs = [ x ];

		  return ceil
		};
		return ceil;
	}

	var min;
	var hasRequiredMin;

	function requireMin () {
		if (hasRequiredMin) return min;
		hasRequiredMin = 1;

		let gen  = requireGen();

		let proto = {
		  name:'min',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    
		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet? '' : 'gen.';

		    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
		      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.min' : Math.min });

		      out = `${ref}min( ${inputs[0]}, ${inputs[1]} )`;

		    } else {
		      out = Math.min( parseFloat( inputs[0] ), parseFloat( inputs[1] ) );
		    }
		    
		    return out
		  }
		};

		min = (x,y) => {
		  let min = Object.create( proto );

		  min.inputs = [ x,y ];

		  return min
		};
		return min;
	}

	var max;
	var hasRequiredMax;

	function requireMax () {
		if (hasRequiredMax) return max;
		hasRequiredMax = 1;

		let gen  = requireGen();

		let proto = {
		  name:'max',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    
		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet? '' : 'gen.';

		    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
		      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.max' : Math.max });

		      out = `${ref}max( ${inputs[0]}, ${inputs[1]} )`;

		    } else {
		      out = Math.max( parseFloat( inputs[0] ), parseFloat( inputs[1] ) );
		    }
		    
		    return out
		  }
		};

		max = (x,y) => {
		  let max = Object.create( proto );

		  max.inputs = [ x,y ];

		  return max
		};
		return max;
	}

	var sign;
	var hasRequiredSign;

	function requireSign () {
		if (hasRequiredSign) return sign;
		hasRequiredSign = 1;

		let gen  = requireGen();

		let proto = {
		  name:'sign',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    
		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.sign' : Math.sign });

		      out = `${ref}sign( ${inputs[0]} )`;

		    } else {
		      out = Math.sign( parseFloat( inputs[0] ) );
		    }
		    
		    return out
		  }
		};

		sign = x => {
		  let sign = Object.create( proto );

		  sign.inputs = [ x ];

		  return sign
		};
		return sign;
	}

	var dcblock;
	var hasRequiredDcblock;

	function requireDcblock () {
		if (hasRequiredDcblock) return dcblock;
		hasRequiredDcblock = 1;

		requireGen();
		    let history = requireHistory(),
		    sub     = requireSub(),
		    add     = requireAdd(),
		    mul     = requireMul(),
		    memo    = requireMemo();

		dcblock = ( in1 ) => {
		  let x1 = history(),
		      y1 = history(),
		      filter;

		  //History x1, y1; y = in1 - x1 + y1*0.9997; x1 = in1; y1 = y; out1 = y;
		  filter = memo( add( sub( in1, x1.out ), mul( y1.out, .9997 ) ) );
		  x1.in( in1 );
		  y1.in( filter );

		  return filter
		};
		return dcblock;
	}

	var rate;
	var hasRequiredRate;

	function requireRate () {
		if (hasRequiredRate) return rate;
		hasRequiredRate = 1;

		let gen     = requireGen(),
		    history = requireHistory();
		    requireSub();
		    requireAdd();
		    requireMul();
		    requireMemo();
		    requireDelta();
		    requireWrap();

		let proto = {
		  basename:'rate',

		  gen() {
		    let inputs = gen.getInputs( this );
		        history();
		        history();
		        let genName = 'gen.' + this.name,
		        out;

		    gen.closures.add({ [ this.name ]: this }); 

		    out = 
		` var ${this.name}_diff = ${inputs[0]} - ${genName}.lastSample
  if( ${this.name}_diff < -.5 ) ${this.name}_diff += 1
  ${genName}.phase += ${this.name}_diff * ${inputs[1]}
  if( ${genName}.phase > 1 ) ${genName}.phase -= 1
  ${genName}.lastSample = ${inputs[0]}
`;
		    out = ' ' + out;

		    return [ genName + '.phase', out ]
		  }
		};

		rate = ( in1, rate ) => {
		  let ugen = Object.create( proto );

		  Object.assign( ugen, { 
		    phase:      0,
		    lastSample: 0,
		    uid:        gen.getUID(),
		    inputs:     [ in1, rate ],
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return rate;
	}

	var mix;
	var hasRequiredMix;

	function requireMix () {
		if (hasRequiredMix) return mix;
		hasRequiredMix = 1;

		let gen = requireGen(),
		    add = requireAdd(),
		    mul = requireMul(),
		    sub = requireSub(),
		    memo= requireMemo();

		mix = ( in1, in2, t=.5 ) => {
		  let ugen = memo( add( mul(in1, sub(1,t ) ), mul( in2, t ) ) );
		  ugen.name = 'mix' + gen.getUID();

		  return ugen
		};
		return mix;
	}

	var clamp;
	var hasRequiredClamp;

	function requireClamp () {
		if (hasRequiredClamp) return clamp;
		hasRequiredClamp = 1;

		let gen  = requireGen();
		    requireFloor();
		    requireSub();
		    requireMemo();

		let proto = {
		  basename:'clip',

		  gen() {
		    let inputs = gen.getInputs( this ),
		        out;

		    out =

		` var ${this.name} = ${inputs[0]}
  if( ${this.name} > ${inputs[2]} ) ${this.name} = ${inputs[2]}
  else if( ${this.name} < ${inputs[1]} ) ${this.name} = ${inputs[1]}
`;
		    out = ' ' + out;
		    
		    gen.memo[ this.name ] = this.name;

		    return [ this.name, out ]
		  },
		};

		clamp = ( in1, min=-1, max=1 ) => {
		  let ugen = Object.create( proto );

		  Object.assign( ugen, { 
		    min, 
		    max,
		    uid:    gen.getUID(),
		    inputs: [ in1, min, max ],
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return clamp;
	}

	var delay;
	var hasRequiredDelay;

	function requireDelay () {
		if (hasRequiredDelay) return delay;
		hasRequiredDelay = 1;

		const gen  = requireGen(),
		      data = requireData(),
		      poke = requirePoke(),
		      peek = requirePeek(),
		      sub  = requireSub(),
		      wrap = requireWrap(),
		      accum= requireAccum();
		      requireMemo();

		const proto = {
		  basename:'delay',

		  gen() {
		    let inputs = gen.getInputs( this );
		    
		    gen.memo[ this.name ] = inputs[0];
		    
		    return inputs[0]
		  },
		};

		const defaults = { size: 512, interp:'none' };

		delay = ( in1, taps, properties ) => {
		  const ugen = Object.create( proto );
		  let writeIdx, delaydata;

		  if( Array.isArray( taps ) === false ) taps = [ taps ];
		  
		  const props = Object.assign( {}, defaults, properties );

		  const maxTapSize = Math.max( ...taps );
		  if( props.size < maxTapSize ) props.size = maxTapSize;

		  delaydata = data( props.size );
		  
		  ugen.inputs = [];

		  writeIdx = accum( 1, 0, { max:props.size, min:0 });
		  
		  for( let i = 0; i < taps.length; i++ ) {
		    ugen.inputs[ i ] = peek( delaydata, wrap( sub( writeIdx, taps[i] ), 0, props.size ),{ mode:'samples', interp:props.interp });
		  }
		  
		  ugen.outputs = ugen.inputs; // XXX ugh, Ugh, UGH! but i guess it works.

		  poke( delaydata, in1, writeIdx );

		  ugen.name = `${ugen.basename}${gen.getUID()}`;

		  return ugen
		};
		return delay;
	}

	var fold;
	var hasRequiredFold;

	function requireFold () {
		if (hasRequiredFold) return fold;
		hasRequiredFold = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'fold',

		  gen() {
		    let inputs = gen.getInputs( this ),
		        out;

		    out = this.createCallback( inputs[0], this.min, this.max ); 

		    gen.memo[ this.name ] = this.name + '_value';

		    return [ this.name + '_value', out ]
		  },

		  createCallback( v, lo, hi ) {
		    let out =
		` var ${this.name}_value = ${v},
      ${this.name}_range = ${hi} - ${lo},
      ${this.name}_numWraps = 0

  if(${this.name}_value >= ${hi}){
    ${this.name}_value -= ${this.name}_range
    if(${this.name}_value >= ${hi}){
      ${this.name}_numWraps = ((${this.name}_value - ${lo}) / ${this.name}_range) | 0
      ${this.name}_value -= ${this.name}_range * ${this.name}_numWraps
    }
    ${this.name}_numWraps++
  } else if(${this.name}_value < ${lo}){
    ${this.name}_value += ${this.name}_range
    if(${this.name}_value < ${lo}){
      ${this.name}_numWraps = ((${this.name}_value - ${lo}) / ${this.name}_range- 1) | 0
      ${this.name}_value -= ${this.name}_range * ${this.name}_numWraps
    }
    ${this.name}_numWraps--
  }
  if(${this.name}_numWraps & 1) ${this.name}_value = ${hi} + ${lo} - ${this.name}_value
`;
		    return ' ' + out
		  }
		};

		fold = ( in1, min=0, max=1 ) => {
		  let ugen = Object.create( proto );

		  Object.assign( ugen, { 
		    min, 
		    max,
		    uid:    gen.getUID(),
		    inputs: [ in1 ],
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return fold;
	}

	var mod;
	var hasRequiredMod;

	function requireMod () {
		if (hasRequiredMod) return mod;
		hasRequiredMod = 1;

		let gen = requireGen();

		mod = (...args) => {
		  let mod = {
		    id:     gen.getUID(),
		    inputs: args,

		    gen() {
		      let inputs = gen.getInputs( this ),
		          out='(',
		          lastNumber = inputs[ 0 ],
		          lastNumberIsUgen = isNaN( lastNumber ); 

		      inputs.forEach( (v,i) => {
		        if( i === 0 ) return

		        let isNumberUgen = isNaN( v ),
		            isFinalIdx   = i === inputs.length - 1;

		        if( !lastNumberIsUgen && !isNumberUgen ) {
		          lastNumber = lastNumber % v;
		          out += lastNumber;
		        }else {
		          out += `${lastNumber} % ${v}`;
		        }

		        if( !isFinalIdx ) out += ' % '; 
		      });

		      out += ')';

		      return out
		    }
		  };
		  
		  return mod
		};
		return mod;
	}

	var sah;
	var hasRequiredSah;

	function requireSah () {
		if (hasRequiredSah) return sah;
		hasRequiredSah = 1;

		let gen     = requireGen();

		let proto = {
		  basename:'sah',

		  gen() {
		    let inputs = gen.getInputs( this ), out;

		    //gen.data[ this.name ] = 0
		    //gen.data[ this.name + '_control' ] = 0

		    gen.requestMemory( this.memory );


		    out = 
		` var ${this.name}_control = memory[${this.memory.control.idx}],
      ${this.name}_trigger = ${inputs[1]} > ${inputs[2]} ? 1 : 0

  if( ${this.name}_trigger !== ${this.name}_control  ) {
    if( ${this.name}_trigger === 1 ) 
      memory[${this.memory.value.idx}] = ${inputs[0]}
    
    memory[${this.memory.control.idx}] = ${this.name}_trigger
  }
`;
		    
		    gen.memo[ this.name ] = `memory[${this.memory.value.idx}]`;//`gen.data.${this.name}`

		    return [ `memory[${this.memory.value.idx}]`, ' ' +out ]
		  }
		};

		sah = ( in1, control, threshold=0, properties ) => {
		  let ugen = Object.create( proto ),
		      defaults = { init:0 };

		  if( properties !== undefined ) Object.assign( defaults, properties );

		  Object.assign( ugen, { 
		    lastSample: 0,
		    uid:        gen.getUID(),
		    inputs:     [ in1, control,threshold ],
		    memory: {
		      control: { idx:null, length:1 },
		      value:   { idx:null, length:1 },
		    }
		  },
		  defaults );
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return sah;
	}

	var noise;
	var hasRequiredNoise;

	function requireNoise () {
		if (hasRequiredNoise) return noise;
		hasRequiredNoise = 1;

		let gen  = requireGen();

		let proto = {
		  name:'noise',

		  gen() {
		    let out;

		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet? '' : 'gen.';

		    gen.closures.add({ 'noise' : isWorklet ? 'Math.random' : Math.random });

		    out = `  var ${this.name} = ${ref}noise()\n`;
		    
		    gen.memo[ this.name ] = this.name;

		    return [ this.name, out ]
		  }
		};

		noise = x => {
		  let noise = Object.create( proto );
		  noise.name = proto.name + gen.getUID();

		  return noise
		};
		return noise;
	}

	var not;
	var hasRequiredNot;

	function requireNot () {
		if (hasRequiredNot) return not;
		hasRequiredNot = 1;

		let gen  = requireGen();

		let proto = {
		  name:'not',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    if( isNaN( this.inputs[0] ) ) {
		      out = `( ${inputs[0]} === 0 ? 1 : 0 )`;
		    } else {
		      out = !inputs[0] === 0 ? 1 : 0;
		    }
		    
		    return out
		  }
		};

		not = x => {
		  let not = Object.create( proto );

		  not.inputs = [ x ];

		  return not
		};
		return not;
	}

	var gt;
	var hasRequiredGt;

	function requireGt () {
		if (hasRequiredGt) return gt;
		hasRequiredGt = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'gt',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );
		    
		    out = `  var ${this.name} = `;  

		    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
		      out += `(( ${inputs[0]} > ${inputs[1]}) | 0 )`;
		    } else {
		      out += inputs[0] > inputs[1] ? 1 : 0; 
		    }
		    out += '\n\n';

		    gen.memo[ this.name ] = this.name;

		    return [this.name, out]
		  }
		};

		gt = (x,y) => {
		  let gt = Object.create( proto );

		  gt.inputs = [ x,y ];
		  gt.name = gt.basename + gen.getUID();

		  return gt
		};
		return gt;
	}

	var gte;
	var hasRequiredGte;

	function requireGte () {
		if (hasRequiredGte) return gte;
		hasRequiredGte = 1;

		let gen = requireGen();

		let proto = {
		  name:'gte',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );
		    
		    out = `  var ${this.name} = `;  

		    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
		      out += `( ${inputs[0]} >= ${inputs[1]} | 0 )`;
		    } else {
		      out += inputs[0] >= inputs[1] ? 1 : 0; 
		    }
		    out += '\n\n';

		    gen.memo[ this.name ] = this.name;

		    return [this.name, out]
		  }
		};

		gte = (x,y) => {
		  let gt = Object.create( proto );

		  gt.inputs = [ x,y ];
		  gt.name = 'gte' + gen.getUID();

		  return gt
		};
		return gte;
	}

	var lt;
	var hasRequiredLt;

	function requireLt () {
		if (hasRequiredLt) return lt;
		hasRequiredLt = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'lt',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    out = `  var ${this.name} = `;  

		    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
		      out += `(( ${inputs[0]} < ${inputs[1]}) | 0  )`;
		    } else {
		      out += inputs[0] < inputs[1] ? 1 : 0; 
		    }
		    out += '\n';

		    gen.memo[ this.name ] = this.name;

		    return [this.name, out]
		  }
		};

		lt = (x,y) => {
		  let lt = Object.create( proto );

		  lt.inputs = [ x,y ];
		  lt.name = lt.basename + gen.getUID();

		  return lt
		};
		return lt;
	}

	var lte;
	var hasRequiredLte;

	function requireLte () {
		if (hasRequiredLte) return lte;
		hasRequiredLte = 1;

		let gen  = requireGen();

		let proto = {
		  name:'lte',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    out = `  var ${this.name} = `;  

		    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
		      out += `( ${inputs[0]} <= ${inputs[1]} | 0  )`;
		    } else {
		      out += inputs[0] <= inputs[1] ? 1 : 0; 
		    }
		    out += '\n';

		    gen.memo[ this.name ] = this.name;

		    return [this.name, out]
		  }
		};

		lte = (x,y) => {
		  let lt = Object.create( proto );

		  lt.inputs = [ x,y ];
		  lt.name = 'lte' + gen.getUID();

		  return lt
		};
		return lte;
	}

	var bool;
	var hasRequiredBool;

	function requireBool () {
		if (hasRequiredBool) return bool;
		hasRequiredBool = 1;

		let gen = requireGen();

		let proto = {
		  basename:'bool',

		  gen() {
		    let inputs = gen.getInputs( this ), out;

		    out = `${inputs[0]} === 0 ? 0 : 1`;
		    
		    //gen.memo[ this.name ] = `gen.data.${this.name}`

		    //return [ `gen.data.${this.name}`, ' ' +out ]
		    return out
		  }
		};

		bool = ( in1 ) => {
		  let ugen = Object.create( proto );

		  Object.assign( ugen, { 
		    uid:        gen.getUID(),
		    inputs:     [ in1 ],
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return bool;
	}

	var gate;
	var hasRequiredGate;

	function requireGate () {
		if (hasRequiredGate) return gate;
		hasRequiredGate = 1;

		let gen = requireGen();

		let proto = {
		  basename:'gate',
		  controlString:null, // insert into output codegen for determining indexing
		  gen() {
		    let inputs = gen.getInputs( this ), out;
		    
		    gen.requestMemory( this.memory );
		    
		    let lastInputMemoryIdx = 'memory[ ' + this.memory.lastInput.idx + ' ]',
		        outputMemoryStartIdx = this.memory.lastInput.idx + 1,
		        inputSignal = inputs[0],
		        controlSignal = inputs[1];
		    
		    /* 
		     * we check to see if the current control inputs equals our last input
		     * if so, we store the signal input in the memory associated with the currently
		     * selected index. If not, we put 0 in the memory associated with the last selected index,
		     * change the selected index, and then store the signal in put in the memery assoicated
		     * with the newly selected index
		     */
		    
		    out =

		` if( ${controlSignal} !== ${lastInputMemoryIdx} ) {
    memory[ ${lastInputMemoryIdx} + ${outputMemoryStartIdx}  ] = 0 
    ${lastInputMemoryIdx} = ${controlSignal}
  }
  memory[ ${outputMemoryStartIdx} + ${controlSignal} ] = ${inputSignal}

`;
		    this.controlString = inputs[1];
		    this.initialized = true;

		    gen.memo[ this.name ] = this.name;

		    this.outputs.forEach( v => v.gen() );

		    return [ null, ' ' + out ]
		  },

		  childgen() {
		    if( this.parent.initialized === false ) {
		      gen.getInputs( this ); // parent gate is only input of a gate output, should only be gen'd once.
		    }

		    if( gen.memo[ this.name ] === undefined ) {
		      gen.requestMemory( this.memory );

		      gen.memo[ this.name ] = `memory[ ${this.memory.value.idx} ]`;
		    }
		    
		    return  `memory[ ${this.memory.value.idx} ]`
		  }
		};

		gate = ( control, in1, properties ) => {
		  let ugen = Object.create( proto ),
		      defaults = { count: 2 };

		  if( typeof properties !== undefined ) Object.assign( defaults, properties );

		  Object.assign( ugen, {
		    outputs: [],
		    uid:     gen.getUID(),
		    inputs:  [ in1, control ],
		    memory: {
		      lastInput: { length:1, idx:null }
		    },
		    initialized:false
		  },
		  defaults );
		  
		  ugen.name = `${ugen.basename}${gen.getUID()}`;

		  for( let i = 0; i < ugen.count; i++ ) {
		    ugen.outputs.push({
		      index:i,
		      gen: proto.childgen,
		      parent:ugen,
		      inputs: [ ugen ],
		      memory: {
		        value: { length:1, idx:null }
		      },
		      initialized:false,
		      name: `${ugen.name}_out${gen.getUID()}`
		    });
		  }

		  return ugen
		};
		return gate;
	}

	var train;
	var hasRequiredTrain;

	function requireTrain () {
		if (hasRequiredTrain) return train;
		hasRequiredTrain = 1;

		let gen     = requireGen(),
		    lt      = requireLt(),
		    accum   = requireAccum(),
		    div     = requireDiv();

		train = ( frequency=440, pulsewidth=.5 ) => {
		  let graph = lt( accum( div( frequency, 44100 ) ), pulsewidth );

		  graph.name = `train${gen.getUID()}`;

		  return graph
		};
		return train;
	}

	var _switch;
	var hasRequired_switch;

	function require_switch () {
		if (hasRequired_switch) return _switch;
		hasRequired_switch = 1;

		let gen = requireGen();

		let proto = {
		  basename:'switch',

		  gen() {
		    let inputs = gen.getInputs( this ), out;

		    if( inputs[1] === inputs[2] ) return inputs[1] // if both potential outputs are the same just return one of them
		    
		    out = `  var ${this.name}_out = ${inputs[0]} === 1 ? ${inputs[1]} : ${inputs[2]}\n`;

		    gen.memo[ this.name ] = `${this.name}_out`;

		    return [ `${this.name}_out`, out ]
		  },

		};

		_switch = ( control, in1 = 1, in2 = 0 ) => {
		  let ugen = Object.create( proto );
		  Object.assign( ugen, {
		    uid:     gen.getUID(),
		    inputs:  [ control, in1, in2 ],
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return _switch;
	}

	var slide;
	var hasRequiredSlide;

	function requireSlide () {
		if (hasRequiredSlide) return slide;
		hasRequiredSlide = 1;

		requireGen();
		    let history = requireHistory(),
		    sub     = requireSub(),
		    add     = requireAdd();
		    requireMul();
		    let memo    = requireMemo(),
		    gt      = requireGt(),
		    div     = requireDiv(),
		    _switch = require_switch();

		slide = ( in1, slideUp = 1, slideDown = 1 ) => {
		  let y1 = history(0),
		      filter, slideAmount;

		  //y (n) = y (n-1) + ((x (n) - y (n-1))/slide) 
		  slideAmount = _switch( gt(in1,y1.out), slideUp, slideDown );

		  filter = memo( add( y1.out, div( sub( in1, y1.out ), slideAmount ) ) );

		  y1.in( filter );

		  return filter
		};
		return slide;
	}

	var _in;
	var hasRequired_in;

	function require_in () {
		if (hasRequired_in) return _in;
		hasRequired_in = 1;

		let gen = requireGen();

		let proto = {
		  basename:'in',

		  gen() {
		    const isWorklet = gen.mode === 'worklet';

		    if( isWorklet ) {
		      gen.inputs.add( this );
		    }else {
		      gen.parameters.add( this.name );
		    }

		    gen.memo[ this.name ] = isWorklet === true ? this.name + '[i]' : this.name;

		    return gen.memo[ this.name ]
		  } 
		};

		_in = ( name, inputNumber=0, channelNumber=0, defaultValue=0, min=0, max=1 ) => {
		  let input = Object.create( proto );

		  input.id   = gen.getUID();
		  input.name = name !== undefined ? name : `${input.basename}${input.id}`;
		  Object.assign( input, { defaultValue, min, max, inputNumber, channelNumber });

		  input[0] = {
		    gen() {
		      if( ! gen.parameters.has( input.name ) ) gen.parameters.add( input.name );
		      return input.name + '[0]'
		    }
		  };
		  input[1] = {
		    gen() {
		      if( ! gen.parameters.has( input.name ) ) gen.parameters.add( input.name );
		      return input.name + '[1]'
		    }
		  };


		  return input
		};
		return _in;
	}

	var t60;
	var hasRequiredT60;

	function requireT60 () {
		if (hasRequiredT60) return t60;
		hasRequiredT60 = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'t60',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this ),
		        returnValue;

		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ [ 'exp' ]: isWorklet ? 'Math.exp' : Math.exp });

		      out = `  var ${this.name} = ${ref}exp( -6.907755278921 / ${inputs[0]} )\n\n`;
		     
		      gen.memo[ this.name ] = out;
		      
		      returnValue = [ this.name, out ];
		    } else {
		      out = Math.exp( -6.907755278921 / inputs[0] );

		      returnValue = out;
		    }    

		    return returnValue
		  }
		};

		t60 = x => {
		  let t60 = Object.create( proto );

		  t60.inputs = [ x ];
		  t60.name = proto.basename + gen.getUID();

		  return t60
		};
		return t60;
	}

	var mtof;
	var hasRequiredMtof;

	function requireMtof () {
		if (hasRequiredMtof) return mtof;
		hasRequiredMtof = 1;

		let gen  = requireGen();

		let proto = {
		  name:'mtof',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ [ this.name ]: Math.exp });

		      out = `( ${this.tuning} * gen.exp( .057762265 * (${inputs[0]} - 69) ) )`;

		    } else {
		      out = this.tuning * Math.exp( .057762265 * ( inputs[0] - 69) );
		    }
		    
		    return out
		  }
		};

		mtof = ( x, props ) => {
		  let ugen = Object.create( proto ),
		      defaults = { tuning:440 };
		  
		  if( props !== undefined ) Object.assign( props.defaults );

		  Object.assign( ugen, defaults );
		  ugen.inputs = [ x ];
		  

		  return ugen
		};
		return mtof;
	}

	var ltp;
	var hasRequiredLtp;

	function requireLtp () {
		if (hasRequiredLtp) return ltp;
		hasRequiredLtp = 1;

		let gen  = requireGen();

		let proto = {
		  name:'ltp',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
		      out = `(${inputs[ 0 ]} * (( ${inputs[0]} < ${inputs[1]} ) | 0 ) )`; 
		    } else {
		      out = inputs[0] * (( inputs[0] < inputs[1] ) | 0 );
		    }
		    
		    return out
		  }
		};

		ltp = (x,y) => {
		  let ltp = Object.create( proto );

		  ltp.inputs = [ x,y ];

		  return ltp
		};
		return ltp;
	}

	var gtp;
	var hasRequiredGtp;

	function requireGtp () {
		if (hasRequiredGtp) return gtp;
		hasRequiredGtp = 1;

		let gen  = requireGen();

		let proto = {
		  name:'gtp',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
		      out = `(${inputs[ 0 ]} * ( ( ${inputs[0]} > ${inputs[1]} ) | 0 ) )`; 
		    } else {
		      out = inputs[0] * ( ( inputs[0] > inputs[1] ) | 0 );
		    }
		    
		    return out
		  }
		};

		gtp = (x,y) => {
		  let gtp = Object.create( proto );

		  gtp.inputs = [ x,y ];

		  return gtp
		};
		return gtp;
	}

	var mstosamps;
	var hasRequiredMstosamps;

	function requireMstosamps () {
		if (hasRequiredMstosamps) return mstosamps;
		hasRequiredMstosamps = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'mstosamps',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this ),
		        returnValue;

		    if( isNaN( inputs[0] ) ) {
		      out = `  var ${this.name } = ${gen.samplerate} / 1000 * ${inputs[0]} \n\n`;
		     
		      gen.memo[ this.name ] = out;
		      
		      returnValue = [ this.name, out ];
		    } else {
		      out = gen.samplerate / 1000 * this.inputs[0];

		      returnValue = out;
		    }    

		    return returnValue
		  }
		};

		mstosamps = x => {
		  let mstosamps = Object.create( proto );

		  mstosamps.inputs = [ x ];
		  mstosamps.name = proto.basename + gen.getUID();

		  return mstosamps
		};
		return mstosamps;
	}

	var selector;
	var hasRequiredSelector;

	function requireSelector () {
		if (hasRequiredSelector) return selector;
		hasRequiredSelector = 1;

		let gen = requireGen();

		let proto = {
		  basename:'selector',

		  gen() {
		    let inputs = gen.getInputs( this ), out, returnValue = 0;
		    
		    switch( inputs.length ) {
		      case 2 :
		        returnValue = inputs[1];
		        break;
		      case 3 :
		        out = `  var ${this.name}_out = ${inputs[0]} === 1 ? ${inputs[1]} : ${inputs[2]}\n\n`;
		        returnValue = [ this.name + '_out', out ];
		        break;  
		      default:
		        out = 
		` var ${this.name}_out = 0
  switch( ${inputs[0]} + 1 ) {\n`;

		        for( let i = 1; i < inputs.length; i++ ){
		          out +=`    case ${i}: ${this.name}_out = ${inputs[i]}; break;\n`; 
		        }

		        out += '  }\n\n';
		        
		        returnValue = [ this.name + '_out', ' ' + out ];
		    }

		    gen.memo[ this.name ] = this.name + '_out';

		    return returnValue
		  },
		};

		selector = ( ...inputs ) => {
		  let ugen = Object.create( proto );
		  
		  Object.assign( ugen, {
		    uid:     gen.getUID(),
		    inputs
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return selector;
	}

	var pow;
	var hasRequiredPow;

	function requirePow () {
		if (hasRequiredPow) return pow;
		hasRequiredPow = 1;

		let gen  = requireGen();

		let proto = {
		  basename:'pow',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );
		    
		    
		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet? '' : 'gen.';

		    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
		      gen.closures.add({ 'pow': isWorklet ? 'Math.pow' : Math.pow });

		      out = `${ref}pow( ${inputs[0]}, ${inputs[1]} )`; 

		    } else {
		      if( typeof inputs[0] === 'string' && inputs[0][0] === '(' ) {
		        inputs[0] = inputs[0].slice(1,-1);
		      }
		      if( typeof inputs[1] === 'string' && inputs[1][0] === '(' ) {
		        inputs[1] = inputs[1].slice(1,-1);
		      }

		      out = Math.pow( parseFloat( inputs[0] ), parseFloat( inputs[1]) );
		    }
		    
		    return out
		  }
		};

		pow = (x,y) => {
		  let pow = Object.create( proto );

		  pow.inputs = [ x,y ];
		  pow.id = gen.getUID();
		  pow.name = `${pow.basename}{pow.id}`;

		  return pow
		};
		return pow;
	}

	var attack;
	var hasRequiredAttack;

	function requireAttack () {
		if (hasRequiredAttack) return attack;
		hasRequiredAttack = 1;

		requireGen();
		    let history = requireHistory(),
		    mul     = requireMul(),
		    sub     = requireSub();

		attack = ( decayTime = 44100 ) => {
		  let ssd = history ( 1 ),
		      t60 = Math.exp( -6.907755278921 / decayTime );

		  ssd.in( mul( ssd.out, t60 ) );

		  ssd.out.trigger = ()=> {
		    ssd.value = 1;
		  };

		  return sub( 1, ssd.out )
		};
		return attack;
	}

	var decay;
	var hasRequiredDecay;

	function requireDecay () {
		if (hasRequiredDecay) return decay;
		hasRequiredDecay = 1;

		requireGen();
		    let history = requireHistory(),
		    mul     = requireMul(),
		    t60     = requireT60();

		decay = ( decayTime = 44100, props ) => {
		  let properties = Object.assign({}, { initValue:1 }, props ),
		      ssd = history ( properties.initValue );

		  ssd.in( mul( ssd.out, t60( decayTime ) ) );

		  ssd.out.trigger = ()=> {
		    ssd.value = 1;
		  };

		  return ssd.out 
		};
		return decay;
	}

	var windows = {exports: {}};

	var hasRequiredWindows;

	function requireWindows () {
		if (hasRequiredWindows) return windows.exports;
		hasRequiredWindows = 1;

		/*
		 * many windows here adapted from https://github.com/corbanbrook/dsp.js/blob/master/dsp.js
		 * starting at line 1427
		 * taken 8/15/16
		*/ 

		const windows$1 = windows.exports = { 
		  bartlett( length, index ) {
		    return 2 / (length - 1) * ((length - 1) / 2 - Math.abs(index - (length - 1) / 2)) 
		  },

		  bartlettHann( length, index ) {
		    return 0.62 - 0.48 * Math.abs(index / (length - 1) - 0.5) - 0.38 * Math.cos( 2 * Math.PI * index / (length - 1))
		  },

		  blackman( length, index, alpha ) {
		    let a0 = (1 - alpha) / 2,
		        a1 = 0.5,
		        a2 = alpha / 2;

		    return a0 - a1 * Math.cos(2 * Math.PI * index / (length - 1)) + a2 * Math.cos(4 * Math.PI * index / (length - 1))
		  },

		  cosine( length, index ) {
		    return Math.cos(Math.PI * index / (length - 1) - Math.PI / 2)
		  },

		  gauss( length, index, alpha ) {
		    return Math.pow(Math.E, -0.5 * Math.pow((index - (length - 1) / 2) / (alpha * (length - 1) / 2), 2))
		  },

		  hamming( length, index ) {
		    return 0.54 - 0.46 * Math.cos( Math.PI * 2 * index / (length - 1))
		  },

		  hann( length, index ) {
		    return 0.5 * (1 - Math.cos( Math.PI * 2 * index / (length - 1)) )
		  },

		  lanczos( length, index ) {
		    let x = 2 * index / (length - 1) - 1;
		    return Math.sin(Math.PI * x) / (Math.PI * x)
		  },

		  rectangular( length, index ) {
		    return 1
		  },

		  triangular( length, index ) {
		    return 2 / length * (length / 2 - Math.abs(index - (length - 1) / 2))
		  },

		  // parabola
		  welch( length, _index, ignore, shift=0 ) {
		    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
		    const index = shift === 0 ? _index : (_index + Math.floor( shift * length )) % length;
		    const n_1_over2 = (length - 1) / 2; 

		    return 1 - Math.pow( ( index - n_1_over2 ) / n_1_over2, 2 )
		  },
		  inversewelch( length, _index, ignore, shift=0 ) {
		    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
		    let index = shift === 0 ? _index : (_index + Math.floor( shift * length )) % length;
		    const n_1_over2 = (length - 1) / 2;

		    return Math.pow( ( index - n_1_over2 ) / n_1_over2, 2 )
		  },

		  parabola( length, index ) {
		    if( index <= length / 2 ) {
		      return windows$1.inversewelch( length / 2, index ) - 1
		    }else {
		      return 1 - windows$1.inversewelch( length / 2, index - length / 2 )
		    }
		  },

		  exponential( length, index, alpha ) {
		    return Math.pow( index / length, alpha )
		  },

		  rexponential( length, index, alpha ) {
		    return Math.pow( index / length, alpha )
		  },

		  linear( length, index ) {
		    return index / length
		  }
		};

		windows$1.expodec = windows$1.rexponential;
		windows$1.rexpodec = windows$1.exponential;
		return windows.exports;
	}

	var env;
	var hasRequiredEnv;

	function requireEnv () {
		if (hasRequiredEnv) return env;
		hasRequiredEnv = 1;

		let gen     = requireGen(),
		    windows = requireWindows(),
		    data    = requireData(),
		    defaults = {
		      type:'triangular', length:1024, alpha:.15, shift:0, reverse:false 
		    };

		env = props => {
		  
		  let properties = Object.assign( {}, defaults, props );
		  let buffer = new Float32Array( properties.length );

		  let name = properties.type + '_' + properties.length + '_' + properties.shift + '_' + properties.reverse + '_' + properties.alpha;
		  if( typeof gen.globals.windows[ name ] === 'undefined' ) { 

		    for( let i = 0; i < properties.length; i++ ) {
		      buffer[ i ] = windows[ properties.type ]( properties.length, i, properties.alpha, properties.shift );
		    }

		    if( properties.reverse === true ) { 
		      buffer.reverse();
		    }
		    gen.globals.windows[ name ] = data( buffer );
		  }

		  let ugen = gen.globals.windows[ name ]; 
		  ugen.name = 'env' + gen.getUID();

		  return ugen
		};
		return env;
	}

	var ifelseif;
	var hasRequiredIfelseif;

	function requireIfelseif () {
		if (hasRequiredIfelseif) return ifelseif;
		hasRequiredIfelseif = 1;

		let gen = requireGen();

		let proto = {
		  basename:'ifelse',

		  gen() {
		    let conditionals = this.inputs[0],
		        defaultValue = gen.getInput( conditionals[ conditionals.length - 1] ),
		        out = `  var ${this.name}_out = ${defaultValue}\n`; 

		    //console.log( 'conditionals:', this.name, conditionals )

		    //console.log( 'defaultValue:', defaultValue )

		    for( let i = 0; i < conditionals.length - 2; i+= 2 ) {
		      let isEndBlock = i === conditionals.length - 3,
		          cond  = gen.getInput( conditionals[ i ] ),
		          preblock = conditionals[ i+1 ],
		          block, blockName, output;

		      //console.log( 'pb', preblock )

		      if( typeof preblock === 'number' ){
		        block = preblock;
		        blockName = null;
		      }else {
		        if( gen.memo[ preblock.name ] === undefined ) {
		          // used to place all code dependencies in appropriate blocks
		          gen.startLocalize();

		          gen.getInput( preblock );

		          block = gen.endLocalize();
		          blockName = block[0];
		          block = block[ 1 ].join('');
		          block = '  ' + block.replace( /\n/gi, '\n  ' );
		        }else {
		          block = '';
		          blockName = gen.memo[ preblock.name ];
		        }
		      }

		      output = blockName === null ? 
		        `  ${this.name}_out = ${block}` :
		        `${block}  ${this.name}_out = ${blockName}`;
		      
		      if( i===0 ) out += ' ';
		      out += 
		` if( ${cond} === 1 ) {
${output}
  }`;

		      if( !isEndBlock ) {
		        out += ` else`;
		      }else {
		        out += `\n`;
		      }
		    }

		    gen.memo[ this.name ] = `${this.name}_out`;

		    return [ `${this.name}_out`, out ]
		  }
		};

		ifelseif = ( ...args  ) => {
		  let ugen = Object.create( proto ),
		      conditions = Array.isArray( args[0] ) ? args[0] : args;

		  Object.assign( ugen, {
		    uid:     gen.getUID(),
		    inputs:  [ conditions ],
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return ifelseif;
	}

	var bang;
	var hasRequiredBang;

	function requireBang () {
		if (hasRequiredBang) return bang;
		hasRequiredBang = 1;

		let gen = requireGen();

		let proto = {
		  gen() {
		    gen.requestMemory( this.memory );
		    
		    let out = 
		`  var ${this.name} = memory[${this.memory.value.idx}]
  if( ${this.name} === 1 ) memory[${this.memory.value.idx}] = 0      
      
`;
		    gen.memo[ this.name ] = this.name;

		    return [ this.name, out ]
		  } 
		};

		bang = ( _props ) => {
		  let ugen = Object.create( proto ),
		      props = Object.assign({}, { min:0, max:1 }, _props );

		  ugen.name = 'bang' + gen.getUID();

		  ugen.min = props.min;
		  ugen.max = props.max;

		  const usingWorklet = gen.mode === 'worklet';
		  if( usingWorklet === true ) {
		    ugen.node = null;
		    utilities.register( ugen );
		  }

		  ugen.trigger = () => {
		    if( usingWorklet === true && ugen.node !== null ) {
		      ugen.node.port.postMessage({ key:'set', idx:ugen.memory.value.idx, value:ugen.max });
		    }else {
		      if( gen.memory && gen.memory.heap )
		        gen.memory.heap[ ugen.memory.value.idx ] = ugen.max; 
		    }
		  };

		  ugen.memory = {
		    value: { length:1, idx:null }
		  };

		  return ugen
		};
		return bang;
	}

	var neq;
	var hasRequiredNeq;

	function requireNeq () {
		if (hasRequiredNeq) return neq;
		hasRequiredNeq = 1;

		let gen = requireGen();

		let proto = {
		  basename:'neq',

		  gen() {
		    let inputs = gen.getInputs( this ), out;

		    out = /*this.inputs[0] !== this.inputs[1] ? 1 :*/ `  var ${this.name} = (${inputs[0]} !== ${inputs[1]}) | 0\n\n`;

		    gen.memo[ this.name ] = this.name;

		    return [ this.name, out ]
		  },

		};

		neq = ( in1, in2 ) => {
		  let ugen = Object.create( proto );
		  Object.assign( ugen, {
		    uid:     gen.getUID(),
		    inputs:  [ in1, in2 ],
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return neq;
	}

	var and;
	var hasRequiredAnd;

	function requireAnd () {
		if (hasRequiredAnd) return and;
		hasRequiredAnd = 1;

		let gen = requireGen();

		let proto = {
		  basename:'and',

		  gen() {
		    let inputs = gen.getInputs( this ), out;

		    out = `  var ${this.name} = (${inputs[0]} !== 0 && ${inputs[1]} !== 0) | 0\n\n`;

		    gen.memo[ this.name ] = `${this.name}`;

		    return [ `${this.name}`, out ]
		  },

		};

		and = ( in1, in2 ) => {
		  let ugen = Object.create( proto );
		  Object.assign( ugen, {
		    uid:     gen.getUID(),
		    inputs:  [ in1, in2 ],
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return and;
	}

	var ad;
	var hasRequiredAd;

	function requireAd () {
		if (hasRequiredAd) return ad;
		hasRequiredAd = 1;

		let gen      = requireGen();
		    requireMul();
		    let sub      = requireSub(),
		    div      = requireDiv(),
		    data     = requireData(),
		    peek     = requirePeek(),
		    accum    = requireAccum(),
		    ifelse   = requireIfelseif(),
		    lt       = requireLt(),
		    bang     = requireBang(),
		    env      = requireEnv(),
		    add      = requireAdd(),
		    poke     = requirePoke(),
		    neq      = requireNeq(),
		    and      = requireAnd(),
		    gte      = requireGte();
		    requireMemo();
		    let utilities= requireUtilities();

		ad = ( attackTime = 44100, decayTime = 44100, _props ) => {
		  const props = Object.assign({}, { shape:'exponential', alpha:5, trigger:null }, _props );
		  const _bang = props.trigger !== null ? props.trigger : bang(),
		        phase = accum( 1, _bang, { min:0, max: Infinity, initialValue:-Infinity, shouldWrap:false });
		      
		  let bufferData, bufferDataReverse, out;

		  //console.log( 'shape:', props.shape, 'attack time:', attackTime, 'decay time:', decayTime )
		  let completeFlag = data( [0] );
		  
		  // slightly more efficient to use existing phase accumulator for linear envelopes
		  if( props.shape === 'linear' ) {
		    out = ifelse( 
		      and( gte( phase, 0), lt( phase, attackTime )),
		      div( phase, attackTime ),

		      and( gte( phase, 0),  lt( phase, add( attackTime, decayTime ) ) ),
		      sub( 1, div( sub( phase, attackTime ), decayTime ) ),
		      
		      neq( phase, -Infinity),
		      poke( completeFlag, 1, 0, { inline:0 }),

		      0 
		    );
		  } else {
		    bufferData = env({ length:1024, type:props.shape, alpha:props.alpha });
		    bufferDataReverse = env({ length:1024, type:props.shape, alpha:props.alpha, reverse:true });

		    out = ifelse( 
		      and( gte( phase, 0), lt( phase, attackTime ) ), 
		      peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ), 

		      and( gte(phase,0), lt( phase, add( attackTime, decayTime ) ) ), 
		      peek( bufferDataReverse, div( sub( phase, attackTime ), decayTime ), { boundmode:'clamp' }),

		      neq( phase, -Infinity ),
		      poke( completeFlag, 1, 0, { inline:0 }),

		      0
		    );
		  }

		  const usingWorklet = gen.mode === 'worklet';
		  if( usingWorklet === true ) {
		    out.node = null;
		    utilities.register( out );
		  }

		  // needed for gibberish... getting this to work right with worklets
		  // via promises will probably be tricky
		  out.isComplete = ()=> {
		    if( usingWorklet === true && out.node !== null ) {
		      const p = new Promise( resolve => {
		        out.node.getMemoryValue( completeFlag.memory.values.idx, resolve );
		      });

		      return p
		    }else {
		      return gen.memory.heap[ completeFlag.memory.values.idx ]
		    }
		  };

		  out.trigger = ()=> {
		    if( usingWorklet === true && out.node !== null ) {
		      out.node.port.postMessage({ key:'set', idx:completeFlag.memory.values.idx, value:0 });
		    }
		    //else{
		    //  gen.memory.heap[ completeFlag.memory.values.idx ] = 0
		    //}
		    _bang.trigger();
		  };

		  return out 
		};
		return ad;
	}

	var adsr;
	var hasRequiredAdsr;

	function requireAdsr () {
		if (hasRequiredAdsr) return adsr;
		hasRequiredAdsr = 1;

		let gen      = requireGen(),
		    mul      = requireMul(),
		    sub      = requireSub(),
		    div      = requireDiv(),
		    data     = requireData(),
		    peek     = requirePeek(),
		    accum    = requireAccum(),
		    ifelse   = requireIfelseif(),
		    lt       = requireLt(),
		    bang     = requireBang(),
		    env      = requireEnv(),
		    param    = requireParam(),
		    add      = requireAdd(),
		    gtp      = requireGtp(),
		    not      = requireNot(),
		    and      = requireAnd(),
		    neq      = requireNeq(),
		    poke     = requirePoke();

		adsr = ( attackTime=44, decayTime=22050, sustainTime=44100, sustainLevel=.6, releaseTime=44100, _props ) => {
		  let envTrigger = bang(),
		      phase = accum( 1, envTrigger, { max: Infinity, shouldWrap:false, initialValue:Infinity }),
		      shouldSustain = param( 1 ),
		      defaults = {
		         shape: 'exponential',
		         alpha: 5,
		         triggerRelease: false,
		      },
		      props = Object.assign({}, defaults, _props ),
		      bufferData, out, sustainCondition, releaseAccum, releaseCondition;


		  const completeFlag = data( [0] );

		  bufferData = env({ length:1024, alpha:props.alpha, shift:0, type:props.shape });

		  sustainCondition = props.triggerRelease 
		    ? shouldSustain
		    : lt( phase, add( attackTime, decayTime, sustainTime ) );

		  releaseAccum = props.triggerRelease
		    ? gtp( sub( sustainLevel, accum( div( sustainLevel, releaseTime ) , 0, { shouldWrap:false }) ), 0 )
		    : sub( sustainLevel, mul( div( sub( phase, add( attackTime, decayTime, sustainTime ) ), releaseTime ), sustainLevel ) ), 

		  releaseCondition = props.triggerRelease
		    ? not( shouldSustain )
		    : lt( phase, add( attackTime, decayTime, sustainTime, releaseTime ) );

		  out = ifelse(
		    // attack 
		    lt( phase,  attackTime ), 
		    peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ), 

		    // decay
		    lt( phase, add( attackTime, decayTime ) ), 
		    peek( bufferData, sub( 1, mul( div( sub( phase,  attackTime ),  decayTime ), sub( 1,  sustainLevel ) ) ), { boundmode:'clamp' }),

		    // sustain
		    and( sustainCondition, neq( phase, Infinity ) ),
		    peek( bufferData,  sustainLevel ),

		    // release
		    releaseCondition, //lt( phase,  attackTime +  decayTime +  sustainTime +  releaseTime ),
		    peek( 
		      bufferData,
		      releaseAccum, 
		      //sub(  sustainLevel, mul( div( sub( phase,  attackTime +  decayTime +  sustainTime),  releaseTime ),  sustainLevel ) ), 
		      { boundmode:'clamp' }
		    ),

		    neq( phase, Infinity ),
		    poke( completeFlag, 1, 0, { inline:0 }),

		    0
		  );
		   
		  const usingWorklet = gen.mode === 'worklet';
		  if( usingWorklet === true ) {
		    out.node = null;
		    utilities.register( out );
		  }

		  out.trigger = ()=> {
		    shouldSustain.value = 1;
		    envTrigger.trigger();
		  };
		 
		  // needed for gibberish... getting this to work right with worklets
		  // via promises will probably be tricky
		  out.isComplete = ()=> {
		    if( usingWorklet === true && out.node !== null ) {
		      const p = new Promise( resolve => {
		        out.node.getMemoryValue( completeFlag.memory.values.idx, resolve );
		      });

		      return p
		    }else {
		      return gen.memory.heap[ completeFlag.memory.values.idx ]
		    }
		  };


		  out.release = ()=> {
		    shouldSustain.value = 0;
		    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
		    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
		    if( usingWorklet && out.node !== null ) {
		      out.node.port.postMessage({ key:'set', idx:releaseAccum.inputs[0].inputs[1].memory.value.idx, value:0 });
		    }else {
		      gen.memory.heap[ releaseAccum.inputs[0].inputs[1].memory.value.idx ] = 0;
		    }
		  };

		  return out 
		};
		return adsr;
	}

	var or;
	var hasRequiredOr;

	function requireOr () {
		if (hasRequiredOr) return or;
		hasRequiredOr = 1;

		let gen = requireGen();

		let proto = {
		  basename:'or',

		  gen() {
		    let inputs = gen.getInputs( this ), out;

		    out = `  var ${this.name} = (${inputs[0]} !== 0 || ${inputs[1]} !== 0) | 0\n\n`;

		    gen.memo[ this.name ] = `${this.name}`;

		    return [ `${this.name}`, out ]
		  },

		};

		or = ( in1, in2 ) => {
		  let ugen = Object.create( proto );
		  Object.assign( ugen, {
		    uid:     gen.getUID(),
		    inputs:  [ in1, in2 ],
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return or;
	}

	var pan;
	var hasRequiredPan;

	function requirePan () {
		if (hasRequiredPan) return pan;
		hasRequiredPan = 1;

		let gen = requireGen(),
		    data = requireData(),
		    peek = requirePeek(),
		    mul  = requireMul();

		let proto = {
		  basename:'pan', 
		  initTable() {    
		    let bufferL = new Float32Array( 1024 ),
		        bufferR = new Float32Array( 1024 );

		    const angToRad = Math.PI / 180;
		    for( let i = 0; i < 1024; i++ ) { 
		      let pan = i * ( 90 / 1024 );
		      bufferL[i] = Math.cos( pan * angToRad ); 
		      bufferR[i] = Math.sin( pan * angToRad );
		    }

		    gen.globals.panL = data( bufferL, 1, { immutable:true });
		    gen.globals.panR = data( bufferR, 1, { immutable:true });
		  }

		};

		pan = ( leftInput, rightInput, pan =.5, properties ) => {
		  if( gen.globals.panL === undefined ) proto.initTable();

		  let ugen = Object.create( proto );

		  Object.assign( ugen, {
		    uid:     gen.getUID(),
		    inputs:  [ leftInput, rightInput ],
		    left:    mul( leftInput, peek( gen.globals.panL, pan, { boundmode:'clamp' }) ),
		    right:   mul( rightInput, peek( gen.globals.panR, pan, { boundmode:'clamp' }) )
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return pan;
	}

	var eq;
	var hasRequiredEq;

	function requireEq () {
		if (hasRequiredEq) return eq;
		hasRequiredEq = 1;

		let gen = requireGen();

		let proto = {
		  basename:'eq',

		  gen() {
		    let inputs = gen.getInputs( this ), out;

		    out = this.inputs[0] === this.inputs[1] ? 1 : `  var ${this.name} = (${inputs[0]} === ${inputs[1]}) | 0\n\n`;

		    gen.memo[ this.name ] = `${this.name}`;

		    return [ `${this.name}`, out ]
		  },

		};

		eq = ( in1, in2 ) => {
		  let ugen = Object.create( proto );
		  Object.assign( ugen, {
		    uid:     gen.getUID(),
		    inputs:  [ in1, in2 ],
		  });
		  
		  ugen.name = `${ugen.basename}${ugen.uid}`;

		  return ugen
		};
		return eq;
	}

	var exp;
	var hasRequiredExp;

	function requireExp () {
		if (hasRequiredExp) return exp;
		hasRequiredExp = 1;

		let gen  = requireGen();

		let proto = {
		  name:'exp',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    
		    const isWorklet = gen.mode === 'worklet';
		    const ref = isWorklet? '' : 'gen.';

		    if( isNaN( inputs[0] ) ) {
		      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.exp' : Math.exp });

		      out = `${ref}exp( ${inputs[0]} )`;

		    } else {
		      out = Math.exp( parseFloat( inputs[0] ) );
		    }
		    
		    return out
		  }
		};

		exp = x => {
		  let exp = Object.create( proto );

		  exp.inputs = [ x ];

		  return exp
		};
		return exp;
	}

	var process;
	var hasRequiredProcess;

	function requireProcess () {
		if (hasRequiredProcess) return process;
		hasRequiredProcess = 1;

		let gen  = requireGen();
		const proto = {
		  basename:'process',

		  gen() {
		    let out,
		        inputs = gen.getInputs( this );

		    gen.closures.add({ [''+this.funcname] : this.func });

		    out = `  var ${this.name} = gen['${this.funcname}'](`;

		    inputs.forEach( (v,i,arr ) => {
		      out += arr[ i ];
		      if( i < arr.length - 1 ) out += ',';
		    });

		    out += ')\n';

		    gen.memo[ this.name ] = this.name;

		    return [this.name, out]
		  }
		};

		process = (...args) => {
		  const process = {};// Object.create( proto )
		  const id = gen.getUID();
		  process.name = 'process' + id; 

		  process.func = new Function( ...args );

		  //gen.globals[ process.name ] = process.func

		  process.call = function( ...args  ) {
		    const output = Object.create( proto );
		    output.funcname = process.name;
		    output.func = process.func;
		    output.name = 'process_out_' + id;
		    output.process = process;

		    output.inputs = args;

		    return output
		  };

		  return process 
		};
		return process;
	}

	var seq;
	var hasRequiredSeq;

	function requireSeq () {
		if (hasRequiredSeq) return seq;
		hasRequiredSeq = 1;

		let gen   = requireGen(),
		    accum = requireAccum(),
		    counter= requireCounter(),
		    peek  = requirePeek(),
		    ssd   = requireHistory(),
		    data  = requireData(),
		    proto = { basename:'seq' };

		seq = ( durations = 11025, values = [0,1], phaseIncrement = 1) => {
		  let clock;
		  
		  if( Array.isArray( durations ) ) {
		    // we want a counter that is using our current
		    // rate value, but we want the rate value to be derived from
		    // the counter. must insert a single-sample dealy to avoid
		    // infinite loop.
		    const clock2 = counter( 0, 0, durations.length );
		    const __durations = peek( data( durations ), clock2, { mode:'simple' }); 
		    clock = counter( phaseIncrement, 0, __durations );
		    
		    // add one sample delay to avoid codegen loop
		    const s = ssd();
		    s.in( clock.wrap );
		    clock2.inputs[0] = s.out;
		  }else {
		    // if the rate argument is a single value we don't need to
		    // do anything tricky.
		    clock = counter( phaseIncrement, 0, durations );
		  }
		  
		  const stepper = accum( clock.wrap, 0, { min:0, max:values.length });
		   
		  const ugen = peek( data( values ), stepper, { mode:'simple' });

		  ugen.name = proto.basename + gen.getUID();
		  ugen.trigger = clock.wrap;

		  return ugen
		};
		return seq;
	}

	var js;
	var hasRequiredJs;

	function requireJs () {
		if (hasRequiredJs) return js;
		hasRequiredJs = 1;

		const library = {
		  export( destination ) {
		    if( destination === window ) {
		      destination.ssd = library.history;    // history is window object property, so use ssd as alias
		      destination.input = library.in;       // in is a keyword in javascript
		      destination.ternary = library.switch; // switch is a keyword in javascript

		      delete library.history;
		      delete library.in;
		      delete library.switch;
		    }

		    Object.assign( destination, library );

		    Object.defineProperty( library, 'samplerate', {
		      get() { return library.gen.samplerate },
		      set(v) {}
		    });

		    library.in = destination.input;
		    library.history = destination.ssd;
		    library.switch = destination.ternary;

		    destination.clip = library.clamp;
		  },

		  gen:      requireGen(),
		  
		  abs:      requireAbs(),
		  round:    requireRound(),
		  param:    requireParam(),
		  add:      requireAdd(),
		  sub:      requireSub(),
		  mul:      requireMul(),
		  div:      requireDiv(),
		  accum:    requireAccum(),
		  counter:  requireCounter(),
		  sin:      requireSin(),
		  cos:      requireCos(),
		  tan:      requireTan(),
		  tanh:     requireTanh(),
		  asin:     requireAsin(),
		  acos:     requireAcos(),
		  atan:     requireAtan(),  
		  phasor:   requirePhasor(),
		  phasorN:  requirePhasorN(),
		  data:     requireData(),
		  peek:     requirePeek(),
		  peekDyn:  requirePeekDyn(),
		  cycle:    requireCycle(),
		  cycleN:   requireCycleN(),
		  history:  requireHistory(),
		  delta:    requireDelta(),
		  floor:    requireFloor(),
		  ceil:     requireCeil(),
		  min:      requireMin(),
		  max:      requireMax(),
		  sign:     requireSign(),
		  dcblock:  requireDcblock(),
		  memo:     requireMemo(),
		  rate:     requireRate(),
		  wrap:     requireWrap(),
		  mix:      requireMix(),
		  clamp:    requireClamp(),
		  poke:     requirePoke(),
		  delay:    requireDelay(),
		  fold:     requireFold(),
		  mod :     requireMod(),
		  sah :     requireSah(),
		  noise:    requireNoise(),
		  not:      requireNot(),
		  gt:       requireGt(),
		  gte:      requireGte(),
		  lt:       requireLt(), 
		  lte:      requireLte(), 
		  bool:     requireBool(),
		  gate:     requireGate(),
		  train:    requireTrain(),
		  slide:    requireSlide(),
		  in:       require_in(),
		  t60:      requireT60(),
		  mtof:     requireMtof(),
		  ltp:      requireLtp(),        // TODO: test
		  gtp:      requireGtp(),        // TODO: test
		  switch:   require_switch(),
		  mstosamps:requireMstosamps(), // TODO: needs test,
		  selector: requireSelector(),
		  utilities:requireUtilities(),
		  pow:      requirePow(),
		  attack:   requireAttack(),
		  decay:    requireDecay(),
		  windows:  requireWindows(),
		  env:      requireEnv(),
		  ad:       requireAd(),
		  adsr:     requireAdsr(),
		  ifelse:   requireIfelseif(),
		  bang:     requireBang(),
		  and:      requireAnd(),
		  or:       requireOr(),
		  pan:      requirePan(),
		  eq:       requireEq(),
		  neq:      requireNeq(),
		  exp:      requireExp(),
		  process:  requireProcess(),
		  seq:      requireSeq()
		};

		library.gen.lib = library;

		js = library;
		return js;
	}

	var jsExports = requireJs();
	var index = /*@__PURE__*/getDefaultExportFromCjs(jsExports);

	return index;

}));
