/*
 * 底部上拉菜单
 */

 class Actionsheet {
     constructor(el, options) {
         this.element = $(el); // 容器
         this.options = $.extend({
             closEd: () => {} // 关闭之后
         }, options);
         this.closeBtn = this.element.find('.cy-actionsheet-close');
         this.mask = $('body').find('.cy-mask').eq(0);
         this.events();
     }

     // 关闭
     close() {
         this.mask.hide();
         this.element.removeClass('transition');
     }

     // 打开
     open() {
         this.mask.show();
         this.element.addClass('transition');
     }

     events() {
         this.closeBtn.on('tap', () => {
             this.close();
             this.options.closEd.call(this);
         });
     }
 }

export default Actionsheet;
