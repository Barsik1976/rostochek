"use strict";

var gulp = require("gulp");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var server = require("browser-sync").create();

gulp.task("sass", function(){
return gulp.src("source/sass/**/*.scss")
.pipe(sass())
.pipe(gulp.dest("source/css"))
.pipe(server.reload({stream: true}))
});

gulp.task("server", function () {
  server.init({
    server: "source",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.scss", gulp.series("css"));
  gulp.watch("source/*.html").on("change", server.reload);
});

gulp.task("copy", function () {
return gulp.src([
"source/fonts/**/*.{woff,woff2}",
"source/img/**",
"source/js/**",
"source/*.ico"
], {
base: "source"
})
.pipe(gulp.dest("source"));
});

gulp.task("clean", function () {
return del("build");
});

gulp.task("css", function () {
return gulp.src("source/sass/style.scss")
.pipe(plumber())
.pipe(sourcemap.init())
.pipe(sass())
.pipe(postcss([
autoprefixer()
]))
.pipe(csso())
.pipe(rename("style.min.css"))
.pipe(sourcemap.write("."))
.pipe(gulp.dest("source/css"))
.pipe(server.stream());
});

gulp.task("symbols", function () {
return gulp.src("source/img/*.svg")
.pipe(svgstore({
inlineSvg: true
}))
.pipe(rename("symbols.svg"))
.pipe(gulp.dest("source/img"));
});

gulp.task("html", function () {
return gulp.src("source/*.html")
.pipe(posthtml([
include()
]))
.pipe(gulp.dest("build"));
});

gulp.task("build", gulp.series(
"clean",
"copy",
"css",
"symbols",
"html"
));

gulp.task("server", function () {
server.init({
server: "source/"
});

gulp.task("refresh", function (done) {
server.reload();
done();
});

  gulp.watch("source/sass/**/*.scss", gulp.series("css"));
  gulp.watch("source/img/icon-*.svg", gulp.series("symbols", "html", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
});

gulp.task("start", gulp.series("css", "server"));
