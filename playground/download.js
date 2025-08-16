import {
  //BlobReader,
  BlobWriter,
  TextReader,
  ZipWriter,
  HttpReader,
  Uint8ArrayReader
} from '@zip.js/zip.js'

const download = async function( name, memAmount=50 )  {
  const zipFileWriter = new BlobWriter()

  const wasmReader = new Uint8ArrayReader( node.buffer )
  //const watReader  = new TextReader( node.wat )
  
  const htmlReader = new TextReader( getIndexStub( window.editor.value ) )
  const workletReader = new HttpReader( '../src/compiledWorklet.js' ) 
  const mainReader = new HttpReader( '../src/main.js' ) 
  const utilReader = new HttpReader( '../src/utilities.js' ) 
  const nodeReader = new HttpReader( '../src/startWorklet.js' ) 

  const zipWriter = new ZipWriter( zipFileWriter )
  await zipWriter.add( 'out.wasm',        wasmReader )
  await zipWriter.add( 'main.js',         mainReader )
  await zipWriter.add( 'utilities.js',    utilReader )
  await zipWriter.add( 'startWorklet.js', nodeReader )
  await zipWriter.add( 'worklet.js',      workletReader )
  await zipWriter.add( 'index.html',      htmlReader )
  await zipWriter.close()

  const zipFileBlob = await zipFileWriter.getData()
  const link = document.createElement('a')
  link.href = URL.createObjectURL( zipFileBlob )
  link.download = name+'.zip'
  link.click()
}

const getIndexStub = function( program, title ) {
  const html = `<!doctype html>
<html lang='en'>

<head>
  <title>Worklet Demo</title>
  <style>* { background:black; color:white }</style>
</head>

<body>
  <p id="click">click me to start</p>
</body>

<script type='module'>
import { exports } from './main.js'
import startWorkletNode from './startWorklet.js'
import utilities from './utilities.js'

Object.assign( window, exports )

// turn into null operations
const play = ()=> {}
const download = play

const memory = new WebAssembly.Memory({ 
  initial:${memAmount}, maximum:${memAmount}, shared:true 
})

const { memf, memi } = utilities.setupMemory( memory.buffer )
utilities.createWavetables()

${program}

window.onclick = function() {
  fetch( './out.wasm' )
    .then( response => response.arrayBuffer() )
    .then( blob => startWorkletNode( blob, memory, false, false, './worklet.js' ) )
}

</script>
<html>`

  return html
}

export { download, getIndexStub }
