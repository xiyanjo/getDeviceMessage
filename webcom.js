'use strict';
window.Rui = window.Rui || {
        Ajax: {},
        collect: {}
    };
window.Rui.Ajax = (function () {
    return function (paras, fun1, appid, channel) {
        $.ajax({
            url: paras.mdname,
            data: paras.data,
            headers: {
                'jts-appId': appid ? appid : 'pc',
                'jts-channel': channel ? channel : 'jts'
            },
            type: 'GET',
            dataType: 'jsonp',
            success: function (res) {
                if ($.isFunction(fun1)) {
                    fun1(res);
                }
            }
        });
    }
}());
window.Rui.collect = (function () {
    var ajax = window.Rui.Ajax,
        clickType = ['a', 'div', 'i', 'span', 'p', 'td', 'tr', 'img', 'li', 'ul'],
        faTag = '',
        refer = '',
        t = 0,
        ua = navigator.userAgent.toLowerCase(),
        tp = '',
        p = '',
        curBtn = '',
        appid = '';//h5 or pc

    // 获取refer
    function getReferer() {
        refer = document.referrer ? document.referrer : '';
        return refer;
    }

    //是否是微信
    function isWeiXin() {
        return ( ua.match(/MicroMessenger/i) ? 1 : 0 );
    }

    // 是否是移动端
    function ismobile() {
        return (ua.match(/(iphone|ipod|android|ios|mobile)/) ? 1 : 0);
    }

    // 判断父元素标签名
    function getTagName(_this) {
        faTag = $(_this).parent()[0].tagName.toLocaleLowerCase();
        faTag = $.inArray(faTag, clickType) != -1 ? 1 : 0;
        console.log(faTag);
        return faTag;
    }

    // 获取当前页面
    function getP() {
        p = window.location.pathname.substring(1);
        return p;
    }

    // 获取目标页面
    function getTp(_this) {
        tp = $(_this).attr('href');
        return tp;
    }

    // 获取在页面停留时间
    function getDuration() {
        var st = new Date().getTime();  // 在页面加载运行js时记录当前时间

        $(window).on('beforeunload', function () {
            var et = new Date().getTime();
            t = et - st;
            console.log('et', et, t);
        }); // 在页面要unload触发'beforeunload'事件时进行时间差计算得到访问时长
    }

    // 获取元素信息
    function getEle(ele, _this) {
        curBtn = {
            nodeType: ele,
            id: $(_this).attr('id'),
            class: $(_this).attr('class'),
            html: $(_this).html() || $(_this).val(),
            curParent: $(_this).parent(),
            curIndex: $(_this).index() + 1,
            parentIndex: $(_this).parent().index() + 1,
            parentHtml: $(_this).parent().html() || $(_this).parent().val(),
        };
        curBtn = JSON.stringify(curBtn);
        return curBtn;
    }

    // 所有收集的信息
    function collectInfo(_this) {
        getReferer();// 获取refer
        getP();// 获取当前页
        appid = (ismobile() || isWeiXin()) ? 'h5' : 'pc';
        getTp(_this); // 目标页
    }

    // 发送埋点信息
    function reqCollect(type, t, tp) {
        collectInfo();
        var paras = {
            mdname: 'http://192.168.40.102:9090/stat/gateway/stat/collect/jsonp',
            data: {
                v: '不需要',                     //客户端版本号
                r: refer,   //refer
                p: p,       //当前页
                tp: tp,    //目标页
                type: type,  //打点类型
                pnc: '',                        //页面中文名称
                pne: curBtn,//点击按钮信息
                t: t,        //页面停留时长
                bv: ua        //浏览器版本  ua
            }
        };
        console.log('发送的数据', paras.data);
        ajax(paras, function (res) {
            console.log(8888, res);
        }, appid);
    }

    // 点击时发送埋点信息
    function clickSend() {

        for (var i = 0; i < clickType.length; i++) {
            (function (arg) {
                $(clickType[i]).on('click', function (event) {
                    var _this = this;
                    getEle(clickType[arg], _this);// 元素信息
                    reqCollect('20', t, tp); // 发送数据
                    event.stopPropagation();
                });
            })(i);//调用时参数
        }
    }

    // 页面刷新或关闭发送埋点信息
    function pageSend() {
        $(window).unload(function () {
            console.log('页面发送数据执行了');
            reqCollect('10', t, '');
        });
    }
    // img对象形式传递
    /*function getid() {
        $('a').on('click',function () {
            var img = new Image();
            img.src = 'http://192.168.40.102:9090/stat/gateway/stat/collect/image' +'?id=666';
        });
    }*/

    function start() {
        // 获取页面停留时长
        getDuration();

        // 点击发送埋点数据
        clickSend();
        // img  对象形式传递
        //getid();
        // 页面发送埋点数据
        pageSend();

    }

    return {
        start: start
    }
}()).start();
