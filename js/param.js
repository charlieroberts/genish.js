let gen = require('./gen.js')

let proto = {
  basename:'p',

  gen() {
    if( gen.memo[ this.name ] ) return gen.memo[ this.name ]
    
    gen.parameters.push( this.name )
    
    gen.memo[ this.name ] = this.name

    return this.name
  } 
}

module.exports = () => {
  let param = Object.create( proto )

  param.id   = gen.getUID()
  param.name = `${param.basename}${param.id}`

  return param
}
