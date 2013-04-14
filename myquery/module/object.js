﻿/// <reference path="../myquery.js" />

myQuery.define("module/object", ["base/extend"], function ($, extend) {
    //依赖extend
    "use strict"; //启用严格模式

    var 
    defaultPurview = "-pu -w -r",
    defaultValidate = function () { return 1; },
    inerit = function (Sub, Super, name) {
        $.object.inheritProtypeWidthParasitic(Sub, Super, name);
        Sub.prototype.__superConstructor = Super;
        Sub.prototype.__superCall = function(name){
            /// <summary>调用基类方法</summary>
            var arg = $.argToArray(arguments, 1);
            this.__superConstructor[name].apply(this, arg);
        }
        Sub.prototype.__super = Super.prototype.init
            ? function () {
                var tempConstructor = this.__superConstructor;
                if (tempConstructor.prototype.__superConstructor) {
                    this.__superConstructor = tempConstructor.prototype.__superConstructor;
                }
                else {
                    delete this.__superConstructor;
                }
                tempConstructor.prototype.init ? tempConstructor.prototype.init.apply(this, arguments) : tempConstructor.apply(this, arguments);
                return this;
            }
            : function () {
                this.__superConstructor.apply(this, arguments);
                return this;
            }
    },
    extend = function (Sub, Super) {
        object.inheritProtypeWidthExtend(Sub, Super);
    },
    object = {
        //继承模块 可以自己实现一个 function模式 单继承
        _defaultPrototype: {
            init: function () {
                return this;
            }
            //            , create: function () {
            //                return this;
            //            }
            //            , render: function () {
            //                return this;
            //            }
        }
        , Class: function (name, prototype, statics, Super) {
            /// <summary>定义一个类</summary>
            /// <para>构造函数会执行init和render</para>
            /// <param name="name" type="String/Function/null">函数名或构造函数</param>
            /// <param name="prototype" type="Object">prototype原型</param>
            /// <param name="static" type="Object">静态方法</param>
            /// <param name="Super" type="Function">父类</param>
            /// <returns type="self" />
            var anonymous;
            switch (arguments.length) {
                case 0:
                case 1:
                    return null;
                case 3:
                    if (typeof statics == "function") {
                        Super = statics;
                        statics = null;
                    }
                    break;
            }

            switch (typeof name) {
                case "function":
                    anonymous = name;
                    break;
                case "string":
                    anonymous =
                    (eval(
                    [
                        "(function ", name, "() {\n",
                        "    this.init.apply(this, arguments);\n",
                    //"    this.create.apply(this,arguments);\n",
                        "});\n"
                    ].join(""))
                    || eval("(" + name + ")"))//fix ie678
                    break;
                default:
                    anonymous = function () {
                        this.init.apply(this, arguments);
                        //this.create.apply(this, arguments);
                    }
            }

            if (Super) {
                inerit(anonymous, Super);
            } else {
                anonymous.__super = function () { return this; };
            }

            prototype = $.extend({}, $.object._defaultPrototype, prototype);
            prototype.constructor = anonymous;
            $.easyExtend(anonymous.prototype, prototype);

            $.easyExtend(anonymous, statics);
            anonymous.inherit = function(Super){
                inerit(this, Super);
                return this;
            };
            anonymous.extend = function(Super){
                extend(this, Super);
                return this;
            };

            anonymous.fn = anonymous.prototype;
            //anonymous.__tag = "object.Class";
            //Super.__tag == "object.Class" ||       

            return anonymous;
        }
        , Collection: function (model, prototype, statics, Super) {
            switch (arguments.length) {
                case 0:
                case 1:
                    return null;
                case 3:
                    if (typeof statics == "function") {
                        Super = statics;
                        statics = null;
                    }
                    break;
            }

            var 
            _expendo = 0,
            _prototype = $.extend({}, prototype, {
                init: function () {
                    this.models = [];
                    this.__map = {};
                    prototype.init ? prototype.init.apply(this, arguments) : this.add.apply(this, arguments);
                    return this;
                },
                //getByCid: function () { },
                add: function (model) {
                    /// <summary>添加对象</summary>
                    /// <param name="model" type="model<arguments>">对象</param>
                    /// <returns type="self" />
                    var arg = $.util.argToArray(arguments),
                    len = arg.length,
                    i = 0,
                    model;
                    for (; i < len; i++) {
                        model = arg[i]
                        if (!this.__map[model.id]) {
                            this.models.push(model);
                            this.__map[model.id || (model.constructor.name + _expendo++)] = model;
                        }
                    }
                    return this;
                },
                pop: function () {
                    /// <summary>移除最后个对象</summary>
                    /// <returns type="Model" />
                    return this.remove(this.models[this.models.length - 1]);
                },
                remove: function (id) {
                    /// <summary>移除某个对象</summary>
                    /// <param name="id" type="Object/Number/String">对象的索引</param>
                    /// <returns type="Model" />
                    var model = null, i;
                    switch (typeof id) {
                        case "number":
                            model = this.models[id];
                            break;
                        case "string":
                            model = this.__map[id];
                            break;
                        case "object":
                            model = id;
                            break;
                    }
                    if (model) {
                        this.models.splice($.inArray(this.models, model), 1);
                        for (i in this.__map) {
                            if (this.__map[i] == model) {
                                delete this.__map[i];
                            }
                        }
                    }
                    return model;
                },
                get: function (id) {
                    /// <summary>获得某个model</summary>
                    /// <param name="id" type="Number/Object">方法</param>
                    /// <returns type="self" />
                    switch (typeof id) {
                        case "number":
                            model = this.models[id];
                            break;
                        case "string":
                            model = this.__map[id];
                            break;
                    }
                    return model;
                },
                clear: function () {
                    /// <summary>重置所含对象</summary>
                    /// <returns type="self" />
                    this.models = [];
                    this.__map = {};
                    return this;
                },

                each: function (fn, context) {
                    /// <summary>遍历整个model</summary>
                    /// <param name="fn" type="Function">方法</param>
                    /// <param name="context" type="Object">上下文</param>
                    /// <returns type="self" />
                    for (var i = 0, model = this.models, item; item = model[i++]; )
                        fn.call(context || item, item, i);
                    return this;
                }
            }),
            _statics = $.extend({}, statics),
            name = typeof model == "string" ? model : model.name + "Collection";

            return object.Class(name, _prototype, _statics, Super);
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

        , inheritProtypeWidthExtend: function (Sub, Super) {
            /// <summary>继承prototype 使用普通添加模式 不保有统一个内存地址 也不会调用多次构造函数</summary>
            /// <para>如果anotherPrototype为false对子类的prototype添加属性也会添加到父类</para>
            /// <para>如果Sub不为空也不会使用相同引用</para>
            /// <param name="Sub" type="Object">子类</param>
            /// <param name="Super" type="Object">父类</param>
            /// <returns type="self" />
            var con = Sub.prototype.constructor;
            $.easyExtend(Sub.prototype, Super.prototype);
            Sub.prototype.constructor = con || Super.prototype.constructor;
            return this;
        }
        , inheritProtypeWidthParasitic: function (Sub, Super, name) {//加个SuperName
            /// <summary>继承prototype 使用寄生 不会保有同一个内存地址</summary>
            /// <param name="Sub" type="Object">子类</param>
            /// <param name="Super" type="Object">父类</param>
            /// <param name="name" tuype="String">可以再原型链中看到父类的名字 而不是Parasitic</param>
            /// <returns type="self" />
            if (!Super) {
                return this;
            }
            var 
            originPrototype = Sub.prototype,
            name = Super.name || name,
            Parasitic =
            typeof name == "string" ?
            (eval("(function " + name + "() { });") || eval("(" + name + ")"))
            : function () { };
            Parasitic.prototype = Super.prototype;
            Sub.prototype = new Parasitic();
            //var prototype = Object(Super.prototype);
            //Sub.prototype = prototype;
            $.easyExtend(Sub.prototype, originPrototype);
            //Sub.prototype.constructor = Sub;

            return this;
        }
        , inheritProtypeWidthCombination: function (Sub, Super) {
            /// <summary>继承prototype 使用经典组合继承 不会保有同一个内存地址</summary>
            /// <para>如果anotherPrototype为false对子类的prototype添加属性也会添加到父类</para>
            /// <para>如果Sub不为空也不会使用相同引用</para>
            /// <param name="Sub" type="Object">子类</param>
            /// <param name="Super" type="Object">父类</param>
            /// <returns type="self" />
            Sub.prototype = new Super();
            return this;
        }
        , isPrototypeProperty: function (obj, name) {
            /// <summary>是否是原型对象的属性</summary>
            /// <param name="obj" type="any">任意对象</param>
            /// <param name="name" type="String">属性名</param>
            /// <returns type="Boolean" />
            return !obj.hasOwnProperty(name) && (name in obj);
        }

        , providePropertyGetSet: function (obj, object) {
            /// <summary>提供类的属性get和set方法</summary>
            /// <param name="obj" type="Object">类</param>
            /// <param name="object" type="Object">属性名列表</param>
            /// <returns type="String" />
            if (!$.isPlainObj(object)) {
                return this;
            }
            //这里加个验证a
            return $.each(object, function (value, key) {
                var purview = defaultPurview, validate = defaultValidate, defaultValue = undefined, edit;
                switch (typeof value) {
                    case "string":
                        purview = value;
                        break;
                    case "object":
                        if ($.isStr(value.purview)) {
                            purview = value.purview;
                        }
                        if ($.isFun(value.validate)) {
                            validate = value.validate;
                        }
                        if ($.isFun(value.edit)) {
                            edit = value.edit;
                        }
                        defaultValue = value.defaultValue; //undefinded always undefinded
                        break;
                    case "function":
                        validate = value;
                        break;

                }
                this[key] = defaultValue;

                var prefix = /\-pa[\s]?/.test(purview) ? "_" : "", setPrefix, getPrefix;

                if (purview.match(/\-w([u|a])?[\s]?/)) {
                    getPrefix = RegExp.$1 == "a" ? "_" : "";
                    this[(getPrefix || prefix) + $.util.camelCase(key, "set")] = function (a) {
                        if (validate.call(this, a)) {
                            this[key] = a;
                        }
                        else if (defaultValidate !== undefined) {
                            this[key] = defaultValue;
                        }

                        return this;
                    }
                }
                if (purview.match(/\-r([u|a])?[\s]?/)) {
                    setPrefix = RegExp.$1 == "a" ? "_" : "";
                    this[(setPrefix || prefix) + $.util.camelCase(key, "get")] = function () {
                        return edit ? edit.call(this, this[key]) : this[key];
                    }
                }
            }, obj.prototype);
        }
    };

    $.object = object;

    return object;
}, "1.0.0");