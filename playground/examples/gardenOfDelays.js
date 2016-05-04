
/* garden of earthly delays (patch 1)
 *
 * original gen~ patch by Gregory Taylor
 * https://cycling74.com/2011/11/07/gen-tutorial-1-the-garden-of-earthly-delays/
 *
 * adapted to genish.js by thecharlie 5/2/2016
 *
 */
 
// passing string to data loads resource via xmlhttprequest.
// run rest of script once the audiofile has loaded
audiofile = data( './resources/audiofiles/dead-presidents.wav' ).then( ()=> {
// 'ssd', or single-sample delay,  is pseudonym for gen~ history, since history
//  is a default property of the window object in the browser...
feedback1 = ssd()
feedback2 = ssd()
 
// delay times... currently must be integer :(
feedbackPeriod = 4096
feedbackPeriod2 = feedbackPeriod / 2  // must be integer! todo fix
 
damp   = prop( 'damping', .5 )//abs( cycle(.05) ) 	// feedback damping
wetdry = prop( 'wetdry', .5 )//cycle(.25)			    // mix between raw input and delays
 
// read through audiofile sample by sample
in1 = peek( 
  audiofile, // data
  accum( 1,0,{ max:audiofile.buffer.length } ), // indexing
  { interp:'none', mode:'samples' } 			// attributes
)
 
// inlets and feedbacks feed our delays
delay1 = delay( add( feedback1, in1), feedbackPeriod,  { size: 44100 })
delay2 = delay( add( feedback2, in1), feedbackPeriod2, { size: 44100 })
 
// delays are folded
foldedDelay1 = fold( delay1, -1,1 )
foldedDelay2 = fold( delay2, -1,1 )
 
// damp feedback with folded delays
feedbackMix1 = mix( foldedDelay1, feedback1, damp )
feedbackMix2 = mix( foldedDelay2, feedback2, damp )
 
// mix inlets and damped feedback / folded delay output
// and record feedback mixes into histories for next sample calculation
outL = mix( in1, feedback1.record( feedbackMix1 ), wetdry )
outR = mix( in1, feedback2.record( feedbackMix2 ), wetdry )
  
// limit output to {-1,1}
limitL = clamp( outL, -1,1 )
limitR = clamp( outR, -1,1 )
  
// play stereo out & print callback to console for potential debugging
cb = play( [ outL, outR ], true )
 
gui = new dat.GUI()
gui.add( cb, 'damping', 0, 1 )
gui.add( cb, 'wetdry',  0, 1 )
 
})


