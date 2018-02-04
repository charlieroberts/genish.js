/************** Gigaverb **************
ported from gen~ example by thechalrie 5/18/16

... and it's probably not quite right. */

signalData = data( './resources/audiofiles/dead-presidents.wav' ).then( ()=> {
  // parameters for external manipulation (via gui)
  let dry 		= param( 'dry',		1, 0, 1 ), 
      roomSize  = param( 'roomSize',  75, .1, 300  ),
      bandwidth = param( 'inputBandwidth',  .5, 0, 1 ),
      early 	= param( 'earlyReflections',.25,0, 1 ),
      revtime 	= param( 'reverbTime', 11, .1, 10000 ),
      damping 	= param( 'damping', .7, 0, 1  ),
      tail 		= param( 'tailLevel',.25, 0, 1 ),
      spread    = param( 'spread',    23, 0, 100  ),
  
  in1 = peek( signalData, accum( 1,0, { max:signalData.buffer.length } ), { interp:'none', mode:'samples' } )
 
  attenuatedSignal = memo( mul( in1, .707 ) )
  
  // in1 * samplerate / 340
  roomSizeCoeff = memo( div( mul( roomSize, gen.samplerate ), 340 ) )
  
  // input damper
  damperHistory = ssd()
  damper = mix( attenuatedSignal, damperHistory.out, sub( 1, bandwidth ) )
  damperHistory.in( damper )
  
  prediffuseHistory = ssd()
  prediffuseTime  = mul( roomSizeCoeff, .110732 )
  prediffuseDelay = delay( prediffuseHistory.out, prediffuseTime, { size: 6000 })
  
  dampMinusDiffuse = sub( damper, mul( prediffuseDelay, .75 ) )
  prediffuseHistory.in( dampMinusDiffuse )
  
  prediffusePlusDamping = add( prediffuseDelay, mul( dampMinusDiffuse, .75 ) )
  
  tap1Time = memo( add( mul( roomSizeCoeff, .41 ), 5 ) )
  tap2Time = memo( add( mul( roomSizeCoeff, .3 ), 5 ) )
  tap3Time = memo( add( mul( roomSizeCoeff, .155 ), 5 ) )
  tap4Time = add( roomSizeCoeff, 5 )
  multitap = delay( 
    prediffusePlusDamping, 
   	[tap1Time, tap2Time, tap3Time, tap4Time],
    { size: 48000, interp:'linear' }
  )
  
  // pow( pow( 10,-60/20 ), 1. / ( in1*samplerate ) )
  revtimeCoeff = memo( pow( pow( 10,-60/20 ), div(1., mul( revtime, gen.samplerate) ) ) )
  
  taps = [
    memo( mul( early, mul( multitap.outputs[0], pow( revtimeCoeff, tap1Time ) ) ) ),
    memo( mul( early, mul( multitap.outputs[1], pow( revtimeCoeff, tap2Time ) ) ) ),
    memo( mul( early, mul( multitap.outputs[2], pow( revtimeCoeff, tap3Time ) ) ) ),
    memo( mul( early, mul( multitap.outputs[3], pow( revtimeCoeff, tap4Time ) ) ) )
  ]
  
  tapsL = add( taps[0], taps[2] )
  tapsR = add( taps[1], taps[3] )
  tapOutput = sub( tapsL, tapsR )
  //play( tapOutput )  })
  // ************* Feedback Delay Network *************
  fdnCoeffs = [ 1, .81649, .7071, .63245 ]
  delayLines = []
  
  for( let i = 0; i < 4; i++ ) {
    let dlHistory, delayTimeCoeff, dl, feedbackInput, feedbackHistory, feedbackMix,
        terminal, output
    
    dlHistory = ssd()
    delayTimeCoeff = memo( mul( roomSizeCoeff, fdnCoeffs[i] ) )
    dl = delay( dlHistory.out, delayTimeCoeff, { size:48000 } )
    
    feedbackInput = mul( dl, mul( -1, pow( revtimeCoeff, delayTimeCoeff) ) )
    feedbackHistory = ssd(),
    feedbackMix = mix( feedbackInput, feedbackHistory.out, damping )
    feedbackHistory.in( feedbackMix )
 
	terminal = i < 2 ? sub() : add()
    
    output = i !== 2 ? mul( terminal, .5 ) : mul( sub( 0, terminal ), .5 )
      
  	dlHistory.in( add( output, taps[i] ) )
    
	delayLines.push({ terminal, output, feedbackMix })
  }
  
  // *************** hook the network up *****************
  delayLines[0].positive = add( delayLines[0].feedbackMix, delayLines[1].feedbackMix )
  delayLines[0].negative = sub( delayLines[0].feedbackMix, delayLines[1].feedbackMix )  
  // must wait for delay line 2 to connect terminal
  
  delayLines[1].terminal.inputs[0] = delayLines[0].negative
  // STILL MUST DO OTHER INPUT TO DL[2].NEGATIVE
  
  delayLines[2].positive = add( delayLines[2].feedbackMix, delayLines[3].feedbackMix )
  delayLines[2].negative = sub( delayLines[2].feedbackMix, delayLines[3].feedbackMix )  
  delayLines[2].terminal.inputs = [ delayLines[0].negative, delayLines[2].negative ]
 
  delayLines[0].terminal.inputs = [ delayLines[0].positive, delayLines[2].positive ]
 
  // now that delayLine[2] has been made, connect delayLine[1] to it
  delayLines[1].terminal.inputs[1] = delayLines[2].negative
  
  delayLines[3].terminal.inputs = [ delayLines[2].positive, delayLines[0].positive ]
 
  fdnL = add( mul( delayLines[0].output, tail ), mul( delayLines[2].output, tail ) )
  fdnR = add( mul( delayLines[1].output, tail ), mul( delayLines[3].output, tail ) )  
  fdnOut = sub( fdnL, fdnR )
  
  fdnPlusDiffuse = add( fdnOut, tapOutput )
  
  diffusionRoomSizeCoeff = memo( floor( mul( roomSizeCoeff, .000527 ) ) )
  
  leftDiffusionHead  = add( in1, fdnPlusDiffuse )
  rightDiffusionHead = add( in1, fdnPlusDiffuse )
  
  chain1Head = memo( mul( .125541, spread ) )
  delayOffset1 = add( 159, chain1Head )
  diff1History = ssd()
  delay1 = delay( diff1History.out, mul( delayOffset1, diffusionRoomSizeCoeff ), { size: 5000 } )
  diff1 = sub( leftDiffusionHead, mul( delay1, .75 ) )
  diff1History.in( diff1 )
  chain1Out = add( mul( diff1, .75 ), delay1 )
  
  chain2Head = memo( mul( .376623, spread ) )
  delayOffset2 = add( 931, chain2Head )
  delayOffset2_a = sub( delayOffset2, add( chain1Head, 369 ) )
  delayOffset2_b = sub( 1341, delayOffset2 )  
  diff2History = ssd()
  delay2 = delay( diff2History.out, mul( delayOffset2_a, diffusionRoomSizeCoeff ), { size: 15000 } )
  diff2 = sub( chain1Out, mul( delay2, .625 ) )
  diff2History.in( diff2 )
  chain2Out = add( mul( diff2, .625 ), delay2 )
  
  delayOffset3 = mul( delayOffset2_b, diffusionRoomSizeCoeff )
  diff3History = ssd()
  delay3 = delay( diff3History.out, delayOffset3, { size: 10000 } )
  diff3 = sub( chain2Out, mul( delay3, .625 ) )
  diff3History.in( diff3 )
  chain3Out = add( mul( diff3, .625 ), delay3 )
  
  chain1RHead = memo( mul( -.568366, spread ) )
  delayOffset1R = add( 159, chain1RHead )
  diff1RHistory = ssd()
  delay1R = delay( diff1RHistory.out, mul( delayOffset1R, diffusionRoomSizeCoeff ), { size: 7000 } )
  diff1R = sub( leftDiffusionHead, mul( delay1R, .75 ) )
  diff1RHistory.in( diff1R )
  chain1ROut = add( mul( diff1R, .75 ), delay1R )
  
  chain2RHead = memo( mul( -.380445, spread ) )
  delayOffset2R = add( 931, chain2RHead )
  delayOffset2R_a = sub( delayOffset2R, add( chain1RHead, 369 ) )
  delayOffset2R_b = sub( 1341, delayOffset2R )  
  diff2RHistory = ssd()
  delay2R = delay( diff2RHistory.out, mul( delayOffset2R_a, diffusionRoomSizeCoeff ), { size: 16000 } )
  diff2R = sub( chain1ROut, mul( delay2R, .625 ) )
  diff2RHistory.in( diff2R )
  chain2ROut = add( mul( diff2R, .625 ), delay2R )
  
  delayOffset3R = mul( delayOffset2R_b, diffusionRoomSizeCoeff )
  diff3RHistory = ssd()
  delay3R = delay( diff3RHistory.out, delayOffset3R, { size: 12000 } )
  diff3R = sub( chain2ROut, mul( delay3R, .625 ) )
  diff3RHistory.in( diff3R )
  chain3ROut = add( mul( diff3R, .625 ), delay3R )
  
  chainL = add( chain3Out,  mul( in1, dry ) )
  chainR = add( chain3ROut, mul( in1, dry ) )
  
  play( [chainL, chainR] ).then( node => { 
  
    gui = new dat.GUI()
    gui.add( node, 'roomSize', .1, 300 )
    gui.add( node, 'reverbTime',  .1, 10000 )
    gui.add( node, 'spread',    0, 100 )
    gui.add( node, 'inputBandwidth', 0, 1 )
    gui.add( node, 'damping',   0, 1 )
    gui.add( node, 'dry', 	    0, 1 )
    gui.add( node, 'earlyReflections',     0, 1 )
    gui.add( node, 'tailLevel',      0, 1 )  
  })
})
