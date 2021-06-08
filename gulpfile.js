const gulp = require( 'gulp' )
const wat2wasm = require( 'gulp-wat2wasm' )

const build = function( done ) {
  gulp.src('./src/*.wat')
    .pipe( wat2wasm() )
    .pipe( gulp.dest('./dist') )
  
  done()
}

exports.default = build