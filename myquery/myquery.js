﻿/*!
* myQuery JavaScript Library 1.0.0

* Copyright 2012, Cao Jun

*/

(function (window, undefined) {
    "use strict"; //启用严格模式

    var 
    version = "MyQuery 1.0.0"
    , tools = {
        argToArray: function (arg, start, end) {
            /// <summary>把arguments变成数组</summary>
            /// <param name="arg" type="arguments]">arguments</param>
            /// <param name="start" type="Number">开始</param>
            /// <param name="end" type="Number">结束</param>
            /// <returns type="Array" />
            return [].slice.call(arg, start || 0, end || arg.length);
        }

        , console: (function () {
            var console = {
                log: function (info) {
                    /// <summary>控制台记录</summary>
                    /// <para>info.fn</para>
                    /// <para>info.msg</para>
                    /// <param name="info" type="String/Object">方法名</param>
                    /// <returns />
                    var a = arguments[2] || "log";
                    if (window.console[a]) {
                        var s = "";
                        if (info.fn && info.msg) {
                            s = ["call ", info.fn, "()", " error: ", info.msg].join("");
                        }
                        else {
                            s = info.toString();
                        }
                        window.console[a](s);
                    }
                }
                  , warn: function (info) {
                      /// <summary>控制台警告</summary>
                      /// <para>info.fn</para>
                      /// <para>info.msg</para>
                      /// <param name="info" type="String/Object">方法名</param>
                      /// <returns />
                      this.log(info, "warn");
                  }
                  , info: function (info) {
                      /// <summary>控制台信息</summary>
                      /// <para>info.fn</para>
                      /// <para>info.msg</para>
                      /// <param name="info" type="String/Object">方法名</param>
                      /// <returns />
                      this.log(info, "info");
                  }
                  , error: function (info, isThrow) {
                      /// <summary>控制台错误</summary>
                      /// <para>info.fn</para>
                      /// <para>info.msg</para>
                      /// <param name="info" type="String/Object">方法名</param>
                      /// <param name="isThrow" type="Boolean">是否强制曝出错误</param>
                      /// <returns />
                      var s = "";
                      if (info.fn && info.msg) {
                          s = ["call ", info.fn, "()", " error: ", info.msg].join("");
                      }
                      else {
                          s = info.toString();
                      }
                      if (window.console.error || !isThrow) {
                          window.console.error(s);
                      }
                      else {
                          throw new window[isThrow](s);
                      }
                  }
            };
            return console;
        })()

        , error: function (info, type) {
            var s = "";
            if (info.fn && info.msg) {
                s = ["call ", info.fn, "()", " error: ", info.msg].join("");
            }
            else {
                s = info.toString();
            }
            throw new window[type || "Error"](s);
        }
        , extend: function (a, b) {
            /// <summary>把对象的属性复制到对象一</summary>
            /// <param name="a" type="Object">对象</param>
            /// <param name="b" type="Object">对象</param>
            /// <returns type="a" />
            for (var i in b)
                a[i] = b[i];
            return a;
        }

        , getJScriptConfig: function (list, asc) {
            /// <summary>获得脚本配置属性</summary>
            /// <param name="list" type="Array:[String]">参数名列表</param>
            /// <param name="asc" type="Boolean">true为正序，兼容IE，意味着JS总是插入到第一个</param>
            /// <returns type="Object" />
            var _scripts = document.getElementsByTagName("script")
            , _script = _scripts[asc === true ? 0 : _scripts.length - 1]
            , i = 0, j = 0, item, attrs, attr, result = {};
            for (; item = list[i++]; ) {
                attrs = (_script.getAttribute(item) || "").split(/,|;/);
                if (item == "src") {
                    result[item] = attrs[0];
                    break;
                }
                j = 0;
                result[item] = {};
                for (; attr = attrs[j++]; ) {
                    attr = attr.split(/:|=/);
                    if (attr[1]) {
                        attr[1].match(/false|true|1|0/) && (attr[1] = eval(attr[1]));
                        result[item][attr[0]] = attr[1];
                    }
                    else {
                        attr[1].match(/false|true|1|0/) && (attr[0] = eval(attr[1]));
                        result[item] = attr[0];
                    }
                }
            }
            return result;
        }
        , getPath: function (key, suffix) {
            /// <summary>获的路径</summary>
            /// <param name="list" type="Array:[String]">参数名列表</param>
            /// <param name="asc" type="Boolean">true为正序，兼容IE，意味着JS总是插入到第一个</param>
            /// <returns type="Object" />
            var _key = key, _suffix = suffix, _aKey, _url, ma;
            if (!_suffix) { _suffix = '.js'; }
            if (ma = _key.match(/\.[^\/\.]*$/g)) {
                _url = _key;
                if (ma[ma.length - 1] != _suffix) {
                    _url += _suffix
                }
            } else {
                _url = basePath + '/' + _key + (_suffix || ".js");
            }
            if (/^\//.test(_url)) {
                _url = rootPath + _url.replace(/\//, '');
            } else if (!/^[a-z]+?:\/\//
            .test(_url)) {
                _url = basePath + '/' + _url;
            }
            return _url;
        }

        , now: function () {
            /// <summary>返回当前时间的字符串形式</summary>
            /// <returns type="String" />
            return (new Date()).getTime();
        }
    }
    , count = 0
    , reg = RegExp
    , basePath = (function () {
        var ret = tools.getJScriptConfig(["src"]).src.replace(/\/[^\/]+$/, '');
        if (!/^[a-z]+?:\/\//
        .test(ret)) {
            var sl = document.location.toString();
            if (/^\//.test(ret)) {
                ret = sl.replace(/((.*?\/){3}).*$/, '$1') + ret.substr(1);
            } else {
                ret = sl.replace(/[^\/]+$/, '') + ret;
            }
        }
        return ret;
    } ())
    , rootPath = basePath.replace(/((.*?\/){3}).*$/, '$1')
    , msgDiv, runTime
    , ie678 = "v" == "/v";

    var _config = {
        myquery: {
            define: "$"
          , amd: false
          , package: ""
        },
        amd: {
            async: false
            , detectCR: false
            , "debug": true
            , timeout: 30000
        },
        model: {

        }
    };

    if (typeof myQueryConfig != "undefined") {
        _config = myQueryConfig;
    }
    else {
        var temp = tools.getJScriptConfig(["myquery", "amd", "model"]);
        tools.extend(_config.myquery, temp.myquery);
        tools.extend(_config.amd, temp.amd);
        tools.extend(_config.model, temp.model);
    }

    //$("<div></div>") 需要自己先parseXML 这样就不用依赖 parseXML
    var myQuery = function (a, b, c) {
        /// <summary>创造一个新$对象
        /// <para>例:$(function(){将会在window.onload时执行})</para>
        /// <para>例:$('div')</para>
        /// <para>例:$([ele,ele,ele])</para>
        /// <para>以下依赖main/query</para>
        /// <para>例:$($('#A'))</para>
        /// <para>以下依赖main/dom</para>
        /// <para>例:$({h:100,w:100},'div')</para>
        /// <para>例:$(null,'div',document.body)</para>
        /// <para>例:$({h:100,w:100},'div',document.body)</para>
        /// <para>对于table的appendChild,removeChild可能不兼容低版本IE浏览器,table必须插入tbody</para>
        /// </summary>
        /// <param name="a" type="Object/String/Element/fun/$">可重载</param>
        /// <param name="b" type="String">标签名 可选</param>
        /// <param name="c" type="ele $">父元素 可选</param>
        /// <returns type="$" />
        if ($.is$(this)) {
            if (!a && !b) return;
            if ((typeof a == "object" || a == undefined || a == null) && typeof b == "string") {
                //if ($.css) {
                count++;
                if (b == undefined || b == null)
                    b = 'div';
                var obj = document.createElement(b);
                this.init([obj]);

                $.interfaces.trigger("constructorDom", this, a, b, c);

                obj = null;

            }
            else if (a) {
                var result;
                if (result = $.interfaces.trigger("constructorQuery", a, b)) {
                    count++;
                    this.init(result);

                }
            }
        }
        else if (typeof a == "function") {
            $.ready(a);
        }
        else
            return new $(a, b, c);
    }, $ = myQuery;

    tools.extend($, {
        client: {
            browser: {
                ie678: ie678
            }
            , engine: {
                ie678: "v" == "/v"
            }
            , system: {}
            , language: ""
        }
        , color: {
            toRGB: function (c) {
                var r, g, b;
                if ($.isStr(c)) {
                    //                if (css_colors[c]) {
                    //                    c = css_colors[c];
                    //                }
                    if (c.indexOf("#") == 0) {
                        var 
                    r = '0x' + c.substring(1, 3),
                    g = '0x' + c.substring(3, 5),
                    b = '0x' + c.substring(5, 7);
                    }
                    else if (c.indexOf("rgb") == 0) {
                        return c;
                    }
                }
                else if (c.hasOwnProperty('red') && c.hasOwnProperty('green') && c.hasOwnProperty('blue')) {
                    r = c.red;
                    g = c.green;
                    b = c.blue;
                }
                else {
                    return "";
                }
                return ['rgb(', +r, ',', +g, ',', +b, ')'].join('');
            }
            , toRGBA: function (c, a) {
                c = $.color.toRGB(c);
                if (c && c.indexOf("rgb") == 0)
                    return c.replace("rgb", "rgba").replace(")", "," + a + ")");
            }
        }
        , config: _config
        , copyright: "2012 Cao Jun"
        , interfaces: {
            achieve: function (name, fun) {
                /// <summary>实现一个接口</summary>
                /// <param name="name" type="String">接口名</param>
                /// <param name="name" type="String">要实现的方法</param>
                /// <returns type="Self" />
                $.interfaces.handlers[name] = fun;
                return this;
            }
            , trigger: function (name) {
                /// <summary>对外接口调用 内部的</summary>
                /// <param name="name" type="String">接口名</param>
                /// <returns type="any" />
                var item = $.interfaces.handlers[name];
                return item && item.apply(this, arguments);
            }
            , handlers: {
                editCssType: null
                , editEventType: null
                , proxy: null
                , constructorDom: null
                , constructorQuery: null
            }

        }
        , math: {}
        , module: {}
        , toString: function () {
            /// <summary></summary>
            /// <returns type="String" />
            return "MyQuery";
        }
        , support: {}
        , ui: {}
        , valueOf: function () {
            /// <summary>返回模块信息</summary>
            /// <returns type="String" />
            var info = [version, "\n"];
            myQuery.each($.module, function (value, key) {
                info.push(key, " : ", value, "\n");
            });
            return info.join("");
        }
        , version: version
        , _redundance: {
            argToArray: tools.argToArray
        }

        , argToArray: tools.argToArray

        , between: function (min, max, num) {
            /// <summary>如果num在min和max区间内返回num否则返回min或max</summary>
            /// <param name="min" type="Number">最小值</param>
            /// <param name="max" type="Number">最大值</param>
            /// <param name="num" type="Number">要比较的值</param>
            /// <returns type="Number" />

            return Math.max(min, Math.min(max, num));
        }
        , bind: function (fun, context) {
            /// <summary>绑定作用域</summary>
            /// <param name="fun" type="Function">方法</param>
            /// <param name="context" type="Object">context</param>
            /// <returns type="Function" />
            return function () {
                return fun.apply(context || window, arguments);
            }

        }

        , camelCase: function (name, head) {
            /// <summary>把"margin-left驼峰化"</summary>
            /// <param name="name" type="String">字符串</param>
            /// <param name="head" type="String">字符串头</param>
            /// <returns type="String" />
            name.indexOf("-") > 0 ? name = name.toLowerCase().split("-") : name = [name];

            head && name.splice(0, 0, head);

            for (var i = 1, item; i < name.length; i++) {
                item = name[i]
                name[i] = item.substr(0, 1).toUpperCase() + item.slice(1);
            }
            return name.join("");
        }
        , console: tools.console
        , createEle: function (tag) {
            /// <summary>制造一个Dom元素</summary>
            /// <param name="tag" type="String">标签名</param>
            /// <returns type="Element" />
            var ele, div;
            if (/^<.*>$/.test(tag)) {
                div = document.createElement("div");
                div.innerHTML = tag;
                ele = div.childNodes
                div = null;
            } else {
                ele = document.createElement(tag);
            }
            return ele;
        }

        , each: function (obj, callback, context) {
            /// <summary>对象遍历</summary>
            /// <param name="obj" type="Object">对象</param>
            /// <param name="callback" type="Function">执行方法</param>
            /// <param name="context" type="Object">作用域</param>
            /// <returns type="self" />

            //consult from jQuery-1.4.1 
            if (!obj)
                return this;
            var i = 0, item,
                len = obj.length,
			    isObj = typeof len != "number" || typeof obj == "function"; //$.isNul(len) || $.isFun(obj);
            if (isObj) {
                for (item in obj)
                    if (callback.call(context || obj[item], obj[item], item) === false)
                        break;
            }
            else
                for (var value = obj[0]; i < len && callback.call(context || value, value, i) !== false; value = obj[++i]) { }
            return this;
        }

        , getJScriptConfig: tools.getJScriptConfig
        , getPath: tools.getPath
        , getRunTime: function (unit) {
            /// <summary>检测运行时间</summary>
            /// <param name="unit" type="Boolean">默认为秒,true为毫秒</param>
            /// <returns type="self" />
            var _now = new Date();
            if (runTime) {
                var _info = (_now - runTime);
                _info = !unit ? _info / 1000 + '秒' : _info + "毫秒";
                !$.client.browser.ie678 ? tools.console.info({ fn: "myQuery.getRunTime", msg: _info }) : $.showMsg(_info);
                runTime = null;
            }
            else
                runTime = now;
            return this;
        }
        , getValueAndUnit: function (value) {
            /// <summary>返回一个字符串的数值和单位
            /// <para>obj.value</para>
            /// <para>obj.unit</para>
            /// <para>默认2个值是undefined</para>
            /// </summary>
            /// <param name="value" type="String">字符串</param>
            /// <returns type="Object" />
            var result = { value: value, unit: "" };
            if (typeof value == "number") {
                result.value = value
            } else if (typeof value == "string") {
                value = value.match($.reg.valueAndUnit);
                if (value) {
                    var num = parseFloat(value[0]);
                    if (num != undefined) {
                        result.value = num;
                        result.unit = value[0].replace(num.toString(), "") || "";
                    }
                }
            }
            return result;
        }

        , now: tools.now

        , reg: {
            num: /^(-?\\d+)(\\.\\d+)?$/
                , className: function (className) {
                    return reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
                }
                , id: /^#((?:[\w\u00c0-\uFFFF-]|\\.)+)/
            ///^#[\w\d]+/
                , tagName: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/
            ///^[a-zA-Z]+|\*/
                , search: /^>/
                , find: /^\s/
                , filter: /^:/
                , int: /(\+|\-)?\d+/g
                , eq: /^eq\(([\+\-]?\d+),\+?(\d+)?\)/
                , than: /^(gt|lt)\(([\-\+]?\d+)\)/
                , css: /^\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/
            ///^\.[\w\d]+/
                , valueAndUnit: /[+-]?\d+\.?\d*\w+/g
                , property: /^\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/
                , numAndEng: /[A-Za-z0-9]+/
                , pEqual: /[!\^\*\$]?=?/

                , rupper: /([A-Z]|^ms)/g
                , rnumnonpx: /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i
        }

        , showMsg: function (str, bool) {
            /// <summary>设置浏览器标题或者显示个div 点击会自动消失</summary>
            /// <param name="str" type="any">任何对象都将被toString显示</param>
            /// <param name="bool" type="Boolean">为true的话使用div显示否则在title显示</param>
            /// <returns type="self" />
            str = str.toString();
            if (bool) {
                if (msgDiv) {
                    msgDiv.innerHTML = str;
                    msgDiv.style.display = "block";
                }
                else {
                    msgDiv = document.createElement("div");
                    var s = msgDiv.style;
                    s.top = 0;
                    s.left = 0;
                    s.zIndex = 1001;
                    s.position = "absolute";
                    s.display = "block";
                    s.innerHTML = str;
                    s.fontSize = "18px";
                    msgDiv.onclick = function () {
                        this.style.display = "none";
                    };
                    document.body.appendChild(msgDiv);
                }
            }
            else {
                document.title = str;
            }
            return this;

        }

        , trim: function (str) {
            /// <summary>去除前后的空格换行符等字符</summary>
            /// <param name="str" type="String">长度 缺省为整个长度</param>
            /// <returns type="String" />
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }

        , unCamelCase: function (name, head) {
            /// <summary>反驼峰化</summary>
            /// <para>marginLeft => margin-left</para>
            /// <param name="name" type="String">字符串</param>
            /// <param name="head" type="String">字符串头</param>
            /// <returns type="String" />
            name = name.replace($.reg.rupper, "-$1").toLowerCase();
            head && (name = head + "-" + name);
            return name;
        }
    });

    $.fn = $.prototype = {
        addElement: function (ele) {
            /// <summary>添加元素或元素组</summary>
            /// <param name="ele" type="Element/arr">内容为元素的数组或元素</param>
            /// <returns type="self" />
            $.isEle(ele) && this.eles.push(ele);
            $.isArr(eles) && $.each(eles, function (ele) {
                $.isEle(ele) && this.eles.push(ele);
            }, this);
            return this
        }

        , constructor: $

        , each: function (callback) {
            /// <summary>遍历所有的元素</summary>
            /// <param name="callback" type="Function">遍历中的操作</param>
            /// <returns type="self" />
            $.each(this.eles, callback, this);
            return this;
        }
        , eles: null

        , first: null

        , getFirst: function () {
            /// <summary>返回第一个元素</summary>
            /// <returns type="Element" />
            return $(this.eles[0]);
        }
        , getElement: function (index) {
            /// <summary>返回序号的元素</summary>
            /// <param name="index" type="Number">序号</param>
            /// <returns type="Element" />
            if ($.isNum(index) && index != 0)
                return this[index];
            else
                return this[0];
        }
        , getLast: function () {
            /// <summary>返回最后个元素</summary>
            /// <returns type="Element" />
            return $(this.eles[this.eles.length - 1]);
        }

        , sort: function (fun) {
            /// <summary>排序</summary>
            /// <param name="fun" type="Function">筛选条件</param>
            /// <returns type="self" />
            this.eles.sort(fun);
            return this;
        }

        , init: function (eles) {
            /// <summary>初始化$</summary>
            /// <param name="eles" type="Array">内容为元素的数组</param>
            /// <returns type="self" />

            this.eles = null;
            this.first = null;
            this.last = null;
            this.context = null;
            if (!eles.length) {
                //tools.console.warn({ fn: "myQuery.init", msg: "has not query any element" });
            }
            if (this.eles)
                this.each(function (ele, index) {
                    delete this[index];
                });
            this.eles = eles;

            this.each(function (ele, index) {
                this[index] = ele;
            });
            this.length = eles.length;
            this.first = this[0];
            this.last = this[this.length - 1];

            this.context = this[0] ? this[0].ownerDocument : document;
            return this;
        }
        , indexOf: function (ele) {
            /// <summary>返回序号</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <returns type="Number" />
            return $.inArray(this.eles, ele);
        }

        , last: null
        , length: 0

        , reverse: function () {
            /// <summary>反转</summary>
            /// <returns type="self" />
            this.eles.reverse();
            return this;
        }

        , setElement: function (eles) {
            /// <summary>设置元素组</summary>
            /// <param name="eles" type="Array">内容为元素的数组</param>
            /// <returns type="self" />
            this.eles = [];
            $.isArr(eles) && $.each(eles, function (ele) {
                $.isEle(ele) && this.eles.push(ele);
            }, this);
        }

        , toString: function () {
            /// <summary>返回元素组的字符串形式</summary>
            /// <returns type="String" />
            return this.eles.toString();
        }

        , valueOf: function () {
            /// <summary>返回生成$对象的总数</summary>
            /// <returns type="Number" />
            return count;
        }

        , version: version
    };

    function Queue() {
        this.list = [];
    }

    Queue.prototype = {
        constructor: Queue,
        queue: function (fn, context, args) {
            if (typeof fn == "function") {
                this.list.push(fn);
                if (this.list[0] != "inprogress") {
                    this.dequeue(context, args);
                }
            }
            else if (fn && fn.constructor == Array) {
                this.list = fn;
            }
            return this;
        },
        dequeue: function (context, args) {
            var fn = this.list.shift()
            if (fn && fn === "inprogress") {
                fn = this.list.shift();
            }

            if (fn) {
                this.list.splice(0, 0, "inprogress");
                fn.apply(context, args);
            }
            return this;

        },
        clearQueue: function () {
            return this.queue([]);
        }
    };

    (function (/*require*/) {
        "use strict"; //启用严格模式
        $.module.require = "1.0.0";

        var _define, _require;
        if (window.define) {
            tools.console.warn("window.define has defined");
            _define = window.define;
        }
        if (window.require) {
            tools.console.warn("window.require has defined");
            _require = window.require;
        }

        var requireQueue = new Queue();

        function ClassModule(module, dependencies, factory, status, container, fail) {
            if (!module) { return; }
            this.handlers = {};
            this.module = null;
            this.id = module;
            this.init(dependencies, factory, status, container, fail);
            ClassModule.setModule(module, this);

            //this.check();

        }
        //0:init 1:queue 2:require 3:define 4:ready

        //0 init 1 require 2define 3ready
        tools.extend(ClassModule, {
            anonymousID: null
            , cache: {}
            , container: {}
            , dependenciesMap: {}
            , detectCR: function (md, dp) {
                /// <summary>检测模块是否存在循环引用,返回存在循环引用的模块名</summary>
                /// <param name="md" type="String">要检测的模块名</param>
                /// <param name="dp" type="Array:[String]">该模块的依赖模块</param>
                /// <returns type="String" />
                if (!md) { return; }
                if (dp && dp.constructor != Array) { return; }
                var i, DM, dm, result, l = dp.length, dpm = ClassModule.dependenciesMap
                    , mdp = ClassModule.mapDependencies;
                for (i = 0; i < l; i++) {
                    dm = dp[i];
                    if (dm === md) { return dm; } //发现循环引用
                    if (!dpm[md]) { dpm[md] = {}; }
                    if (!mdp[dm]) { mdp[dm] = {}; }
                    dpm[md][dm] = 1;
                    mdp[dm][md] = 1; //建表
                }
                for (DM in mdp[md]) {
                    result = ClassModule.detectCR(DM, dp); //反向寻找
                    if (result) { return result; }
                }
            }
            , funBody: function (md) {
                //将factory强制转换为function类型，供ClassModule使用
                if (!md) { md = ''; }
                switch (typeof md) {
                    case 'function': return md;
                    case 'string': return function () { return new String(md); };
                    case 'number': return function () { return new Number(md); };
                    case 'boolean': return function () { return new Boolean(md); };
                    default: return function () { return md; };
                }
            }
            , getContainer: function (id, a) {
                var src;
                if (ClassModule.container[id]) {
                    src = ClassModule.container[id];
                }
                else {
                    src = tools.getJScriptConfig(["src"], typeof a == "boolean" ? a : true).src || "it is local"; //或者改成某个字段是 config里的
                    id && (ClassModule.container[id] = src);
                }
                return src;
            }
            , getPath: function (key, suffix) {
                var ret, path, ma;
                if (path = ClassModule.maps[key]) { } //不需要匹配前部分
                else { path = key }

                if (_config.amd.rootPath) {
                    ma = key.match(/\.[^\/\.]*$/g)
                    if (!ma || ma[ma.length - 1] != suffix) {
                        key += suffix;
                    }
                    ret = _config.amd.rootPath + key;
                }
                else {
                    ret = tools.getPath(path, suffix);
                }
                return ret;
            }
            , getModule: function (k) {
                return this.modules[k];
            }
            , holdon: {}
            , loadDependencies: function (dependencies) {//要改
                var dep = dependencies, i = 0, len, item, module;
                if (!dep || dep.constructor == Array || dep.length) { return this; }
                setTimeout(function () {
                    for (len = dep.length; i < length; i++) {//是否要用function 而不是for
                        item = dep[i];
                        module = ClassModule.getModule(item);
                        if (!module) {
                            require(item);
                        }
                        else if (module.getStatus() == 2) {
                            ClassModule.loadDependencies(module.dependencies);
                        }
                    }
                }, 0);
                return this;
            }
            , loadJs: function (url, id, error) {
                var module = ClassModule.getModule(id);
                //该模块已经载入过，不再继续加载，主要用于require与define在同一文件
                if (ClassModule.resource[url] || (module && (module.getStatus() > 2))) {//_module && (_module._ready || !_module._fromRequire
                    return this;
                }

                ClassModule.resource[url] = id;

                var scripts = document.createElement("script")
                , head = document.getElementsByTagName('HEAD')[0]
                , timeId;

                error && (scripts.onerror = function () {
                    clearTimeout(timeId);
                    error();
                });

                scripts.onload = scripts.onreadystatechange = function () {
                    (!this.readyState || this.readyState == "loaded" || this.readyState == 'complete') && clearTimeout(timeId);
                }

                scripts.setAttribute("src", url);
                scripts.setAttribute('type', 'text/javascript');
                scripts.setAttribute('language', 'javascript');

                timeId = setTimeout(function () {
                    error && error();
                    scripts = scripts.onerror = scripts.onload = error = head = null;
                }, _config.amd.timeout);

                head.insertBefore(scripts, head.firstChild);
                return this;
            }
            , mapDependencies: {}
            , maps: {}
            , modules: {}
            , namedModules: {}
            , requireQueue: []
            , resource: {}
            , rootPath: null
            , setModule: function (k, v) {
                !this.getModule(k) && (this.modules[k] = v);
                return this;
            }
            , statusReflect: {
                0: "init",
                1: "queue",
                2: "require",
                3: "define",
                4: "ready"
            }
        });

        ClassModule.prototype = {
            addHandler: function (fn) {
                if (typeof fn == "function") {
                    var h = this.handlers[this.id];
                    h == undefined && (h = this.handlers[this.id] = []);
                    h.push(fn);
                }
                return this;
            }
            , check: function () {
                var status = this.getStatus(), dps = this.dependencies;
                switch (status) {
                    case 4:
                        this.holdReady().trigger();
                        break;
                    case 3:
                        if (!dps || !dps.length) {
                            this.getReady();
                            break;
                        }
                    case 2:
                    case 1:
                    case 0:
                        if (dps.length == 1 && dps[0] === this.id) {
                            break;
                        }
                    default:
                        var aDP = [], hd = ClassModule.holdon, i = 0, sMD, sDP, mDP;
                        if (status > 0 && _config.amd.detectCR == true) {
                            if (sMD = ClassModule.detectCR(this.id, dps)) {
                                tools.error({ fn: 'define', msg: 'There is a circular reference between "' + sMD + '" and "' + module + '"' }, "ReferenceError");
                                return;
                            }
                        }
                        //加入holdon
                        for (; sDP = dps[i++]; ) {//有依赖自己的情况
                            mDP = ClassModule.getModule(sDP);
                            if (!mDP || mDP.getStatus() != 4) {
                                aDP.push(sDP);
                                if (hd[sDP]) {
                                    hd[sDP].push(this.id);
                                } else {
                                    hd[sDP] = [this.id];
                                }
                            }
                        }
                        //}
                        if (!aDP.length) {
                            //依赖貌似都准备好，尝试转正
                            this.getReady();
                        } else {
                            //ClassModule.setModule(this);
                            if (status >= 2) {//深入加载依赖模块 <=1？
                                this.loadDependencies();
                            }
                        }
                        break;
                }
                return this;
            }
            , constructor: ClassModule
            , getDependenciesMap: function () {
                var ret = [];
                if (_config.amd.detectCR) {
                    var id = this.id, MD = ClassModule.dependenciesMap[id], DM
                    , module = ClassModule.getModule(id);

                    ret.push({ name: id, status: module.getStatus(1), container: module.container });
                    for (DM in MD) {
                        module = ClassModule.getModule(DM);
                        ret.push({ name: DM, status: module.getStatus(1), container: module.container });
                    }
                }
                else {
                    tools.console.warn({ fn: "getDependenciesMap", msg: "you had to set require.detectCR true for getting map list" });
                }
                return ret;
            }
            , getReady: function () {
                var dps = this.dependencies, l = dps.length, i = 0, dplist = [], id = this.id
                , sdp, md, map, F;

                for (; i < l; i++) {
                    md = ClassModule.getModule(dps[i]);
                    //如果依赖模块未准备好，或依赖模块中还有待转正的模块，则当前模块也不能被转正
                    if (!md || md.status != 4) { return false; }
                    dplist = dplist.concat(md.module);
                }
                this.setStatus(4);
                if (_config.amd.debug) {
                    F = this.factory.apply(null, dplist) || {};
                }
                else {
                    try { F = this.factory.apply(null, dplist) || {}; } catch (e) { }
                }

                F._AMD = {
                    id: id
                        , dependencies: dps
                        , status: 4
                    //, todo: this.todo
                        , container: this.container
                        , getDependenciesMap: this.getDependenciesMap
                };

                if (F && F.constructor != Array) { F = [F] };
                this.module = F;

                //_getMoudule(id, F);
                //当传入的模块是已准备好的，开启转正机会
                //setTimeout?
                this.holdReady().trigger();
            }
            , getStatus: function (isStr) {
                var s = this.status;
                return isStr == true ? ClassModule.statusReflect[s] : s;
            }
            , holdReady: function () {
                var md, hd = ClassModule.holdon[this.id], MD = ClassModule.modules;
                if (hd && hd.length) {
                    for (; md = MD[hd.shift()]; ) {
                        md.getReady();
                    }
                }
                return this;
            }
            , init: function (dependencies, factory, status, container, fail) {
                this.dependencies = dependencies;
                this.factory = factory;
                this.status = status || 0;
                this.container = container;
                this.fail = fail;
                return this;
            }
            , load: function () {
                var id = this.id, fail = this.fail, status = this.getStatus(), url;

                if (status == 2) {
                    this.loadDependencies();
                    return this;
                }
                if (status > 1) {
                    return this;
                }

                (url = ClassModule.getPath(id, ".js"))
                    || tools.error({ fn: 'require', msg: 'Could not load module: ' + id + ', Cannot match its URL' });
                //如果当前模块不是已知的具名模块，则设定它为正在处理中的模块，直到它的定义体出现
                //if (!namedModule) { ClassModule.anonymousID = id; } //这边赋值的时候应当是影射的

                this.setStatus(2);
                if (!ClassModule.container[id]) {
                    ClassModule.container[id] = url;
                }

                if (ClassModule.cache[id]) {
                    ClassModule.cache[id]();
                } else {
                    _config.amd.async == true
                        ? window.setTimeout(function () {
                            ClassModule.loadJs(url, id, fail);
                        }, 0)
                        : ClassModule.loadJs(url, id, fail);
                }
                return this;
            }
            , loadDependencies: function () {//要改
                var dep = this.dependencies, i = 0, len, item, module;
                if (!(dep && dep.constructor == Array && dep.length)) { return this; }
                for (len = dep.length; i < len; i++) {//是否要用function 而不是for
                    item = dep[i];
                    module = ClassModule.getModule(item);
                    if (!module) {
                        require(item);
                    }
                    //                        else if (module.getStatus() == 2) {//?
                    //                            module.loadDependencies();
                    //                        }
                }
                return this;
            }
            , request: function (success) {
                this.addHandler(success);
                switch (this.status) {
                    case 0:
                        this.check();
                        var namedModule = ClassModule.namedModules[this.id], self = this;
                        if (this.status == 0) {
                            if (namedModule) {
                                this.load();
                            }
                            else {
                                this.setStatus(1);
                                requireQueue.queue(function () {
                                    if (!ClassModule.anonymousID) { ClassModule.anonymousID = self.id; }
                                    self.load();
                                });
                            }
                        }
                        break;
                    case 4:
                        this.check();
                        break;

                }

                return this;
            }
            , setStatus: function (status) {
                this.status = status;
                return this;
            }
            , trigger: function () {
                var h = this.handlers[this.id], item;
                if (h && h.constructor == Array && this.getStatus() == 4 && this.module) {

                    for (; h.length && (item = h.splice(0, 1)); ) {
                        item[0].apply(window, this.module);
                    }

                }
                return this;
            }
        }

        window.define = function (id, dependencies, factory, info) {
            var arg = arguments, ret, deep, body, container, status;

            switch (arg.length) {
                case 0: tools.error({ fn: "window.define", msg: id + ":define something that cannot be null" }, "TypeError");
                    break
                case 1:
                    body = id;
                    id = ClassModule.anonymousID; //_resource[container]; 
                    dependencies = [];
                    factory = ClassModule.funBody(body);
                    break;
                case 2:
                    if (typeof arg[0] == "string") {
                        id = id; //tools.getJScriptConfig(["src"], true).src; //_tempId();_amdAnonymousID
                        body = dependencies;
                        dependencies = [];
                    }
                    else if (arg[0] && arg[0].constructor == Array) {
                        var temp = id;
                        id = ClassModule.anonymousID; //_resource[container]; // ; //_tempId();
                        body = dependencies;
                        dependencies = temp;
                    }
                    else {
                        tools.error({ fn: 'define', msg: id + ':The first arguments should be String or Array' }, "TypeError");
                    }
                    factory = ClassModule.funBody(body);
                    break;
                default:
                    if (!(typeof arg[0] == "string" && arg[1] && arg[1].constructor == Array)) {
                        tools.error({ fn: 'define', msg: id + ':two arguments ahead should be String and Array' }, "TypeError");
                    }
                    factory = ClassModule.funBody(arg[2]);
            }
            container = ClassModule.getContainer(id);
            if (ret = ClassModule.getModule(id)) {
                deep = ret.getStatus();
                //container = deep != 0 ? ClassModule.getContainer(id) : null;
                ret.init(dependencies, factory, 3, container);
            } else {
                container = /tempDefine/.test(id) ? "inner" : ClassModule.getContainer(id);
                ret = new ClassModule(id, dependencies, factory, 3, container);
            }

            ret.check(); //最后设为2？

            //if (!/_temp_/.test(id)) (container = ClassModule.getContainer(id)); //如果不是require定义的临时

            //执行请求队列
            if (!ClassModule.namedModules[id] && deep == 2) {
                ClassModule.anonymousID = null;
                requireQueue.dequeue();
            }

            return ret;

        };
        tools.extend(define, {
            amd: ClassModule.maps
            , noConflict: function () {
                window.define = _define;
                return define;
            }
        });

        window.require = function (module, success, fail) {
            if (!module) { return; }
            //如果请求一组模块则转换为对一个临时模块的定义与请求处理
            var ret
            if (module.constructor == Array) {
                if (!module.length) {
                    return;
                }
                else if (module.length == 1) {
                    module = module.join("");
                } else {
                    var de = module;
                    module = "tempDefine:" + module.join(",");
                    ret = ClassModule.getModule(module) || define(module, de, function () { return tools.argToArray(arguments); });
                }
            }
            success && typeof success != "function" &&
                tools.error({ fn: 'require', msg: module + ':success should be a Function' }, "TypeError");

            if (typeof fail != "function") {
                fail = function () {
                    tools.error({ fn: 'require', msg: module + ':Could not load , Cannot fetch the file' });
                };
            }

            ret = ret || ClassModule.getModule(module) || new ClassModule(module, [module], function () { return new String(module); }, 0, null, fail);

            return ret.request(success);
        };
        tools.extend(require, {
            noConflict: function () {
                window.require = _require;
                return require;
            }

            , cache: function (cache) {
                var container = ClassModule.getContainer(null, ClassModule.amdAnonymousID ? true : false);
                //tools.extend(ClassModule.cache, a.cache);
                for (var i in cache) {
                    require.named(i);
                    ClassModule.cache[i] = cache[i];
                    ClassModule.container[i] = container;
                }
                return this;
            }

            , named: function (name) {
                /// <summary>具名以用来可以异步加载</summary>
                /// <param name="name" type="Array/Object/String">具名名单</param>
                /// <returns type="self" />
                var i, b, n = name;
                if (n && n.constructor == Array) {
                    for (i = 0; b = n[i++]; ) {
                        ClassModule.namedModules[b] = 1;
                    }
                }
                else if (typeof n == "object") {
                    for (var b in n) {
                        ClassModule.namedModules[b] = 1;
                    }
                }
                else if (typeof n == "string") {
                    ClassModule.namedModules[n] = 1;
                }
                return this;
            }

            , reflect: function (name, path) {
                /// <summary>映射路径</summary>
                /// <param name="name" type="Object/String">映射名</param>
                /// <param name="path" type="String/undefined">路径名</param>
                /// <returns type="self" />
                if (typeof name == "object") {
                    for (var i in name) {
                        ClassModule.maps[i] = name[i];
                    }
                }
                else if (typeof name == "string" && typeof path == "string") {
                    ClassModule.maps[name] = path;
                }

                return this;
            }

            , config: function (a, b, c) {//name, path, named
                var len = arguments.length;
                switch (len) {
                    case 1:
                        if (typeof a == "string" || a && a.constructor == Array) {
                            require.named(a);
                        }
                        else if (typeof a == "object") {
                            a.reflect && require.reflect(a.reflect);
                            a.named && a.named == true ? require.named(a.reflect) : require.named(a.named);
                            //如果named=true其实就是映射a.reflect 
                            a.amd && tools.extend(_config.amd, a.amd);
                            a.cache && require.cache(a.cache);
                        }
                        break;
                    case 2:
                        require.reflect(a, b);
                        break;

                }
                return this;

            }
        });

        tools.extend($, {
            define: function (id, dependencies, factory) {
                /// <summary>myQuery的define对象定义
                /// <para>遵循AMD规范重载</para>
                /// <para>只是myQuery.define默认会载入myQuery对象</para>
                /// </summary>
                /// <param name="id" type="String">对象名</param>
                /// <param name="dependencies" type="Array">依赖列表</param>
                /// <param name="factory" type="Function">对象工厂</param>
                /// <returns type="self" />
                var arg = tools.argToArray(arguments, 0)
                , len = arg.length
                , fn = arg[len - 1]
                , version = "no signing version";
                if (typeof fn == "string") {
                    version = fn;
                    fn = arg[len - 2];
                    arg.pop();
                }
                //$.module[id] = version;
                //                if (arg[1] && arg[1].constructor == Array) {
                //                    require.named(dependencies);
                //                }
                if (typeof fn == "function") {
                    arg[arg.length - 1] = function () {
                        var arg = tools.argToArray(arguments, 0);
                        arg.splice(0, 0, myQuery);
                        if (_config.amd.debug) { return fn.apply(null, arg); }
                        else { try { return fn.apply(null, arg); } finally { } }
                    }

                    window.define ? window.define.apply(null, arg) : fn();
                }
                return this;
            }
             , require: function (dependencies, success, fail) {
                 /// <summary>myQuery的require对象定义
                 /// <para>遵循AMD规范重载</para>
                 /// <para>会自动调用ready确定window和指定package准备完毕</para>
                 /// </summary>
                 /// <param name="dependencies" type="Array">依赖列表</param>
                 /// <param name="success" type="Function">回调函数</param>
                 /// <param name="fail" type="Function">失败的函数</param>
                 /// <returns type="self" />
                 var fn = success,
                 success = function () {
                     var arg = arguments;
                     $.ready(function () {
                         fn.apply(null, arg);
                     });
                 }

                 window.require && window.require(dependencies, success, fail);
                 return this;
             }
        });
    })();

    myQuery.define("base/queue", function ($) {
        $.queue = Queue;
        return Queue
    });

    myQuery.define("base/promise", function () {
        function Promise(todo, fail, progress) {
            this.state = 'todo';
            this.result = null;
            this.thens = [];
            this.todo = todo || function (obj) {
                return obj;
            };
            this.fail = fail;
            this.progress = progress;

        }
        Promise.prototype = {
            constructor: Promise,
            call: function (name, result) {
                switch (name) {
                    case "fail":
                    case "progress":
                        break
                    case "todo":
                    default:
                        name = "todo"

                }
                //var arg = $.argToArray(arguments, 1);

                return this[name](result);
            },
            get: function (propertyName) {
                return this[propertyName];
            },
            resolve: function (obj) {
                if (this.state != 'todo') {
                    tools.error({ fn: "Promise.resolve", msg: "already resolved" })

                };

                try {
                    this.result = this.todo(obj);
                    this.state = 'done';
                } catch (e) {
                    if (this.fail) {
                        this.result = this.fail(obj);
                    }
                    else {
                        throw e;
                    }
                    this.state = 'fail';
                }
                if (this.result instanceof Promise) {
                    // 异步的情况，返回值是一个Promise，则当其resolve的时候，nextPromise才会被resolve
                    var self = this;
                    this.result.then(function (result) {
                        self._next(result);
                    });
                } else {
                    this._next(this.result);
                }
                return this;
            },
            _next: function (result) {
                for (var i = 0, len = this.thens.length, promise; i < len; ++i) {
                    // 依次调用该任务的后续任务
                    promise = this.thens[i];
                    promise.resolve(result);
                }
                return this;
            },
            _push: function (nextPromise) {
                this.thens.push(nextPromise);
                return nextPromise;
            },
            then: function (nextToDo, nextFail, nextProgress) {
                var promise = new Promise(nextToDo, nextFail, nextProgress);
                if (this.state != 'todo') {
                    // 如果当前状态是已完成，则nextOK会被立即调用
                    this.resolve();
                }
                else {
                    // 否则将会被加入队列中
                    return this._push(promise);
                }
            }
        }
        return Promise;
    }, "1.0.0");

    require("base/promise", function (Promise) {
        function print(num) {
            console.log(num);
            a + num;
            return num;
        }
        function print1(num) {
            console.log(num);
            return num;
        }
        function addTwo(num) {
            return num + 2;
        }
        function delay(ms) {
            return function (obj) {
                var promise = new Promise();
                setTimeout(function () {
                    promise.resolve(obj);
                }, ms);
                return promise;
            };
        }

        var promise = new Promise(print, print1);
        promise.then(addTwo, addTwo)
            .then(print, print1)
            .then(delay(2000))
            .then(addTwo, addTwo)
            .then(print, print1); // 这里的任务将会加入到队列中
        promise.resolve(3);
    });

    myQuery.define("base/ready", function ($) {
        "use strict"; //启用严格模式
        var 
        addHandler = function (ele, type, fns) {
            if (ele.addEventListener)
                ele.addEventListener(type, fns, false); //事件冒泡
            else if (ele.attachEvent)
                ele.attachEvent('on' + type, fns);
            else {
                ele['on' + type] = fns;
            }
        },
        windowReady = 0, //compatible ie ff
            $Ready = 0,
            list = [],
            todo = function () {
                if (!$Ready || !windowReady) { return; }
                var fun;
                while (list.length) {
                    fun = list.splice(0, 1);
                    fun[0] && fun[0](window, windowReady);
                }
            },
            ready = function (fun) {
                if (typeof fun != "function") {
                    return;
                }
                list.push(fun);

                !windowReady ? addHandler(window, "load", todo) : todo();

            };
        $.ready = ready;
        if (_config.myquery.package) {
            require("json/package", function (Package) {
                var json = Package[_config.myquery.package];

                if (json) {
                    require(json, function () {
                        $Ready = 1;
                        todo();
                    });
                }
                else {
                    $Ready = 1;
                    todo();
                }
            });
        }
        else {
            $Ready = 1;
        }

        $._redundance.addHandler = addHandler;

        addHandler(window, "load", function (e) {
            windowReady = e || 1;
            todo();
        });

        return ready;
    }, "1.0.0");

    myQuery.define("base/is", function ($) {
        "use strict"; //启用严格模式
        var hasOwnProperty = Object.prototype.hasOwnProperty
        , toString = Object.prototype.toString
        , is = {
            isEleConllection: function (a) {
                /// <summary>是否为DOM元素的集合</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                if ($.isType(a, '[object NodeList]') || $.isType(a, '[object HTMLCollection]') || ($.client.browser.ie678 && $.isNum(a.length) && !$.isArr(a.length) && ($.isObj(a.item) || $.isStr(a.item))))
                    return true;
                return false;
            }
            , isArr: function (a) {
                /// <summary>是否为数组</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                return $.isType(a, '[object Array]');
            }
            , isArrOf: function (a, type) {
                /// <summary>是否为某种特定类型数组</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <param name="type" type="Function">检查的方法 可以是$.isStr</param>
                /// <returns type="Boolean" />
                var result = true;
                if ($.isArr(a)) {
                    $.each(a, function (item) {
                        if (!(result = type(item))) {
                            return false;
                        }
                    });
                }
                else {
                    result = false;
                }
                return result;
            }
            , isBol: function (a) {
                /// <summary>是否为数组</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                return $.isType(a, '[object Boolean]');
            }
            , isDoc: function (a) {
                /// <summary>是否为Document</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                return !!toString.call(a).match(/document/i);
            }
            , isEle: function (a) {
                /// <summary>是否为DOM元素</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                if (!a || a === document)
                    return false;
                var str = (a.constructor && a.constructor.toString()) + Object.prototype.toString.call(a)
                if ((str.indexOf('HTML') > -1 && str.indexOf('Collection') == -1) || ($.client.browser.ie678 && a.nodeType === 1)) {
                    return true; //可能nodeType有问题
                }
                return false;
            }
            , isEmpty: function (a) {
                /// <summary>是否为空</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                return a === null || a === undefined;
            }
            , isEmptyObj: function (obj) {
                /// <summary>是否为空的Object</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                for (var name in obj) {
                    return false;
                }
                return true;
            }
            , isFun: function (a) {
                /// <summary>是否为方法</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                return $.isType(a, '[object Function]');
            }
            , isNum: function (a) {
                /// <summary>是否为数字</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                return $.isType(a, '[object Number]');
            }
            , isNul: function (a) {
                /// <summary>是否为不存在</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                return a === undefined || a === null || a === NaN;
            }
            , isNode: function (ele, name) {
                /// <summary>判断是不是这个dom元素</summary>
                /// <param name="ele" type="Element">dom元素</param>
                /// <param name="name" type="String">名字</param>
                /// <returns type="Boolean" />
                return $.isEle(ele) ? (ele.nodeName && ele.nodeName.toUpperCase() === name.toUpperCase()) : false;
            }
            , isObj: function (a) {
                /// <summary>是否为对象</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                return $.isType(a, '[object Object]');
            }
            , isPlainObj: function (obj) {
                /// <summary>是否为纯obj</summary>
                /// <param name="obj" type="any">任意对象</param>
                /// <returns type="Boolean" />

                if (!obj || !$.isObj(obj) || obj.nodeType || obj.setInterval) {
                    return false;
                }

                // Not own constructor property must be Object
                if (obj.constructor
			    && !hasOwnProperty.call(obj, "constructor")
			    && !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }

                // Own properties are enumerated firstly, so to speed up,
                // if last one is own, then all properties are own.

                var key;
                for (key in obj) {
                    break;
                }

                return key === undefined || hasOwnProperty.call(obj, key);
            }
            , isStr: function (a) {
                /// <summary>是否为字符产</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                return $.isType(a, '[object String]');
            }
            , isType: function (a, b) {
                /// <summary>判断对象类型</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <param name="b" type="String">例:'[object Function]'</param>
                /// <returns type="Boolean" />
                return toString.call(a) == b;
            }
            , isXML: function (ele) {
                /// <summary>是否是XML</summary>
                /// <param name="ele" type="any">任意对象</param>
                /// <returns type="Boolean" />
                // documentElement is verified for cases where it doesn't yet exist
                // (such as loading iframes in IE - #4833)
                var documentElement = (ele ? ele.ownerDocument || ele : 0).documentElement;

                return documentElement ? documentElement.nodeName !== "HTML" : false;
            }
            , is$: function (a) {
                /// <summary>是否为$对象</summary>
                /// <param name="a" type="any">任意对象</param>
                /// <returns type="Boolean" />
                return a instanceof $;
            }
        };

        tools.extend($, is);

        return is;
    }, "1.0.0");

    myQuery.define("base/extend", function ($) {
        "use strict"; //启用严格模式
        var extend = {
            easyExtend: function (obj1, obj2) {
                /// <summary>简单地把对象的属性复制到对象一</summary>
                /// <param name="a" type="Object">对象</param>
                /// <param name="b" type="Object">对象</param>
                /// <returns type="self" />
                for (var i in obj2)
                    obj1[i] = obj2[i];
                return this;
            }
            , extend: function (a) {
                /// <summary>制造一个Object元素
                /// <para>第二个参数：待修改对象。如果deep为obj,则以后的参数都应该是纯obj。</para>
                /// <para>第N+2个参数：待合并到target对象的对象。</para>
                /// <para>返回最后被合并的目标Object</para>
                /// </summary>
                /// <param name="a" type="Boolean/Object">如果设为true，则递归合并。如果为纯obj则添加到$中</param>
                /// <returns type="Object" />

                //quote from jQuery-1.4.1 
                var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

                if (length == 1 && $.isObj(target)) {
                    tools.extend($, target);
                    return this;
                }

                if ($.isBol(target)) {
                    deep = target;
                    target = arguments[1] || {};
                    i = 2;
                }

                if (!$.isObj(target) && !$.isFun(target) && !$.isArr(target)) {//加了个array
                    target = {};
                }

                if (length === i) {
                    target = this;
                    --i;
                }

                for (; i < length; i++) {
                    if ((options = arguments[i]) != null) {
                        for (name in options) {
                            src = target[name];
                            copy = options[name];

                            if (target === copy) {
                                continue;
                            }

                            if (deep && copy && ($.isPlainObj(copy) || $.isArr(copy))) {
                                var clone = src && ($.isPlainObj(src) || $.isArr(src)) ? src
						: $.isArr(copy) ? [] : {};

                                target[name] = $.extend(deep, clone, copy);

                            } else if (copy !== undefined) {
                                target[name] = copy;
                            }
                        }
                    }
                }

                return target;

            }
        };

        tools.extend($, extend);

        $.fn.extend = function (params) {
            /// <summary>把对象属性复制$.prototype上</summary>
            /// <param name="params" type="params:obj">params形式的纯Object对象</param>
            /// <returns type="self" />
            for (var i = 0, len = arguments.length, obj; i < len; i++) {
                obj = arguments[i];
                $.isPlainObj(obj) && tools.extend($.prototype, obj);
            }
            return $.fn;
        };

        return extend;
    }, "1.0.0");

    myQuery.define("base/array", function ($) {
        "use strict"; //启用严格模式

        var 
        indexOf = Array.prototype.indexOf || function (item, i) {
            var len = this.length;
            i = i || 0;
            if (i < 0) i += len;
            for (; i < len; i++)
                if (i in this && this[i] === item) return i;
            return -1;
        },
        lastIndexOf = Array.prototype.lastIndexOf || function (item, i) {
            var len = this.length - 1;
            i = i || len;
            if (i < 0) i += len;
            for (; i > -1; i--)
                if (i in this && this[i] === item) break;
            return i;
        },
        push = Array.prototype.push,
        array = {
            filterArray: function (arr, fun, context) {
                /// <summary>返回数组中于此对象相同的序号</summary>
                /// <param name="arr" type="Array">数组</param>
                /// <param name="item" type="any">任意对象</param>
                /// <param name="i" type="Number/null">序号 可选</param>
                /// <returns type="Number" />
                var ret = [];
                for (var i = 0, len = arr.length, item; i < len; i++) {
                    item = arr[i];
                    fun.call(context, item, i, arr) == true && ret.push(item);
                }
                return ret;
            }

            , inArray: function (arr, item, i) {
                /// <summary>返回数组中于此对象相同的序号</summary>
                /// <param name="arr" type="Array">数组</param>
                /// <param name="item" type="any">任意对象</param>
                /// <param name="i" type="Number/null">序号 可选</param>
                /// <returns type="Number" />
                return indexOf.call(arr, item, i);
            }

            , lastInArray: function (arr, item, i) {
                /// <summary>从后开始遍历返回数组中于此对象相同的序号</summary>
                /// <param name="arr" type="Array">数组</param>
                /// <param name="item" type="any">任意对象</param>
                /// <param name="i" type="Number/null">序号 可选</param>
                /// <returns type="Number" />
                return lastIndexOf.call(arr, item, i);
            }

            , makeArray: function (array, results) {
                /// <summary>制造一个数组</summary>
                /// <param name="array" type="any">任意</param>
                /// <param name="results" type="Array">数组 可缺省</param>
                /// <returns type="Array" />

                //quote from jQuery-1.4.1 
                var result = results || [];

                if (array != null) {
                    if (array.length == null || $.isStr(array) || $.isFun(array) || array.setInterval) {
                        push.call(result, array);
                    } else {
                        result = $.toArray(array);
                    }
                }

                return result;
            }

            , slice: function (list, num, len) {
                /// <summary>数组的slice方法</summary>
                /// <param name="list" type="Array">数组</param>
                /// <param name="num" type="Number/null">序号 缺省返回第一个</param>
                /// <param name="len" type="Number/null">长度 返回当前序号后几个元素 缺省返回当前序号</param>
                /// <returns type="Array" />
                return list.slice($.isNum(num) ? num : 0, $.isNum(len) ? len + num : 1 + num);
            }

            , toArray: function (obj, num1, num2) {
                /// <summary>转换成数组</summary>
                /// <param name="num1" type="Number/null">序号 缺省从零开始</param>
                /// <param name="num2" type="Number/null">长度 缺省为整个长度</param>
                /// <returns type="Array" />
                var i = 0, list = [], len = obj.length;
                if (!($.isNum(len) && $.isFun(obj))) {
                    for (var value = obj[0]; i < len; value = obj[++i]) {
                        list.push(value);
                    }
                }
                return list.slice(num1 || 0, num2 || len);

            }
        };

        $.extend(array);

        return array;
    }, "1.0.0");

    window.myQuery = $;

    if (!window[_config.myquery.define]) {
        window[_config.myquery.define] = window.myQuery;
    }
    else {
        tools.error(_config.myquery.define + " is defined");
    }

})(window); 