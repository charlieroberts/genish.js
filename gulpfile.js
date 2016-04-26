var gulp = require('gulp'),
    //uglify = require('gulp-uglify'),
    //notify = require('gulp-notify'),
    //rename = require('gulp-rename'),
    babel  = require('gulp-babel'),
    browserify = require('browserify'),
    //tap        = require('gulp-tap'),
    buffer     = require('gulp-buffer'),
    source     = require('vinyl-source-stream'),
    babelify   = require('babelify')

gulp.task( 'js', function() {
  browserify({ debug:true, standalone:'genish' })
    .transform( babelify, { presets:['es2015'] })
    .require( './js/index.js', { entry: true } ) 
    .bundle()
    .pipe( source('gen.lib.js') )
    .pipe( gulp.dest('./dist') )
    //.pipe( uglify() )
    //.pipe( gulp.dest('./dist') )
    //.pipe( 
    //  notify({ 
    //    message:'Build has been completed',
    //    onLast:true
    //  }) 
    //)
  
  // transpile (but don't browserify) for use with node.js tests
  gulp.src( './js/**.js' )
    .pipe( babel({ presets:['es2015'] }) )
    .pipe( gulp.dest('./dist' ) )

})

gulp.task( 'watch', function() {
  gulp.watch( './js/**.js', function() {
    gulp.run( 'js' )
  })
})

gulp.task( 'default', ['js'] )
