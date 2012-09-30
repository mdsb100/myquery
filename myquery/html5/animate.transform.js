﻿/// <reference path="../../myquery/myquery.js" />
/// <reference path="../../myquery/html5/css3.js" />
/// <reference path="../../myquery/module/animate.js" />

myQuery.define("html5/animate.transform", ["html5/css3", "module/animate"], function ($, css3, animate, undefined) {
    "use strict"; //启用严格模式
    var getScale = function (r) {
        return r = r ? Math.max(r, 0) : 1;
    }
    , transformCss = "-" + css3.css3Head + "-transform" ;
    //给动画类添加一个自定义方法
    if ($.support.transform3d) {
        var Transfrom3dForFX = function (ele, options, value, name, type) {
            if (this instanceof Transfrom3dForFX) {
                this.type = type;
                this._originCss = transformCss;
                name = name.indexOf("set") < 0 ? $.camelCase(name, "set") : name;
                $.fx.call(this, ele, options, value, name);
            }
            else {
                var ret = [];
                $.each(value, function (val, key) {
                    ret.push(new Transfrom3dForFX(ele, options, val, name, key));
                });
                return ret;
            }
        }
        $.object.inheritProtypeWidthExtend(Transfrom3dForFX, $.fx);
        $.easyExtend(Transfrom3dForFX.prototype, {
            cur: function () {
                var r = parseFloat($.getTransform3d(this.ele)[this.type]);
                return r || 0;
            }
            , constructor: Transfrom3dForFX
            , update: function (transform, value) {
                transform = transform || $.getTransform3d(this.ele);
                value = value != undefined ? value : this.nowPos;
                if (value != undefined) {
                    transform[this.type] = value + this.unit;
                    $[this.name](this.ele, transform);
                }

                return transform;
            }
            , specialUnit: function (start, end, unit) {
                var transform = this.update(this.name, end || 1);
                start *= ((end || 1) / this.cur());
                this.update(this.name, start, transform);

                return start;
            }
        });
        $.easyExtend($.fx.custom, {
            setRotate3d: Transfrom3dForFX
            , setScale: Transfrom3dForFX
            , transform3d: Transfrom3dForFX
            , setTranslate3d: Transfrom3dForFX
        });
    }
    if ($.support.transform) {
        var TransfromForFX = function (ele, options, value, name, type, index) {
            if (this instanceof TransfromForFX) {
                this.type = type;
                this.index = index;
                this._originCss = transformCss;
                name = name.indexOf("set") < 0 ? $.camelCase(name, "set") : name;
                $.fx.call(this, ele, options, value, name);
            }
            else {
                var ret = [];
                $.each(value, function (list) {
                    for (var i = 1, len = list.length; i < len; i++) {
                        ret.push(new TransfromForFX(ele, options, list[i], name, list, i));
                    }
                });
                return ret;
            }
        }
        $.object.inheritProtypeWidthExtend(TransfromForFX, $.fx);
        $.easyExtend(TransfromForFX.prototype, {
            cur: function () {
                var r = $.getTransform(this.ele, this.type[0])[0] || []
                r = parseFloat(r[this.index]);
                if (this.type[0] == "scale") r = getScale(r);
                return r || 0;
            }
            , constructor: TransfromForFX
            , update: function (transform, value) {
                transform = transform || $.getTransform(this.ele, this.type[0])[0] || [];
                value = value != undefined ? value : this.nowPos;
                if (value != undefined) {
                    transform[0] = this.type[0];

                    for (var i = 1, item = transform[i], len = this.type.length; i < len; i++) {
                        transform[i] = item || (this.type[0] != "scale" ? 0 : 1 + this.unit);
                    }

                    transform[this.index] = value + this.unit;

                    // this.index ==i?(   transform[this.index] = value + this.unit):;
                    $.setTransformByCurrent(this.ele, [transform]);
                }

                return transform;
            }
            , specialUnit: function (start, end, unit) {
                var transform = this.update(this.name, end || 1);
                start *= ((end || 1) / this.cur());
                this.update(transform, start);

                return start;
            }

        });
        $.easyExtend($.fx.custom, {
            transform: TransfromForFX
        });
    }

});