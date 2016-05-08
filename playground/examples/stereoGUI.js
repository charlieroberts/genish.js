/****************************
******* stereo + gui ********
*****************************
 
the param command creates properties on the callback function
that can be externally referenced; here, we'll use a GUI to control them.
define by passing a name and a starting value. Existing GUIs are destroyed 
whenever you clear (using ctrl+.) or re-run the the play() function */
 
mod = mul( cycle( param( 'modFreq', .1 ) ), 400 )
 
gain = param( 'masterGain', .15 ) 
 
// our envelope is amp - (phasor * amp ); which creates decay
envL = sub( gain, mul( phasor( param( 'phasor1Freq', 8 ) ), gain ) )
envR = sub( gain, mul( phasor( param( 'phasor2Freq', 5 ) ), gain ) )
 
// to stop clicks when envelopes wrap from 0 -> 1, wrap envelopes in 
// a short, 22 sample low-pass filter (with adjustable length)
attack = param( 'attackInSamples',22 ) 
envL = slide( envL, attack )
envR = slide( envR, attack ) 
 
// we use amp in the graphs below, and also create props for the frequency of phasors
outL = mul( cycle( add( 600,  mod ) ), envL )
outR = mul( cycle( sub( 1200, mod ) ), envR )
 
/*
* by passing an array to play we provide a left and a right channel,
* in this instance both of them are using the phasor named 'mod', which
* is memoized to avoid extra computation. 
*/
 
cb = play( [ outL, outR ] )
 
/*
 * play() returns our callback (here named cb). Every call to param()
 * creates a property on this callback, which we can manipulate externally.
 * Here we create a gui to manipulate these params using the dat.gui library
*/
 
gui = new dat.GUI({ width:400 })
gui.add( cb, 'phasor1Freq', 2, 32 )
gui.add( cb, 'phasor2Freq', 2, 32 )
gui.add( cb, 'attackInSamples', 1, 512 )
gui.add( cb, 'modFreq', .1, 32 )
gui.add( cb, 'masterGain', .025, 1 )
