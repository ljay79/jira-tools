var gulp = require('gulp');
var replace = require('gulp-replace');
var del = require('del');
var execSh = require('exec-sh');
var rename = require('gulp-rename');
var changed = require('gulp-changed');
var argv = require('yargs').argv;
var directoryExists = require('directory-exists');
var eslint = require('gulp-eslint');
/**
 * Cleans out the dist folders of previously built or pulled code
 */
gulp.task('clean', function (done) {
  del(['dist/build/**/*', 'dist/build/**/.*', 'dist/pull/**/*', 'dist/pull/**/.*']).then(paths => {
    console.log('Deleted files and folders:\n', paths.join('\n'));
    done();
  });
});


/**
 * Copys source code into the dist/build folder Comments out code which is
 * required for the code base to run locally in Node and would error in GAS
 */
gulp.task('build', function (done) {
  var stream = gulp
    .src(["src/**/*", "src/**/.*"])
    // .pipe(replace("module.exports","//module.exports"))
    .pipe(replace(/\/\/ Node required code block/g, "/* Node required code block"))
    .pipe(replace(/\/\/*.?End of Node required code block/g, "// End of Node required code block*/"))
    .pipe(gulp.dest("dist/build"));

  stream.on('end', function () {
    done();
  });
});

/**
 * Reads an environemt parameter, Selects the correct enviroment config and drops it into the dist/build folder.
 * If no environment set the default is "production"
 */
gulp.task('set-environment-config', function (done) {
  var isProduction = true;
  isProduction = (argv.test !== undefined) ? false : true;
  var environment = isProduction ? 'production' : 'test';

  console.log("Using configuration for '" + environment + "' environment");
  var configDirectory = "config/" + environment;
  directoryExists(configDirectory, (error, directoryFound) => {
    if (!directoryFound) {
      throw "Config directory not found (" + configDirectory + ") - was environement set correctly";
      done(false);
    } else {
      var stream = gulp
        .src([configDirectory + "/**/*"])
        .pipe(gulp.dest("dist/build"));

      stream.on('end', function () {
        done();
      });
    }
  });
});

/**
 * Forcing the environment to be "test".
 * @param done
 * @returns TRUE
 */
gulp.task('use-test-environment', function (done) {
  argv.test = true;
  done();
  return true;
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

  stream.on('end', function () {
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
    // .pipe(replace("//module.exports","module.exports"))
    .pipe(replace(/\/\* Node required code block/g, "// Node required code block"))
    .pipe(replace(/\/\/*.?End of Node required code block\*\//g, "// End of Node required code block"))
    .pipe(gulp.dest("dist/pull"));

  stream.on('end', function () {
    del(["dist/pull/**/*.js"]);
    done();
  });
})

/**
 * Copys the changed code in dist/pull which has been downloaded from GAS into
 * the src folder
 */
gulp.task('copy-changed-pulled-code', function (done) {
  var stream = gulp
    .src(["dist/pull/**/*.html", "dist/pull/**/*.gs", "dist/pull/**/*.json", "dist/pull/**/.*","!dist/pull/environmentConfiguration.gs"])
    .pipe(changed('src'))
    .pipe(gulp.dest('src'));

  stream.on('end', function () {
    done();
  });
});

gulp.task('lint', (done) => {
  return gulp.src("src/*.gs")
      // eslint() attaches the lint output to the "eslint" property
      // of the file object so it can be used by other modules.
      .pipe(eslint())
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach() (see Docs).
      .pipe(eslint.format())
      // To have the process exit with an error code (1) on
      // lint error, return the stream and pipe to failAfterError last.
      .pipe(eslint.failAfterError());
});

/**
 * Deploys code from source upto GAS
 * use --production or --test parameter to specify production or test environment
 */
gulp.task('deploy', gulp.series('clean', 'build', 'set-environment-config', 'clasp-push'));

/**
 * Deploys code from source upto GAS
 * forces deployment environment to use test config
 */
gulp.task('deploy-test', gulp.series('use-test-environment', 'deploy'));

/**
 * Pulls GAS source code into dist/pull and copys changed files into src
 */
gulp.task('pull', gulp.series('clean', 'clasp-pull', 'un-google', 'copy-changed-pulled-code'));
