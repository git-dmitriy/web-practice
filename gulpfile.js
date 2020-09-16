const { src, dest, task, series, watch } = require("gulp");
const rm = require("gulp-rm");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
sass.compile = require("node-sass");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const sassGlob = require("gulp-sass-glob");

const files = {
  stylesSrc: "src/styles/main.scss",
  htmlSrc: "src/html",
  normalize: "node_modules/normalize.css/normalize.css",
};

const swedishBitter = {
  src: "flexbox/swedish-bitter/src",
  dist: "flexbox/swedish-bitter/dist",
  distClean: "flexbox/swedish-bitter/dist/**/*",
  styleSrc: "flexbox/swedish-bitter/src/style/style.scss",
  styleWatch: "flexbox/swedish-bitter/src/style/**/*.*",
  styleDist: "flexbox/swedish-bitter/dist/css",
  html: "flexbox/swedish-bitter/src/*.html",
  img: "flexbox/swedish-bitter/src/img/*.*",
  imgDist: "flexbox/swedish-bitter/dist/img",
  fonts: "flexbox/swedish-bitter/src/fonts/**/*",
  fontsDist: "flexbox/swedish-bitter/dist/fonts",
};

task("styles", () => {
  return src([files.normalize, swedishBitter.styleSrc], {
    allowEmpty: true,
  })
    .pipe(concat("main.scss"))
    .pipe(sassGlob())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      reload({
        stream: true,
      })
    )
    .pipe(dest(swedishBitter.styleDist));
});

task("server", () => {
  browserSync.init({
    server: {
      baseDir: swedishBitter.dist,
      serveStaticOptions: {
        extensions: ["html"],
      },
    },
    open: false,
  });
});

task("clean", () => {
  return src(swedishBitter.distClean, {
    read: false,
    allowEmpty: true,
  }).pipe(rm());
});

task("copy:html", () => {
  return src(swedishBitter.html)
    .pipe(dest(swedishBitter.dist))
    .pipe(
      reload({
        stream: true,
      })
    );
});

task("copy:fonts", () => {
  return src(swedishBitter.fonts).pipe(dest(swedishBitter.fontsDist));
});

task("copy:img", () => {
  return src(swedishBitter.img)
    .pipe(dest(swedishBitter.imgDist))
    .pipe(
      reload({
        stream: true,
      })
    );
});

watch(swedishBitter.styleWatch, series("styles"));
watch(swedishBitter.html, series("copy:html"));
watch(swedishBitter.img, series("copy:img"));

task(
  "default",
  series("clean", "copy:html", "copy:img", "copy:fonts", "styles", "server")
);
