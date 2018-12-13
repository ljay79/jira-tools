var gulp = require('gulp');
var replace = require('gulp-replace');
var del = require('del');
var execSh = require('exec-sh');
var rename = require('gulp-rename');
var diff = require('gulp-diff');



gulp.task('clean', function(done) {
    del(['build/**/*', 'build/**/.*', '!build']).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
        done();
    });
});

gulp.task('clasp-pull', function (done) {
    var stream = gulp
    .src(["src/.clasp.json"])
    .pipe(gulp.dest("dist/pull"));

    stream.on('end',function () {
        process.chdir('dist/pull');
        execSh('clasp pull', function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            process.chdir('../../');
            done(err);
        });
    });
})

gulp.task('un-google', function (done) {
    var stream = gulp
    .src(["dist/pull/**/*.js"])
    .pipe(rename(function (path) {
        path.extname = ".gs";
      }))
    .pipe(replace("//module.exports","module.exports"))
    .pipe(replace(/\/\* Require imports/, "// Require imports"))
    .pipe(replace(/\/\/*.?End of Require imports\*\//, "// End of Require imports"))
    .pipe(gulp.dest("dist/pull"));

    stream.on('end',function () {
        del(["dist/pull/**/*.js"]);
        done();
    });
  })


gulp.task('build', function(done) {
    var stream = gulp
    .src(["src/**/*","src/**/.*"])
    .pipe(replace("module.exports","//module.exports"))
    .pipe(replace(/\/\/ Require imports/, "/* Require imports"))
    .pipe(replace(/\/\/*.?End of Require imports/, "// End of Require imports*/"))
    .pipe(gulp.dest("dist/build"));

    stream.on('end',function () {
        done();
    });
});

gulp.task('clasp-push', function (done) {
    process.chdir('dist/build');
    execSh('clasp push', function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      process.chdir('../');
      done(err);
    });
  });

gulp.task('diff-pulled-code', function (done) {
    return gulp
        .src(["src/**/*","src/**/.*"])
        .pipe(diff('dist/pull'))
        .pipe(diff.reporter({ fail: false }));
});
gulp.task('deploy',gulp.series('clean', 'build','clasp-push'));
gulp.task('pull-code',gulp.series('clean', 'clasp-pull','un-google','diff-pulled-code'));

 
