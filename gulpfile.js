'use strict';
//import autoprefixer from 'gulp-autoprefixer';

const { src, dest, parallel, series, watch } = require('gulp');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cssbeautify = require('gulp-cssbeautify');
const removeComments = import('gulp-strip-css-comments');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
//const rigger = require('gulp-rigger');
const include = require('gulp-include');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const imagemin = require('gulp-imagemin');
//const del = import('del');
const cleanD = require('gulp-dest-clean');
const panini = require('panini');
const browserSync = require('browser-sync').create();

var path = {
  build: {
    html: 'dist/',
    js: 'dist/assets/js',
    css: 'dist/assets/css',
    images: 'dist/assets/img',
  },
  src: {
    html: 'src/*.html',
    js: 'src/assets/js/*.js',
    css: 'src/assets/sass/style.scss',
    images: 'src/assets/img/**/*.{jpg,png,svg,gif,ico,jpeg}',
  },
  watch: {
    html: 'src/**/*.html',
    js: 'src/assets/js/**/*.js',
    css: 'src/assets/sass/**/*.scss',
    images: 'src/assets/img/**/*.{jpg,png,svg,gif,ico,jpeg}',
  },
  clean: './dist',
};

/* Tasks */
function browsersync() {
  browserSync.init({
    server: {
      baseDir: './dist',
      serveStaticOptions: {
        extensions: ['html'],
      },
    },
    port: 3010,
  });
}

// function browserSyncReload(done) {
//   browsersync.reload();
// }

function html() {
  panini.refresh();
  return src(path.src.html, { base: 'src/' })
    .pipe(plumber())
    .pipe(
      panini({
        root: 'src/',
        layouts: 'src/templates/layouts/',
        partials: 'src/templates/partials/',
        helpers: 'src/templates/helpers/',
        data: 'src/templates/data/',
      })
    )
    .pipe(dest(path.build.html))
    .pipe(browserSync.stream());
}

function css() {
  return (
    src(path.src.css, { base: 'src/assets/sass/' })
      .pipe(plumber())
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({ grid: true }))
      .pipe(cssbeautify())
      .pipe(dest(path.build.css))
      .pipe(
        cssnano({
          zindex: false,
          discardComments: {
            removeAll: true,
          },
        })
      )
      //.pipe(removeComments())
      .pipe(
        rename({
          suffix: '.min',
          extname: '.css',
        })
      )
      .pipe(dest(path.build.css))
      .pipe(browserSync.stream())
  );
}

function js() {
  return src(path.src.js, { base: './src/assets/js' })
    .pipe(plumber())
    .pipe(include()) // склейка js-файлов
    .pipe(dest(path.build.js))
    .pipe(uglify()) // сжатие
    .pipe(
      rename({
        suffix: '.min',
        extname: '.js',
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream());
}

function images() {
  return src(path.src.images).pipe(imagemin()).pipe(dest(path.build.images));
}

async function clean() {
  return cleanD(path.clean);
}

//  function clean() {
//   return del.sync(path.clean, { force: true });
// }

// function pages() {
//   return src('./src/templates/*.html')
//     .pipe(dest('./dist/'))
//     .pipe(browserSync.reload({ stream: true }));
// }

// function watchFiles() {
//   gulp.watch([path.watch.html], html).on('change', browserSync.reload);
//   gulp.watch([path.watch.css], css).on('change', browserSync.reload);
//   gulp.watch([path.watch.js], js);
//   gulp.watch([path.watch.images], images);
// }

function watch_dev() {
  watch([path.watch.html], html).on('change', browserSync.reload);
  watch([path.watch.css], css).on('change', browserSync.reload);
  watch([path.watch.js], js);
  watch([path.watch.images], images);
}
//const build = gulp.series(clean, gulp.parallel(html, css, js, images));
//const watch = parallel(clean, css, js, pages, browsersync, watchFiles);

exports.browsersync = browsersync;
exports.html = html;
exports.css = css;
exports.js = js;
//exports.pages = pages;
exports.images = images;
exports.clean = clean;
//exports.build = build;
//exports.watch_dev = watch_dev;
exports.default = parallel(clean, html, css, js, browsersync, watch_dev);

//exports.default = parallel(clean, css, js, pages, watch_dev);
exports.build = series(clean, html, css, js, images);
