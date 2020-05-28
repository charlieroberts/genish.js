/**********************************************
****** Comb Filter (filtered-feedback) ********
***********************************************

A comb filter plays sums an input signal with a delayed version of
itself, creating 'notches' in the resulting frequency response. A common 
DSP technique is to introduce a lowpass filtering stage into the feedback
loop for feedback dampening, which is what this demo implements. 
The Filtered-Feedback Comb Filter has many applications in both artificial
reverberation and physical modeling. For more information see:

https://ccrma.stanford.edu/~jos/pasp/Filtered_Feedback_Comb_Filters.html

*/

// for each example, load the amen break first and then create our
// graph. We need to know the length of the file before we cna set
// all our parameters
data( './resources/audiofiles/amen.wav' ).then( amenData => {
 
  // comb filter parameters
  combLength = 1200
  feedbackCoeff = param( 'feedback', .84 )
  damping = param( 'damping', .2 )
 
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
    gui.add( cb, 'damping', 0,.995 )
    gui.add( cb, 'feedback', 0,.995 )
  })
  
})
