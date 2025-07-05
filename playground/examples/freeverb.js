/*************************************************************
****** Freeverb (reverb via comb and allpass filters) ********
**************************************************************

Freeverb is a (relatively) simple reverb model where 8 comb filters 
that run in parallel are summed and then fed through four allpass filters
in series.

See https://ccrma.stanford.edu/~jos/pasp/Freeverb.html for more info.
*/

// load sample, create reverb, combine reverb with sample playback
data( './resources/audiofiles/dead-presidents.wav' ).then( presidents => {
  signal = memo(peek( presidents, accum( 1,0, 0, presidents.length ), 'none', 'samples' ))
  verb   = reverb( signal, .95, .125, 1, 0 )
  play( add( signal, verb ) )
})

// creating comb filters
combFilter = function( _input, combLength, damping=.5*.4, feedbackCoeff=.84 ) {
  const input = _input
  	    lastSample = ssd(),
        // BE SURE TO MEMO ANY NUMBER USED MORE THAN ONCE
        // OR THE FUNCTION THAT GENERATES IT WILL BE CALLED
        // MULTIPLE TIMES
  	    readWriteIdx = memo( counter( 1,0,combLength ) ),
        combBuffer = data( combLength ),
	      out = peek( combBuffer, readWriteIdx, 'none', 'samples' ),
        storeInput = memo( add( mul( out, sub( 1, damping)), mul( lastSample.out, damping ) ) )
      
  lastSample.in( storeInput )
  poke( combBuffer, add( input, mul( storeInput, feedbackCoeff ) ), readWriteIdx )
 
  return out
}

// create allpass filters
allPass = function( input, length=500, feedback=.5 ) {
  const index  = memo( counter( 1,0, length ) ),
        buffer = data( length ),
        read   = memo( peek( buffer, index, 'none', 'samples' ) ),
        store  = add( input, mul( read, feedback ) ),
        out    = add( mul( -1, input ), read )
                
  poke( buffer, store, index )

  return out
}

// tuning settings for schroeder / moorer model
tuning = {
  combCount:      8,	
  combTuning:     [ 1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617 ],                    
  allPassCount:   4,
  allPassTuning:  [ 225, 556, 441, 341 ],
  allPassFeedback:0.5,
  fixedGain:      0.015,
  scaleDamping:   0.4,
  scaleRoom:      0.28,
  offsetRoom:     0.7,
}

reverb = (signal, roomSize, damping, wet, dry ) => {
  const attenuated = mul( signal, tuning.fixedGain )

  const combs = []
  for( let i = 0; i < 8; i++ ) { 
    combs.push( 
      combFilter( 
        attenuated, 
        tuning.combTuning[i], 
        mul(damping,.4), 
        mul( tuning.scaleRoom + tuning.offsetRoom, roomSize 
        ) 
      ) 
    )
  }
  
  // sum comb filters
  let summedcombs = combs[0]
  for( let i = 1; i < combs.length; i++ ) summedcombs = add( summedcombs, combs[i])

  // run comb filters through allpass filters in series
  let out = summedcombs
  for( let i = 0; i < 4; i++ ) out = allPass( out, tuning.allPassTuning[ i ] )
  
  // combine wet and dry signals
  out = add( mul(signal, .5), mul( out, .55 ) )
  return out
}
