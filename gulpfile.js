const { src, dest, task, series, watch } = require("gulp");
const rm = require("gulp-rm");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
sass.compile = require("node-sass");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const sassGlob = require("gulp-sass-glob");
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
const gcmq = require("gulp-group-css-media-queries");
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");

const externalFiles = {
  normalize: "node_modules/normalize.css/normalize.css",
};

/*
  * Projects list:
    1. denim
    2. swedish-bitter
    3. conquest
*/

const projectName = "denim";

const path = {
  build: {
    html: `flexbox/${projectName}/dist/`,
    js: `flexbox/${projectName}/dist/js`,
    css: `flexbox/${projectName}/dist/css`,
    images: `flexbox/${projectName}/dist/img`,
    fonts: `flexbox/${projectName}/dist/fonts`,
  },
  src: {
    html: `flexbox/${projectName}/src/**/*.html`,
    js: `flexbox/${projectName}/src/js/*.js`,
    css: `flexbox/${projectName}/src/style/style.scss`,
    images: `flexbox/${projectName}/src/img/*.*`,
    fonts: `flexbox/${projectName}/src/fonts/**/*`,
  },
  watch: {
    html: `flexbox/${projectName}/src/**/*.html`,
    js: `flexbox/${projectName}/src/js/**/*.js`,
    css: `flexbox/${projectName}/src/style/**/*.scss`,
    images: `flexbox/${projectName}/src/img/*.*{jpg,png,svg,ico}`,
  },
  dist: `flexbox/${projectName}/dist`,
};

task("styles", () => {
  return (
    src([externalFiles.normalize, path.src.css], {
      allowEmpty: true,
    })
      .pipe(sourcemaps.init())
      .pipe(concat("main.scss"))
      .pipe(sassGlob())
      .pipe(sass().on("error", sass.logError))
      .pipe(postcss([autoprefixer()]))
      // .pipe(gcmq())
      .pipe(cleanCSS({}))
      .pipe(sourcemaps.write())
      .pipe(dest(path.build.css))
      .pipe(
        reload({
          stream: true,
        })
      )
  );
});

task("server", () => {
  browserSync.init({
    server: {
      baseDir: path.dist,
      serveStaticOptions: {
        extensions: ["html"],
      },
    },
    open: false,
  });
});

task("clean", () => {
  return src(path.dist, {
    read: false,
    allowEmpty: true,
  }).pipe(rm());
});

task("copy:html", () => {
  return src(path.src.html)
    .pipe(dest(path.dist))
    .pipe(
      reload({
        stream: true,
      })
    );
});

task("scripts", () => {
  return src(path.src.js)
    .pipe(sourcemaps.init())
    .pipe(concat("main.js", { newLine: ";" }))
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest(path.build.js))
    .pipe(
      reload({
        stream: true,
      })
    );
});

task("copy:fonts", () => {
  return src(path.src.fonts).pipe(dest(path.build.fonts));
});

task("copy:img", () => {
  return src(path.src.images)
    .pipe(dest(path.build.images))
    .pipe(
      reload({
        stream: true,
      })
    );
});

watch(path.watch.html, series("copy:html"));
watch(path.watch.css, series("styles"));
watch(path.watch.js, series("scripts"));
watch(path.watch.images, series("copy:img"));

task(
  "default",
  series(
    "clean",
    "copy:html",
    "copy:img",
    "copy:fonts",
    "styles",
    "scripts",
    "server"
  )
);
