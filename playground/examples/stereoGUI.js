/******** stereo sound + GUI ***********/
 
/*
* the prop command creates properties on the callback function
* that can be externally referenced; here, we'll use a GUI to control them.
* define by passing a name and a starting value. Existing GUIs are destroyed whenever
* you clear (using ctrl+.) or run the the play() function
*/
 
mod = mul( phasor( param( 'modFreq', .1 ) ), 800 )
 
amp = param( 'amp', .15 ) 
 
// we use amp in the graphs below, and also create props for the frequency of phasors
p  = mul( cycle( add( 400, mod  ) ), sub(amp, mul( phasor( param( 'phasor1Freq', 8 ) ), amp ) ) )
p2 = mul( cycle( sub( 1200, mod ) ), sub(amp, mul( phasor( param( 'phasor2Freq', 5 ) ), amp ) ) )
 
 /*
  * by passing an array to play we provide a left and a right channel,
  * in this instance both of them are using the phasor named 'mod', which
  * is memoized to avoid extra computation. 
  */
 
cb = play( [ p, p2 ] )
 
// play returns our callback (cb), which contains the properties we defined earlier. 
// create our gui to manipulate them using the dat.gui library
gui = new dat.GUI()
gui.add( cb, 'modFreq', .1, 32 )
gui.add( cb, 'phasor1Freq', 2, 32 )
gui.add( cb, 'phasor2Freq', 2, 32 )
gui.add( cb, 'amp', .025, 1 )
