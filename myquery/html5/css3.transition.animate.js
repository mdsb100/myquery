﻿/// <reference path="../myquery.js" />
myQuery.define("html5/css3.transition.animate", ["base/client", "html5/css3", "module/FX", "html5/animate.transform", "hash/cubicBezier.tween"], function ($, client, css3, FX, transform, cubicBezierTween, undefined) {
    "use strict"; //启用严格模式
    //无法识别em这种
    if ($.support.transition) {
        var
        transitionEndType = (function () {
            var type = "";
            if (client.engine.ie) type = "MS";
            else if (client.engine.webkit || client.system.mobile) type = "webkit";
            else if (client.engine.gecko) type = "";
            else if (client.engine.opera) type = "o";
            return type + 'TransitionEnd';
        })(),
            animateByTransition = function (ele, property, option) {
            /// <summary>给所有元素添加一个动画
            /// <para>obj property:{ width: "50em", top: "+=500px" }</para>
            /// <para>obj option</para>
            /// <para>num/str option.duration:持续时间 也可输入"slow","fast","normal"</para>
            /// <para>fun option.complete:结束时要执行的方法</para>
            /// <para>str/fun option.easing:tween函数的路径:"quad.easeIn"或者直接的方法</para>
            /// <para>默认只有linear</para>
            /// <para>没有complete</para>
            /// </summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="property" type="Object">样式属性</param>
            /// <param name="option" type="Object">参数</param>
            /// <returns type="self" />
            var opt = {},
                p, self = ele,
                defaultEasing = option.easing,
                easing, transitionList = $.data(ele, "_transitionList");

            if (!transitionList) {
                transitionList = {};
            };

            $.easyExtend(opt, option);
            //opt._transitionList = [];
            opt._transitionEnd = function (event) {
                var i, ele = this,
                    transitionList = $.data(ele, "_transitionList");

                for (i in transitionList) {
                    css3.removeTransition(ele, i);
                    delete transitionList[i];
                };
                // for (; i < len; i++) {
                //     css3.removeTransition(this, opt._transitionList[i]);
                // }
                ele.removeEventListener(transitionEndType, opt._transitionEnd);

                setTimeout(function () {
                    opt.complete.call(ele);
                    ele = opt = null;
                }, 0);

            };

            for (var p in property) {
                var name = $.unCamelCase(p);
                if (p !== name) {
                    property[name] = property[p];
                    //把值复制给camelCase转化后的属性  
                    delete property[p];
                    //删除已经无用的属性  
                    p = name;
                }

                if ((p === "height" || p === "width") && ele.style) {
                    opt.display = ele.style.display; //$.css(ele, "display");
                    opt.overflow = ele.style.overflow;

                    ele.style.display = "block"; //是否对呢？
                }
            }

            //css3.removeTransition(ele);
            ele.addEventListener(transitionEndType, opt._transitionEnd, false);

            $.each(property, function (value, key) {
                var ret, i, temp, value, tran = [],
                    duration = opt.duration / 1000,
                    delay = opt.delay / 1000,
                    item, startTime;
                //para肯定要在这里用
                easing = opt.specialEasing && opt.specialEasing[key] ? $.getTransitionEasing(opt.specialEasing[key]) : defaultEasing;
                opt.easing = opt.originEasing;
                if ($.isFun($.fx.custom[key])) {
                    ret = $.fx.custom[key](ele, opt, value, key);
                    temp = ret[0]._originCss;
                    //opt._transitionList.push(temp);
                    tran.push(temp, duration + "s", easing);
                    opt.delay && tran.push(delay + "s");
                    css3.addTransition(ele, tran.join(" "));
                    value = ret[0].update();
                    startTime = new Date();
                    for (i = 0; i < ret.length; i++) {
                        item = ret[i];
                        value = item.update(value, item.end);
                        item.startTime = startTime;
                    }
                    if (!transitionList[temp]) {
                        transitionList[temp] = [];
                    };
                    transitionList[temp] = transitionList[temp].concat(ret);
                } else {
                    ret = new FX(ele, opt, value, key);
                    //opt._transitionList.push(key);
                    //temp = $.camelCase(key);
                    //ele.style[temp] = ret.from + ret.unit;
                    tran.push(key, duration + "s", easing);
                    opt.delay && tran.push(delay + "s");

                    css3.addTransition(ele, tran.join(" "));
                    ele.style[$.camelCase(key)] = ret.end + ret.unit;
                    ret.startTime = new Date();
                    transitionList[key] = ret;
                }
            });

            $.data(ele, "_transitionList", transitionList);

        },
            easingList = {
                "linear": 1,
                "ease": 1,
                "ease-in": 1,
                "ease-out": 1,
                "ease-in-out": 1,
                "cubic-bezier": 1
            };

        $.extend({
            animateByTransition: function (ele, property, option) {
                var option = $._getAnimateByTransitionOpt(option);

                if ($.isEmptyObj(property)) {
                    return option.complete(ele);
                } else {
                    if (option.queue === false) {
                        animateByTransition(ele, property, option);
                    } else {
                        $.queue(ele, "fx", function () {
                            animateByTransition(ele, property, option);
                            $.dequeue(ele, [ele]);
                            property = option = null;
                        });

                    }
                }
                return this;
            },
            stopAnimationByTransition: function (ele, isDequeue) {
                var transitionList = $.data(ele, "_transitionList"),
                    type, fx, i, item;
                for (type in transitionList) {
                    fx = transitionList[type];
                    if ($.isArr(fx)) {
                        for (i = fx.length - 1; i >= 0; i--) {
                            item = fx[i];
                            console.log(item.easing);
                            item.isInDelay() ? item.update(null, fx.from) : item.step();
                        };
                    } else {
                        console.log(fx.isInDelay())
                        fx.isInDelay() ? fx.update(fx.from) : fx.step();
                    }
                    delete transitionList[type];
                }

                css3.removeTransition(ele);
                isDequeue == false || $.dequeue(ele);
                return this;
            },
            _getAnimateByTransitionOpt: function (opt) {
                opt = opt || {};
                var duration = FX.getDuration(opt.duration),
                    delay = FX.getDelay(opt.delay),
                    ret = {
                        delay: delay,
                        duration: duration,
                        easing: $.getTransitionEasing(opt.easing),
                        originEasing: $.getAnimationEasing(opt.easing, opt.para),
                        complete: function (fx) {
                            opt.complete && opt.complete();
                            $(this).dequeue(); // this is ele
                            opt = duration = null;
                        },
                        specialEasing: opt.specialEasing,
                        queue: opt.queue === false ? false : true,
                        para: opt.para || [] //如何使用
                    };

                return ret;
            },
            getTransitionEasing: function (easing) {
                var name = easing;
                if (easing) {
                    if ($.isArr(easing)) {
                        name = easing.splice(0, 1)[0];
                    }
                    name = $.unCamelCase(name);

                    name = name.replace(".", "-");

                    if (easing = cubicBezierTween[easing]) {
                        name = "cubic-bezier";
                    };

                    if (name == "cubic-bezier") {
                        return name + "(" + easing.join(",") + ")";
                    };

                    if (easingList[name]) {
                        return name;
                    };
                }
                return "linear";
            }
        });

        $.fn.extend({
            animateByTransition: function (property, option) {
                // <summary>给所有元素添加一个动画
                /// <para>obj property:{ width: "50px", top: "+=500px" }</para>
                /// <para>obj option</para>
                /// <para>num/str option.duration:持续时间 也可输入"slow","fast","normal"</para>
                /// <para>fun option.complete:结束时要执行的方法</para>
                /// <para>str/fun option.easing:tween函数的路径:"quad.easeIn"或者直接的方法</para>
                /// <para>默认只有linear</para>
                /// <para>没有complete</para>
                /// </summary>
                /// <param name="property" type="Object">样式属性</param>
                /// <param name="option" type="Object">参数</param>
                /// <returns type="self" />
                var option = $._getAnimateByTransitionOpt(option);
                if ($.isEmptyObj(property)) {
                    return this.each(option.complete);
                } else {
                    return this[option.queue === false ? "each" : "queue"](function (ele) {
                        animateByTransition(ele, property, option);
                    });
                }
            },
            stopAnimationByTransition: function (isDequeue) {
                return this.each(function (ele) {
                    $.stopAnimationByTransition(ele, isDequeue);
                });
            }
        });

        if ($.config.model.transitionToAnimation) {
            if ($.support.transition) {
                $.animate = $.animateByTransition;
                $.stopAnimation = $.stopAnimationByTransition;
                $.animationPower = "css3.transition";
                $._getAnimateOpt = $._getAnimateByTransitionOpt;
                $.fn.animate = $.fn.animateByTransition;
                $.fn.stopAnimation = $.fn.stopAnimationByTransition;
            } else {
                $.console.log({
                    msg: "browser is not support transitionEnd",
                    fn: "css3.transition.animate load"
                });
            }
        }
    }

});