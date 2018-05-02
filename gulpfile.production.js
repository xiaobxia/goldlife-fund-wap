const gulp = require('gulp');
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const pxtorem = require('postcss-pxtorem');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const del = require('del');

const config = require('./config');
const path = config.path;

gulp.task('clean', function () {
  return del(path.dist);
});

gulp.task('lib', function () {
  return gulp.src(path.lib)
    .pipe(rev())
    .pipe(gulp.dest(path.dist + '/static/lib'))
    .pipe(rev.manifest()) //json
    .pipe(gulp.dest('rev/lib'));
});

gulp.task('asset', function () {
  return gulp.src(path.asset)
    .pipe(rev())
    .pipe(gulp.dest(path.dist + '/static/asset'))
    .pipe(rev.manifest()) //json
    .pipe(gulp.dest('rev/asset'));
});


gulp.task('pug', function () {
  return gulp.src(path.pug)
    .pipe(gulp.dest(path.dist+'/pug'));
  // return gulp.src(path.mock)
  //   .pipe(freemarker({
  //     viewRoot: path.pug,
  //     options: {
  //     }
  //   }))
  //   .pipe(gulp.dest(path.dist));
});

gulp.task('fonts', function () {
  return gulp.src(path.fonts)
    .pipe(gulp.dest(path.dist + '/static/fonts'));
});

gulp.task('scss', function () {
  return gulp.src(path.scss)
    .pipe(sass())
    .pipe(postcss([pxtorem(config.pxtorem), autoprefixer(config.autoprefixer)]))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rev())
    .pipe(gulp.dest(path.dist + '/static/css'))
    .pipe(rev.manifest())
    //json
    .pipe(gulp.dest('rev/css'));
});

gulp.task('js', function () {
  return gulp.src(path.js)
    .pipe(babel())
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(path.dist + '/static/js'))
    .pipe(rev.manifest())
    //json
    .pipe(gulp.dest('rev/js'));
});

gulp.task('rev', function () {
  //json文件和接收注入的pug文件
  return gulp.src(['rev/**/*.json', path.dist + '/pug/**'])
    .pipe(revCollector({
      replaceReved: true,
      dirReplacements: {
        //替换
        '/css/': '/css/',
        '/js/': '/js/',
        '/lib/': '/lib/',
        '/asset/': '/asset/'
      }
    }))
    .pipe(gulp.dest(path.dist+ '/pug'));
});

gulp.task('revCss', function () {
  return gulp.src(['rev/**/*.json', path.dist + '/static/css/*.css'])
    .pipe(revCollector({
      replaceReved: true,
      dirReplacements: {
        '/asset/': '/asset/'
      }
    }))
    .pipe(gulp.dest(path.dist + '/static/css'));
});

gulp.task('revJs', function () {
  return gulp.src(['rev/**/*.json', path.dist + '/static/js/*.js'])
    .pipe(revCollector({
      replaceReved: true,
      dirReplacements: {
        '/asset/': '/asset/'
      }
    }))
    .pipe(gulp.dest(path.dist + '/static/js'));
});


gulp.task('build', gulp.parallel('lib', 'asset', 'pug', 'scss', 'js'));

gulp.task('default', gulp.series('clean', 'build', 'rev', 'revCss', 'revJs', 'fonts'));
