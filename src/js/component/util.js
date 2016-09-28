import config from './config';
import Modal from './modal';

// 判断是否是function
export let isFunction = (fn) => typeof fn == 'function';

// 日期格式化 YYYY-MM-DD hh:mm:ss
export let formatDate = (date, type, semantic) => {

    if (!/^\d+$/g.test(date)) {
        return date;
    }

    let d = null;
    let dates = null;
    let reg = null;
    let types = type || 'YYYY-MM-DD hh:mm:ss';

    if (date) {
        d = new Date(date);
    } else {
        throw new Error('缺少需要格式化的日期参数：date');
        return;
    }

    // 语义化的返回时间
    if (semantic) {
        let nowTime = +new Date();
        let diffTime = nowTime - date;
        let oneDay = 86400000; // 一天的毫秒数

        if (diffTime > oneDay && diffTime < 2 * oneDay) {
            return '昨日';
        } else if (diffTime < oneDay) {
            return '今日';
        }
    }

    dates = {
        'Y+': d.getFullYear(),
        'M+': d.getMonth() + 1,
        'D+': d.getDate(),
        'h+': d.getHours(),
        'm+': d.getMinutes(),
        's+': d.getSeconds()
    };

    for (let attr in dates) {
        dates[attr] = dates[attr] < 10 ? ('0' + dates[attr]) : dates[attr];
        reg = new RegExp(attr, 'g');
        types = types.replace(reg, dates[attr]);
    }

    return types;
};

// 解析url参数
export let parseUrl = (url) => {
    if (url.charAt(0) == '#' || url.charAt(0) == '?') {
        url = url.substring(1);
    }
    let urls = url.split('&');
    let obj = {};

    urls.map((item) => obj[item.split('=')[0]] = item.split('=')[1]);
    return obj;
}

// 获取表单数据
export let getFormData = (ele) => {
    let oInput = ele.find("[name]"),
        options = {},
        _val = null;

    Array.prototype.map.call(oInput, (item) => {
        _val = item.value;
        if (!/^\s*$/g.test(_val)) {
            switch (item.type) {
            case 'date':
                options[item.name] = new Date(_val);
                break;
            case 'radio':
                if (item.checked) {
                    options[item.name] = _val;
                };
                break;
            case 'checkbox':
                if (item.checked) {
                    if (options[item.name]) {
                        options[item.name].push(_val);
                    } else {
                        options[item.name] = [_val];
                    }
                }
                break;
            default:
                options[item.name] = _val;
            }
        }
    });

    return options;
}


/*
 * text 提示文本
 * type 提示类型， 普通类型和loading类型
 * autoHide 是否自动隐藏 0表示自动 1表示手动
 */
export let msg = (text, type, autoHide) => {

    if(text == 'close') {
        $('.cy-msg').remove();
        return;
    }

    let msgHTML = '';
    if (type == 'loading') {
        msgHTML = `<div class="cy-msg loading"><i class="cy-icons loading-icon"></i>${text}</div>`;
    } else {
        msgHTML = `<div class="cy-msg">${text}</div>`;
    }
    let msgElement = $(msgHTML);

    if($('body').find('.cy-msg').length > 0) {
        $('body').find('.cy-msg').remove();
    }

    $('body').append(msgElement);

    if (autoHide != 1) {
        setTimeout(() => {
            msgElement.remove();
        }, 2000);
    }

}


// Ajax请求
export let _ajax = (options) => {
    $.ajax({
        url: config.serverApi + options.url,
        data: options.data,
        type: options.type || 'POST',
        dataType: 'json',
        success: (data) => {
            if (typeof data == 'string' && isFunction(options.success)) {
                data = JSON.parse(data);
                if (data.success) {
                    options.success.call(this, data);
                } else {
                    if(data.msg) {
                        msg(data.msg);
                    }
                }
            }
        },
        error: (data) => {
            msg('连接不上服务器');
            if (typeof data == 'string' && isFunction(options.error)) {
                options.error.call(this, JSON.parse(data));
            }
        }
    });
}

//  loading
export let loading = {
    // el 容器 fn 点击之后的回调 loadType 加载的类型（加载中，加载失败）text 提示文字
    add: (el, loadType, text, fn) => {
        let promptText = text || `正在加载中...`;
        let prompt = $(`<div class="cy-loading"><i class="cy-icons loadingcar-icon"></i><span>${promptText}</span></div>`);

        if (isFunction(fn)) {
            prompt.on('tap', () => {
                fn.call(prompt);
            })
        }
        if (loadType == 'error') {
            prompt.addClass('cy-loading-error');
        }
        el.html(prompt);
    },
    remove: (el) => {
        let prompt = el.find('.cy-loading');
        if (!prompt) {
            return;
        }
        prompt.off('tap');
        prompt.remove();
    }
}


/*
 * el 倒计时容器
 * str 倒计时格式  还剩{time}秒
 * max 时间长度
 * fnEnd 倒计时结束的回调
 */
export let countDown = function (options) {
    let _options = $.extend({
        el: null,
        str: '还剩下{time}秒',
        max: 60,
        fnEnd: () => {}
    }, options);
    const step = 1000; // 递减的时间
    let time = _options.max;
    let _text = _options.el.text(); // 元素原本的内容

    if (!_options.el) {
        throw new Error('请设置你要用来存放倒计时内容的容器。');
    }

    if (_options.el.attr('data-countdown') == 1) {
        return;
    }

    _options.el.data('countdown', 1);

    let loop = () => {
        if (time == 0) {
            _options.el.removeAttr('data-countdown').text(_text);
            _options.fnEnd.call(_options.el);
            return;
        }
        time--;
        _options.el.text(_options.str.replace('{time}', time));
        setTimeout(loop, step)
    }

    loop();
}


/*
 * 秒杀倒计时
 * el 倒计时容器
 * startTime 开始日期
 * endTime 结束日期
 * countdownEnd 倒计时结束回调
 * template 日期显示模板
 */
export let countDownDate = (options) => {
    let _options = $.extend({
        el: null,
        startTime: +new Date(),
        endTime: +new Date(),
        countdownEnd: () => {},
        template: 'DD天 hh时 mm分 ss秒'
    }, options);

    if (!_options.el) {
        throw new Error('请设置用来储存倒计时的容器。');
    }

    if (_options.el.dataset.countdowndate == 1) {
        return;
    }
    _options.el.dataset.countdowndate = 1;

    let formatDiffTime = (time) => {
        let _d = {
                'D{2}': Math.floor(time / 86400000),
                'h{2}': Math.floor(time % 86400000 / 3600000),
                'm{2}': Math.floor(time % 3600000 / 60000),
                's{2}': Math.floor(time % 60000 / 1000)
            },
            reg = null,
            dateTemp = _options.template;

        for (let attr in _d) {
            _d[attr] = _d[attr] < 0 ? 0 : _d[attr];
            _d[attr] = _d[attr] < 10 ? '0' + _d[attr] : _d[attr];
            reg = new RegExp(attr, 'g');
            dateTemp = dateTemp.replace(reg, _d[attr]);
        }

        return dateTemp;
    }

    let diffTime = _options.endTime - _options.startTime;

    let loop = (time) => {
        if (time <= 0) {
            _options.el.innerHTML = '已过期';
            _options.countdownEnd.call(_options.el, _options.endTime);
            return;
        }
        time -= 1000;
        _options.el.innerHTML = formatDiffTime(time);
        setTimeout(() => loop(time), 1000);
    }

    if(_options.template.indexOf('mm') == -1) {
        _options.el.innerHTML = formatDiffTime(diffTime);
        return;
    }

    loop(diffTime);
}
