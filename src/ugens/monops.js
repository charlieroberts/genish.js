let gen

// use arrays for times when gen name is different from wat name
// TODO: why is eq / neq in both arithmetic and logic?
const callops = [ 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'tanh' ],
      nativeops = [ 'floor', 'ceil', 'abs', ['round', 'nearest'] ],
      monops = {}

const allops = callops.concat( nativeops )

for( let __op of allops ) {
  const changeName = Array.isArray( __op )
  const op = changeName ? __op[ 1 ] : __op
  monops[ changeName ? __op[0] : __op ] = function( obj, offset=0 ) {
    let memlength = 4,
        input_compiled

    obj.__flags = [ isNaN( obj[0] ) ]

    let string = ''
    if( obj.__flags[0] ) {
      input_compiled = gen.compile( obj[0] )//, memlength + offset )
      memlength += input_compiled.memlength
      string = `${input_compiled.string}\n`
    }else{
      let value = obj[0]
      string = obj[0] === undefined ? '' : `f32.const ${value}\n`
    }

    if( callops.flat().indexOf( op ) !== -1 ) {
      string += `call $_${op}\n`
    }else{
      string += `f32.${op}\n`
    }

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

const monops_module = __gen => {
  gen = __gen
  return monops
}

export default monops_module
