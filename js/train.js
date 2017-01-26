'use strict'

/**
 * `train()` creates a pulse train driven by an input frequency signal and input
 * pulsewidth signal. The pulse train is created using the genish expression
 * displayed at right.
 *
 * __Category:__ waveform
 * @name train
 * @function
 * @param {(ugen|number)} frequency
 * @param {(ugen|number)} [pulsewidth = 0.5] - Pulsewidth. A pulsewidth of .5 means the oscillator will spend 50% of its time outputting 1 and 50% of its time outputting 0. A pulsewidth of .2 means the oscillator spends 20% of its time outputting 1 and 80% outputting 0.
 * @example
 * pulseTrain = lt( accum( div( inputFrequency, sampleRate ) ), inputPulsewidth )
 */

let gen     = require( './gen.js' ),
    lt      = require( './lt.js' ),
    phasor  = require( './phasor.js' )

module.exports = ( frequency=440, pulsewidth=.5 ) => {
  let graph = lt( accum( div( frequency, 44100 ) ), .5 )

  graph.name = `train${gen.getUID()}`

  return graph
}
