amenData = data( './resources/audiofiles/amen.wav' ).then( ()=> {
  // comb filter parameters
  combLength = 1200
  feedbackCoeff = param( 'feedback', .84, 0, .995 )
  damping = param( 'damping', .2, 0, .995 )
 
  // read samples from our data buffer
  amenSignal = peek( amenData, accum( 1,0,{max:amenData.buffer.length} ), { interp:'none', mode:'samples' } )
 
  // where in our delayed signal we will read / write to
  readWriteIdx = counter( 1,0,combLength )
 
  // create our delay buffer
  combBuffer = data( combLength )
 
  // store the last sample for our lowpass filtering
  lastSample = ssd()
 
  // read from the delay buffer; this is our final output signal
  out = peek( combBuffer, readWriteIdx, { interp:'none', mode:'samples' })
 
  // for our lowpass flitering, combine the current sample and the last sample, with damping
  storeInput = add( mul( out, sub( 1, damping)), mul( lastSample.out, damping ) )
  lastSample.in( storeInput )
 
  // write sum of input signal and feedback signal to delay buffer 
  poke( combBuffer, add( amenSignal, mul( storeInput, feedbackCoeff ) ), readWriteIdx )
 
  play( out ).then( node => {
  
    gui = new dat.GUI()
    gui.add( node, 'damping', 0,.995 )
    gui.add( node, 'feedback', 0,.995 )
    
  })
  
})

