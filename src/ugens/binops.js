let gen

// use arrays for times when gen name is different from wat name
// TODO: why is eq / neq in both arithmetic and logic?
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
  
  // TODO: only difference is float conversion at end
  // this could be refactored
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
        x_compiled = gen.compile( obj[0] )//, memlength + offset )
        memlength += x_compiled.memlength
        x_prop = `${x_compiled.string}`
      }else{
        x_prop = `f32.const ${obj[0]}`
      }
    
      if( obj.__flags[1] ) {
        y_compiled = gen.compile( obj[1] ) //, memlength + offset )
        memlength += y_compiled.memlength
        y_prop = `${y_compiled.string}`
      }else{
        y_prop = `f32.const ${obj[1]}`
      }
      
      let string = blocks[ optype ]( x_prop, y_prop, changeName ? __op[1] : op )
      if( obj.__shouldMemo ) {
        const name = obj.__memoName 
        gen.addLocal(`(local $${name} f32)` )
        string += `local.tee $${name}\n`
      }

      const out = {
        memlength,
        string
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
