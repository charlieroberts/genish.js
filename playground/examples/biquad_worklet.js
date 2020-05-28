/****************************
****** Bi-quad Filter *******
*****************************

ported and extended from the gen~ example by thecharlie, 5/10/2106

Demos a  multi-mode, 12 db per octave resonant filter. Note that
the code to actually create the callback that runs the filter is only 
the first 20 lines or so; everything else is the code to setup the GUI 
and calculate the filter coefficients.

For info on the bi-quad filter see: http://www.musicdsp.org/files/Audio-EQ-Cookbook.txt
*/

in1 = noise()
 
// store some samples...
x1 = ssd(); x2 = ssd(); y1 = ssd(); y2 = ssd();
 
pi = Math.PI
// define our coefficients
a0 = param( 'a0', .001453, -pi, pi ); 
a1 = param( 'a1', .002906, -pi, pi ); 
a2 = param( 'a2', .001453, -pi, pi );
b1 = param( 'b1', -1.888279, -pi, pi ); 
b2 = param( 'b2', .894091, -pi, pi );
 
/***** begin sample processing ******/
 
in1a0 = mul( x1.in( in1    ), a0 )
x1a1  = mul( x2.in( x1.out ), a1 )
x2a2  = mul( x2.out,          a2 )
 
sumLeft = add( in1a0, x1a1, x2a2 )
 
y1b1 = mul( y2.in( y1.out ), b1 )
y2b2 = mul( y2.out, b2 )
 
sumRight = add( y1b1, y2b2 )
 
diff = sub( sumLeft, sumRight )
 
y1.in( diff )
 
/****** end sample processsing ******/
 
play( diff, null, true ).then( node => {
  // setup an object to store our filter parmaeters for use with a GUI
  biquad = {
    frequency: 550,
    Q: .7,
    mode: 'LP'
  }

  // get coefficients and map them to the param() ugens we declared earlier
  changeCoeffs = () => {
    [ node.a0, node.a1, node.a2, node.b1, node.b2 ] = getCoeffs( biquad.frequency, biquad.Q, biquad.mode )
  }

  // create our GUI using dat.GUI
  gui = new dat.GUI({ width:500 })
  gui.add( biquad, 'frequency', 100, 10000 ).onChange( changeCoeffs )
  gui.add( biquad, 'Q', 0, 20 ).onChange( changeCoeffs )
  gui.add( biquad, 'mode', ['LP','BP','HP'] ).onChange( changeCoeffs )

})
 
// a function to generate coefficients based on cutoff, Q and filter mode
getCoeffs = ( cutoff=330, Q=.7, mode='LP' ) => {
  let c,a1,a2,b0,b1,b2,w0,sinw0,cosw0,alpha
  c = a1 = a2 = b0 = b1 = b2 = 0
   
  switch ( mode ) {
    case 'LP':
     w0 = 2 * Math.PI * cutoff / gen.samplerate,
     sinw0 = Math.sin( w0 ),
     cosw0 = Math.cos( w0 ),
     alpha = sinw0 / (2 * Q);
 
     a0 = (1 - cosw0) / 2,
     a1 = 1 - cosw0,
     a2 = a0,
     c  = 1 + alpha,
     b1 = -2 * cosw0,
     b2 = 1 - alpha
 
     break;
    case "HP":
     w0 = 2 * Math.PI * cutoff / gen.samplerate,
     sinw0 = Math.sin( w0 ),
     cosw0 = Math.cos( w0 ),
     alpha = sinw0 / (2 * Q)
       
     a0 = (1 + cosw0) / 2,
     a1 = -(1 + cosw0),
     a2 = a0,
     c  = 1 + alpha,
     b1 = -2 * cosw0,
     b2 = 1 - alpha;
     break;
   case "BP":
     w0 = 2 * Math.PI * cutoff / gen.samplerate
     cosw0  = Math.cos( w0 ),
     sinw0  = Math.sin( w0 ),
     alpha  = sinw0 / ( 2 * Q )
     
     a0 = Q * alpha,
     a1 = 0,
     a2 = -Q * alpha,
     c  = 1 + alpha,
     b1 = -2 * cosw0,
     b2 = 1 - alpha
     break;
   default:
     break;
  }
 
  a0 = a0 / c;
  a1 = a1 / c;
  a2 = a2 / c;
  b1 = b1 / c;
  b2 = b2 / c;
  
  return [ a0, a1, a2, b1, b2 ]
}
