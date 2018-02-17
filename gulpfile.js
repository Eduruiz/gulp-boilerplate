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
    purify          = require('gulp-purifycss'),
    runSequence     = require('run-sequence'),
    reload          = browserSync.reload;
    argv            = require('minimist')(process.argv);
    rsync           = require('gulp-rsync');
    gutil           = require('gulp-util');
    prompt          = require('gulp-prompt');


// Remove all dist/ folder
gulp.task('clean', function(){
    del('dist');
});

// Static server
gulp.task('browserSync', function() {
    browserSync.init({
        proxy: 'gulpboilerplate.test',
        //tunnel: true,
        //tunnel: "gulp-boilerplate"
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch('app/assets/js/*.js', ['js-watch']);
});


gulp.task('styles', function() {
  return gulp.src('app/assets/sass/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({ style: 'compressed' }))
    .on('error', notify.onError(function (error) {
        return 'Error: ' + error.message;
        this.emit('end');
    }))
    .pipe(nano({
        discardComments: {removeAll: true},
        autoprefixer: { browsers: ['last 2 version'], add: true }
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/assets/css'))
    .pipe(filter('**/*.css')) // Filtering stream to only css files
    .pipe(notify({ message: 'Styles task complete' }))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('useref', function(){
    userefSrc = ['app/**/*/',
    '!app/assets/images/**/*',
    '!app/assets/sass/**/*',
    '!app/assets/plugins/**/*',
    '!app/userfiles/**/*',
    '!app/assets/admin/**/*',
    '!app/assets/ckeditor/**/*',
    '!app/assets/fonts/**/*',
    '!app/assets/kcfinder/**/*',
    '!app/assets/uploads/**/*',
    '!app/assets/userfiles/**/*']
    return gulp.src(userefSrc)

    .pipe(useref({
        // each property corresponds to any blocks with the same name, e.g. "build:import"
        config: function (content, target, options, alternateSearchPath) {
            // do something with `content` and return the desired HTML to replace the block content
            return content.replace('content-to-replace', 'new-content');
        }
    }))
    
    // Minifies only if it's a JavaScript file
    .pipe(gulpIf('assets/js/*.js', uglify()))

    // Minifies only if it's a CSS file
    .pipe(gulpIf('assets/css/*.css', nano(({
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
    return gulp.src('app/assets/js/main.js')
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
    var imgSrc = 'app/assets/images/**/*'
    var imgDest = 'dist/assets/images'
    return gulp.src(imgSrc)
    .pipe(newer(imgDest))
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest(imgDest))
    .pipe(notify({ message: 'Images task complete' }));
});

//copying stuff not optimized from app to dist
gulp.task('move_stuff', function() {

  return gulp.src(['app/assets/uploads/**/*',
      'app/assets/admin/**/*',
      'app/assets/ckeditor/**/*',
      'app/assets/fonts/**/*',
      'app/assets/kcfinder/**/*',
      'app/assets/kcfinder/**/*',
      'app/assets/userfiles/**/*'
    ],{ base: './app/' })
  .pipe(gulp.dest('dist/'))
})

//dealing with misc files
gulp.task('misc', function(){
    return gulp.src([
            'app/**/*/.{ico,txt}',
            'app/**/*/.htaccess',
            'app/.htaccess'
        ])
        .pipe(gulp.dest('dist/'));
});



// Default task to be run with 'gulp watch'
gulp.task('watch', ['browserSync', 'styles'], function () {
    // Watch .scss files
    gulp.watch('app/assets/sass/**/*.scss', ['styles']);
    // Watch image files
    gulp.watch('app/assets/images/**/*', browserSync.reload);
    // Watch any files php files, reload on change
    gulp.watch('**/*.php', browserSync.reload);
});

//gulp task to build all the dist/ files
gulp.task('build', function (callback) {
  console.log('building an awesome app :)')
  runSequence('clean', 
    'styles',
    'useref',
    'images',
    'misc',
    'move_stuff',
    callback
  )
})


gulp.task('deploy', function() {
  
  // Dirs and Files to sync
  rsyncPaths = ['dist/'];
  
  // Default options for rsync
  rsyncConf = {
    progress: true,
    archive: true,
    compress: true,
    incremental: true,
    relative: true,
    emptyDirectories: true,
    recursive: true,
    chmod: "Du=rwx,Dgo=rx,Fu=rw,Fgo=r",
    exclude: ['application/config/config.php', '.htaccess'],
  };
  
  // Staging
  if (argv.staging) {
    rsyncConf.root        = 'dist/';
    rsyncConf.hostname    = 'ftp.domain.com'; // hostname
    rsyncConf.username    = 'user'; // ssh username
    rsyncConf.destination = 'path/to/public'; // path where uploaded files go
    // pass: yourpasswd
    

    
  // Production
  } else if (argv.production) {
    rsyncConf.root        = 'dist/';
    rsyncConf.hostname    = 'ftp.domain.com'; // hostname
    rsyncConf.username    = 'user'; // ssh username
    rsyncConf.destination = 'path/to/public'; // path where uploaded files go
    // pass: yourpasswd
  
  // Missing/Invalid Target  
  } else {
    throwError('deploy', gutil.colors.red('Missing or invalid target'));
  }
  

  // Use gulp-rsync to sync the files 
  return gulp.src(rsyncPaths)
  .pipe(gulpIf(
      argv.production, 
      prompt.confirm({
        message: 'Heads Up! Are you SURE you want to push to PRODUCTION?',
        default: false
      })
  ))
  .pipe(rsync(rsyncConf));

});

function throwError(taskName, msg) {
  throw new gutil.PluginError({
      plugin: taskName,
      message: msg
    });
}
