/* Gigaverb
ported from Gen example by thecharlie 5/18/16

... and it's probably not quite right. */

signalData = data( './resources/audiofiles/dead-presidents.wav' ).then( ()=> {
  'use jsdsp'

  // parameters for external manipulation (via gui)
  let dry       = param( 'dry',     1   ), 
      roomSize  = param( 'roomSize',  75  ),    // .1 - 300
      bandwidth = param( 'inputBandwidth',  .5  ),// 0 - 1
      early     = param( 'earlyReflections',.25 ),// 0 - 1
      revtime   = param( 'reverbTime', 11  ),     // min 0.1 - Inf
      damping   = param( 'damping', .7  ),      // 0 - 1
      tail      = param( 'tailLevel',.25 ),       // 0 - 1 ggG
      spread    = param( 'spread',    23  ),      // 0 - 100
  
  in1 = peek( signalData, accum( 1,0, { max:signalData.buffer.length } ), { interp:'none', mode:'samples' } )
 
  attenuatedSignal = memo( in1 * .707 )
  
  // in1 * samplerate / 340
  roomSizeCoeff = memo( ( roomSize * gen.samplerate ) / 340  )
  
  // input damper
  damperHistory = ssd()
  damper = mix( attenuatedSignal, damperHistory.out, 1 - bandwidth )
  damperHistory.in( damper )
  
  prediffuseHistory = ssd()
  prediffuseTime  = roomSizeCoeff * .110732 
  prediffuseDelay = delay( prediffuseHistory.out, prediffuseTime, { size: 6000 })
  
  dampMinusDiffuse = damper - ( prediffuseDelay * .75 )
  prediffuseHistory.in( dampMinusDiffuse )
  
  prediffusePlusDamping = prediffuseDelay + dampMinusDiffuse * .75
  
  tap1Time = memo( ( roomSizeCoeff * .41  ) + 5 ) 
  tap2Time = memo( ( roomSizeCoeff * .3   ) + 5 ) 
  tap3Time = memo( ( roomSizeCoeff * .155 ) + 5 ) 
  tap4Time = roomSizeCoeff + 5
  
  multitap = delay( 
    prediffusePlusDamping, 
    [tap1Time, tap2Time, tap3Time, tap4Time],
    { size: 48000, interp:'linear' }
  )
  
  // pow( pow( 10,-60/20 ), 1. / ( in1*samplerate ) )
  revtimeCoeff = memo( ( 10 ^ -3 ) ^ ( 1 / ( revtime * gen.samplerate) ) )
  
  taps = [
    memo( early * ( multitap.outputs[0] * ( revtimeCoeff ^ tap1Time ) ) ),
    memo( early * ( multitap.outputs[1] * ( revtimeCoeff ^ tap2Time ) ) ),
    memo( early * ( multitap.outputs[2] * ( revtimeCoeff ^ tap3Time ) ) ),
    memo( early * ( multitap.outputs[3] * ( revtimeCoeff ^ tap4Time ) ) )
  ]
  
  tapsL = taps[0] + taps[2]
  tapsR = taps[1] + taps[3]
  tapOutput = tapsL - tapsR
  //play( tapOutput )  })
  // ************* Feedback Delay Network *************
  fdnCoeffs = [ 1, .81649, .7071, .63245 ]
  delayLines = []
  
  for( let i = 0; i < 4; i++ ) {
    let dlHistory, delayTimeCoeff, dl, feedbackInput, feedbackHistory, feedbackMix,
        terminal, output
    
    dlHistory = ssd()
    delayTimeCoeff = memo( roomSizeCoeff * fdnCoeffs[i] )
    dl = delay( dlHistory.out, delayTimeCoeff, { size:48000 } )
    
    feedbackInput = dl * ( -1 * ( revtimeCoeff ^ delayTimeCoeff) )
    feedbackHistory = ssd(),
    feedbackMix = mix( feedbackInput, feedbackHistory.out, damping )
    feedbackHistory.in( feedbackMix )
 
    terminal = i < 2 ? sub() : add()
    
    output = i !== 2 ? terminal * .5 : ( 0 - terminal ) * .5
      
    dlHistory.in( output + taps[i] )
    
    delayLines.push({ terminal, output, feedbackMix })
  }
  
  // *************** hook the network up *****************
  delayLines[0].positive = delayLines[0].feedbackMix + delayLines[1].feedbackMix
  delayLines[0].negative = delayLines[0].feedbackMix - delayLines[1].feedbackMix
  // must wait for delay line 2 to connect terminal
  
  delayLines[1].terminal.inputs[0] = delayLines[0].negative
  // STILL MUST DO OTHER INPUT TO DL[2].NEGATIVE
  
  delayLines[2].positive = delayLines[2].feedbackMix + delayLines[3].feedbackMix
  delayLines[2].negative = delayLines[2].feedbackMix - delayLines[3].feedbackMix
  delayLines[2].terminal.inputs = [ delayLines[0].negative, delayLines[2].negative ]
 
  delayLines[0].terminal.inputs = [ delayLines[0].positive, delayLines[2].positive ]
 
  // now that delayLine[2] has been made, connect delayLine[1] to it
  delayLines[1].terminal.inputs[1] = delayLines[2].negative
  
  delayLines[3].terminal.inputs = [ delayLines[2].positive, delayLines[0].positive ]
 
  fdnL = ( delayLines[0].output * tail ) + ( delayLines[2].output * tail )
  fdnR = ( delayLines[1].output * tail ) + ( delayLines[3].output * tail )
  fdnOut = fdnL - fdnR
  
  fdnPlusDiffuse = fdnOut + tapOutput
  
  diffusionRoomSizeCoeff = memo( floor( roomSizeCoeff * .000527 ) )
  
  leftDiffusionHead  = in1 + fdnPlusDiffuse
  rightDiffusionHead = in1 + fdnPlusDiffuse
  
  chain1Head = memo( .125541 * spread  )
  delayOffset1 = 159 + chain1Head
  diff1History = ssd()
  delay1 = delay( diff1History.out, delayOffset1 * diffusionRoomSizeCoeff, { size: 5000 } )
  diff1 = leftDiffusionHead - ( delay1 * .75 )
  diff1History.in( diff1 )
  chain1Out = ( diff1 * .75 ) + delay1
  
  chain2Head = memo( .376623 * spread  )
  delayOffset2 = 931 + chain2Head
  delayOffset2_a = delayOffset2 - ( chain1Head + 369 )
  delayOffset2_b = 1341 - delayOffset2
  diff2History = ssd()
  delay2 = delay( diff2History.out, delayOffset2_a * diffusionRoomSizeCoeff, { size: 15000 } )
  diff2 =  chain1Out - ( delay2 *.625 )
  diff2History.in( diff2 )
  chain2Out = ( diff2 * .625 ) + delay2
  
  delayOffset3 = delayOffset2_b * diffusionRoomSizeCoeff
  diff3History = ssd()
  delay3 = delay( diff3History.out, delayOffset3, { size: 10000 } )
  diff3 = chain2Out - ( delay3 * .625 )
  diff3History.in( diff3 )
  chain3Out = ( diff3 * .625 ) + delay3
  
  chain1RHead = memo( -.568366 * spread  )
  delayOffset1R = 159 + chain1RHead
  diff1RHistory = ssd()
  delay1R = delay( diff1RHistory.out, delayOffset1R * diffusionRoomSizeCoeff, { size: 7000 } )
  diff1R =  leftDiffusionHead - ( delay1R * .75 )
  diff1RHistory.in( diff1R )
  chain1ROut = ( diff1R * .75 ) + delay1R
  
  chain2RHead = memo( -.380445 * spread )
  delayOffset2R = 931 + chain2RHead
  delayOffset2R_a = delayOffset2R - ( chain1RHead + 369 )
  delayOffset2R_b = 1341 - delayOffset2R
  diff2RHistory = ssd()
  delay2R = delay( diff2RHistory.out, delayOffset2R_a * diffusionRoomSizeCoeff , { size: 16000 } )
  diff2R = chain1ROut - ( delay2R * .625 )
  diff2RHistory.in( diff2R )
  chain2ROut = ( diff2R * .625 ) + delay2R
  
  delayOffset3R = delayOffset2R_b * diffusionRoomSizeCoeff
  diff3RHistory = ssd()
  delay3R = delay( diff3RHistory.out, delayOffset3R, { size: 12000 } )
  diff3R = chain2ROut - ( delay3R * .625 )
  diff3RHistory.in( diff3R )
  chain3ROut = ( diff3R * .625 ) + delay3R
  
  chainL = chain3Out  + in1 * dry
  chainR = chain3ROut + in1 * dry
  
  cb = play( [chainL, chainR] ) 
  
  gui = new dat.GUI()
  gui.add( cb, 'roomSize', .1, 300 )
  gui.add( cb, 'reverbTime',  .1, 1000 )
  gui.add( cb, 'spread',    0, 100 )
  gui.add( cb, 'inputBandwidth', 0, 1 )
  gui.add( cb, 'damping',   0, 1 )
  gui.add( cb, 'dry',       0, 1 )
  gui.add( cb, 'earlyReflections',     0, 1 )
  gui.add( cb, 'tailLevel',      0, 1 )  
})

