gen
----
####Properties####
###gen.accum###
 *integer**<br> A number that is incremeneted everytime a ugen is created in order to provide a unique id.

###gen.debug###
 *boolean*<br> When this flag is set, all callbacks generated will be logged to the console.

###gen.closures###
 *Set*<br> Currently inappropriately named, this property contains key/value pairs which assign properties to the named, generated functions. These properties can the be called as methods or accessed more generally from within the generated callback.

###gen.histories###
 *Map*<br> Stores references to all single-sample delays, so that they can record their input at the end of generated callback functions.

###gen.memo###
 *object*<br> Once a ugen has generated it's associated output string, that string is placed in this object, assigned to key equalling the ugens unique id. Before asking any ugen to generate code, genish will check to see if there is already a memoized version stored in this object; if so, that will be used.

###gen.data###
 *object*<br> A general storage area that is accessible from within generated callbacks.

####Methods####
###gen.createCallback###

**graph** &nbsp;  *object* or *array* &nbsp; A genish.js unit generator to be compiled. If an array of two ugens is passed, the resulting function will output a stereo signal.

**debug** &nbsp;  *boolean* &nbsp; When set, print the string representation of the generated function to the console.

This will codegen a callback function for the ugen passed as the first argument. If that ugen is dependent on other ugens, these in turn will also be asked to codegen until the entire graph is contained within the output callback function. If the debug flag is set then the function body will be printed to the console.

```js
out = gen.createCallback( add(5,3) )
out() // 8

out = gen.createCallback( [ accum(.1), accum(.2) ] )
out() // [  0,  0 ]
out() // [ .1, .2 ]
out() // [ .2, .4 ]
out() // [ .3, .6 ] etc...
```

###gen.getInputs###

**ugen** &nbsp;  *object* &nbsp; A genish.js unit generator.

This method looks at the argument ugen and, assuming it has dependencies, calls their codegen methods so that their code is added to the final output function. It is only used internally during calls to `gen.createCallback()`. The basic codegen process is calling `getInputs` recursively until the entire graph has been resolved.


# Arithmetic

add
----
**args** &nbsp;  *ugens* or *numbers* &nbsp; The add unit generator accepts an unlimited number of ugens and numbers to sum.

```js
out = gen.createCallback( add(1,2) )
// creates function body out = ( 3 )

out() // 3
```

sub
----
**args** &nbsp;  *ugens* or *numbers* &nbsp; The sub unit generator accepts an unlimited number of ugens and numbers to subtract.

```js
out = gen.createCallback( sub( abs(.1),1,2 ) )
// creates function body out = ( .1 - 3 )

out() // -2.9
```

mul
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; Ugens or numbers to be added. 

Multiples two number or ugens together.

```js
out = gen.createCallback( mul( cos(0), 5 ) )
// creates function body out = ( gen.cos(0) * 5 )

out() // 5
```

div
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; Ugens or numbers. 

Divides ugen or number *a* by ugen or number *b*.

```js
out = gen.createCallback( div( cos(0), 2 ) )
// creates function body out = ( gen.cos(0) / 2 )

out() // .5
```

mod
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; Ugens or numbers. 

Divides ugen or number *a* by ugen or number *b* and returns the remainder.

```js
out = gen.createCallback( mod( cos(0), .51 ) )
// creates function body out = ( gen.cos(0) % .51 )

out() // .49
```

# Buffer

cycle
----
**frequency** &nbsp;  *ugen* or *number* &nbsp; Ugen or number. 

Outputs a sine wave via wavetable lookup / interpolation. 

data
----
**dataArray** &nbsp;  *Array* &nbsp; A pre-defined array of numbers to use.   
**dataLength** &nbsp; *integer* &nbsp; The length of a new underlying array to be created.  
**audioFileToLoad** &nbsp; *string* &nbsp; A path to an audiofile to load into the data's buffer object.

```javascript
audiofile = data( 'myaudiofile.wav' ).then( ()=> {
  out = gen.createCallback( peek( audiofile, phasor(.1) ) )
})
```

Data objects serve as containers for storing numbers; these numbers can be read using calls to `peek()` and the data object can be written to using calls to `poke()`. The constructor can be called with three different argumensts. If a *dataArray* is passed as the first argument, this array becomes the data object's underlying data source. If a *dataLength* integer is passed, a Float32Array is created using the provided length. If a *audioFileToLoad* string is passed, the data object attempts to load the file at the provided URL and generates a JavaScript Promise that used with the `then()` method.

####Methods####
###data.then( callback )###
When the `data` constructor is called passing in the path of a file to load, a JavaScript Promise is created that will be resovled when the audiofile has been loaded. `then()` provides a callback function to be executed when resolution is complete. You can use this to delay starting playback of a graph until all data dependencies have been loaded.

peek
---
**dataUgen** &nbsp;  *data* &nbsp; A `data` ugen to read values from.  
**index** &nbsp; *integer* &nbsp; The index to be read.  
**properties** &nbsp; *object* &nbsp; A dictionary of optional parameters to assign to the peek object, discussed under Properties.

```js
// create a sliding, interpolated frequency signal running between four values
d = data( [440,880,220,1320] )
p = peek( d, phasor(.1) )
c = cycle( p ) // feed sine osc frequency with signal
```

Peek reads from an input data object. It can index the data object using on of two *modes*. If the *mode* property is set to *samples* than index provides an integer index to lookup in the data object. If the *mode* property is set to *phase* then the index should be a signal in the range of {0,1}.

####Properties####
**mode** *string* : determines how indexing is performed. Options are 'phase' and 'samples'.  

**interp** *string* : determines what interpolation is used when performing the lookup. Options are 'linear' and 'none'

poke
---
**dataUgen** &nbsp;  *data* &nbsp; A `data` ugen to read values from.  
**value** &nbsp; *number* &nbsp; The number to write to the ugen's `data` property.
**index** &nbsp; *integer* &nbsp; The index to write to.

Poke writes values to a index on a `data` object.

# Feedback

delay
----
**in** &nbsp;  *ugen* or *number* &nbsp; The signal to be delayed.

Outputs a sine wave via wavetable lookup / interpolation.

history
----
History is used to create single-sample delays and feedback. It records one sample at a time of a ugen passed to its `in()` method, and then outputs the last recorded sample via its `.out` property. Single-sample delays are one of the justifications for the existence of genish.js; this is an important ugen.

####Properties####
###history.out###
 *ugen* The `out` property returns a simple ugen that outputs the last recorded sample of the history object.

####Methods####
###history.in###
**ugen** &nbsp;  *ugen* &nbsp; A genish.js unit generator (or graph) to be recorded.

```js
/* a randomly pitched oscillator and a delay line */
frequencyControl = sah( add( 220, mul( noise(),880 ) ), noise(), .99995 )

osc = mul( cycle( frequencyControl ), .025 )

feedback = ssd()

// feed feedback into our delay by inputting the feedback.out property
echo = delay( add( osc, feedback.out ), 11025, { size: 22050 } )

// record the output of the echo and our feedback using a call to feedback.in()
mixer = feedback.in( mix( echo, feedback.out, .925 ) )

gen.createCallback( mixer )
```

# Logic

not 
----
**a** &nbsp;  *ugen* or *number* Input signal
 
Converts signals to either 0 or 1. If the input signal does not equal 0 then output a 0; if input == 0 then output 1.

```javascript
y = x !== 0 ? 0 : 1
```

bool 
----
**a** &nbsp;  *ugen* or *number* Input signal
 
Converts signals to either 0 or 1. If the input signal does not equal 0 then output is 1; if input == 0 then output 0.

```javascript
y = x !== 0 ? 1 : 0
```

# Numeric 

round
----
**a** &nbsp;  *ugen* or *number*

Rounds input up or down to nearest integer using Javascript's `Math.round()` function

floor
----
**a** &nbsp;  *ugen* or *number*

Rounds input down to nearest integer by performing a bitwise or with 0.

```js
out = gen.createCallback( round( in() ) )
// creates function body: out = ( in1 | 0 )
```

ceil
----
**a** &nbsp;  *ugen* or *number*

Rounds input up to nearest integer using Javascript's `Math.ceil()` function

sign
----
**a** &nbsp;  *ugen* or *number*

Returns 1 for positive input and -1 for negative input. Zero returns itself. Uses JavaScript's `Math.sign()` function.

# Trigonometry

sin
----
**a** &nbsp;  *ugen* or *number*

Calculates the sine of the input (interepreted as radians) using Javascript's `Math.sin()` function

cos
----
**a** &nbsp;  *ugen* or *number*

Calculates the cosine of the input (interpreted as radians) using Javascript's `Math.cos()` function

tan
----
**a** &nbsp;  *ugen* or *number*

Calculates the tangent of the input (interpreted as radians) using Javascript's `Math.tan()` function

asin
----
**a** &nbsp;  *ugen* or *number*

Calculates the arcsine of the input in radians using Javascript's `Math.asin()` function

acos
----
**a** &nbsp;  *ugen* or *number*

Calculates the arccosine of the input in radians using Javascript's `Math.cos()` function

atan
----
**a** &nbsp;  *ugen* or *number*

Calculates the arctangent of the input in radians using Javascript's `Math.tan()` function

# Comparison

max
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; Ugens or numbers. 

Returns whichever value is greater.

min
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; Ugens or numbers. 

Returns whichever value is lesser.

gt
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; Ugens or numbers. 

Returns 1 if `a` is greater than `b`, otherwise returns 0

lt
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; Ugens or numbers. 

Returns 1 if `a` is less than `b`, otherwise returns 0

# Range

clamp
----
**a** &nbsp;  *ugen* or *number* &nbsp; Input signal to clamp.  
**min** &nbsp; *ugen* or *number* &nbsp; Signal or number that sets minimum of range to clamp input to.  
**max** &nbsp; *ugen* or *number* &nbsp; Signal or number that sets maximum of range to clamp input to.  

Clamp constricts an input `a` to a particular range. If input `a` exceeds the maximum, the maximum is returned. If input `b` is less than the minimum, the minimum is returned.

fold
----
**a** &nbsp;  *ugen* or *number*  : Input signal to fold.  
**min** &nbsp; *ugen* or *number* : Signal or number that sets minimum of range to fold input to.  
**max** &nbsp; *ugen* or *number* : Signal or number that sets maximum of range to fold input to.  

Fold constricts an input `a` to a particular range. Given a range of {0,1} and an input signal of {.8,.9,1,1.1,1.2}, fold will return {.8,.9,1,.9,.8}.

wrap
----
**a** &nbsp;  *ugen* or *number*  : Input signal to fold.  
**min** &nbsp; *ugen* or *number* : Signal or number that sets minimum of range to fold input to.  
**max** &nbsp; *ugen* or *number* : Signal or number that sets maximum of range to fold input to.  

Wrap constricts an input `a` to a particular range. Given a range of {0,1} and an input signal of {.8,.9,1,1.1,1.2}, fold will return {.8,.9,0,.1,.2}.

# Routing

gate
----
**control** &nbsp;  *data* &nbsp; Chooses the output index that the input signal travels through.  
**input** &nbsp; *integer* &nbsp; Signal that is passed through one of various outlets.   
**properties** &nbsp; *object* &nbsp; A dictionary of optional parameters to assign to the gate object. The main property is `count` (default value 2) which determines the number of outputs a `gate` ugen possesses.

```js
inputSignal = mul( phasor(330, .1) )
controlSignal = gt( phasor(2), .5 )

g = gate( gt( controlSignal, inputSignal, { count:4 })

gen.createCallback([ g.outputs[0], g.outputs[1] ]) 
```

`gate()` routes signal from one of its outputs according to an input *control* signal, which defines an index for output. The various outputs are all stored in the `mygate.outputs` array. The code example to the right shows a signal alternating between left and right channels using the `gate` ugen.
 
####Properties####
**outputs** *string* : An array of outputs that can be used as inputs to other ugens.

# Waveforms

cycle
----
**a** &nbsp;  *ugen* or *number* &nbsp; Frequency. 

Cycle creates a sine oscillator running at a provided frequency. The oscillator runs via an interpolated wavetable lookup.

noise
----
Noise outputs a pseudo-random signal between {0,1}. The signal is generated via Javascript's `Math.random()` function.

train
-----
**frequency** &nbsp;  *ugen* or *number* &nbsp; Frequency.  
**pulsewidth** &nbsp;  *ugen* or *number* &nbsp;(default .5) Pulsewidth. A pulsewidth of .5 means the oscillator will spend 50% of its time outputting 1 and 50% of its time outputting 0. A pulsewidth of .2 means the oscillator spends 20% of its time outputting 1 and 80% outputting 0.  
 
`train()` creates a pulse train driven by an input frequency signal and input pulsewidth signal. The pulse train is created using the genish expression displayed at right.

```javascript
pulseTrain = lt( accum( div( inputFrequency, sampleRate ) ), inputPulsewidth )
``` 
