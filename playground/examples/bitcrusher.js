data( './resources/audiofiles/amen.wav' ).then( amen => {
  // we'll use a single-sample-delay to store a sample
  // which we'll output repeatedly, thus in effect decreasing the sample rate
  hold = ssd(0)
  
  // params are pointers to locations in memory. by changing the .value
  // property of a param, you change the number that it points to (see
  // end of this example).
  bitDepth   = param( 2 )
  sampleRate = param( .5 )
  
  // every time this counter wraps, we'll take a sample from the audiofile
  // so, if our sampleRate.value is 1, we'll take a new sample every sample. if
  // our sampleRate.value is .25, we'll take one every four samples etc.
  c = counter( sampleRate, 0, 1 )
 
  // read our audiofile
  audio = peek(
    amen, 
    // XXX not sure why I need a increment of .5 here and not 1? hmmmm.
    accum( .5, 0, 0, amen.length ), 
    'linear', 'samples'
  )
  
  // math for bitcrushing
  bitMult = pow( bitDepth, 2 )
  crushed = div( floor( mul( audio, bitMult ) ), bitMult )
  
  sample = ifelse2( 
    c.wrap,   // if our counter has wrapped...
    crushed,  // ... get a new bit-crushed sample to store
    hold.out  // ... otherwise, repeat the last stored sample
  )
  
  // store the current sample for repeating
  hold.in( sample )
  
  play( sample )
})


// experiment with different values after file is loaded/playing
bitDepth.value = 16
sampleRate.value = .05
