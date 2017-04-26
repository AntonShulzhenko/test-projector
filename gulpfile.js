const gulp         = require('gulp');
const sass         = require('gulp-sass');
const postcss      = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemaps   = require('gulp-sourcemaps');
const include      = require('gulp-include');
const gutil        = require('gulp-util');
const plumber      = require('gulp-plumber');
const notify       = require('gulp-notify');
const cache        = require('gulp-cached');
const eslint       = require('gulp-eslint');
const sequence     = require('run-sequence');
const path         = require('path');
const del          = require('del');
const server       = require('browser-sync').create();
const imagemin     = require('gulp-imagemin');
const pug          = require('gulp-pug');
const data         = require('gulp-data');
const fs           = require('fs');


const errorHandler = (title) => plumber(
  title = 'Error',
  {
    errorHandler: notify.onError({
      title,
      message: '<%= error.message %>',
      sound: 'Submarine'
    })
  });


gulp.task('server', () => {
  server.init({
    server: {
      baseDir: ['public', 'src'],
      routes: {
        '/libs': 'node_modules'
      }
    },
    files: [
      'public/css/**/*.css',
      'public/js/**/*.js',
      'public/**/*.html'
    ],
    open: gutil.env.open !== false,
    ghostMode: false
  });
});


gulp.task('pug', () => {
  return gulp.src('./src/templates/*.pug')
    .pipe(data((file) => JSON.parse(fs.readFileSync('./src/json/data.json'))))
    .pipe(pug({
      pretty: true,
      cache: false
    }))
    .pipe(gulp.dest('./public/'))
    .pipe(server.stream());
});

gulp.task('normalize', () => {
  return gulp
    .src('node_modules/normalize.css/*.css')
    .pipe(gulp.dest('public/css'));
});


gulp.task('styles', () => {
  return gulp
    .src('src/scss/**/*.scss')
    .pipe(errorHandler())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/css'));
});


gulp.task('scripts', () => {
  return gulp
    .src('src/js/main.js')
    .pipe(errorHandler())
    .pipe(sourcemaps.init())
    .pipe(include({
      includePaths: [
        path.join(__dirname, 'node_modules'),
        path.join(__dirname, 'src', 'js')
      ]
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/js'));
});


gulp.task('lint', () => {
  return gulp
    .src([
      'src/js/**/*.js',
      '!src/js/vendor.js',
      '!node_modules/**'
    ])
    .pipe(errorHandler())
    .pipe(cache('lint'))
    .pipe(eslint())
    .pipe(eslint.format());
});


gulp.task('static:fonts', () => {
  return gulp
    .src([
      'src/fonts/**/*'
    ])
    .pipe(errorHandler())
    .pipe(gulp.dest('public/fonts'));
});


gulp.task('static:images', () => {
  return gulp
    .src('src/img/**/*.*')
    .pipe(errorHandler())
    .pipe(cache(imagemin({
      interlaced: true
    })))
    .pipe(gulp.dest('public/img'));
});


gulp.task('static', ['static:fonts', 'static:images'], () => {
  return gulp
    .src([
      'src/*.png', 'src/*.svg', 'src/*.json', 'src/*.xml'
    ])
    .pipe(errorHandler())
    .pipe(gulp.dest('public'));
});


gulp.task('clean', () => {
  return del('public').then((paths) => {
    gutil.log('Deleted:', gutil.colors.magenta(paths.join('\n')));
  });
});


gulp.task('build', (cb) => {
  sequence(
    'clean',
    'pug',
    'normalize',
    'styles',
    'scripts',
    'lint',
    'static',
    cb
  );
});


gulp.task('watch', () => {
  gulp.watch('src/scss/**/*.scss', ['styles']);
  gulp.watch(['src/js/**/*.js'], ['scripts', 'lint']);
  gulp.watch('src/json/data.json', ['pug']);
  gulp.watch('src/templates/*.pug', ['pug']);
});


gulp.task('default', () => {
  sequence(
    'build',
    'watch',
    'server'
  );
});
