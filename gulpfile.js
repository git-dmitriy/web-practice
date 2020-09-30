const { src, dest, task, series, watch, parallel } = require("gulp");
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
const uglify = require("gulp-uglify");
const svgo = require("gulp-svgo");
const svgSprite = require("gulp-svg-sprite");
const gulpif = require("gulp-if");

const env = process.env.NODE_ENV;

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
    icons: `flexbox/${projectName}/dist/img/icons`,
    fonts: `flexbox/${projectName}/dist/fonts`,
  },
  src: {
    html: `flexbox/${projectName}/src/**/*.html`,
    js: `flexbox/${projectName}/src/js/*.js`,
    css: `flexbox/${projectName}/src/style/style.scss`,
    images: `flexbox/${projectName}/src/img/*.*`,
    icons: `flexbox/${projectName}/src/img/icons/*.svg`,
    fonts: `flexbox/${projectName}/src/fonts/**/*`,
  },
  watch: {
    html: `flexbox/${projectName}/src/**/*.html`,
    js: `flexbox/${projectName}/src/js/**/*.js`,
    css: `flexbox/${projectName}/src/style/**/*.scss`,
    images: `flexbox/${projectName}/src/img/*.*{jpg,png,svg,ico}`,
    icons: `flexbox/${projectName}/src/img/icons/*.svg`,
  },
  dist: `flexbox/${projectName}/dist`,
};

task("styles", () => {
  return src([externalFiles.normalize, path.src.css], {
    allowEmpty: true,
  })
    .pipe(gulpif(env === "dev", sourcemaps.init()))
    .pipe(concat("main.scss"))
    .pipe(sassGlob())
    .pipe(sass().on("error", sass.logError))
    .pipe(gulpif(env === "prod", postcss([autoprefixer()])))
    .pipe(gulpif(env === "prod", gcmq()))
    .pipe(gulpif(env === "prod", cleanCSS()))
    .pipe(gulpif(env === "dev", sourcemaps.write()))
    .pipe(dest(path.build.css))
    .pipe(
      reload({
        stream: true,
      })
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
    .pipe(gulpif(env === "dev", sourcemaps.init()))
    .pipe(concat("main.js", { newLine: ";" }))
    .pipe(
      gulpif(
        env === "prod",
        babel({
          presets: ["@babel/env"],
        })
      )
    )
    .pipe(gulpif(env === "prod", uglify()))
    .pipe(gulpif(env === "dev", sourcemaps.write()))
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

task("icons", () => {
  return src(path.src.icons)
    .pipe(
      svgo({
        plugins: [
          {
            removeAttrs: { attrs: "(fill|stroke|style|width|height|data.*)" },
          },
        ],
      })
    )
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(dest(path.build.icons));
});

task("watch", () => {
  watch(path.watch.html, series("copy:html"));
  watch(path.watch.css, series("styles"));
  watch(path.watch.js, series("scripts"));
  watch(path.watch.images, series("copy:img", "icons"));
  watch(path.watch.icons, series("icons"));
});

task(
  "default",
  series(
    "clean",
    parallel(
      "copy:html",
      "copy:img",
      "icons",
      "copy:fonts",
      "styles",
      "scripts"
    ),
    parallel("watch", "server")
  )
);

task(
  "build",
  series(
    "clean",
    parallel(
      "copy:html",
      "copy:img",
      "icons",
      "copy:fonts",
      "styles",
      "scripts"
    )
  )
);
