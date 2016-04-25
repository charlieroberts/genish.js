let gen  = require('./gen.js')

let proto = {
  basename:'data',

  gen() {
    let genName = 'gen.data.' + this.name

    return genName
  },
}

module.exports = ( username, dim=512, channels=1 ) => {
  let ugen = new Float32Array( 512 ) // Object.create( proto )

  Object.assign( ugen, { 
    username,
    dim,
    channels,
    inputs:     null,
    properties: null,
    gen:        proto.gen
  })
  
  ugen.name = username

  gen.data[ ugen.name ] = ugen
  
  return ugen
}
