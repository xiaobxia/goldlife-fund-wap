const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require("gulp-babel");
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const del = require('del');
const url = require('url');
const opn = require('opn')
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const chalk = require('chalk');
const fs = require('fs-extra');


const config = require('./config');
const path = config.path;


gulp.task('clean', function () {
  return del(path.dist);
});

gulp.task('lib', function () {
  return gulp.src(path.lib)
    .pipe(gulp.dest(path.dist + '/static/lib'));
});

gulp.task('fonts', function () {
  return gulp.src(path.fonts)
    .pipe(gulp.dest(path.dist + '/static/fonts'));
});

gulp.task('asset', function () {
  return gulp.src(path.asset)
    .pipe(gulp.dest(path.dist + '/static/asset'));
});

gulp.task('pug', function () {
  return gulp.src(path.pug)
    .pipe(gulp.dest(path.dist+'/pug'));
});

gulp.task('scss', function () {
  return gulp.src(path.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([pxtorem(config.pxtorem), autoprefixer(config.autoprefixer)]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.dist + '/static/css'));
});

gulp.task('js', function () {
  return gulp.src(path.js)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.dist + '/static/js'));
});

gulp.task('build', gulp.parallel('lib', 'fonts', 'asset', 'pug', 'scss', 'js'));

gulp.task('open', function () {
  return opn(`http://localhost:${config.dev.server.port}`);
});

gulp.task('watch', function () {
  gulp.watch(path.assetWatch, gulp.series('asset'));
  gulp.watch(path.libWatch, gulp.series('lib'));
  gulp.watch(path.fontsWatch, gulp.series('fonts'));
  gulp.watch(path.pugWatch, gulp.series('pug'));
  gulp.watch(path.scssWatch, gulp.series('scss'));
  gulp.watch(path.jsWatch, gulp.series('js'));
});

gulp.task('default', gulp.series('clean', 'build', 'open', 'watch'));

