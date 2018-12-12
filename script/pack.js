'use strict';

var path = require('path');
var fs = require('fs');
var archiver = require('archiver');

var output = fs.createWriteStream('./dist/deploy.zip');
var archive = archiver('zip');

output.on('close', function(){
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

output.on('error', function(err){
  throw err;
});

archive.pipe(output);
archive.directory(path.resolve(__dirname, '../dist/deploy'), '.');

archive.finalize();