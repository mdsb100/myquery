﻿/// <reference path="../myquery.js" />

myQuery.define(function ($, undefined) {
    "use strict"; //启用严格模式
    var date = {
        pattern: function (date, fmt) {
            var o = {
                "M+": date.getMonth() + 1, //月份        
                "d+": date.getDate(), //日        
                "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时        
                "H+": date.getHours(), //小时        
                "m+": date.getMinutes(), //分        
                "s+": date.getSeconds(), //秒        
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度        
                "S": date.getMilliseconds() //毫秒        
            };
            var week = {
                "0": "\u65e5",
                "1": "\u4e00",
                "2": "\u4e8c",
                "3": "\u4e09",
                "4": "\u56db",
                "5": "\u4e94",
                "6": "\u516d"
            };
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            if (/(E+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[date.getDay() + ""]);
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        }

        , dateAdd: function (date, interval, value) {
            var ret;
            switch (interval) {
                case "s": ret = Date.parse(date) + (1000 * value); break;
                case "m": ret = Date.parse(date) + (60000 * value); break;
                case "h": ret = Date.parse(date) + (3600000 * value); break;
                case "d": ret = Date.parse(date) + (86400000 * value); break;
                case "w": ret = Date.parse(date) + ((86400000 * 7) * value); break;
                case "M": return new Date(date.getFullYear(), (date.getMonth()) + value, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
                case "y": return new Date((date.getFullYear() + value), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            }
            return new Date(ret);
        }

    };

    return $.date = date;

});