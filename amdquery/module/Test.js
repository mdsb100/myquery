aQuery.define( "module/Test", [ "base/Promise" ], function( $, Promise ) {
	"use strict";
	var logger, error, info, debug;
	if ( window.console && window.console.log.bind ) {
		logger = $.logger;
		error = $.error;
		info = $.info;
		debug = $.debug;
	} else {
		var dialog = $.createEle( "pre" );

		dialog.style.cssText = "display:block;position:absolute;width:600px;height:200px;overflow:scroll;z-index:1000000;";
		dialog.style.right = "0px";
		dialog.style.top = "0px";
		document.body.appendChild( dialog );

		var colorMap = {
			log: "green",
			error: "red",
			info: "black",
			debug: "orange"
		};

		var input = function( type, arg ) {
			dialog.innerHTML = ( dialog.innerHTML + '<p style="color:' + colorMap[ type ] + '" >' + "<strong>" + type + ":<strong>" + arg.join( " " ) + '</p>' + "\n" );
		};

		logger = function() {
			input( "log", $.util.argToArray( arguments ) );
		};

		error = function() {
			input( "error", $.util.argToArray( arguments ) );
		};

		info = function() {
			input( "info", $.util.argToArray( arguments ) );
		};

		debug = function() {
			input( "debug", $.util.argToArray( arguments ) );
		};

	}

	function Test( name ) {
		this.name = "[" + name + "]";
		this.promise = new Promise( function() {
			logger( this.name, "Test start", "Test:" + this.count );
		} ).withContext( this );
		this.count = 0;
		this.fail = 0;
	}

	Test.logger = logger;
	Test.error = error;
	Test.info = info;
	Test.debug = debug;

	var ssuccess = "√",
		sfail = "X";

	Test.prototype = {
		constructor: Test,
		execute: function( describe, executeFn, executeFnContext, executeFnArg ) {
			this.count++;
			this.promise.then( function() {
				try {
					executeFn.apply( executeFnContext, executeFnArg || [] );
					logger( this.name, describe, "execute", ssuccess );
				} catch ( e ) {
					this.fail++;
					error( this.name, describe, "execute", sfail, e );
					throw e;
				}
			} );
			return this;
		},
		executeAsync: function( describe, executeFn, executeFnContext, executeFnArg ) {
			this.count++;
			var promise = new Promise( function() {
				try {
					executeFn.apply( executeFnContext, executeFnArg || [] );
					logger( this.name, describe, "executeAsync", ssuccess );
				} catch ( e ) {
					this.fail++;
					error( this.name, describe, "executeAsync", sfail, e );
					throw e;
				}
			} ).withContext( this );

			this.promise.then( function() {
				return promise;
			} );

			return promise;
		},
		equal: function( describe, value, resultBackFn, backFnContext, backFnArg ) {
			this.count++;
			this.promise.then( function() {
				try {
					var result = resultBackFn.apply( backFnContext, backFnArg || [] );
				} catch ( e ) {
					this.fail++;
					error( this.name, describe, value + " equal " + result, sfail, e );
					throw e;
				}
				if ( result === value ) {
					logger( this.name, describe, value + " equal " + result, ssuccess );
				} else {
					this.fail++;
					error( this.name, describe, value + " equal " + result, sfail );
				}
			} );
			return this;
		},
		equalAsync: function( describe, value, resultBackFn, backFnContext, backFnArg ) {
			this.count++;
			var promise = new Promise( function() {
				try {
					var result = resultBackFn.apply( backFnContext, backFnArg || [] );
				} catch ( e ) {
					this.fail++;
					error( this.name, describe, value + " equal " + result, sfail, e );
					throw e;
				}
				if ( result === value ) {
					logger( this.name, describe, value + " equalAsync " + result, ssuccess );
				} else {
					this.fail++;
					error( this.name, describe, value + " equalAsync " + result, sfail );
				}
			} ).withContext( this );

			this.promise.then( function() {
				return promise;
			} );

			return promise;
		},
		start: function() {
			this.promise.then( function() {
				Test[ this.fail == 0 ? "logger" : "error" ]( this.name, "Test stop", "Test:" + this.count, "Success" + ( this.count - this.fail ), "Fail:" + this.fail );
			} );
			this.promise.root().resolve();
			return this;
		}
	};

	return Test;
} );