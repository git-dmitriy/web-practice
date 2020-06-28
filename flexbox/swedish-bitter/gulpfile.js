const {
  src,
  dest,
  task,
  series,
  watch
} = require('gulp');
const rm = require('gulp-rm');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
sass.compile = require('node-sass');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sassGlob = require('gulp-sass-glob');



const files = {
  stylesSrc: 'src/styles/main.scss',
  htmlSrc: 'src/html'
};

const styles = [
  'node_modules/normalize.css/normalize.css',
  'src/styles/main.scss'
];

task('styles', () => {
  return src(styles)
    .pipe(concat('main.scss'))
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./dist'));
});

task('server', () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    },
    open: false
  });
});

task('clean', () => {
  return src('dist/**/*', {
    read: false
  }).pipe(rm());
});

task('copy:html', () => {
  return src('src/*.html')
    .pipe(dest('dist'))
    .pipe(reload({
      stream: true
    }));
});

watch('./src/styles/**/*.scss', series('styles'));
watch('./src/*.html', series('copy:html'));

task('default', series('clean', 'copy:html', 'styles', 'server'));


// Массив строк
// const files = [
//   'src/styles/one.scss',
//   'src/styles/two.scss'
// ]

// ! - восклицательный знак указывает на файл исключение
// const files = [
//   'src/styles/*.scss',
//   '!src/styles/two.scss'
// ]