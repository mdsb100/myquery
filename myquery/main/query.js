﻿/// <reference path="../myquery.js" />

myQuery.define("main/query", function ($) {
    "use strict"; //启用严格模式
    $.module.query = "1.0.0";

    var reg = RegExp,
        propertyFun = {
            "default": function (item, value) { return item != undefined; }
            , "=": function (item, value) { return item == value; }
            , "!=": function (item, value) { return item != value; }
            , "^=": function (item, value) {
                return item != undefined && item.toString().indexOf(value.toString()) == 0;
            }
            , "*=": function (item, value) {
                return item != undefined && item.indexOf(value.toString()) > -1;

            }
            , "$=": function (item, value) {
                if (item != undefined) {
                    item = item.toString(); ;
                    value = value.toString();
                    var ret = item.indexOf(value.toString());
                    return ret > -1 && item.length - value.length == ret
                }
                return false
            }
        },
        query = {
            child: function (eles, real) {
                /// <summary>获得一级子元素</summary>
                /// <param name="eles" type="Element/ElementCollection/arr">从元素或元素数组或元素集合中获取</param>
                /// <param name="real" type="Boolean/Null">是否获得真元素，默认为真</param>
                /// <returns type="Array" />
                var list = [], real = real === undefined ? true : real;
                if ($.isEle(eles)) eles = [eles];
                $.each(eles, function (ele) {
                    list = list.concat($.elementCollectionToArray(ele.childNodes, real));
                }, this);
                return list;
            }
            , children: function (eles) {
                /// <summary>获得所有的子元素</summary>
                /// <param name="eles" type="Element/ElementCollection/arr">从元素或元素数组或元素集合中获取</param>
                /// <param name="real" type="Boolean/Null">是否获得真元素，默认为真</param>
                /// <returns type="Array" />
                if ($.isEle(eles))
                    eles = [eles];
                return $.getEleByTag("*", eles); ;
            }

            , elementCollectionToArray: function (eles, real) {
                /// <summary>把ElementCollection转换成arr[ele]</summary>
                /// <param name="eles" type="ElementCollection">元素集合</param>
                /// <param name="real" type="Boolean/undefined">是否获得真元素，默认为真</param>
                /// <returns type="Array" />
                var list = [];
                if ($.isEleConllection(eles)) {
                    var real = real === undefined ? true : real;
                    $.each(eles, function (ele) {
                        if (real === false)
                            list.push(ele)
                        else if (ele.nodeType != 3 && ele.nodeType != 8)
                            list.push(ele)
                    }, this);
                }
                return list;
            }

            , filter: function (str, eles) {
                /// <summary>筛选Element；也可以用来筛选一般数组
                /// <para>返回ele数组</para>
                /// </summary>
                /// <param name="str" type="String/Function">字符串query或者筛选方法</param>
                /// <param name="eles" type="$/Array/Array:[Element]/Element/ElementCollection">筛选范围</param>
                /// <returns type="Array" />
                var num, list = [];
                if (!str || !eles) {
                    return list;
                }
                else if ($.isFun(str)) {
                    //                    $.each(eles, function (ele, index) {
                    //                        if (str(ele, index))
                    //                            list.push(ele)
                    //                    }, this);
                    list = $.filterArray(eles, str, this);
                }
                else if (/same/.test(str)) {
                    if (eles.length > 1) {
                        for (var len = eles.length, list = [eles[0]], result = true, i = 1, j = 0; i < len; i++) {
                            j = 0;
                            for (; j < list.length; j++) {
                                if (eles[i] === list[j]) {
                                    result = false;
                                    break;
                                }
                            }
                            result && list.push(eles[i]);
                            result = true;
                        }
                    }
                    else {
                        list = eles;
                    }
                }
                //            else if (/different/.test(str)) {
                //                if (eles.length > 1) {
                //                    for (var len = eles.length, i = 1, j = 0; i < len; i++) {
                //                        j = i + 1;
                //                        for (; j < list.length; j++) {
                //                            if (eles[i] === eles[j]) {
                //                                list.push(eles[i]);
                //                                j = ++i;
                //                                break;
                //                            }
                //                        }
                //                    }
                //                }
                //            }
                else if ($.reg.eq.test(str)) {
                    list = $.slice(eles, reg.$1, reg.$2 || 1);
                }
                else if (/first/.test(str))
                    list = eles.slice(0, 1);
                else if (/last/.test(str))
                    list = eles.slice(-1);
                else if ($.reg.than.test(str)) {
                    num = parseInt(reg.$2);
                    num = num < 0 ? eles.length + num : num;
                    list = str.indexOf("gt") > -1 ? eles.slice(num + 1) : eles.slice(0, num - 1)
                }
                else if (/even/.test(str))
                    $.each(eles, function (ele, index) {
                        index % 2 == 1 && list.push(ele);
                    }, this);
                else if (/odd/.test(str))
                    $.each(eles, function (ele, index) {
                        index % 2 == 0 && list.push(ele)
                    }, this);
                else if (/child/.test(str))
                    list = $.child(eles, true);
                else if (/children/.test(str))
                    list = $.children(eles);
                else if (/(selected|checked)/.test(str))//checked
                    $.each(eles, function (ele) {
                        if ($.isNode(ele, "input") || $.isNode(ele, "option")) {
                            num = ele[reg.$1];
                            if (num === true || num == reg.$1 || num == "true")
                                list.push(ele);
                        }
                    }
               , this);
                else if ((/(enabled|disabled)/.test(str))) //checked
                    $.each(eles, function (ele) {
                        if (!$.isNode(ele, "input")) return;
                        num = ele["disabled"];
                        if (num === true || num == reg.$1 || num == "true")
                            reg.$1 === "disabled" && list.push(ele);
                        else
                            reg.$1 === "enabled" && list.push(ele);
                    }
               , this);
                else if (/(hidden|visible)/.test(str)) {
                    var result1 = reg.$1.indexOf("hidden") > -1, result2;
                    $.each(eles, function (ele) {
                        result2 = ele.style['visibility'] == 'hidden' || ele.style['display'] == 'none';
                        if (result1 && result2)
                            list.push(ele);
                        else if (!result1 && !result2)
                            list.push(ele);
                    }
               , this);
                }
                else if (/input/.test(str)) {
                    list = $.query("input,select,button", eles);
                }
                else if (/button/.test(str)) {
                    $.each($.query("input", eles), function (ele) {
                        ele["type"] == "button" && list.push(ele)
                    }, this);
                    list.concat($.query("button", eles));
                }
                else if (/(input|button|text|password|radio|checkbox|submit|image|reset|file|tel)/.test(str)) {
                    $.each($.query("input", eles), function (ele) {
                        num = ele["type"];
                        $.isStr(num) && num.toLowerCase() == reg.$1 && list.push(ele);
                    }, this);
                }

                return list;
            }
            , find: function (str, eles) {
                /// <summary>筛选命令 所有后代元素
                /// <para>返回ele数组</para>
                /// </summary>
                /// <param name="str" type="String">字符串query</param>
                /// <param name="eles" type="Array/Element/ElementCollection">查询范围</param>
                /// <returns type="Array" />
                var list = [];
                if (!str || !eles) {

                }
                else if ($.reg.id.test(str)) {
                    var result = $.getEleById(reg.$1, eles.ownerDocument || eles[0].ownerDocument || document);
                    result && (list = [result]);
                }
                else if ($.reg.tagName.test(str)) {
                    list = $.getEleByTag(reg.$1, eles);
                }
                else if ($.reg.css.test(str)) {
                    list = $.getEleByClass(reg.$1, eles);
                }
                return list;
            }

            , getEle: function (ele, context) {
                /// <summary>通过各种筛选获得包含DOM元素的数组</summary>
                /// <param name="ele" type="Element/$/document/str">各种筛选</param>
                /// <returns type="Array" />
                var list = [], tmp;
                if ($.isStr(ele)) {
                    ele = $.trim(ele);
                    if (/^<.*>$/.test(ele)) {
                        list = $.elementCollectionToArray($.createEle(ele), false);
                    } else {
                        tmp = context || document;
                        list = $.query(ele, tmp.documentElement || context);
                    }
                }
                else if ($.isEle(ele))
                    list = [ele];
                else if ($.isArr(ele)) {
                    $.each(ele, function (result) {
                        $.isEle(result) && list.push(result);
                    }, this);
                    list = $.filter("same", list);
                }
                else if (ele instanceof $)
                    list = ele.eles;
                else if ($.isEleConllection(ele)) {
                    list = $.elementCollectionToArray(ele, true);
                }
                else if (ele === document)
                    list = [ele.documentElement];
                else if (ele === window)
                    list = [window]//有风险的
                else if ($.isDoc(ele)) {
                    list = [ele.documentElement];
                }

                return list;
            }
            , getEleByClass: function (className, eles) {
                /// <summary>通过样式名获得DOM元素
                /// <para>返回为ele的arr集合</para>
                /// </summary>
                /// <param name="className" type="String">样式名</param>
                /// <param name="eles" type="Element/ElementCollection/Array[Element]">从元素中获取</param>
                /// <returns type="Array" />
                if ($.isEle(eles))
                    eles = [eles];
                var list = [];
                if (eles[0].getElementsByClassName)
                    $.each(eles, function (ele) {
                        list = list.concat($.elementCollectionToArray(ele.getElementsByClassName(className)));
                    }, this);
                else
                    $.each(eles, function (ele) {
                        list = list.concat($.iterationChild(ele, function (child, arr) {
                            if ($.isEle(child) && $.getClass(child, className))
                                return true
                        }));
                    }, this);
                return list;
            }
            , getEleById: function (id, doc) {
                /// <summary>通过ID获得一个DOM元素</summary>
                /// <param name="id" type="String">id</param>
                /// <param name="doc" type="Document">document</param>
                /// <returns type="Element" />

                return $.isStr(id) ? (doc || document).getElementById(id) : null;
            }
            , getEleByTag: function (tag, eles) {
                /// <summary>通过标签名获得DOM元素</summary>
                /// <param name="tag" type="String">标签名</param>
                /// <param name="eles" type="Element/ElementCollection/Array[Element]">从元素或元素集合中获取</param>
                /// <returns type="Array" />
                if (eles) {
                    var str = 'getElementsByTagName', list = [], temp;
                    if ($.isEle(eles))
                        return $.elementCollectionToArray(eles[str](tag));
                    if ($.isEleConllection(eles) || $.isArr(eles)) {
                        $.each(eles, function (ele) {
                            temp = ele[str](tag)
                            if (temp.length > 0)
                                list = list.concat($.elementCollectionToArray(temp));
                            //list = list.concat(temp);
                        }, this);
                        return list;
                    }
                }
                return null;
            }
            , getFirstChild: function (ele) {
                /// <summary>获得当前DOM元素的第一个真DOM元素</summary>
                /// <param name="ele" type="Element">dom元素</param>
                /// <returns type="Element" />
                var x = ele.firstChild;
                while (x && !$.isEle(x)) {
                    x = x.nextSibling;
                }
                return x;
            }
            , getSelfIndex: function (ele) {
                /// <summary>通过序号获得当前DOM元素某个真子DOM元素 从0开始</summary>
                /// <param name="ele" type="Element">dom元素</param>
                /// <returns type="Number" />
                var i = -1, node = ele.parentNode.firstChild;
                while (node) {
                    if ($.isEle(node) && i++ != undefined && node === ele) {
                        break;
                    }
                    node = node.nextSibling;
                }
                return i;
            }

            , next: function (eles) {
                /// <summary>获得数组中所有元素的下一个同辈元素</summary>
                /// <param name="eles" type="Array:[ele]/ElementCollection">dom元素</param>
                /// <returns type="Array" />
                var temp = null, list = [], fun = arguments[1] == "previousSibling" ? $.previousSibling : $.nextSibling;
                $.each(eles, function (ele) {
                    temp = fun(ele);
                    temp && list.push(temp);
                });
                list = $.filter("same", list);
                return list;
            }
            , nextAll: function (eles) {
                /// <summary>获得数组中所有元素后面的所有同辈元素</summary>
                /// <param name="eles" type="Array:[ele]/ElementCollection">dom元素</param>
                /// <returns type="Element/null" />
                var temp = null, list = [], fun = arguments[1] == "previousSiblings" ? $.previousSiblings : $.nextSiblings;
                $.each(eles, function (ele) {
                    list = list.concat(fun(ele));
                });
                list = $.filter("same", list);
                return list;
            }
            , nextSibling: function (ele) {
                /// <summary>获得当前DOM元素的下一个真DOM元素</summary>
                /// <param name="ele" type="Element">dom元素</param>
                /// <returns type="Element/null" />
                var x = ele.nextSibling;
                while (x && !$.isEle(x)) {
                    x = x.nextSibling;
                }
                return x;
            }
            , nextSiblings: function (ele) {
                /// <summary>获得当前DOM元素的后面的所有真DOM元素</summary>
                /// <param name="ele" type="Element">dom元素</param>
                /// <returns type="Element/null" />
                var x = ele.nextSibling
             , list = [];
                while (x) {
                    $.isEle(x) && list.push(x);
                    x = x.nextSibling;
                }
                return list;
            }

            , pre: function (eles) {
                /// <summary>获得数组中所有元素的上一个同辈元素</summary>
                /// <param name="eles" type="Array:[ele]/ElementCollection">dom元素</param>
                /// <returns type="Array" />
                return $.next(eles, "previousSibling");
            }
            , preAll: function (eles) {
                /// <summary>获得数组中所有元素前面的所有同辈元素</summary>
                /// <param name="eles" type="Array:[ele]/ElementCollection">dom元素</param>
                /// <returns type="Element/null" />
                return $.nextAll(eles, "previousSiblings");
            }
            , previousSibling: function (ele) {
                /// <summary>获得当前DOM元素的上一个真DOM元素</summary>
                /// <param name="ele" type="Element">dom元素</param>
                /// <returns type="Element/null" />
                var x = ele.previousSibling;
                while (x && !$.isEle(x)) {
                    x = x.previousSibling;
                }
                return x;
            }
            , previousSiblings: function (ele) {
                /// <summary>获得当前DOM元素的前面的所有真DOM元素</summary>
                /// <param name="ele" type="Element">dom元素</param>
                /// <returns type="Element/null" />
                var x = ele.previousSibling
                , list = [];
                while (x) {
                    $.isEle(x) && list.push(x);
                    x = x.previousSibling;
                }
                return list;
            }
            , property: function (str, eles) {
                /// <summary>属性筛选器
                /// <para>arr返回元素数组</para>
                /// <para>[id]</para>
                /// <para>[id='test1']</para>
                /// <para>[id!='test1']</para>
                /// <para>[id*='test1']</para>
                /// <para>[id^='test1']</para>
                /// <para>[id$='test1']</para>
                /// </summary>
                /// <param name="str" type="String">筛选字符产</param>
                /// <param name="eles" type="Element/ElementCollection/Array">筛选范围</param>
                /// <returns type="Array" />
                var list = [];
                if (!str || !eles) {
                    return list;
                }
                var match = str.match($.reg.property)
                , name = match[1]
                , type = match[2]
                , value = match[4]
                , fun = propertyFun[type || "default"];

                if (type && !value) {
                    return list;
                }

                list = $.filter(function (item) {
                    return fun(item[name], value);
                }, eles);
                return list;
            }

            , query: function (str, eles) {
                /// <summary>查询命令
                /// <para>arr返回元素数组</para>
                /// </summary>
                /// <param name="str" type="String">字符串query</param>
                /// <param name="eles" type="Element/ElementCollection/Array[Element]">查询范围</param>
                /// <returns type="Array" />
                if (!eles || (eles.length != undefined && eles.length < 1)) return [];
                if (!str) {
                    return $.filter("same", eles);
                }
                var list;
                // 严格模式 无法调用 arguments.callee
                if (/,/.test(str)) {
                    list = [];
                    for (var i = 0, querys = str.split(","); i < querys.length; i++) {
                        querys[i] && (list = list.concat($.query(querys[i], eles)));
                    }
                    return $.query("", list);
                }
                else if ($.reg.id.test(str)) {
                    var result = $.getEleById(reg.$1, eles.ownerDocument || eles[0].ownerDocument || document);
                    result && (list = [result]);
                }
                else if ($.reg.tagName.test(str)) {
                    list = $.getEleByTag(reg.$1, eles);
                }
                else if ($.reg.css.test(str)) {
                    list = $.getEleByClass(reg.$1, eles);
                }
                else if ($.reg.search.test(str)) {
                    list = $.search(reg.rightContext, eles, true);
                }
                else if ($.reg.find.test(str)) {
                    list = $.find(reg.rightContext, eles, true);
                }
                else if ($.reg.filter.test(str)) {
                    list = $.filter(reg.rightContext, eles, true);
                }
                else if ($.reg.property.test(str)) {
                    list = $.property(str, eles);
                }
                else if (/^(\+\%)/.test(str)) {
                    list = $.nextAll(eles);
                }
                else if (/^(\~\%)/.test(str)) {
                    list = $.preAll(eles);
                }
                else if (/^\+/.test(str)) {
                    list = $.next(eles);
                }
                else if (/^\~/.test(str)) {
                    list = $.pre(eles);
                }
                //                else if (/^,/.test(str)) {
                //                    !$.isArr(eles) && (eles = [eles])
                //                    return eles.concat(this.query(reg.rightContext, (eles[0].ownerDocument && eles[0].ownerDocument.documentElement) || document.documentElement));
                //                }
                return $.query(reg.rightContext, list);
            }

            , search: function (str, eles) {
                /// <summary>筛选命令 所有后代元素
                /// <para>返回ele数组</para>
                /// </summary>
                /// <param name="str" type="String">字符串query</param>
                /// <param name="eles" type="Array/Element/ElementCollection">查询范围</param>
                /// <returns type="Array" />
                var list = [];
                if (!str || !eles) {
                    return list;
                }
                var child = $.child(eles);
                if ($.reg.id.test(str))
                    list = $.property("[id=" + reg.$1 + "]", child);
                else if ($.reg.tagName.test(str)) {
                    var result = reg.$1 == "*" ? true : false;
                    list = $.filter(function (ele) {
                        return result || $.isNode(ele, reg.$1); //ele.tagName.toLowerCase() === reg.$1.toLowerCase();
                    }, child);
                }
                else if ($.reg.css.test(str)) {
                    var temp = reg.$1;
                    list = $.filter(function (ele) {
                        return $.getClass(ele, temp) && true;
                    }, child);
                }
                return list;
            }

            , siblings: function (ele) {
                /// <summary>获得同辈元素的数组</summary>
                /// <param name="ele" type="Element">ele元素</param>
                /// <returns type="Array" />
                return ele.parentNode ? $.elementCollectionToArray(ele.parentNode.childNodes) : [];
            }
        };

    $.extend(query);

    $.fn.extend({
        ancestors: function (str, type) {
            /// <summary>返回所有元素的所有祖先元素</summary>
            /// <param name="str" type="String">查询字符串</param>
            /// <param name="type" type="String">parentNode表示所有祖先元素，offsetParent表示有大小的祖先元素</param>
            /// <returns type="self" />
            var list = [], cur, type = type == null || !$.isStr(type) || type.match(/parentNode|offsetParent/) ? "parentNode" : type;
            this.each(function (ele) {
                cur = ele[type];
                while (cur != null) {
                    cur != document && list.push(cur);
                    cur = cur[type];
                }
            });
            list = $.filter('same', list);
            return $($.query(str, list));
        }

        , filter: function (str) {
            /// <summary>筛选Element
            /// <para>返回arr第一项为查询语句</para>
            /// <para>返回arr第二项为元素数组</para>
            /// </summary>
            /// <param name="str" type="String/Function">字符串query或者筛选方法</param>
            /// <returns type="$" />

            return new $($.filter(str, this.eles));

        }
        , find: function (str) {
            /// <summary>通过字符串寻找所有后代节点</summary>
            /// <param name="str" type="String">查询字符串</param>
            /// <returns type="$" />
            return new $($.find(str, this.eles));
        }

        , eq: function (num, len) {
            /// <summary>返回元素序号的新$</summary>
            /// <param name="num1" type="Number/null">序号 缺省返回第一个</param>
            /// <param name="num2" type="Number/null">长度 返回当前序号后几个元素 缺省返回当前序号</param>
            /// <returns type="self" />
            return $($.slice(this.eles, num, len));
        }

        , index: function (real) {
            /// <summary>返回当前对象的第一个元素在同辈元素中的index顺序</summary>
            /// <param name="real" type="Boolean/Null">是否获得真元素，默认为真</param>
            /// <returns type="Number" />
            return $.getSelfIndex(this.eles[0], real);
        }
        , is: function (str) {
            /// <summary>返回筛选后的数组是否存在</summary>
            /// <param name="str" type="String">查询字符串</param>
            /// <returns type="Boolean" />
            return !!str && $.filter(str, this).length > 0;
        }

        , next: function () {
            /// <summary>返回所有元素的下一个同辈元素</summary>
            /// <returns type="self" />
            return $($.next(this.eles));
        }
        , nextAll: function (eles) {
            /// <summary>返回所有元素后面的所有同辈元素</summary>
            /// <param name="eles" type="Array:[ele]">dom元素</param>
            /// <returns type="Element/null" />
            return $($.nextAll(this.eles));
        }

        , parent: function (str, type) {
            /// <summary>返回所有元素的父级元素</summary>
            /// <param name="str" type="String">查询字符串</param>
            /// <param name="type" type="String">parentNode表示所有祖先元素，offsetParent表示有大小的祖先元素</param>
            /// <returns type="self" />
            var list = [], cur, result = false, type = type == null || !$.isStr(type) || type.match(/parentNode|offsetParent/) ? "parentNode" : type;
            this.each(function (ele) {
                cur = ele[type];
                cur && cur != document && list.push(ele.parentNode);
            });
            list = $.filter('same', list);
            return $($.query(str, list));
        }
        , pre: function (eles) {
            /// <summary>返回所有元素的上一个同辈元素</summary>
            /// <returns type="self" />
            return $($.pre(this.eles));
        }
        , preAll: function (eles) {
            /// <summary>返回所有元素前面的所有同辈元素</summary>
            /// <param name="eles" type="Array:[ele]/ElementCollection">dom元素</param>
            /// <returns type="self" />
            return $($.preAll(this.eles));
        }
        , property: function (str, eles) {
            /// <summary>属性筛选器
            /// <para>arr返回元素数组</para>
            /// <para>[id]</para>
            /// <para>[id='test1']</para>
            /// <para>[id!='test1']</para>
            /// <para>[id*='test1']</para>
            /// <para>[id^='test1']</para>
            /// <para>[id$='test1']</para>
            /// </summary>
            /// <param name="str" type="String">筛选字符产</param>
            /// <returns type="self" />
            return new $($.property(str, this.eles));
        }

        , query: function (str) {
            /// <summary>查询命令</summary>
            /// <param name="str" type="String">查询字符串</param>
            /// <returns type="$" />
            return new $($.query(str, this.eles));
        }

        , search: function (str) {
            /// <summary>通过字符串寻找子节点</summary>
            /// <param name="str" type="String">查询字符串</param>
            /// <returns type="$" />
            return new $($.search(str, this.eles));
        }
    });

    $.interfaces.achieve("constructorQuery", function (type, a, b) {
        return query.getEle(a, b);
    });

    return query;
}, "1.0.0");