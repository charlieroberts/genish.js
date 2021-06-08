/**********************************************
****** thereminish (mouse interaction) ********
***********************************************
In this sketch mouse movement in the browser window controls
pitch on the y-axis and depth of vibrato on the x-axis. Frequency
inputs are smoothed over 1000 samples using the slide() function. */

// define frequency as a property of our callback function, so that it
// can easily be referenced and modified from outside of genish.js
frequency = mouseY = param( 330 )
 
// move from one frequency to the next logarithmically
// over 1000 samples, both down and up
portamento = slide( frequency, 1000, 1000 )
 
// create an lfo for frequency modulation; base depth off mouseX
lfo = mul( cycle(5), mouseX = param( 15 ) )
 
// add vibrato
vibrato = add( portamento, lfo )
 
play( mul( cycle( vibrato ), .15 ) )
 
window.onmousemove = function( e ) { 
  // scale and offset in mousemove callback so we're not doing
  // it every sample.
  mouseY.value = 990 - (e.clientY / window.innerHeight) * 880
  mouseX.value = (e.clientX / window.innerWidth) * 100
}