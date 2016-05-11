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

###gen.getInputs###

**ugen** &nbsp;  *object* &nbsp; A genish.js unit generator.

This method looks at the argument ugen and, assuming it has dependencies, calls their codegen methods so that their code is added to the final output function. It is only used internally during calls to `gen.createCallback()`. The basic codegen process is calling `getInputs` recursively until the entire graph has been resolved.

```js
out = gen.createCallback( add(5,3) )
out() // 8

out = gen.createCallback( [ accum(.1), accum(.2) ] )
out() // [  0,  0 ]
out() // [ .1, .2 ]
out() // [ .2, .4 ]
out() // [ .3, .6 ] etc...
```


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

Data objects serve as containers for storing numbers; these numbers can be read using calls to `peek()` and the data object can be written to using calls to `poke()`. The constructor can be called with three different argumensts. If a *dataArray* is passed as the first argument, this array becomes the data object's underlying data source. If a *dataLength* integer is passed, a Float32Array is created using the provided length. If a *audioFileToLoad* string is passed, the data object attempts to load the file at the provided URL and generates a JavaScript Promise that used with the `then()` method.

####Methods####
###data.then( callback )###
When the `data` constructor is called passing in the path of a file to load, a JavaScript Promise is created that will be resovled when the audiofile has been loaded. `then()` provides a callback function to be executed when resolution is complete. You can use this to delay starting playback of a graph until all data dependencies have been loaded.

```javascript
audiofile = data( 'myaudiofile.wav' ).then( ()=> {
  out = gen.createCallback( peek( audiofile, phasor(.1) ) )
})
```

peek
---
**dataUgen** &nbsp;  *data* &nbsp; A `data` ugen to read values from.  
**index** &nbsp; *integer* &nbsp; The index to be read.  
**properties** &nbsp; *object* &nbsp; A dictionary of optional parameters to assign to the peek object, discussed under Properties.

Peek reads from an input data object. It can index the data object using on of two *modes*. If the *mode* property is set to *samples* than index provides an integer index to lookup in the data object. If the *mode* property is set to *phase* then the index should be a signal in the range of {0,1}.

```js
// create a sliding, interpolated frequency signal running between four values
d = data( [440,880,220,1320] )
p = peek( d, phasor(.1) )
c = cycle( p ) // feed sine osc frequency with signal
```
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
**delayTime** &nbsp;  *number* &nbsp; The amount of time to delay the incoming signal.  
**properties** &nbsp; *object* &nbsp; A dictionary of properties to assign to the ugen; see below.

Creates a delay line that delays an input signal by an argument number of samples.

####Properties####
###delay.size###
*number* (default 512) determines the length of the delay line.
###delay.interp###
*interp* (default 'linear') Set the interpolation used to access non-integer indices in the delay line. Currently can be 'linear' or 'none'.


history
----
History is used to create single-sample delays and feedback. It records one sample at a time of a ugen passed to its `in()` method, and then outputs the last recorded sample via its `.out` property. Single-sample delays are one of the justifications for the existence of genish.js; this is an important ugen.

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

####Properties####
###history.out###
 *ugen* The `out` property returns a simple ugen that outputs the last recorded sample of the history object.

####Methods####
###history.in###
**ugen** &nbsp;  *ugen* &nbsp; A genish.js unit generator (or graph) to be recorded.

# Filter

dcblock
----
**a** &nbsp;  *ugen*  Signal.

`dcblock()` remove DC offset from an input signal using a one-pole high-pass filter. 

slide
----
**a** &nbsp;  *ugen*  Signal.
**time** &nbsp; *integer* Length of slide in samples.

`slide()` is a logarithmically scaled low-pass filter to smooth discontinuities between values. It is especially useful to make continuous transitions from discrete events; for example, sliding from one note frequency to the next. The second argument to `slide` determines the length, in samples, of transitions.

# Integrator

accum
----
**increment** &nbsp; *ugen* or *number*  (default = 1) The amount to increase the accumulator's internal value by on each sample  
**reset**  &nbsp; *ugen* or *number* (default = 0) When `reset` has a value of 1, the accumulator will reset its internal value to 0.  
**properties** &nbsp; *object*  An optional dictionary containing a `max` value that the `accum` increments to before wrapping, and a `min` value that the `accum` wraps to after reaching/passing its max. An `initialValue` for the `accum` can also be provided; if it is not given the initial value is assumed to be the same as its `min`.  

`accum()` is used to increment a stored value between a provided range that defaults to {0,1}. If the accumulator values passes its maximum, it wraps. `accum()` is very similar to the `counter` ugen, but is slightly more efficient. Additionally, the `min` and `max` properties of `accum` are fixed values, while they can be specified with signals in `counter`.

counter
----
**increment** &nbsp; *ugen* or *number*  (default = 1) The amount to increase the counter's internal value by on each sample  
**min** &nbsp; *ugen* or *number* (default = 0) The minimum value of the accumulator  
**max** &nbsp; *ugen* or *number* (default = 1) The maximum value of the accumulator  
**reset**  &nbsp; *ugen* or *number* (default = 0) When `reset` has a value of 1, the counter will reset its internal value to 0.  
**properties** &nbsp; *object*  An optional dictionary containing a `max` value that the `accum` increments to before wrapping, and a `min` value that the `accum` wraps to after reaching/passing its max. An `initialValue` for the `accum` can also be provided; if it is not given the initial value is assumed to be the same as its `min`.

`counter()` is used to increment a stored value between a provided range that defaults to {0,1}. If the counter's interval value passes either range boundary, it is wrapped. `counter()` is very similar to the `accum` ugen, but is slightly less efficient. Additionally, the `min` and `max` properties of `accum` are fixed values, while they can be specified with signals in `counter`, enabling mix/max to change over time.

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

gtp
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; Ugens or numbers. 

Returns `a` if `a` is greater than `b`, otherwise returns 0

ltp
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; Ugens or numbers. 

Returns `a` if `a` is less than `b`, otherwise returns 0

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
**control** &nbsp;  *ugen or number* &nbsp; Selects the output index that the input signal travels through.  
**input** &nbsp; *integer* &nbsp; Signal that is passed through one of various outlets.   
**properties** &nbsp; *object* &nbsp; A dictionary of optional parameters to assign to the gate object. The main property is `count` (default value 2) which determines the number of outputs a `gate` ugen possesses.

`gate()` routes signal from one of its outputs according to an input *control* signal, which defines an index for output. The various outputs are all stored in the `mygate.outputs` array. The code example to the right shows a signal alternating between left and right channels using the `gate` ugen.
 
####Properties####
**outputs** *string* : An array of outputs that can be used as inputs to other ugens.

```js
inputSignal = mul( phasor(330, .1) )
controlSignal = gt( phasor(2), .5 )

g = gate( gt( controlSignal, inputSignal, { count:4 })

gen.createCallback([ g.outputs[0], g.outputs[1] ]) 
```

selector
----
**control** &nbsp; *ugen or number* &nbsp; Determines which input signal is passed to the ugen's output.  
**...inputs** &nbsp; *ugens or numbers* &nbsp; After the `control` input, an arbitrary number of inputs can be passed to the selector constructor.

Selector is basically the same as `switch()` but allows you to have an arbitrary number of inputs to choose between.

switch
----
**control** &nbsp; *ugen or number* &nbsp; When `control` === 1, output `a`; else output `b`.  
**a** &nbsp; *integer* &nbsp; Signal that is available to output.  
**b** &nbsp; *integer* &nbsp; Signal that is available to ouput.

A control input determines which of two additional inputs is passed to the output.  

# Waveforms

cycle
----
**a** &nbsp;  *ugen* or *number* &nbsp; Frequency. 

Cycle creates a sine oscillator running at a provided frequency. The oscillator runs via an interpolated wavetable lookup.

noise
----
Noise outputs a pseudo-random signal between {0,1}. The signal is generated via Javascript's `Math.random()` function.

phasor
-----
**frequency** &nbsp;  *ugen* or *number* &nbsp; Frequency.

A phasor accumulates phase, as determined by its frequency, and wraps between 0 and 1. This creates a sawtooth wave, but with a dc offset of 1 (no negative numbers). If a range of {-1,1} is needed you can use an `accum()` object with the increment `1/gen.samplerate * frequency` and the desired min/max properties.

train
-----
**frequency** &nbsp;  *ugen* or *number* &nbsp; Frequency.  
**pulsewidth** &nbsp;  *ugen* or *number* &nbsp;(default .5) Pulsewidth. A pulsewidth of .5 means the oscillator will spend 50% of its time outputting 1 and 50% of its time outputting 0. A pulsewidth of .2 means the oscillator spends 20% of its time outputting 1 and 80% outputting 0.  
 
`train()` creates a pulse train driven by an input frequency signal and input pulsewidth signal. The pulse train is created using the genish expression displayed at right.

```javascript
pulseTrain = lt( accum( div( inputFrequency, sampleRate ) ), inputPulsewidth )
``` 
