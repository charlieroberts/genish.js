let gen  = require('./gen.js')

let proto = {
  basename:'data',

  gen() {
    return 'gen.data.' + this.name
  },
}

module.exports = ( username, dim=512, channels=1 ) => {
  let ugen = new Float32Array( dim )

  Object.assign( ugen, { 
    username,
    dim,
    channels,
    gen:        proto.gen
  })
  
  ugen.name = username

  gen.data[ ugen.name ] = ugen
  
  return ugen
}
