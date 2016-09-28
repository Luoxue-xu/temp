let ajax = (options) => {
    let _ = Object.assign({
        url: null, // 接口地址
        data: null, // 提交数据
        type: 'get', // 请求类型
        dataType: 'json', // 数据类型
        success: () => false, // 成功
        error: () => false // 失败
    }, options);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                var data = JSON.parse(xhr.responseText);
                _.success.call(null, data);
            } else {
                _.error.call(null, xhr);
            }
        }
    }

    xhr.open(_.type, _.url, true);
    xhr.setRequestHeader('Content-Type', 'application/' + _.dataType + ';charset=utf-8');
    xhr.send(_.data);
};

export default ajax;
