/**********************************************
***** slicing and dicing the amen break *******
***********************************************

This demo provides three different examples of controlling how
different slices (sections) of the amen break are played back; each
example also provides control over playback speed. In the first
example, users can define start and end points of a section to loop.
The second divides the amen break into 32 slices and then
randomly jumps from one to the next after the current slice reaches
its end. In the last example most of the programming is actually
to create the GUI, which lets users define the length of slices and
choose which slice is currently being looped. */


// for each example, load the amen break first and then create our
// graph. We need to know the length of the file before we cna set
// all our parameters
d = data( './resources/audiofiles/amen.wav' ).then( ()=> {
  
  start = param( 'start', 0 )
  end   = param( 'end', d.buffer.length - 1 )
  speed = param( 'speed', 1 )
 
  // counter() is very similar to accum(), but it wraps to both min and
  // max values, both of which can be signals. However, accum is slightly
  // more efficient than counter.
  count = counter( speed, start, end, 0 )
  
  // use our counter to loop through the slice
  cb = play( peek( d, count, {mode:'samples'} ), true )
  
  gui = new dat.GUI({ width: 400 })
  gui.add( cb, 'start', 0, d.buffer.length - 512 )
  gui.add( cb, 'end',   0, d.buffer.length - 1 )
  gui.add( cb, 'speed', -4, 4 )
})


// Example 2: randomly pick a new slice for playback whenever
// the current slice has finished playing.
d = data( './resources/audiofiles/amen.wav' ).then( ()=> {
  
  // larger numSlices values result in smaller slices 
  numSlices = 32
 
  // measured in samples...
  sliceLength = d.buffer.length / numSlices
  
  // enable the 'speed' variable to be controlled externally, in this case by a GUI
  speed = param( 'speed', 1.2 )
  
  // create a random signal between 0 and 31 (or whatever numSlices equals)
  random0_31 = floor( mul( noise(), numSlices ) ) 
  
  // count the number of samples played by the current slice. After each sample
  // random signal to generate a new sliceNum to hold and use
  sliceNum = sah( random0_31, counter( speed, 0, sliceLength ), sliceLength - 2 )
  
  // get starting position, in samples, of current slice
  start = mul( sliceNum, sliceLength )
 
  // get ending position of currentSlice
  end   = add( start, sliceLength )
 
  // create a counter that reads through the current slice.
  count = counter( speed, start, end )
  
  cb = play( peek( d, count, {mode:'samples'} ), true )
  
  gui = new dat.GUI({ width: 400 }) 
  gui.add( cb, 'speed', -4, 4 )
})

// Example 3: Create a GUI that enables users to define slice length and choose
// current slice that is playing.
d = data( './resources/audiofiles/amen.wav' ).then( ()=> {
  
  sliceLength = d.buffer.length / 32
  start = param( 'start', 0 )
  end   = param( 'end', sliceLength )
  speed = param( 'speed', 1 )
  count = counter( speed, start, end, 0 )
  cb = play( peek( d, count, {mode:'samples'} ), true )
 
  // everything else is to setup the GUI using dat.gui.js
  gui = new dat.GUI({ width: 400 })
  slices = { sliceNumber: 0, division:sliceLength }
 
  // define a dictionary of slice sizes to use. The amen break is four measures
  // in length, so one measure is a quarter of the buffer in size.
  sliceDict = {
    '1': 	d.buffer.length / 4,
    '1/2':	d.buffer.length / 8,
    '1/4':  d.buffer.length / 16,
    '1/8':  d.buffer.length / 32,
    '1/16': d.buffer.length / 64
  }
  
  slicenum = gui.add( slices, 'sliceNumber', 0, 31 ).step(1)
 
  // when we change the slice number, change the start and end parameters
  slicenum.onChange( v => {
    cb.start = v * sliceLength
    cb.end = cb.start + sliceLength
  })
  
  slicedivision = gui.add( slices, 'division', sliceDict )
  slicedivision.onChange( v => {
    sliceLength = parseFloat( v )
    
    maxSlices = d.buffer.length / sliceLength - 1
  	slicenum.max( maxSlices )
    
  	if( slices.sliceNumber >= maxSlices ) {
      slices.sliceNumber = maxSlices
      slicenum.updateDisplay()
    }
    
    cb.start = slices.sliceNumber * sliceLength
    cb.end = cb.start + sliceLength
  })
   
  gui.add( cb, 'speed', -4, 4 )
})
