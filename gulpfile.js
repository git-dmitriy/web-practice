const { src, dest, task, series, watch } = require("gulp");
const rm = require("gulp-rm");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
sass.compile = require("node-sass");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const sassGlob = require("gulp-sass-glob");

const externalFiles = {
  normalize: "node_modules/normalize.css/normalize.css",
};

/*
  * Projects list:
    denim
    swedish-bitter


*/

const projectName = "denim";

const project = {
  src: `flexbox/${projectName}/src`,
  dist: `flexbox/${projectName}/dist`,
  distClean: `flexbox/${projectName}/dist/**/*`,
  styleSrc: `flexbox/${projectName}/src/style/style.scss`,
  styleWatch: `flexbox/${projectName}/src/style/**/*.*`,
  styleDist: `flexbox/${projectName}/dist/css`,
  html: `flexbox/${projectName}/src/*.html`,
  img: `flexbox/${projectName}/src/img/*.*`,
  imgDist: `flexbox/${projectName}/dist/img`,
  fonts: `flexbox/${projectName}/src/fonts/**/*`,
  fontsDist: `flexbox/${projectName}/dist/fonts`,
};

task("styles", () => {
  return src([externalFiles.normalize, project.styleSrc], {
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
    .pipe(dest(project.styleDist));
});

task("server", () => {
  browserSync.init({
    server: {
      baseDir: project.dist,
      serveStaticOptions: {
        extensions: ["html"],
      },
    },
    open: false,
  });
});

task("clean", () => {
  return src(project.distClean, {
    read: false,
    allowEmpty: true,
  }).pipe(rm());
});

task("copy:html", () => {
  return src(project.html)
    .pipe(dest(project.dist))
    .pipe(
      reload({
        stream: true,
      })
    );
});

task("copy:fonts", () => {
  return src(project.fonts).pipe(dest(project.fontsDist));
});

task("copy:img", () => {
  return src(project.img)
    .pipe(dest(project.imgDist))
    .pipe(
      reload({
        stream: true,
      })
    );
});

watch(project.styleWatch, series("styles"));
watch(project.html, series("copy:html"));
watch(project.img, series("copy:img"));

task(
  "default",
  series("clean", "copy:html", "copy:img", "copy:fonts", "styles", "server")
);
