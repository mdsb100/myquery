﻿/// <reference path="../myquery.js" />

myQuery.define("module/src", ["base/client"], function ($, client, undefined) {
    "use strict"; //启用严格模式
    var 
    hasOwnProperty = Object.prototype.hasOwnProperty
    , src = {
        href: function (ele, options) {
            /// <summary>加载有href的元素</summary>
            /// <para>str options.href：不可缺省</para>
            /// <para>fun optiosn.complete:回调函数</para>
            /// <para>obj options.context:complete的作用域</para>
            /// <para>num options.timeout:超时时间。缺省为10000</para>
            /// <para>fun options.timeoutFun:超时后的事件</para>
            /// <para>fun options.error:错误函数</para>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="options" type="Object">参数</param>
            /// <returns type="self" />
            var opt = $.extend({}, src.hrefSetting, options);
            return src.src(ele, opt, "href");
        }
        , hrefSetting: {
            href: ""
        }

        , link: function (options) {
            /// <summary>加载link元素</summary>
            /// <para>str options.href：不可缺省</para>
            /// <para>link没有回调函数</para>
            /// <param name="options" type="Object">参数</param>
            /// <returns type="self" />
            var _link = document.createElement("link")
            , _head = document.getElementsByTagName('HEAD').item(0)
            , opt = $.extend({}, src.linkSetting, options);
            _link.rel = opt.rel;
            _link.type = opt.type;
            src.href(_link, opt);
            _head.appendChild(_link);
            return this;
        }
        , linkSetting: {
            rel: "stylesheet"
            , href: ""
            , type: "text/css"
        }

        , src: function (ele, options) {
            /// <summary>加载有src的元素</summary>
            /// <para>str options.src：不可缺省</para>
            /// <para>fun optiosn.complete:回调函数</para>
            /// <para>obj options.context:complete的作用域</para>
            /// <para>num options.timeout:超时时间。缺省为10000</para>
            /// <para>fun options.timeoutFun:超时后的事件</para>
            /// <para>fun options.error:错误函数</para>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="options" type="Object">参数</param>
            /// <returns type="self" />
            var property = arguments[2] || "src"
            if (!$.isEle(ele) || (!hasOwnProperty.call(ele, property) && ele[property] === undefined)) {
                return this;
            }
            ele[property] = ele.onload = ele.onreadystatechange = null;
            var o = $.extend({}, $.srcSetting, options), completeReadyStateChanges = 0, timeId;
            ele.onload = ele.onreadystatechange = function () {
                if (!client.browser.ie || ++(completeReadyStateChanges) == 3) {
                    clearTimeout(timeId);
                    o.complete && o.complete.call(o.context || this, this);
                    ele = completeReadyStateChanges = timeId = o = null;
                }
            };
            ele.onerror = function (e) {
                clearTimeout(timeId);
                o.error && o.timeoutFun.call(ele, e);
                ele = completeReadyStateChanges = o = timeId = null;
            }

            if (o.timeout) {
                timeId = setTimeout(function () {
                    o.timeoutFun && o.timeoutFun.call(ele, o);
                    ele = completeReadyStateChanges = o = timeId = null;
                }, o.timeout);
            }
            ele[property] = o[property];

            return this;

        }
        , srcSetting: {
            error: function (e) {
                $.console.warn({ fn: "myQuery.src", msg: (this.src || "(empty)") + "of " + this.tagName + " getting error:" + e.toString() });
            }
            , timeout: false
            , timeoutFun: function (o) {
                $.console.warn({ fn: "myQuery.src", msg: (o.url || "(empty)") + "of " + this.tagName + "is timeout:" + (o.timeout / 1000) + "second" });
            }
            , src: ""
        }
    };

    $.fn.extend({
        href: function (options) {
            /// <summary>加载有href的元素</summary>
            /// <para>str options.href：不可缺省</para>
            /// <para>fun optiosn.complete:回调函数</para>
            /// <para>obj options.context:complete的作用域</para>
            /// <para>num options.timeout:超时时间。缺省为10000</para>
            /// <para>fun options.timeoutFun:超时后的事件</para>
            /// <para>fun options.error:错误函数</para>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.href(ele, options);
            });
        }

        , src: function (options) {
            /// <summary>加载有src的元素</summary>
            /// <para>str options.src：不可缺省</para>
            /// <para>fun optiosn.complete:回调函数</para>
            /// <para>obj options.context:complete的作用域</para>
            /// <para>num options.timeout:超时时间。缺省为10000</para>
            /// <para>fun options.timeoutFun:超时后的事件</para>
            /// <para>fun options.error:错误函数</para>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.src(ele, options);
            });
        }
    })
    $.extend(src);
    return src;
});