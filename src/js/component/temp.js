// 页面渲染
class Temp {
    constructor(options) {
        let that = this;
        this.options = $.extend({
            id: null, // 模板id
            container: null, // 可选，真实的html的容器, 默认就是id的值
            data: {} // 模板数据
        }, options);

        if(!this.options.container) {
            this.options.container = this.options.id;
        }

        this.element = null; // 当前元素
        this.refIds = {}; // ref id集
        this.refs = {}; // 通过ref绑定的元素集
        this.tempElement = document.querySelector(this.options.id);
        this.tempHTML = this.tempElement.innerHTML;
        this.contentElement = document.querySelector(`[data-temp="${this.options.container.substring(1)}"]`);
        this.tempElement.parentNode.removeChild(this.tempElement);
        this.data = this.options.data;

        if(typeof this.getInitialState == 'function') {
            this.getInitialState();
        }

        this.render();
    }

    // 模板渲染
    render() {
        if(!this.data || this.data == null || Object.keys(this.data).length < 1)  {
            // 没有数据则不渲染
            return;
        }

        this.docfrag = document.createDocumentFragment();
        this.element = document.createElement('div');
        this.element.innerHTML = this.view(this.tempHTML, this.data);

        for(let i = 0, len = this.element.childNodes.length; i < len; i++) {
            this.docfrag.appendChild(this.element.childNodes[i].cloneNode(true));
        }

        // 页面渲染之前
        this.bindRef();
        if (typeof this.componentWillMount == 'function') {
            this.componentWillMount();
        }
        this.contentElement.innerHTML = '';
        this.contentElement.appendChild(this.docfrag);

        if (typeof this.componentDidMount == 'function') {
            this.componentDidMount();
        }
    }

    /* 字符串替换
     * str 需要替换的字符串
     * data 用来替换的数据
     * index 当前元素在列表中的索引值
     */

    toReplace(str, data, index) {
        const strReg = /(\$\{v-for:([^\{]+)\}\s*>([^\$]*[^\{]*[^v]*[^-]*[^f]*)<(\$\{end\}))|(\$\{([^\{]+)\})/g;
        let that = this;

        return str.replace(strReg, (...tokens) => {
            let variables;

            if (tokens[6] === undefined) {
                // 进入for循环
                const [a, symbol, o] = tokens[2].split(' ');
                const obj = that.eachAttr(o.split('.'), data);
                let childStr = '';
                let childData = {};

                if (Array.isArray(obj)) {
                    //  如果是数组，则遍历数组
                    obj.map((item, index) => {
                        childData[a] = item;
                        childStr += that.view(tokens[3], childData, index);
                    });
                }
                return `>${childStr}<`;
            } else {
                // 进入正常模式
                variables = tokens[6].replace(/\s/g, '').split('.');
            }

            // 是否语句
            if (/^v-.+/ig.test(tokens[6])) {

                const [attr, val] = tokens[6].split(':');
                switch (attr) {
                    case 'v-index':
                        // 返回索引值
                        if(val) {
                            return index * 1 + val;
                        }else {
                            return index;
                        }
                        break;
                    case 'v-show':
                        // 是否隐藏，需要默认显示
                        return that.eachAttr(val.split('.'), data) ? '' : 'style="display:none !important;"';
                        break;
                    case 'v-on':
                        // 事件绑定
                        const [eventName, eventFn] = val.split('=');
                        const _event = that[eventFn.replace(/"|\s/g, '')];

                        if (typeof _event === 'function') {
                            const _datasetId = Math.random();

                            document.addEventListener(eventName, function(event) {
                                if (event.target.dataset.vId == _datasetId) {
                                    _event.call(that, event.target, event);
                                }
                            }, false);

                            return `data-v-id="${_datasetId}"`;
                        }
                        break;
                    case 'v-ref':
                        // 绑定元素refId
                        const _refId = Math.random();
                        that.refIds[val] = _refId;
                        return `data-ref-id="${_refId}"`;
                        break;
                }
            }

            return that.eachAttr(variables, data);
        });

    }

    // 绑定refId
    bindRef() {
        // 在循环中使用，只会取最后一个
        for (let attr in this.refIds) {
            const val = `[data-ref-id="${this.refIds[attr]}"]`;
            this.refs[attr] = this.docfrag.querySelector(val);
            this.refs[attr].removeAttribute('data-ref-id');
        }
    }

    // 遍历对象的属性
    eachAttr(attrs, data) {
        let i = 0,
            len = attrs.length,
            obj = data,
            attr = null;

        for (; i < len; ++i) {
            attr = /(.+)\[(\d)\]$/.exec(attrs[i]);
            if(attr && obj.hasOwnProperty(attr[1])) {
                obj = obj[attr[1]][attr[2]];
            }else {
                obj = obj[attrs[i]];
            }
            if (obj === undefined || obj === null) {
                return '';
            }
        }
        return obj;
    }

    // 模板替换
    view(str, data, ...indexs) {
        if (typeof str != 'string') {
            throw new Error('第一个参数必须是字符串');
        }

        let index = indexs[0] ? indexs[0] : 0;
        let obj = (arguments.length < 2 || arguments[1] == null) ? {} : data;

        let code = '';
        const that = this;

        if (Array.isArray(obj)) {
            data.map(function(item, index) {
                code += that.toReplace(str, item, index);
            });
        } else {
            code += that.toReplace(str, obj, index);
        }

        return code;
    }
}


export default Temp;
