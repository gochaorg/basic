var fs = require('fs');
const txt = fs.readFileSync( 'package.json','utf-8' );
const jsn = JSON.parse(txt);
console.log( jsn.version );