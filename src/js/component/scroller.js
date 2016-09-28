/*
 * 上拉加载更多
 */

 class Scroller {

     constructor(el, options) {
         this.scrollEl = $(el);
         this.options = $.extend({
             content: $('.wrapper'), // 真实的上下文
             height: 50, // 距离多少之后刷新页面
             beforeRefresh: () => {}, // 加载数据之前
             onRefresh: () => {}, // 进入数据请求
             refreshEnd: () => {} // 刷新结束
         }, options);
         this.offsetY = 0; //加载框距离顶部的距离
         this.scrollY = 0; // 滚动的距离
         this.hasData = false; // 是否还有数据
         this.isRefresh = true; // 是否正在更新数据
         this.firstPull = true; // 是否第一次上拉
         this.containerH = this.scrollEl.height(); // 容器高度
         this.events();
     }

     // 初始化状态
     refresh() {
         this.hasData = true;
         this.isRefresh = false;
         this.firstPull = true;
     }

     // 数据获取完毕更新状态
     upDateStatus() {
         this.isRefresh = false;
         this.hasData = true;
     }

     // 停止上拉加载更多,
     stopPullUp() {
         this.hasData = false;
         this.isRefresh = false;
         this.firstPull = false;
         if(this.loadElement) {
             this.loadElement.remove();
         }
     }

     // 创建基础元素
     createLoadBox() {
         this.loadElement = $('<div class="cy-scroller-loading"><span><i class="cy-icons loading-icon"></i>加载中...</span></div>');
         this.options.content.append(this.loadElement);
     }

     // 上拉
     pullUp() {
         // 非刷新状态进入刷新
         this.isRefresh = true;
         this.options.onRefresh.call(this);
     }

     events() {
         this.scrollEl.on('scroll', () => {
             let _contentStyle = this.options.content.css('display');
             if(_contentStyle == 'none') {
                 return;
             }
             this.options.beforeRefresh.call(this);
             if(!this.hasData) {
                 if(this.loadElement) {
                     this.loadElement.remove();
                 }
                 this.options.refreshEnd.call(this);
                //  this.scrollEl.off('scroll');
                 return;
             }
             if(this.firstPull) {
                 // 第一次上拉，添加加载更多.
                 this.firstPull = false;
                 this.createLoadBox();
             }

             this.offsetY = this.loadElement.offset().top;
             this.scrollY = $(window).scrollTop();
             if(this.scrollY + this.containerH + this.options.height > this.offsetY) {
                 if(!this.isRefresh) {
                     this.pullUp();
                 }
             }
         });
     }

 }

export default Scroller;
