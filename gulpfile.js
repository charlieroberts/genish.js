var gulp = require('gulp'),
    //uglify   = require('gulp-uglify'),
    notify     = require('gulp-notify'),
    babel      = require('gulp-babel'),
    browserify = require('browserify'),
    buffer     = require('gulp-buffer'),
    source     = require('vinyl-source-stream'),
    babelify   = require('babelify'),
    mocha      = require('gulp-mocha'),
    pathmodify = require('pathmodify'),
    options    = require('yargs').argv


const target = options.target === undefined ? 'es5' : options.target

gulp.task( 'js', function() {
  browserify({ 
      debug:true, 
      standalone:'genish',
      insertGlobalVars: { GENISH_TARGET: function() { return `'${target}'` } } // must be wrapped string, inserted directly into code
    })
    .plugin( pathmodify, { 
      mods:[ 
        rec => {
          if( rec.id.indexOf( 'target' ) > -1 ) {

            var alias = {
              id: rec.id.replace('target', target )
            }

            return alias
          }else if( rec.id === './gen.js' ) {
            return { id: __dirname + '/js/gen.js' }
          }
      }] 
    } )
    .require( './js/index.js', { entry: true } )
    //.transform( babelify, { presets:['es2015'] })
    .bundle()
    .pipe( source('gen.lib.js') )
    .pipe( gulp.dest('./dist') )
    //.pipe( uglify() )
    //.pipe( gulp.dest('./dist') )
    .pipe(
      notify({
        message:'Build has been completed',
        onLast:true
      })
    )

  // transpile (but don't browserify) for use with node.js tests
  return gulp.src( './js/**.js' )
    //.pipe( babel({ presets:['es2015'] }) )
    .pipe( gulp.dest('./dist' ) )

})

gulp.task( 'test', ['js'], ()=> {
  return gulp.src('test/*.js', {read:false})
    .pipe( mocha({ reporter:'nyan' }) ) // spec, min, nyan, list
})


gulp.task( 'watch', function() {
  gulp.watch( './js/**.js', ['test'] )
})

gulp.task( 'default', ['js'] ) //'test'] )
