/**
 * @overview AMDQuery JavaScript Library
 * @copyright 2012, Cao Jun
 * @version 1.0.0
 */



( function( window, undefined ) {
	"use strict"; //启用严格模式
	var
	core_slice = [].slice,
		core_splice = [].splice;

	var
	version = "AMDQuery 1.0.0",
		/**
		 * @private
		 * @namespace util
		 */
		util = /** @lends util */ {
			/**
			 * Arguments to Array
			 * @param {Arguments}
			 * @param {Number}
			 * @param {Number}
			 * @returns {Array}
			 */
			argToArray: function( arg, start, end ) {
				return core_slice.call( arg, start || 0, end || arg.length );
			},
			/**
			 * Throw error
			 * @param {String} - Error message
			 * @param {String} [type="Error"]
			 * @returns {Error}
			 */
			error: function( info, type ) {
				var s = "";
				if ( info.fn && info.msg ) {
					s = [ "call ", info.fn, "()", " error: ", info.msg ].join( "" );
				} else {
					s = info.toString();
				}
				throw new window[ type || "Error" ]( s );
			},
			/**
			 * b extend a. Return object "a".
			 * @param {Object}
			 * @param {Object}
			 * @returns a
			 */
			extend: function( a, b ) {
				for ( var i in b )
					a[ i ] = b[ i ];
				return a;
			},
			/**
			 * Get config from current javascript tag
			 * @param {String[]} - List of attribute name
			 * @param {Boolean} - If true then asc
			 * @returns {Object}
			 */
			getJScriptConfig: function( list, asc ) {
				var _scripts = document.getElementsByTagName( "script" ),
					_script = _scripts[ asc === true ? 0 : _scripts.length - 1 ],
					i = 0,
					j = 0,
					item, attrs, attr, result = {};
				for ( ; item = list[ i++ ]; ) {
					attrs = ( _script.getAttribute( item ) || "" ).split( /;/ );
					if ( item == "src" ) {
						result[ item ] = attrs[ 0 ];
						break;
					}
					j = 0;
					result[ item ] = {};
					for ( ; attr = attrs[ j++ ]; ) {
						attr = attr.split( /:|=/ );
						if ( attr[ 1 ] ) {
							attr[ 1 ].match( /false|true|1|0/ ) && ( attr[ 1 ] = eval( attr[ 1 ] ) );
							result[ item ][ attr[ 0 ] ] = attr[ 1 ];
						}
					}
				}
				return result;
			},
			/**
			 * Get path of file
			 * @param {String} - like "myFile"
			 * @param {String} [suffix=".js"] - like ".js"
			 * @returns {String}
			 */
			getPath: function( key, suffix ) {
				var _key = key,
					_suffix = suffix,
					_aKey, _url, ma;
				if ( !_suffix ) {
					_suffix = ".js";
				}
				if ( ma = _key.match( /\.[^\/\.]*$/g ) ) {
					_url = _key;
					if ( ma[ ma.length - 1 ] != _suffix ) {
						_url += _suffix;
					}
				} else {
					_url = basePath + "/" + _key + ( _suffix || ".js" );
				}
				if ( /^\//.test( _url ) ) {
					_url = rootPath + _url.replace( /\//, "" );
				} else if ( !/^[a-z]+?:\/\//.test( _url ) ) {
					_url = basePath + "/" + _url;
				}
				return _url;
			},
			/**
			 * Get now in milliseconds
			 * @returns {Number}
			 */
			now: function() {
				return Date.now();
			},
			/**
			 * Remove file suffix. "myFile.js" ==> "myfile"
			 * @param {String}
			 * @returns {String}
			 */
			removeSuffix: function( src ) {
				src = src.replace( /\/$/, "" );
				if ( src.match( /\.[^\/\.]*$/g ) ) {
					src = src.replace( /\.[^\/\.]*$/, "" );
				}

				return src;
			}
		},
		count = 0,
		reg = RegExp,
		pagePath = document.location.toString().replace( /[^\/]+$/, "" ),
		basePath = ( function() {
			var ret = util.getJScriptConfig( [ "src" ] ).src.replace( /\/[^\/]+$/, "" );
			if ( !/^[a-z]+?:\/\//.test( ret ) ) {
				var sl = document.location.toString();
				if ( /^\//.test( ret ) ) {
					ret = sl.replace( /((.*?\/){3}).*$/, "$1" ) + ret.substr( 1 );
				} else {
					ret = sl.replace( /[^\/]+$/, "" ) + ret;
				}
			}
			return ret;
		}() ),
		/** {String} Project root path*/
		rootPath = basePath.replace( /((.*?\/){3}).*$/, "$1" ),
		runTime;

	/**
	 * <h3>
	 * Config of amdquery. <br />
	 * </h3>
	 * @public
	 * @module base/config
	 * @property {object}  config                              - exports.
	 * @property {object}  config.amdquery                     - The amdquery Configuration.
	 * @property {boolean} config.amdquery.debug               - Whether debug, it will be the output log if true.
	 * @property {boolean} config.amdquery.development         - Whether it is a development environment.
	 *
	 * @property {object}  config.amd                          - The AMD Configuration.
	 * @property {boolean} config.amd.detectCR                 - Detect circular dependencies, you should set it true when you develop.
	 * @property {boolean} config.amd.debug                    - It will add "try-catch" when module load if false, so you could not see any error infomation.
	 * @property {number}  config.amd.timeout                  - Timeout of the loading module.
	 * @property {boolean} config.amd.console                  - It will be output log "module [id] ready" if true.
	 *
	 * @property {object}  config.ui                           - The UI-Widget Configuration.
	 * @property {boolean} config.ui.initWidget                - Automatic initialization UI.
	 * @property {string}  config.ui.loadingClassName          - When loading UI, the mask layer using the CSS name.
	 * @property {boolean} config.ui.autoFetchCss              - Automatic fetching CSS.
	 * @property {boolean} config.ui.isTransform3d             - Whether to use transform3d.
	 *
	 * @property {object}  config.module                       - The module Configuration.
	 *
	 * @property {object}  config.app                          - The application Configuration.
	 * @property {string}  config.app.src                      - A js file src, main of application.
	 * @property {string}  config.app.loadingImage             - A image src will be show when application is loading.
	 * @property {boolean} config.app.debug                    - Whether debug, it will be the output log if true.
	 * @property {boolean} config.app.development              - Whether it is a development environment.
	 * @property {boolean} config.app.autoFetchCss             - Automatic fetching CSS.
	 * @property {string} config.app.xmlPath                   - Path of the combination XML, build could create it and set it.
	 */

	var _config = {
		amdquery: {
			define: "$",
			debug: false,
			development: true
		},
		amd: {
			detectCR: false,
			debug: true,
			timeout: 5000,
			console: false
		},
		ui: {
			initWidget: false,
			loadingClassName: "widget-loading",
			autoFetchCss: true,
			isTransform3d: true
		},
		module: {

		},
		app: {
			src: "",
			loadingImage: "",
			debug: false,
			development: true,
			autoFetchCss: true,
			xmlPath: "xml/combination.xml"
		}
	};
	var defineConfig = {};
	if ( typeof aQueryConfig != "undefined" && typeof aQueryConfig === "object" ) {
		defineConfig = aQueryConfig;
	} else {
		defineConfig = util.getJScriptConfig( [ "amdquery", "amd", "ui", "module", "app" ] );
	}

	util.extend( _config.amdquery, defineConfig.amdquery );
	util.extend( _config.amd, defineConfig.amd );
	util.extend( _config.ui, defineConfig.ui );
	util.extend( _config.module, defineConfig.module );
	util.extend( _config.app, defineConfig.app );

	/**
	 * You can config global name. See <a target="_top" href="/document/app/asset/source/guide/AMDQuery.html#scrollTo=Reference_AMDQuery">AMDQuery.html</a> </br>
	 * <strong>aQuery("div")</strong> equivalent to <strong>new aQuery("div")</strong>.
	 * @global
	 * @class
	 * @param {Object|String|Element|Element[]|Function}
	 * @param {String} [tagName="div"] - Tag name if a is a object.
	 * @param {Element} [parent] - Parent Element.
	 * @borrows util.getPath as getPath
	 * @borrows util.now as now
	 * @example
	 * aQuery(function(){}); // Equivalent to ready(function(){}), see {@link module:base/ready}
	 * // should require("main/query")
	 * aQuery("div"); aQuery("#my"); aQuery(".title") // see {@link http://sizzlejs.com/}
	 * aQuery(div); aQuery([div, div]);
	 * aQuery(aQuery("div")); // another aQuery
	 * // should require("main/css")
	 * aQuery({height:100,width:100},"div"); // create a element "div", style is "height:100px;width:100px"
	 * aQuery(null,"a"); // create a element "a" without style
	 * // should require("main/dom")
	 * aQuery({height:100,width:100},"div", document.body); // create a element "div" and append to "body"
	 * aQuery(null,"div", document.body);
	 */
	var aQuery = function( elem, tagName, parent ) {
		if ( $.forinstance( this ) ) {
			if ( !elem && !tagName ) return;
			if ( ( typeof elem === "object" || elem === undefined || elem === null ) && typeof tagName == "string" ) {
				count++;
				if ( tagName === undefined || tagName === null ) tagName = "div";
				var obj = document.createElement( tagName );
				this.init( [ obj ] );

				$.interfaces.trigger( "constructorCSS", this, elem, tagName, parent );

				$.interfaces.trigger( "constructorDom", this, elem, tagName, parent );

				obj = null;

			} else if ( elem ) {
				var result;
				if ( result = $.interfaces.trigger( "constructorQuery", elem, tagName ) ) {
					count++;
					this.init( result, elem );

				}
			}
		} else if ( typeof elem == "function" ) {
			$.ready( elem );
		} else return new $( elem, tagName, parent );
	},
		$ = aQuery;

	/**
	 * @callback EachCallback
	 * @param {*} - Item.
	 * @param {String|Number} - If iterate array then parameter is index. If iterate object then parameter is key.
	 */

	/**
	 * this is aQuery
	 * @callback AQueryEachCallback
	 * @this aQuery
	 * @param {Element} - element
	 * @param {Number} - index
	 */

	util.extend( $, /** @lends aQuery */ {
		/**
		 * Interfaces namesapce of aQuery. See interfaces.
		 * @private
		 */
		interfaces: {
			achieve: function( name, fun ) {
				/// <summary>实现一个接口</summary>
				/// <param name="name" type="String">接口名</param>
				/// <param name="name" type="String">要实现的方法</param>
				/// <returns type="Self" />
				$.interfaces.handlers[ name ] = fun;
				return this;
			},
			trigger: function( name ) {
				/// <summary>对外接口调用 内部的</summary>
				/// <param name="name" type="String">接口名</param>
				/// <returns type="any" />
				var item = $.interfaces.handlers[ name ];
				return item && item.apply( this, arguments );
			},
			handlers: {
				editEventType: null,
				proxy: null,
				constructorCSS: null,
				constructorDom: null,
				constructorQuery: null
			}

		},
		/** Module map. */
		module: {},
		/**
		 * The return value of this method will be used to determine whether an instance of "aQuery".
		 * @returns "AMDQuery" */
		toString: function() {
			return "AMDQuery";
		},
		/**
		 * Return module infomation. see <a target="_top" href="/document/app/asset/source/guide/AMDQuery.html#scrollTo=AMD">AMDQuery.html</a>
		 * @returns {String}
		 */
		valueOf: function() {
			var info = [ version, "\n" ],
				value, key;
			for ( key in $.module ) {
				value = $.module[ key ];
				info.push( key, " : ", value, "\n" );
			}
			return info.join( "" );
		},
		/** {string} - Directory path of amdquery.js*/
		basePath: basePath,
		/** Get number between min and max.
		 * @param {Number}
		 * @param {Number}
		 * @param {Number}
		 * @returns {Number}
		 * @example
		 * aQuery.between( 1, 10, 5 ); // return 5
		 * aQuery.between( 1, 10, 1 ); // return 1
		 * aQuery.between( 1, 10, 123 ); // return 10
		 */
		between: function( min, max, num ) {
			return Math.max( min, Math.min( max, num ) );
		},
		/** Get number among number1 and number2.
		 * @param {Number}
		 * @param {Number}
		 * @param {Number}
		 * @returns {Number}
		 * @example
		 * aQuery.among( 1, 10, 5 ); // return 5
		 * aQuery.among( 10, 1, 7 ); // return 7
		 * aQuery.among( 10, 1, 123 ); // return 123
		 * aQuery.among( 10, 10, 15 ); // return 10
		 */
		among: function( num1, num2, num ) {
			return num2 > num1 ? $.between( num1, num2, num ) : $.between( num2, num1, num );
		},
		/** Bind context to function.
		 * @param {Function}
		 * @param {Object}
		 * @returns {Function}
		 */
		bind: function( fun, context ) {
			return function() {
				return fun.apply( context || window, arguments );
			};
		},
		/** wrap console.log. */
		logger: ( window.console ? ( console.log.bind ? console.log.bind( console ) : console.log ) : function() {} ),
		/** Create a elemnt by tag name.
		 * @param {String}
		 * @returns {Element}
		 */
		createEle: function( tag ) {
			return document.createElement( tag );
		},
		/** Iterate array or object.
		 * @param {Array|Object}
		 * @param {EachCallback}
		 * @param {Object=} - If context is undefinded, context of callback is each item.
		 * @returns {this}
		 */
		each: function( obj, callback, context ) {
			if ( !obj ) return this;
			var i = 0,
				item, len = obj.length,
				isObj = typeof len != "number" || typeof obj == "function";
			if ( isObj ) {
				for ( item in obj )
					if ( callback.call( context || obj[ item ], obj[ item ], item ) === false ) break;
			} else
				for ( var value = obj[ 0 ]; i < len && callback.call( context || value, value, i ) !== false; value = obj[ ++i ] ) {}
			return this;
		},
		/**
     * Object is instance of {aQuery}.
		 * @param {*}
		 * @returns {Boolean}
		 */
		forinstance: function( obj ) {
			return obj instanceof $ || ( obj && obj.toString() == "AMDQuery" );
		},
		/**
		 * Merge second to first. Do not return a new Array but return "first" array.
		 * @param {Array}
		 * @param {Array}
		 * @returns {Array} Return "first"
		 */
		merge: function( first, second ) {
			var l = second.length,
				i = first.length,
				j = 0;

			if ( typeof l === "number" ) {
				for ( ; j < l; j++ ) {
					first[ i++ ] = second[ j ];
				}
			} else {
				while ( second[ j ] !== undefined ) {
					first[ i++ ] = second[ j++ ];
				}
			}

			first.length = i;

			return first;
		},
		getPath: util.getPath,
		now: util.now,
		/** Number RegExp. */
		core_pnum: /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
		/** {String} Project root path. */
		rootPath: rootPath,
		/** {String} Page path. */
		pagePath: pagePath,

		/**
		 * @namespace
		 * @borrows util.argToArray as argToArray
		 * @borrows util.removeSuffix as removeSuffix
		 */
		util: {
			argToArray: util.argToArray,

			/**
			 * @param {String}
			 * @param {String}
			 * @retusn {String}
			 * @example
			 * aQuery.util.camelCase("margin-left") // return "marginLeft"
			 * aQuery.util.camelCase("border-redius", "webkit") // return "webkitBorderRedius"
			 */
			camelCase: function( name, head ) {
				name.indexOf( "-" ) > 0 ? name = name.toLowerCase().split( "-" ) : name = [ name ];

				head && name.splice( 0, 0, head );

				for ( var i = 1, item; i < name.length; i++ ) {
					item = name[ i ];
					name[ i ] = item.substr( 0, 1 ).toUpperCase() + item.slice( 1 );
				}
				return name.join( "" );
			},
			/**
			 * @param {String}
			 * @retusn {String}
			 */
			trim: function( str ) {
				return str.replace( /(^\s*)|(\s*$)/g, "" );
			},
			/**
			 * @param {String}
			 * @param {String}
			 * @retusn {String}
			 * @example
			 * aQuery.util.unCamelCase("marginLeft") // return "margin-left"
			 * aQuery.util.unCamelCase("webkitBorderRedius") // return "webkit-border-redius"
			 */
			unCamelCase: function( name, head ) {
				name = name.replace( /([A-Z]|^ms)/g, "-$1" ).toLowerCase();
				head && ( name = head + "-" + name );
				return name;
			},
			removeSuffix: util.removeSuffix,
			version: version
		}
	} );

	$.fn = $.prototype = /** @lends aQuery.prototype */ {
		/**
		 * Push element.
		 * @param {Element}
		 * @returns {this}
		 */
		push: function( ele ) {
			this.eles.push( ele );
			return this.init( this.eles );
		},
		/**
		 * Pop element.
		 * @returns {aQuery} return new aQuery(popElement)
		 */
		pop: function() {
			var ret = this.eles.pop();
			this.init( this.eles );
			return new $( ret );
		},
		/**
		 * Shift element.
		 * @returns {aQuery} return new aQuery(shiftElement)
		 */
		shift: function() {
			var ret = this.eles.shift();
			this.init( this.eles );
			return new $( ret );
		},
		/**
		 * Unshift element.
		 * @param {Element}
		 * @returns {aQuery} return new aQuery(this.eles.unshift(element))
		 */
		unshift: function( ele ) {
			return new $( this.eles.splice( 0, 0, ele ) );
		},
		/**
		 * Slice element.
		 * @returns {aQuery}
		 */
		slice: function() {
			return new $( core_slice.call( this.eles, arguments ) );
		},
		/**
		 * Splice element.
		 * @returns {aQuery} return new $( ret )
		 */
		splice: function() {
			var ret = core_splice.call( this.eles, arguments );
			this.init( this.eles );
			return new $( ret );
		},
		/**
		 * @returns {this}
		 */
		reverse: function() {
			this.eles.reverse();
			return this.init( this.eles );
		},
		/**
		 * @param {Function=}
		 * @returns {this}
		 */
		sort: function( fn ) {
			this.eles.sort( fn );
			return this.init( this.eles );
		},
		constructor: $,
		/**
		 * Iterate array of aQuery.
		 * @param {AQueryEachCallback}
		 * @returns {this}
		 */
		each: function( callback ) {
			$.each( this.eles, callback, this );
			return this;
		},
		/**
		 * Element container.
		 * @instance
		 * @type {Array}
		 * @default null
		 */
		eles: null,
		/**
		 * Return new aQuery of first element.
		 * @returns {aQuery}
		 */
		first: function() {
			return $( this.eles[ 0 ] );
		},
		/**
		 * @param {Number} [index=0]
		 * @returns {Element}
		 */
		getElement: function( index ) {
			if ( typeof index == "number" && index != 0 ) return this[ index ];
			else return this[ 0 ];
		},
		/**
		 * Return new aQuery of last element.
		 * @returns {aQuery}
		 */
		last: function() {
			return $( this.eles[ this.eles.length - 1 ] || this.eles );
		},
		/**
		 * @param {Element[]}
		 * @param {String=} -"#title", ".cls", "div".
		 * @returns {this}
		 */
		init: function( eles, selector ) {
			this.eles = null;
			this.context = null;
			this.selector = "";

			if ( this.eles ) this.each( function( ele, index ) {
				delete this[ index ];
			} );
			this.eles = eles;

			this.each( function( ele, index ) {
				this[ index ] = ele;
			} );
			this.length = eles.length;

			if ( typeof selector == "string" ) {
				this.selector = selector;
			}

			this.context = this[ 0 ] ? this[ 0 ].ownerDocument : document;
			return this;
		},
		/**
		 * @param {Element}
		 * @returns {Number} - -1 means not found.
		 */
		indexOf: function( ele ) {
			var len;

			for ( len = this.eles.length - 1; len >= 0; len-- ) {
				if ( ele === this.eles[ len ] ) {
					break;
				}
			}

			return len;
		},
		/**
		 * Array length
		 * @type {Number}
		 * @default 0
		 * @instance
		 */
		length: 0,
		selector: "",
		/**
		 * @param {Element[]}
		 * @returns {this}
		 */
		setElement: function( eles ) {
			this.eles = eles;
			return this.init( this.eles );
		},
		/**
		 * Array to stirng.
		 * @returns {String}
		 */
		toString: function() {
			return this.eles.toString();
		},
		/**
		 * Return count of aQuery be created.
		 * @returns {Number}
		 */
		valueOf: function() {
			return count;
		},
		/**
		 * Get a new array of this.eles .
		 * @returns {Array}
		 */
		toArray: function() {
			return core_slice.call( this );
		},
		/**
		 * Get the Nth element in the matched element set OR. </br>
		 * Get the whole matched element set as a clean array.
		 * @param {Number|null}
		 * @returns {Array|Element}
		 */
		get: function( num ) {
			return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
		}
	};

	function Queue() {
		this.list = [];
	}

	Queue.prototype = {
		constructor: Queue,
		/**
		 * @public
		 * @this module:base/queue.prototype
		 * @method queue
		 * @memberOf module:base/queue.prototype
		 * @param {Function|Function[]} fn - Do some thing.
		 * @param {Object} [context] - Context of fn.
		 * @param {Array} [args] - Args is arguments of fn.
		 * @returns {this}
		 */
		queue: function( fn, context, args ) {
			if ( typeof fn == "function" ) {
				this.list.push( fn );
				if ( this.list[ 0 ] != "inprogress" ) {
					this.dequeue( context, args );
				}
			} else if ( fn && fn.constructor == Array ) {
				this.list = fn;
			}
			return this;
		},
		/**
		 * @public
		 * @method dequeue
		 * @memberOf module:base/queue.prototype
		 * @param {Object} [context=null] - Context of fn.
		 * @param {Array} [args=Array] args - Args is arguments of fn.
		 * @returns {this}
		 */
		dequeue: function( context, args ) {
			var fn = this.list.shift();
			if ( fn && fn === "inprogress" ) {
				fn = this.list.shift();
			}

			if ( fn ) {
				this.list.splice( 0, 0, "inprogress" );
				fn.apply( context || null, args || [] );
			}
			return this;

		},
		/**
		 * @public
		 * @method clearQueue
		 * @memberOf module:base/queue.prototype
		 * @returns {this}
		 */
		clearQueue: function() {
			return this.queue( [] );
		}
	};

	( function( /*require*/) {
		"use strict"; //启用严格模式
		$.module.require = "1.0.0";

		var _define, _require;
		if ( window.define ) {
			$.logger( "window.define has defined" );
			_define = window.define;
		}
		if ( window.require ) {
			$.logger( "window.require has defined" );
			_require = window.require;
		}

		var requireQueue = new Queue();

		function ClassModule( module, dependencies, factory, status, container, fail ) {
			/**
			 * @memberof module:base/ClassModule
			 * @constructs module:base/ClassModule
			 * @param {String} module - Module name.
			 * @param {Array} dependencies - Dependencies module.
			 * @param {Function|Object|String|Number|Boolean} [factory] - Module body.
			 * @param {Number} [status=0] - 0:init 1:queue 2:require 3:define 4:ready
			 * @param {String} [container] - Path of js.
			 * @param {Function} [fail] - An function to the fail callback if loading moudle timeout or error.
			 */
			if ( !module ) {
				return;
			}
			this.handlers = {};
			this.module = null;
			this.first = null;
			this.description = "No description";
			this.id = ClassModule.variable( module );
			this.reset( dependencies, factory, status, container, fail );
			ClassModule.setModule( this.id, this );

			//this.check();
		}

		util.extend( ClassModule, {
			anonymousID: null,
			requireQueue: requireQueue,
			cache: {},
			/**
			 * A map to path ofmodule file.
			 * @type Object
			 * @memberOf module:base/ClassModule
			 */
			container: {},
			/**
			 * A map to module dependency.
			 * @type Object
			 * @memberOf module:base/ClassModule
			 */
			dependenciesMap: {},
			/**
			 * Check the name is equal to anonymous name which assigned by "require".
			 * @private
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @throws Will throw an error if the name is not equal anonymousID.
			 * @returns {void}
			 */
			checkName: function( id ) {
				if ( this.anonymousID != null && id.indexOf( "tempDefine" ) < 0 ) {
					id !== this.anonymousID && util.error( {
						fn: "define",
						msg: "the named " + id + " is not equal require"
					} );
				}
			},
			/**
			 * ClassModule contains the module.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @returns {Boolean}
			 */
			contains: function( id ) {
				id = ClassModule.variable( id );
				return !!ClassModule.modules[ id ];
			},
			/**
			 * Detect circle reference.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @param {String[]} - Dependent modules.
			 * @returns {String} - Module name.
			 */
			detectCR: function( md, dp ) {
				if ( !md ) {
					return;
				}
				if ( dp && dp.constructor != Array ) {
					return;
				}
				var i, DM, dm, result, l = dp.length,
					dpm = ClassModule.dependenciesMap,
					mdp = ClassModule.mapDependencies;
				for ( i = 0; i < l; i++ ) {
					dm = dp[ i ];
					if ( dm === md ) {
						return dm;
					} //发现循环引用
					if ( !dpm[ md ] ) {
						dpm[ md ] = {};
					}
					if ( !mdp[ dm ] ) {
						mdp[ dm ] = {};
					}
					dpm[ md ][ dm ] = 1;
					mdp[ dm ][ md ] = 1; //建表
				}
				for ( DM in mdp[ md ] ) {
					result = ClassModule.detectCR( DM, dp ); //反向寻找
					if ( result ) {
						return result;
					}
				}
			},
			/**
			 * Wrap with a function.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {*} - body.
			 * @returns {Function}
			 */
			funBody: function( body ) {
				//将factory强制转换为function类型，供ClassModule使用
				if ( !body ) {
					body = "";
				}
				switch ( typeof body ) {
					case "function":
						return body;
					case "string":
						return function() {
							return new String( body );
						};
					case "number":
						return function() {
							return new Number( body );
						};
					case "boolean":
						return function() {
							return new Boolean( body );
						};
					default:
						return function() {
							return body;
						};
				}
			},
			/**
			 * Get src of module file.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @param {Boolean} [asc=true] - getJScriptConfig option.
			 * @returns {String} - Path.
			 */
			getContainer: function( id, asc ) {
				var src;
				if ( ClassModule.container[ id ] ) {
					src = ClassModule.container[ id ];
				} else {
					src = util.getJScriptConfig( [ "src" ], typeof asc == "boolean" ? asc : true ).src || "it is local"; //或者改成某个字段是 config里的
					id && ( ClassModule.container[ id ] = src );
				}
				return src;
			},
			/**
			 * modify module name to a file path.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @param {String} [suffix=".js"]
			 * @returns {String} - Path.
			 */
			getPath: function( key, suffix ) {
				var ret, path, ma;
				key = ClassModule.variable( key );
				if ( path = ClassModule.maps[ key ] ) {} //do not match preffix
				else {
					path = key;
				}

				if ( _config.amd.rootPath ) {
					ma = key.match( /\.[^\/\.]*$/g );
					if ( !ma || ma[ ma.length - 1 ] != suffix ) {
						key += suffix;
					}
					ret = _config.amd.rootPath + key;
				} else {
					ret = util.getPath( path, suffix );
				}

				return ret;
			},
			/**
			 * Get Module with module.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @returns {ClassModule}
			 */
			getModule: function( module ) {
				module = ClassModule.variable( module );
				return ClassModule.modules[ module ];
			},
			holdon: {},
			/**
			 * Load dependencies on asynchronous.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String[]} - An array of module name.
			 * @returns {this}
			 */
			loadDependencies: function( dependencies ) {
				var dep = dependencies,
					i = 0,
					len, item, module;
				if ( !dep || dep.constructor == Array || dep.length ) {
					return this;
				}
				setTimeout( function() {
					for ( len = dep.length; i < length; i++ ) {
						item = dep[ i ];
						module = ClassModule.getModule( item );
						if ( !module ) {
							require( item );
						} else if ( module.getStatus() == 2 ) {
							ClassModule.loadDependencies( module.dependencies );
						}
					}
				}, 0 );
				return this;
			},
			/**
			 * Load js file on asynchronous.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Url of js.
			 * @param {String} - Module name.
			 * @param {Function} - An function to the fail callback if loading moudle timeout or error.
			 * @returns {this}
			 */
			loadJs: function( url, id, error ) {
				var module = ClassModule.getModule( id );
				//该模块已经载入过，不再继续加载，主要用于require与define在同一文件
				if ( ClassModule.resource[ url ] || ( module && ( module.getStatus() > 2 ) ) ) {
					return this;
				}

				ClassModule.resource[ url ] = id;

				var script = document.createElement( "script" ),
					head = document.getElementsByTagName( "HEAD" )[ 0 ],
					timeId;

				error && ( script.onerror = function() {
					clearTimeout( timeId );
					error();
				} );

				script.onload = script.onreadystatechange = function() {
					if ( !this.readyState || this.readyState == "loaded" || this.readyState == "complete" ) {
						clearTimeout( timeId );
						head.removeChild( script );
						head = null;
						script = null;
					}
				};

				script.setAttribute( "src", url );
				script.setAttribute( "type", "text/javascript" );
				script.setAttribute( "language", "javascript" );

				timeId = setTimeout( function() {
					error && error();
					head.removeChild( script );
					script = script.onerror = script.onload = error = head = null;
				}, _config.amd.timeout );

				head.insertBefore( script, head.firstChild );
				return this;
			},
			/**
			 * A map be depend.
			 * @type Object
			 * @memberOf module:base/ClassModule
			 */
			mapDependencies: {},
			maps: {},
			modules: {},
			namedModules: {},
			resource: {},
			rootPath: null,
			/**
			 * A map of path variable.
			 * @type Object
			 * @memberOf module:base/ClassModule
			 */
			variableMap: {},
			/**
			 * Variable prefix.
			 * @type String
			 * @default "@"
			 * @memberOf module:base/ClassModule
			 */
			variablePrefix: "@",
			/**
			 * Load js file on asynchronous.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Url of js.
			 * @param {String} - Module name.
			 * @param {Function} - An function to the fail callback if loading moudle timeout or error.
			 * @returns {this}
			 */
			setModule: function( k, v ) {
				!this.getModule( k ) && ( this.modules[ k ] = v );
				return this;
			},
			/**
			 * Status map.
			 * @readonly
			 * @enum {String}
			 * @memberOf module:base/ClassModule
			 */
			statusReflect: {
				/** module created */
				0: "init",
				/** module in queue */
				1: "queue",
				/** module load dependent */
				2: "require",
				/** module is defined */
				3: "define",
				/** module ready */
				4: "ready"
			},
			/**
			 * @desc "@app/controller" to "mypath/app/controller" if match the "@app" in {@link module:base/ClassModule.variableMap} else return self
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @returns {String}
			 */
			variable: function( ret ) {
				var variableReg = new RegExp( "\\" + ClassModule.variablePrefix + "[^\\/]+", "g" ),
					variables = ret.match( variableReg );

				if ( variables && variables.length ) {
					for ( var i = variables.length - 1, path; i >= 0; i-- ) {
						path = require.variable( variables[ i ] );
						if ( path ) {
							ret = ret.replace( variables[ i ], path );
						}
					}
				}

				return ret;
			}
		} );

		/**
		 * @callback ClassModuleCallback
		 * @this module:base/ClassModule
		 * @param {...*} - An argument array of any object. Any one argument is defined in the module.
		 */

		ClassModule.prototype = /** @lends module:base/ClassModule.prototype */ {
			/**
			 * When completed, the param fn is called.
			 * @method
			 * @param {ClassModuleCallback} - Handler.
			 * @returns {this}
			 */
			addHandler: function( fn ) {
				if ( typeof fn == "function" ) {
					if ( this.status == 4 ) {
						fn.apply( this, this.module );
						return this;
					}
					var h = this.handlers[ this.id ];
					h == undefined && ( h = this.handlers[ this.id ] = [] );
					h.push( fn );
				}
				return this;
			},
			/**
			 * Check status then to do something.
			 * @method
			 * @protected
			 * @returns {this}
			 */
			check: function() {
				var status = this.getStatus(),
					dps = this.dependencies;
				switch ( status ) {
					case 4:
						this.holdReady().trigger();
						break;
					case 3:
						if ( !dps || !dps.length ) {
							this.getReady();
							break;
						}
					case 2:
					case 1:
					case 0:
						if ( dps.length == 1 && dps[ 0 ] === this.id ) {
							break;
						}
					default:
						var aDP = [],
							hd = ClassModule.holdon,
							i = 0,
							sMD, sDP, mDP;
						if ( status > 0 && _config.amd.detectCR == true ) {
							if ( sMD = ClassModule.detectCR( this.id, dps ) ) {
								util.error( {
									fn: "define",
									msg: "There is a circular reference between '" + sMD + "' and '" + dps + "'"
								}, "ReferenceError" );
								return;
							}
						}
						//加入holdon
						for ( ; sDP = dps[ i++ ]; ) { //有依赖自己的情况
							mDP = ClassModule.getModule( sDP );
							if ( !mDP || mDP.getStatus() != 4 ) {
								aDP.push( sDP );
								if ( hd[ sDP ] ) {
									hd[ sDP ].push( this.id );
								} else {
									hd[ sDP ] = [ this.id ];
								}
							}
						}
						//}
						if ( !aDP.length ) {
							//依赖貌似都准备好，尝试转正
							this.getReady();
						} else {
							//ClassModule.setModule(this);
							if ( status >= 2 ) { //深入加载依赖模块 <=1？
								this.loadDependencies();
							}
						}
						break;
				}
				return this;
			},
			constructor: ClassModule,
			/**
			 * Get an array of dependent modules.
			 * @method
			 * @returns {Array.<ModuleInfo>}
			 */
			getDependenciesArray: function() {
				var ret = [];
				if ( _config.amd.detectCR ) {
					var id = this.id,
						MD = ClassModule.dependenciesMap[ id ],
						DM, module = ClassModule.getModule( id );
					/**
					 * @typedef ModuleInfo
					 * @type {object}
					 * @property {String} name - Module name
					 * @property {String} status - Module status
					 * @property {String} container - Module path
					 */
					ret.push( {
						name: id,
						status: module.getStatus( 1 ),
						container: module.container
					} );
					for ( DM in MD ) {
						module = ClassModule.getModule( DM );
						ret.push( {
							name: DM,
							status: module.getStatus( 1 ),
							container: module.container
						} );
					}
				} else {
					$.logger( "getDependenciesArray", "you had to set require.detectCR true for getting map list" );
				}
				return ret;
			},
			/**
			 * Module ready and trigger handler.
			 * @protected
			 * @method
			 */
			getReady: function() {
				if ( this.status == 4 ) {
					return;
				}
				var dps = this.dependencies,
					l = dps.length,
					i = 0,
					dplist = [],
					id = this.id,
					sdp, md, map, exports;

				for ( ; i < l; i++ ) {
					md = ClassModule.getModule( dps[ i ] );
					//如果依赖模块未准备好，或依赖模块中还有待转正的模块，则当前模块也不能被转正
					if ( !md || md.status != 4 ) {
						return false;
					}
					dplist = dplist.concat( md.module );
				}
				this.setStatus( 4 );
				if ( _config.amd.debug ) {
					exports = this.factory.apply( this, dplist ) || {};
				} else {
					try {
						exports = this.factory.apply( this, dplist ) || {};
					} catch ( e ) {}
				}

				exports._AMD = {
					id: id,
					dependencies: dps,
					status: 4,
					//, todo: this.todo
					container: this.container,
					getDependenciesArray: this.getDependenciesArray
				};

				if ( exports && exports.constructor != Array ) {
					exports = [ exports ];
				};
				this.module = exports;
				this.first = exports[ 0 ];
				_config.amd.console && $.logger( "module " + id + " ready" );
				//_getMoudule(id, exports);
				//当传入的模块是已准备好的，开启转正机会
				this.holdReady().trigger();
			},
			/**
			 * Get stats of module.
			 * @method
			 * @param {Boolean} - If true get string else get number.
			 * @returns {Number|String}
			 */
			getStatus: function( isStr ) {
				var s = this.status;
				return isStr == true ? ClassModule.statusReflect[ s ] : s;
			},
			/**
			 * Describe module.
			 * @method
			 * @param {String}
			 * @returns {this}
			 */
			describe: function( content ) {
				this.description = content;
				$.module[ this.id ] = content;
				return this;
			},
			valueOf: function() {
				return this.description;
			},
			/**
			 * Wait module get ready.
			 * @method
			 * @protected
			 * @returns {this}
			 */
			holdReady: function() {
				var md, hd = ClassModule.holdon[ this.id ],
					MD = ClassModule.modules;
				if ( hd && hd.length ) {
					for ( ; md = MD[ hd.shift() ]; ) {
						md.getReady();
					}
				}
				return this;
			},
			/**
			 * Reset property.
			 * @method
			 * @protected
			 * @param {Array} dependencies - Dependencies module.
			 * @param {Function|Object|String|Number|Boolean} [factory] - Module body.
			 * @param {Number} [status=0] - 0:init 1:queue 2:require 3:define 4:ready
			 * @param {String} [container] - Path of js.
			 * @param {Function} [fail] - An function to the fail callback if loading moudle timeout or error.
			 * @returns {this}
			 */
			reset: function( dependencies, factory, status, container, fail ) {
				for ( var i = dependencies.length - 1; i >= 0; i-- ) {
					dependencies[ i ] = ClassModule.variable( dependencies[ i ] );
				}
				this.dependencies = dependencies;
				this.factory = factory;
				this.status = status || 0;
				this.container = container;
				this.fail = fail;
				return this;
			},
			/**
			 * Go to load Module/
			 * @method
			 * @returns {this}
			 */
			load: function() {
				var id = this.id,
					fail = this.fail,
					status = this.getStatus(),
					url;

				( url = ClassModule.getPath( id, ".js" ) ) || util.error( {
						fn: "require",
						msg: "Could not load module: " + id + ", Cannot match its URL"
					} );
				//如果当前模块不是已知的具名模块，则设定它为正在处理中的模块，直到它的定义体出现
				//if (!namedModule) { ClassModule.anonymousID = id; } //这边赋值的时候应当是影射的
				this.setStatus( 2 );
				if ( !ClassModule.container[ id ] ) {
					ClassModule.container[ id ] = url;
				}

				if ( ClassModule.cache[ id ] ) {
					ClassModule.cache[ id ]();
				} else {
					ClassModule.loadJs( url, id, fail );
				}
				return this;
			},
			/**
			 * Go to load Dependent.
			 * @method
			 * @returns {this}
			 */
			loadDependencies: function() {
				var dep = this.dependencies,
					i = 0,
					len, item, module;
				if ( !( dep && dep.constructor == Array && dep.length ) ) {
					return this;
				}
				for ( len = dep.length; i < len; i++ ) {
					item = dep[ i ];
					module = ClassModule.getModule( item );
					if ( !module ) {
						require( item );
					}
				}
				return this;
			},
			/**
			 * Module go to launch.
			 * @method
			 * @param {Function} [success] - Ready callback.
			 * @returns {this}
			 */
			launch: function( success ) {
				this.addHandler( success );
				switch ( this.status ) {
					case 0:
						// this.check( );
						var namedModule = ClassModule.namedModules[ this.id ],
							self = this;
						if ( namedModule ) {
							this.load();
						} else {
							this.setStatus( 1 );
							requireQueue.queue( function() {
								if ( !ClassModule.anonymousID ) {
									ClassModule.anonymousID = self.id;
								}
								self.load();
							} );
						}
						break;
					case 4:
						this.check();
						break;

				}

				return this;
			},
			/**
			 * @method
			 * @protected
			 * @param {Number}
			 * @returns {this}
			 */
			setStatus: function( status ) {
				this.status = status;
				return this;
			},
			/**
			 * @method
			 * @protected
			 * @returns {Boolean}
			 */
			isReady: function() {
				return this.status === 4;
			},
			/**
			 * Trigger event.
			 * @method
			 * @protected
			 * @returns {this}
			 */
			trigger: function() {
				var h = this.handlers[ this.id ],
					item;
				if ( h && h.constructor == Array && this.getStatus() == 4 && this.module ) {

					for ( ; h.length && ( item = h.splice( 0, 1 ) ); ) {
						item[ 0 ].apply( this, this.module );
					}

				}
				return this;
			}
		}

		/**
		 * AMD define.
		 * @global
		 * @method
		 * @param {String} - Module.
		 * @param {String[]|*} - If arguments[2] is a factory, it can be any object.
		 * @param {*} [factory] - Usually, it is function(){} or {}.
		 * @returns {ClassModule}
		 */
		window.define = function( id, dependencies, factory ) {
			var arg = arguments,
				ret, deep, body, container, status;

			switch ( arg.length ) {
				case 0:
					util.error( {
						fn: "window.define",
						msg: id + ":define something that cannot be null"
					}, "TypeError" );
					break;
				case 1:
					body = id;
					id = ClassModule.anonymousID; //_resource[container];
					dependencies = [];
					factory = ClassModule.funBody( body );
					break;
				case 2:
					if ( typeof arg[ 0 ] == "string" ) {
						id = id; //util.getJScriptConfig(["src"], true).src; //_tempId();_amdAnonymousID
						body = dependencies;
						dependencies = [];
					} else if ( arg[ 0 ] && arg[ 0 ].constructor == Array ) {
						var temp = id;
						id = ClassModule.anonymousID; //_resource[container]; // ; //_tempId();
						body = dependencies;
						dependencies = temp;
					} else {
						util.error( {
							fn: "define",
							msg: id + ":The first arguments should be String or Array"
						}, "TypeError" );
					}
					factory = ClassModule.funBody( body );
					break;
				default:
					if ( !( typeof arg[ 0 ] == "string" && arg[ 1 ] && arg[ 1 ].constructor == Array ) ) {
						util.error( {
							fn: "define",
							msg: id + ":two arguments ahead should be String and Array"
						}, "TypeError" );
					}
					factory = ClassModule.funBody( arg[ 2 ] );
			}
			id = ClassModule.variable( id );
			ClassModule.checkName( id );
			container = ClassModule.getContainer( id );
			if ( ret = ClassModule.getModule( id ) ) {
				deep = ret.getStatus();
				//container = deep != 0 ? ClassModule.getContainer(id) : null;
				ret.reset( dependencies, factory, 3, container );
			} else {
				container = /tempDefine/.test( id ) ? "inner" : ClassModule.getContainer( id );
				ret = new ClassModule( id, dependencies, factory, 3, container );
			}

			var status = !ClassModule.namedModules[ id ] && deep == 2;

			if ( status ) {
				ClassModule.anonymousID = null;
			}

			ret.check();

			//if (!/_temp_/.test(id)) (container = ClassModule.getContainer(id)); //如果不是require定义的临时
			//执行请求队列
			if ( status ) {
				requireQueue.dequeue();
			}

			return ret;

		};

		define.amd = ClassModule.maps;


		function getTempDefine( module, fail ) {
			//如果请求一组模块则转换为对一个临时模块的定义与请求处理
			var ret;
			if ( module.constructor == Array ) {
				if ( !module.length ) {
					return;
				} else if ( module.length == 1 ) {
					module = module.join( "" );
				} else {
					var de = module;
					module = "tempDefine:" + module.join( "," );
					ret = ClassModule.getModule( module ) || define( module, de, function() {
						return util.argToArray( arguments );
					} );
				}
			}

			if ( typeof fail != "function" ) {
				fail = function() {
					util.error( {
						fn: "require",
						msg: module + ":Could not load , Cannot fetch the file"
					} );
				};
			}

			ret = ret || ClassModule.getModule( module ) || new ClassModule( module, [ module ], function() {
				return new String( module );
			}, 0, null, fail );

			return ret;
		}

		/**
		 *
		 * @public
		 * @namespace require
		 * @variation namespace
		 */

		/**
		 * AMD require.
		 * @method require
		 * @global
		 * @param {String} - Module.
		 * @param {ClassModuleCallback}
		 * @param {Function} [fail] - An function to the fail callback if loading moudle timeout or error.
		 * @returns {ClassModule}
		 * @example
		 * require( [ "main/query", "hash/locationHash", "ui/swapview", "ui/scrollableview", "module/initWidget" ], function( query, locationHash ) { } );
		 * require( "main/query", function( query ) { } );
		 * require( "main/query" ).first // Maybe is null;
		 */
		window.require = function( module, success, fail ) {
			if ( !module ) {
				return;
			}

			var ret = getTempDefine( module, fail );

			success && typeof success != "function" && util.error( {
				fn: "require",
				msg: module + ":success should be a Function"
			}, "TypeError" );

			return ret.launch( success );
		};

		util.extend( require, {
			/**
			 * Cache the module.
			 * @memberof require(namespace)
			 * @param {Object.<String,Function>} - String: module name,Function: moudle factory.
			 * @returns {this}
			 */
			cache: function( cache ) {
				var container = ClassModule.getContainer( null, ClassModule.amdAnonymousID ? true : false );
				//util.extend(ClassModule.cache, a.cache);
				for ( var i in cache ) {
					require.named( i );
					ClassModule.cache[ i ] = cache[ i ];
					ClassModule.container[ i ] = container;
				}
				return this;
			},
			/**
			 * The module named, so we can load it by async.
			 * @memberof require(namespace)
			 * @param {String|String[]|Object.<String,*>} - String: module name.
			 * @returns {this}
			 */
			named: function( name ) {
				var i, b, n = name;
				if ( n && n.constructor == Array ) {
					for ( i = 0; b = n[ i++ ]; ) {
						ClassModule.namedModules[ b ] = 1;
					}
				} else if ( typeof n == "object" ) {
					for ( var b in n ) {
						ClassModule.namedModules[ b ] = 1;
					}
				} else if ( typeof n == "string" ) {
					ClassModule.namedModules[ n ] = 1;
				}
				return this;
			},
			/**
			 * Reflect path.
			 * @memberof require(namespace)
			 * @param {String|Object.<String,String>} - Module name | Object.<String,String>: <"module name", "js path">.
			 * @param {String} [path] - JS path; If "name" is Object then "path" is optional.
			 * @returns {this}
			 */
			reflect: function( name, path ) {
				if ( typeof name == "object" ) {
					for ( var i in name ) {
						ClassModule.maps[ i ] = name[ i ];
					}
				} else if ( typeof name == "string" && typeof path == "string" ) {
					ClassModule.maps[ name ] = path;
				}

				return this;
			},
			/**
			 * @memberof require(namespace)
			 * @param {String}
			 * @param {String}
			 * @returns {this}
			 * @example
			 * require.variable( "app", "my/path/to/app" )
			 */
			variable: function( name, path ) {
				if ( name.indexOf( ClassModule.variablePrefix ) != 0 ) {
					name = ClassModule.variablePrefix + name;
				}
				if ( path ) {
					ClassModule.variableMap[ name ] = path;
				} else {
					return ClassModule.variableMap[ name ];
				}
			}
		} );

		util.extend( $, /** @lends aQuery */ {

			/**
			 * aQuery define.</br>
       * If the last parameter is a function, then first argument of the function is aQuery(namespace).</br>
       * <a href="/document/app/app.html#navmenu=#AMDQuery!scrollTo=Require_Define" target="_top">See also.</a>
			 * @param {String} - Module name
			 * @param {String[]|*} - If arguments[2] is a factory, it can be any object.
			 * @param {*} [factory] - Usually, it is function(){} or {}.
			 * @returns {this}
       * @example
       * aQuery.define("mymodule", function( $ ){
       *   // $ is aQuery
       * })
			 */
			define: function( id, dependencies, factory ) {
				var arg = util.argToArray( arguments, 0 ),
					len = arg.length,
					fn = arg[ len - 1 ];

				if ( typeof fn == "function" ) {
					arg[ arg.length - 1 ] = function() {
						var arg = util.argToArray( arguments, 0 );
						arg.splice( 0, 0, aQuery );
						if ( _config.amd.debug ) {
							return fn.apply( this, arg );
						} else {
							try {
								return fn.apply( this, arg );
							} finally {}
						}
					}

					window.define ? window.define.apply( null, arg ) : fn();
				}
				return this;
			},
			require: function( dependencies, success, fail ) {
				/// <summary>aQuery的require对象定义
				/// <para>遵循AMD规范重载</para>
				/// <para>会自动调用ready确定window和指定package准备完毕</para>
				/// </summary>
				/// <param name="dependencies" type="Array">依赖列表</param>
				/// <param name="success" type="Function">回调函数</param>
				/// <param name="fail" type="Function">失败的函数</param>
				/// <returns type="$" />
				// 将会在$ ready 后执行。这样便把sync实现起来了
				window.require && $.ready( function() {
					window.require( dependencies, success, fail )
				} );
				return this;
			}
		} );

		aQuery.define( "base/ClassModule", function( $ ) {
			/**
			 * Module Management
			 * @public
			 * @module base/ClassModule
			 */

			/**
			 * @typedef {module:base/ClassModule} ClassModule
			 */

			/**
			 * @public
			 * @alias module:base/ClassModule
			 * @constructor
			 */
			var exports = ClassModule;
			$.ClassModule = ClassModule;
			return exports;
		} );

	} )();

	aQuery.define( "base/config", function( $ ) {
		this.describe( "config of amdquery" );
		$.config = _config;
		return _config;
	} );

	aQuery.define( 'base/queue', function( $ ) {
		/**
		 * A module representing a queue.
		 * @public
		 * @module base/queue
		 */

		/**
		 * @typedef {module:base/queue} Queue
		 */

		/**
		 * @public
		 * @alias module:base/queue
		 * @constructor
		 */
		var exports = Queue;
		$.Queue = Queue;
		return exports;
	} );

	aQuery.define( "base/Promise", function( $ ) {
		"use strict"; //启用严格模式
		this.describe( "Class Promise" );
		var checkArg = function( todo, fail, progress, name ) {
			var arg = util.argToArray( arguments ),
				len = arg.length,
				last = arg[ len - 1 ],
				hasName = typeof last == "string",
				result, i = len,
				begin;

			begin = hasName ? len - 1 : len;
			for ( ; i < 4; i++ ) {
				arg.splice( begin, 0, null );
			}
			return arg;
		},
			random = 0,
			count = 0;

		/**
		 * @see http://wiki.commonjs.org/wiki/Promises/A
		 * @public
		 * @module base/Promise
		 * @example
		 * new Promise(function(){}, function(){})
		 * new Promise(function(){})
		 * new Promise()
		 */

		/**
		 * @typedef {module:base/Promise} Promise
		 */

		/**
		 * @public
		 * @alias module:base/Promise
		 * @constructor
		 */
		var Promise = function( todo, fail, progress ) {
			this.init( todo, fail, progress );
		}


		Promise.prototype = {
			constructor: Promise,
			/**
			 * Do next
			 * @private
			 */
			_next: function( result ) {
				for ( var i = 0, len = this.thens.length, promise; i < len; i++ ) {
					// 依次调用该任务的后续任务
					promise = this.thens[ i ];
					promise.resolve( result );
				}
				return this;
			},
			/**
			 * Push promise.
			 * @private
			 */
			_push: function( nextPromise ) {
				this.thens.push( nextPromise );
				return this;
			},
			/**
			 * Call todo, fail or progress.
			 * @param {String} - Function name.
			 * @param {*}
			 * @returns {*}
			 */
			call: function( name, result ) {
				switch ( name ) {
					case "fail":
					case "progress":
						break;
					case "todo":
					default:
						name = "todo";
				}

				return this[ name ].call( this.context, result );
			},
			/**
			 * Get property
			 * @param {String} - Property name.
			 * @returns {*}
			 */
			get: function( propertyName ) {
				return this[ propertyName ];
			},
			/**
			 * @param {Object} - Context of Promise.
			 * @returns {this}
			 */
			withContext: function( context ) {
				this.context = context;
				return this;
			},
			/**
			 * Then do...
			 * @param {Function} - Todo.
			 * @param {Function} - Fail next.
			 * @param {Function} - Progress.
			 * @returns {Promise}
			 */
			then: function( nextToDo, nextFail, nextProgress ) {
				var promise = new Promise( nextToDo, nextFail, nextProgress );
				if ( this.context !== this ) {
					promise.withContext( this.context );
				}
				promise.parent = this;
				if ( this.state != "todo" ) {
					// 如果当前状态是已完成，则nextOK会被立即调用
					promise.resolve( this.result );
				} else {
					// 否则将会被加入队列中
					this._push( promise );
				}
				return promise;
			},
			/**
			 * @constructs
			 * @param {Function=}
			 * @param {Function=}
			 * @param {Function=}
			 */
			init: function( todo, fail, progress ) {
				var arg = checkArg.apply( this, arguments );

				this.context = this;
				this.__promiseFlag = true;
				this.state = "todo";
				this.result = null;
				this.thens = [];
				this.todo = arg[ 0 ] || function( obj ) {
					return obj;
				};
				this.fail = arg[ 1 ] || null;
				this.progress = arg[ 2 ] || null;
				this.parent = null;
				this.friend = 0;
				this.asyncCount = 0;
				this.id = count++;

				return this;
			},
			/**
			 * Clear propery.
			 * @private
			 */
			_clearProperty: function() {
				this.result = null;
				this.thens = [];
				this.todo = null;
				this.fail = null;
				this.progress = null;
				this.parent = null;
				return this;
			},
			/**
			 * Destroy self.
			 * @returns {void}
			 */
			destroy: function() {
				var ancester = this,
					thens = ancester.thens,
					i, len = thens.length,
					result = 0,
					then;
				if ( thens.length ) {
					for ( i = len - 1; i >= 0; i-- ) {
						then = thens[ i ];
						then.destroy();
						then = thens.pop();
						then._clearProperty();
					}
				}
				this._clearProperty();
			},
			/**
			 * @param {*=} - result.
			 * @returns {this}
			 */
			resolve: function( obj ) {
				if ( this.state != "todo" ) {
					// util.error( {
					//   fn: "Promise.resolve",
					//   msg: "already resolved"
					// } )
					return this;
				}

				if ( Promise.forinstance( this.result ) ) {
					this.result.resolve( obj );
					return this;
				} else if ( this.fail ) {
					try {
						this.state = "done";
						this.result = this.call( "todo", obj );

					} catch ( e ) {
						this.state = "fail";
						this.result = this.call( "fail", obj );

					}
				} else {
					this.state = "done";
					this.result = this.call( "todo", obj );

				}

				if ( Promise.forinstance( this.result ) && this.result !== this ) {
					var
					self = this,
						state = this.state,
						callback = function( result ) {
							self.state = state;
							self.result = result;
							self._next( result );
							self = null;
						};

					this.state = "todo";
					this.result.then( callback );
				} else {
					this._next( this.result );
				}
				return this;
			},
			/**
			 * The new promise is siblings.
			 * @param {Function=}
			 * @param {Function=}
			 * @param {Function=}
			 * @returns {Promise}
			 * @example
			 * new Promise().and(todo).and(todo);
			 */
			and: function( todo, fail, progress ) {
				var self = this.parent || this,
					promise = self.then( todo, fail, progress );
				promise.friend = 1;
				self.asyncCount += 1;
				return promise;
			},
			/**
			 * Relative method "and".
			 * @param {Promise} [promise=this]
			 * @param {*=} - result
			 * @returns {Promise}
			 * @example
			 * function delay(ms) {
			 *   return function (obj) {
			 *       var promise = new Promise;
			 *       var self = this;
			 *       setTimeout(function () {
			 *           promise.together(self, obj);
			 *       }, ms);
			 *       return promise;
			 *   };
			 * };
			 * new Promise().and(delay(1000)).and(delay(2000));
			 */
			together: function( promise, obj ) {
				var i = 0,
					parent = promise.parent || this.parent,
					thens = parent.thens,
					len = thens.length,
					then;
				parent.asyncCount = Math.max( --parent.asyncCount, 0 );
				for ( i = 0; i < len; i++ ) {
					then = thens[ i ];
					if ( then.friend ) {
						if ( parent.asyncCount > 0 ) {
							return this;
						}
					}
				}
				for ( i = 0; i < len; i++ ) {
					then = thens[ i ];
					Promise.forinstance( then.result ) && then.result.resolve( obj );
				}
				return this;
			},
			/**
			 * @returns {Boolean}
			 */
			finished: function() {
				return this.state === "done";
			},
			/**
			 * @returns {Boolean}
			 */
			unfinished: function() {
				return this.state === "todo";
			},
			/**
			 * Get root promise.
			 * @returns {Promise}
			 */
			root: function() {
				var parent = this;
				while ( parent.parent ) {
					parent = parent.parent;
				}
				return parent;
			}
		};

		/**
		 * Whether it is "Promise" instances.
		 * @param {Promise}
		 * @returns {Boolean}
		 */
		Promise.forinstance = function( promise ) {
			return promise instanceof Promise || ( promise ? promise.__promiseFlag === true : false );
		}

		return Promise;
	} );

	aQuery.define( "base/ready", [ "base/Promise" ], function( $, Promise ) {
		"use strict"; //启用严格模式
		this.describe( "Life Cycle of AMDQuery" );

		/**
		 * Life Cycle of AMDQuery.
		 * @public
		 * @module base/ready
		 */

		/**
		 * @typedef {module:base/ready} ready
		 */

		/**
		 * @public
		 * @alias module:base/ready
		 * @method
		 * @param {Function} - When AMDQuery ready to call the callback function
		 * @example
		 * require("base/ready", function( ready ) {
		 *   ready(function(){
		 *
		 *   });
		 * } );
		 */
		var ready = function( fn ) {
			setTimeout( function() {
				rootPromise.and( fn );
			}, 0 );
		}, rootPromise;

		rootPromise = new Promise( function() {
			// 预处理设置
			if ( _config.app.src ) {
				var src = _config.app.src;
				// _config.ui.initWidget = true;

				src = src.replace( /([\\\/])[^\\\/]*$/, "$1" );
				src = src.replace( /\/$/, "" );

				require.variable( "app", src );
			}
		} ).then( function() { //window.ready first to fix ie
			document.documentElement.style.position = "absolute";
			document.documentElement.style.left = "100000px";
			var promise = new Promise,
				ready = function( e ) {
					setTimeout( function() {
						// define will be call before this ready
						promise.resolve( e );
					}, 0 );
					if ( document.addEventListener ) {
						document.removeEventListener( "DOMContentLoaded", ready );
					} else if ( document.attachEvent ) {
						document.detachEvent( "onreadystatechange", ready );
					} else {
						document.onload = null;
					}
					ready = null;
				}
			if ( document.addEventListener ) {
				document.addEventListener( "DOMContentLoaded", ready, false );
			} else if ( document.attachEvent ) {
				document.attachEvent( "onreadystatechange", function( e ) {
					if ( document.readyState === "complete" ) {
						ready( e );
					};
				} );
			} else {
				document.onload = ready;
			}

			return promise;
		} ).then( function() {
			if ( _config.app.src ) {
				var promise = new Promise;
				require( _config.app.src, function( Application ) {
					new Application( promise );
				} );
				return promise;
			}
		} ).then( function() {
			if ( _config.ui.initWidget && !_config.app.src ) {
				var promise = new Promise;
				require( "module/initWidget", function( initWidget ) {
					initWidget.renderWidget( promise, document.body );
				} );
				return promise;
			}
		} ).then( function() {
			document.documentElement.style.left = "0px";
			document.documentElement.style.position = "";
		} ).root().resolve();

		return $.ready = ready;
	} );

	window.aQuery = $;

	if ( !window[ _config.amdquery.define ] ) {
		window[ _config.amdquery.define ] = $;
	} else {
		util.error( _config.amdquery.define + " is defined" );
	}

} )( window );