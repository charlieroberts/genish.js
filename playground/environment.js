var cm, cmconsole, exampleCode, AudioContext = AudioContext || webkitAudioContext,
isStereo = false

window.onload = function() {
  cm = CodeMirror( document.querySelector('#editor'), {
    mode:   'javascript',
    value:  exampleCode,
    keyMap: 'playground',
    autofocus: true,
    theme:'monokai'
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

  utilities.createContext().createScriptProcessor()
  utilities.console = cmconsole

  window.play = utilities.playGraph
}


CodeMirror.keyMap.playground =  {
  fallthrough:'default',

  'Ctrl-Enter'( cm ) {
    try {
      var selectedCode = getSelectionCodeColumn( cm, false )

      flash( cm, selectedCode.selection )

      var func = new Function( selectedCode.code )

      func()
    } catch (e) {
      console.log( e )
    }
  },
  'Alt-Enter'( cm ) {
    try {
      var selectedCode = getSelectionCodeColumn( cm, true )

      flash( cm, selectedCode.selection )

      var func = new Function( selectedCode.code )
      func()
    } catch (e) {
      console.log( e )
    }
  },
  'Ctrl-.'( cm ) {
    utilities.clear()
    cmconsole.setValue('// silencio.\n' )
    console.log( 'silencio.' )
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
