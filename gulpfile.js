var gulp          = require('gulp'),
    sass          = require('gulp-ruby-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
    minifycss     = require('gulp-minify-css'),
    jshint        = require('gulp-jshint'),
    uglify        = require('gulp-uglify'),
    imagemin      = require('gulp-imagemin'),
    rename        = require('gulp-rename'),
    concat        = require('gulp-concat'),
    notify        = require('gulp-notify'),
    cache         = require('gulp-cache'),
    livereload    = require('gulp-livereload'),
    del           = require('del'),
    browserSync   = require('browser-sync'),
    reload        = browserSync.reload;

gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images');
});

// Static server
gulp.task('browser-sync', function() {
  browserSync.init(null, {
    proxy: {
      host: "http://localhost",
      port: "5000"
    }
  });
});

gulp.task('styles', function() {
  return gulp.src('assets/sass/main.scss')
    .pipe(sass({ style: 'compressed' }))
    .pipe(autoprefixer('last 2 version'))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(notify({ message: 'Styles task complete' }))
    .pipe(reload({stream:true}));
});

gulp.task('scripts', function() {
  return gulp.src('assets/js/**/*.js')
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('images', function() {
  return gulp.src('assets/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/assets/images'))
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('clean', function(cb) {
	del(['dist/assets/css', 'dist/assets/js', 'dist/assets/images'], cb)
});


gulp.task('watch',['browser-sync'], function() {
 	// Watch .scss files
 	gulp.watch('assets/sass/**/*.scss', ['styles']);
 	// Watch .js files
 	gulp.watch('assets/js/**/*.js', ['scripts']);
 	// Watch image files
 	gulp.watch('assets/images/**/*', ['images']);
 	// Create LiveReload server
	livereload.listen();
	// Watch any files in dist/, reload on change
  gulp.watch(['*.php']).on('change', livereload.changed);
});