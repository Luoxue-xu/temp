class Carousel {

    constructor(element, options) {
        this.wrap = (typeof element == 'string') ? $(element) : element;
        this.options = $.extend({
            autoPlay: true, // 是否自动滚动
            duration: 500, // 一个动画周期时长
            delay: 2000 // 动画间隔时间
        }, options);

        if (this.wrap.find('[data-carousel="icon"]')) {
            this.icons = this.wrap.find('[data-carousel="icon"]');
        }

        this.content = $('[data-carousel="content"]');
        this.scroller = $('[data-carousel="scroller"]');
        this.length = this.scroller.children().length;
        this.setStyle();

    }

    setStyle() {
        this.scroller.css({
            width: this.content.width() * this.length,
            height: this.content.height()
        });
    }

    // 动画
    animate() {

    }

    events() {

    }
}

export default Carousel;
