/**
 * Created by xiaobxia on 2018/1/3.
 */
let gulp = require('gulp');
let spritesmith = require('gulp.spritesmith');

const versions = 'v1.x';

// 注意，不同期的不要放在同一个目录下
gulp.task('sprite-2', function () {
  let spriteData = gulp.src(`src/sprite/${versions}/*-2x.png`).pipe(spritesmith({
    imgName: `sprite-2x-${versions}.png`,
    cssName: `sprite-2x-${versions}.css`,
    padding: 10
  }));
  return spriteData.pipe(gulp.dest('./dest'));
});
gulp.task('sprite-3', function () {
  let spriteData = gulp.src(`src/sprite/${versions}/*-3x.png`).pipe(spritesmith({
    imgName: `sprite-3x-${versions}.png`,
    cssName: `sprite-3x-${versions}.css`,
    padding: 10
  }));
  return spriteData.pipe(gulp.dest('./dest'));
});

gulp.task('default', gulp.series('sprite-2', 'sprite-3'));
