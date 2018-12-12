var gulp = require('gulp');
var replace = require('gulp-replace');
var del = require('del');
var execSh = require('exec-sh');

gulp.task('clasp-push', function (done) {
  process.chdir('build');
  execSh('clasp push', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    process.chdir('../');
    done(err);
  });
})

gulp.task('build', function(done) {
    gulp
    .src(["src/**/*","src/**/.*"])
    .pipe(replace("module.exports","//module.exports"))
    .pipe(gulp.dest("build"));
    done();
});


gulp.task('clean', function(done) {
    del(['build/**/*', 'build/**/.*', '!build']).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
        done();
    });
});

gulp.task('deploy',gulp.series('clean', 'build'));

 
