/****************************
****** Karplus-Strong *******
*****************************

ported from the gen~ example by thecharlie, 5/10/2106

Karplus-Strong is a simple physical model of a plucked
string. A burst of noise feeds very short delay line (with feedback) 
to acheieve the decaying sound. The damping parameter provides
a control to attenuate feedback, while decay affects the overall envelope*/

noteon = param( 'noteon', 0 )
freq   = param( 'frequency', 400 )
damp   = param( 'damping', .75 )
decay  = param( 'decay', .97 )
 
// create a line from 1 to 0 over 10 ms on trigger (via noteon param);
envelope = gtp( 
  sub( .5, div( counter(1, 0, Infinity , noteon ), mstosamps(10) ) ),
  0
)
 
// generate impulse by multiplying noise by envelop
impulse = mul( noise(), envelope )
 
feedback = ssd()
 
// feed impulse and feedback into delay; base delay time off frequency
d = delay( add( impulse, feedback.out ), div(44100,freq), { size:2048 } )
 
// create decay for feedback using t60 time based on frequency
decayed = mul( d, t60( mul( decay, freq ) ) )
 
// damp feedback
damped = feedback.in(
  mix( decayed, feedback.out, damp )
)
 
cb = play( damped )
 
// create a scheduler that sets note to 1 every 250 ms for ~10ms. 
// pick a random frequency
let interval = setInterval( ()=> {
  cb.frequency = Math.floor( 220 + Math.random() * 440 )
  cb.noteon = 1
  setTimeout( ()=> { cb.noteon = 0 }, 5 )
}, 250 )
 
// create a GUI using dat.GUI
gui = new dat.GUI()
gui.add( cb, 'damping', 0,1 )
gui.add( cb, 'decay', 0, 4 )
 
// add a callback to clear (the function that happens when you press Ctrl+.)
// so that our scheduler is also deleted.
utilities.clear.callbacks.push( ()=> clearInterval( interval ) )f( interval !== undefined ) clearInterval( interval )
