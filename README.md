# genish.js
A library for performing single-sample audio callbacks in JavaScript. Inspired by gen~ in Max/MSP.

## try it out
https://gibber-cc.github.io/genish.js/playground/

Currently only runs in Chrome as I need to debug the loading in the wasm module.

## what?
Genish is a collection of commonly used, low-level audio building blocks. Example audio processors include phasors, read/write (peek/poke) to data, sample-and-hold, and single-sample feedback loops. Unlike the built-in web audio nodes, genish operates at a *per-sample* level, meaning you can create single-sample feedback loops that are necessary for many types of synthesis and effects.

This branch of genish consists of a small (~3KB) web assembly blob, and ~20 KB of JS wrapper code. The web asssembly is written by hand, eliminating the need for more complex wrappers like emscripten. The library models the [entity component systems](https://medium.com/ingeniouslysimple/entities-components-and-systems-89c31464240d) commonly found in game engines; this basically means that the JS is primarily responsible for memory layout / enabling user manipulation of memory and that's about it.

## why wasm?
Other versions of genish create custom javascript functions that are then typically compiled by the JIT compiler found in browsers. Advantages of using the JIT to compile our audio callbacks include:

1. In many cases, improved performance. By code-generating our audio callback, we can perform many optimizations, including avoiding indirect function calls.

Advantages of wasm include:

1. Ahead of time compliation means that functions run fasts immediately, without having to wait for the JIT to compile and optimize hot branches.
2. A much simpler codebase. About 20 KB of javascript (uncompressed) instead 450 KB.
3. The JIT stumbles on very large functions (think hundreds of sine oscillators). WASM has no such problems.
4. Altering the audio graph in the old version required a new code generation cycle, which in turn requires a new JIT cycle, which can lead to pops. Altering the audio graph in this version simply means adjusting some numbers in memory, and can easily be done dynamically at runtime.

This wasm branch is currently under active development and it remains to be seen if the benefits of wasm will outweigh any potential performance penalties. I am optimistic.
