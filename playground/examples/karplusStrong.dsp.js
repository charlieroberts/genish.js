/******** Karplus-Strong *******
thecharlie, 5/10/2106

Karplus-Strong is a simple physical model of a plucked
string. A burst of noise (or other sound) feeds very short delay line 
(with feedback) to acheieve the decaying sound. The damping parameter provides
a control to attenuate feedback, while decay affects the overall envelope */

frequency = param( 'frequency', 400 )
damp       = param( 'damping', .6 )
decay      = param( 'decay', .97 )
impulseLength = param( 'impulseLength', 5 )
rate       = param( 'rate', 4 )

{
  'use jsdsp'

  // phasor driving impulse playback rate
  sequencer = counter( rate/gen.samplerate, 0, 1 )

  // start of impulse generator, triggered whenever
  // sequencer wraps
  count = counter( 1, 0, Infinity, sequencer.wrap )

  // only pass envelope signal through if its greater than 0
  envelope = gtp( 
    1 - count / mstosamps( impulseLength ) ,
    0
  )
   
  // generate impulse by multiplying selectable input by envelope
  impulseInputs = [
    noise(),
    phasor( frequency ),
    train( frequency ),
    cycle( frequency )
  ]
  impulseInputs.push( ( impulseInputs[0] + impulseInputs[1] ) * .5 )
  impulseInputs.push( ( impulseInputs[0] + impulseInputs[2] ) * .5 )
  impulseInputs.push( ( impulseInputs[0] + impulseInputs[3] ) * .5 )
   
  selectedInput = selector( param('input', 0), ...impulseInputs )
   
  impulse = selectedInput * envelope
   
  feedback = ssd()
   
  // feed impulse and feedback into delay; base delay time off frequency
  _delay = delay( impulse + feedback.out, gen.samplerate / frequency )
   
  // create decay for feedback using t60 time based on frequency
  decayed = _delay * t60( decay * frequency )
   
  // damp feedback
  damped = mix( decayed, feedback.out, damp )
  feedback.in( damped )
   
  callback = play( damped * .25, false, Float64Array )
}
 
// create a GUI using dat.GUI
gui = new dat.GUI({ width:400 })
gui.add( callback, 'rate', .5, 32 )
gui.add( callback, 'damping', 0,1 )
gui.add( callback, 'decay', 0, 4 )
gui.add( callback, 'input', { 'noise':0, 'saw':1, 'square':2, 'sine':3, 'noise + saw':4, 'noise + square':5, 'noise + sine':6 } )
gui.add( callback, 'impulseLength', 1,40 )

