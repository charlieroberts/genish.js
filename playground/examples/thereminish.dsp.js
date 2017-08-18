/**********************************************
****** thereminish (mouse interaction) ********
***********************************************

In this sketch mouse movement in the browser window controls
pitch on the y-axis and depth of vibrato on the x-axis. Frequency
inputs are smoothed over 1000 samples using the slide() function. */

{
  'use jsdsp'

  // define frequency as a property of our callback function, so that it
  // can easily be referenced and modified from outside of genish.js
  frequency = param( 'mouseY', 330 )
   
  // move from one frequency to the next logarithmically over 1000 samples
  portamento = slide( frequency, 1000 )
   
  // create an lfo for frequency modulation; base depth off mouseX
  lfo = cycle(5) *  param( 'mouseX', 15)
   
  // add vibrato
  vibrato = portamento + lfo
   
  // sine oscillator w/ vibrato and scaled gain, store generated callback
  // in 'cb' variable for reference in mousemove handler
  cb = play( cycle( vibrato ) * .15 )
}
 
// setup mouse movement interaction
window.onmousemove = function( e ) { 
  // scale and offset in mousemove callback 
  // note that properties follow the names given in the param() constructors.
  cb.mouseY = 990 - (e.clientY / window.innerHeight) * 880
  cb.mouseX = (e.clientX / window.innerWidth) * 100
}

