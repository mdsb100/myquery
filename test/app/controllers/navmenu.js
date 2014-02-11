aQuery.define( "@app/controllers/navmenu", [ "app/Controller", "@app/views/navmenu" ], function( $, SuperController, NavmenuView ) {
	"use strict"; //启用严格模式
	var Controller = SuperController.extend( {
		init: function( contollerElement, models ) {
			this._super( new NavmenuView( contollerElement ), models );

			var controller = this;
			this.$nav = $( this.view.topElement ).find( "#nav" );

			var li = $( $.createEle( "li" ) ).uiNavitem( {
				html: "destroyWidget",
				img: "class"
			} );
			var parentNode = this.$nav.uiNavmenu( "getNavItemsByHtmlPath", [ "ui" ] );
			this.$nav.uiNavmenu( "addNavItem", li, parentNode );

			this.$nav.on( "navmenu.select", function( e ) {
				var target = $( e.navitem ),
					ret = target.uiNavitem( "getOptionToRoot" ),
					path;
				if ( ret.length > 1 ) {
					ret.push( "test", ".." );
					path = $.getPath( ret.reverse().join( "/" ), ".html" );
					controller.trigger( "navmenu.select", controller, {
						type: "navmenu.select",
						path: path
					} );
				}
			} );

			this.$nav.on( "dblclick", function( e ) {
				controller.trigger( "navmenu.dblclick", controller, {
					type: "navmenu.dblclick",
					event: e
				} );
			} );

		},
		selectDefaultNavmenu: function( target ) {
			var ret = "ScrollableView-navItem";
			if ( target ) {
				var navItem = this.$nav.uiNavmenu( "getNavItemsByHtmlPath", target.split( /\W/ ) )[ 0 ];
				ret = navItem || ret;
			}
			this.$nav.uiNavmenu( "selectNavItem", ret );
		},
		destroy: function() {
			this.$nav.clearHandlers();
			this.$nav = null;
			SuperController.invoke( "destroy" );
		}
	}, {

	} );

	return Controller;
} );