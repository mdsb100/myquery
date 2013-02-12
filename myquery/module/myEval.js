﻿/// <reference path="../myquery.js" />
// quote from colo.js by Andrew Brehaut, Tim Baumann

myQuery.define('module/myEval', ['base/support'], function ($, support) {
    return {
        evalBasicDataType: function(str){
            /// <summary>如果是基本数据类型就eval</summary>
            /// <param name="s" type="String"></param>
            /// <returns type="any" />
            if($.isStr(str) && /^\d+(.[\d]*)?$|true|false|undefined|null|NaN/.test(str)) {
                return eval(str);
            }
            return str;
        },

        functionEval: function (s, context) {
            /// <summary>使用Funciont来eval</summary>
            /// <param name="s" type="String"></param>
            /// <param name="context" type="Object">作用域</param>
            /// <returns type="any" />
            return (new Function("return " + s)).call(context);
        },

        globalEval: function (data) {
            ///	<summary>
            ///	把一段String用js的方式声明为全局的
            ///	</summary>
            /// <param name="data" type="String">数据</param>
            /// <returns type="XMLHttpRequest" />

            if (data && /\S/.test(data)) {
                // Inspired by code by Andrea Giammarchi
                // http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
                var head = document.getElementsByTagName("head")[0] || document.documentElement,
				    script = document.createElement("script");

                script.type = "text/javascript";

                if (support.scriptEval) {
                    script.appendChild(document.createTextNode(data));
                } else {
                    script.text = data;
                }

                // Use insertBefore instead of appendChild to circumvent an IE6 bug.
                // This arises when a base node is used (#2709).
                head.insertBefore(script, head.firstChild);
                head.removeChild(script);
            }
            return this;
        }
    };
});