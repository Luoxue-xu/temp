/*
 * modal模块 模态窗
 * 可以在html手动创建mask和modal元素，结构必须保持一致
 * 若在html没有对应的元素，则自动创建
 * el 模态窗对象
 * text 提示信息，可以是文本，代码，图片等
 * confirmButtonText 确认按钮的文字
 * cancelButtonText 取消按钮的文字
 * onConfirmHide 点击确认按钮是否关闭窗口，默认可以
 * onMaskHide 点击遮罩是否关闭窗口，默认不可以
 * btns 按钮元素，暂时最多包括确认和取消两个
 * 可以在创建的实例上监听onConfirm, onCancel两个事件
 */

 class Modal {

     constructor(options) {
         this.options = $.extend({
             el: null,
             text: '提示信息',
             confirmButtonText: '确认',
             cancelButtonText: '取消',
             onConfirmHide: true,
             onMaskHide: false,
             btns: ['cancel', 'confirm']
         }, options);
         this.element = this.options.el;
         this.confirm = null;
         this.cancel = null;
         this.mask = null;
         this.temp = `<div class="cy-modal"><div class="cy-modal-content"><span>${this.options.text}</span></div><div class="cy-modal-footer cy-border-top cy-border-h"></div></div>`;
         this.createEl();
     }

     // 创建模态窗
     createEl() {
         if(!this.element) {
             let btnGroup = $('<div class="cy-modal-footer cy-border-top cy-border-h"></div>');
             this.element = $(this.temp);
             this.options.btns.map((item) => {
                this[item] = $(`<button class="cy-modal-${item}">${this.options[item + `ButtonText`]}</button>`);
                btnGroup.append(this[item]);
             });
             this.element.append(btnGroup);
             $('body').append(this.element);
         }else {
             this.options.btns.map((item) => {
                this[item] = this.element.find(`.cy-modal-${item}`);
             });
         }
         if($('.cy-mask').length < 1) {
             this.mask = $(`<div class="cy-mask"></div>`);
             $('body').append(this.mask);
         }else {
             this.mask = $('.cy-mask');
         }
         this.events();
     }

     // 打开
     open() {
         this.mask.show();
         this.element.show();
     }

     // 关闭
     close() {
         this.mask.hide();
         this.element.hide();
     }

     // 确认
     onConfirm() {
         if(this.options.onConfirmHide) {
             this.close();
         }
         if(typeof this.onConfirmCallback == 'function') {
             this.onConfirmCallback();
         }
     }

     // 取消
     onCancel() {
         this.close();
         if(typeof this.onCancelCallback == 'function') {
             this.onCancelCallback();
         }
     }

     // 绑定事件
     on(eventType, callback) {
         if(typeof this[eventType] == 'function') {
             this[`${eventType}Callback`] = callback;
         }
     }

     events() {
         // 给按钮绑定事件
         this.options.btns.map((item) => {
             this[item].on('tap', () => {
                 // 根据按钮的名称处理对应的事件
                 this[`on${item.charAt(0).toLocaleUpperCase()}${item.substring(1)}`]();
             });
         });

         // 点击遮罩关闭
         this.mask.on('tap', () => {
            this.close();
         });
     }

 }

export default Modal;
