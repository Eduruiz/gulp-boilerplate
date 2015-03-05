var gulp          = require('gulp'),
    filter        = require('gulp-filter');
    sass          = require('gulp-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
    minifycss     = require('gulp-minify-css'),
    jshint        = require('gulp-jshint'),
    uglify        = require('gulp-uglify'),
    imagemin      = require('gulp-imagemin'),
    rename        = require('gulp-rename'),
    concat        = require('gulp-concat'),
    notify        = require('gulp-notify'),
    through       = require('gulp-through'),
    cache         = require('gulp-cache'),
    browserSync   = require('browser-sync'),
    newer         = require('gulp-newer');
    reload        = browserSync.reload;

gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images');
});

// Static server
gulp.task('browser-sync', function() {
    browserSync({
        proxy: "localhost/dinamo",
        tunnel: true,
        tunnel: "dinamo"
    });
});


gulp.task('styles', function() {
  return gulp.src('assets/sass/main.scss')
    .pipe(sass({ style: 'compressed' }))
    .on("error", notify.onError(function (error) {
        return "Error: " + error.message;
        this.emit('end');
    }))
    .pipe(autoprefixer('last 2 version'))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/css'))
    .pipe(filter('**/*.css')) // Filtering stream to only css files
    .pipe(notify({ message: 'Styles task complete' }))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('scripts', function() {
  return gulp.src('assets/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('images', function() {
    var imgSrc = 'assets/images/**/*'
    var imgDest = 'dist/images'
    return gulp.src(imgSrc)
    .pipe(newer(imgDest))
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest(imgDest))
    .pipe(notify({ message: 'Images task complete' }));
});


// Default task to be run with 'gulp watch'
gulp.task('watch', ['styles', 'browser-sync'], function () {
    // Watch .scss files
    gulp.watch("assets/sass/*.scss", ['styles']);
    // Watch .js files
    gulp.watch('assets/js/*.js', ['scripts', browserSync.reload]);
    // Watch image files
    gulp.watch('assets/images/**/*', ['images', browserSync.reload]);
    // Watch any files php files, reload on change
    gulp.watch('**/*.php', browserSync.reload);
});
