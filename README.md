# genish.js
an experimental repo that might, someday, mimic gen~ in Max/MSP

## what?
A little more detail: genish.js will codegen per-sample callbacks with an API that mirrors gen~ closely. Given the following code:

```javascript
abs( add( mul(5,2), param() ) )
```

...genish will generate the following (approximate) function.

```javascript
function( abs, p0 ) {
  return abs( 10 + p0 )
}
```

It will then generate a secondary function that has the `abs` argument pre-filled, so all you need to pass in the is the one `param()` value, in this case identified by p0. Cooler examples (such as functions you would use inside a ScriptProcessor node) are coming soon.

## use
Doesn't do much at the moment, but you can import `dist/gen.lib.js` for use in the browser, or `require('./dist/index.js')` if you're using Node.

## develop
The build script is a gulpfile. With gulp installed, run `gulp` or `gulp watch` in the top level of the repo.

## test
Tests are done with Mocha. With Mocha installed, run `mocha test.js` in a terminal.
