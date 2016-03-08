var gulp = require("gulp"),
  connect = require("gulp-connect"),
  opn = require("opn"),
  gutil = require("gulp-util"),
  sass = require('gulp-ruby-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  useref = require('gulp-useref'),
  gulpif = require('gulp-if'),
  uglify = require('gulp-uglify'),
  minifycss = require('gulp-minify-css'),
  concatcss = require('gulp-concat-css'),
  notify = require('gulp-notify'),
  autoprefixer = require('gulp-autoprefixer'),
  uncss = require('gulp-uncss'),
  rename = require("gulp-rename"),
  scsslint = require('gulp-scss-lint'),
  sasslint = require('gulp-sass-lint'),
  clean = require('gulp-clean'),
  sftp = require('gulp-sftp'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  webpack = require('webpack-stream');
  wiredep = require('wiredep').stream;

// server app
gulp.task('connect', function() {
  connect.server({
    root: 'app',
    livereload: true,
    port: 8080
  });
  gutil.log("Running Gulp!");
  opn("http://localhost:8080");
});

// html
gulp.task('html', function () {
  gulp.src('./app/*.html')
    .pipe(connect.reload());
});

// css 
gulp.task('css', function () {
  gulp.src('./app/css/*.css')
    .pipe(connect.reload());
});

// js 
gulp.task('js', function () {
  gulp.src('./app/js/*.js')
    .pipe(connect.reload());
});

// sass 
gulp.task('sass', function() {
    return sass('./app/css/sass/*.{sass,scss}', {
        'sourcemap': true,
        'style': 'expanded',
        'lineNumbers': true
    })
    .pipe(autoprefixer('last 15 versions'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./app/css/'))
    .pipe(connect.reload());
});

// bower
gulp.task('bower', function () {
  gulp.src('./app/index.html')
    .pipe(wiredep({
      "directory" : "app/bower_components"
    }))
    .pipe(gulp.dest('./app'));
});

// webpack
gulp.task('webpack', function() {
  return gulp.src('./app/js/app.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('./'));   
});

// clean
gulp.task('clean', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

// sftp
gulp.task('sftp', function () {
    return gulp.src('dist/**/*')
        .pipe(sftp({
            host: 'website.com',
            user: 'johndoe',
            pass: '1234',
            remotePath: '/'
        }));
});

// images
gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViweBox: false}],
    use: [pngquant()]
    }))
  .pipe(gulp.dest('dist/images'))
});

// fonts
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

// watch  
gulp.task('watch', function () {
  gulp.watch(['./app/*.html'], ['html']);
  gulp.watch(['./app/css/*.css'], ['css']);
  gulp.watch(['./app/js/*.js'], ['js']);
  gulp.watch(['./app/css/sass/*.{sass,scss}'], ['sass']);
  gulp.watch(['./app/js/**/*'], ['webpack']);
  gulp.watch('bower.json', ['bower']);
});

// default
gulp.task('default', ['webpack','connect', 'watch']);

// build
gulp.task('build', ['clean', 'images', 'fonts'], function () {
  gulp.src('./app/*.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifycss()))
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});