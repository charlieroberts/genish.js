// There are a variety of different ways to do enveloping using the ugens in genish.js.
// There is a simple attack / decay envelope included (ad()) but there are many other 
// ways to envelope. In this demo we'll roughly re-create ad() to give you some ideas,
// and show a few other techniques.
 
// We'll start with a re-triggerable linear decay.

// bangs switch between 0 and 1 for a single sample
// whenever their .trigger() method is called 
trigger = bang()
 
// confusing, but first, create an accumulator that starts at 1 and
// rises inifinitely. then set it to have a
// maximum value of 1. We'll then subtract this from 1
// to create a decay whenever the accum drops to zero;
// any value above 1 will effectively be zero.
mydecay = min( 1, accum( 2 / 44100, trigger, 0, 9999999, 1 ) )
mydecay = sub( 1, mydecay )
// scale our decay a bit
mydecay = mul( mydecay, .1 )

play( mul( cycle(330), mydecay ) )

// trigger envelope
trigger.trigger()

// another strategy is to make an envelope of different values
// in a data object, and then walk through it with peek. this
// enables you to add as many stages to the envelope as you like.
// in the example below we create an attack-decay envelope fading
// to .2. We'll put our accumulator for the phase of the envelope
// inside a ltp (less-than-pass) ugen; this will only let the accum
// output through if its value is less than 1, otherwise it will output
// zeroes... effectively the envelope is closed. The increment for
// our accumulator controls the speed of the envelop.

env = data([0,.2,0])
trigger = bang()
envp = peek(env, ltp( accum(.00001, trigger, 0, 9999999, 1 ), 1) )
play( mul( cycle(330), envp ) )

// trigger envelope
trigger.trigger()

/************* Part II - attack + decay ************************/

// triggers for different envelope stages and overall phase
attackTrigger = bang()
decayTrigger  = bang()
phaseTrigger  = bang()

// attack/decay times
attack = 44100 * 2 // two seconds ish
decay  = 44100 * 2 
 
// create the attack. no need to clamp as it
// will not be used accept during the attack stage
// when it will be in the appropriate range
myattack = accum( 1 / attack, attackTrigger )
// create the decay, clamp to min as the decay value
// will be the default.
mydecay  = min( 1, accum( 1 / decay, decayTrigger, 0, 999999999, 1 ) )
mydecay  = sub( 1, mydecay )
 
// running phase accumulator to determine currnet envelope stage
phase = accum( 1, phaseTrigger, 0, 99999999, attack )
 
// with ifelse2, the ugens only run if they are selected
// by the condition. below, the myattack ugen only runs
// when the phase is less than our attack value, while
// mydecay only runs if the phase is greater than the
// attack value. ifelse2, in contrast, always runs both
// stages, which can be useful in certain situations.
myenv = ifelse2(
  // attack... if phase is less than attack
  lte( phase, attack ), 
  myattack,
  // else decay, which clamps at zero
  mydecay
)
 
play( mul( .1, mul( cycle(330), myenv ) ), true )

// re-trigger envelopes (run all three lines at once)
attackTrigger.trigger()
decayTrigger.trigger()
phaseTrigger.trigger()

// The envelope generated above can also be created simply using ad( 88200, 88200 ), but hopefully
// illustrating how the ad() ugen works will give you some ideas for your own envelopes. ad() 
// also uses exponential envelopes by default, so they work a little bit better perceptually.
