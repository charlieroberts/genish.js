const memo = function( obj ) {
  obj.__shouldMemo =  true

  return obj
}

export default memo
