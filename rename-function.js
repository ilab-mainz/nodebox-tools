///// rename-functions.js /////

// rename a nodebox.live function

// @bitcraftlab 2017

var path = require('path');
var fs = require('fs');

// argument checking
var argv = process.argv.slice(2)
var argc = argv.length;

// first argument : input file
if(argc === 3) {
  var project = path.basename(argv[0], '.json');
  var oldName = argv[1];
  var newName = argv[2];
} else {
  // usage output
  console.log('Usage:  ' + path.basename(__filename) + ' INPUT.JSON OLD_NAME NEW_NAME')
  process.exit(-1);
}

// load json
var fin = path.resolve(argv[0]);
var json = require(fin);

// rename node starting with a function name
function renameNode(name, oldName, newName, logInfo) {
  if(name.startsWith(oldName)) {
    name = newName + name.substring(oldName.length);
    console.log(logInfo, oldName, newName);
  }
  return name;
}

// change function name in the definition
for(var i = 0; i < json.functions.length; i++) {
  if(json.functions[i].name === oldName) {
    json.functions[i].name = newName;
  }
}

// change function name in function calls
for(var i = 0; i < json.functions.length; i++) {

  var fn = json.functions[i];
  var type = fn.type;

  // update network functions
  if(type === 'network') {
    // get function

    var nodes = fn.nodes;
    var connections = fn.connections;

    // update node labels
    for(var j = 0; j < nodes.length; j++) {
      // check if the function matches the "projectname.oldname" pattern
      parts = nodes[j].fn.split('.');
      if(parts.length === 2 && parts[0] === project && parts[1] === oldName) {
        // rename the function
        nodes[j].fn = project + "." + newName;
        // rename the node if it starts with the old function name (leave it alone otherwise)
        nodes[j].name = renameNode(nodes[j].name, oldName, newName, "Rename node");
        // update connection labels
      }
    }

    // update connection labels
    for(var j = 0; j < connections.length; j++) {
      var con = connections[j];
      if(con.input) con.input = renameNode(connections[j].input, oldName, newName, "Rename input");
      if(con.output) con.output = renameNode(connections[j].output, oldName, newName, "Rename output");
    }

  }

  // update code functions
  if(type === 'code') {
     // substitute all occurences of "projectname.oldname" in the source code
     fn.source.replace(project + "." + oldName, project + "." + newName);
  }

}

// write to stdout
// var fout = process.stdout.fd;

// write back to input file
var fout = fs.openSync(fin, 'w');
fs.write(fout, JSON.stringify(json, null, 4));
