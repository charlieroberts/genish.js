/**********************************************
****** thereminish (mouse interaction) ********
***********************************************

In this sketch mouse movement in the browser window controls
pitch on the y-axis and depth of vibrato on the x-axis. Frequency
inputs are smoothed over 1000 samples using the slide() function. */

// define frequency as a property of our callback function, so that it
// can easily be referenced and modified from outside of genish.js
frequency = param( 'mouseY', 330, 110, 990 )
 
// move from one frequency to the next logarithmically over 1000 samples
portamento = slide( frequency, 1000 )
 
// create an lfo for frequency modulation; base depth off mouseX
lfo = mul( cycle(5), param( 'mouseX', 15, 0, 100 ) )
 
// add vibrato
vibrato = add( portamento, lfo )
 
// play return a JavaScript Promise, that will in turn 
// give us an AudioWorklet node when it is ready to be used.
// here we create a promise that sets up the worklet for interactive
// control via mouse movements.
play( mul( cycle( vibrato ), .15 ) ).then( node => {
 
  window.onmousemove = function( e ) { 
    // scale and offset in mousemove callback so we're not doing it every sample
    // note that properties follow the names given in the prop() constructor.
    node.mouseY = 990 - (e.clientY / window.innerHeight) * 880
    node.mouseX = (e.clientX / window.innerWidth) * 100
  }  
  
})
