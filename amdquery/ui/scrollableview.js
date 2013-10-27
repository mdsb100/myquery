aQuery.define( "ui/scrollableview", [
  "base/config",
  "base/client",
  "base/support",
  "main/query",
  "main/css",
  "main/event",
  "main/position",
  "main/dom",
  "main/class",
  "html5/css3",
  "html5/animate.transform",
  "html5/css3.transition.animate",
  "module/Widget",
  "module/FX",
  "module/animate",
  "module/tween.extend",
  "module/Keyboard",
  "ui/swappable",
  "ui/draggable",
  "ui/keyboard" ], function( $,
  config,
  client,
  support,
  query,
  css,
  event,
  position,
  dom,
  cls,
  css3,
  animateTransform,
  css3Transition,
  Widget,
  FX,
  animate,
  tween,
  Keyboard,
  swappable,
  draggable,
  keyboard, undefined ) {
  "use strict"; //启用严格模式
  Widget.fetchCSS( "ui/css/scrollableview" );
  var isTransform3d = !! config.ui.isTransform3d && support.transform3d;

  var scrollableview = Widget.extend( "ui.scrollableview", {
    container: null,
    create: function( ) {
      var opt = this.options;
      this.positionParent = $( {
        "overflow": "visible"
      }, "div" ).width( this.target.width( ) ).height( this.target.height( ) ).append( this.target.children( ) );

      this.container = $( {
        "position": "absolute"
      }, "div" ).append( this.positionParent ).appendTo( this.target );

      this.target.uiSwappable( );

      this.target.find( "a[float=false]" ).css( {
        position: "absolute",
        zIndex: 1000
      } ).appendTo( this.target );

      this.statusBarX = $( {
        height: "10px",
        display: "none",
        position: "absolute",
        bottom: "0px"
      }, "div" ).addClass( "aquery-scrollableViewStatusBar" ).appendTo( this.target );

      this.statusBarY = $( {
        width: "10px",
        display: "none",
        position: "absolute",
        right: "0px"
      }, "div" ).addClass( "aquery-scrollableViewStatusBar" ).appendTo( this.target );

      if ( opt.enableKeyboard ) {
        this.target.uiKeyboard( );
      }

      this.container.uiDraggable( {
        keepinner: 1,
        innerWidth: opt.boundary,
        innerHeight: opt.boundary,
        stopPropagation: false,
        vertical: this._isAllowedDirection( "V" ),
        horizontal: this._isAllowedDirection( "H" ),
        container: this.target,
        overflow: true
      } );

      this.refreshPosition( ).refreshContainerSize( );

      isTransform3d && this.container.initTransform3d( );

      return this;
    },
    event: function( ) {},
    enable: function( ) {
      var event = this.event,
        opt = this.options;
      this.container.on( "DomNodeInserted DomNodeRemoved drag.pause drag.move drag.start", event );
      this.container.uiDraggable( "enable" );
      this.target.on( "swap.move swap.stop swap.pause", event ).touchwheel( event );
      this.target.uiSwappable( "enable" );
      this.target.delegate( "a[href^=#]", "click", event );

      if ( opt.enableKeyboard ) {
        this.target.uiKeyboard( "addKey", {
          type: "keyup",
          keyCode: [ "Up", "Right", "Down", "Left" ],
          combinationKey: opt.combinationKey.split( /;|,/ ),
          todo: event
        } );
        this.target.uiKeyboard( "enable" );
      }

      opt.disabled = true;
      return this;
    },
    disable: function( ) {
      var event = this.event,
        opt = this.options;
      this.container.off( "DomNodeInserted DomNodeRemoved drag.pause drag.move drag.start", event );
      this.container.uiDraggable( "disable" );
      this.target.off( "swap.move swap.stop swap.pause", event ).off( "touchwheel", event );
      this.target.uiSwappable( "disable" );
      this.target.off( "click", event );

      if ( opt.enableKeyboard ) {
        this.target.uiKeyboard( "removeKey", {
          type: "keyup",
          keyCode: [ "Up", "Right", "Down", "Left" ],
          combinationKey: opt.combinationKey.split( /;|,/ ),
          todo: event
        } );
        this.target.uiKeyboard( "disable" );
      }

      opt.disabled = false;
      return this;
    },
    _initHandler: function( ) {
      var self = this,
        target = self.target,
        opt = self.options,
        check = function( ) {
          self.toHBoundary( self.getLeft( ) ).toVBoundary( self.getTop( ) ).hideStatusBar( );
        };

      var
      keyItem = {
        type: "keyup",
        keyCode: "Up",
        combinationKey: opt.combinationKey.split( /;|,/ )
      },
        keyList = [ "Up", "Right", "Down", "Left" ],
        keyType = {};

      for ( var i = keyList.length - 1; i >= 0; i-- ) {
        keyItem.keyCode = keyList[ i ]
        keyType[ keyList[ i ] ] = Keyboard.getHandlerName( keyItem );
      }

      this.event = function( e ) {
        switch ( e.type ) {
          case "drag.move":
            var x = self.checkXBoundary( e.offsetX, opt.boundary ),
              y = self.checkYBoundary( e.offsetY, opt.boundary );
            self.renderStatusBar( self.checkXStatusBar( x ), self.checkYStatusBar( y ) );
            self.showStatusBar( );
            break;
          case "drag.pause":
            var left = self.getLeft( ),
              top = self.getTop( ),
              distance = opt.pullDistance;

            if ( left > distance ) {
              e.type = self.getEventName( "pullleft" );
              target.trigger( e.type, this, e );
            } else if ( left < -self.overflowWidth - distance ) {
              e.type = self.getEventName( "pullright" );
              target.trigger( e.type, this, e );
            }
            if ( top > distance ) {
              e.type = self.getEventName( "pulldown" );
              target.trigger( e.type, this, e );
            } else if ( top < -self.overflowHeight - distance ) {
              e.type = self.getEventName( "pullup" );
              target.trigger( e.type, this, e );
            }

            break;
          case "drag.start":
            opt.enableKeyboard && target[ 0 ].focus( );
            self.stopAnimation( );
            self.refreshPosition( ).refreshContainerSize( );
            break;
          case "DomNodeInserted":
          case "DomNodeRemoved":
            self.refreshPosition( ).refreshContainerSize( ).toVBoundary( self.getTop( ) ).toHBoundary( self.getLeft( ) );
            break;
          case "swap.move":
            self.showStatusBar( );
            break;
          case "swap.stop":
            self.animate( e );
            break;
          case "swap.pause":
            self.pause( e );
            break;
          case "mousewheel":
          case "DOMMouseScroll":
            x = null;
            y = null;
            clearTimeout( self.wheelTimeId );
            //refreshContainerSize?
            self.refreshPosition( );
            // var x = null,
            // y = null;
            if ( e.direction == "x" ) {
              x = e.delta * opt.mouseWheelAccuracy;
            } else if ( e.direction == "y" ) {
              y = e.delta * opt.mouseWheelAccuracy;
            }
            self.showStatusBar( );

            self.wheelTimeId = setTimeout( check, 500 );

            self.render( x, y, true, opt.boundary );
            break;
          case "click":
            event.event.document.preventDefault( e );
            event.event.document.stopPropagation( e );

            self.refreshPosition( );

            var $a = $( this ),
              href = ( $a.attr( "href" ) || "" ).replace( "#", "" ),
              //会找所有的 可能不好
              $toElement = self.target.find( "[name=" + ( href || "__undefined" ) + "]" );

            if ( $toElement.length === 1 ) {
              var top = $toElement.getTopWithTranslate3d( ),
                left = $toElement.getLeftWithTranslate3d( );
              if ( self._isAllowedDirection( "V" ) ) {
                self.animateY( Math.max( -top + self.viewportHeight > 0 ? 0 : -top, -self.scrollHeight + self.viewportHeight ), FX.normal );
              }
              if ( self._isAllowedDirection( "H" ) ) {
                self.animateX( Math.max( -left + self.viewportHeight > 0 ? 0 : -left, -self.scrollWidth + self.viewportWidth ), FX.normal );
              }
            }

            break;

          case keyType.Up:
            self.animateY( 0, FX.normal );
            break;
          case keyType.Right:
            self.animateX( -self.scrollWidth + self.viewportWidth, FX.normal );
            break;
          case keyType.Down:
            self.animateY( -self.scrollHeight + self.viewportHeight, FX.normal );
            break;
          case keyType.Left:
            self.animateX( 0, FX.normal );
            break;
        }
      };
      return this;
    },
    destroy: function( ) {
      if ( key ) {
        this.target.destroyUiSwappable( );
        this.container.destroyUiDraggable( );
        this.target.children( ).remove( );
        this.positionParent.children( ).appendTo( this.target );
        Widget.invoke( "destroy", this );
      }
    },
    init: function( opt, target ) {
      this._super( opt, target );

      this._direction = null;

      this.originOverflow = this.target.css( "overflow" );

      this.target.attr( "amdquery-ui", "scrollableview" );
      this.target.css( {
        "overflow": "hidden",
        /*fix ie*/
        "overflow-x": "hidden",
        "overflow-y": "hidden"
      } );

      var pos = this.target.css( "position" );
      if ( pos != "relative" && pos != "absolute" ) {
        this.target.css( "position", "relative" );
      }

      return this.create( )._initHandler( ).enable( ).render( 0, 0 );
    },
    customEventName: [ "pulldown", "pullup", "pullleft", "pullright", "animationEnd" ],
    options: {
      "overflow": "HV",
      "animateDuration": 600,
      "boundary": 150,
      "boundaryDruation": 300,
      "mouseWheelAccuracy": 0.3,
      "pullDistance": 50,
      "enableKeyboard": false,
      "combinationKey": client.system.mac ? "cmd" : "ctrl"
    },
    setter: {
      "enableKeyboard": Widget.initFirst,
      "combinationKey": Widget.initFirst
    },
    publics: {
      "refreshPosition": Widget.AllowPublic,
      "showStatusBar": Widget.AllowPublic,
      "hideStatusBar": Widget.AllowPublic,
      "render": Widget.AllowPublic,
      "toH": Widget.AllowPublic,
      "toV": Widget.AllowPublic
    },
    render: function( x, y, addtion, boundary ) {
      if ( !arguments.length ) {
        return;
      }
      var position,
        originX = 0,
        originY = 0,
        statusX, statusY;

      if ( addtion ) {
        position = this.getContainerPosition( );

        originX = position.x;
        originY = position.y;
      }

      if ( x !== null && this._isAllowedDirection( "H" ) ) {
        x = this.checkXBoundary( originX + x, boundary );
        statusX = this.checkXStatusBar( x );
      }
      if ( y !== null && this._isAllowedDirection( "V" ) ) {
        y = this.checkYBoundary( originY + y, boundary );
        statusY = this.checkYStatusBar( y );
      }

      return this._render( x, statusX, y, statusY );
    },
    _render: function( x1, x2, y1, y2 ) {
      var pos = {};
      if ( x1 !== null && this._isAllowedDirection( "H" ) ) {
        pos.x = parseInt( x1 );
        this.statusBarX.setPositionX( isTransform3d, parseInt( x2 ) );
      }
      if ( y1 !== null && this._isAllowedDirection( "V" ) ) {
        pos.y = parseInt( y1 );
        this.statusBarY.setPositionY( isTransform3d, parseInt( y2 ) );
      }
      this.container.setPositionXY( isTransform3d, pos );
      return this;
    },
    renderStatusBar: function( x, y ) {
      this._isAllowedDirection( "H" ) && this.statusBarX.setPositionX( isTransform3d, parseInt( x ) );

      this._isAllowedDirection( "V" ) && this.statusBarY.setPositionY( isTransform3d, parseInt( y ) );

      return this;
    },
    getContainerPosition: function( ) {
      return {
        x: this.getLeft( ),
        y: this.getTop( )
      };
    },

    target: null,
    toString: function( ) {
      return "ui.scrollableview";
    },
    widgetEventPrefix: "scrollableview",

    refreshStatusBar: function( ) {
      var viewportWidth = this.viewportWidth,
        scrollWidth = this.scrollWidth,
        viewportHeight = this.viewportHeight,
        scrollHeight = this.scrollHeight,
        width = 0,
        height = 0;

      if ( scrollWidth != viewportWidth ) {
        this.statusBarXVisible = 1;
        width = viewportWidth * viewportWidth / scrollWidth;
      } else {
        width = this.statusBarXVisible = 0;
      }


      if ( scrollHeight != viewportHeight ) {
        this.statusBarYVisible = 1;
        height = viewportHeight * viewportHeight / scrollHeight;
      } else {
        height = this.statusBarYVisible = 0;
      }

      this.statusBarX.width( width );
      this.statusBarY.height( height );

      return this;
    },

    refreshContainerSize: function( ) {
      this.container.width( this.scrollWidth );
      this.container.height( this.scrollHeight );
      return this;
    },

    refreshPosition: function( ) {
      // add Math.max to fix ie7
      this.scrollWidth = client.browser.ie678 ? Math.max( this.positionParent.scrollWidth( ), this.container.scrollWidth( ) ) : this.positionParent.scrollWidth( );
      this.scrollHeight = client.browser.ie678 ? Math.max( this.positionParent.scrollHeight( ), this.container.scrollHeight( ) ) : this.positionParent.scrollHeight( );

      this.viewportWidth = this.target.width( );
      this.viewportHeight = this.target.height( );

      this.overflowWidth = this.scrollWidth - this.viewportWidth;
      this.overflowHeight = this.scrollHeight - this.viewportHeight;

      return this.refreshStatusBar( );
    },
    _isAllowedDirection: function( direction ) {
      return this.options.overflow.indexOf( direction ) > -1;
    },
    getTop: function( ) {
      return this.container.getPositionY( );
    },
    getLeft: function( ) {
      return this.container.getPositionX( );
    },
    pause: function( ) {

      return this;
    },
    stopAnimation: function( ) {
      this.container.stopAnimation( true );
      this.statusBarX.stopAnimation( true );
      this.statusBarY.stopAnimation( true );
      this.toVBoundary( this.getTop( ) ).toHBoundary( this.getLeft( ) );
    },
    animate: function( e ) {
      var opt = this.options,
        a0 = e.acceleration,
        t0 = opt.animateDuration - e.duration,
        s0 = Math.round( a0 * t0 * t0 * 0.5 );
      this._direction = e.direction;

      if ( t0 <= 0 ) {
        this.toVBoundary( this.getTop( ) ).toHBoundary( this.getLeft( ) );
        return this.hideStatusBar( );
      }

      switch ( e.direction ) {
        case 3:
          this.toH( -s0, t0 );
          break;
        case 9:
          this.toH( s0, t0 );
          break;
        case 6:
          this.toV( -s0, t0 );
          break;
        case 12:
          this.toV( s0, t0 );
          break;
        default:
          this.toHBoundary( this.getTop( ) ).toVBoundary( this.getLeft( ) );
      }

      return this;
    },

    checkXBoundary: function( s, boundary ) {
      var boundary = boundary !== undefined ? boundary : this.options.boundary;
      return $.between( -( this.overflowWidth + boundary ), boundary, s );
    },
    checkYBoundary: function( s, boundary ) {
      var boundary = boundary !== undefined ? boundary : this.options.boundary;
      return $.between( -( this.overflowHeight + boundary ), boundary, s );
    },

    checkXStatusBar: function( left ) {
      var result = -left / this.scrollWidth * this.viewportWidth;
      return $.between( 0, this.viewportWidth - this.statusBarX.width( ), result );
    },

    checkYStatusBar: function( top ) {
      var result = -top / this.scrollHeight * this.viewportHeight;
      return $.between( 0, this.viewportHeight - this.statusBarY.height( ), result );
    },

    showStatusBar: function( ) {
      this.statusBarXVisible && this._isAllowedDirection( "H" ) && this.statusBarX.show( );
      this.statusBarYVisible && this._isAllowedDirection( "V" ) && this.statusBarY.show( );
      return this;
    },
    hideStatusBar: function( ) {
      this.statusBarX.hide( );
      this.statusBarY.hide( );
      return this;
    },

    outerXBoundary: function( t ) {
      if ( t > 0 ) {
        return 0;
      } else if ( t < -this.overflowWidth ) {
        return -this.overflowWidth;
      }
      return null;
    },

    outerYBoundary: function( t ) {
      if ( t > 0 ) {
        return 0;
      } else if ( t < -this.overflowHeight ) {
        return -this.overflowHeight;
      }
      return null;
    },

    _triggerAnimate: function( scene, direction, duration, distance ) {
      var type = this.getEventName( "animationEnd" );
      this.target.trigger( type, this.container[ 0 ], {
        type: type,
        scene: scene,
        direction: direction,
        duration: duration,
        distance: distance
      } );
    },

    toHBoundary: function( left ) {
      var outer = this.outerXBoundary( left ),
        self = this;

      if ( outer !== null ) {
        this.container.animate( $.getPositionAnimationOptionProxy( isTransform3d, outer ), {
          duration: this.options.boundaryDruation,
          easing: "expo.easeOut",
          queue: false,
          complete: function( ) {
            self.hideStatusBar( );
            self._triggerAnimate( "boundary", self._direction, self.options.boundaryDruation, outer );
          }
        } );
      } else {
        this.statusBarX.hide( );
      }
      return this;
    },

    toVBoundary: function( top ) {
      var outer = this.outerYBoundary( top ),
        self = this;
      if ( outer !== null ) {
        this.container.animate( $.getPositionAnimationOptionProxy( isTransform3d, undefined, outer ), {
          duration: this.options.boundaryDruation,
          easing: "expo.easeOut",
          queue: false,
          complete: function( ) {
            self.hideStatusBar( );
            self._triggerAnimate( "boundary", self._direction, self.options.boundaryDruation, outer );
          }
        } );
      } else {
        this.statusBarY.hide( );
      }
      return this;
    },

    toH: function( s, t, d ) {
      return this._isAllowedDirection( "H" ) ? this.animateX( this.checkXBoundary( this.getLeft( ) - s ), t, d ) : this;
    },
    toV: function( s, t, d ) {
      return this._isAllowedDirection( "V" ) ? this.animateY( this.checkYBoundary( this.getTop( ) - s ), t, d ) : this;
    },
    animateY: function( y1, t ) {
      var opt = $.getPositionAnimationOptionProxy( isTransform3d, undefined, y1 );
      var self = this,
        y2 = this.checkYStatusBar( parseFloat( opt.top ) );

      this.container.animate( opt, {
        duration: t,
        easing: "easeOut",
        complete: function( ) {
          self.toHBoundary( self.getLeft( ) ).toVBoundary( y1 );
          self._triggerAnimate( "inner", self._direction, t, y1 );
        }
      } );

      this.statusBarY.animate( $.getPositionAnimationOptionProxy( isTransform3d, undefined, y2 ), {
        duration: t,
        easing: "easeOut"
      } );
      return this;
    },
    animateX: function( x1, t ) {
      var opt = $.getPositionAnimationOptionProxy( isTransform3d, x1 );
      //也有可能要移动之后
      var self = this,
        x2 = this.checkXStatusBar( parseFloat( opt.left ) );

      this.container.animate( opt, {
        duration: t,
        easing: "easeOut",
        complete: function( ) {
          self.toHBoundary( x1 ).toVBoundary( self.getTop( ) );
          self._triggerAnimate( "inner", self._direction, t, x1 );
        }
      } );

      this.statusBarX.animate( $.getPositionAnimationOptionProxy( isTransform3d, x2 ), {
        duration: t,
        easing: "easeOut"
      } );
      return this;
    }
  } );

  return scrollableview;
} );