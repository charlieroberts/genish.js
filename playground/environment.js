var cm, cmconsole, exampleCode, AudioContext = AudioContext || webkitAudioContext,
isStereo = false, jsdsp, shouldUseJSDSP = false

window.onload = function() {
  const b = bitty.create({ 
    flashTime: 100,
    value:'loading...'
  })

  b.subscribe( 'run', eval )
  b.subscribe( 'keydown', e => {
    if( e.ctrlKey && e.key === '.' ) {
      utilities.clear( true )
    }
  })

  const select = document.querySelector( 'select' ),
      files = [
        'intro',
        'thereminish',  
        'oneDelayLine',
        'slicingAndDicing',
        'sequencing',
        'bitcrusher',
        'sync',
        'freeverb',
        'fmfeedback',
        'enveloping',
        'twopoleva',
        'fourpoleva',
        'karplus'
      ]
  
  let currentFile = 'intro'
  select.onchange = function( e ) {
    currentFile = files[ select.selectedIndex ] 
    loadexample( currentFile )
  }
  
  const loadexample = function( filename ) {
    const req = new XMLHttpRequest()
      req.open( 'GET', './examples/'+filename+ (shouldUseJSDSP ? '.dsp.js' : '.js'), true )
      req.onload = function() {
        b.value = req.responseText 
      }
  
    req.send()
  }
  
  loadexample( 'intro' )
}

window.bitty.rules = {
  keywords: /\b(new|if|else|do|while|switch|for|of|continue|break|return|typeof|function|var|const|let|\.length)(?=[^\w])/g,

  numbers: /\b(\d+)/g,

  strings: /(".*?"|'.*?'|\`(.|\n)*?\`)/g,
  comments: /(\/\/.*|\/\*(.|\n)*?\*\/)/g
}
