/****************************
****** Karplus-Strong *******
*****************************

ported and extended from the gen~ example by thecharlie, 5/10/2106

Karplus-Strong is a simple physical model of a plucked
string. A burst of noise (or other sound) feeds very short delay line 
(with feedback) to acheieve the decaying sound. The damping parameter provides
a control to attenuate feedback, while decay affects the overall envelope */

frequency = param( 'frequency', 400 )
damp   	  = param( 'damping', .6 )
decay  	  = param( 'decay', .97 )
impulseLength = param( 'impulseLength', 5 )
  
// create a counter and store a reference so that we can reset its value
// external to the callback (from a setInterval() callback)
count = counter()
 
// only pass envelope signal through if its greater than 0
envelope = gtp( 
  sub( 1, div( count, mstosamps( impulseLength ) ) ),
  0
)
 
// generate impulse by multiplying selectable input by envelope
impulseInputs = [
  noise(),
  phasor( frequency ),
  train( frequency ),
  cycle( frequency )
]
impulseInputs.push( mul( add( impulseInputs[0], impulseInputs[1] ), .5 ) )
impulseInputs.push( mul( add( impulseInputs[0], impulseInputs[2] ), .5 ) )
impulseInputs.push( mul( add( impulseInputs[0], impulseInputs[3] ), .5 ) )
 
selectedInput = selector( param('input', 0), ...impulseInputs )
 
impulse = mul( selectedInput, envelope )
 
feedback = ssd()
 
// feed impulse and feedback into delay; base delay time off frequency
_delay = delay( add( impulse, feedback.out ), div( 44100, frequency ) )
 
// create decay for feedback using t60 time based on frequency
decayed = mul( _delay, t60( mul( decay, frequency ) ) )
 
// damp feedback
damped = feedback.in(
  mix( decayed, feedback.out, damp )
)
 
callback = play( mul( damped, .25 ) )
 
// create a scheduler that picks a random frequency and 
// resets counter value to 0 to trigger envelope.
clock = { 
  rate:125, 
  timeout:null,
  run() {
    callback.frequency = Math.floor( 220 + Math.random() * 440 )
    count.value = 0 // trigger envelope
    clock.timeout = setTimeout( clock.run, clock.rate )
  }
}
// add a callback to clear (the function that happens when you press Ctrl+.)
// so that our scheduler is also deleted.
utilities.clear.callbacks.push( ()=> clearTimeout( clock.timeout ) )
clock.run()
 
// create a GUI using dat.GUI
gui = new dat.GUI({ width:400 })
gui.add( clock, 'rate', [ 64,125,250,500,1000,2000 ] )
gui.add( callback, 'damping', 0,1 )
gui.add( callback, 'decay', 0, 4 )
gui.add( callback, 'input', { 'noise':0, 'saw':1, 'square':2, 'sine':3, 'noise + saw':4, 'noise + square':5, 'noise + sine':6 } )
gui.add( callback, 'impulseLength', 1,40 )
