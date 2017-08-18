/*
 * There are a variety of different ways to do enveloping using the ugens in genish.js.
 * There are two included envelopes found in typical synthesis algorithms ( ad() and adsr() )
 * but there are many other ways to envelope. In fact, it is important to note that both ad and
 * adsr are simple aggreates of other genish.js ugens; you could easily re-create them on your own.
 * 
 * This tutorial will attempt to look at some of the various options for enveloping in genish.js
 */

// First, we can create a ascending and descending ramps using accum(). The trick is to wrap the
// accum() in miggn() or max() so that they don't go below 0 (for decays) or above 1 (for attacks).
// We also need to set the shouldWrap property to be false. Below is a descending ramp, starting
// at 1 and traveling downward.
{
  'use jsdsp'

  trigger = bang()
  mydecay = max( accum( -2 / gen.samplerate, trigger, { shouldWrap:false, initialValue:1 }), 0 )

  play( cycle(330) * mydecay )
}

// re-trigger envelope
trigger.trigger()

/*
 * Part II: By using two of these together in an ifelse ugen, we can create a linear attack-decay. 
 * The code below is almost identical to the linear version of the ad() ugen.
 */

attackTrigger = bang()
decayTrigger  = bang()
attack = gen.samplerate * 2 // two seconds
decay  = gen.samplerate * 2 // two seconds

{
  'use jsdsp'
  // create the attack
  myattack = accum( 1 / attack, attackTrigger )
  // create the decay
  mydecay = accum( -1 / decay, decayTrigger, { initialValue:1 })
   
  // running phase accumulator to determine currnet envelope stage
  phase = accum( 1, attackTrigger, { shouldWrap:false } )
   
  myenv = ifelse(
    // attack... if phase is less than two seconds
    lt( phase, attack ), myattack,
   
    // else if envelope is still supposed to run, decay
    lt( phase, attack + decay ), mydecay,
    
    // else return 0
    0
  )
   
  play( cycle(330) * myenv * .25 )
}

// re-trigger envelope (run both lines at once)
attackTrigger.trigger()
decayTrigger.trigger()

/*
 * The envelope generated above can also be created simply using ad( 88200, 88200 ), but hopefully
 * the illustrating how the ad() ugen works will give you some ideas for your own envelopes. ad() and
 * adsr() also use exponential envelopes by default, so they work a little bit better perceptually (you
 * can change this by adding a { shape:'linear' } properties dictionary to either ugen).
 * Using the ifelse() ugen, we can make as many stages in our envelope as our heart desires. That's
 * basically how the adsr() works, simply extending our previous example with a couple of more stages.
 */

{
  'use jsdsp'
  
  osc = phasor(330)
  // attackTime, decayTime, sustainTime, sustainLevel, releaseTime
  env = adsr( gen.samplerate / 2, gen.samplerate / 2, gen.samplerate, .65, gen.samplerate )
 
  play( osc * env * .15 )
}

env.trigger()

/*
 * We can also specify that the release stage of our envelope should be triggered;
 * until the envelope will remain at the sustainLevel
 */

{
  'use jsdsp'
  osc = phasor(330)
  // attackTime, decayTime, sustainTime, sustainLevel, releaseTime
  env = adsr( gen.samplerate / 2, gen.samplerate / 2, gen.samplerate, .65, gen.samplerate, { triggerRelease:true })
 
  play( osc * env * .15 )
}

// release
env.release()

// re-trigger
env.trigger()

// see the adsr documentation for more details.
