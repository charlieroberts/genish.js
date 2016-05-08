
/* garden of earthly delays
 *
 * original gen~ patch by Gregory Taylor
 * https://cycling74.com/2011/11/07/gen-tutorial-1-the-garden-of-earthly-delays/
 *
 * adapted to genish.js by thecharlie 5/2/2016
 * after executing code, use GUI (will appear top right) to control feedback network
 */
 
// passing string to data loads resource via xmlhttprequest.
// run rest of script once the audiofile has loaded
audiofile = data( './resources/audiofiles/dead-presidents.wav' ).then( ()=> {
  
// 'ssd', or single-sample delay,  is pseudonym for gen~ history, since history
//  is a default property of the window object in the browser...
feedback1 = ssd()
feedback2 = ssd()
feedback3 = ssd()
feedback4 = ssd()
 
damp     = prop( 'damping', .5 )
damp2    = prop( 'damping2', .5 )
damp3    = prop( 'damping3', .5 )
delayTime= prop( 'delayTime', 4096 )
gateCtrl = prop( 'feedbackRouter', 0 )
 
// read through audiofile sample by sample
in1 = peek( 
  audiofile, // data
  accum( 1,0,{ max:audiofile.buffer.length } ), // indexing
  { interp:'none', mode:'samples' } 			// attributes
)
 
gate1 = gate( gateCtrl, feedback1.out, { count:4 } )
gate2 = gate( gateCtrl, feedback2.out, { count:4 } )
gate3 = gate( gateCtrl, feedback3.out, { count:4 } )
gate4 = gate( gateCtrl, feedback4.out, { count:4 } )
 
delay1In = add( in1, gate1.outputs[0], gate2.outputs[1], gate3.outputs[2], gate4.outputs[3] )
delay2In = add( in1, gate1.outputs[1], gate2.outputs[0], gate3.outputs[3], gate4.outputs[3] )
delay3In = add( in1, gate1.outputs[2], gate2.outputs[3], gate3.outputs[0], gate4.outputs[1] )
delay4In = add( in1, gate1.outputs[3], gate2.outputs[2], gate3.outputs[1], gate4.outputs[0] )
 
// inlets and feedbacks feed our delays
delay1 = delay( delay1In, delayTime,        { size: 44100 })
delay2 = delay( delay2In, div(delayTime,2), { size: 44100 })
delay3 = delay( delay3In, div(delayTime,3), { size: 44100 })
delay4 = delay( delay4In, div(delayTime,4), { size: 44100 })
 
// delays are folded
foldedDelay1 = fold( delay1, -1,1 )
foldedDelay2 = fold( delay2, -1,1 )
foldedDelay3 = fold( delay3, -1,1 )
foldedDelay4 = fold( delay4, -1,1 )
 
// damp feedback with folded delays
feedbackMix1 = feedback1.in( mix( foldedDelay1, feedback1.out, damp ) )
feedbackMix2 = feedback2.in( mix( foldedDelay2, feedback2.out, damp ) )
feedbackMix3 = feedback3.in( mix( foldedDelay3, feedback3.out, damp2 ) )
feedbackMix4 = feedback4.in( mix( foldedDelay4, feedback4.out, damp2 ) )
 
ssdLeft = ssd()
ssdRight = ssd()
 
left  = ssdLeft.in(  mix( mul( .5, add( feedbackMix1, feedbackMix3 ) ), ssdLeft.out,  damp3 ) )
right = ssdRight.in( mix( mul( .5, add( feedbackMix2, feedbackMix4 ) ), ssdRight.out, damp3 ) )
 
// limit output to {-1,1}
limitL = clamp( left, -1,1 )
limitR = clamp( right, -1,1 )
  
// play stereo out & print callback to console for potential debugging
cb = play( [ limitL, limitR ], true )
 
gui = new dat.GUI()
gui.add( cb, 'damping',   0, 1 )
gui.add( cb, 'damping2',  0, 1 )
gui.add( cb, 'damping3',  0, 1 )
gui.add( cb, 'delayTime', 128, 22050 )
gui.add( cb, 'feedbackRouter', 0,3 ).step(1)
 
})
