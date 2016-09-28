import {msg} from './util';

// 表单验证
let validation = (el) => {
    if(!el) {
        throw new Error('该元素不存在，亲，你逗我吗？');
    }
    let oInput = el.find('[name]');
    let _val = null;
    let item = null;
    let i = 0;
    let len = oInput.length;

    // 验证
    let doTest = (ele, _val) => {
        let regs = [
            _val.length < 1,
            ele.max && _val > ele.max,
            ele.min && _val < ele.min,
            ele.maxlength && _val.length > ele.maxlength,
            ele.minlength && _val.length < ele.minlength,
            ele.pattern && !(new RegExp(ele.pattern, 'g')).test(_val)
        ];

        for(let j = 0; j < regs.length; j++) {
          if(regs[j]) {
            let msgText = ele.dataset.error ? ele.dataset.error : `${ele.placeholder}填写错误`;
            msg(msgText);
            return false;
          }
        }

        return true;
    }

    for(i = 0; i < len; i++) {
        item = oInput[i];
        _val = item.value;

        // 必填或者已经输入才会验证
        if(item.required || _val.trim.length > 0) {
            if(!doTest(item, _val)) {
                return false;
            }
        }
    }

    return true;
}

export default validation;
