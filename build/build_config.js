//Configurate amdquery.js
exports.amdqueryPath = '../amdquery/';

//Configurate project root path
exports.projectRootPath = '../../';

//All build files will save to outputPath
exports.outputPath = 'output/';

//mapping of path for AMD
exports.pathVariable = {

}

exports.debug = false;

//All apps entrance
exports.apps = [
  {
    name: "document",
    path: "../document/app/app.html"
  }
 ]

exports.defines = {
  test: {
    path: "../document/app/asset/source/js/scrollTo",
    directory: [ "ui/" ]
  }
}

//Compress level of JS Minifier
exports.levelOfJSMin = 3;
/*
minimal:1,//ratio:75%
conservative:2,//ratio:68%
agressive:3//ratio:67%
*/

//Compress configuration of UglifyJS
exports.uglifyOptions = {
  strict_semicolons: false,
  mangle_options: {
    mangle: true,
    toplevel: false,
    defines: null,
    except: null,
    no_functions: false
  },
  squeeze_options: {
    make_seqs: true,
    dead_code: true,
    no_warnings: false,
    keep_comps: true,
    unsafe: false
  },
  gen_options: {
    indent_start: 0,
    indent_level: 4,
    quote_keys: false,
    space_colon: false,
    beautify: false,
    ascii_only: false,
    inline_script: false
  }
};

exports.cleanCssOptions = {
  //* for keeping all (default), 1 for keeping first one only, 0 for removing all
  keepSpecialComments: "*",
  //whether to keep line breaks (default is false)
  keepBreaks: false,
  //whether to process @import rules
  processImport: true,
  //whether to skip URLs rebasing
  noRebase: false,
  //set to true to disable advanced optimizations - selector & property merging, reduction, etc.
  noAdvanced: false,
  //ie8 for IE8 compatibility mode, * for merging all (default)
  selectorsMergeMode: "*"
}