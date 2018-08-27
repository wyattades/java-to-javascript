const gulp = require('gulp');
const browserify = require('browserify');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');


gulp.task('build', () => (
  browserify({
    entries: './index.js',
    standalone: 'javaToJavascript',
    debug: true,
  })
  .transform('babelify', {
    presets: ['@babel/preset-env'],
    sourceMaps: true,
  })
  .bundle()
  .on('error', function (err) {
    console.error(err);
    this.emit('end');
  })
  .pipe(source('java-to-javascript.js'))
  // .pipe(gulp.dest('./build'))
  .pipe(buffer())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(uglify())
  .pipe(rename({ extname: '.min.js' }))
  .pipe(gulp.dest('./build'))
));

gulp.task('default', ['build']);
