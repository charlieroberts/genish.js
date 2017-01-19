'use strict'

/**
 * Delta
 * FIXME: Add documentation
 *
 * @name delta
 * @function
 * @param {(ugen|number)} input
 * @return {ugen}
 * @memberof module:delay
 */

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' )

module.exports = ( in1 ) => {
  let n1 = history()

  n1.in( in1 )

  let ugen = sub( in1, n1.out )
  ugen.name = 'delta'+gen.getUID()

  return ugen
}
