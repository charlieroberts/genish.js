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
  
damp     = param( 'damping', .5 )
damp2    = param( 'damping2', .5 )
damp3    = param( 'damping3', .5 )
delayTime= param( 'delayTime', 556 )
gateCtrl = param( 'feedbackRouter', 0 )
 
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
delay2In = add( in1, gate1.outputs[1], gate2.outputs[0], gate3.outputs[3], gate4.outputs[2] )
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
feedbackMix1 = mix( foldedDelay1, feedback1.out, damp )
feedbackMix2 = mix( foldedDelay2, feedback2.out, damp )
feedbackMix3 = mix( foldedDelay3, feedback3.out, damp2 )
feedbackMix4 = mix( foldedDelay4, feedback4.out, damp2 )
 
// record output of mix ugens for use in next sample
feedback1.in( feedbackMix1 ); feedback2.in( feedbackMix2 );
feedback3.in( feedbackMix3 ); feedback4.in( feedbackMix4 );
 
ssdLeft = ssd()
ssdRight = ssd()
 
left  = mix( mul( .5, add( feedbackMix1, feedbackMix3 ) ), ssdLeft.out,  damp3 )
right = mix( mul( .5, add( feedbackMix2, feedbackMix4 ) ), ssdRight.out, damp3 )
 
// record left and right output to use in next sample
ssdLeft.in( left )
ssdRight.in( right )
 
// limit output to {-1,1}
limitL = clamp( left, -1,1 )
limitR = clamp( right, -1,1 )
  
// play stereo out & print callback to console for potential debugging
cb = play( [ limitL, limitR ], true )
 
gui = new dat.GUI({ width:400 })
gui.add( cb, 'damping',   0, 1 )
gui.add( cb, 'damping2',  0, 1 )
gui.add( cb, 'damping3',  0, 1 )
gui.add( cb, 'delayTime', 64, 4096 )
gui.add( cb, 'feedbackRouter', 0,3 ).step(1)
  
})
