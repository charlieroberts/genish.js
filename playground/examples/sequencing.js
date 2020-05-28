/* Sequencing Tutorial by thecharlie

Using the peek() and data() ugens we can build simple
sequencers without much difficulty in genish. One key to this
is to set the 'interp' property of peek objects to 'none', so
that the values peek generates from its underyling data are
not interpolated. */

// generate a ramp from 0-1
lookup = phasor( .5, 0, { min:0 })
freq = peek( data([220,330,440,550]), lookup, { interp:'none' })
play( mul( cycle( freq ), .05 ) )

// although it can be fun to use arbitrary waveforms to drive
// lookup values, sometimes there is a need for systems with
// more precise timing for advancing sequencing, such as ms or
// samples. We can create this by using two counter() ugens. The
// first will output a "bang" whenever it wraps from its max
// value (the timing we want to use). The second will use that
// bang to increment an internal number, which we will then use
// to lookup data with our peek object.

// an array of frequencies
values  = [220,330,440,550]

// create a clock to output a pulse every 22050 samples
clock   = counter( 1, 0, 22050 )

// count from 0 to 3, incrementing by 1 each time our clock
// "wraps" from 22050 to 0.
indexer = counter( clock.wrap, 0, values.length )

// use our indexer counter to select a value from our data
// array. The mode:'simple' ensures that no interpolation
// occurs and that our index value is not interepret as
// a phase (from 0 to 1) like in our original example.
freq    = peek( data( values ), indexer, { mode:'simple' } )
 
play( mul( cycle( freq ), .05 ) )

// genish encapsulates the above behavior in the seq() ugen
// which is written with counters, peeks and data ugens just
// like the example above. seq() lets you define an array
// of values and an array of durations to loop through.

freq = seq( [11025, 22050], [220,330,440,550] )
play( mul( cycle( freq ), .05 ) )

// you can also pass single values instead of arrays for
// either the durations or the outputted values. There's
// also a third rate parameter (default=1) that lets you modulate 
// timing at audio rate. Here we go from incrementing the
// phase of our sequencer by .5 each sample to 2.5 over 4 seconds

speed = add( .5, phasor( .25, 0, { min:0, max:2 }) )
freq = seq( [5512, 11025], [220,330,440,550], speed )
play( mul( cycle( freq ), .05 ) )

// there are of course other ways to create sequences (for 
// example, changing params from within a setInterval) but
// having an option that provides for easy audio-rate modulation
// of timing opens up a lot of fun options!
