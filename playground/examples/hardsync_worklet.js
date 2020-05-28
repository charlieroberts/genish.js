/* hard sync / soft sync
Hard sync and soft sync are classic techniques of analog synthesis,
where the phase of a slave oscillator is modified whenever the phase
of a master oscillator completes one oscillation. With hard sync, the
phase of the slave is reset to 0; with soft sync, the phase increment
(or frequency) of the oscillator is inverted.

Frequency changes in the slave oscillator can create dramatic
changes of timbre while still preserving the fundamental frequency
used by the master oscillator. In this demo we start with hard sync,
and then duplicate the basic setup to show soft sync as well. Both
examples rely on the the counter ugen, which as a property, counter.wrap,
which flips from 0 to 1 for a single sample whenever the the counters
internal value jumps from its maximum to its minimum value, or vice-versa.
The wrap property controls phase resetting in hard sync, and phase
increment inversino in soft sync.
*/

// create a sample increment for our master oscillator
freq = seq( [11025], [110,165,220] )
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


// soft sync works in a similar fashion to hard sync, except
// instead of resetting the phase of the slave oscillator, we
// reverse the direction; if a triangle oscillator was traveling
// upwards in phase, it will now be travelling down. We can
// do this by simply inverting the frequency of our slave oscillator
// whenever a wrap in the master is detected. The example below uses
// the same basic setup as hard sync, but inverts the phase increment
// on each wrap. To do this we create a data ugen (dir) that is
// incremented by one each wrap. If the mod of this value is one, then
// we use a negative frequency, otherwise we use a positive frequency
// value.

// clear hard sync if it's still running
genish.utilities.clear()

freq = seq( [11025], [110,165,220] )
incr = div( freq, gen.samplerate )

// create our master ramp oscillator
master = counter( incr, 0, 1 )

// sweep our slave oscillator between 220-660 Hz
// and back over two seconds
syncSweep = peek( [220,880], abs( phasor( .5 ) ) )

// create a value to store our direction in.
// the meta property lets us refer to indices in
// our data ugen using standard array the access operators []
dir = data( 1,1,{ meta:true })

// every time our master oscillator wraps, add one, 
// otherwise add zero
dir[0] = add( dir[0], master.wrap )

// get a 0 or 1 value from our dir
moddir = mod( dir[0], 2 )

// a modifier that will invert our slave frequency
freqmod = ifelse(
  eq( moddir, 0 ), 1,
  -1
)

// change sign of frequency based on value of freqmod
slave = phasor( mul( syncSweep, freqmod ) ) 

play( mul( add( master, slave ), .01 ) )
