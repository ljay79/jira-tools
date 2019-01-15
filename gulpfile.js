var gulp = require('gulp');
var replace = require('gulp-replace');
var del = require('del');
var execSh = require('exec-sh');
var rename = require('gulp-rename');
var diff = require('gulp-diff');
var changed = require('gulp-changed');

/**
 * Cleans out the dist folders of previously built or pulled code
 */
gulp.task('clean', function(done) {
    del(['dist/build/**/*', 'dist/build/**/.*','dist/pull/**/*', 'dist/pull/**/.*']).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
        done();
    });
});


/**
 * Copys source code into the dist/build folder Comments out code which is
 * required for the code base to run locally in Node and would error in GAS
 */
gulp.task('build', function(done) {
    var stream = gulp
    .src(["src/**/*","src/**/.*"])
    //.pipe(replace("module.exports","//module.exports"))
    .pipe(replace(/\/\/ Node required code block/g, "/* Node required code block"))
    .pipe(replace(/\/\/*.?End of Node required code block/g, "// End of Node required code block*/"))
    .pipe(gulp.dest("dist/build"));

    stream.on('end',function () {
        done();
    });
});

/**
 * Uses Clasp to push the code in dist/build upto GAS
 * https://github.com/google/clasp
 */
gulp.task('clasp-push', function (done) {
    process.chdir('dist/build');
    execSh('clasp push', function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      process.chdir('/');
      done(err);
    });
  });

/**
 * Uses Clasp to pull down the code from GAS to the dist/pull folder
 * https://github.com/google/clasp
 */
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

/**
 * Undoes the clasp conversion of JS and GS file extensions Also uncomments code
 * which is required for the code base to run locally in Node
 */
gulp.task('un-google', function (done) {
    var stream = gulp
    .src(["dist/pull/**/*.js"])
    .pipe(rename(function (path) {
        path.extname = ".gs";
      }))
    //.pipe(replace("//module.exports","module.exports"))
    .pipe(replace(/\/\* Node required code block/g, "// Node required code block"))
    .pipe(replace(/\/\/*.?Node required code block\*\//g, "// Node required code block"))
    .pipe(gulp.dest("dist/pull"));

    stream.on('end',function () {
        del(["dist/pull/**/*.js"]);
        done();
    });
  })

/**
 * Diffs the code in dist/pull which has been downloaded from GAS with the
 * current source
 */
gulp.task('diff-pulled-code', function (done) {
    return gulp
        .src(["dist/pull/**/*","dist/pull/**/.*"])
        .pipe(diff('src'))
        .pipe(diff.reporter({ fail: false }));
});

/**
 * Copys the changed code in dist/pull which has been downloaded from GAS into
 * the src folder
 */
gulp.task('copy-changed-pulled-code', function (done) {
    return gulp
        .src(["dist/pull/**/*","dist/pull/**/.*"])
        .pipe(changed('src'))
        .pipe(gulp.dest('src'))
});

/**
 * Deploys code from source upto GAS
 */
gulp.task('deploy', gulp.series('clean', 'build', 'clasp-push'));

/**
 * Pulls GAS source code into dist/pull and compares it visually so it can be
 * copied over into src if required
 */
gulp.task('pull-code', gulp.series('clean', 'clasp-pull', 'un-google'));

 