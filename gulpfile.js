(function () {
  "use strict";

  var bower = require("gulp-bower");
  var bump = require("gulp-bump");
  var colors = require("colors");
  var concat = require("gulp-concat");
  var del = require("del");
  var gulp = require("gulp");
  var jshint = require("gulp-jshint");
  var path = require("path");
  var rename = require("gulp-rename");
  var runSequence = require("run-sequence");
  var uglify = require("gulp-uglify");
  var wct = require("web-component-tester").gulp.init(gulp);

  gulp.task("clean", function (cb) {
    del(["./dist/**"], cb);
  });

  gulp.task("clean-bower", function(cb){
    del(["./components/**"], cb);
  });

  gulp.task("bump", function(){
    return gulp.src(["./package.json", "./bower.json"])
    .pipe(bump({type:"patch"}))
    .pipe(gulp.dest("./"));
  });

  gulp.task("lint", function() {
    return gulp.src("src/**/*.js")
      .pipe(jshint())
      .pipe(jshint.reporter("jshint-stylish"))
      .pipe(jshint.reporter("fail"));
  });

  gulp.task("unminified", function () {
    return gulp.src("src/js/*.js")
      .pipe(gulp.dest("dist"));
  });

  gulp.task("source", ["unminified"], function () {
    gulp.src("dist/*.js")
      .pipe(uglify())
      .pipe(rename(function (path) {
        path.basename += ".min";
      }))
      .pipe(gulp.dest("dist"));
  });

  // ***** Integration Testing ***** //
  gulp.task("test:integration", function(cb) {
    runSequence("test:local", cb);
  });

  // ***** Primary Tasks ***** //
  gulp.task("bower-clean-install", ["clean-bower"], function(cb){
    return bower().on("error", function(err) {
      console.log(err);
      cb();
    });
  });

  gulp.task("bower-update", function (cb) {
    return bower({ cmd: "update"}).on("error", function(err) {
      console.log(err);
      cb();
    });
  });

  gulp.task("build", function (cb) {
    runSequence(["clean", "bower-update"], ["lint", "source"], cb);
  });

  gulp.task("test", function(cb) {
    runSequence("test:integration", cb);
  });

  gulp.task("default", [], function() {
    console.log("********************************************************************".yellow);
    console.log("  gulp bower-clean-install: delete and re-install bower components".yellow);
    console.log("  gulp bower-update: update bower components".yellow);
    console.log("  gulp test: run integration tests".yellow);
    console.log("  gulp build: build a distribution version".yellow);
    console.log("********************************************************************".yellow);
    return true;
  });

})();
