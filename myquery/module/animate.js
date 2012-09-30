﻿/// <reference path="../myquery.js" />
/*include JQuery animate*/

myQuery.define("module/animate", ["base/queue", "main/data", "module/fx", "module/thread", "module/tween"], function ($, Queue, data, FX, Thread, Tween, undefined) {
    "use strict"; //启用严格模式
    FX.tick = function () {
        if (thread.getStatus() === "run") return;
        thread.start();
    }

    FX.stop = function () {
        //        clearInterval(timerId);
        //        timerId = null
        thread.stop();
    }

    var timers = FX.timers
    , thread = new Thread({
        isAnimFrame: true //will be use AnimFrame
        , duration: 0 //will be go forever 
        , fun: function () {
            for (var i = 0, c; c = timers[i++]; ) {
                c.step(thread.pauseTime);
            }

            if (!timers.length) {
                FX.stop();
            }
        }
    })
    , animate = function (ele, property, option) {
        var opt = {}
            , p
            , isElement = $.isEle(ele)
            , hidden = isElement && $(ele).isVisible()
            , self = ele
            , count = 0
            , nOpt
            , defaultEasing = option.easing;

        $.easyExtend(opt, option);

        for (var p in property) {
            var name = $.camelCase(p);
            if (p !== name) {
                property[name] = property[p];
                //把值复制给camelCase转化后的属性  
                delete property[p];
                //删除已经无用的属性  
                p = name;
            }
            if (property[p] === "hide" && hidden || property[p] === "show" && !hidden) {
                return opt.complete.call(ele);
            }

            if ((p === "height" || p === "width") && ele.style) {
                opt.display = ele.style.display; //$.css(ele, "display");

                opt.overflow = ele.style.overflow;

                ele.style.display = "block"; //是否对呢？
            }

            count++;
        }

        if (opt.overflow != null) {
            ele.style.overflow = "hidden";
        }

        opt.curAnim = $.extend({}, property);
        opt.curCount = count;
        opt.isStart = 1;

        $.each(property, function (value, key) {
            opt.easing = opt.specialEasing && opt.specialEasing[key]
            ? $.getAnimationEasing(opt.specialEasing[key])
            : defaultEasing;
            if ($.isFun($.fx.custom[key])) {
                return $.fx.custom[key](ele, opt, value, key);
            }
            new $.fx(ele, opt, value, key);
        });

        return true;
    };
    thread.stop = function () {
        $.each(timers, function (item) {
            if (item) {
                item.stop();
                $(item.ele).dequeue();
            }
        });

        Thread.prototype.stop.call(this)
    }

    $.extend({
        animate: function (ele, property, option) {
            /// <summary>给所有元素添加一个动画
            /// <para>obj property:{ width: "50em", top: "+=500px" }</para>
            /// <para>需要插件{transform3d: { translateX: "+=100px", translateY: "+=100px"}}</para>
            /// <para>obj option</para>
            /// <para>num/str option.duration:持续时间 也可输入"slow","fast","normal"</para>
            /// <para>fun option.complete:结束时要执行的方法</para>
            /// <para>str/fun option.easing:tween函数的路径:"quad.easeIn"或者直接的方法</para>
            /// <para>默认只有linear。需要其他的函数，需要添加插件。或者添加方法到$.tween</para>
            /// <para>bol option.queue:是否进入队列，默认是true。不进入队列将立即执行</para>
            /// </summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="property" type="Object">样式属性</param>
            /// <param name="option" type="Object">参数</param>
            /// <returns type="self" />
            var option = $._getAnimateOpt(option);

            if ($.isEmptyObj(property)) {
                return option.complete(ele);
            }
            else {
                if (option.queue === false) {
                    animate(ele, property, option);
                }
                else {
                    //                    var queue = $.queue(ele, "fx", function (ele, dequeue) {
                    //                        animate(ele, property, option);
                    //                        dequeue();
                    //                        property = option = null;
                    //                    });

                    //                    if (queue[0] !== "inprogress") {
                    //                        $.dequeue(ele, "fx");
                    //                    }
                }
            }
            return this;
        }
        , animationPower: thread

        , clearQueue: function (ele, type) {
            return $.queue(ele, type || "fx", []);
        }

        , dequeue: function (ele, type) {
            //quote from jQuery-1.4.1 
            type = type || "fx";
            var q = $.queue(ele, type);

            return q.dequeue(ele, [ele]);
            //            var queue = $.queue(ele, type), fn = queue.shift();

            //            if (fn === "inprogress") {
            //                fn = queue.shift();
            //            }

            //            if (fn) {
            //                if (type === "fx") {
            //                    //queue.unshift("inprogress");
            //                    queue.splice(0, 0, "inprogress");
            //                }

            //                fn.call(ele, ele, function () {
            //                    $.dequeue(ele, type);
            //                });
            //            }
        }

        , _getAnimateOpt: function (opt) {
            opt = opt || {};
            var duration = FX.getDuration(opt.duration)
                , delay = FX.getDelay(opt.delay)
                , ret;
            ret = {
                delay: delay
                , duration: duration
                , easing: $.getAnimationEasing(opt.easing)
                , specialEasing: opt.specialEasing
                , complete: function () {
                    opt.complete && opt.complete();
                    $(this).dequeue(); // this is ele
                }
                , queue: opt.queue === false ? false : true
            }
            return ret;
        }
        , getAnimationEasing: function (easing) {
            if ($.isArr(easing)) {
                var ret = Tween.getFun(easing.splice(0, 1));

                return function (t, b, c, d) {
                    ret.apply(Tween, [t, b, c, d].concat(easing));
                }
            }
            return Tween.getFun(easing);

        }

        , queue: function (ele, type, fn) {
            //quote from jQuery-1.4.1 
            if (!ele) {
                return;
            }

            type = (type || "fx") + "queue";
            var q = $.data(ele, type);

            //            if (!data) {
            //                return q || [];
            //            }

            //            if (!q || $.isArr(data)) {
            //                q = $.data(ele, type, $.makeArray(data));

            //            }
            //            else {
            //                q.push(data);
            //            }
            if (!q) {
                q = $.data(ele, type, new Queue());
            }

            return q.queue(fn, ele, [ele]);
            //return q;
        }

        //, timers: timers
    });
    $.fn.extend({
        animate: function (property, option) {
            /// <summary>给所有元素添加一个动画
            /// <para>obj property:{ width: "50em", top: "+=500px" }</para>
            /// <para>需要插件{transform3d: { translateX: "+=100px", translateY: "+=100px"}}</para>
            /// <para>obj option</para>
            /// <para>num/str option.duration:持续时间 也可输入"slow","fast","normal"</para>
            /// <para>fun option.complete:结束时要执行的方法</para>
            /// <para>str/fun option.easing:tween函数的路径:"quad.easeIn"或者直接的方法</para>
            /// <para>默认只有linear。需要其他的函数，需要添加插件。或者添加方法到$.tween</para>
            /// <para>bol option.queue:是否进入队列，默认是true。不进入队列将立即执行</para>
            /// </summary>
            /// <param name="property" type="Object">样式属性</param>
            /// <param name="option" type="Object">参数</param>
            /// <returns type="self" />
            var option = $._getAnimateOpt(option);

            if ($.isEmptyObj(property)) {
                return this.each(option.complete);
            }
            else {
                return this[option.queue === false ? "each" : "queue"](function (ele) {
                    animate(ele, property, option);
                });
            }
            //return this; //提供注释
        }
        , animateStop: function () {
            /// <summary>停止所有元素的动画</summary>
            /// <returns type="self" />
            var i = timers.length - 1
            this.each(function (ele) {
                for (; i >= 0; i--) {
                    if (timers[i].ele === ele) {
                        timers[i].stop();
                    }
                }
            });
            return this;
        }

        , dequeue: function (type) {
            //quote from jQuery-1.4.1 
            return this.each(function (ele) {
                $.dequeue(ele, type);
            });
        }

        , queue: function (type, data) {
            //quote from jQuery-1.4.1 
            if (!$.isStr(type)) {
                data = type;
                type = "fx";
            }

            if (data === undefined) {
                return $.queue(this[0], type);
            }
            return this.each(function (ele) {
                var queue = $.queue(ele, type, data);

                //                if (type === "fx" && queue[0] !== "inprogress") {
                //                    $.dequeue(ele, type);
                //                }
            });
        }
    });

});