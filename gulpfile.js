var gulp            = require('gulp'),
    filter          = require('gulp-filter');
    sass            = require('gulp-sass'),
    sourcemaps      = require('gulp-sourcemaps'),
    autoprefixer    = require('gulp-autoprefixer'),
    nano            = require('gulp-cssnano'),
    jshint          = require('gulp-jshint'),
    uglify          = require('gulp-uglify'),
    imagemin        = require('gulp-imagemin'),
    rename          = require('gulp-rename'),
    concat          = require('gulp-concat'),
    notify          = require('gulp-notify'),
    del             = require('del'),
    cache           = require('gulp-cache'),
    browserSync     = require('browser-sync'),
    newer           = require('gulp-newer'),
    plumber         = require('gulp-plumber'),
    useref          = require('gulp-useref'),
    gulpIf          = require('gulp-if'),
    // critical     = require('critical'),
    purify          = require('gulp-purifycss'),
    runSequence = require('run-sequence'),
    reload          = browserSync.reload;

// gulp.task('default', ['clean'], function() {
//     gulp.start('styles', 'scripts', 'images');
// });

// Remove all dist/ folder
gulp.task('clean', function(){
    del('dist');
});

// Static server
gulp.task('browserSync', function() {
    browserSync.init({
        proxy: "192.168.33.10/_util/gulp-boilerplate/app",
        //tunnel: true,
        //tunnel: "gulp-boilerplate"
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch("app/js/*.js", ['js-watch']);
});


gulp.task('styles', function() {
  return gulp.src('app/sass/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({ style: 'compressed' }))
    .on("error", notify.onError(function (error) {
        return "Error: " + error.message;
        this.emit('end');
    }))
    .pipe(nano({
        discardComments: {removeAll: true},
        autoprefixer: { browsers: ['last 2 version'], add: true }
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/css'))
    .pipe(filter('**/*.css')) // Filtering stream to only css files
    .pipe(notify({ message: 'Styles task complete' }))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('useref', function(){
  return gulp.src('app/**/*.php')
    .pipe(useref())
    
    // Minifies only if it's a JavaScript file
    .pipe(gulpIf('*.js', uglify()))

    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', nano(({
        discardComments: {removeAll: true},
        autoprefixer: { browsers: ['last 2 version'], add: true }
    }))))

    .pipe(gulp.dest('dist'))
});

gulp.task('purify', function () {
    return gulp.src('dist/css/main.css')
    .pipe(purify(['dist/**/*.js', 'index.php']))
    .pipe(gulp.dest('dist/css'))
    .on("error", notify.onError(function (error) {
        return "Error: " + error.message;
        this.emit('end');
    }))
})

// gulp.task('critical', function(){
//     critical.generate({
//         inline: true,
//         base: 'dist/',
//         src: 'index.html',
//         dest: 'dist/index-critical.html',
//         minify: true,
//         width: 1366,
//         height: 768
//     })
// });

gulp.task('scripts', function() {
    return gulp.src('app/js/main.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }))
    
    // Use gulp-notify as jshint reporter
    .pipe(notify(function (file) {
      if (file.jshint.success) {
        // Don't show something if success
        return 'Scripts task complete';
      }
      var errors = file.jshint.results.map(function (data) {
        if (data.error) {
          return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
        }
      }).join("\n");
      return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
    }));
});

// create a task that ensures the `js` task is complete before
// reloading browsers
gulp.task('js-watch', ['scripts'], browserSync.reload);



gulp.task('images', function() {
    var imgSrc = 'app/images/**/*'
    var imgDest = 'dist/images'
    return gulp.src(imgSrc)
    .pipe(newer(imgDest))
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest(imgDest))
    .pipe(notify({ message: 'Images task complete' }));
});

//copying fonts from app to dist
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
})


// Default task to be run with 'gulp watch'
gulp.task('watch', ['browserSync', 'styles'], function () {
    // Watch .scss files
    gulp.watch("app/sass/**/*.scss", ['styles']);
    // Watch image files
    gulp.watch('app/images/**/*', ['images'], browserSync.reload);
    // Watch any files php files, reload on change
    gulp.watch('**/*.php', browserSync.reload);
});

// gulp.task('watch', ['browserSync', 'sass'], function (){
//   gulp.watch('app/sass/**/*.scss', ['sass']); 
//   // Reloads the browser whenever HTML or JS files change
//   gulp.watch('app/*.php', browserSync.reload); 
//   gulp.watch('app/js/**/*.js', ['scripts'], browserSync.reload); 
// });

//gulp task to build all the dist/ files
gulp.task('build', function (callback) {
  console.log('building a awesome app :)')
  runSequence('clean', 
    ['styles', 'images', 'fonts'],
    'useref',
    callback
  )
})

