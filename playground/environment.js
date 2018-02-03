var cm, cmconsole, exampleCode, AudioContext = AudioContext || webkitAudioContext,
isStereo = false, jsdsp, shouldUseJSDSP = false

window.onload = function() {
  cm = CodeMirror( document.querySelector('#editor'), {
    mode:   'javascript',
    value:  'loading...',
    keyMap: 'playground',
    autofocus: true,
    theme:'monokai',
    matchBrackets:true
  })

  cm.setSize( null, '100%' )

  cmconsole = CodeMirror( document.querySelector('#console'), {
    mode:'javascript',
    value:'// genish playground, v0.0.1: https://github.com/charlieroberts/genish.js',
    readOnly:'nocursor',
    theme:'monokai'
  })     

  cmconsole.setSize( null, '100%' )
  genish.export( window )


  let ctxInit = false
  window.onclick = ()=> { 
    if( ctxInit === false ) {
      utilities.createContext()
      ctxInit = true
    }
  }

  utilities.console = cmconsole
  utilities.editor  = cm

  window.play = function( v, name='test', debug ) { //, memType=Float32Array ) {
    if( dat !== undefined ) {
      dat.GUI.__all__.forEach( v => v.destroy() )
      dat.GUI.__all__.length = 0
    }
    var cb = utilities.playWorklet( v, name ) 

    return cb
  }

  Babel.registerPlugin( 'jsdsp', jsdsp )

  let select = document.querySelector( 'select' ),
      files = [
        'intro',
        'thereminish',
        'hardsync',
        'bitcrusher',
        'enveloping',
        'bandlimitedFM',
        'biquad',
        'zeroDelay',
        'zeroDelayLadder',
        'slicingAndDicing', 
        'oneDelayLine',
        'combfilter',
        'freeverb',
        'gigaverb',
        'gardenOfDelays', 
        'karplusStrong'
      ]
  
  let currentFile = 'intro'
  select.onchange = function( e ) {
    currentFile = files[ select.selectedIndex ] 
    loadexample( currentFile )
  }
  
  let loadexample = function( filename ) {
    var req = new XMLHttpRequest()
      req.open( 'GET', './examples/'+filename+ (shouldUseJSDSP ? '.dsp.js' : '.js'), true )
      req.onload = function() {
        var js = req.responseText
        utilities.editor.setValue( js )
      }
  
    req.send()
  }
  
  loadexample( 'intro' )

  let jsdspBtn = document.querySelector( '#jsdsp' ) 

  jsdspBtn.addEventListener( 'change', v => {
    shouldUseJSDSP = v.target.checked
    askForReload()
  })

  const askForReload = ()=> {
    let msg = 'You are switching to using ' + ( shouldUseJSDSP ? '.jsdsp' : '.js' ) + '; do you want to reload the current demo using the new format?'
    if( window.confirm( msg ) ) {
      loadexample( currentFile )
    }
  }
}

CodeMirror.keyMap.playground =  {
  fallthrough:'default',

  'Ctrl-Enter'( cm ) {
    try {
      var selectedCode = getSelectionCodeColumn( cm, false )

      flash( cm, selectedCode.selection )

      var code = shouldUseJSDSP ? Babel.transform(selectedCode.code, { presets: [], plugins:['jsdsp'] }).code : selectedCode.code

      var func = new Function( code )

      func()
    } catch (e) {
      console.log( e )
    }
  },
  'Alt-Enter'( cm ) {
    try {
      var selectedCode = getSelectionCodeColumn( cm, true )

      var code = shouldUseJSDSP ? Babel.transform(selectedCode.code, { presets: [], plugins:['jsdsp'] }).code : selectedCode.code

      var func = new Function( code )

      func()
    } catch (e) {
      console.log( e )
    }
  },
  'Ctrl-.'( cm ) {
    utilities.clear()
    if( dat !== undefined ) {
      dat.GUI.__all__.forEach( v => v.destroy() )
      dat.GUI.__all__.length = 0
    }
    cmconsole.setValue('// silencio.\n' )
  },
}

var getSelectionCodeColumn = function( cm, findBlock ) {
  var pos = cm.getCursor(), 
  text = null

  if( !findBlock ) {
    text = cm.getDoc().getSelection()

    if ( text === "") {
      text = cm.getLine( pos.line )
    }else{
      pos = { start: cm.getCursor('start'), end: cm.getCursor('end') }
      //pos = null
    }
  }else{
    var startline = pos.line, 
    endline = pos.line,
    pos1, pos2, sel

    while ( startline > 0 && cm.getLine( startline ) !== "" ) { startline-- }
    while ( endline < cm.lineCount() && cm.getLine( endline ) !== "" ) { endline++ }

    pos1 = { line: startline, ch: 0 }
    pos2 = { line: endline, ch: 0 }

    text = cm.getRange( pos1, pos2 )

    pos = { start: pos1, end: pos2 }
  }

  if( pos.start === undefined ) {
    var lineNumber = pos.line,
    start = 0,
    end = text.length

    pos = { start:{ line:lineNumber, ch:start }, end:{ line:lineNumber, ch: end } }
  }

  return { selection: pos, code: text }
}

var flash = function(cm, pos) {
  var sel,
  cb = function() { sel.clear() }

  if (pos !== null) {
    if( pos.start ) { // if called from a findBlock keymap
      sel = cm.markText( pos.start, pos.end, { className:"CodeMirror-highlight" } );
    }else{ // called with single line
      sel = cm.markText( { line: pos.line, ch:0 }, { line: pos.line, ch:null }, { className: "CodeMirror-highlight" } )
    }
  }else{ // called with selected block
    sel = cm.markText( cm.getCursor(true), cm.getCursor(false), { className: "CodeMirror-highlight" } );
  }

  window.setTimeout(cb, 250);
}
