const gulp = require('gulp'),
      //uglify   = require('gulp-uglify'),
      //notify   = require('gulp-notify'),
      browserify = require('browserify'),
      //buffer     = require('gulp-buffer'),
      source     = require('vinyl-source-stream')
      //mocha      = require('gulp-mocha')

gulp.task( 'js', function() {
  const out = browserify({ debug:true, standalone:'genish' })
    .require( './js/index.js', { entry: true } )
    .bundle()
    .pipe( source('gen.lib.js') )
    .pipe( gulp.dest('./dist') )
    //.pipe( uglify() )
    // notify() doesn't work in linux?
    //.pipe(
    //  notify({
    //    message:'Build has been completed',
    //    onLast:true
    //  })
    //)

  // transpile (but don't browserify) for use with node.js tests
  return out // gulp.src( './js/**.js' )
    //.pipe( gulp.dest('./dist' ) )

})

/*
gulp.task( 'test', ['js'], ()=> {
  return gulp.src('test/*.js', {read:false})
    .pipe( mocha({ reporter:'nyan' }) ) // spec, min, nyan, list
})


gulp.task( 'watch', function() {
  gulp.watch( './js/**.js', ['test'] )
})
*/
gulp.task( 'default', ['js'] )
