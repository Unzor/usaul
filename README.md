# usaul
Unzor's simple and useless language

# About
USaul is a programming language designed to test the limits of parsing expression grammar (PEG). It's a useless language that can only parse numbers, mathematical expressions with only two numbers, and only has one function: `log()`. It compiles to JavaScript and its "interpreter" (not really) just compiles the Usaul code to JavaScript and evaluates it.

Overall, it's an experimental and pretty useless language and should only be used if you want a more complicated version of math.

# Example
First, install the "usaul" NPM module for it to work.
To do this:
```
npm install -g usaul
```
Now you can run these examples.
## main.usl
```
x: 10 + 11;
log(x)
```
Run with:
```
usaul main.usl
```
Or compile with:
```
usaul main.usl --compile main.js
```
