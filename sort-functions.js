///// sort-functions.js /////

// sort nodebox.live functions by name
// @bitcraftlab 2017

// var prettyjson = require('prettyjson');
var path = require('path');
var fs = require('fs');

// argument checking
var argv = process.argv.slice(2)
var argc = argv.length;

// first argument : input file
if(argc >= 1) {
  var fin = path.resolve(argv[0]);
} else {
  // usage output
  console.log('Usage:  ' + path.basename(__filename) + ' INPUT.JSON [OUTPUT.JSON]')
  process.exit(-1);
}

// load json
var json = require(fin);

// second argument : output file
if(argc === 2) {

  // write to file
  var fout = fs.openSync(argv[1], 'w');

} else {

  // write to stdout
  //var fout = process.stdout.fd

  // write back to the original file
  var fout = fs.openSync(argv[0], 'w');

}

// sort functions by name, pushing main functions to the top
json.functions = json.functions.sort(function(a, b) {
  var amain = a.name.startsWith('main');
  var bmain = b.name.startsWith('main');
  if(amain && !bmain) return -1;
  if(bmain && !amain) return +1;
  return a.name < b.name ? -1 : a.name > b.name ? +1 : 0;
});

/*
console.log("Sorted functions:");
for(var i = 0; i < json.functions.length; i++) {
  console.log(json.functions[i].name);
}
*/

// show result
//console.log(prettyjson.render(json));

// write to output
fs.write(fout, JSON.stringify(json, null, 4));
