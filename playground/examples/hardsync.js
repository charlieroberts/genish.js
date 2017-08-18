// create a sample increment for our master oscillator
freq = param( 'freq', 110 ) 
incr = div( freq, gen.samplerate )

// create our master ramp oscillator
master = counter( incr, 0, 1 )

// sweep our slave oscillator between 220-660 Hz
// and back over two seconds
syncSweep = peek( [220,880], abs( phasor( .5 ) ) )

// hard-sync works by forcing a slave oscillator to reset
// its phase whenever a master oscillator completes a cycle.
// The counter ugen provides a wrap property that changes from
// zero to one for a single sample whenever it wraps. We use this
// value to reset our phasor.
slave = phasor( syncSweep, master.wrap ) 

play( mul( add( master, slave ), .01 ) )

// create some notes for our master oscillator to play 
notes = [110,165,220]
count = 0
interval = setInterval( ()=> {
  freq.value = notes[ count++ % notes.length ]
}, 500 )

// clear setInterval whenever genish.js is cleared
utilities.clear.callbacks.push( ()=> clearTimeout( interval ) )
