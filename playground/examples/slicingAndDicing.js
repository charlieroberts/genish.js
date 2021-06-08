/**********************************************
***** slicing and dicing the amen break *******
***********************************************

This demo provides an example of controlling how
different slices (sections) of the amen break are played back; it 
also provides control over playback speed. It divides the amen break
into 32 slices and randomly jumps from one to the next after the 
current slice reaches its end */


// for each example, load the amen break first and then create our
// graph. We need to know the length of the file before we cna set
// all our parameters
data( './resources/audiofiles/amen.wav' ).then( d => {
  
  // larger numSlices values result in smaller slices 
  numSlices = 32
 
  // measured in samples...
  sliceLength = d.length / numSlices
  
  // enable the 'speed' variable to be controlled externally, in this case by a GUI
  speed = param( 1.2 )
  
  // create a random signal between 0 and 31 (or whatever numSlices equals)
  random0_31 = floor( mul( noise(), numSlices ) ) 
  
  // count the number of samples played by the current slice. 
  sliceCounter = counter( speed, 0, sliceLength )
  
  // After each sample sample random signal to pick a new slice to play
  sliceNum = sah( random0_31, sliceCounter, sliceLength - 1 )
  
  // get starting position, in samples, of current slice
  start = mul( sliceNum, sliceLength )
 
  // get ending position of currentSlice
  end   = add( start, sliceLength )
  
  // add the current sliceCounter position to start to get the buffer index to read
  read = peek( d, add( start, sliceCounter ), 'linear', 'samples' )
  
  play( read )
})
