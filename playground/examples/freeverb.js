/*************************************************************
****** Freeverb (reverb via comb and allpass filters) ********
**************************************************************

ported from gibberish by thecharlie, 5/16/2016

Freeverb is a simple reverb model where 8 comb filters that run
in parallel are summed and then fed through four allpass filters
in series.

See https://ccrma.stanford.edu/~jos/pasp/Freeverb.html for more info.
*/

// define a convenience for creating combFilters; see the comb filter
// demo in this playground for more information
combFilter = function( _input, combLength, damping=.5*.4, feedbackCoeff=.84 ) {
  let lastSample = ssd(),
  	  readWriteIdx = counter( 1,0,combLength ),
      combBuffer = data( combLength ),
	  out = peek( combBuffer, readWriteIdx, { interp:'none', mode:'samples' }),
      storeInput = memo( add( mul( out, sub( 1, damping)), mul( lastSample.out, damping ) ) )
      
  lastSample.in( storeInput )
 
  poke( combBuffer, add( _input, mul( storeInput, feedbackCoeff ) ), readWriteIdx )
 
  return out
}

// constructor for schroeder allpass filters
allPass = function( _input, length=500, feedback=.5 ) {
  let index  = counter( 1,0,length ),
      buffer = data( length ),
      bufferSample = peek( buffer, index, { interp:'none', mode:'samples' }),
      out = memo( add( mul( -1, _input), bufferSample ) )
                
  poke( buffer, add( _input, mul( bufferSample, feedback ) ), index )
 
  return out
}

// tuning settings for schroeder / moorer model
tuning = {
  combCount:		8,
  combTuning: 		[ 1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617 ],                    
  allPassCount: 	4,
  allPassTuning:	[ 225, 556, 441, 341 ],
  allPassFeedback:  0.5,
  fixedGain: 		0.015,
  scaleDamping: 	0.4,
  scaleRoom: 		0.28,
  offsetRoom: 	    0.7,
}

combs = []

amenData = data( './resources/audiofiles/dead-presidents.wav' ).then( ()=> {
  // parameters for external manipulation (via gui)
  let wet = param( 'wet',.55 ), dry = param( 'dry',.5 ), 
      roomSize = param( 'roomSize',.84 ), damping = param( 'damping', .5 )
  
  amenSignal = peek( amenData, accum( 1,0, { max:amenData.buffer.length } ), { interp:'none', mode:'samples' } )

  attenuatedAmen = memo( mul( amenSignal, tuning.fixedGain ) )
  
  // create comb filters in parallel...
  for( let i = 0; i < 8; i++ ) { 
    combs.push( 
      combFilter( attenuatedAmen, tuning.combTuning[i], mul(damping,.4), mul( tuning.scaleRoom + tuning.offsetRoom, roomSize ) ) 
    )
  }
  
  // ... and sum them with attenuated input
  let out = add( attenuatedAmen, ...combs )
  
  // run through allpass filters in series
  for( let i = 0; i < 4; i++ ) out = allPass( out, tuning.allPassTuning[ 0 ] )
  
  // combine wet and dry signals
  out = add( mul( amenSignal, dry ), mul( out,  wet ) )
  
  cb = play( out, true )
  
  gui = new dat.GUI()
  gui.add( cb, 'roomSize', .5, 1 )
  gui.add( cb, 'damping',  .01, 1 ) 
  gui.add( cb, 'wet', .01, 1 )
  gui.add( cb, 'dry', .01, 1 )
  
})
