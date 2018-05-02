const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require("gulp-uglify");

gulp.task('util', function () {
  return gulp.src([
    './src/dll/cookie.js',
    './src/dll/zepto.js',
    './src/dll/util.js'
  ])
    .pipe(concat('util.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./src/lib'));
});

gulp.task('muiPull', function () {
  return gulp.src([
    './src/dll/mui.pullToRefresh.js',
    './src/dll/mui.pullToRefresh.material.js'
  ])
    .pipe(concat('muiPull.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./src/lib'));
});

gulp.task('mui', function () {
  return gulp.src( './src/dll/mui.js')
    .pipe(uglify())
    .pipe(gulp.dest('./src/lib'));
});

gulp.task('muiPick', function () {
  return gulp.src( './src/dll/mui.picker.all.js')
    .pipe(uglify())
    .pipe(gulp.dest('./src/lib'));
});

gulp.task('select', function () {
  return gulp.src(['./src/dll/addressCode.js', './src/dll/professionCode.js',])
    .pipe(uglify())
    .pipe(gulp.dest('./src/lib'));
});

gulp.task('default', gulp.series('util', 'mui', 'muiPull', 'muiPick', 'select'));
