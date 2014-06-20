aQuery.define( "main/event", [ "base/config", "base/typed", "base/extend", "base/client", "base/array", "main/query", "main/CustomEvent", "main/data" ], function( $, config, typed, utilExtend, client, array, query, CustomEvent, utilData, undefined ) {
  "use strict";
  var mouse = "contextmenu click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave mousewheel DOMMouseScroll".split( " " ),
    /*DOMMouseScroll firefox*/
    mutation = "load unload error".split( " " ),
    html = "blur focus focusin focusout".split( " " ),
    key = "keydown keypress keyup".split( " " ),
    other = "resize scroll change select submit DomNodeInserted DomNodeRemoved".split( " " ),
    mobile = "touchstart touchmove touchend touchcancel gesturestart gesturechange gestureend orientationchange",
    // _eventNameList = [].concat( mouse, mutation, html, key, other ),
    domEventList = {},
    eventHooks = {
      type: function( type ) {
        var temp;
        switch ( type ) {
          case "focus":
            if ( client.browser.ie ) type += "in";
            break;
          case "blur":
            if ( client.browser.ie ) type = "focusout";
            break;
          case "touchwheel":
            type = "mousewheel";
            if ( client.browser.firefox ) type = "DOMMouseScroll";
            break;
          case "mousewheel":
            if ( client.browser.firefox ) type = "DOMMouseScroll";
            break;
        }
        if ( ( temp = $.interfaces.trigger( "eventHooks", type ) ) ) type = temp;
        return type;
      },
      compatibleEvent: function( e ) {
        var eventDoc = event.document;
        e.getCharCode = function() {
          eventDoc.getCharCode( this );
        };
        e.preventDefault || ( e.preventDefault = function() {
          this.returnValue = false;
        } );
        e.stopPropagation || ( e.stopPropagation = function() {
          this.cancelBubble = true;
        } );
        e.getButton = function() {
          eventDoc.getButton( this );
        };
      },
      /**
       * @inner
       * Proxy of event handler.
       * @param {Function}
       * @returns {Function}
       */
      proxy: function( fn ) {
        if ( !fn.__proxy ) {
          var temp;
          fn.__proxy = function( e ) {
            var evt = event.document.getEvent( e ),
              target = this;

            if ( typed.isEvent( evt ) ) {
              target = event.document.getTarget( e );
              if ( ( temp = $.interfaces.trigger( "proxy", evt, target ) ) ) {
                evt = temp.event;
                target = temp.target;
              }
              config.module.compatibleEvent && eventHooks.compatibleEvent( evt );
            }

            fn.call( target, evt || {} );
          };
          fn.__proxy.count = 1;
        } else {
          fn.__proxy.count++;
        }
        return fn.__proxy;
      },
      /**
       * @inner
       * Destroy proxy.
       * @param {Function}
       */
      destroyProxy: function( fn ) {
        if ( fn.__proxy && --fn.__proxy.count === 0 ) {
          delete fn.__proxy;
        }
      }
    },
    _handlersKey = "__handlersKey",
    _toggleKey = "__toggleKey",
    i = 0,
    len;

  /**
   * Export event util.
   * <br /> It create bus to send or listion message for aQuery life-cycle.
   * @exports main/event
   * @requires module:base/config
   * @requires module:base/typed
   * @requires module:base/extend
   * @requires module:base/client
   * @requires module:base/array
   * @requires module:main/query
   * @requires module:main/CustomEvent
   * @requires module:main/data
   */
  var event = {
    /**
     * Add an event Handler to element.
     * @param {Element|window}
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    addHandler: function( ele, type, fn ) {
      if ( typed.isElement( ele ) || typed.isWindow( ele ) ) {
        var customEvent, proxy, item, types = type.split( " " ),
          i = types.length - 1;

        customEvent = event._initHandler( ele );

        for ( ; i >= 0; i-- ) {
          item = types[ i ];
          if ( customEvent.hasHandler( item, fn ) == -1 && domEventList[ item ] ) {
            item = eventHooks.type( item );
            proxy = eventHooks.proxy( fn, this );
            event.document._addHandler( ele, item, proxy );
          }
        }

        type && fn && customEvent.addHandler( type, fn );
      }
      return this;
    },
    /**
     * Add a event Handler to element and do once.
     * <br /> It will remove handler after done.
     * @param {Element|window}
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    once: function( ele, type, fn ) {
      if ( ( typed.isElement( ele ) || typed.isWindow( ele ) ) ) {
        var customEvent = event._initHandler( ele ),
          types = type.split( " " ),
          i = types.length - 1,
          item;

        for ( ; i >= 0; i-- ) {
          item = types[ i ];
          if ( customEvent.hasHandler( item, fn ) == -1 ) {
            this._once( ele, item, fn );
          }
        }

      }
      return this;
    },
    _once: function( ele, type, fn ) {
      var customEvent = event._initHandler( ele ),
        proxy = function() {
          if ( domEventList[ type ] ) {
            var todo = eventHooks.proxy( fn, event );
            var typeHook = eventHooks.type( type );
            todo.apply( this, arguments );
            eventHooks.destroyProxy( fn );
            event.document.removeHandler( ele, typeHook, proxy );
            customEvent.removeHandler( type, fn );
            event._destroyHandler( ele );
            proxy = null;
          }
        };

      if ( domEventList[ type ] ) {
        var typeHook = eventHooks.type( type );
        event.document.addHandler( ele, typeHook, proxy );
        customEvent.addHandler( type, fn );
      } else {
        customEvent.once( type, fn, function() {
          event._destroyHandler( ele );
        } );
      }
    },
    /**
     * Remove an event Handler from element.
     * @param {Element|window}
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    removeHandler: function( ele, type, fn ) {
      if ( typed.isElement( ele ) || typed.isWindow( ele ) ) {
        var customEvent = utilData.get( ele, _handlersKey ),
          proxy = fn.__proxy || fn,
          types = type.split( " " ),
          i = types.length - 1,
          item;

        for ( ; i >= 0; i-- ) {
          item = types[ i ];
          if ( domEventList[ item ] ) {
            item = eventHooks.type( item );
            eventHooks.destroyProxy( fn );
            event.document._removeHandler( ele, item, proxy );
          }
        }

        if ( customEvent && type && fn ) {
          customEvent.removeHandler( type, fn );
          event._destroyHandler( ele );
        }

      }
      return this;
    },
    /**
     * Remove all event Handler from element.
     * @param {Element|window}
     * @param {String} [type] - If type is undefined then clear all handlers.
     * @returns {this}
     */
    clearHandlers: function( ele, type ) {
      if ( typed.isElement( ele ) || typed.isWindow( ele ) ) {
        var customEvent = utilData.get( ele, _handlersKey );
        if ( !customEvent ) {
          return this;
        }
        var handlerMap = customEvent.getHandlers(),
          map = {},
          j = 0,
          len = 0,
          i, item, fn;

        if ( type ) {
          var types = type.split( " " ),
            z = types.length - 1;
          for ( ; z >= 0; z-- ) {
            item = types[ z ];
            if ( item in handlerMap ) {
              map[ item ] = 1;
            }
          }
        } else {
          map = handlerMap;
        }

        for ( i in map ) {
          item = customEvent.getHandlers( i );
          for ( j = 0, len = item.length; j < len; j++ ) {
            fn = item[ j ];
            domEventList[ i ] && event.removeHandler( ele, i, fn );
          }
        }
        customEvent.clearHandlers( type );
        event._destroyHandler( ele );
      }
      return this;
    },
    /**
     * Clone the current element`s handler to another element.
     * <br /> Wraning: ele will clear handlers.
     * @param {Element|window} - Target Element
     * @param {Element|window} - Source Element.
     * @returns {this}
     */
    cloneHandlers: function( tarEle, srcEle ) {
      var customEvent = utilData.get( srcEle, _handlersKey );
      if ( customEvent ) {
        var handlerMap = customEvent.getHandlers(),
          j = 0,
          len = 0,
          i, item, fn;

        for ( i in handlerMap ) {
          item = customEvent.getHandlers( i );
          for ( j = 0, len = item.length; j < len; j++ ) {
            fn = item[ j ];
            event.addHandler( tarEle, i, fn );
          }
        }
      }
      return this;
    },
    /**
     * Has the element an event handler.
     * @param {Element|window}
     * @param {String}
     * @param {Function}
     * @returns {Number} fn - "-1" means has not.
     */
    hasHandler: function( ele, type, fn ) {
      if ( typed.isElement( ele ) || typed.isWindow( ele ) ) {
        var customEvent = utilData.get( ele, _handlersKey );
        if ( customEvent ) {
          return customEvent.hasHandler( type, fn );
        }
      }
      return -1;
    },
    /**
     * Return handlers.
     * @param {Element|window}
     * @param {String=} - If type is null then return whole handlers object.
     * @returns {Array|Object|null}
     */
    getHandlers: function( ele, type ) {
      if ( typed.isElement( ele ) || typed.isWindow( ele ) ) {
        var customEvent = utilData.get( ele, _handlersKey );
        if ( customEvent ) {
          var handlers = customEvent.getHandlers( type );
          return handlers.length ? handlers : null;
        }
      }
      return null;
    },
    /**
     * @namespace
     */
    document: {
      /**
       * Add an event handler to element.
       * @param {Element|window}
       * @param {String}
       * @param {Funtion}
       */
      addHandler: function( ele, type, fn ) {
        var types = type.split( " " ),
          i = types.length - 1;
        for ( ; i >= 0; i-- ) {
          this._addHandler( ele, types[ i ], fn );
        }
      },
      _addHandler: function( ele, type, fn ) {
        if ( ele.addEventListener ) ele.addEventListener( type, fn, false ); //事件冒泡
        else if ( ele.attachEvent ) ele.attachEvent( "on" + type, fn );
        else {
          ele[ "on" + type ] = fn;
          ele = null;
        }
      },
      /**
       * Add a event Handler to element and do once.
       * @param {Element|window}
       * @param {String}
       * @param {Funtion}
       */
      once: function( ele, type, fn ) {
        var self = this,
          fnproxy = function() {
            self._removeHandler( ele, type, fnproxy );
            fn.apply( this, arguments );
          };
        return this._addHandler( ele, type, fnproxy );
      },
      /**
       * Remove an event Handler from element.
       * @param {Element|window}
       * @param {String}
       * @param {Funtion}
       */
      removeHandler: function( ele, type, fn ) {
        var types = type.split( " " ),
          i = types.length - 1;
        for ( ; i >= 0; i-- ) {
          this._removeHandler( ele, types[ i ], fn );
        }
      },
      _removeHandler: function( ele, type, fn ) {
        if ( ele.removeEventListener ) ele.removeEventListener( type, fn, false );
        else if ( ele.detachEvent ) ele.detachEvent( "on" + type, fn );
        else ele[ "on" + type ] = null;
      },
      /**
       * Create an event object.
       * @param {String} - The type of event
       * @param {Event}
       */
      createEvent: function( type ) {
        var e;
        if ( document.createEvent ) {
          e = document.createEvent( type );
        } else if ( document.createEventObject ) {
          e = document.createEventObject();
        }
        return e;
      },
      /**
       * Dispatch an event.
       * @param {Element|window} - Dispatch an event from this element.
       * @param {Event}
       * @param {String} - The type of event
       */
      dispatchEvent: function( ele, event, type ) {
        if ( ele.dispatchEvent ) {
          ele.dispatchEvent( event );
        } else if ( ele.fireEvent ) {
          ele.fireEvent( "on" + type, event, false );
        }
      },
      /**
       * Get char code.
       * @param {Event}
       * @returns {Number}
       */
      getCharCode: function( e ) {
        return ( e.keyCode ? e.keyCode : ( e.which || e.charCode ) ) || 0;
      },
      /**
       * Get event.
       * @param {Event}
       * @returns {Event}
       */
      getEvent: function( e ) {
        return e || window.event;
      },
      /**
       * Get event target.
       * @param {Event}
       * @returns {Element|window}
       */
      getTarget: function( e ) {
        return e.srcElement || e.target;
      },
      imitation: {
        _keySettings: {
          bubbles: true,
          cancelable: true,
          view: document.defaultView,
          detail: 0,
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false,
          keyCode: 0,
          charCode: 0
        },
        eventList: domEventList,
        _editKeyCharCode: function( setting ) {
          var code = event.document.getCharCode( setting );
          delete setting.charCode;
          delete setting.keyCode;
          delete setting.which;

          if ( client.engine.webkit ) {
            setting.charCode = code;
          } else if ( client.engine.ie ) {
            setting.charCode = code;
          } else {
            setting.keyCode = setting.which = code;
          }
        },
        /**
         * Trigger Element keyboard event.
         * @param {Element|window}
         * @param {String}
         * @param {Object}
         */
        key: function( ele, type, paras ) {
          var eventF = event.document,
            createEvent = eventF.createEvent,
            settings = utilExtend.extend( {}, eventF.imitation._keySettings, paras ),
            opt = settings,
            e, i, name;
          eventF.imitation._editKeyCharCode( settings );
          if ( client.browser.firefox ) {
            e = createEvent( "KeyEvents" );
            e.initKeyEvent( type, opt.bubbles, opt.cancelable, opt.view, opt.ctrlKey, opt.altKey, opt.shiftKey, opt.metaKey, opt.keyCode, opt.charCode );
          } else if ( client.browser.ie678 ) {
            e = createEvent();
            for ( i in settings ) {
              e[ i ] = settings[ i ];
            }
          } else {
            name = "Events";
            client.browser.safari && client.browser.safari < 3 && ( name = "UIEvents" );
            e = createEvent( name );
            e.initEvent( type, settings.bubbles, settings.cancelable );
            delete settings.bubbles;
            delete settings.cancelable;

            for ( i in settings ) {
              e[ i ] = settings[ i ];
            }
          }
          eventF.dispatchEvent( ele, e, type );

        },
        _mouseSettings: {
          bubbles: true,
          cancelable: true,
          view: document.defaultView,
          detail: 0,
          screenX: 0,
          screenY: 0,
          clientX: 0,
          clientY: 0,
          ctrlKey: false,
          altKey: false,
          metaKey: false,
          shiftKey: false,
          button: 0,
          relatedTarget: null
        },
        /**
         * Trigger Element mouse event.
         * @param {Element|window}
         * @param {String}
         * @param {Object}
         */
        mouse: function( ele, type, paras ) {
          var eventF = event.document,
            createEvent = eventF.createEvent,
            settings = utilExtend.extend( {}, eventF.imitation._mouseSettings, paras ),
            e, i = settings;
          if ( client.browser.safari && client.browser.safari < 3 ) {
            e = createEvent( "UIEvents" );
            e.initEvent( type, settings.bubbles, settings.cancelable );
            delete settings.bubbles;
            delete settings.cancelable;
            for ( i in settings ) {
              e[ i ] = settings[ i ];
            }
          } else if ( client.browser.ie678 ) {
            e = createEvent();
            for ( i in settings ) {
              e[ i ] = settings[ i ];
            }
          } else {
            e = createEvent( "MouseEvents" );
            e.initMouseEvent( type, i.bubbles, i.cancelable, i.view, i.detail, i.screenX, i.screenY, i.clientX, i.clientY, i.ctrlKey, i.altKey, i.metaKey, i.shiftKey, i.button, i.relatedTarget );
          }
          eventF.dispatchEvent( ele, e, type );

        },
        _htmlSettings: {
          bubbles: true,
          cancelable: true
        },
        /**
         * Trigger Element HTML event. Like: blur focus focusin focusout.
         * @param {Element|window}
         * @param {String}
         * @param {Object}
         */
        html: function( ele, type, paras ) {
          var eventF = event.document,
            createEvent = eventF.createEvent,
            settings = utilExtend.extend( {}, eventF.imitation._htmlSettings, paras ),
            e, i = settings;

          if ( client.browser.ie678 ) {
            e = createEvent();
            for ( i in settings ) {
              e[ i ] = settings[ i ];
            }
          } else {
            e = createEvent( "HTMLEvents" );
            e.initEvent( type, settings.bubbles, settings.cancelable );
            delete settings.bubbles;
            delete settings.cancelable;
            for ( i in settings ) {
              e[ i ] = settings[ i ];
            }
          }

          eventF.dispatchEvent( ele, e, type );

        }
      },
      /**
       * Prevent default.
       * @param {Event}
       */
      preventDefault: function( e ) {
        if ( e.preventDefault ) e.preventDefault();
        else e.returnValue = false;
      },
      /**
       * Stop propagation.
       * @param {Event}
       */
      stopPropagation: function( e ) {
        if ( e.stopPropagation ) e.stopPropagation();
        else e.cancelBubble = true;
      },
      /**
       * Get button code from mouse clicking.
       * @param {Event}
       * @param {Number}
       */
      getButton: function( e ) {
        if ( document.implementation.hasFeature( "MouseEvents", "2.0" ) ) return e.button;
        else {
          switch ( e.button ) {
            case 0:
            case 1:
            case 3:
            case 5:
            case 7:
              return 0;
            case 2:
            case 6:
              return 2;
            case 4:
              return 1;
          }
        }
      },
      /**
       * Add an event handler to element.
       * @param {Element|window}
       * @param {String}
       * @param {Funtion}
       */
      on: function( ele, type, fn ) {
        return this.addHandler( ele, type, fn );
      },
      /**
       * Remove an event handler from element.
       * @param {Element|window}
       * @param {String}
       * @param {Funtion}
       */
      off: function( ele, type, fn ) {
        return this.removeHandler( ele, type, fn );
      }
    },

    /**
     * Listen error form window.
     * @returns {this}
     */
    error: function() {
      event.document.addHandler( window, "error", function( e, url, line ) {
        var msg = e.message || "no message",
          filename = e.filename || e.sourceURL || e.stacktrace || url;
        line = e.lineno || e.lineNumber || e.number || e.lineNumber || e.line || line;
        $.logger( "line", line, "message", msg, "at", filename );
      } );
      return this;
    },

    _initHandler: function( ele ) {
      var data = utilData.get( ele, _handlersKey );
      if ( !data ) {
        data = new CustomEvent();
        utilData.set( ele, _handlersKey, data );
      }
      return data;
    },
    _destroyHandler: function( ele ) {
      var data = utilData.get( ele, _handlersKey );
      if ( data && data.isEmpty() ) {
        utilData.removeData( ele, _handlersKey );
        if ( !utilData.hasData( ele ) ) {
          utilData.removeData( ele );
        }
      }
      return data;
    },
    /**
     * Remove toggle event.
     * @variation 1
     * @memberOf module:main/event
     * @method toggle
     * @example
     * $("#a").toggle();
     * @returns {this}
     */

    /**
     * Toggle event.
     * @param {Element|window}
     * @param {...Function} - Handelrs.
     * @returns {this}
     * @example
     * var test1 = $("#a")[0];
     * event.toggle(test1, function() {
     *   alert(1);
     * }, function() {
     *   alert(2);
     * });
     */
    toggle: function( ele, funParas ) {
      var arg = $.util.argToArray( arguments, 1 ),
        index = 0,
        data;
      if ( arg.length > 1 ) {
        if ( data = utilData.get( ele, _toggleKey ) ) {
          arg = data.arg.concat( arg );
          index = data.index;
        }

        utilData.set( ele, _toggleKey, {
          index: index,
          arg: arg
        } );

        event.addHandler( ele, "click", this._toggle );
      } else {
        utilData.removeData( ele, _toggleKey );
        event.removeHandler( ele, "click", this._toggle );
      }
      return this;
    },
    _toggle: function( e ) {
      var self = event.document.getTarget( e ),
        data = utilData.get( self, _toggleKey ),
        arg = data.arg,
        len = arg.length,
        index = data.index % len;

      arg[ index ].call( self, e );
      utilData.set( self, _toggleKey, {
        index: index + 1,
        arg: arg
      } );
    },
    /**
     * Trigger an native or custom event.
     * @example
     * var test1 = $("#a");
     * var fn1 = function(str) {
     *   $.logger(typed.isEvent(str));
     *   $.logger({}.toString.call(str));
     * }
     * test1.on("mousedown", fn1);
     * test1.trigger("mousedown", {
     *   screenX: 4
     * });
     * test1.on("my.test1", fn1);
     * test1.trigger("my.test1", {
     *   screenX: 5
     * });
     * @param {Element|window}
     * @param {String}
     * @param {Object} - Function context.
     * @param {...Object} - If you trigger a document event, the parameter must be a {}.
     * @returns {this}
     */
    trigger: function( ele, type, context, paras ) {
      if ( typed.isElement( ele ) || typed.isWindow( ele ) ) {
        var data;
        if ( data = domEventList[ type ] ) {
          type = eventHooks.type( type );
          typed.isFunction( data ) ? data( ele, type, paras ) : $.logger( "trigger", "triggering" + type + " is not supported" );
        } else if ( data = utilData.get( ele, _handlersKey ) ) {
          data.trigger.apply( data, [ type, context ].concat( $.util.argToArray( arguments, 3 ) ) );
        }
      }
      return this;
    }
  };

  utilExtend.easyExtend( event, {
    /**
     * Alias addHandler.
     * @memberOf module:main/event
     * @method
     * @param {Element|window}
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    on: event.addHandler,
    /**
     * Alias removeHandler.
     * @memberOf module:main/event
     * @method
     * @param {Element|window}
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    off: event.removeHandler,
    /**
     * Alias clearHandlers.
     * @memberOf module:main/event
     * @method
     * @param {Element|window}
     * @param {String} [type] - If type is undefined then clear all handlers.
     * @returns {this}
     */
    clear: event.clearHandlers
  } );

  var bus = new CustomEvent();

  $.extend( /** @lends aQuery */ {
    /**
     * Add an event Handler to bus.
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    addHandler: function( type, fn ) {
      bus.addHandler( type, fn );
      return this;
    },
    /**
     * Remove an event Handler from bus.
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    removeHandler: function( type, fn ) {
      bus.removeHandler( type, fn );
    },
    /**
     * Clear all event Handler from bus.
     * @param {String} - "click", "swap.down"
     * @returns {this}
     */
    clearHandlers: function( type ) {
      bus.clearHandlers( type );
      return this;
    },
    /**
     * Has the element an event handler.
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    hasHandler: function( type, fn ) {
      return bus.hasHandler( type, fn );
    },
    /**
     * Trigger an event to bus.
     * @param {Element|window}
     * @param {String}
     * @param {Object} - Function context.
     * @param {...Object}
     * @returns {this}
     */
    trigger: function() {
      bus.trigger.apply( bus, arguments );
      return this;
    },
    /**
     * Add a event Handler to element and do once.
     * <br /> It will remove handler after done.
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    once: function( type, fn ) {
      bus.once( type, fn );
      return this;
    },

    /** {CustomEvent} */
    bus: bus,

    /**
     * Add "ajaxStart" event Handler to bus.
     * @param {Function}
     * @returns {this}
     */
    ajaxStart: function( fn ) {
      return $.addHandler( "ajaxStart", fn );
    },
    /**
     * Add "ajaxStop" event Handler to bus.
     * @param {Function}
     * @returns {this}
     */
    ajaxStop: function( fn ) {
      return $.addHandler( "ajaxStop", fn );
    },
    /**
     * Add "getJSStart" event Handler to bus.
     * @param {Function}
     * @returns {this}
     */
    getJSStart: function( fn ) {
      return $.addHandler( "jsonpStart", fn );
    },
    /**
     * Add "jsonpStop" event Handler to bus.
     * @param {Function}
     * @returns {this}
     */
    jsonpStop: function( fn ) {
      return $.addHandler( "jsonpStop", fn );
    }
  } );

  $.extend( {
    /**
     * Add an event Handler to bus.
     * @memberOf aQuery
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    on: $.addHandler,
    /**
     * Remove an event Handler from bus.
     * @memberOf aQuery
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    off: $.removeHandler,
    /**
     * Clear all event Handler from bus.
     * @memberOf aQuery
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    clear: $.clearHandlers
  } );

  $.fn.extend( /** @lends aQuery.prototype */ {
    /**
     * Add an event Handler to elements.
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    addHandler: function( type, fn ) {
      if ( !typed.isString( type ) || !( typed.isFunction( fn ) || fn === null ) ) return this;
      return this.each( function( ele ) {
        event.addHandler( ele, type, fn );
      } );
    },
    /**
     * Add a event Handler to elements and do once.
     * <br /> It will remove handler after done.
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    once: function( type, fn ) {
      if ( !typed.isString( type ) || !( typed.isFunction( fn ) || fn === null ) ) return this;
      return this.each( function( ele ) {
        event.once( ele, type, fn );
      } );
    },
    /**
     * Clear all event Handler from elements.
     * @param {String} - "click", "swap.down"
     * @returns {this}
     */
    clearHandlers: function( type ) {
      return this.each( function( ele ) {
        event.clearHandlers( ele, type );
      } );
    },
    /**
     * Has the first element an event handler.
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    hasHandler: function( type, fn ) {
      return event.hasHandler( this[ 0 ], type, fn );
    },
    /**
     * Delegate children event handler from parentNode.
     * @param {String} - "div>a"
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    delegate: function( selector, type, fn ) {
      return this.each( function( parentNode ) {
        event.addHandler( parentNode, type, function( e ) {
          var
            eleCollection = query.find( selector, parentNode ),
            target = event.document.getTarget( e ),
            ret = array.inArray( eleCollection || [], target );

          if ( ret > -1 ) {
            fn.call( target, e );
          }

        } );
      } );
    },
    /**
     * Remove an event Handler from elements.
     * @param {String} - "click", "swap.down"
     * @param {Function}
     * @returns {this}
     */
    removeHandler: function( type, fn ) {
      if ( !typed.isString( type ) || !typed.isFunction( fn ) ) return this;
      return this.each( function( ele ) {
        event.removeHandler( ele, type, fn );
      } );
    },
    _initHandler: function() {
      return this.each( function( ele ) {
        event._initHandler( ele );
      } );
    },
    /**
     * Toggle event.
     * @example
     * var test1 = $("#a");
     * test1.toggle(function() {
     *   alert(1)
     * }, function() {
     *   alert(2)
     * });
     * @param {Element|window}
     * @param {...Function} - Handelrs.
     * @returns {this}
     */
    toggle: function( funParas ) {
      var arg = typed.isArray( funParas ) ? funParas : $.util.argToArray( arguments, 0 ),
        temp, i = 0,
        ele;
      for ( ; ele = this.eles[ i++ ]; ) {
        temp = arg.concat();
        temp.splice( 0, 0, ele );
        event.toggle.apply( event, temp );
      }
      return this;
    },
    /**
     * Trigger an event from elements.
     * @param {String}
     * @param {Object} - Function context.
     * @param {...Object}
     * @returns {this}
     */
    trigger: function( type, context ) {
      var arg = $.util.argToArray( arguments );
      return this.each( function( ele ) {
        event.trigger.apply( null, [ ele ].concat( arg ) );
      } );
    },
    /**
     * Add "blur" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    blur: function( fn ) {
      return this.addHandler( "blur", fn );
    },
    /**
     * Add "focus" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    focus: function( fn ) {
      return this.addHandler( "focus", fn );
    },
    /**
     * Add "focusin" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    focusin: function( fn ) {
      return this.addHandler( "focusin", fn );
    },
    /**
     * Add "focusout" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    focusout: function( fn ) {
      return this.addHandler( "focusout", fn );
    },
    /**
     * Add "load" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    load: function( fn ) {
      return this.addHandler( "load", fn );
    },
    /**
     * Add "resize" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    resize: function( fn ) {
      return this.addHandler( "resize", fn );
    },
    /**
     * Add "resize" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    scroll: function( fn ) {
      return this.addHandler( "scroll", fn );
    },
    /**
     * Add "unload" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    unload: function( fn ) {
      return this.addHandler( "unload", fn );
    },
    /**
     * Add "click" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    click: function( fn ) {
      return this.addHandler( "click", fn );
    },
    /**
     * Add "dblclick" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    dblclick: function( fn ) {
      return this.addHandler( "dblclick", fn );
    },
    /**
     * Add "mousedown" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    mousedown: function( fn ) {
      return this.addHandler( "dblclick", fn );
    },
    /**
     * Add "mouseup" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    mouseup: function( fn ) {
      return this.addHandler( "mouseup", fn );
    },
    /**
     * Add "mousemove" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    mousemove: function( fn ) {
      return this.addHandler( "mousemove", fn );
    },
    /**
     * Add "mouseover" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    mouseover: function( fn ) {
      return this.addHandler( "mouseover", fn );
    },
    /**
     * Add "mouseout" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    mouseout: function( fn ) {
      return this.addHandler( "mouseout", fn );
    },
    /**
     * Add "mouseenter" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    mouseenter: function( fn ) {
      return this.addHandler( "mouseover", function( e ) {
        fn.apply( this, arguments );
        event.document.stopPropagation( e );
      } );
    },
    /**
     * Add "mouseleave" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    mouseleave: function( fn ) {
      return this.blur( "mouseout", function( e ) {
        fn.apply( this, arguments );
        event.document.stopPropagation( e );
      } );
    },
    /**
     * Add "mousewheel" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    mousewheel: function( fn ) {
      return this.addHandler( "mousewheel", function( e ) {
        e = event.document.getEvent( e );
        var delta = 0;
        if ( e.wheelDelta ) delta = e.wheelDelta / 120;
        if ( e.detail ) delta = -e.detail / 3;
        delta = Math.round( delta );
        if ( delta ) fn.call( this, delta );
        event.document.stopPropagation( e );
      } );
    },
    /**
     * Add "touchwheel" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    touchwheel: function( fn ) {
      return this.addHandler( "mousewheel", function( e ) {
        e = event.document.getEvent( e );
        var delta = 0,
          direction = "y";
        if ( e.wheelDelta ) {
          delta = e.wheelDelta;
          if ( e.wheelDeltaX ) {
            direction = "x";
          }
          if ( e.wheelDeltaY ) {
            direction = "y";
          }
        } else if ( e.detail ) {
          delta = -e.detail * 40; //40也许太多
        }
        if ( e.axis ) {
          direction = e.axis == 1 ? "x" : "y";
        }
        e.delta = delta;
        e.direction = direction;

        event.document.stopPropagation( e );
        event.document.preventDefault( e );

        // if (e.type == "DOMMouseScroll") {
        //     e.type = "mousewheel";
        // };
        fn.call( this, e );
      } );
    },
    /**
     * Add "change" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    change: function( fn ) {
      return this.addHandler( "mouseout", fn );
    },
    /**
     * Add "select" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    select: function( fn ) {
      return this.addHandler( "mouseout", fn );
    },
    /**
     * Add "submit" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    submit: function( fn ) {
      return this.addHandler( "mouseout", fn );
    },
    /**
     * Add "keydown" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    keydown: function( fn ) {
      return this.addHandler( "keydown", function( e ) {
        client.browser.firefox && e.keyCode || ( e.keyCode = e.which );
        e.charCode === undefined && ( e.charCode = e.keyCode );
        fn.call( this, e );
      } );
    },
    /**
     * Add "keypress" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    keypress: function( fn ) {
      return this.addHandler( "keypress", function( e ) {
        client.browser.firefox && e.keyCode || ( e.keyCode = e.which );
        e.charCode === undefined && ( e.charCode = e.keyCode );
        fn.call( this, e, String.fromCharCode( e.charCode ) );
      } );
    },
    /**
     * Add "keyup" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    keyup: function( fn ) {
      return this.addHandler( "mouseout", fn );
    },
    /**
     * Add "keyup" event handler to elements.
     * @param {Function}
     * @returns {this}
     */
    error: function( fn ) {
      return this.addHandler( "error", fn );
    }
  } );

  $.fn.extend( {
    on: $.fn.addHandler,
    off: $.fn.removeHandler,
    clear: $.fn.clearHandlers
  } );

  for ( i = 0, len = mouse.length; i < len; i++ ) {
    domEventList[ mouse[ i ] ] = event.document.imitation.mouse;
  }
  for ( i = 0, len = mutation.length; i < len; i++ ) {
    domEventList[ mutation[ i ] ] = 1;
  }
  for ( i = 0, len = key.length; i < len; i++ ) {
    domEventList[ key[ i ] ] = event.document.imitation.key;
  }
  for ( i = 0, len = html.length; i < len; i++ ) {
    domEventList[ html[ i ] ] = event.document.imitation.html;
  }
  for ( i = 0, len = other.length; i < len; i++ ) {
    domEventList[ other[ i ] ] = 1;
  }
  for ( i = 0, len = mobile.length; i < len; i++ ) {
    domEventList[ mobile[ i ] ] = 1;
  }

  return event;
} );