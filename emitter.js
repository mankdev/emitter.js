/**
 * Emitter constructor
 */
function Emitter() {
  this._events = this._events || {}
  this._maxListeners = 10
  this._memLeakDetected = false
}

// Exports
if( typeof module !== 'undefined' )
  module.exports = Emitter

/**
 * Support both, setTimeout() and process.nextTick()
 * @type {Function}
 */
Emitter.nextTick = (
  typeof process !== 'undefined' &&
  typeof process.nextTick === 'function'
) ? process.nextTick.bind( process ) : setTimeout.bind( this )

/**
 * Determines if Emitters warn
 * about potential memory leaks
 * @type {Boolean}
 */
Emitter.warn = true

/**
 * Emitter prototype
 * @type {Object}
 */
Emitter.prototype = {
  
  /**
   * [on description]
   * @param  {String}   type
   * @param  {Function} handler
   * @return {Emitter}
   */
  on: function( type, handler ) {
    
    if( typeof handler !== 'function' )
      throw new TypeError( 'Handler must be a function.' )
    
    this._events[ type ] ?
      this._events[ type ].push( handler ) :
      this._events[ type ] = [ handler ]
    
    if( Emitter.warn && this._events[ type ].length > this._maxListeners ) {
      if( this._maxListeners > 0 && !this._memLeakDetected ) {
        this._memLeakDetected = true
        console.warn(
          'WARNING: Possible event emitter memory leak detected.',
          this._events[ type ].length, 'event handlers added.',
          'Use emitter.setMaxListeners() to increase the threshold.'
        )
        console.trace()
      }
    }
    
    return this
    
  },
  
  /**
   * [once description]
   * @param  {String}   type
   * @param  {Function} handler
   * @return {Emitter}
   */
  once: function( type, handler ) {
    
    if( typeof handler !== 'function' )
      throw new TypeError( 'Handler must be a function.' )
    
    function wrapper() {
      this.removeListener( type, wrapper )
      handler.apply( this, arguments )
    }
    
    this._events[ type ] ?
      this._events[ type ].push( wrapper ) :
      this._events[ type ] = [ wrapper ]
    
    return this
    
  },
  
  /**
   * [emit description]
   * @param  {String}  type
   * @return {Boolean}
   */
  emit: function( type ) {
    
    var emitter = this
    var listeners = this._events[ type ]
    
    if( type === 'error' && !listeners ) {
      if( !this._events.error ) {
        throw !( arguments[1] instanceof Error ) ?
          new TypeError( 'Unhandled "error" event.' ) :
          arguments[1]
        return false
      }
    } else if( !listeners ) {
      return false
    }
    
    var argv = [].slice.call( arguments, 1 )
    var handler, i, len = listeners.length
    
    for( i = 0; i < len; i++ ) {
      handler = listeners[i]
      Emitter.nextTick( function() {
        handler.apply( emitter, argv )
      })
    }
    
    return true
    
  },
  
  /**
   * [listeners description]
   * @param  {String} type
   * @return {Array}
   */
  listeners: function( type ) {
    return this._events[ type ] ?
      this._events[ type ].slice() : []
  },
  
  /**
   * [setMaxListeners description]
   * @param {Number}   value
   * @return {Emitter}
   */
  setMaxListeners: function( value ) {
    
    if( typeof value !== 'number' )
      throw new TypeError( 'Value must be a number.' )
    
    this._maxListeners = value
    
    return this
    
  },
  
  /**
   * [removeListener description]
   * @param  {String}   type
   * @param  {Function} handler
   * @return {Emitter}
   */
  removeListener: function( type, handler ) {
    
    if( typeof handler !== 'function' )
      throw new TypeError( 'Handler must be a function.' )
    
    var handlers = this._events[ type ]
    var position = handlers.indexOf( handler )
    
    if( handlers && ~position ) {
      if( handlers.length === 1 ) {
        this._events[ type ] = undefined
        delete this._events[ type ]
      } else {
        handlers.splice( position, 1 )
      }
    }
    
    return this
    
  },
  
  /**
   * [removeAllListeners description]
   * @param  {String}  type
   * @return {Emitter}
   */
  removeAllListeners: function( type ) {
    
    if( arguments.length === 0 ) {
      for( type in this._events ) {
        this.removeAllListeners( type )
      }
    } else {
      this._events[ type ] = undefined
      delete this._events[ type ]
    }
    
    return this
    
  }
  
}
