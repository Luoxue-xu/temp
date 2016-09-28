'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel'; // es6转es5
import jshint from 'gulp-jshint'; // js检查
import concat from 'gulp-concat'; // 合并文件
import uglify from 'gulp-uglify'; // js压缩
import rename from 'gulp-rename'; // 文件重命名
import css from 'gulp-minify-css'; // css压缩
import autoprefixer from 'gulp-autoprefixer'; // 添加前缀
import html from 'gulp-minify-html'; // html压缩
import clean from 'gulp-clean'; // 清除文件
import sequence from 'gulp-sequence'; // 异步
import replace from 'gulp-replace'; // 替换
import sass from 'gulp-sass'; // scss/sass转css
import gulpif from 'gulp-if'; // 判断
import useref from 'gulp-useref'; // html引入文件合并
import rev from 'gulp-rev-append'; // 自动给url添加版本号
import webserver from 'gulp-webserver'; // 本地服务
import livereload from 'gulp-livereload'; // 热更新
import webpack from 'gulp-webpack'; // 处理es6模块依赖
import named from 'vinyl-named'; // 自动给webpack添加入口文件
import plumber from 'gulp-plumber'; // 错误处理，防止每次错误都会kill掉任务
import url from 'url';
import fs from 'fs';
import path from 'path';

const config = {
    entry: 'src',
    output: 'dist',
    cssUrl: ['src/**/*.scss'],
    jsUrl: ['src/js/lib/*.js'],
    htmlUrl: ['src/*.html'],
    imgUrl: ['src/img/*.png', 'src/img/*.jpg'],
    fontUrl: ['src/fonts'],
    es6Url: ['src/js/*.js']
};
//
const build = {

    // 处理css文件
    css: (s, d) => gulp.src(s, {
            base: config.entry
        })
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0', 'iOS 7']
        }))
        .pipe(css())
        .pipe(rename((path) => path.basename += '.min'))
        .pipe(gulp.dest(d)),

    // 处理html文件
    html: (s, d) => gulp.src(s, {
            base: config.entry
        })
        .pipe(rev())
        .pipe(replace(/\.css/ig, (s) => '.min' + s))
        .pipe(html())
        .pipe(gulp.dest(d)),

    // 处理js文件
    js: (s, d) => gulp.src(s, {
            base: config.entry
        })
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        // .pipe(rename((path) => path.basename += '.min'))
        .pipe(gulp.dest(d)),

    es6: (s, d) => gulp.src(s, {
            base: config.entry
        })
        .pipe(plumber())
        .pipe(named())
        .pipe(webpack({
            output: {
                filename: '[name].js'
            },
            module: {
                loaders: [{
                    test: /\.js$/,
                    loader: 'babel-loader'
                }]
            }
        }))
        .pipe(uglify())
        // .pipe(rename((path) => path.basename += '.min'))
        .pipe(gulp.dest(d + '/js/')),

    // 清理文件
    clean: (s) => gulp.src(s)
        .pipe(clean()),

    // 处理图片文件
    img: (s, d) => gulp.src(s, {
            base: config.entry
        })
        .pipe(gulp.dest(d)),

    // 处理字体文件
    font: (s, d) => gulp.src(s, {
            base: config.entry
        })
        .pipe(gulp.dest(d)),

    // 配置服务器
    webserver: (s) => gulp.src(s)
        .pipe(webserver({
            port: 3000,
            host: '192.168.2.59',
            livereload: true,
            open: true,
            directoryListing: {
                enable: true,
                path: s
            },
            middleware: function (req, res, next) {
                let urlObj = url.parse(req.url, true),
                    method = req.method;

                if (!urlObj.pathname.match(/^\/base-api\//)) {
                    next();
                    return;
                }
                let mockDataFile = path.join(__dirname, urlObj.pathname) + ".js";

                fs.access(mockDataFile, fs.F_OK, function (err) {
                    if (err) {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({
                            "status": "没有找到此文件",
                            "notFound": mockDataFile
                        }));
                        return;
                    }
                    var data = fs.readFileSync(mockDataFile, 'utf-8');
                    res.setHeader('Content-Type', 'application/json');
                    res.end(data);
                });
                next();
            },
            proxies: []
        }))
};

// 帮助提醒
gulp.task('help', () => {
    console.log('gulp buildJs                 处理js文件');
    console.log('gulp buildCss                处理css文件');
    console.log('gulp buildHtml               处理html文件');
    console.log('gulp buildClean              清理文件（所有文件）');
    console.log('gulp buildImg                处理图片文件');
    console.log('gulp buildFont               处理字体文件');
    console.log('gulp                    生产环境的文件全部重新生成');
})

// 启动服务器
gulp.task('webserver', () => build.webserver(config.output));

// 处理js文件
gulp.task('buildJs', () => build.js(config.jsUrl, config.output));

// 处理es6文件
gulp.task('buildEs6', () => build.es6(config.es6Url, config.output));

// 处理css文件
gulp.task('buildCss', () => build.css(config.cssUrl, config.output));

// 处理html文件
gulp.task('buildHtml', () => build.html(config.htmlUrl, config.output));

// 清理文件
gulp.task('buildClean', () => build.clean(config.output));

// 处理图片文件
gulp.task('buildImg', () => build.img(config.imgUrl, config.output));

// 处理字体文件
gulp.task('buildFont', () => build.font(config.fontUrl, config.output));

// 默认执行
gulp.task('default', ['buildImg', 'buildFont', 'buildEs6', 'buildJs', 'buildCss', 'buildHtml', 'webserver', 'watch']);
// gulp.task('default', 'buildWebpack');

// 监听修改
gulp.task('watch', () => {
    gulp.watch(config.cssUrl, ['buildCss']);

    gulp.watch(config.htmlUrl, ['buildHtml']);

    gulp.watch(config.jsUrl, ['buildJs']);

    gulp.watch(config.es6Url, ['buildEs6']);

    gulp.watch(config.imgUrl, ['buildImg']);

});
