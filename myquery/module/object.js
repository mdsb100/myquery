﻿/// <reference path="../myquery.js" />

myQuery.define("module/object", ["base/extend"], function ($, extend) {
    //依赖extend
    "use strict"; //启用严格模式

    var object = {
        //继承模块 可以自己实现一个 function模式 单继承
        _defaultPrototype: {
            init: function () {
                return this;
            }
            , render: function () {
                return this;
            }
        }
        , Class: function (prototype, supper, name) {
            /// <summary>定义一个类</summary>
            /// <para>构造函数会执行init和render</para>
            /// <param name="prototype" type="Object">prototype原型</param>
            /// <param name="supper" type="Function">父类</param>
            ///  <param name="name" type="String/undefined">父类</param>
            /// <returns type="self" />
            if (!arguments.length) {
                return null;
            }
            //supper和什么名字 查一下

            var anonymous =
                name
                ? (eval(
                    [
                        "(function ", name, "(arg, supperArg) {\n",
                        "    supper.apply(this, supperArg);\n",
                        "    this.init.apply(this, arg);\n",
                        "    this.render();\n",
                        "});\n"
                    ].join("")
                ) || eval("(" + name + ")"))
                : function (arg, supperArg) {
                    supper.apply(this, supperArg);
                    this.init.apply(this, arg);
                    this.render()
                };

            prototype = $.extend({}, $.object._defaultPrototype, prototype);
            prototype.constructor = anonymous;
            anonymous.prototype = prototype;

            $.object.inheritProtypeWidthExtend(anonymous, supper);

            return anonymous;
        }

        , getObjectAttrCount: function (obj, bool) {
            /// <summary>获得对象属性的个数</summary>
            /// <param name="obj" type="Object">对象</param>
            /// <param name="bool" type="Boolean">为true则剔除prototype</param>
            /// <returns type="Number" />
            var count = 0;
            for (var i in obj) {
                bool == true ? $.isPrototypeProperty(obj, i) || count++ : count++
            }
            return count;
        }

        , inheritProtypeWidthExtend: function (child, parent) {
            /// <summary>继承prototype 使用普通添加模式 不保有统一个内存地址 也不会调用多次构造函数</summary>
            /// <para>如果anotherPrototype为false对子类的prototype添加属性也会添加到父类</para>
            /// <para>如果child不为空也不会使用相同引用</para>
            /// <param name="child" type="Object">子类</param>
            /// <param name="parent" type="Object">父类</param>
            /// <returns type="self" />
            var con = child.prototype.constructor;
            $.easyExtend(child.prototype, parent.prototype);
            child.prototype.constructor = con || parent.prototype.constructor;
            return this;
        }
        , inheritProtypeWidthParasitic: function (child, parent) {
            /// <summary>继承prototype 使用寄生 会保有同一个内存地址</summary>
            /// <param name="child" type="Object">子类</param>
            /// <param name="parent" type="Object">父类</param>
            /// <returns type="self" />
            function ctor() { this.constructor = child; }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            var prototype = Object(parent.prototype);
            child.prototype = prototype;
            child.prototype.constructor = child;
            return this;
        }
        , inheritProtypeWidthCombination: function (child, parent) {
            /// <summary>继承prototype 使用经典组合继承 不会保有同一个内存地址</summary>
            /// <para>如果anotherPrototype为false对子类的prototype添加属性也会添加到父类</para>
            /// <para>如果child不为空也不会使用相同引用</para>
            /// <param name="child" type="Object">子类</param>
            /// <param name="parent" type="Object">父类</param>
            /// <returns type="self" />
            child.prototype = new parent();
            return this;
        }
        , isPrototypeProperty: function (obj, name) {
            /// <summary>是否是原型对象的属性</summary>
            /// <param name="obj" type="any">任意对象</param>
            /// <param name="name" type="String">属性名</param>
            /// <returns type="Boolean" />
            return !obj.hasOwnProperty(name) && (name in obj);
        }

        , providePropertyFunction: function (obj, list) {
            /// <summary>提供类的属性get和set方法</summary>
            /// <param name="obj" type="Object">类</param>
            /// <param name="list" type="Object/Array">属性名列表</param>
            /// <returns type="String" />
            return $.each(list, function (value, key) {
                this[$.camelCase(value, "set")] = function (a) {
                    this[value] = a;
                    return this;
                }
                this[$.camelCase(value, "get")] = function () {
                    return this[value];
                }
            }, obj.prototype);
        }

    };

    $.object = object;

    return object;
}, "1.0.0");