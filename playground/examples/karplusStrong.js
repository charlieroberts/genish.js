noteon =param( 'noteon', 0 )
freq = param( 'frequency', 400 )
damp = param( 'damping', .75 )
decay= param( 'decay', .97 )
  
envelope = ltp( div( counter(1, 0, Infinity , noteon ), 441 ), 1 )
 
impulse = mul( noise(), envelope )
 
feedback = ssd()
 
d = delay( add( impulse, feedback.out ), div(44100,freq), { size:11025 } )
 
decayed = mul( d, t60( mul( decay, freq ) ) )
 
m = feedback.in( mix( decayed, feedback.out, damp ) )
 
cb = play( m )
 
interval = setInterval( ()=> {
  cb.frequency = Math.floor( 220 + Math.random() * 440 )
  cb.noteon = 1
  setTimeout( ()=> { cb.noteon = 0 }, 10 )
}, 125 )
 
gui = new dat.GUI()
gui.add( cb, 'damping', 0,1 )
gui.add( cb, 'decay', 0, 4 )


if( interval !== undefined ) clearInterval( interval )
