const gulp = require('gulp');
const browserify = require('browserify');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const envify = require('envify/custom');
const sourcemaps = require('gulp-sourcemaps');


const DEST = './build';

gulp.task('build', () => (
  browserify({
    entries: './lib/index.js',
    standalone: 'javaToJavascript',
    // debug: true,
  })
  .transform(envify({
    _: 'purge',
    NODE_ENV: 'production',
  }))
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
  .pipe(buffer())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(gulp.dest(DEST))
  .pipe(uglify())
  .pipe(rename({ extname: '.min.js' }))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(DEST))
));

gulp.task('default', gulp.series('build'));
