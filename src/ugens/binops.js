let gen

const opcategories = {
        arithmetic:[ 'add','sub','mul','div','min','max', 'eq', ['neq','ne'] ],
        logic : ['eq', ['neq','ne'], 'gt', ['gte','ge'], 'lt', ['lte','le'] ],
      },
      binops = {}


const blocks = {
  arithmetic( x_prop, y_prop, op ) {
    const out = `${x_prop}
${y_prop}
f32.${op}
` 
    return out  
  },
  
  logic( x_prop, y_prop, op ) {
    const out = `${x_prop}
${y_prop}
f32.${op}
f32.convert_i32_u
` 
    return out  
  }
}

for( let optype in opcategories ) {
  const ops = opcategories[ optype ]
  for( let __op of ops ) {
    const changeName = Array.isArray( __op )
    const op = changeName ? __op[0] : __op
    binops[ op ] = function( obj, offset ) {
      let memlength = 2 * 4,
          x_compiled, 
          x_prop,
          y_compiled,
          y_prop
    
      if( obj.__flags[0] ) {
        x_compiled = gen.compile( obj[0], memlength + offset )
        memlength += x_compiled.memlength
        x_prop = `${x_compiled.string}`
      }else{
        x_prop = `f32.const ${obj[0]}`
      }
    
      if( obj.__flags[1] ) {
        y_compiled = gen.compile( obj[1], memlength + offset )
        memlength += y_compiled.memlength
        y_prop = `${y_compiled.string}`
      }else{
        y_prop = `f32.const ${obj[1]}`
      }
    
      const out = {
        memlength,
        string: blocks[ optype ]( x_prop, y_prop, changeName ? __op[1] : op )
      }
    
      return out
    }
  }
}

const binops_module = __gen => {
  gen = __gen
  return binops
}

export default binops_module