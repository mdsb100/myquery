aQuery.define( "@app/controller/index", [ "app/Controller", "@app/view/index" ], function( $, SuperController, IndexView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( id, contollerElement ) {
      this._super( id, contollerElement, IndexView );

    },
    onReady: function( ) {
      console.log( "index load" );
      var self = this;
      this.navmenu.on( "navmenu.select", function( e ) {
        debugger
        self.content.loadPath( e.path );
      } );
      this.navmenu.on( "navmenu.dblclick", function( e ) {
        self.content.openWindow( );
      } );
    },
    onDestory: function( ) {
      this.navmenu.clearHandlers( );
    }
  }, {

  } );

  return Controller;
} );