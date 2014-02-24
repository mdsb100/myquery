﻿aQuery.define( "main/parse", [ "main/dom" ], function( $, dom ) {
	"use strict";
	var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;

	function createDocument() {
		if ( typeof createDocument.activeXString != "string" ) {
			var i = 0,
				versions = [ "Microsoft.XMLDOM", "MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.5.0", "MSXML2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0", "MSXML2.DOMDocument" ],
				len = versions.length,
				xmlDom;
			for ( ; i < len; i++ ) {
				try {
					xmlDom = new ActiveXObject( versions[ i ] );
					createDocument.activeXString = versions[ i ];
					return xmlDom;
				} catch ( e ) {

				}
			}
		}
		return new ActiveXObject( createDocument.activeXString );
	};

	/**
	 * @pubilc
	 * @exports main/parse
	 * @requires module:main/dom
	 */
	var parse = {
		/**
		 * @param {String}
		 * @returns {JSON}
		 */
		JSON: function( data ) {
			if ( typeof data !== "string" || !data ) {
				return null;
			}
			// Make sure the incoming data is actual JSON
			// Logic borrowed from http://json.org/json2.js
			if ( /^[\],:{}\s]*$/.test( data.replace( /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@" )
				.replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]" )
				.replace( /(?:^|:|,)(?:\s*\[)+/g, "" ) ) ) {

				// Try to use the native JSON parser first
				return window.JSON && window.JSON.parse ?
					window.JSON.parse( data ) :
					( new Function( "return " + data ) )();

			} else {
				throw new Error( "Invalid JSON: " + data, "EvalError" );
			}
			return null;
		},
		/**
		 * Data: string of html.
		 * @param {String}
		 * @param {String|Boolean} [context] - If specified, the fragment will be created in this context, defaults to document.
		 * @param {Boolean} [keepScripts] - If true, will include scripts passed in the html string.
		 * @returns {JSON}
		 */
		HTML: function( data, context, keepScripts ) {
			if ( !data || typeof data !== "string" ) {
				return null;
			}
			if ( typeof context === "boolean" ) {
				keepScripts = context;
				context = false;
			}
			context = context || document;

			var parsed = rsingleTag.exec( data ),
				scripts = !keepScripts && [];

			// Single tag
			if ( parsed ) {
				return [ context.createElement( parsed[ 1 ] ) ];
			}

			parsed = dom.buildFragment( [ data ], context, scripts );
			if ( scripts ) {
				$( scripts ).remove();
			}
			return $.merge( [], parsed.childNodes );
		},
		/**
		 * @example
		 * parse.QueryString("name=Jarry&age=27")
		 * //{
		 * //  name: "Jarry",
		 * //  name: "27"
		 * //}
		 * @param {String}
		 * @param {String} [split1="&"]
		 * @param {String} [split2="="]
		 * @returns {Object}
		 */
		QueryString: function( str, split1, split2 ) {
			var qs = str || ( location.search.length > 0 ? location.search.substring( 1 ) : "" ),
				args = {};
			if ( qs ) {
				$.each( qs.split( split1 || "&" ), function( item ) {
					item = item.split( split2 || "=" );
					if ( item[ 1 ] !== undefined ) {
						args[ decodeURIComponent( item[ 0 ] ) ] = decodeURIComponent( item[ 1 ] );
					}
				} );
			}
			return args;
		},
		/**
		 * @param {String}
		 * @returns {Document}
		 */
		XML: ( function( xml ) {
			var parseXML;
			if ( typeof DOMParser != "undefined" ) {
				parseXML = function( xml ) {
					var xmldom = ( new DOMParser() ).parseFromString( xml, "text/xml" ),
						errors = xmldom.getElementsByTagName( "parsererror" );
					if ( errors.length ) {
						throw new Error( "parseXML: " + errors[ 0 ].textContent + " SyntaxError" )
					}
					return xmldom;
				};
			} else if ( document.implementation.hasFeature( "LS", "3.0" ) ) {
				parseXML = function( xml ) {
					var implementation = document.implementation,
						parser = implementation.createLSParser( implementation.MODE_SYNCHRONOUS, null ),
						input = implementation.createLSInput();
					input.stringData = xml;
					return parser.parse( input );
				};
			} else if ( typeof ActiveXObject != "undefined" ) {
				parseXML = function( xml ) {
					var xmldom = createDocument();
					xml.async = "false";
					xmldom.loadXML( xml );
					if ( xmldom.parseError != 0 ) {
						throw new Error( "parseXML: " + xmldom.parseError.reason + " SyntaxError" )
					}
					return xmldom;
				};
			} else {
				throw ( "No XML parser available", "Error" );
			}
			return parseXML;
		} )()
	};

	return parse;
} );